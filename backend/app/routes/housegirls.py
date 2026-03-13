from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required, verify_firebase_token
from app.firebase_init import db
from datetime import datetime
import uuid
import logging


logger = logging.getLogger(__name__)
housegirls_bp = Blueprint('housegirls', __name__)


def normalize_id(uid):
    if not uid:
        return None
    if uid.startswith('user_'):
        return uid
    return f'user_{uid}'


def get_authenticated_user_id_from_request():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    firebase_user = verify_firebase_token(token)
    if not firebase_user:
        return None
    user_doc = db.collection('users').where('firebase_uid', '==', firebase_user.get('uid')).limit(1).stream()
    user = next(user_doc, None)
    if not user:
        return None
    return user.to_dict().get('id')


def has_contact_access(current_user_id, housegirl_id):
    if not current_user_id or not housegirl_id:
        return False
    housegirl_doc = db.collection('housegirl_profiles').document(housegirl_id).get()
    if not housegirl_doc.exists:
        return False
    target_profile_id = housegirl_doc.to_dict().get('profile_id')
    if not target_profile_id:
        return False
    access_docs = list(
        db.collection('contact_access')
        .where('user_id', '==', current_user_id)
        .where('target_profile_id', '==', target_profile_id)
        .limit(1)
        .stream()
    )
    return len(access_docs) > 0


def get_unlock_count(housegirl_id, target_profile_id=None):
    if not housegirl_id:
        return 0
    count = len(
        list(
            db.collection('contact_access')
            .where('housegirl_id', '==', housegirl_id)
            .stream()
        )
    )
    if count > 0:
        return count
    if not target_profile_id:
        return 0
    return len(
        list(
            db.collection('contact_access')
            .where('target_profile_id', '==', target_profile_id)
            .stream()
        )
    )

@housegirls_bp.route('/', methods=['GET'])
def get_housegirls():
    """Get all housegirl profiles with filtering"""
    try:
        # Query parameters for filtering
        location = request.args.get('location', '').lower()
        education = request.args.get('education')
        experience = request.args.get('experience')
        accommodation_type = request.args.get('accommodation_type')
        tribe = request.args.get('tribe', '').lower()
        min_salary = request.args.get('min_salary', type=int)
        max_salary = request.args.get('max_salary', type=int)
        is_available = request.args.get('is_available')
        
        # Firestore does not easily support multi-field ranges and ilike without advanced indexes
        # So we fetch the base set and filter locally if it's too complex.
        query = db.collection('housegirl_profiles')
        
        if education:
            query = query.where('education', '==', education)
        if experience:
            query = query.where('experience', '==', experience)
        if accommodation_type:
            query = query.where('accommodation_type', '==', accommodation_type)
            
        if is_available is not None:
            # Convert string to boolean
            is_avail_bool = str(is_available).lower() in ['true', '1', 't', 'y', 'yes']
            query = query.where('is_available', '==', is_avail_bool)

        docs = query.stream()
        all_housegirls = [doc.to_dict() for doc in docs]
        
        # Apply in-memory filters for fields requiring ilike or complex ranges
        filtered = []
        for hg in all_housegirls:
            if location:
                loc = hg.get('location', '').lower()
                curr_loc = hg.get('current_location', '').lower()
                if location not in loc and location not in curr_loc:
                    continue
            if tribe:
                hg_tribe = hg.get('tribe', '').lower()
                if tribe not in hg_tribe:
                    continue
            if min_salary is not None:
                if hg.get('expected_salary', 0) < min_salary:
                    continue
            if max_salary is not None:
                if hg.get('expected_salary', 0) > max_salary:
                    continue
            filtered.append(hg)
            
        # Pagination
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        total = len(filtered)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated = filtered[start_idx:end_idx]
        
        result = []
        current_user_id = get_authenticated_user_id_from_request()
        for housegirl in paginated:
            first_name = ""
            last_name = ""
            phone_number = ""
            email = ""
            
            profile_id = housegirl.get('profile_id')
            if profile_id:
                prof_doc = db.collection('profiles').document(profile_id).get()
                if prof_doc.exists:
                    prof_data = prof_doc.to_dict()
                    user_id = prof_data.get('user_id')
                    if user_id:
                        user_doc = db.collection('users').document(user_id).get()
                        if user_doc.exists:
                            u_data = user_doc.to_dict()
                            first_name = u_data.get('first_name', '')
                            last_name = u_data.get('last_name', '')
                            phone_number = u_data.get('phone_number', '')
                            email = u_data.get('email', '')

            housegirl_id = housegirl.get('id')
            can_view_contact = has_contact_access(current_user_id, housegirl_id)
            unlock_count = get_unlock_count(housegirl_id, profile_id)
            computed_is_available = unlock_count < 3

            result.append({
                'id': housegirl_id,
                'profile_id': profile_id,
                'name': f"{first_name} {last_name}".strip(),
                'role': 'housegirl',
                'skills': housegirl.get('skills', []),
                'rate': housegirl.get('expected_salary'),
                'photo': housegirl.get('profile_photo_url'),
                'availability': computed_is_available,
                'age': housegirl.get('age'),
                'bio': housegirl.get('bio'),
                'current_location': housegirl.get('current_location'),
                'location': housegirl.get('location'),
                'education': housegirl.get('education'),
                'experience': housegirl.get('experience'),
                'expected_salary': housegirl.get('expected_salary'),
                'accommodation_type': housegirl.get('accommodation_type'),
                'tribe': housegirl.get('tribe'),
                'is_available': computed_is_available,
                'unlock_count': unlock_count,
                'in_demand_alert': housegirl.get('in_demand_alert', False),
                'activation_fee_paid': housegirl.get('activation_fee_paid', False),
                'profile_photo_url': housegirl.get('profile_photo_url'),
                'first_name': first_name,
                'last_name': last_name,
                'phone': phone_number if can_view_contact else 'Unlock to view',
                'email': email if can_view_contact else 'Unlock to view',
                'created_at': housegirl.get('created_at'),
                'updated_at': housegirl.get('updated_at')
            })
        
        return jsonify({
            'housegirls': result,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page if per_page else 0,
                'has_next': end_idx < total,
                'has_prev': page > 1
            }
        }), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@housegirls_bp.route('/<housegirl_id>', methods=['GET'])
def get_housegirl(housegirl_id):
    """Get specific housegirl profile"""
    try:
        normalized_id = normalize_id(housegirl_id)
        hg_doc = db.collection('housegirl_profiles').document(normalized_id).get()
        housegirl_id = normalized_id
        if not hg_doc.exists:
            firebase_uid = normalized_id.replace('user_', '', 1) if normalized_id else ''
            fallback_results = (
                db.collection('housegirl_profiles')
                .where('user_id', '==', f'user_{firebase_uid}')
                .limit(1)
                .stream()
            )
            hg_doc = next(fallback_results, None)
            if not hg_doc:
                return jsonify({'error': 'Housegirl not found'}), 404
            housegirl_id = hg_doc.id
            
        housegirl = hg_doc.to_dict()
        logger.info(f'Profile read: {hg_doc.reference.path}')
        
        first_name = ""
        last_name = ""
        phone_number = ""
        email = ""
        
        profile_id = housegirl.get('profile_id')
        if profile_id:
            prof_doc = db.collection('profiles').document(profile_id).get()
            if prof_doc.exists:
                prof_data = prof_doc.to_dict()
                user_id = prof_data.get('user_id')
                if user_id:
                    user_doc = db.collection('users').document(user_id).get()
                    if user_doc.exists:
                        u_data = user_doc.to_dict()
                        first_name = u_data.get('first_name', '')
                        last_name = u_data.get('last_name', '')
                        phone_number = u_data.get('phone_number', '')
                        email = u_data.get('email', '')
        current_user_id = get_authenticated_user_id_from_request()
        can_view_contact = has_contact_access(current_user_id, housegirl_id)
        unlock_count = get_unlock_count(housegirl_id, profile_id)
        computed_is_available = unlock_count < 3
        
        return jsonify({
            'id': housegirl.get('id'),
            'profile_id': profile_id,
            'name': f"{first_name} {last_name}".strip(),
            'role': 'housegirl',
            'skills': housegirl.get('skills', []),
            'rate': housegirl.get('expected_salary'),
            'photo': housegirl.get('profile_photo_url'),
            'availability': computed_is_available,
            'age': housegirl.get('age'),
            'bio': housegirl.get('bio'),
            'current_location': housegirl.get('current_location'),
            'location': housegirl.get('location'),
            'education': housegirl.get('education'),
            'experience': housegirl.get('experience'),
            'expected_salary': housegirl.get('expected_salary'),
            'accommodation_type': housegirl.get('accommodation_type'),
            'tribe': housegirl.get('tribe'),
            'is_available': computed_is_available,
            'unlock_count': unlock_count,
            'in_demand_alert': housegirl.get('in_demand_alert', False),
            'activation_fee_paid': housegirl.get('activation_fee_paid', False),
            'profile_photo_url': housegirl.get('profile_photo_url'),
            'first_name': first_name,
            'last_name': last_name,
            'phone': phone_number if can_view_contact else 'Unlock to view',
            'email': email if can_view_contact else 'Unlock to view',
            'created_at': housegirl.get('created_at'),
            'updated_at': housegirl.get('updated_at')
        }), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@housegirls_bp.route('/', methods=['POST'])
@firebase_auth_required
def create_housegirl():
    """Create new housegirl profile"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['profile_id', 'age', 'location', 'education', 'experience', 'expected_salary']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        prof_doc = db.collection('profiles').document(data['profile_id']).get()
        if not prof_doc.exists:
            return jsonify({'error': 'Profile not found'}), 404
            
        prof_data = prof_doc.to_dict()
        
        if prof_data.get('user_id') != getattr(user, 'id') and not getattr(user, 'is_admin', False):
            return jsonify({'error': 'Unauthorized'}), 403
            
        # Create housegirl profile
        housegirl_id = str(uuid.uuid4())
        housegirl_data = {
            'id': housegirl_id,
            'profile_id': data['profile_id'],
            'age': data['age'],
            'bio': data.get('bio', ''),
            'current_location': data.get('current_location', data['location']),
            'location': data['location'],
            'education': data['education'],
            'experience': data['experience'],
            'expected_salary': data['expected_salary'],
            'accommodation_type': data.get('accommodation_type', 'live_in'),
            'tribe': data.get('tribe', ''),
            'is_available': data.get('is_available', True),
            'unlock_count': data.get('unlock_count', 0),
            'in_demand_alert': data.get('in_demand_alert', False),
            'activation_fee_paid': data.get('activation_fee_paid', False),
            'profile_photo_url': data.get('profile_photo_url'),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        db.collection('housegirl_profiles').document(housegirl_id).set(housegirl_data)
        
        return jsonify(housegirl_data), 201
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@housegirls_bp.route('/<housegirl_id>', methods=['PUT'])
@firebase_auth_required
def update_housegirl(housegirl_id):
    """Update housegirl profile"""
    try:
        housegirl_id = normalize_id(housegirl_id)
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        doc_ref = db.collection('housegirl_profiles').document(housegirl_id)
        hg_doc = doc_ref.get()
        
        firebase_uid = (request.firebase_user or {}).get('uid')
        normalized_id = normalize_id(firebase_uid)
        is_admin = bool(getattr(user, 'is_admin', False))
        if housegirl_id != normalized_id and not is_admin:
            return jsonify({'error': 'Forbidden'}), 403
            
        data = request.get_json() or {}
        BLOCKED_FIELDS = ['unlock_count', 'is_available', 'in_demand_alert']
        for field in BLOCKED_FIELDS:
            data.pop(field, None)
        if 'monthly_rate' in data and 'expected_salary' not in data:
            data['expected_salary'] = data.get('monthly_rate')
        if 'photo_url' in data and 'profile_photo_url' not in data:
            data['profile_photo_url'] = data.get('photo_url')
        if 'community' in data and 'tribe' not in data:
            data['tribe'] = data.get('community')
        updates = {}
        
        fields = [
            'age', 'bio', 'current_location', 'location', 'education',
            'experience', 'expected_salary', 'accommodation_type',
            'tribe', 'profile_photo_url', 'activation_fee_paid',
            'full_name', 'role', 'skills', 'monthly_rate',
            'photo_url', 'phone_number', 'languages'
        ]
                  
        for field in fields:
            if field in data:
                updates[field] = data[field]
                
        if updates:
            timestamp = datetime.utcnow().isoformat()
            updates['updated_at'] = timestamp
            user_updates = {}
            full_name = (data.get('full_name') or '').strip()
            if full_name:
                name_parts = full_name.split(' ')
                user_updates['first_name'] = name_parts[0]
                user_updates['last_name'] = ' '.join(name_parts[1:]).strip() if len(name_parts) > 1 else ''
            if 'phone_number' in data:
                user_updates['phone_number'] = data.get('phone_number')
            if user_updates:
                user_updates['updated_at'] = timestamp
                db.collection('users').document(getattr(user, 'id')).set(user_updates, merge=True)

            profile_docs = list(
                db.collection('profiles')
                .where('user_id', '==', getattr(user, 'id'))
                .limit(1)
                .stream()
            )
            if profile_docs and not (hg_doc.to_dict() if hg_doc.exists else {}).get('profile_id'):
                updates['profile_id'] = profile_docs[0].to_dict().get('id')
            if not hg_doc.exists:
                updates['user_id'] = getattr(user, 'id')

            if hg_doc.exists:
                doc_ref.update(updates)
            else:
                doc_ref.set({
                    'id': housegirl_id,
                    'created_at': timestamp,
                    **updates
                })
            logger.info(f'Profile saved: {doc_ref.path} -> {updates}')

        updated_doc = doc_ref.get()
        if not updated_doc.exists:
            logger.error(f'Write verification failed: {doc_ref.path}')
            return jsonify({'error': 'Save failed — profile could not be verified after write.'}), 500
        return jsonify(updated_doc.to_dict()), 200

    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@housegirls_bp.route('/<housegirl_id>', methods=['DELETE'])
@firebase_auth_required
def delete_housegirl(housegirl_id):
    """Delete housegirl profile"""
    try:
        housegirl_id = normalize_id(housegirl_id)
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        hg_doc = db.collection('housegirl_profiles').document(housegirl_id).get()
        if not hg_doc.exists:
            return jsonify({'error': 'Housegirl not found'}), 404
            
        housegirl = hg_doc.to_dict()
        
        authorized = getattr(user, 'is_admin', False)
        if not authorized:
            prof_doc = db.collection('profiles').document(housegirl.get('profile_id')).get()
            if prof_doc.exists and prof_doc.to_dict().get('user_id') == getattr(user, 'id'):
                authorized = True
                
        if not authorized:
            return jsonify({'error': 'Unauthorized'}), 403
            
        db.collection('housegirl_profiles').document(housegirl_id).delete()
        
        return jsonify({'message': 'Housegirl profile deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500
