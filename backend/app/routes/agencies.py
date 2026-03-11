from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required
from app.firebase_init import db
from datetime import datetime
import uuid
import logging


logger = logging.getLogger(__name__)
agencies_bp = Blueprint('agencies', __name__)

@agencies_bp.route('/health', methods=['GET'])
def agencies_health():
    """Health check for agencies endpoint"""
    try:
        # Test Firestore connection
        docs = list(db.collection('agencies').limit(1).stream())
        agency_count = len(list(db.collection('agencies').stream()))
        
        return jsonify({
            'status': 'healthy',
            'message': 'Agencies endpoint and Firestore are working',
            'agency_count': agency_count,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'status': 'unhealthy',
            'message': f'Agencies endpoint error: {str(e)}',
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@agencies_bp.route('/', methods=['GET'])
def get_agencies():
    """Get all agencies"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        # Paginate results manually for Firestore
        docs = list(db.collection('agencies').stream())
        all_agencies = [doc.to_dict() for doc in docs]
        
        total = len(all_agencies)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated = all_agencies[start_idx:end_idx]
        
        result = []
        for agency in paginated:
            result.append({
                'id': agency.get('id'),
                'name': agency.get('name'),
                'license_number': agency.get('license_number'),
                'verification_status': agency.get('verification_status'),
                'subscription_tier': agency.get('subscription_tier'),
                'rating': agency.get('rating'),
                'services': agency.get('services', []),
                'location': agency.get('location'),
                'monthly_fee': agency.get('monthly_fee'),
                'commission_rate': agency.get('commission_rate'),
                'verified_workers': agency.get('verified_workers'),
                'successful_placements': agency.get('successful_placements'),
                'description': agency.get('description'),
                'contact_email': agency.get('contact_email'),
                'contact_phone': agency.get('contact_phone'),
                'website': agency.get('website'),
                'created_at': agency.get('created_at'),
                'updated_at': agency.get('updated_at')
            })
        
        return jsonify({
            'agencies': result,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page if per_page else 0,
                'has_next': end_idx < total,
                'has_prev': page > 1
            }
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Failed to fetch agencies',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@agencies_bp.route('/<agency_id>', methods=['GET'])
def get_agency(agency_id):
    """Get specific agency"""
    try:
        agency_doc = db.collection('agencies').document(agency_id).get()
        if not agency_doc.exists:
            return jsonify({'error': 'Agency not found'}), 404
            
        agency = agency_doc.to_dict()
        
        return jsonify({
            'id': agency.get('id'),
            'name': agency.get('name'),
            'license_number': agency.get('license_number'),
            'verification_status': agency.get('verification_status'),
            'subscription_tier': agency.get('subscription_tier'),
            'rating': agency.get('rating'),
            'services': agency.get('services', []),
            'location': agency.get('location'),
            'monthly_fee': agency.get('monthly_fee'),
            'commission_rate': agency.get('commission_rate'),
            'verified_workers': agency.get('verified_workers'),
            'successful_placements': agency.get('successful_placements'),
            'description': agency.get('description'),
            'contact_email': agency.get('contact_email'),
            'contact_phone': agency.get('contact_phone'),
            'website': agency.get('website'),
            'created_at': agency.get('created_at'),
            'updated_at': agency.get('updated_at')
        }), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@agencies_bp.route('/', methods=['POST'])
@firebase_auth_required
def create_agency():
    """Create new agency"""
    try:
        user = request.current_user
        if not getattr(user, 'is_admin', False):
            return jsonify({'error': 'Unauthorized, admin only'}), 403
            
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'license_number', 'contact_email', 'contact_phone']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create agency
        agency_id = str(uuid.uuid4())
        agency_data = {
            'id': agency_id,
            'name': data['name'],
            'license_number': data['license_number'],
            'verification_status': data.get('verification_status', 'pending'),
            'subscription_tier': data.get('subscription_tier', 'basic'),
            'rating': data.get('rating', 0.0),
            'services': data.get('services', []),
            'location': data.get('location', ''),
            'monthly_fee': data.get('monthly_fee', 0),
            'commission_rate': data.get('commission_rate', 0.0),
            'verified_workers': data.get('verified_workers', 0),
            'successful_placements': data.get('successful_placements', 0),
            'description': data.get('description', ''),
            'contact_email': data['contact_email'],
            'contact_phone': data['contact_phone'],
            'website': data.get('website', ''),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        db.collection('agencies').document(agency_id).set(agency_data)
        
        return jsonify(agency_data), 201
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@agencies_bp.route('/<agency_id>', methods=['PUT'])
@firebase_auth_required
def update_agency(agency_id):
    """Update agency"""
    try:
        user = request.current_user
        if not getattr(user, 'is_admin', False):
            return jsonify({'error': 'Unauthorized, admin only'}), 403
            
        agency_doc_ref = db.collection('agencies').document(agency_id)
        agency_doc = agency_doc_ref.get()
        if not agency_doc.exists:
            return jsonify({'error': 'Agency not found'}), 404
            
        data = request.get_json()
        updates = {}
        
        fields = ['name', 'license_number', 'verification_status', 'subscription_tier', 
                  'rating', 'services', 'location', 'monthly_fee', 'commission_rate', 
                  'verified_workers', 'successful_placements', 'description', 
                  'contact_email', 'contact_phone', 'website']
                  
        for field in fields:
            if field in data:
                updates[field] = data[field]
        
        if updates:
            updates['updated_at'] = datetime.utcnow().isoformat()
            agency_doc_ref.update(updates)
        
        updated_doc = agency_doc_ref.get()
        return jsonify(updated_doc.to_dict()), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@agencies_bp.route('/<agency_id>', methods=['DELETE'])
@firebase_auth_required
def delete_agency(agency_id):
    """Delete agency"""
    try:
        user = request.current_user
        if not getattr(user, 'is_admin', False):
            return jsonify({'error': 'Unauthorized, admin only'}), 403
            
        agency_doc_ref = db.collection('agencies').document(agency_id)
        if not agency_doc_ref.get().exists:
            return jsonify({'error': 'Agency not found'}), 404
            
        agency_doc_ref.delete()
        
        return jsonify({'message': 'Agency deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500
