from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required
from app.firebase_init import db
from datetime import datetime
import uuid
import logging


logger = logging.getLogger(__name__)
employers_bp = Blueprint('employers', __name__)


def normalize_id(uid):
    if not uid:
        return None
    if uid.startswith('user_'):
        return uid
    return f'user_{uid}'


def get_profile_id_for_user(user_id):
    profile_docs = list(
        db.collection('profiles')
        .where('user_id', '==', user_id)
        .limit(1)
        .stream()
    )
    if not profile_docs:
        return None
    return profile_docs[0].to_dict().get('id')


def find_employer_doc_for_user(user_id):
    by_user_id = next(
        db.collection('employer_profiles')
        .where('user_id', '==', user_id)
        .limit(1)
        .stream(),
        None
    )
    if by_user_id:
        return by_user_id
    profile_id = get_profile_id_for_user(user_id)
    if not profile_id:
        return None
    return next(
        db.collection('employer_profiles')
        .where('profile_id', '==', profile_id)
        .limit(1)
        .stream(),
        None
    )


@employers_bp.route('/', methods=['GET'])
def get_employers():
    """Get all employer profiles"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        # Fetch all employer profiles
        emp_profiles_ref = db.collection('employer_profiles').stream()
        all_employers = [doc.to_dict() for doc in emp_profiles_ref]
        
        # Pagination slice
        total = len(all_employers)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated = all_employers[start_idx:end_idx]
        
        result = []
        for emp in paginated:
            # We need to stitch the Profile and User data back together
            first_name = ""
            last_name = ""
            
            profile_id = emp.get('profile_id')
            if profile_id:
                prof_doc = db.collection('profiles').document(profile_id).get()
                if prof_doc.exists:
                    prof_data = prof_doc.to_dict()
                    user_id = prof_data.get('user_id')
                    if user_id:
                        user_doc = db.collection('users').document(user_id).get()
                        if user_doc.exists:
                            user_data = user_doc.to_dict()
                            first_name = user_data.get('first_name', '')
                            last_name = user_data.get('last_name', '')

            result.append({
                'id': emp.get('id'),
                'profile_id': profile_id,
                'company_name': emp.get('company_name'),
                'location': emp.get('location'),
                'description': emp.get('description'),
                'first_name': first_name,
                'last_name': last_name,
                'created_at': emp.get('created_at'),
                'updated_at': emp.get('updated_at')
            })
        
        return jsonify({
            'employers': result,
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

@employers_bp.route('/<employer_id>', methods=['GET'])
@firebase_auth_required
def get_employer(employer_id):
    """Get specific employer profile"""
    try:
        employer_id = normalize_id(employer_id)
        emp_doc = db.collection('employer_profiles').document(employer_id).get()
        resolved_employer_id = employer_id
        if not emp_doc.exists:
            fallback_doc = find_employer_doc_for_user(employer_id)
            if not fallback_doc:
                empty_profile = {
                    'id': employer_id,
                    'user_id': employer_id,
                    'full_name': '',
                    'company_name': '',
                    'location': '',
                    'description': '',
                    'phone': '',
                    'profile_photo_url': '',
                    'photo_url': '',
                    'created_at': datetime.utcnow().isoformat(),
                    'updated_at': datetime.utcnow().isoformat(),
                }
                db.collection('employer_profiles').document(employer_id).set(empty_profile)
                logger.info(f'Created empty employer profile: employer_profiles/{employer_id}')
                return jsonify(empty_profile), 200
            emp_doc = fallback_doc
            resolved_employer_id = fallback_doc.id
            
        emp = emp_doc.to_dict()
        logger.info(f'Profile read: {emp_doc.reference.path}')
        
        first_name = ""
        last_name = ""
        
        profile_id = emp.get('profile_id')
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
        
        return jsonify({
            'id': emp.get('id') or resolved_employer_id,
            'profile_id': profile_id,
            'company_name': emp.get('company_name'),
            'full_name': emp.get('full_name'),
            'phone': emp.get('phone'),
            'location': emp.get('location'),
            'description': emp.get('description'),
            'profile_photo_url': emp.get('profile_photo_url') or emp.get('photo_url'),
            'first_name': first_name,
            'last_name': last_name,
            'created_at': emp.get('created_at'),
            'updated_at': emp.get('updated_at')
        }), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@employers_bp.route('/', methods=['POST'])
@firebase_auth_required
def create_employer():
    """Create new employer profile"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['profile_id', 'company_name', 'location']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        prof_doc = db.collection('profiles').document(data['profile_id']).get()
        if not prof_doc.exists:
            return jsonify({'error': 'Profile not found'}), 404
            
        prof_data = prof_doc.to_dict()
        
        if prof_data.get('user_id') != getattr(user, 'id') and not getattr(user, 'is_admin', False):
            return jsonify({'error': 'Unauthorized'}), 403
            
        # Create employer profile
        employer_id = str(uuid.uuid4())
        employer_data = {
            'id': employer_id,
            'profile_id': data['profile_id'],
            'company_name': data['company_name'],
            'location': data['location'],
            'description': data.get('description', ''),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        db.collection('employer_profiles').document(employer_id).set(employer_data)
        
        return jsonify(employer_data), 201
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@employers_bp.route('/<employer_id>', methods=['PUT'])
@firebase_auth_required
def update_employer(employer_id):
    """Update employer profile"""
    try:
        employer_id = normalize_id(employer_id)
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        doc_ref = db.collection('employer_profiles').document(employer_id)
        emp_doc = doc_ref.get()
        if not emp_doc.exists:
            fallback_doc = find_employer_doc_for_user(employer_id)
            if fallback_doc:
                doc_ref = db.collection('employer_profiles').document(fallback_doc.id)
                emp_doc = doc_ref.get()
        emp = emp_doc.to_dict() if emp_doc.exists else {}
        
        # Check authorization
        authorized = getattr(user, 'is_admin', False)
        if not authorized and emp_doc.exists:
            prof_doc = db.collection('profiles').document(emp.get('profile_id')).get()
            if prof_doc.exists and prof_doc.to_dict().get('user_id') == getattr(user, 'id'):
                authorized = True
        elif not authorized and not emp_doc.exists:
            user_ids = {
                normalize_id(getattr(user, 'id', None)),
                normalize_id(getattr(user, 'firebase_uid', None))
            }
            if employer_id in user_ids:
                authorized = True
                
        if not authorized:
            return jsonify({'error': 'Unauthorized'}), 403
            
        data = request.get_json() or {}
        updates = {}
        
        fields = ['company_name', 'location', 'description', 'full_name', 'phone']
        for field in fields:
            if field in data:
                updates[field] = data[field]
        if 'profile_photo_url' in data or 'photo_url' in data:
            updates['profile_photo_url'] = data.get('profile_photo_url') or data.get('photo_url')
            
        if updates:
            timestamp = datetime.utcnow().isoformat()
            updates['updated_at'] = timestamp
            user_updates = {}
            full_name = (data.get('full_name') or '').strip()
            if full_name:
                name_parts = full_name.split(' ')
                user_updates['first_name'] = name_parts[0]
                user_updates['last_name'] = ' '.join(name_parts[1:]).strip() if len(name_parts) > 1 else ''
            if 'phone' in data:
                user_updates['phone_number'] = data.get('phone')
            if user_updates:
                user_updates['updated_at'] = timestamp
                db.collection('users').document(getattr(user, 'id')).set(user_updates, merge=True)

            if emp_doc.exists:
                doc_ref.update(updates)
            else:
                profile_id = get_profile_id_for_user(getattr(user, 'id'))
                doc_ref.set({
                    'id': employer_id,
                    'user_id': getattr(user, 'id'),
                    'profile_id': profile_id,
                    'created_at': timestamp,
                    **updates
                })
            logger.info(f'Profile saved: {doc_ref.path} -> {updates}')
            
        # Refetch updated
        updated_doc = doc_ref.get()
        return jsonify(updated_doc.to_dict()), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@employers_bp.route('/<employer_id>', methods=['DELETE'])
@firebase_auth_required
def delete_employer(employer_id):
    """Delete employer profile"""
    try:
        employer_id = normalize_id(employer_id)
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        emp_doc = db.collection('employer_profiles').document(employer_id).get()
        if not emp_doc.exists:
            return jsonify({'error': 'Employer not found'}), 404
            
        emp = emp_doc.to_dict()
        
        authorized = getattr(user, 'is_admin', False)
        if not authorized:
            prof_doc = db.collection('profiles').document(emp.get('profile_id')).get()
            if prof_doc.exists and prof_doc.to_dict().get('user_id') == getattr(user, 'id'):
                authorized = True
                
        if not authorized:
            return jsonify({'error': 'Unauthorized'}), 403
            
        db.collection('employer_profiles').document(employer_id).delete()
        return jsonify({'message': 'Employer profile deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500
