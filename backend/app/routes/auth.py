from flask import Blueprint, request, jsonify, session
from app.services.auth_service import firebase_auth_required, verify_firebase_token, get_or_create_user
from app.models import User, Profile
from app import db
import uuid

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

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Create new user with local authentication"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'user_type', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 422
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 422
        
        # Create new user
        user = User(
            id=f"user_{uuid.uuid4().hex[:12]}",
            email=data['email'],
            user_type=data['user_type'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone_number=data.get('phone_number')
        )
        
        # Set password (this will hash it)
        user.set_password(data['password'])
        
        # Save to database
        db.session.add(user)
        db.session.commit()
        
        # Auto-login by setting session
        session['user_id'] = user.id
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 422
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user with email and password"""
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 422
        
        # Find user by email
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 401
        
        # Set session for auto-login
        session['user_id'] = user.id
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['DELETE'])
def logout():
    """Clear user session"""
    try:
        session.pop('user_id', None)
        return jsonify({'message': 'Logged out successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/check_session', methods=['GET'])
def check_session():
    """Check if user has valid session (auto-login)"""
    try:
        user_id = session.get('user_id')
        
        if not user_id:
            return jsonify({'user': None}), 200
        
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            session.pop('user_id', None)
            return jsonify({'user': None}), 200
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
