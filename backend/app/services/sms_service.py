import africastalking
import os
import random
import string
from datetime import datetime, timedelta
from app.firebase_init import db

africastalking.initialize(
    os.environ.get('AT_USERNAME'),
    os.environ.get('AT_API_KEY')
)
sms = africastalking.SMS


def generate_otp():
    return ''.join(random.choices(string.digits, k=6))


def send_otp(phone_number):
    code = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=5)

    db.collection('otp_codes').document(phone_number).set({
        'code': code,
        'expires_at': expires_at.isoformat(),
        'attempts': 0,
        'created_at': datetime.utcnow().isoformat()
    })

    sms.send(
        f'Your Domestic Connect code is: {code}. Valid for 5 minutes.',
        [phone_number],
        sender_id=os.environ.get('AT_SENDER_ID', 'DomConnect')
    )
    return {'success': True}


def verify_otp(phone_number, code):
    doc = db.collection('otp_codes').document(phone_number).get()

    if not doc.exists:
        return {'valid': False, 'error': 'Code not found'}

    data = doc.to_dict()

    if data.get('attempts', 0) >= 3:
        return {'valid': False, 'error': 'Too many attempts'}

    db.collection('otp_codes').document(phone_number).update(
        {'attempts': data.get('attempts', 0) + 1}
    )

    expires_at = datetime.fromisoformat(data['expires_at'])
    if datetime.utcnow() > expires_at:
        return {'valid': False, 'error': 'Code expired'}

    if data['code'] != code:
        return {'valid': False, 'error': 'Wrong code'}

    db.collection('otp_codes').document(phone_number).delete()
    return {'valid': True}
