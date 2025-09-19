from flask import Blueprint, request, jsonify
from app.services.auth_service import login_required, get_current_user
from app.models import EmployerProfile, Profile, User
from app import db
from datetime import datetime

employers_bp = Blueprint('employers', __name__)

@employers_bp.route('/', methods=['GET'])
def get_employers():
    """Get all employer profiles"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        employers = EmployerProfile.query.join(Profile).join(User).filter(User.user_type == 'employer').paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        result = []
        for employer in employers.items:
            result.append({
                'id': employer.id,
                'profile_id': employer.profile_id,
                'company_name': employer.company_name,
                'location': employer.location,
                'description': employer.description,
                'first_name': employer.profile.user.first_name,
                'last_name': employer.profile.user.last_name,
                'email': employer.profile.user.email,
                'phone_number': employer.profile.user.phone_number,
                'created_at': employer.created_at.isoformat(),
                'updated_at': employer.updated_at.isoformat()
            })
        
        return jsonify({
            'employers': result,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': employers.total,
                'pages': employers.pages,
                'has_next': employers.has_next,
                'has_prev': employers.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@employers_bp.route('/<employer_id>', methods=['GET'])
def get_employer(employer_id):
    """Get specific employer profile"""
    try:
        employer = EmployerProfile.query.get_or_404(employer_id)
        
        return jsonify({
            'id': employer.id,
            'profile_id': employer.profile_id,
            'company_name': employer.company_name,
            'location': employer.location,
            'description': employer.description,
            'first_name': employer.profile.user.first_name,
            'last_name': employer.profile.user.last_name,
            'email': employer.profile.user.email,
            'phone_number': employer.profile.user.phone_number,
            'created_at': employer.created_at.isoformat(),
            'updated_at': employer.updated_at.isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@employers_bp.route('/', methods=['POST'])
def create_employer():
    """Create new employer profile"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['profile_id', 'company_name', 'location']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create employer profile
        employer = EmployerProfile(
            profile_id=data['profile_id'],
            company_name=data['company_name'],
            location=data['location'],
            description=data.get('description', '')
        )
        
        db.session.add(employer)
        db.session.commit()
        
        return jsonify({
            'id': employer.id,
            'profile_id': employer.profile_id,
            'company_name': employer.company_name,
            'location': employer.location,
            'description': employer.description,
            'created_at': employer.created_at.isoformat(),
            'updated_at': employer.updated_at.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@employers_bp.route('/<employer_id>', methods=['PUT'])
def update_employer(employer_id):
    """Update employer profile"""
    try:
        employer = EmployerProfile.query.get_or_404(employer_id)
        data = request.get_json()
        
        # Update fields
        if 'company_name' in data:
            employer.company_name = data['company_name']
        if 'location' in data:
            employer.location = data['location']
        if 'description' in data:
            employer.description = data['description']
        
        employer.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'id': employer.id,
            'profile_id': employer.profile_id,
            'company_name': employer.company_name,
            'location': employer.location,
            'description': employer.description,
            'created_at': employer.created_at.isoformat(),
            'updated_at': employer.updated_at.isoformat()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@employers_bp.route('/<employer_id>', methods=['DELETE'])
def delete_employer(employer_id):
    """Delete employer profile"""
    try:
        employer = EmployerProfile.query.get_or_404(employer_id)
        db.session.delete(employer)
        db.session.commit()
        
        return jsonify({'message': 'Employer profile deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
