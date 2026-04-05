from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required, admin_required
from app.firebase_init import db
from app.utils.audit_log import write_audit_log, ACTION_USER_DEACTIVATED, ACTION_USER_ACTIVATED, ACTION_AGENCY_VERIFIED, ACTION_DATA_EXPORT, ACTION_ROLE_CHANGED
from firebase_admin import auth as firebase_admin_auth
from datetime import datetime, timedelta
import json
import logging


logger = logging.getLogger(__name__)
admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@firebase_auth_required
@admin_required
def get_dashboard_stats():
    """Get admin dashboard statistics"""
    try:
        # Basic counts
        users_ref = list(db.collection('users').stream())
        total_users = len(users_ref)
        
        total_employers = sum(1 for u in users_ref if u.to_dict().get('user_type') == 'employer')
        total_housegirls = sum(1 for u in users_ref if u.to_dict().get('user_type') == 'housegirl')
        total_agencies = sum(1 for u in users_ref if u.to_dict().get('user_type') == 'agency')
        
        # Active users (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        thirty_days_iso = thirty_days_ago.isoformat()
        active_users = sum(1 for u in users_ref if u.to_dict().get('updated_at', '') >= thirty_days_iso)
        
        # Agency statistics
        agencies_ref = list(db.collection('agencies').stream())
        total_agencies_marketplace = len(agencies_ref)
        verified_agencies = sum(1 for a in agencies_ref if a.to_dict().get('verification_status') == 'verified')
        
        # Payment statistics
        total_packages = len(list(db.collection('payment_packages').stream()))
        
        purchases_ref = list(db.collection('user_purchases').stream())
        total_purchases = len(purchases_ref)
        total_revenue = sum(p.to_dict().get('amount', 0) for p in purchases_ref)
        
        # Recent activity
        sorted_users = sorted([u.to_dict() for u in users_ref], key=lambda x: x.get('created_at', ''), reverse=True)
        recent_users = sorted_users[:5]
        
        sorted_purchases = sorted([p.to_dict() for p in purchases_ref], key=lambda x: x.get('purchase_date', ''), reverse=True)
        recent_purchases = sorted_purchases[:5]
        
        # Monthly growth
        current_month = datetime.utcnow().replace(day=1).isoformat()
        monthly_users = sum(1 for u in sorted_users if u.get('created_at', '') >= current_month)
        
        return jsonify({
            'overview': {
                'total_users': total_users,
                'total_employers': total_employers,
                'total_housegirls': total_housegirls,
                'total_agencies': total_agencies,
                'active_users': active_users,
                'monthly_users': monthly_users
            },
            'agencies': {
                'total_agencies': total_agencies_marketplace,
                'verified_agencies': verified_agencies,
                'pending_verification': total_agencies_marketplace - verified_agencies
            },
            'payments': {
                'total_packages': total_packages,
                'total_purchases': total_purchases,
                'total_revenue': float(total_revenue)
            },
            'recent_activity': {
                'users': [{
                    'id': user.get('id'),
                    'email': user.get('email'),
                    'user_type': user.get('user_type'),
                    'first_name': user.get('first_name'),
                    'last_name': user.get('last_name'),
                    'created_at': user.get('created_at')
                } for user in recent_users],
                'purchases': [{
                    'id': purchase.get('id'),
                    'user_id': purchase.get('user_id'),
                    'amount': purchase.get('amount'),
                    'status': purchase.get('status'),
                    'purchase_date': purchase.get('purchase_date')
                } for purchase in recent_purchases]
            }
        }), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@admin_bp.route('/users', methods=['GET'])
@firebase_auth_required
@admin_required
def get_all_users():
    """Get all users with pagination"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        user_type = request.args.get('user_type')
        search = request.args.get('search', '').lower()
        
        query = db.collection('users')
        if user_type:
            query = query.where('user_type', '==', user_type)
            
        docs = list(query.stream())
        all_users = [doc.to_dict() for doc in docs]
        
        if search:
            all_users = [
                u for u in all_users 
                if search in u.get('email', '').lower() 
                or search in u.get('first_name', '').lower() 
                or search in u.get('last_name', '').lower()
            ]
            
        # sort by created_at desc
        all_users.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        total = len(all_users)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated = all_users[start_idx:end_idx]
        
        # Check profiles
        result = []
        for user in paginated:
            prof_docs = list(db.collection('profiles').where('user_id', '==', user.get('id')).limit(1).stream())
            has_profile = len(prof_docs) > 0
            
            result.append({
                'id': user.get('id'),
                'email': user.get('email'),
                'user_type': user.get('user_type'),
                'first_name': user.get('first_name'),
                'last_name': user.get('last_name'),
                'phone_number': user.get('phone_number'),
                'is_active': user.get('is_active', True),
                'is_admin': user.get('is_admin', False),
                'created_at': user.get('created_at'),
                'updated_at': user.get('updated_at'),
                'has_profile': has_profile
            })
        
        return jsonify({
            'users': result,
            'pagination': {
                'page': page,
                'pages': (total + per_page - 1) // per_page if per_page else 0,
                'per_page': per_page,
                'total': total,
                'has_next': end_idx < total,
                'has_prev': page > 1
            }
        }), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500


@admin_bp.route('/users', methods=['POST'])
@firebase_auth_required
@admin_required
def admin_create_user():
    """Provision Firebase Auth + Firestore user (employer / housegirl / agency)."""
    try:
        data = request.get_json() or {}
        email = (data.get('email') or '').strip()
        password = data.get('password') or ''
        first_name = (data.get('first_name') or '').strip()
        last_name = (data.get('last_name') or '').strip()
        phone_raw = (data.get('phone_number') or '').strip()
        phone_number = phone_raw or None
        user_type = data.get('user_type')

        if not email or '@' not in email:
            return jsonify({'error': 'A valid email is required.'}), 400
        if len(password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters.'}), 400
        if user_type not in ('employer', 'housegirl', 'agency'):
            return jsonify({'error': 'user_type must be employer, housegirl, or agency.'}), 400
        if not first_name or not last_name:
            return jsonify({'error': 'First and last name are required.'}), 400

        email_lower = email.lower()
        for u in db.collection('users').stream():
            ud = u.to_dict() or {}
            if (ud.get('email') or '').lower() == email_lower:
                return jsonify({'error': 'A user with this email already exists.'}), 409

        try:
            firebase_admin_auth.get_user_by_email(email)
            return jsonify({'error': 'This email is already registered in Firebase Auth.'}), 409
        except firebase_admin_auth.UserNotFoundError:
            pass

        display_name = f'{first_name} {last_name}'.strip()
        create_kwargs = {
            'email': email,
            'password': password,
            'email_verified': True,
        }
        if display_name:
            create_kwargs['display_name'] = display_name
        if phone_number and phone_number.startswith('+'):
            create_kwargs['phone_number'] = phone_number

        try:
            fb_user = firebase_admin_auth.create_user(**create_kwargs)
        except firebase_admin_auth.EmailAlreadyExistsError:
            return jsonify({'error': 'This email is already registered.'}), 409
        except Exception as fe:
            logger.error(f'admin_create_user Firebase create: {fe}')
            return jsonify({'error': 'Could not create authentication account. Try a different email or password.'}), 400

        uid = fb_user.uid
        user_id = f'user_{uid}'
        timestamp = datetime.utcnow().isoformat()

        try:
            firebase_admin_auth.set_custom_user_claims(uid, {'role': user_type})
        except Exception as ce:
            logger.warning(f'admin_create_user claims: {ce}')

        user_payload = {
            'id': user_id,
            'uid': uid,
            'firebase_uid': uid,
            'email': email,
            'user_type': user_type,
            'first_name': first_name,
            'last_name': last_name,
            'phone_number': phone_number,
            'is_active': True,
            'is_admin': False,
            'is_firebase_user': True,
            'profile_complete': False,
            'created_at': timestamp,
            'updated_at': timestamp,
            'created_by_admin': True,
        }

        try:
            db.collection('users').document(user_id).set(user_payload)
            _ensure_role_profile_documents(
                user_id,
                user_type,
                email,
                phone_number or '',
                first_name,
                last_name,
                timestamp,
            )
        except Exception as db_err:
            logger.error(f'admin_create_user Firestore rollback: {db_err}')
            try:
                firebase_admin_auth.delete_user(uid)
            except Exception:
                pass
            return jsonify({'error': 'Failed to save user profile. Authentication account was rolled back.'}), 500

        admin_user = getattr(request, 'current_user', None)
        write_audit_log(
            user_id=user_id,
            action='user_created_by_admin',
            details={'email': email, 'user_type': user_type},
            performed_by=getattr(admin_user, 'id', 'unknown_admin'),
        )

        return jsonify({
            'message': 'User created successfully.',
            'user': {
                'id': user_id,
                'email': email,
                'user_type': user_type,
                'first_name': first_name,
                'last_name': last_name,
            },
            'sign_in': {
                'path': '/login',
                'instructions': (
                    'User signs in at the main login page with this email and the password you set. '
                    'Email is pre-verified. Share the password securely (e.g. phone or in person); '
                    'ask them to change it after first login in account settings.'
                ),
            },
        }), 201

    except Exception as e:
        logger.error(f'admin_create_user error: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500


@admin_bp.route('/users-without-roles', methods=['GET'])
@firebase_auth_required
@admin_required
def get_users_without_roles():
    try:
        users = [u.to_dict() for u in db.collection('users').stream()]
        users_without_roles = []
        for user in users:
            user_type = user.get('user_type')
            if not user_type or str(user_type).strip() == '':
                users_without_roles.append({
                    'id': user.get('id'),
                    'uid': user.get('uid'),
                    'firebase_uid': user.get('firebase_uid'),
                    'email': user.get('email'),
                    'phone_number': user.get('phone_number'),
                    'first_name': user.get('first_name'),
                    'last_name': user.get('last_name'),
                    'created_at': user.get('created_at'),
                    'updated_at': user.get('updated_at')
                })
        return jsonify({
            'users': users_without_roles
        }), 200
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@admin_bp.route('/users/<user_id>', methods=['GET'])
@firebase_auth_required
@admin_required
def get_user_details(user_id):
    """Get detailed user information"""
    try:
        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404
            
        user = user_doc.to_dict()
        
        user_data = {
            'id': user.get('id'),
            'firebase_uid': user.get('firebase_uid'),
            'email': user.get('email'),
            'user_type': user.get('user_type'),
            'first_name': user.get('first_name'),
            'last_name': user.get('last_name'),
            'phone_number': user.get('phone_number'),
            'is_active': user.get('is_active', True),
            'is_admin': user.get('is_admin', False),
            'created_at': user.get('created_at'),
            'updated_at': user.get('updated_at')
        }
        
        # Add profile data if exists
        prof_docs = list(db.collection('profiles').where('user_id', '==', user_id).limit(1).stream())
        if prof_docs:
            prof_data = prof_docs[0].to_dict()
            profile_id = prof_data.get('id')
            user_data['profile'] = {
                'id': profile_id,
                'created_at': prof_data.get('created_at'),
                'updated_at': prof_data.get('updated_at')
            }
            
            user_type = user.get('user_type')
            if user_type == 'employer':
                emp_docs = list(db.collection('employer_profiles').where('profile_id', '==', profile_id).limit(1).stream())
                if emp_docs:
                    emp_data = emp_docs[0].to_dict()
                    user_data['profile']['employer'] = {
                        'company_name': emp_data.get('company_name'),
                        'location': emp_data.get('location'),
                        'description': emp_data.get('description')
                    }
            elif user_type == 'housegirl':
                hg_docs = list(db.collection('housegirl_profiles').where('profile_id', '==', profile_id).limit(1).stream())
                if hg_docs:
                    hg_data = hg_docs[0].to_dict()
                    user_data['profile']['housegirl'] = {
                        'age': hg_data.get('age'),
                        'bio': hg_data.get('bio'),
                        'current_location': hg_data.get('current_location'),
                        'location': hg_data.get('location'),
                        'education': hg_data.get('education'),
                        'experience': hg_data.get('experience'),
                        'expected_salary': hg_data.get('expected_salary'),
                        'accommodation_type': hg_data.get('accommodation_type'),
                        'tribe': hg_data.get('tribe'),
                        'is_available': hg_data.get('is_available'),
                        'profile_photo_url': hg_data.get('profile_photo_url'),
                        'skills': hg_data.get('skills') or [],
                        'profile_complete': hg_data.get('profile_complete', False),
                    }
            elif user_type == 'agency':
                ag_docs = list(db.collection('agency_profiles').where('profile_id', '==', profile_id).limit(1).stream())
                if ag_docs:
                    ag_data = ag_docs[0].to_dict()
                    user_data['profile']['agency'] = {
                        'agency_name': ag_data.get('agency_name'),
                        'location': ag_data.get('location'),
                        'description': ag_data.get('description'),
                        'license_number': ag_data.get('license_number')
                    }
        
        # Add purchase history
        purchases = list(db.collection('user_purchases').where('user_id', '==', user_id).stream())
        pkg_name_cache = {}

        def _package_display_name(package_id):
            if not package_id:
                return None
            if package_id in pkg_name_cache:
                return pkg_name_cache[package_id]
            pkg_doc = db.collection('payment_packages').document(str(package_id)).get()
            if pkg_doc.exists:
                name = pkg_doc.to_dict().get('name') or str(package_id)
            else:
                q = list(db.collection('payment_packages').where('id', '==', str(package_id)).limit(1).stream())
                name = q[0].to_dict().get('name', str(package_id)) if q else str(package_id)
            pkg_name_cache[package_id] = name
            return name

        user_data['purchases'] = []
        for p in purchases:
            pd = p.to_dict()
            pid = pd.get('package_id')
            user_data['purchases'].append({
                'id': pd.get('id'),
                'package_id': pid,
                'package_name': _package_display_name(pid),
                'amount': pd.get('amount'),
                'status': pd.get('status'),
                'purchase_date': pd.get('purchase_date'),
                'payment_reference': pd.get('payment_reference')
            })

        return jsonify(user_data), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@admin_bp.route('/users/<user_id>/promote', methods=['PUT'])
@firebase_auth_required
@admin_required
def promote_user(user_id):
    """Grant or revoke admin privileges for a user"""
    try:
        data = request.get_json() or {}
        make_admin = bool(data.get('is_admin', True))

        user_doc_ref = db.collection('users').document(user_id)
        user_doc = user_doc_ref.get()
        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404

        user_data = user_doc.to_dict() or {}
        firebase_uid = user_data.get('firebase_uid') or user_data.get('uid')

        timestamp = datetime.utcnow().isoformat()
        user_doc_ref.set({
            'is_admin': make_admin,
            'user_type': 'admin' if make_admin else (user_data.get('user_type') or 'employer'),
            'updated_at': timestamp,
        }, merge=True)

        # Sync Firebase custom claim
        if firebase_uid:
            try:
                new_role = 'admin' if make_admin else (user_data.get('user_type') or 'employer')
                firebase_admin_auth.set_custom_user_claims(firebase_uid, {'role': new_role})
            except Exception as claim_err:
                logger.warning(f'Could not update custom claim for {firebase_uid}: {claim_err}')

        action = 'promoted_to_admin' if make_admin else 'revoked_admin'
        admin_user = getattr(request, 'current_user', None)
        write_audit_log(
            user_id=user_id,
            action=action,
            details={'is_admin': make_admin},
            performed_by=getattr(admin_user, 'id', 'unknown'),
        )

        return jsonify({
            'message': f'User {"promoted to admin" if make_admin else "admin access revoked"}',
            'user_id': user_id,
            'is_admin': make_admin,
        }), 200

    except Exception as e:
        logger.error(f'promote_user error: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500


@admin_bp.route('/users/<user_id>/toggle-status', methods=['PUT'])
@firebase_auth_required
@admin_required
def toggle_user_status(user_id):
    """Toggle user active status"""
    try:
        user_doc_ref = db.collection('users').document(user_id)
        user_doc = user_doc_ref.get()
        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404
            
        user = user_doc.to_dict()
        new_status = not user.get('is_active', True)
        
        user_doc_ref.update({'is_active': new_status})

        admin_user = getattr(request, 'current_user', None)
        admin_id = getattr(admin_user, 'id', 'unknown_admin')
        write_audit_log(
            user_id=user_id,
            action=ACTION_USER_ACTIVATED if new_status else ACTION_USER_DEACTIVATED,
            details={'new_is_active': new_status},
            performed_by=admin_id,
        )

        return jsonify({
            'message': f'User {"activated" if new_status else "deactivated"} successfully',
            'user': {
                'id': user.get('id'),
                'email': user.get('email'),
                'is_active': new_status
            }
        }), 200

    except Exception as e:
        logger.error(f'toggle_user_status error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500


def _housegirl_profile_ref_for_user(user_id):
    doc = db.collection('housegirl_profiles').document(user_id).get()
    if doc.exists:
        return db.collection('housegirl_profiles').document(user_id)
    for d in db.collection('housegirl_profiles').where('user_id', '==', user_id).limit(10).stream():
        return db.collection('housegirl_profiles').document(d.id)
    profs = list(db.collection('profiles').where('user_id', '==', user_id).limit(1).stream())
    if profs:
        pid = profs[0].to_dict().get('id')
        if pid:
            for d in db.collection('housegirl_profiles').where('profile_id', '==', pid).limit(1).stream():
                return db.collection('housegirl_profiles').document(d.id)
    return None


def _delete_subdocs_by_user_id(collection_name, user_id):
    for d in db.collection(collection_name).where('user_id', '==', user_id).stream():
        d.reference.delete()
    ref = db.collection(collection_name).document(user_id)
    snap = ref.get()
    if snap.exists:
        ref.delete()


def _ensure_role_profile_documents(user_id, user_type, user_email, user_phone, first_name, last_name, timestamp):
    """Create profiles + role-specific profile doc when missing (employer / housegirl / agency)."""
    profile_docs = list(db.collection('profiles').where('user_id', '==', user_id).limit(1).stream())
    if profile_docs:
        profile_id = profile_docs[0].to_dict().get('id') or profile_docs[0].id
        db.collection('profiles').document(profile_docs[0].id).set({'updated_at': timestamp}, merge=True)
    else:
        profile_id = user_id
        db.collection('profiles').document(profile_id).set({
            'id': profile_id,
            'profile_id': profile_id,
            'user_id': user_id,
            'first_name': first_name,
            'last_name': last_name,
            'email': user_email,
            'phone_number': user_phone,
            'created_at': timestamp,
            'updated_at': timestamp,
        })

    role_collection = {
        'employer': 'employer_profiles',
        'housegirl': 'housegirl_profiles',
        'agency': 'agency_profiles',
    }[user_type]
    role_doc = db.collection(role_collection).document(profile_id).get()
    if not role_doc.exists:
        role_profile = {
            'id': profile_id,
            'profile_id': profile_id,
            'user_id': user_id,
            'first_name': first_name,
            'last_name': last_name,
            'email': user_email,
            'phone_number': user_phone,
            'created_at': timestamp,
            'updated_at': timestamp,
        }
        if user_type == 'housegirl':
            role_profile.update({
                'is_available': True,
                'unlock_count': 0,
                'activation_fee_paid': False,
                'in_demand_alert': False,
            })
        elif user_type == 'agency':
            role_profile.update({
                'agency_name': '',
                'location': '',
                'description': None,
                'license_number': None,
            })
        db.collection(role_collection).document(profile_id).set(role_profile)


@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@firebase_auth_required
@admin_required
def delete_user(user_id):
    try:
        admin_user = getattr(request, 'current_user', None)
        admin_id = getattr(admin_user, 'id', None)
        if admin_id and admin_id == user_id:
            return jsonify({'error': 'You cannot delete your own account'}), 400

        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404

        user_data = user_doc.to_dict() or {}
        firebase_uid = user_data.get('firebase_uid') or user_data.get('uid')

        for ps in db.collection('profiles').where('user_id', '==', user_id).stream():
            pdata = ps.to_dict() or {}
            prof_key = pdata.get('id') or ps.id
            if prof_key:
                for coll in ('employer_profiles', 'housegirl_profiles', 'agency_profiles'):
                    db.collection(coll).document(prof_key).delete()
            ps.reference.delete()

        for coll in ('employer_profiles', 'housegirl_profiles', 'agency_profiles'):
            _delete_subdocs_by_user_id(coll, user_id)

        for p in db.collection('user_purchases').where('user_id', '==', user_id).stream():
            p.reference.delete()

        user_ref.delete()

        if firebase_uid:
            try:
                firebase_admin_auth.delete_user(firebase_uid)
            except Exception as fe:
                logger.warning(f'Firebase Auth delete_user failed for {firebase_uid}: {fe}')

        write_audit_log(
            user_id=user_id,
            action='user_deleted',
            details={'email': user_data.get('email')},
            performed_by=admin_id or 'unknown_admin',
        )

        return jsonify({'message': 'User deleted', 'user_id': user_id}), 200
    except Exception as e:
        logger.error(f'delete_user error: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500


@admin_bp.route('/users/<user_id>/assign-role', methods=['POST'])
@firebase_auth_required
@admin_required
def admin_assign_user_role(user_id):
    try:
        data = request.get_json() or {}
        user_type = data.get('user_type')
        if user_type not in ('employer', 'housegirl', 'agency'):
            return jsonify({'error': 'Invalid user_type'}), 400

        user_doc_ref = db.collection('users').document(user_id)
        user_doc = user_doc_ref.get()
        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404

        user_data = user_doc.to_dict() or {}
        old_type = user_data.get('user_type')
        timestamp = datetime.utcnow().isoformat()
        user_doc_ref.set({
            'user_type': user_type,
            'updated_at': timestamp,
        }, merge=True)

        user_email = user_data.get('email', '') or ''
        user_phone = user_data.get('phone_number', '') or ''
        first_name = user_data.get('first_name', '') or ''
        last_name = user_data.get('last_name', '') or ''

        _ensure_role_profile_documents(
            user_id, user_type, user_email, user_phone, first_name, last_name, timestamp
        )

        firebase_uid = user_data.get('firebase_uid') or user_data.get('uid')
        if firebase_uid:
            try:
                firebase_admin_auth.set_custom_user_claims(firebase_uid, {'role': user_type})
            except Exception as claim_err:
                logger.warning(f'Could not update custom claim for {firebase_uid}: {claim_err}')

        admin_user = getattr(request, 'current_user', None)
        write_audit_log(
            user_id=user_id,
            action=ACTION_ROLE_CHANGED,
            details={'old_role': old_type, 'new_role': user_type, 'source': 'admin_assign'},
            performed_by=getattr(admin_user, 'id', 'unknown_admin'),
        )

        return jsonify({'success': True, 'user_type': user_type}), 200
    except Exception as e:
        logger.error(f'admin_assign_user_role error: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500


@admin_bp.route('/housegirls/<user_id>', methods=['PATCH'])
@firebase_auth_required
@admin_required
def edit_housegirl_profile(user_id):
    try:
        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404
        if user_doc.to_dict().get('user_type') != 'housegirl':
            return jsonify({'error': 'User is not a housegirl'}), 400

        data = request.get_json() or {}
        allowed = {
            'bio', 'location', 'experience', 'expected_salary',
            'accommodation_type', 'skills', 'is_available', 'profile_complete',
        }
        updates = {k: v for k, v in data.items() if k in allowed}
        if not updates:
            return jsonify({'error': 'No valid fields to update'}), 400

        ref = _housegirl_profile_ref_for_user(user_id)
        if not ref:
            return jsonify({'error': 'Housegirl profile not found'}), 404

        updates['updated_at'] = datetime.utcnow().isoformat()
        ref.set(updates, merge=True)
        return jsonify({'message': 'Profile updated', 'updated': updates}), 200
    except Exception as e:
        logger.error(f'edit_housegirl_profile error: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500


@admin_bp.route('/jobs', methods=['GET'])
@firebase_auth_required
@admin_required
def get_admin_jobs():
    try:
        status_filter = request.args.get('status')
        search = (request.args.get('search') or '').lower()

        docs = list(db.collection('job_postings').stream())
        jobs = [d.to_dict() for d in docs]

        if status_filter:
            jobs = [j for j in jobs if j.get('status') == status_filter]
        if search:
            jobs = [
                j for j in jobs
                if search in (j.get('title') or '').lower()
                or search in (j.get('location') or '').lower()
            ]

        jobs.sort(key=lambda x: x.get('created_at', ''), reverse=True)

        result = []
        for job in jobs:
            emp_id = job.get('employer_id')
            emp_name = ''
            if emp_id:
                udoc = db.collection('users').document(emp_id).get()
                if udoc.exists:
                    ud = udoc.to_dict()
                    emp_name = f"{ud.get('first_name', '')} {ud.get('last_name', '')}".strip()
            jid = job.get('id')
            apps_count = len(list(db.collection('job_applications').where('job_id', '==', jid).stream()))
            result.append({
                'id': jid,
                'title': job.get('title'),
                'location': job.get('location'),
                'status': job.get('status'),
                'created_at': job.get('created_at'),
                'employer_id': emp_id,
                'employer_name': emp_name or '—',
                'applications_count': apps_count,
            })

        return jsonify({'jobs': result}), 200
    except Exception as e:
        logger.error(f'get_admin_jobs error: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500


@admin_bp.route('/jobs/<job_id>/status', methods=['PATCH'])
@firebase_auth_required
@admin_required
def patch_job_status(job_id):
    try:
        data = request.get_json() or {}
        new_status = data.get('status')
        if new_status not in ('active', 'closed', 'removed'):
            return jsonify({'error': 'Invalid status'}), 400

        job_ref = db.collection('job_postings').document(job_id)
        job_doc = job_ref.get()
        if not job_doc.exists:
            q = list(db.collection('job_postings').where('id', '==', job_id).limit(1).stream())
            if not q:
                return jsonify({'error': 'Job not found'}), 404
            job_ref = q[0].reference
            job_doc = q[0]

        job_ref.update({
            'status': new_status,
            'updated_at': datetime.utcnow().isoformat(),
        })
        return jsonify({'message': 'Status updated', 'id': job_id, 'status': new_status}), 200
    except Exception as e:
        logger.error(f'patch_job_status error: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500


@admin_bp.route('/payments', methods=['GET'])
@firebase_auth_required
@admin_required
def get_admin_payments():
    try:
        status_filter = request.args.get('status')

        purchases_raw = [p.to_dict() for p in db.collection('user_purchases').stream()]
        current_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()

        total_revenue = 0.0
        this_month_revenue = 0.0

        for p in purchases_raw:
            amt = float(p.get('amount') or 0)
            st = p.get('status') or ''
            if st == 'completed':
                total_revenue += amt
                if (p.get('purchase_date') or '') >= current_month:
                    this_month_revenue += amt

        try:
            unlocks_count = len(list(db.collection('contact_access').stream()))
        except Exception:
            unlocks_count = 0

        purchases_out = []
        users_cache = {}

        def user_email(uid):
            if not uid:
                return ''
            if uid in users_cache:
                return users_cache[uid]
            u = db.collection('users').document(uid).get()
            em = u.to_dict().get('email', '') if u.exists else ''
            users_cache[uid] = em
            return em

        pkg_cache = {}

        def pkg_name(pid):
            if not pid:
                return ''
            if pid in pkg_cache:
                return pkg_cache[pid]
            doc = db.collection('payment_packages').document(str(pid)).get()
            if doc.exists:
                name = doc.to_dict().get('name') or str(pid)
            else:
                q = list(db.collection('payment_packages').where('id', '==', str(pid)).limit(1).stream())
                name = q[0].to_dict().get('name', str(pid)) if q else str(pid)
            pkg_cache[pid] = name
            return name

        for p in sorted(purchases_raw, key=lambda x: x.get('purchase_date', ''), reverse=True):
            st = p.get('status') or ''
            if status_filter and st != status_filter:
                continue
            pid = p.get('package_id')
            purchases_out.append({
                'id': p.get('id'),
                'user_id': p.get('user_id'),
                'user_email': user_email(p.get('user_id')),
                'amount': p.get('amount'),
                'package_id': pid,
                'package_name': pkg_name(pid),
                'status': st,
                'purchase_date': p.get('purchase_date'),
            })

        return jsonify({
            'purchases': purchases_out,
            'summary': {
                'total_revenue': total_revenue,
                'this_month_revenue': this_month_revenue,
                'total_purchases': len(purchases_raw),
                'unlocks_count': unlocks_count,
            },
        }), 200
    except Exception as e:
        logger.error(f'get_admin_payments error: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500


@admin_bp.route('/agencies', methods=['GET'])
@firebase_auth_required
@admin_required
def get_all_agencies():
    """Get all agencies with verification status"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        status = request.args.get('status')
        search = request.args.get('search', '').lower()
        
        query = db.collection('agencies')
        if status:
            query = query.where('verification_status', '==', status)
            
        docs = list(query.stream())
        all_agencies = [doc.to_dict() for doc in docs]
        
        if search:
            all_agencies = [
                a for a in all_agencies
                if search in a.get('name', '').lower()
                or search in a.get('license_number', '').lower()
                or search in a.get('contact_email', '').lower()
            ]
            
        all_agencies.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        total = len(all_agencies)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated = all_agencies[start_idx:end_idx]
        
        return jsonify({
            'agencies': [{
                'id': agency.get('id'),
                'name': agency.get('name'),
                'license_number': agency.get('license_number'),
                'verification_status': agency.get('verification_status'),
                'subscription_tier': agency.get('subscription_tier'),
                'rating': agency.get('rating'),
                'location': agency.get('location'),
                'monthly_fee': agency.get('monthly_fee'),
                'commission_rate': agency.get('commission_rate'),
                'verified_workers': agency.get('verified_workers'),
                'successful_placements': agency.get('successful_placements'),
                'contact_email': agency.get('contact_email'),
                'contact_phone': agency.get('contact_phone'),
                'website': agency.get('website'),
                'created_at': agency.get('created_at'),
                'updated_at': agency.get('updated_at')
            } for agency in paginated],
            'pagination': {
                'page': page,
                'pages': (total + per_page - 1) // per_page if per_page else 0,
                'per_page': per_page,
                'total': total,
                'has_next': end_idx < total,
                'has_prev': page > 1
            }
        }), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@admin_bp.route('/agencies/<agency_id>/verify', methods=['PUT'])
@firebase_auth_required
@admin_required
def verify_agency(agency_id):
    """Verify or reject agency"""
    try:
        agency_doc_ref = db.collection('agencies').document(agency_id)
        agency_doc = agency_doc_ref.get()
        if not agency_doc.exists:
            return jsonify({'error': 'Agency not found'}), 404
            
        data = request.get_json()
        verification_status = data.get('status', 'verified')
        if verification_status not in ['verified', 'rejected', 'pending']:
            return jsonify({'error': 'Invalid verification status'}), 400
        
        agency_doc_ref.update({'verification_status': verification_status})

        admin_user = getattr(request, 'current_user', None)
        admin_id = getattr(admin_user, 'id', 'unknown_admin')
        write_audit_log(
            user_id=agency_id,
            action=ACTION_AGENCY_VERIFIED,
            details={'verification_status': verification_status, 'agency_name': agency_doc.to_dict().get('name')},
            performed_by=admin_id,
        )

        return jsonify({
            'message': f'Agency {verification_status} successfully',
            'agency': {
                'id': agency_doc.to_dict().get('id'),
                'name': agency_doc.to_dict().get('name'),
                'verification_status': verification_status
            }
        }), 200

    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@admin_bp.route('/sync', methods=['POST'])
@firebase_auth_required
@admin_required
def sync_data():
    """Admin refresh trigger — returns fresh timestamp for clients to reload stats."""
    try:
        data = request.get_json() or {}
        sync_type = data.get('sync_type') or data.get('type', 'all')
        synced_at = datetime.utcnow().isoformat()
        if sync_type not in ('all', 'users', 'agencies'):
            return jsonify({'error': 'Invalid sync type'}), 400
        return jsonify({'status': 'ok', 'synced_at': synced_at, 'sync_type': sync_type}), 200
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@admin_bp.route('/analytics', methods=['GET'])
@firebase_auth_required
@admin_required
def get_analytics():
    """Get detailed analytics data"""
    from collections import defaultdict
    try:
        admin_user = getattr(request, 'current_user', None)
        admin_id = getattr(admin_user, 'id', 'unknown_admin')
        write_audit_log(
            user_id=admin_id,
            action=ACTION_DATA_EXPORT,
            details={'endpoint': '/admin/analytics'},
            performed_by=admin_id,
        )

        users = [u.to_dict() for u in db.collection('users').stream()]
        
        user_growth_dict = defaultdict(int)
        user_types_dict = defaultdict(int)
        
        for u in users:
            # count types
            t = u.get('user_type', 'unknown')
            user_types_dict[t] += 1
            
            # format date to simple YYYY-MM-DD
            created_dt = u.get('created_at', '')[:10]
            if created_dt:
                user_growth_dict[created_dt] += 1
                
        user_growth = [{'date': k, 'count': v} for k, v in sorted(user_growth_dict.items())]
        user_types = [{'type': k, 'count': v} for k, v in user_types_dict.items()]
        
        # Revenue growth
        purchases = [p.to_dict() for p in db.collection('user_purchases').stream()]
        revenue_growth_dict = defaultdict(float)
        
        for p in purchases:
            pdate = p.get('purchase_date', '')[:10]
            if pdate:
                revenue_growth_dict[pdate] += float(p.get('amount', 0))
                
        revenue_growth = [{'date': k, 'total': v} for k, v in sorted(revenue_growth_dict.items())]
        
        # Top agencies
        agencies = [a.to_dict() for a in db.collection('agencies').stream()]
        agencies.sort(key=lambda x: x.get('successful_placements', 0), reverse=True)
        top_agencies = agencies[:10]
        
        return jsonify({
            'user_growth': user_growth,
            'user_types': user_types,
            'revenue_growth': revenue_growth,
            'top_agencies': [{
                'name': item.get('name'),
                'rating': item.get('rating'),
                'successful_placements': item.get('successful_placements'),
                'verified_workers': item.get('verified_workers')
            } for item in top_agencies]
        }), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500
