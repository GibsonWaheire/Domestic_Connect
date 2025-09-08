from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required
from app.models import Photo, Profile
from app import db
import uuid
import os
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
        
        if not user.profile:
            return jsonify({'error': 'Profile not found'}), 404
        
        if 'photo' not in request.files:
            return jsonify({'error': 'No photo file provided'}), 400
        
        file = request.files['photo']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Generate unique filename
            unique_filename = f"{uuid.uuid4()}_{filename}"
            
            # Save file
            upload_folder = current_app.config['UPLOAD_FOLDER']
            file_path = os.path.join(upload_folder, unique_filename)
            file.save(file_path)
            
            # Create photo record
            photo = Photo(
                id=str(uuid.uuid4()),
                profile_id=user.profile.id,
                photo_url=f"/uploads/{unique_filename}",
                is_primary=request.form.get('is_primary', False)
            )
            
            db.session.add(photo)
            db.session.commit()
            
            return jsonify({
                'message': 'Photo uploaded successfully',
                'photo_id': photo.id,
                'photo_url': photo.photo_url
            }), 201
        
        return jsonify({'error': 'Invalid file type'}), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@photos_bp.route('/<photo_id>', methods=['DELETE'])
@firebase_auth_required
def delete_photo(photo_id):
    """Delete a photo"""
    try:
        user = request.current_user
        
        photo = Photo.query.get_or_404(photo_id)
        
        # Check if user owns this photo
        if photo.profile.user_id != user.id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Delete file from filesystem
        if photo.photo_url:
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 
                                  photo.photo_url.split('/')[-1])
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # Delete from database
        db.session.delete(photo)
        db.session.commit()
        
        return jsonify({'message': 'Photo deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@photos_bp.route('/profile/<profile_id>', methods=['GET'])
def get_profile_photos(profile_id):
    """Get all photos for a profile"""
    try:
        photos = Photo.query.filter_by(profile_id=profile_id).all()
        
        result = []
        for photo in photos:
            result.append({
                'id': photo.id,
                'photo_url': photo.photo_url,
                'is_primary': photo.is_primary,
                'upload_date': photo.upload_date.isoformat()
            })
        
        return jsonify({'photos': result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
