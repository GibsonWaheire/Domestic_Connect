from flask import Blueprint, request, jsonify, session
from app.services.auth_service import login_required, get_current_user
from app.models import User, Profile
from app import db
from app.middleware.security import rate_limit, validate_json_input, USER_SCHEMA
from app.middleware.performance import cache_response, compress_response
from app.middleware.logging import log_request, log_error, log_user_action
import uuid
import bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
@rate_limit(max_requests=5, window_seconds=300)  # 5 requests per 5 minutes
@validate_json_input(USER_SCHEMA)
@log_request()
@log_error()
def signup():
    """Register a new user"""
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
            user_type=data['user_type']
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
    """Login user"""
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

@auth_bp.route('/logout', methods=['POST'])
@login_required
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
@cache_response(timeout=60)  # Cache for 1 minute
@compress_response()
@log_request()
def check_session():
    """Check if user is logged in"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'authenticated': False}), 200
        
        user = User.query.get(user_id)
        if not user:
            session.clear()
            return jsonify({'authenticated': False}), 200
        
        return jsonify({
            'authenticated': True,
            'user': user.to_dict()
        }), 200
        
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
