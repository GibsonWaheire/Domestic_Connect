from flask import Blueprint, request, jsonify, current_app, send_from_directory, abort
from app.services.auth_service import firebase_auth_required
from app.firebase_init import db
from app.utils.audit_log import write_audit_log, ACTION_FILE_DELETED
import uuid
import os
from datetime import datetime
from werkzeug.utils import secure_filename
import logging


logger = logging.getLogger(__name__)
photos_bp = Blueprint('photos', __name__)

MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB

# Magic-byte signatures for allowed image types
_MAGIC_SIGNATURES: dict[bytes, str] = {
    b'\xff\xd8\xff': 'image/jpeg',
    b'\x89PNG': 'image/png',
    b'GIF87a': 'image/gif',
    b'GIF89a': 'image/gif',
}


def _detect_mime(header: bytes) -> str | None:
    """Return MIME type derived from file magic bytes, or None if unrecognised."""
    if header[:4] == b'RIFF' and header[8:12] == b'WEBP':
        return 'image/webp'
    for sig, mime in _MAGIC_SIGNATURES.items():
        if header[:len(sig)] == sig:
            return mime
    return None


def allowed_file(filename: str) -> bool:
    """Check if the file extension is in the allowed set."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif', 'webp'}


@photos_bp.route('/upload', methods=['POST'])
@firebase_auth_required
def upload_photo():
    """Upload a photo for user profile"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401

        profiles_ref = list(
            db.collection('profiles').where('user_id', '==', getattr(user, 'id')).limit(1).stream()
        )
        if not profiles_ref:
            return jsonify({'error': 'Profile not found'}), 404

        profile_doc = profiles_ref[0]
        profile_data = profile_doc.to_dict()

        if 'photo' not in request.files:
            return jsonify({'error': 'No photo file provided'}), 400

        file = request.files['photo']

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: jpg, jpeg, png, gif, webp'}), 400

        # --- Server-side size check ---
        file.seek(0, 2)          # seek to end
        file_size = file.tell()
        file.seek(0)             # reset to start
        if file_size > MAX_UPLOAD_BYTES:
            return jsonify({'error': 'File too large. Maximum size is 5 MB.'}), 413

        # --- Server-side MIME validation via magic bytes ---
        header = file.read(12)
        file.seek(0)
        detected_mime = _detect_mime(header)
        if not detected_mime:
            return jsonify({'error': 'File content does not match an allowed image type.'}), 400

        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"

        # Save file in user-specific isolated folder
        upload_base_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        user_upload_folder = os.path.join(upload_base_folder, str(getattr(user, 'id')))
        os.makedirs(user_upload_folder, exist_ok=True)

        file_path = os.path.join(user_upload_folder, unique_filename)
        file.save(file_path)

        # Create photo record
        photo_id = str(uuid.uuid4())
        photo_data = {
            'id': photo_id,
            'profile_id': profile_data.get('id'),
            'photo_url': f"/api/photos/file/{getattr(user, 'id')}/{unique_filename}",
            'is_primary': request.form.get('is_primary', False) in ['true', 'True', '1', True],
            'upload_date': datetime.utcnow().isoformat(),
            'owner_user_id': getattr(user, 'id'),
        }

        db.collection('photos').document(photo_id).set(photo_data)

        return jsonify({
            'message': 'Photo uploaded successfully',
            'photo_id': photo_id,
            'photo_url': photo_data['photo_url'],
        }), 201

    except Exception as e:
        logger.error(f'upload_photo error: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500


@photos_bp.route('/file/<user_id>/<filename>', methods=['GET'])
@firebase_auth_required
def serve_photo(user_id: str, filename: str):
    """Serve a photo — only the owning user (or an admin) may access it."""
    try:
        current_user = request.current_user
        if not current_user:
            abort(401)

        requester_id = getattr(current_user, 'id', None)
        is_admin = getattr(current_user, 'is_admin', False)

        if requester_id != user_id and not is_admin:
            abort(403)

        upload_base_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        user_folder = os.path.join(upload_base_folder, user_id)

        # Prevent path traversal
        safe_filename = os.path.basename(filename)
        file_path = os.path.join(user_folder, safe_filename)
        if not os.path.abspath(file_path).startswith(os.path.abspath(user_folder)):
            abort(400)

        return send_from_directory(user_folder, safe_filename)

    except Exception as e:
        logger.error(f'serve_photo error: {str(e)}')
        abort(500)


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

        # Ownership check: compare stored owner_user_id or fall back to profile lookup
        owner_user_id = photo.get('owner_user_id')
        if owner_user_id:
            is_owner = (owner_user_id == getattr(user, 'id'))
        else:
            prof_doc = db.collection('profiles').document(photo.get('profile_id', '')).get()
            is_owner = prof_doc.exists and prof_doc.to_dict().get('user_id') == getattr(user, 'id')

        if not is_owner and not getattr(user, 'is_admin', False):
            return jsonify({'error': 'Unauthorized'}), 403

        # Delete file from filesystem
        photo_url = photo.get('photo_url', '')
        if photo_url:
            upload_base_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
            parts = photo_url.split('/')
            if len(parts) >= 2:
                file_owner_id = parts[-2]
                fname = parts[-1]
                file_path = os.path.join(upload_base_folder, file_owner_id, fname)
                if os.path.exists(file_path):
                    os.remove(file_path)

        db.collection('photos').document(photo_id).delete()

        write_audit_log(
            user_id=getattr(user, 'id'),
            action=ACTION_FILE_DELETED,
            details={'photo_id': photo_id, 'photo_url': photo_url},
        )

        return jsonify({'message': 'Photo deleted successfully'}), 200

    except Exception as e:
        logger.error(f'delete_photo error: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500


@photos_bp.route('/profile/<profile_id>', methods=['GET'])
def get_profile_photos(profile_id):
    """Get all photos for a profile (public metadata only — no raw files)"""
    try:
        photos_ref = db.collection('photos').where('profile_id', '==', profile_id).stream()

        result = []
        for doc in photos_ref:
            photo = doc.to_dict()
            result.append({
                'id': photo.get('id'),
                'photo_url': photo.get('photo_url'),
                'is_primary': photo.get('is_primary', False),
                'upload_date': photo.get('upload_date'),
            })

        return jsonify({'photos': result}), 200

    except Exception as e:
        logger.error(f'get_profile_photos error: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500
