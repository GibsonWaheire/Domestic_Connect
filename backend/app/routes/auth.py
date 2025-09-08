from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required, verify_firebase_token, get_or_create_user
from app.models import User, Profile
from app import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/verify', methods=['POST'])
def verify_token():
    """Verify Firebase token and return user info"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Token required'}), 400
        
        # Verify Firebase token
        decoded_token = verify_firebase_token(token)
        if not decoded_token:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get or create user
        firebase_uid = decoded_token['uid']
        email = decoded_token.get('email', '')
        
        user = get_or_create_user(firebase_uid, email)
        
        return jsonify({
            'user': {
                'id': user.id,
                'email': user.email,
                'user_type': user.user_type,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone_number': user.phone_number,
                'created_at': user.created_at.isoformat(),
                'updated_at': user.updated_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@firebase_auth_required
def get_user_profile():
    """Get current user's profile"""
    try:
        user = request.current_user
        
        # Get profile if exists
        profile_data = None
        if user.profile:
            profile_data = {
                'id': user.profile.id,
                'created_at': user.profile.created_at.isoformat(),
                'updated_at': user.profile.updated_at.isoformat()
            }
            
            # Add type-specific profile data
            if user.user_type == 'employer' and user.profile.employer_profile:
                profile_data['employer'] = {
                    'company_name': user.profile.employer_profile.company_name,
                    'location': user.profile.employer_profile.location,
                    'description': user.profile.employer_profile.description
                }
            elif user.user_type == 'housegirl' and user.profile.housegirl_profile:
                profile_data['housegirl'] = {
                    'age': user.profile.housegirl_profile.age,
                    'bio': user.profile.housegirl_profile.bio,
                    'current_location': user.profile.housegirl_profile.current_location,
                    'location': user.profile.housegirl_profile.location,
                    'education': user.profile.housegirl_profile.education,
                    'experience': user.profile.housegirl_profile.experience,
                    'expected_salary': user.profile.housegirl_profile.expected_salary,
                    'accommodation_type': user.profile.housegirl_profile.accommodation_type,
                    'tribe': user.profile.housegirl_profile.tribe,
                    'is_available': user.profile.housegirl_profile.is_available,
                    'profile_photo_url': user.profile.housegirl_profile.profile_photo_url
                }
            elif user.user_type == 'agency' and user.profile.agency_profile:
                profile_data['agency'] = {
                    'agency_name': user.profile.agency_profile.agency_name,
                    'location': user.profile.agency_profile.location,
                    'description': user.profile.agency_profile.description,
                    'license_number': user.profile.agency_profile.license_number
                }
        
        return jsonify({
            'user': {
                'id': user.id,
                'email': user.email,
                'user_type': user.user_type,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone_number': user.phone_number,
                'created_at': user.created_at.isoformat(),
                'updated_at': user.updated_at.isoformat()
            },
            'profile': profile_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/update-profile', methods=['PUT'])
@firebase_auth_required
def update_user_profile():
    """Update user profile information"""
    try:
        user = request.current_user
        data = request.get_json()
        
        # Update basic user info
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone_number' in data:
            user.phone_number = data['phone_number']
        if 'user_type' in data:
            user.user_type = data['user_type']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'user_type': user.user_type,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone_number': user.phone_number,
                'updated_at': user.updated_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
