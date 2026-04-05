"""
Alert admins when a new agency operator registers (pending marketplace verification).

Firestore: ``admin_notifications`` documents for the admin dashboard.
Optional email: set ``ADMIN_ALERT_EMAIL`` and ``SMTP_*`` environment variables.
"""
import logging
import os
import smtplib
import uuid
from datetime import datetime
from email.message import EmailMessage

from app.utils.audit_log import write_audit_log, ACTION_AGENCY_SIGNUP_PENDING

logger = logging.getLogger(__name__)


def _send_admin_email(subject: str, text_body: str) -> None:
    recipients_raw = (os.environ.get('ADMIN_ALERT_EMAIL') or '').strip()
    if not recipients_raw:
        return
    smtp_host = (os.environ.get('SMTP_HOST') or '').strip()
    if not smtp_host:
        logger.warning('ADMIN_ALERT_EMAIL is set but SMTP_HOST is missing; skipping admin email')
        return

    smtp_port = int(os.environ.get('SMTP_PORT') or '587')
    smtp_user = (os.environ.get('SMTP_USER') or '').strip()
    smtp_password = (os.environ.get('SMTP_PASSWORD') or '').strip()
    smtp_from = (os.environ.get('SMTP_FROM') or smtp_user or 'noreply@localhost').strip()

    recipients = [r.strip() for r in recipients_raw.split(',') if r.strip()]
    if not recipients:
        return

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = smtp_from
    msg['To'] = ', '.join(recipients)
    msg.set_content(text_body)

    try:
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, 465) as smtp:
                if smtp_user:
                    smtp.login(smtp_user, smtp_password)
                smtp.send_message(msg)
        else:
            with smtplib.SMTP(smtp_host, smtp_port) as smtp:
                smtp.ehlo()
                if (os.environ.get('SMTP_STARTTLS', 'true').lower() in ('1', 'true', 'yes')):
                    smtp.starttls()
                    smtp.ehlo()
                if smtp_user:
                    smtp.login(smtp_user, smtp_password)
                smtp.send_message(msg)
    except Exception as exc:
        logger.error('Failed to send admin alert email: %s', exc)


def notify_new_agency_operator_signup(
    user_id: str,
    email: str,
    agency_name: str,
    first_name: str,
    last_name: str,
    *,
    source: str = 'self_signup',
) -> None:
    from app.firebase_init import db

    display = (agency_name or '').strip() or f'{first_name} {last_name}'.strip() or (email or 'Agency user')
    safe_email = email or '—'
    message = (
        f'{display} ({safe_email}) registered as an agency operator and is pending verification. '
        f'Review the operator under Users (agency) and link or verify their marketplace listing under Agencies.'
    )
    nid = str(uuid.uuid4())
    ts = datetime.utcnow().isoformat()
    title = 'New agency signup — pending verification'

    try:
        db.collection('admin_notifications').document(nid).set({
            'id': nid,
            'type': 'agency_signup_pending',
            'title': title,
            'message': message,
            'user_id': user_id,
            'email': safe_email if safe_email != '—' else '',
            'agency_name': agency_name or '',
            'source': source,
            'read': False,
            'created_at': ts,
        })
    except Exception as exc:
        logger.error('Failed to write admin_notification: %s', exc)
        return

    try:
        write_audit_log(
            user_id,
            ACTION_AGENCY_SIGNUP_PENDING,
            {'email': email, 'agency_name': agency_name, 'source': source},
            performed_by=user_id,
        )
    except Exception:
        pass

    body = f'{message}\n\nUser ID: {user_id}\nSource: {source}'
    _send_admin_email(title, body)
