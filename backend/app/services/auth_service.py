from functools import wraps
from flask import request, jsonify, current_app
import firebase_admin
from firebase_admin import auth as firebase_auth
from app.models import User

def verify_firebase_token(token):
    """Verify Firebase ID token and return user info"""
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        current_app.logger.error(f"Token verification failed: {e}")
        return None

def get_or_create_user(firebase_uid, email, user_type=None):
    """Get existing user or create new one from Firebase data using SQLAlchemy ORM"""
    # Use SQLAlchemy's class method for cleaner code
    user = User.find_by_firebase_uid(firebase_uid)
    
    if not user:
        # Create new user using SQLAlchemy class method
        try:
            user = User.create_user(
                firebase_uid=firebase_uid,
                email=email,
                user_type=user_type or 'employer'
            )
        except Exception as e:
            current_app.logger.error(f"Failed to create user: {e}")
            raise
    
    return user

def firebase_auth_required(f):
    """Decorator to require Firebase authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'No authorization header'}), 401
        
        try:
            # Extract token from "Bearer <token>"
            token = auth_header.split(' ')[1]
        except IndexError:
            return jsonify({'error': 'Invalid authorization header format'}), 401
        
        # Verify Firebase token
        decoded_token = verify_firebase_token(token)
        if not decoded_token:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get or create user
        firebase_uid = decoded_token['uid']
        email = decoded_token.get('email', '')
        
        user = get_or_create_user(firebase_uid, email)
        
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
        
        # For now, we'll implement a simple admin check
        # In production, you might want to add an admin field to User model
        admin_emails = ['admin@domesticconnect.ke', 'admin@test.com']
        if request.current_user.email not in admin_emails:
            return jsonify({'error': 'Admin privileges required'}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function
