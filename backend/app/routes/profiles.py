from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required
from app.models import Profile, EmployerProfile, HousegirlProfile, AgencyProfile
from app import db
import uuid

profiles_bp = Blueprint('profiles', __name__)

@profiles_bp.route('/', methods=['GET'])
def get_all_profiles():
    """Get all profiles with optional filtering"""
    try:
        user_type = request.args.get('user_type')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        query = Profile.query
        
        if user_type:
            query = query.join(User).filter(User.user_type == user_type)
        
        profiles = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        result = []
        for profile in profiles.items:
            profile_data = {
                'id': profile.id,
                'user_id': profile.user_id,
                'user_type': profile.user.user_type,
                'first_name': profile.user.first_name,
                'last_name': profile.user.last_name,
                'email': profile.user.email,
                'phone_number': profile.user.phone_number,
                'created_at': profile.created_at.isoformat(),
                'updated_at': profile.updated_at.isoformat()
            }
            
            # Add type-specific data
            if profile.employer_profile:
                profile_data['employer'] = {
                    'company_name': profile.employer_profile.company_name,
                    'location': profile.employer_profile.location,
                    'description': profile.employer_profile.description
                }
            elif profile.housegirl_profile:
                profile_data['housegirl'] = {
                    'age': profile.housegirl_profile.age,
                    'bio': profile.housegirl_profile.bio,
                    'current_location': profile.housegirl_profile.current_location,
                    'location': profile.housegirl_profile.location,
                    'education': profile.housegirl_profile.education,
                    'experience': profile.housegirl_profile.experience,
                    'expected_salary': profile.housegirl_profile.expected_salary,
                    'accommodation_type': profile.housegirl_profile.accommodation_type,
                    'tribe': profile.housegirl_profile.tribe,
                    'is_available': profile.housegirl_profile.is_available,
                    'profile_photo_url': profile.housegirl_profile.profile_photo_url
                }
            elif profile.agency_profile:
                profile_data['agency'] = {
                    'agency_name': profile.agency_profile.agency_name,
                    'location': profile.agency_profile.location,
                    'description': profile.agency_profile.description,
                    'license_number': profile.agency_profile.license_number
                }
            
            result.append(profile_data)
        
        return jsonify({
            'profiles': result,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': profiles.total,
                'pages': profiles.pages,
                'has_next': profiles.has_next,
                'has_prev': profiles.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profiles_bp.route('/<profile_id>', methods=['GET'])
def get_profile(profile_id):
    """Get specific profile by ID"""
    try:
        profile = Profile.query.get_or_404(profile_id)
        
        profile_data = {
            'id': profile.id,
            'user_id': profile.user_id,
            'user_type': profile.user.user_type,
            'first_name': profile.user.first_name,
            'last_name': profile.user.last_name,
            'email': profile.user.email,
            'phone_number': profile.user.phone_number,
            'created_at': profile.created_at.isoformat(),
            'updated_at': profile.updated_at.isoformat()
        }
        
        # Add type-specific data
        if profile.employer_profile:
            profile_data['employer'] = {
                'company_name': profile.employer_profile.company_name,
                'location': profile.employer_profile.location,
                'description': profile.employer_profile.description
            }
        elif profile.housegirl_profile:
            profile_data['housegirl'] = {
                'age': profile.housegirl_profile.age,
                'bio': profile.housegirl_profile.bio,
                'current_location': profile.housegirl_profile.current_location,
                'location': profile.housegirl_profile.location,
                'education': profile.housegirl_profile.education,
                'experience': profile.housegirl_profile.experience,
                'expected_salary': profile.housegirl_profile.expected_salary,
                'accommodation_type': profile.housegirl_profile.accommodation_type,
                'tribe': profile.housegirl_profile.tribe,
                'is_available': profile.housegirl_profile.is_available,
                'profile_photo_url': profile.housegirl_profile.profile_photo_url
            }
        elif profile.agency_profile:
            profile_data['agency'] = {
                'agency_name': profile.agency_profile.agency_name,
                'location': profile.agency_profile.location,
                'description': profile.agency_profile.description,
                'license_number': profile.agency_profile.license_number
            }
        
        return jsonify(profile_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profiles_bp.route('/', methods=['POST'])
@firebase_auth_required
def create_profile():
    """Create a new profile"""
    try:
        user = request.current_user
        data = request.get_json()
        
        # Check if profile already exists
        if user.profile:
            return jsonify({'error': 'Profile already exists'}), 400
        
        # Create base profile
        profile = Profile(
            id=str(uuid.uuid4()),
            user_id=user.id
        )
        db.session.add(profile)
        db.session.flush()  # Get the profile ID
        
        # Create type-specific profile
        if user.user_type == 'employer':
            employer_profile = EmployerProfile(
                id=str(uuid.uuid4()),
                profile_id=profile.id,
                company_name=data.get('company_name', ''),
                location=data.get('location', ''),
                description=data.get('description', '')
            )
            db.session.add(employer_profile)
            
        elif user.user_type == 'housegirl':
            housegirl_profile = HousegirlProfile(
                id=str(uuid.uuid4()),
                profile_id=profile.id,
                age=data.get('age'),
                bio=data.get('bio', ''),
                current_location=data.get('current_location', ''),
                location=data.get('location', ''),
                education=data.get('education', ''),
                experience=data.get('experience', ''),
                expected_salary=data.get('expected_salary'),
                accommodation_type=data.get('accommodation_type', ''),
                tribe=data.get('tribe', ''),
                is_available=data.get('is_available', True),
                profile_photo_url=data.get('profile_photo_url')
            )
            db.session.add(housegirl_profile)
            
        elif user.user_type == 'agency':
            agency_profile = AgencyProfile(
                id=str(uuid.uuid4()),
                profile_id=profile.id,
                agency_name=data.get('agency_name', ''),
                location=data.get('location', ''),
                description=data.get('description', ''),
                license_number=data.get('license_number', '')
            )
            db.session.add(agency_profile)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile created successfully',
            'profile_id': profile.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profiles_bp.route('/<profile_id>', methods=['PUT'])
@firebase_auth_required
def update_profile(profile_id):
    """Update profile information"""
    try:
        user = request.current_user
        data = request.get_json()
        
        # Check if user owns this profile
        if not user.profile or user.profile.id != profile_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        profile = user.profile
        
        # Update type-specific profile
        if user.user_type == 'employer' and profile.employer_profile:
            if 'company_name' in data:
                profile.employer_profile.company_name = data['company_name']
            if 'location' in data:
                profile.employer_profile.location = data['location']
            if 'description' in data:
                profile.employer_profile.description = data['description']
                
        elif user.user_type == 'housegirl' and profile.housegirl_profile:
            if 'age' in data:
                profile.housegirl_profile.age = data['age']
            if 'bio' in data:
                profile.housegirl_profile.bio = data['bio']
            if 'current_location' in data:
                profile.housegirl_profile.current_location = data['current_location']
            if 'location' in data:
                profile.housegirl_profile.location = data['location']
            if 'education' in data:
                profile.housegirl_profile.education = data['education']
            if 'experience' in data:
                profile.housegirl_profile.experience = data['experience']
            if 'expected_salary' in data:
                profile.housegirl_profile.expected_salary = data['expected_salary']
            if 'accommodation_type' in data:
                profile.housegirl_profile.accommodation_type = data['accommodation_type']
            if 'tribe' in data:
                profile.housegirl_profile.tribe = data['tribe']
            if 'is_available' in data:
                profile.housegirl_profile.is_available = data['is_available']
            if 'profile_photo_url' in data:
                profile.housegirl_profile.profile_photo_url = data['profile_photo_url']
                
        elif user.user_type == 'agency' and profile.agency_profile:
            if 'agency_name' in data:
                profile.agency_profile.agency_name = data['agency_name']
            if 'location' in data:
                profile.agency_profile.location = data['location']
            if 'description' in data:
                profile.agency_profile.description = data['description']
            if 'license_number' in data:
                profile.agency_profile.license_number = data['license_number']
        
        db.session.commit()
        
        return jsonify({'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
