from flask import Blueprint, request, jsonify, session
from app.services.auth_service import login_required, get_current_user, firebase_auth_required
from app.models import User, Profile
from app.firebase_init import db
from app.middleware.security import rate_limit, rate_limit_by_email, validate_json_input, USER_SCHEMA
from app.middleware.performance import cache_response, compress_response
from app.middleware.logging import log_request, log_error, log_user_action
from app.utils.audit_log import write_audit_log, ACTION_ROLE_CHANGED
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
            profile_id = user.id  # Use user_uid format for consistency
            timestamp = datetime.utcnow().isoformat()
            profile_data = {
                'id': profile_id,
                'profile_id': profile_id,  # Explicitly set for easier lookup
                'user_id': user.id,
                'first_name': getattr(user, 'first_name', ''),
                'last_name': getattr(user, 'last_name', ''),
                'email': getattr(user, 'email', ''),
                'phone_number': getattr(user, 'phone_number', ''),
                'created_at': timestamp,
                'updated_at': timestamp
            }
            # Add any extra fields from data not already handled
            for k, v in data.items():
                if k not in ['user_type', 'first_name', 'last_name', 'phone_number', 'email']:
                    profile_data[k] = v
            
            db.collection('profiles').document(profile_id).set(profile_data)
            
            # Create role-specific profile doc
            if required_role == 'employer':
                db.collection('employer_profiles').document(profile_id).set({**profile_data})
                logger.info(f'Created employer profile: employer_profiles/{profile_id}')
            elif required_role == 'housegirl':
                db.collection('housegirl_profiles').document(profile_id).set({
                    **profile_data,
                    'is_available': True,
                    'unlock_count': 0,
                    'activation_fee_paid': False,
                    'in_demand_alert': False
                })
                logger.info(f'Created housegirl profile: housegirl_profiles/{profile_id}')
        
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
        mode = data.get('mode', 'login')

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

            if mode == 'signup' and stored_user_type:
                return jsonify({
                    'status': 'account_exists',
                    'user_type': stored_user_type,
                    'message': f'This number is already registered as an {stored_user_type}. Would you like to sign in instead?'
                }), 200

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

            # Ensure role-specific profile doc exists for returning users
            if stored_user_type in ('employer', 'housegirl'):
                collection = 'employer_profiles' if stored_user_type == 'employer' else 'housegirl_profiles'
                role_doc = db.collection(collection).document(user_id).get()
                if not role_doc.exists:
                    role_profile = {
                        'id': user_id,
                        'profile_id': user_id,
                        'user_id': user_id,
                        'first_name': existing_data.get('first_name', ''),
                        'last_name': existing_data.get('last_name', ''),
                        'email': email_safe,
                        'phone_number': phone_number,
                        'created_at': timestamp,
                        'updated_at': timestamp,
                    }
                    db.collection(collection).document(user_id).set(role_profile)
                    logger.info(f'Created missing profile doc: {collection}/{user_id}')
        else:
            if mode == 'login':
                return jsonify({
                    'status': 'not_found',
                    'message': 'No account found. Please create an account first.'
                }), 200
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
            profile_id = f"user_{uid}"
            profile_data = {
                'id': profile_id,
                'profile_id': profile_id,
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
        final_user_data = user_doc_ref.get().to_dict() or {}
        final_user_data['id'] = user_id
        final_user_data['uid'] = uid
        final_user_data['firebase_uid'] = uid
        final_user_data['user_type'] = user_type_to_return
        if not final_user_data.get('display_name'):
            final_user_data['display_name'] = (
                display_name_safe or f"{final_user_data.get('first_name', '')} {final_user_data.get('last_name', '')}".strip()
            )

        return jsonify({
            'message': 'Phone verification successful',
            'status': 'ok',
            'user_type': user_type_to_return,
            'user': final_user_data
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

        old_user_type = getattr(user, 'user_type', None)
        write_audit_log(
            user_id=getattr(user, 'id'),
            action=ACTION_ROLE_CHANGED,
            details={'old_role': old_user_type, 'new_role': user_type},
        )

        return jsonify({
            'user_type': user_type,
            'success': True
        }), 200
    except Exception as e:
        logger.error(f'update_role error: {str(e)}')
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

        # Log user action before clearing session
        if user_id:
            log_user_action(user_id, 'logout')

        # Clear session
        session.clear()
        
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
        try:
            user = User.get_user_with_profile(user_id)
        except Exception as db_error:
            logger.warning(f'check_session: Firestore unavailable, preserving session for {user_id}: {str(db_error)}')
            return jsonify({'user': None}), 200

        if not user:
            session.clear()
            return jsonify({'user': None}), 200

        return jsonify({'user': user.get_full_profile_data()}), 200

    except Exception as e:
        logger.error(f'check_session error: {str(e)}')
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


@auth_bp.route('/password-reset', methods=['POST'])
@rate_limit_by_email(max_requests=4, window_seconds=3600)  # 4 requests per email per hour
@log_request()
def request_password_reset():
    """
    Proxy Firebase password-reset email.
    Rate-limited to 4 requests per email address per hour.
    """
    try:
        data = request.get_json() or {}
        email = (data.get('email') or '').strip()

        if not email:
            return jsonify({'error': 'Email address is required.'}), 400

        # Basic format check (full validation is done by Firebase)
        import re as _re
        if not _re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
            return jsonify({'error': 'Invalid email address.'}), 400

        try:
            from firebase_admin import auth as firebase_admin_auth
            link = firebase_admin_auth.generate_password_reset_link(email)
            # In a production setup you would send `link` via your own email provider.
            # For now we let Firebase send the default email.
            logger.info(f'Password-reset requested for email hash (not logged for privacy).')
        except Exception as fb_err:
            # Log the technical detail server-side only; return generic message to client
            logger.error(f'password_reset Firebase error: {str(fb_err)}')

        # Always return the same response to prevent email enumeration
        return jsonify({
            'message': 'If that email is registered you will receive a password-reset link shortly.'
        }), 200

    except Exception as e:
        logger.error(f'password_reset error: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500