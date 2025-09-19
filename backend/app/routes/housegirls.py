from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required
from app.models import HousegirlProfile, Profile, User
from app import db
from datetime import datetime

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

@housegirls_bp.route('/', methods=['POST'])
def create_housegirl():
    """Create new housegirl profile"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['profile_id', 'age', 'location', 'education', 'experience', 'expected_salary']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create housegirl profile
        housegirl = HousegirlProfile(
            profile_id=data['profile_id'],
            age=data['age'],
            bio=data.get('bio', ''),
            current_location=data.get('current_location', data['location']),
            location=data['location'],
            education=data['education'],
            experience=data['experience'],
            expected_salary=data['expected_salary'],
            accommodation_type=data.get('accommodation_type', 'live_in'),
            tribe=data.get('tribe', ''),
            is_available=data.get('is_available', True),
            profile_photo_url=data.get('profile_photo_url')
        )
        
        db.session.add(housegirl)
        db.session.commit()
        
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
            'created_at': housegirl.created_at.isoformat(),
            'updated_at': housegirl.updated_at.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@housegirls_bp.route('/<housegirl_id>', methods=['PUT'])
def update_housegirl(housegirl_id):
    """Update housegirl profile"""
    try:
        housegirl = HousegirlProfile.query.get_or_404(housegirl_id)
        data = request.get_json()
        
        # Update fields
        if 'age' in data:
            housegirl.age = data['age']
        if 'bio' in data:
            housegirl.bio = data['bio']
        if 'current_location' in data:
            housegirl.current_location = data['current_location']
        if 'location' in data:
            housegirl.location = data['location']
        if 'education' in data:
            housegirl.education = data['education']
        if 'experience' in data:
            housegirl.experience = data['experience']
        if 'expected_salary' in data:
            housegirl.expected_salary = data['expected_salary']
        if 'accommodation_type' in data:
            housegirl.accommodation_type = data['accommodation_type']
        if 'tribe' in data:
            housegirl.tribe = data['tribe']
        if 'is_available' in data:
            housegirl.is_available = data['is_available']
        if 'profile_photo_url' in data:
            housegirl.profile_photo_url = data['profile_photo_url']
        
        housegirl.updated_at = datetime.utcnow()
        db.session.commit()
        
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
            'created_at': housegirl.created_at.isoformat(),
            'updated_at': housegirl.updated_at.isoformat()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@housegirls_bp.route('/<housegirl_id>', methods=['DELETE'])
def delete_housegirl(housegirl_id):
    """Delete housegirl profile"""
    try:
        housegirl = HousegirlProfile.query.get_or_404(housegirl_id)
        db.session.delete(housegirl)
        db.session.commit()
        
        return jsonify({'message': 'Housegirl profile deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
