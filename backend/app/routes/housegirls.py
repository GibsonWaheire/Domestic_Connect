from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required
from app.firebase_init import db
from datetime import datetime
import uuid

housegirls_bp = Blueprint('housegirls', __name__)

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
        for housegirl in paginated:
            first_name = ""
            last_name = ""
            phone_number = ""
            
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

            result.append({
                'id': housegirl.get('id'),
                'profile_id': profile_id,
                'age': housegirl.get('age'),
                'bio': housegirl.get('bio'),
                'current_location': housegirl.get('current_location'),
                'location': housegirl.get('location'),
                'education': housegirl.get('education'),
                'experience': housegirl.get('experience'),
                'expected_salary': housegirl.get('expected_salary'),
                'accommodation_type': housegirl.get('accommodation_type'),
                'tribe': housegirl.get('tribe'),
                'is_available': housegirl.get('is_available'),
                'profile_photo_url': housegirl.get('profile_photo_url'),
                'first_name': first_name,
                'last_name': last_name,
                'phone_number': phone_number,
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
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@housegirls_bp.route('/<housegirl_id>', methods=['GET'])
def get_housegirl(housegirl_id):
    """Get specific housegirl profile"""
    try:
        hg_doc = db.collection('housegirl_profiles').document(housegirl_id).get()
        if not hg_doc.exists:
            return jsonify({'error': 'Housegirl not found'}), 404
            
        housegirl = hg_doc.to_dict()
        
        first_name = ""
        last_name = ""
        phone_number = ""
        
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
        
        return jsonify({
            'id': housegirl.get('id'),
            'profile_id': profile_id,
            'age': housegirl.get('age'),
            'bio': housegirl.get('bio'),
            'current_location': housegirl.get('current_location'),
            'location': housegirl.get('location'),
            'education': housegirl.get('education'),
            'experience': housegirl.get('experience'),
            'expected_salary': housegirl.get('expected_salary'),
            'accommodation_type': housegirl.get('accommodation_type'),
            'tribe': housegirl.get('tribe'),
            'is_available': housegirl.get('is_available'),
            'profile_photo_url': housegirl.get('profile_photo_url'),
            'first_name': first_name,
            'last_name': last_name,
            'phone_number': phone_number,
            'created_at': housegirl.get('created_at'),
            'updated_at': housegirl.get('updated_at')
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

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
            'profile_photo_url': data.get('profile_photo_url'),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        db.collection('housegirl_profiles').document(housegirl_id).set(housegirl_data)
        
        return jsonify(housegirl_data), 201
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@housegirls_bp.route('/<housegirl_id>', methods=['PUT'])
@firebase_auth_required
def update_housegirl(housegirl_id):
    """Update housegirl profile"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        hg_doc = db.collection('housegirl_profiles').document(housegirl_id).get()
        if not hg_doc.exists:
            return jsonify({'error': 'Housegirl not found'}), 404
            
        housegirl = hg_doc.to_dict()
        
        # Check authorization
        authorized = getattr(user, 'is_admin', False)
        if not authorized:
            prof_doc = db.collection('profiles').document(housegirl.get('profile_id')).get()
            if prof_doc.exists and prof_doc.to_dict().get('user_id') == getattr(user, 'id'):
                authorized = True
                
        if not authorized:
            return jsonify({'error': 'Unauthorized'}), 403
            
        data = request.get_json()
        updates = {}
        
        fields = ['age', 'bio', 'current_location', 'location', 'education', 
                  'experience', 'expected_salary', 'accommodation_type', 
                  'tribe', 'is_available', 'profile_photo_url']
                  
        for field in fields:
            if field in data:
                updates[field] = data[field]
                
        if updates:
            updates['updated_at'] = datetime.utcnow().isoformat()
            db.collection('housegirl_profiles').document(housegirl_id).update(updates)
            
        updated_doc = db.collection('housegirl_profiles').document(housegirl_id).get()
        return jsonify(updated_doc.to_dict()), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@housegirls_bp.route('/<housegirl_id>', methods=['DELETE'])
@firebase_auth_required
def delete_housegirl(housegirl_id):
    """Delete housegirl profile"""
    try:
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
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
