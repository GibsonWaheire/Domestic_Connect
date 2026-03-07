from flask import Blueprint, request, jsonify, current_app
from app.services.auth_service import firebase_auth_required
from app.firebase_init import db
import uuid
import os
from datetime import datetime
from werkzeug.utils import secure_filename

photos_bp = Blueprint('photos', __name__)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}

@photos_bp.route('/upload', methods=['POST'])
@firebase_auth_required
def upload_photo():
    """Upload a photo for user profile"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        profiles_ref = list(db.collection('profiles').where('user_id', '==', getattr(user, 'id')).limit(1).stream())
        if not profiles_ref:
            return jsonify({'error': 'Profile not found'}), 404
            
        profile_doc = profiles_ref[0]
        profile_data = profile_doc.to_dict()
        
        if 'photo' not in request.files:
            return jsonify({'error': 'No photo file provided'}), 400
        
        file = request.files['photo']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Generate unique filename
            unique_filename = f"{uuid.uuid4()}_{filename}"
            
            # Save file in user-specific isolated folder
            upload_base_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
            user_upload_folder = os.path.join(upload_base_folder, str(getattr(user, 'id')))
            
            # Ensure the user's isolated upload directory exists
            os.makedirs(user_upload_folder, exist_ok=True)
            
            file_path = os.path.join(user_upload_folder, unique_filename)
            file.save(file_path)
            
            # Create photo record
            photo_id = str(uuid.uuid4())
            photo_data = {
                'id': photo_id,
                'profile_id': profile_data.get('id'),
                'photo_url': f"/uploads/{getattr(user, 'id')}/{unique_filename}",
                'is_primary': request.form.get('is_primary', False) in ['true', 'True', '1', True],
                'upload_date': datetime.utcnow().isoformat()
            }
            
            db.collection('photos').document(photo_id).set(photo_data)
            
            return jsonify({
                'message': 'Photo uploaded successfully',
                'photo_id': photo_id,
                'photo_url': photo_data['photo_url']
            }), 201
        
        return jsonify({'error': 'Invalid file type'}), 400
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@photos_bp.route('/<photo_id>', methods=['DELETE'])
@firebase_auth_required
def delete_photo(photo_id):
    """Delete a photo"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        photo_doc = db.collection('photos').document(photo_id).get()
        if not photo_doc.exists:
            return jsonify({'error': 'Photo not found'}), 404
            
        photo = photo_doc.to_dict()
        
        # Check if user owns this photo via profile
        prof_doc = db.collection('profiles').document(photo.get('profile_id')).get()
        if not prof_doc.exists or prof_doc.to_dict().get('user_id') != getattr(user, 'id'):
             if not getattr(user, 'is_admin', False):
                 return jsonify({'error': 'Unauthorized'}), 403
        
        # Delete file from filesystem
        photo_url = photo.get('photo_url')
        if photo_url:
            upload_base_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
            # The URL usually contains /uploads/user_id/filename
            # Extract just the filename to combine with base
            filename = photo_url.split('/')[-1]
            user_id = photo_url.split('/')[-2]
            
            file_path = os.path.join(upload_base_folder, user_id, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # Delete from database
        db.collection('photos').document(photo_id).delete()
        
        return jsonify({'message': 'Photo deleted successfully'}), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@photos_bp.route('/profile/<profile_id>', methods=['GET'])
def get_profile_photos(profile_id):
    """Get all photos for a profile"""
    try:
        photos_ref = db.collection('photos').where('profile_id', '==', profile_id).stream()
        
        result = []
        for doc in photos_ref:
            photo = doc.to_dict()
            result.append({
                'id': photo.get('id'),
                'photo_url': photo.get('photo_url'),
                'is_primary': photo.get('is_primary', False),
                'upload_date': photo.get('upload_date')
            })
        
        return jsonify({'photos': result}), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
