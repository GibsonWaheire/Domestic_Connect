from functools import wraps
from flask import request, jsonify, current_app, session
import bcrypt
from app.models import User
from firebase_admin import auth

def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, hashed):
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def get_or_create_user(email, password=None, user_type=None, **kwargs):
    """Get existing user or create new one"""
    user = User.find_by_email(email)
    
    if not user and password:
        if user_type not in ['employer', 'housegirl', 'agency']:
            raise ValueError('A valid user_type is required to create a user.')
        # Create new user
        try:
            import uuid
            uid = str(uuid.uuid4())
            user = User.create_user(
                firebase_uid=uid,
                email=email,
                user_type=user_type,
                first_name=kwargs.get('first_name', ''),
                last_name=kwargs.get('last_name', ''),
                phone_number=kwargs.get('phone_number', '')
            )
            user.set_password(password)
            user.update_profile(password_hash=user.password_hash)
        except Exception as e:
            current_app.logger.error(f"Failed to create user: {e}")
            raise
    
    return user

def authenticate_user(email, password):
    """Authenticate user with email and password"""
    user = User.find_by_email(email)
    
    if user and getattr(user, 'password_hash', None) and verify_password(password, user.password_hash):
        return user
    
    return None

def auth_required(f):
    """Decorator to require authentication using Flask sessions"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Get user
        user = User.get_user_with_profile(user_id)
        if not user or not getattr(user, 'is_active', True):
            session.pop('user_id', None)
            return jsonify({'error': 'User not found or inactive'}), 401
        
        # Add user to request context
        request.current_user = user
        
        return f(*args, **kwargs)
    
    return decorated_function

def admin_required(f):
    """Decorator to require admin privileges"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not hasattr(request, 'current_user'):
            return jsonify({'error': 'Authentication required'}), 401
        
        # Check if user is admin
        if not getattr(request.current_user, 'is_admin', False):
            return jsonify({'error': 'Admin privileges required'}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function

def verify_firebase_token(token):
    """Verify Firebase ID token using the official Admin SDK"""
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
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
            
        request.firebase_user = firebase_user
        
        # Optionally attach local user
        user = User.find_by_firebase_uid(firebase_user.get('uid'))
        request.current_user = user
        
        return f(*args, **kwargs)
    return decorated_function

def get_current_user():
    """Get the current authenticated user from session"""
    user_id = session.get('user_id')
    if not user_id:
        return None
    
    user = User.get_user_with_profile(user_id)
    if not user or not getattr(user, 'is_active', True):
        session.pop('user_id', None)
        return None
    
    return user

def login_required(f):
    """Decorator to require login for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        user = User.get_user_with_profile(user_id)
        if not user or not getattr(user, 'is_active', True):
            session.pop('user_id', None)
            return jsonify({'error': 'Authentication required'}), 401
        
        # Add current user to request object
        request.current_user = user
        return f(*args, **kwargs)
    
    return decorated_function