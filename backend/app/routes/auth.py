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
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@firebase_auth_required
def get_user_profile():
    """Get current user's profile using SQLAlchemy ORM methods"""
    try:
        user = request.current_user
        
        # Use SQLAlchemy method to get complete profile data
        profile_data = user.get_full_profile_data()
        
        return jsonify(profile_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/update-profile', methods=['PUT'])
@firebase_auth_required
def update_user_profile():
    """Update user profile information using SQLAlchemy ORM methods"""
    try:
        user = request.current_user
        data = request.get_json()
        
        # Use SQLAlchemy method to update profile
        user.update_profile(**data)
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
