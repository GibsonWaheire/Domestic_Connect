from flask import Blueprint, request, jsonify
from app.firebase_init import db
from app import limiter
from app.services.auth_service import verify_firebase_token
from app.routes.payments import get_pesapal_token, submit_pesapal_order, get_pesapal_transaction_status
from datetime import datetime
import uuid
import html
import logging

logger = logging.getLogger(__name__)
workers_bp = Blueprint('workers', __name__)

WORKER_ADMIN_REG_PACKAGE_ID = 'worker_admin_registration'
WORKER_ADMIN_REG_PRICE = 300

ALLOWED_CATEGORIES = {
    'Housegirl / House Manager',
    'Gardener',
    'Gateman / Security',
    'Nurse / Caregiver',
    'Daily Casual',
}


def _require_employer(req):
    auth = req.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        raise ValueError('Authentication required')
    decoded = verify_firebase_token(auth[7:])
    if not decoded:
        raise ValueError('Invalid token')
    uid = decoded['uid']
    user_doc = db.collection('users').document(uid).get()
    if not user_doc.exists:
        raise ValueError('User not found')
    data = user_doc.to_dict()
    if data.get('user_type') not in ('employer', 'admin') and not data.get('is_admin'):
        raise ValueError('Employer access required')
    return uid


def _require_worker(req):
    auth = req.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        raise ValueError('Authentication required')
    decoded = verify_firebase_token(auth[7:])
    if not decoded:
        raise ValueError('Invalid token')
    uid = decoded['uid']
    user_doc = db.collection('users').document(uid).get()
    if not user_doc.exists:
        raise ValueError('User not found')
    data = user_doc.to_dict()
    if data.get('user_type') not in ('housegirl', 'admin') and not data.get('is_admin'):
        raise ValueError('Worker account required')
    return uid, data


# ─── Public: Worker Registration Payment ─────────────────────────────────────

@workers_bp.route('/initiate-registration', methods=['POST'])
@limiter.limit('5 per hour')
def initiate_worker_registration():
    """
    Public — no auth required.
    Creates a Pesapal KES 300 payment for admin-assisted worker registration.
    """
    try:
        data = request.get_json(silent=True) or {}
        worker_name = html.escape(str(data.get('worker_name', 'Worker')).strip()[:100])
        worker_category = str(data.get('worker_category', '')).strip()
        worker_phone = html.escape(str(data.get('worker_phone', '')).strip()[:20])

        if worker_category not in ALLOWED_CATEGORIES:
            worker_category = 'Domestic Worker'

        purchase_id = str(uuid.uuid4())

        token = get_pesapal_token()
        pesapal_response = submit_pesapal_order(
            token=token,
            amount=WORKER_ADMIN_REG_PRICE,
            purchase_id=purchase_id,
            description=f'Worker Registration — {worker_category}',
            billing_email='worker@domesticconnect.co.ke',
            billing_first_name=worker_name,
        )

        order_tracking_id = pesapal_response.get('order_tracking_id')
        redirect_url = pesapal_response.get('redirect_url')

        if not order_tracking_id or not redirect_url:
            logger.error('Pesapal worker reg failed: %s', pesapal_response)
            return jsonify({'error': 'Failed to create payment. Please try again.'}), 502

        # Store in user_purchases (placeholder user_id) so IPN can find it
        db.collection('user_purchases').document(purchase_id).set({
            'id': purchase_id,
            'user_id': '_worker_reg',
            'package_id': WORKER_ADMIN_REG_PACKAGE_ID,
            'worker_name': worker_name,
            'worker_category': worker_category,
            'worker_phone': worker_phone,
            'amount': WORKER_ADMIN_REG_PRICE,
            'status': 'pending',
            'order_tracking_id': order_tracking_id,
            'merchant_reference': purchase_id,
            'purchase_date': datetime.utcnow().isoformat(),
        })

        return jsonify({
            'redirect_url': redirect_url,
            'order_tracking_id': order_tracking_id,
            'purchase_id': purchase_id,
        }), 200

    except Exception as e:
        logger.error('initiate_worker_registration error: %s', e)
        return jsonify({'error': 'Internal server error. Please try again.'}), 500


@workers_bp.route('/payment-status/<order_tracking_id>', methods=['GET'])
def worker_payment_status(order_tracking_id):
    """
    Public — no auth required.
    Only returns status for worker_admin_registration purchases.
    """
    try:
        purchases = list(
            db.collection('user_purchases')
            .where('order_tracking_id', '==', order_tracking_id)
            .where('package_id', '==', WORKER_ADMIN_REG_PACKAGE_ID)
            .limit(1)
            .stream()
        )

        if not purchases:
            return jsonify({'error': 'Payment record not found'}), 404

        purchase_doc = purchases[0]
        purchase_data = purchase_doc.to_dict()
        current_status = purchase_data.get('status', 'pending')

        if current_status == 'pending':
            try:
                token = get_pesapal_token()
                status_data = get_pesapal_transaction_status(token, order_tracking_id)
                desc = status_data.get('payment_status_description', '').upper()
                if desc == 'COMPLETED':
                    # Save to worker_inquiries for admin follow-up
                    db.collection('worker_inquiries').add({
                        'full_name': purchase_data.get('worker_name', ''),
                        'phone': purchase_data.get('worker_phone', ''),
                        'category': purchase_data.get('worker_category', ''),
                        'status': 'paid_pending_admin',
                        'payment_id': purchase_doc.id,
                        'submitted_at': datetime.utcnow().isoformat(),
                    })
                    db.collection('user_purchases').document(purchase_doc.id).update({
                        'status': 'completed',
                        'completed_at': datetime.utcnow().isoformat(),
                    })
                    current_status = 'completed'
                elif desc in ('FAILED', 'INVALID'):
                    db.collection('user_purchases').document(purchase_doc.id).update({'status': 'failed'})
                    current_status = 'failed'
            except Exception as e:
                logger.warning('worker_payment_status Pesapal poll error: %s', e)

        return jsonify({
            'status': current_status,
            'package_id': WORKER_ADMIN_REG_PACKAGE_ID,
            'worker_category': purchase_data.get('worker_category', ''),
            'worker_name': purchase_data.get('worker_name', ''),
        }), 200

    except Exception as e:
        logger.error('worker_payment_status error: %s', e)
        return jsonify({'error': 'Internal server error'}), 500


# ─── Employer: Browse Workers ─────────────────────────────────────────────────

@workers_bp.route('/', methods=['GET'])
def list_workers():
    """Employer auth required. Returns available workers — no contact details."""
    try:
        _require_employer(request)
    except ValueError as e:
        return jsonify({'error': str(e)}), 403

    try:
        category_filter = request.args.get('category', '')
        county_filter = request.args.get('county', '')
        live_in_filter = request.args.get('live_in', '')

        docs = db.collection('housegirl_profiles').where('is_available', '==', True).stream()
        workers = []

        for doc in docs:
            d = doc.to_dict()
            if category_filter and d.get('category') != category_filter:
                continue
            if county_filter and d.get('location') != county_filter:
                continue
            if live_in_filter and d.get('accommodation_type') != live_in_filter:
                continue

            first = str(d.get('first_name', '') or '').strip()
            last = str(d.get('last_name', '') or '').strip()
            last_initial = (last[0].upper() + '.') if last else ''

            workers.append({
                'id': doc.id,
                'display_name': f"{first} {last_initial}".strip() or 'Worker',
                'category': d.get('category', ''),
                'county': d.get('location', ''),
                'experience': d.get('experience', ''),
                'live_in': d.get('accommodation_type', ''),
                'bio': str(d.get('bio', '') or '')[:200],
                'profile_photo_url': d.get('profile_photo_url', ''),
                'verification_status': d.get('verification_status', 'pending_review'),
            })

        return jsonify({'workers': workers, 'total': len(workers)}), 200

    except Exception as e:
        logger.error('list_workers error: %s', e)
        return jsonify({'error': 'Internal server error'}), 500


# ─── Worker: Complete Profile ─────────────────────────────────────────────────

@workers_bp.route('/complete-profile', methods=['POST'])
@limiter.limit('20 per hour')
def complete_worker_profile():
    """Worker auth required. Saves full profile to Firestore."""
    try:
        uid, user_data = _require_worker(request)
    except ValueError as e:
        return jsonify({'error': str(e)}), 403

    try:
        data = request.get_json(silent=True) or {}

        category = str(data.get('category', '')).strip()
        county = html.escape(str(data.get('county', '')).strip())
        live_in = str(data.get('live_in', 'flexible')).strip()
        phone = html.escape(str(data.get('phone', '')).strip())
        experience_years = str(data.get('experience_years', '0')).strip()
        bio = html.escape(str(data.get('bio', '')).strip())
        prev_employer_name = html.escape(str(data.get('prev_employer_name', '')).strip())
        prev_employer_phone = html.escape(str(data.get('prev_employer_phone', '')).strip())
        has_no_referee = bool(data.get('has_no_referee', False))
        profile_photo_url = html.escape(str(data.get('profile_photo_url', '')).strip())
        cv_url = html.escape(str(data.get('cv_url', '')).strip())

        if category not in ALLOWED_CATEGORIES:
            return jsonify({'error': 'Please select a valid worker category.'}), 400
        if not county:
            return jsonify({'error': 'County / location is required.'}), 400
        if not phone or len(phone) < 9:
            return jsonify({'error': 'A valid phone number is required.'}), 400
        if not has_no_referee and not prev_employer_name:
            return jsonify({'error': 'Please provide a previous employer reference, or indicate you have none.'}), 400

        profile = {
            'user_id': uid,
            'first_name': user_data.get('first_name', ''),
            'last_name': user_data.get('last_name', ''),
            'category': category,
            'location': county,
            'accommodation_type': live_in,
            'phone_number': phone,
            'experience': experience_years,
            'bio': bio[:1000],
            'prev_employer_name': prev_employer_name,
            'prev_employer_phone': prev_employer_phone,
            'has_no_referee': has_no_referee,
            'profile_photo_url': profile_photo_url,
            'cv_url': cv_url,
            'verification_status': 'pending_review',
            'is_available': False,
            'updated_at': datetime.utcnow().isoformat(),
        }

        existing = list(db.collection('housegirl_profiles').where('user_id', '==', uid).limit(1).stream())
        if existing:
            db.collection('housegirl_profiles').document(existing[0].id).set(profile, merge=True)
        else:
            profile['created_at'] = datetime.utcnow().isoformat()
            db.collection('housegirl_profiles').add(profile)

        db.collection('users').document(uid).set({
            'phone_number': phone,
            'category': category,
            'profile_complete': True,
            'updated_at': datetime.utcnow().isoformat(),
        }, merge=True)

        logger.info('Worker profile completed: uid=%s category=%s', uid, category)
        return jsonify({
            'message': 'Profile submitted. We will review and contact you within 2 business days.',
        }), 200

    except Exception as e:
        logger.error('complete_worker_profile error: %s', e)
        return jsonify({'error': 'Internal server error. Please try again.'}), 500
