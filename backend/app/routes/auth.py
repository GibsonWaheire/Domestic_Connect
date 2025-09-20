from flask import Blueprint, request, jsonify, session
from app.services.auth_service import login_required, get_current_user
from app.models import User, Profile
from app import db
from app.middleware.security import rate_limit, validate_json_input, USER_SCHEMA
from app.middleware.performance import cache_response, compress_response
from app.middleware.logging import log_request, log_error, log_user_action
import uuid
import bcrypt
import os
import requests
from functools import wraps

auth_bp = Blueprint('auth', __name__)

def verify_firebase_token(token):
    """Verify Firebase ID token"""
    try:
        # Firebase Admin SDK would be used here in production
        # For now, we'll make a simple verification request
        firebase_api_key = os.getenv('FIREBASE_API_KEY', 'AIzaSyByEOXRuou5dtG1whWkG5uLhvbqbEm7AXw')
        
        # Verify token with Firebase REST API
        verify_url = f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={firebase_api_key}"
        response = requests.post(verify_url, json={'idToken': token})
        
        if response.status_code == 200:
            data = response.json()
            if 'users' in data and len(data['users']) > 0:
                return data['users'][0]
        
        return None
    except Exception as e:
        print(f"Firebase token verification error: {e}")
        return None

def firebase_auth_required(f):
    """Decorator to require Firebase authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Firebase token required'}), 401
        
        token = auth_header.split(' ')[1]
        firebase_user = verify_firebase_token(token)
        
        if not firebase_user:
            return jsonify({'error': 'Invalid Firebase token'}), 401
        
        # Get or create user in our database
        user = User.query.filter_by(firebase_uid=firebase_user['localId']).first()
        if not user:
            # Create new user from Firebase data
            user = User(
                id=str(uuid.uuid4()),
                firebase_uid=firebase_user['localId'],
                email=firebase_user.get('email', ''),
                first_name=firebase_user.get('displayName', '').split(' ')[0] if firebase_user.get('displayName') else '',
                last_name=' '.join(firebase_user.get('displayName', '').split(' ')[1:]) if firebase_user.get('displayName') else '',
                user_type=data.get('user_type', 'employer'),  # Use provided type or default to employer
                is_firebase_user=True
            )
            db.session.add(user)
            db.session.commit()
        
        request.current_user = user
        return f(*args, **kwargs)
    
    return decorated_function

@auth_bp.route('/firebase_signup', methods=['POST'])
@firebase_auth_required
@rate_limit(max_requests=5, window_seconds=300)
@log_request()
@log_error()
def firebase_signup():
    """Create user profile for Firebase authenticated user"""
    try:
        user = request.current_user
        data = request.get_json()
        
        # Update user with additional profile information
        user.user_type = data.get('user_type', 'employer')
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.phone_number = data.get('phone_number', user.phone_number)
        
        # Create profile if it doesn't exist
        if not hasattr(user, 'profile') or not user.profile:
            profile = Profile(
                user_id=user.id,
                **{k: v for k, v in data.items() if k not in ['user_type', 'first_name', 'last_name', 'phone_number']}
            )
            db.session.add(profile)
        
        db.session.commit()
        
        # Log user action
        log_user_action(user.id, 'firebase_signup', {'user_type': data.get('user_type')})
        
        return jsonify({
            'message': 'User profile created successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/firebase_user', methods=['POST'])
@firebase_auth_required
@log_request()
@log_error()
def firebase_user():
    """Get or create user profile for Firebase authenticated user"""
    try:
        user = request.current_user
        data = request.get_json()
        
        # Update user information if provided
        if data.get('display_name'):
            name_parts = data['display_name'].split(' ')
            user.first_name = name_parts[0]
            user.last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
        
        if data.get('email'):
            user.email = data['email']
        
        db.session.commit()
        
        return jsonify({
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/signup', methods=['POST'])
@rate_limit(max_requests=5, window_seconds=300)  # 5 requests per 5 minutes
@validate_json_input(USER_SCHEMA)
@log_request()
@log_error()
def signup():
    """Register a new user with local authentication (for test accounts)"""
    try:
        data = request.get_json()
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'User already exists'}), 400
        
        # Hash password
        password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        
        # Create user
        user = User(
            id=str(uuid.uuid4()),
            email=data['email'],
            password_hash=password_hash.decode('utf-8'),
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone_number=data.get('phone_number'),
            user_type=data['user_type'],
            is_firebase_user=False
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Log user action
        log_user_action(user.id, 'signup', {'user_type': data['user_type']})
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
@rate_limit(max_requests=10, window_seconds=300)  # 10 requests per 5 minutes
@validate_json_input({'email': {'required': True, 'type': str}, 'password': {'required': True, 'type': str}})
@log_request()
@log_error()
def login():
    """Login user with local authentication (for test accounts)"""
    try:
        data = request.get_json()
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Verify password
        if not bcrypt.checkpw(data['password'].encode('utf-8'), user.password_hash.encode('utf-8')):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Create session
        session['user_id'] = user.id
        session['user_type'] = user.user_type
        
        # Log user action
        log_user_action(user.id, 'login')
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['DELETE'])
@log_request()
def logout():
    """Logout user"""
    try:
        user_id = session.get('user_id')
        
        # Clear session
        session.clear()
        
        # Log user action
        if user_id:
            log_user_action(user_id, 'logout')
        
        return jsonify({'message': 'Logout successful'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/check_session', methods=['GET'])
@log_request()
def check_session():
    """Check if user is logged in"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'user': None}), 200
        
        user = User.query.get(user_id)
        if not user:
            session.clear()
            return jsonify({'user': None}), 200
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        print(f"Check session error: {e}")
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