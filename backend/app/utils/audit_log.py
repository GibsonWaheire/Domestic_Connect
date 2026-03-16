"""
Audit logging utility — writes structured audit records to Firestore.
Covers: file deletion, role changes, payments, and data exports.
"""
import uuid
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Defined action constants to keep callers consistent
ACTION_FILE_DELETED = 'file_deleted'
ACTION_ROLE_CHANGED = 'role_changed'
ACTION_PAYMENT_COMPLETED = 'payment_completed'
ACTION_PAYMENT_FAILED = 'payment_failed'
ACTION_DATA_EXPORT = 'data_exported'
ACTION_USER_DEACTIVATED = 'user_deactivated'
ACTION_USER_ACTIVATED = 'user_activated'
ACTION_AGENCY_VERIFIED = 'agency_verified'
ACTION_CONTACT_UNLOCKED = 'contact_unlocked'


def write_audit_log(user_id: str, action: str, details: dict = None, performed_by: str = None) -> None:
    """
    Write an audit log entry to the Firestore `audit_logs` collection.

    Args:
        user_id:      The user the action was performed *on* (or who owns the resource).
        action:       One of the ACTION_* constants (or any descriptive string).
        details:      Optional dict with contextual data (IDs, old/new values, etc.).
        performed_by: The user who triggered the action. Defaults to user_id (self-action).
    """
    # Import here to avoid circular imports at module load time
    from app.firebase_init import db

    try:
        log_id = str(uuid.uuid4())
        entry = {
            'id': log_id,
            'user_id': user_id,
            'action': action,
            'details': details or {},
            'performed_by': performed_by or user_id,
            'timestamp': datetime.utcnow().isoformat(),
        }
        db.collection('audit_logs').document(log_id).set(entry)
    except Exception as exc:
        # Never let audit logging crash the main request
        logger.error(f'[audit_log] Failed to write audit log (action={action}): {exc}')
