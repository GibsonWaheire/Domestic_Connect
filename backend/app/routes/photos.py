from flask import Blueprint, request, jsonify, abort, Response
from app.services.auth_service import firebase_auth_required
from app.firebase_init import db, get_storage_bucket
from app.utils.audit_log import write_audit_log, ACTION_FILE_DELETED
import uuid
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
photos_bp = Blueprint('photos', __name__)

MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB

_MAGIC_SIGNATURES: dict[bytes, str] = {
    b'\xff\xd8\xff': 'image/jpeg',
    b'\x89PNG': 'image/png',
    b'GIF87a': 'image/gif',
    b'GIF89a': 'image/gif',
}

_EXT_TO_MIME = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
}


def _detect_mime(header: bytes) -> str | None:
    if header[:4] == b'RIFF' and header[8:12] == b'WEBP':
        return 'image/webp'
    for sig, mime in _MAGIC_SIGNATURES.items():
        if header[:len(sig)] == sig:
            return mime
    return None


def allowed_file(filename: str) -> bool:
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif', 'webp'}


@photos_bp.route('/upload', methods=['POST'])
@firebase_auth_required
def upload_photo():
    """Upload a profile photo to Firebase Storage and return a public backend proxy URL."""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401

        if 'photo' not in request.files:
            return jsonify({'error': 'No photo file provided'}), 400

        file = request.files['photo']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: jpg, jpeg, png, gif, webp'}), 400

        # Size check
        file.seek(0, 2)
        file_size = file.tell()
        file.seek(0)
        if file_size > MAX_UPLOAD_BYTES:
            return jsonify({'error': 'File too large. Maximum size is 5 MB.'}), 413

        # MIME validation
        header = file.read(12)
        file.seek(0)
        detected_mime = _detect_mime(header)
        if not detected_mime:
            return jsonify({'error': 'File content does not match an allowed image type.'}), 400

        ext = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{ext}"
        storage_path = f"profile-photos/{getattr(user, 'id')}/{unique_filename}"

        # Upload to Firebase Storage
        bucket = get_storage_bucket()
        blob = bucket.blob(storage_path)
        file.seek(0)
        blob.upload_from_file(file, content_type=detected_mime)
        logger.info(f'Uploaded to Firebase Storage: {storage_path}')

        # Store metadata in Firestore
        profiles_ref = list(
            db.collection('profiles').where('user_id', '==', getattr(user, 'id')).limit(1).stream()
        )
        profile_id = profiles_ref[0].to_dict().get('id') if profiles_ref else None

        photo_id = str(uuid.uuid4())
        # The photo_url is the backend proxy path — publicly accessible, no auth needed
        proxy_url = f"/api/photos/file/{getattr(user, 'id')}/{unique_filename}"
        photo_data = {
            'id': photo_id,
            'profile_id': profile_id,
            'storage_path': storage_path,
            'photo_url': proxy_url,
            'is_primary': request.form.get('is_primary', False) in ['true', 'True', '1', True],
            'upload_date': datetime.utcnow().isoformat(),
            'owner_user_id': getattr(user, 'id'),
        }
        db.collection('photos').document(photo_id).set(photo_data)

        return jsonify({
            'message': 'Photo uploaded successfully',
            'photo_id': photo_id,
            'photo_url': proxy_url,
        }), 201

    except Exception as e:
        logger.error(f'upload_photo error: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500


@photos_bp.route('/file/<user_id>/<filename>', methods=['GET'])
def serve_photo(user_id: str, filename: str):
    """Proxy-serve a profile photo from Firebase Storage — publicly accessible."""
    try:
        # Basic safety: no path traversal
        safe_filename = os.path.basename(filename)
        if not safe_filename or safe_filename != filename:
            abort(400)

        storage_path = f"profile-photos/{user_id}/{safe_filename}"
        bucket = get_storage_bucket()
        blob = bucket.blob(storage_path)

        if not blob.exists():
            abort(404)

        image_bytes = blob.download_as_bytes()

        # Determine content type from extension
        ext = safe_filename.rsplit('.', 1)[-1].lower() if '.' in safe_filename else ''
        content_type = _EXT_TO_MIME.get(ext, 'image/jpeg')

        return Response(
            image_bytes,
            status=200,
            mimetype=content_type,
            headers={
                'Cache-Control': 'public, max-age=31536000',
                'Content-Length': str(len(image_bytes)),
            }
        )

    except Exception as e:
        logger.error(f'serve_photo error: {str(e)}')
        abort(404)


@photos_bp.route('/<photo_id>', methods=['DELETE'])
@firebase_auth_required
def delete_photo(photo_id):
    """Delete a photo from Firebase Storage and Firestore."""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401

        photo_doc = db.collection('photos').document(photo_id).get()
        if not photo_doc.exists:
            return jsonify({'error': 'Photo not found'}), 404

        photo = photo_doc.to_dict()

        owner_user_id = photo.get('owner_user_id')
        if owner_user_id:
            is_owner = (owner_user_id == getattr(user, 'id'))
        else:
            prof_doc = db.collection('profiles').document(photo.get('profile_id', '')).get()
            is_owner = prof_doc.exists and prof_doc.to_dict().get('user_id') == getattr(user, 'id')

        if not is_owner and not getattr(user, 'is_admin', False):
            return jsonify({'error': 'Unauthorized'}), 403

        # Delete from Firebase Storage
        storage_path = photo.get('storage_path')
        if storage_path:
            try:
                bucket = get_storage_bucket()
                blob = bucket.blob(storage_path)
                if blob.exists():
                    blob.delete()
            except Exception as del_err:
                logger.warning(f'Could not delete from Storage: {del_err}')

        db.collection('photos').document(photo_id).delete()

        write_audit_log(
            user_id=getattr(user, 'id'),
            action=ACTION_FILE_DELETED,
            details={'photo_id': photo_id, 'storage_path': storage_path},
        )

        return jsonify({'message': 'Photo deleted successfully'}), 200

    except Exception as e:
        logger.error(f'delete_photo error: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500


@photos_bp.route('/profile/<profile_id>', methods=['GET'])
def get_profile_photos(profile_id):
    """Get all photo metadata for a profile."""
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
