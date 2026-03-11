from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required
from app.models import User, Profile, EmployerProfile, HousegirlProfile, AgencyProfile
from app.firebase_init import db
import uuid
from datetime import datetime
import logging


logger = logging.getLogger(__name__)
profiles_bp = Blueprint('profiles', __name__)

@profiles_bp.route('/', methods=['GET'])
@firebase_auth_required
def get_all_profiles():
    """Get all profiles for the current user"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        # Firestore Pagination isn't directly 1:1 with SQLAlchemy paginate
        # For a single user, they almost always just have 1 profile anyway, 
        # but we'll fetch all matching and manual slice
        profiles_ref = db.collection('profiles').where('user_id', '==', getattr(user, 'id')).stream()
        all_profiles = [p.to_dict() for p in profiles_ref]
        
        # Pagination slice
        total = len(all_profiles)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated = all_profiles[start_idx:end_idx]
        
        result = []
        for p_data in paginated:
            profile_id = p_data.get('id')
            
            profile_dict = {
                'id': profile_id,
                'user_id': p_data.get('user_id'),
                'user_type': getattr(user, 'user_type', None),
                'first_name': getattr(user, 'first_name', None),
                'last_name': getattr(user, 'last_name', None),
                'email': getattr(user, 'email', None),
                'phone_number': getattr(user, 'phone_number', None),
                'created_at': p_data.get('created_at'),
                'updated_at': p_data.get('updated_at')
            }
            
            # Fetch type-specific data depending on the associated user's type
            user_type = getattr(user, 'user_type', '')
            if user_type == 'employer':
                emp_ref = db.collection('employer_profiles').where('profile_id', '==', profile_id).limit(1).stream()
                for doc in emp_ref:
                    emp_data = doc.to_dict()
                    profile_dict['employer'] = {
                        'company_name': emp_data.get('company_name'),
                        'location': emp_data.get('location'),
                        'description': emp_data.get('description')
                    }
                    break
            elif user_type == 'housegirl':
                hg_ref = db.collection('housegirl_profiles').where('profile_id', '==', profile_id).limit(1).stream()
                for doc in hg_ref:
                    hg_data = doc.to_dict()
                    profile_dict['housegirl'] = {
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
                        'profile_photo_url': hg_data.get('profile_photo_url')
                    }
                    break
            elif user_type == 'agency':
                ag_ref = db.collection('agency_profiles').where('profile_id', '==', profile_id).limit(1).stream()
                for doc in ag_ref:
                    ag_data = doc.to_dict()
                    profile_dict['agency'] = {
                        'agency_name': ag_data.get('agency_name'),
                        'location': ag_data.get('location'),
                        'description': ag_data.get('description'),
                        'license_number': ag_data.get('license_number')
                    }
                    break
            
            result.append(profile_dict)
            
        return jsonify({
            'profiles': result,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page,
                'has_next': end_idx < total,
                'has_prev': page > 1
            }
        }), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@profiles_bp.route('/<profile_id>', methods=['GET'])
@firebase_auth_required
def get_profile(profile_id):
    """Get specific profile by ID (must own the profile)"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        profile_doc = db.collection('profiles').document(profile_id).get()
        if not profile_doc.exists:
            return jsonify({'error': 'Not found'}), 404
            
        profile_data = profile_doc.to_dict()
        
        # Ensure the user requesting the profile actually owns it
        if profile_data.get('user_id') != getattr(user, 'id'):
            return jsonify({'error': 'Unauthorized to access this profile'}), 403
            
        result_data = {
            'id': profile_data.get('id'),
            'user_id': profile_data.get('user_id'),
            'user_type': getattr(user, 'user_type', None),
            'first_name': getattr(user, 'first_name', None),
            'last_name': getattr(user, 'last_name', None),
            'email': getattr(user, 'email', None),
            'phone_number': getattr(user, 'phone_number', None),
            'created_at': profile_data.get('created_at'),
            'updated_at': profile_data.get('updated_at')
        }
        
        # Add type-specific data
        user_type = getattr(user, 'user_type', '')
        if user_type == 'employer':
            emp_ref = db.collection('employer_profiles').where('profile_id', '==', profile_id).limit(1).stream()
            for doc in emp_ref:
                emp_data = doc.to_dict()
                result_data['employer'] = {
                    'company_name': emp_data.get('company_name'),
                    'location': emp_data.get('location'),
                    'description': emp_data.get('description')
                }
                break
        elif user_type == 'housegirl':
            hg_ref = db.collection('housegirl_profiles').where('profile_id', '==', profile_id).limit(1).stream()
            for doc in hg_ref:
                hg_data = doc.to_dict()
                result_data['housegirl'] = {
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
                    'profile_photo_url': hg_data.get('profile_photo_url')
                }
                break
        elif user_type == 'agency':
            ag_ref = db.collection('agency_profiles').where('profile_id', '==', profile_id).limit(1).stream()
            for doc in ag_ref:
                ag_data = doc.to_dict()
                result_data['agency'] = {
                    'agency_name': ag_data.get('agency_name'),
                    'location': ag_data.get('location'),
                    'description': ag_data.get('description'),
                    'license_number': ag_data.get('license_number')
                }
                break
        
        return jsonify(result_data), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@profiles_bp.route('/', methods=['POST'])
@firebase_auth_required
def create_profile():
    """Create a new profile"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        data = request.get_json()
        
        # Check if profile already exists
        existing_profiles = list(db.collection('profiles').where('user_id', '==', getattr(user, 'id')).limit(1).stream())
        if existing_profiles:
            return jsonify({'error': 'Profile already exists'}), 400
        
        # Create base profile
        profile_id = str(uuid.uuid4())
        profile_data = {
            'id': profile_id,
            'user_id': getattr(user, 'id'),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        db.collection('profiles').document(profile_id).set(profile_data)
        
        # Create type-specific profile
        user_type = getattr(user, 'user_type', '')
        if user_type == 'employer':
            emp_id = str(uuid.uuid4())
            employer_data = {
                'id': emp_id,
                'profile_id': profile_id,
                'company_name': data.get('company_name', ''),
                'location': data.get('location', ''),
                'description': data.get('description', ''),
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            db.collection('employer_profiles').document(emp_id).set(employer_data)
            
        elif user_type == 'housegirl':
            hg_id = str(uuid.uuid4())
            housegirl_data = {
                'id': hg_id,
                'profile_id': profile_id,
                'age': data.get('age'),
                'bio': data.get('bio', ''),
                'current_location': data.get('current_location', ''),
                'location': data.get('location', ''),
                'education': data.get('education', ''),
                'experience': data.get('experience', ''),
                'expected_salary': data.get('expected_salary'),
                'accommodation_type': data.get('accommodation_type', ''),
                'tribe': data.get('tribe', ''),
                'is_available': data.get('is_available', True),
                'profile_photo_url': data.get('profile_photo_url'),
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            db.collection('housegirl_profiles').document(hg_id).set(housegirl_data)
            
        elif user_type == 'agency':
            ag_id = str(uuid.uuid4())
            agency_data = {
                'id': ag_id,
                'profile_id': profile_id,
                'agency_name': data.get('agency_name', ''),
                'location': data.get('location', ''),
                'description': data.get('description', ''),
                'license_number': data.get('license_number', ''),
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            db.collection('agency_profiles').document(ag_id).set(agency_data)
        
        return jsonify({
            'message': 'Profile created successfully',
            'profile_id': profile_id
        }), 201
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@profiles_bp.route('/<profile_id>', methods=['PUT'])
@firebase_auth_required
def update_profile(profile_id):
    """Update profile information"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        data = request.get_json()
        
        # Verify profile exists and user owns it
        profile_doc = db.collection('profiles').document(profile_id).get()
        if not profile_doc.exists:
            return jsonify({'error': 'Profile not found'}), 404
            
        if profile_doc.to_dict().get('user_id') != getattr(user, 'id'):
            return jsonify({'error': 'Unauthorized'}), 403
        
        user_type = getattr(user, 'user_type', '')
        
        # Helper to update nested doc if allowed
        def update_typed_doc(collection_name, allowed_fields):
            docs = list(db.collection(collection_name).where('profile_id', '==', profile_id).limit(1).stream())
            if not docs:
                return
            
            doc_id = docs[0].id
            updates = {k: data[k] for k in allowed_fields if k in data}
            if updates:
                updates['updated_at'] = datetime.utcnow().isoformat()
                db.collection(collection_name).document(doc_id).update(updates)
                
        # Update type-specific profile
        if user_type == 'employer':
            update_typed_doc('employer_profiles', ['company_name', 'location', 'description'])
                
        elif user_type == 'housegirl':
            update_typed_doc('housegirl_profiles', ['age', 'bio', 'current_location', 'location', 
                                                    'education', 'experience', 'expected_salary', 
                                                    'accommodation_type', 'tribe', 'is_available', 
                                                    'profile_photo_url'])
                
        elif user_type == 'agency':
            update_typed_doc('agency_profiles', ['agency_name', 'location', 'description', 'license_number'])
        
        # Update base profile timestamp
        db.collection('profiles').document(profile_id).update({
            'updated_at': datetime.utcnow().isoformat()
        })
        
        return jsonify({'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500
