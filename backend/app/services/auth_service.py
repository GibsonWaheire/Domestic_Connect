from functools import wraps
from flask import request, jsonify, current_app, session
import bcrypt
from app.models import User, db

def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, hashed):
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def get_or_create_user(email, password=None, user_type='employer', **kwargs):
    """Get existing user or create new one"""
    user = User.query.filter_by(email=email).first()
    
    if not user and password:
        # Create new user
        try:
            hashed_password = hash_password(password)
            user = User(
                email=email,
                password_hash=hashed_password,
                user_type=user_type,
                first_name=kwargs.get('first_name', ''),
                last_name=kwargs.get('last_name', ''),
                phone_number=kwargs.get('phone_number', ''),
                is_active=True
            )
            db.session.add(user)
            db.session.commit()
        except Exception as e:
            current_app.logger.error(f"Failed to create user: {e}")
            db.session.rollback()
            raise
    
    return user

def authenticate_user(email, password):
    """Authenticate user with email and password"""
    user = User.query.filter_by(email=email).first()
    
    if user and user.password_hash and verify_password(password, user.password_hash):
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
        user = User.query.get(user_id)
        if not user or not user.is_active:
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
        if not request.current_user.is_admin:
            return jsonify({'error': 'Admin privileges required'}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function

# Legacy Firebase compatibility (for gradual migration)
def firebase_auth_required(f):
    """Legacy decorator - redirects to local auth"""
    return auth_required(f)

def verify_firebase_token(token):
    """Legacy function - returns None for now"""
    return None

def get_current_user():
    """Get the current authenticated user from session"""
    user_id = session.get('user_id')
    if not user_id:
        return None
    
    user = User.query.get(user_id)
    if not user or not user.is_active:
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
        
        user = User.query.get(user_id)
        if not user or not user.is_active:
            session.pop('user_id', None)
            return jsonify({'error': 'Authentication required'}), 401
        
        # Add current user to request object
        request.current_user = user
        return f(*args, **kwargs)
    
    return decorated_function