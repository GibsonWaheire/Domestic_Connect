from flask import Blueprint, request, jsonify
from app.firebase_init import db
from app import limiter
from datetime import datetime
import logging
import html

logger = logging.getLogger(__name__)
worker_inquiries_bp = Blueprint('worker_inquiries', __name__)

ALLOWED_CATEGORIES = {
    'Housegirl / House Manager',
    'Gardener',
    'Gateman / Security',
    'Nurse / Caregiver',
    'Daily Casual',
}

ALLOWED_LIVE_IN = {'live_in', 'live_out', 'flexible'}


@worker_inquiries_bp.route('/', methods=['POST'])
@limiter.limit('5 per hour')
def submit_worker_inquiry():
    """
    Public endpoint for domestic workers to register their details.
    Data is saved to Firestore 'worker_inquiries' collection — no public
    GET endpoint exists for this collection. Admin reads only.
    """
    try:
        data = request.get_json(silent=True) or {}

        full_name = html.escape(str(data.get('full_name', '')).strip())
        phone = html.escape(str(data.get('phone', '')).strip())
        county = html.escape(str(data.get('county', '')).strip())
        category = str(data.get('category', '')).strip()
        experience_years = str(data.get('experience_years', '0')).strip()
        live_in = str(data.get('live_in', 'flexible')).strip()
        notes = html.escape(str(data.get('notes', '')).strip())

        # Validate required fields
        if not full_name or len(full_name) < 2:
            return jsonify({'error': 'Full name is required.'}), 400
        if not phone or len(phone) < 9:
            return jsonify({'error': 'A valid phone number is required.'}), 400
        if not county:
            return jsonify({'error': 'County / location is required.'}), 400
        if category not in ALLOWED_CATEGORIES:
            return jsonify({'error': 'Please select a valid worker category.'}), 400
        if live_in not in ALLOWED_LIVE_IN:
            live_in = 'flexible'

        doc = {
            'full_name': full_name,
            'phone': phone,
            'county': county,
            'category': category,
            'experience_years': experience_years,
            'live_in': live_in,
            'notes': notes[:500],  # cap free-text
            'status': 'pending_interview',
            'submitted_at': datetime.utcnow().isoformat(),
            'ip': request.remote_addr,
        }

        db.collection('worker_inquiries').add(doc)
        logger.info('Worker inquiry submitted: %s (%s)', full_name, category)

        return jsonify({
            'message': 'Your details have been received. We will contact you within 2 business days.'
        }), 201

    except Exception as e:
        logger.error('worker_inquiry error: %s', e)
        return jsonify({'error': 'Internal server error. Please try again.'}), 500
