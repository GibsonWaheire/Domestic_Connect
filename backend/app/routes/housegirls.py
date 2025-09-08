from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required
from app.models import HousegirlProfile, Profile, User
from app import db

housegirls_bp = Blueprint('housegirls', __name__)

@housegirls_bp.route('/', methods=['GET'])
def get_housegirls():
    """Get all housegirl profiles with filtering"""
    try:
        # Query parameters for filtering
        location = request.args.get('location')
        education = request.args.get('education')
        experience = request.args.get('experience')
        accommodation_type = request.args.get('accommodation_type')
        tribe = request.args.get('tribe')
        min_salary = request.args.get('min_salary', type=int)
        max_salary = request.args.get('max_salary', type=int)
        is_available = request.args.get('is_available', type=bool)
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        # Build query
        query = HousegirlProfile.query.join(Profile).join(User).filter(User.user_type == 'housegirl')
        
        if location:
            query = query.filter(HousegirlProfile.location.ilike(f'%{location}%'))
        if education:
            query = query.filter(HousegirlProfile.education == education)
        if experience:
            query = query.filter(HousegirlProfile.experience == experience)
        if accommodation_type:
            query = query.filter(HousegirlProfile.accommodation_type == accommodation_type)
        if tribe:
            query = query.filter(HousegirlProfile.tribe.ilike(f'%{tribe}%'))
        if min_salary:
            query = query.filter(HousegirlProfile.expected_salary >= min_salary)
        if max_salary:
            query = query.filter(HousegirlProfile.expected_salary <= max_salary)
        if is_available is not None:
            query = query.filter(HousegirlProfile.is_available == is_available)
        
        # Paginate results
        housegirls = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        result = []
        for housegirl in housegirls.items:
            result.append({
                'id': housegirl.id,
                'profile_id': housegirl.profile_id,
                'age': housegirl.age,
                'bio': housegirl.bio,
                'current_location': housegirl.current_location,
                'location': housegirl.location,
                'education': housegirl.education,
                'experience': housegirl.experience,
                'expected_salary': housegirl.expected_salary,
                'accommodation_type': housegirl.accommodation_type,
                'tribe': housegirl.tribe,
                'is_available': housegirl.is_available,
                'profile_photo_url': housegirl.profile_photo_url,
                'first_name': housegirl.profile.user.first_name,
                'last_name': housegirl.profile.user.last_name,
                'phone_number': housegirl.profile.user.phone_number,
                'created_at': housegirl.created_at.isoformat(),
                'updated_at': housegirl.updated_at.isoformat()
            })
        
        return jsonify({
            'housegirls': result,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': housegirls.total,
                'pages': housegirls.pages,
                'has_next': housegirls.has_next,
                'has_prev': housegirls.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@housegirls_bp.route('/<housegirl_id>', methods=['GET'])
def get_housegirl(housegirl_id):
    """Get specific housegirl profile"""
    try:
        housegirl = HousegirlProfile.query.get_or_404(housegirl_id)
        
        return jsonify({
            'id': housegirl.id,
            'profile_id': housegirl.profile_id,
            'age': housegirl.age,
            'bio': housegirl.bio,
            'current_location': housegirl.current_location,
            'location': housegirl.location,
            'education': housegirl.education,
            'experience': housegirl.experience,
            'expected_salary': housegirl.expected_salary,
            'accommodation_type': housegirl.accommodation_type,
            'tribe': housegirl.tribe,
            'is_available': housegirl.is_available,
            'profile_photo_url': housegirl.profile_photo_url,
            'first_name': housegirl.profile.user.first_name,
            'last_name': housegirl.profile.user.last_name,
            'phone_number': housegirl.profile.user.phone_number,
            'created_at': housegirl.created_at.isoformat(),
            'updated_at': housegirl.updated_at.isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
