from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required
from app.firebase_init import db
import logging
from datetime import datetime
import uuid
import re

logger = logging.getLogger(__name__)
messages_bp = Blueprint('messages', __name__)

# ---------------------------------------------------------------------------
# Contact-info detection — runs server-side so it cannot be bypassed
# ---------------------------------------------------------------------------
_CONTACT_PATTERNS = [
    # Kenyan phone numbers (various formats with optional separators)
    re.compile(r'\b(?:\+?254|0)[17]\d[\s\-.]?\d{3}[\s\-.]?\d{3}[\s\-.]?\d{3}\b', re.IGNORECASE),
    # Generic 10-digit phone (with optional separators)
    re.compile(r'\b\d[\s\-.]?\d[\s\-.]?\d[\s\-.]?\d[\s\-.]?\d[\s\-.]?\d[\s\-.]?\d[\s\-.]?\d[\s\-.]?\d[\s\-.]?\d\b', re.IGNORECASE),
    # Email addresses
    re.compile(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', re.IGNORECASE),
    # Messaging-app keywords
    re.compile(r'\b(?:whatsapp|telegram|signal|viber|wa\.me|t\.me)\b', re.IGNORECASE),
    # Social handles
    re.compile(r'@[a-zA-Z0-9_]{2,}'),
    # Explicit contact-sharing phrases
    re.compile(
        r'\b(?:call me|my number|my phone|reach me|contact me|email me|phone me|'
        r'ring me|text me|inbox me|dm me|slide into|hit me up|my whatsapp|'
        r'find me on|add me on)\b',
        re.IGNORECASE,
    ),
    # Spelled-out digit sequences (5+ consecutive number words = likely a phone number)
    re.compile(
        r'\b(?:zero|one|two|three|four|five|six|seven|eight|nine|oh)'
        r'(?:\s+(?:zero|one|two|three|four|five|six|seven|eight|nine|oh)){4,}\b',
        re.IGNORECASE,
    ),
]


def _contains_contact_info(text: str) -> bool:
    for pattern in _CONTACT_PATTERNS:
        if pattern.search(text):
            return True
    return False


# ---------------------------------------------------------------------------
# Helper: verify the sender has paid access for this job+housegirl pair
# ---------------------------------------------------------------------------
def _has_contact_access(employer_id: str, housegirl_id: str, job_id: str) -> bool:
    docs = list(
        db.collection('contact_access')
        .where('employer_id', '==', employer_id)
        .where('housegirl_id', '==', housegirl_id)
        .where('job_id', '==', job_id)
        .limit(1)
        .stream()
    )
    return len(docs) > 0


# ---------------------------------------------------------------------------
# POST /api/messages/send
# ---------------------------------------------------------------------------
@messages_bp.route('/send', methods=['POST'])
@firebase_auth_required
def send_message():
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.get_json(silent=True) or {}
        receiver_id = data.get('receiver_id', '').strip()
        job_id = data.get('job_id', '').strip()
        content = data.get('content', '').strip()

        if not receiver_id or not job_id or not content:
            return jsonify({'error': 'receiver_id, job_id, and content are required'}), 400

        if len(content) > 2000:
            return jsonify({'error': 'Message too long (max 2000 characters)'}), 400

        sender_id = getattr(user, 'id')
        sender_type = getattr(user, 'user_type', '')

        # Enforce that a conversation only exists after payment
        if sender_type == 'employer':
            employer_id = sender_id
            housegirl_id = receiver_id
        elif sender_type == 'housegirl':
            housegirl_id = sender_id
            employer_id = receiver_id
        else:
            return jsonify({'error': 'Only employers and housegirls can send messages'}), 403

        if not _has_contact_access(employer_id, housegirl_id, job_id):
            return jsonify({
                'error': 'Contact not unlocked. The employer must pay KSh 100 to unlock messaging for this applicant.'
            }), 403

        # Block any attempt to share contact information
        if _contains_contact_info(content):
            return jsonify({
                'error': 'Your message was blocked because it appears to contain contact information '
                         '(phone numbers, email addresses, or messaging app details). '
                         'Contact sharing is not permitted through the platform.'
            }), 422

        msg_id = str(uuid.uuid4())
        msg_data = {
            'id': msg_id,
            'sender_id': sender_id,
            'receiver_id': receiver_id,
            'employer_id': employer_id,
            'housegirl_id': housegirl_id,
            'job_id': job_id,
            'content': content,
            'timestamp': datetime.utcnow().isoformat(),
            'is_read': False,
        }
        db.collection('messages').document(msg_id).set(msg_data)

        return jsonify({'message': msg_data}), 201

    except Exception as e:
        logger.error(f'send_message error: {e}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500


# ---------------------------------------------------------------------------
# GET /api/messages/thread/<other_user_id>/<job_id>
# ---------------------------------------------------------------------------
@messages_bp.route('/thread/<other_user_id>/<job_id>', methods=['GET'])
@firebase_auth_required
def get_thread(other_user_id, job_id):
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401

        my_id = getattr(user, 'id')
        sender_type = getattr(user, 'user_type', '')

        if sender_type == 'employer':
            employer_id, housegirl_id = my_id, other_user_id
        elif sender_type == 'housegirl':
            housegirl_id, employer_id = my_id, other_user_id
        else:
            return jsonify({'error': 'Forbidden'}), 403

        if not _has_contact_access(employer_id, housegirl_id, job_id):
            return jsonify({'error': 'Contact not unlocked'}), 403

        # Fetch messages in both directions for this job
        sent = list(
            db.collection('messages')
            .where('sender_id', '==', my_id)
            .where('receiver_id', '==', other_user_id)
            .where('job_id', '==', job_id)
            .stream()
        )
        received = list(
            db.collection('messages')
            .where('sender_id', '==', other_user_id)
            .where('receiver_id', '==', my_id)
            .where('job_id', '==', job_id)
            .stream()
        )

        all_msgs = [d.to_dict() for d in sent + received]
        all_msgs.sort(key=lambda m: m.get('timestamp', ''))

        # Mark received messages as read
        for d in received:
            msg = d.to_dict()
            if not msg.get('is_read'):
                db.collection('messages').document(d.id).update({'is_read': True})

        return jsonify({'messages': all_msgs}), 200

    except Exception as e:
        logger.error(f'get_thread error: {e}')
        return jsonify({'error': 'Something went wrong.'}), 500


# ---------------------------------------------------------------------------
# GET /api/messages/threads
# Returns one summary entry per (job_id, other_user_id) pair
# ---------------------------------------------------------------------------
@messages_bp.route('/threads', methods=['GET'])
@firebase_auth_required
def get_threads():
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401

        my_id = getattr(user, 'id')

        sent = list(db.collection('messages').where('sender_id', '==', my_id).stream())
        received = list(db.collection('messages').where('receiver_id', '==', my_id).stream())

        # Group by (other_user_id, job_id)
        threads: dict[tuple, dict] = {}
        for d in sent + received:
            msg = d.to_dict()
            other = msg['receiver_id'] if msg['sender_id'] == my_id else msg['sender_id']
            key = (other, msg.get('job_id', ''))
            existing = threads.get(key)
            if not existing or msg.get('timestamp', '') > existing.get('last_timestamp', ''):
                threads[key] = {
                    'other_user_id': other,
                    'job_id': msg.get('job_id'),
                    'last_message': msg.get('content', ''),
                    'last_timestamp': msg.get('timestamp', ''),
                    'unread_count': 0,
                }

        # Count unread
        for d in received:
            msg = d.to_dict()
            if not msg.get('is_read'):
                other = msg['sender_id']
                key = (other, msg.get('job_id', ''))
                if key in threads:
                    threads[key]['unread_count'] += 1

        return jsonify({'threads': list(threads.values())}), 200

    except Exception as e:
        logger.error(f'get_threads error: {e}')
        return jsonify({'error': 'Something went wrong.'}), 500
