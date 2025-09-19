from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required
from app.models import Agency, AgencyProfile, Profile, User
from app import db
from datetime import datetime

agencies_bp = Blueprint('agencies', __name__)

@agencies_bp.route('/', methods=['GET'])
def get_agencies():
    """Get all agencies"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        agencies = Agency.query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        result = []
        for agency in agencies.items:
            result.append({
                'id': agency.id,
                'name': agency.name,
                'license_number': agency.license_number,
                'verification_status': agency.verification_status,
                'subscription_tier': agency.subscription_tier,
                'rating': agency.rating,
                'services': agency.services,
                'location': agency.location,
                'monthly_fee': agency.monthly_fee,
                'commission_rate': agency.commission_rate,
                'verified_workers': agency.verified_workers,
                'successful_placements': agency.successful_placements,
                'description': agency.description,
                'contact_email': agency.contact_email,
                'contact_phone': agency.contact_phone,
                'website': agency.website,
                'created_at': agency.created_at.isoformat(),
                'updated_at': agency.updated_at.isoformat()
            })
        
        return jsonify({
            'agencies': result,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': agencies.total,
                'pages': agencies.pages,
                'has_next': agencies.has_next,
                'has_prev': agencies.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agencies_bp.route('/<agency_id>', methods=['GET'])
def get_agency(agency_id):
    """Get specific agency"""
    try:
        agency = Agency.query.get_or_404(agency_id)
        
        return jsonify({
            'id': agency.id,
            'name': agency.name,
            'license_number': agency.license_number,
            'verification_status': agency.verification_status,
            'subscription_tier': agency.subscription_tier,
            'rating': agency.rating,
            'services': agency.services,
            'location': agency.location,
            'monthly_fee': agency.monthly_fee,
            'commission_rate': agency.commission_rate,
            'verified_workers': agency.verified_workers,
            'successful_placements': agency.successful_placements,
            'description': agency.description,
            'contact_email': agency.contact_email,
            'contact_phone': agency.contact_phone,
            'website': agency.website,
            'created_at': agency.created_at.isoformat(),
            'updated_at': agency.updated_at.isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
