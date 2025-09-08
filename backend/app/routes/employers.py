from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required
from app.models import EmployerProfile, Profile, User
from app import db

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
