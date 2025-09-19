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

@agencies_bp.route('/', methods=['POST'])
def create_agency():
    """Create new agency"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'license_number', 'contact_email', 'contact_phone']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create agency
        agency = Agency(
            name=data['name'],
            license_number=data['license_number'],
            verification_status=data.get('verification_status', 'pending'),
            subscription_tier=data.get('subscription_tier', 'basic'),
            rating=data.get('rating', 0.0),
            services=data.get('services', []),
            location=data.get('location', ''),
            monthly_fee=data.get('monthly_fee', 0),
            commission_rate=data.get('commission_rate', 0.0),
            verified_workers=data.get('verified_workers', 0),
            successful_placements=data.get('successful_placements', 0),
            description=data.get('description', ''),
            contact_email=data['contact_email'],
            contact_phone=data['contact_phone'],
            website=data.get('website', '')
        )
        
        db.session.add(agency)
        db.session.commit()
        
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
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@agencies_bp.route('/<agency_id>', methods=['PUT'])
def update_agency(agency_id):
    """Update agency"""
    try:
        agency = Agency.query.get_or_404(agency_id)
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            agency.name = data['name']
        if 'license_number' in data:
            agency.license_number = data['license_number']
        if 'verification_status' in data:
            agency.verification_status = data['verification_status']
        if 'subscription_tier' in data:
            agency.subscription_tier = data['subscription_tier']
        if 'rating' in data:
            agency.rating = data['rating']
        if 'services' in data:
            agency.services = data['services']
        if 'location' in data:
            agency.location = data['location']
        if 'monthly_fee' in data:
            agency.monthly_fee = data['monthly_fee']
        if 'commission_rate' in data:
            agency.commission_rate = data['commission_rate']
        if 'verified_workers' in data:
            agency.verified_workers = data['verified_workers']
        if 'successful_placements' in data:
            agency.successful_placements = data['successful_placements']
        if 'description' in data:
            agency.description = data['description']
        if 'contact_email' in data:
            agency.contact_email = data['contact_email']
        if 'contact_phone' in data:
            agency.contact_phone = data['contact_phone']
        if 'website' in data:
            agency.website = data['website']
        
        agency.updated_at = datetime.utcnow()
        db.session.commit()
        
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
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@agencies_bp.route('/<agency_id>', methods=['DELETE'])
def delete_agency(agency_id):
    """Delete agency"""
    try:
        agency = Agency.query.get_or_404(agency_id)
        db.session.delete(agency)
        db.session.commit()
        
        return jsonify({'message': 'Agency deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
