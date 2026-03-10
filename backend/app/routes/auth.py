from flask import Blueprint, request, jsonify, session
from app.services.auth_service import login_required, get_current_user, firebase_auth_required
from app.models import User, Profile
from app.firebase_init import db
from app.middleware.security import rate_limit, validate_json_input, USER_SCHEMA
from app.middleware.performance import cache_response, compress_response
from app.middleware.logging import log_request, log_error, log_user_action
import uuid
import bcrypt
from datetime import datetime
import logging


logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/firebase_signup', methods=['POST'])
@firebase_auth_required
@rate_limit(max_requests=5, window_seconds=300)
@log_request()
@log_error()
def firebase_signup():
    """Create user profile for Firebase authenticated user"""
    try:
        data = request.get_json()
        firebase_user = request.firebase_user
        user = request.current_user
        required_role = data.get('user_type')
        if required_role not in ['employer', 'housegirl', 'agency']:
            return jsonify({'error': 'A valid user_type is required (employer, housegirl, agency).'}), 400

        if not user:
            # Create the user using the model method
            user = User.create_user(
                firebase_uid=firebase_user.get('uid'),
                email=data.get('email') or firebase_user.get('email', ''),
                user_type=required_role,
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                phone_number=data.get('phone_number')
            )
        elif getattr(user, 'user_type', None) != required_role:
            return jsonify({'error': 'This account is already registered with a different role.'}), 409
        
        # Update user with additional profile information
        updates = {}
        if data.get('first_name'): updates['first_name'] = data['first_name']
        if data.get('last_name'): updates['last_name'] = data['last_name']
        if data.get('phone_number'): updates['phone_number'] = data['phone_number']
        updates['user_type'] = required_role
        
        if updates:
            user.update_profile(**updates)
        
        # Create profile if it doesn't exist by checking firestore manually
        profiles_ref = db.collection('profiles').where('user_id', '==', user.id).limit(1).stream()
        profile_exists = any(True for _ in profiles_ref)
        
        if not profile_exists:
            profile_id = str(uuid.uuid4())
            profile_data = {
                'id': profile_id,
                'user_id': user.id,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            # Add any extra fields from data not already handled
            for k, v in data.items():
                if k not in ['user_type', 'first_name', 'last_name', 'phone_number']:
                    profile_data[k] = v
            db.collection('profiles').document(profile_id).set(profile_data)
        
        session['user_id'] = user.id
        session['user_type'] = getattr(user, 'user_type', None)
        
        # Log user action
        log_user_action(user.id, 'firebase_signup', {'user_type': required_role})
        
        return jsonify({
            'message': 'User profile created successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@auth_bp.route('/firebase_user', methods=['POST'])
@firebase_auth_required
@log_request()
@log_error()
def firebase_user():
    """Get or create user profile for Firebase authenticated user"""
    try:
        user = request.current_user
        data = request.get_json()
        firebase_user = request.firebase_user
        if not user:
            lookup_email = data.get('email') or firebase_user.get('email')
            if lookup_email:
                user = User.find_by_email(lookup_email)
                if user:
                    user.update_profile(
                        firebase_uid=firebase_user.get('uid'),
                        is_firebase_user=True
                    )
            if not user:
                return jsonify({'error': 'User profile not found. Complete signup first.'}), 404
        
        updates = {}
        if data.get('display_name'):
            name_parts = data['display_name'].split(' ')
            updates['first_name'] = name_parts[0]
            updates['last_name'] = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
        
        if data.get('email'):
            updates['email'] = data['email']
            
        if updates:
            user.update_profile(**updates)
        
        session['user_id'] = user.id
        session['user_type'] = getattr(user, 'user_type', None)
        
        return jsonify({
            'user': user.get_full_profile_data()
        }), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@auth_bp.route('/verify', methods=['POST'])
@firebase_auth_required
@rate_limit(max_requests=10, window_seconds=300)
@log_request()
@log_error()
def verify_phone_auth():
    try:
        data = request.get_json() or {}
        decoded_token = request.firebase_user or {}
        uid = decoded_token.get('uid')
        user_type = data.get('user_type')

        if not uid:
            return jsonify({'error': 'Invalid Firebase token.'}), 401

        phone_number = decoded_token.get('phone_number')
        
        # Null safety checks
        display_name_safe = data.get('display_name') or ''
        email_safe = data.get('email') or decoded_token.get('email') or ''
        photo_url_safe = data.get('photo_url') or ''
        first_name = ''
        last_name = ''
        
        timestamp = datetime.utcnow().isoformat()
        user_id = f"user_{uid}"
        user_doc_ref = db.collection('users').document(user_id)
        user_doc = user_doc_ref.get()

        if user_doc.exists:
            existing_data = user_doc.to_dict() or {}
            stored_user_type = existing_data.get('user_type')

            if not stored_user_type:
                return jsonify({
                    'status': 'role_required',
                    'message': 'Please select your role',
                    'uid': uid
                }), 200
            
            user_data = {
                **existing_data,
                'uid': uid,
                'firebase_uid': uid,
                'phone': phone_number,
                'phone_number': phone_number,
                'email': email_safe,
                'updated_at': timestamp,
                'profile_complete': existing_data.get('profile_complete', False)
            }
            # Add photo_url if provided and not already set
            if photo_url_safe and not existing_data.get('photo_url'):
                user_data['photo_url'] = photo_url_safe
                
            user_doc_ref.set(user_data, merge=True)
            user_type_to_return = stored_user_type
        else:
            if user_type not in ['employer', 'housegirl', 'agency']:
                return jsonify({'error': 'A valid user_type is required (employer, housegirl, agency).'}), 400

            if display_name_safe:
                name_parts = display_name_safe.split(' ')
                first_name = name_parts[0]
                if len(name_parts) > 1:
                    last_name = ' '.join(name_parts[1:])
            
            user_data = {
                'id': user_id,
                'uid': uid,
                'firebase_uid': uid,
                'phone': phone_number,
                'phone_number': phone_number,
                'email': email_safe,
                'user_type': user_type,
                'first_name': first_name,
                'last_name': last_name,
                'photo_url': photo_url_safe,
                'created_at': timestamp,
                'updated_at': timestamp,
                'profile_complete': False,
                'is_active': True,
                'is_admin': False,
                'is_firebase_user': True
            }
            user_doc_ref.set(user_data)
            
            # Create role-specific profile document
            profile_id = str(uuid.uuid4())
            profile_data = {
                'id': profile_id,
                'user_id': user_id,
                'first_name': first_name,
                'last_name': last_name,
                'email': email_safe,
                'phone_number': phone_number,
                'created_at': timestamp,
                'updated_at': timestamp
            }
            if user_type == 'employer':
                db.collection('employer_profiles').document(profile_id).set(profile_data)
            elif user_type == 'housegirl':
                db.collection('housegirl_profiles').document(profile_id).set(profile_data)

            user_type_to_return = user_type

        session['user_id'] = user_id
        session['user_type'] = user_type_to_return

        return jsonify({
            'message': 'Phone verification successful',
            'status': 'ok',
            'user_type': user_type_to_return,
            'user': {
                'uid': uid,
                'user_type': user_type_to_return,
                'email': email_safe,
                'display_name': display_name_safe or f"{first_name} {last_name}".strip()
            }
        }), 200
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@auth_bp.route('/update-role', methods=['POST'])
@firebase_auth_required
@rate_limit(max_requests=10, window_seconds=300)
@log_request()
@log_error()
def update_role():
    try:
        user = request.current_user
        firebase_user = request.firebase_user or {}
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.get_json() or {}
        user_type = data.get('user_type')
        if user_type not in ['employer', 'housegirl']:
            return jsonify({'error': 'Invalid user_type. Must be employer or housegirl.'}), 400

        timestamp = datetime.utcnow().isoformat()
        user_ref = db.collection('users').document(getattr(user, 'id'))
        user_ref.set({
            'user_type': user_type,
            'updated_at': timestamp
        }, merge=True)

        profile_docs = list(
            db.collection('profiles')
            .where('user_id', '==', getattr(user, 'id'))
            .limit(1)
            .stream()
        )
        if profile_docs:
            profile_id = profile_docs[0].to_dict().get('id')
            db.collection('profiles').document(profile_id).set({
                'updated_at': timestamp
            }, merge=True)
        else:
            profile_id = str(uuid.uuid4())
            db.collection('profiles').document(profile_id).set({
                'id': profile_id,
                'user_id': getattr(user, 'id'),
                'first_name': getattr(user, 'first_name', ''),
                'last_name': getattr(user, 'last_name', ''),
                'email': getattr(user, 'email', '') or firebase_user.get('email', ''),
                'phone_number': getattr(user, 'phone_number', '') or firebase_user.get('phone_number', ''),
                'created_at': timestamp,
                'updated_at': timestamp
            })

        session['user_type'] = user_type

        return jsonify({
            'user_type': user_type,
            'success': True
        }), 200
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

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
        existing_user = User.find_by_email(data['email'])
        if existing_user:
            return jsonify({'error': 'User already exists'}), 400
        
        # Create user via BaseModel and set password
        user_id = str(uuid.uuid4())
        
        user_info = {
            'id': user_id,
            'firebase_uid': None,
            'email': data['email'],
            'user_type': data['user_type'],
            'first_name': data['first_name'],
            'last_name': data['last_name'],
            'phone_number': data.get('phone_number'),
            'is_active': True,
            'is_admin': False,
            'is_firebase_user': False,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        user = User(**user_info)
        user.set_password(data['password'])
        user_info['password_hash'] = user.password_hash
        
        db.collection('users').document(user_id).set(user_info)
        
        # Log user action
        log_user_action(user.id, 'signup', {'user_type': data['user_type']})
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

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
        user = User.find_by_email(data['email'])
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Verify password (model method assumes instance attributes)
        if not user.check_password(data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Create session
        session['user_id'] = user.id
        session['user_type'] = getattr(user, 'user_type', None)
        
        # Log user action
        log_user_action(user.id, 'login')
        
        return jsonify({
            'message': 'Login successful',
            'user': user.get_full_profile_data()
        }), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

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
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@auth_bp.route('/check_session', methods=['GET'])
@log_request()
def check_session():
    """Check if user is logged in"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'user': None}), 200
        
        # For session check, we bring along full profile data
        user = User.get_user_with_profile(user_id)
        if not user:
            session.clear()
            return jsonify({'user': None}), 200
        
        return jsonify({'user': user.get_full_profile_data()}), 200
        
    except Exception as e:
        print(f"Check session error: {e}")
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@auth_bp.route('/update-profile', methods=['PUT'])
@firebase_auth_required
def update_user_profile():
    """Update user profile information using Firestore methods"""
    try:
        user = request.current_user
        data = request.get_json()
        
        # Use BaseModel method to update profile
        user.update_profile(**data)
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.get_full_profile_data()
        }), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500