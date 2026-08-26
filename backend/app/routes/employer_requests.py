from flask import Blueprint, request, jsonify
from app.firebase_init import db
from app import limiter
from app.services.auth_service import verify_firebase_token
from datetime import datetime
import logging
import html

logger = logging.getLogger(__name__)
employer_requests_bp = Blueprint('employer_requests', __name__)

ALLOWED_CATEGORIES = {
    'Housegirl / House Manager',
    'Gardener',
    'Gateman / Security',
    'Nurse / Caregiver',
    'Daily Casual',
}

ALLOWED_LIVE_IN = {'live_in', 'live_out', 'flexible'}


def _get_authed_user(req):
    """Returns (uid, user_doc_dict) or raises ValueError with an error message."""
    auth_header = req.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        raise ValueError('Authentication required')
    token = auth_header[7:]
    decoded = verify_firebase_token(token)
    if not decoded:
        raise ValueError('Invalid or expired token')
    uid = decoded['uid']
    user_doc = db.collection('users').document(uid).get()
    if not user_doc.exists:
        raise ValueError('User not found')
    user_data = user_doc.to_dict()
    if user_data.get('user_type') not in ('employer', 'admin') and not user_data.get('is_admin'):
        raise ValueError('Employer account required')
    return uid, user_data


@employer_requests_bp.route('/', methods=['POST'])
@limiter.limit('10 per hour')
def submit_employer_request():
    """
    Auth-required. Employer submits a staffing request after payment.
    Saved to Firestore 'employer_requests' collection.
    """
    try:
        uid, _ = _get_authed_user(request)
    except ValueError as e:
        return jsonify({'error': str(e)}), 403

    try:
        data = request.get_json(silent=True) or {}

        category = str(data.get('category', '')).strip()
        location = html.escape(str(data.get('location', '')).strip())
        live_in = str(data.get('live_in', 'flexible')).strip()
        start_date = html.escape(str(data.get('start_date', '')).strip())
        salary_budget = str(data.get('salary_budget', '')).strip()
        duties = html.escape(str(data.get('duties', '')).strip())
        contact_phone = html.escape(str(data.get('contact_phone', '')).strip())

        if category not in ALLOWED_CATEGORIES:
            return jsonify({'error': 'Please select a valid worker category.'}), 400
        if not location:
            return jsonify({'error': 'Location is required.'}), 400
        if live_in not in ALLOWED_LIVE_IN:
            live_in = 'flexible'

        doc = {
            'employer_uid': uid,
            'category': category,
            'location': location,
            'live_in': live_in,
            'start_date': start_date,
            'salary_budget': salary_budget[:50],
            'duties': duties[:1000],
            'contact_phone': contact_phone,
            'status': 'in_progress',
            'submitted_at': datetime.utcnow().isoformat(),
        }

        ref = db.collection('employer_requests').add(doc)
        doc_id = ref[1].id
        logger.info('Employer request submitted: uid=%s category=%s', uid, category)

        return jsonify({'message': 'Your request has been received. We will match you within 24–48 hours.', 'id': doc_id}), 201

    except Exception as e:
        logger.error('employer_request POST error: %s', e)
        return jsonify({'error': 'Internal server error. Please try again.'}), 500


@employer_requests_bp.route('/mine', methods=['GET'])
def get_my_employer_requests():
    """
    Auth-required. Returns this employer's submitted staffing requests.
    """
    try:
        uid, _ = _get_authed_user(request)
    except ValueError as e:
        return jsonify({'error': str(e)}), 403

    try:
        docs = db.collection('employer_requests').where('employer_uid', '==', uid).stream()
        results = []
        for doc in docs:
            d = doc.to_dict()
            d['id'] = doc.id
            results.append(d)

        # Sort newest first
        results.sort(key=lambda x: x.get('submitted_at', ''), reverse=True)

        return jsonify({'requests': results}), 200

    except Exception as e:
        logger.error('employer_request GET /mine error: %s', e)
        return jsonify({'error': 'Internal server error.'}), 500
