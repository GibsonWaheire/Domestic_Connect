import os
import requests
import base64
import json
from datetime import datetime
from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required
from app.firebase_init import db
import uuid
import logging


logger = logging.getLogger(__name__)
mpesa_bp = Blueprint('mpesa', __name__)

# M-Pesa Configuration
MPESA_CONFIG = {
    'CONSUMER_KEY': os.environ.get('MPESA_CONSUMER_KEY', 'your_consumer_key'),
    'CONSUMER_SECRET': os.environ.get('MPESA_CONSUMER_SECRET', 'your_consumer_secret'),
    'PASSKEY': os.environ.get('MPESA_PASSKEY', 'your_passkey'),
    'BUSINESS_SHORT_CODE': os.environ.get('MPESA_BUSINESS_SHORT_CODE', '174379'),
    'ENVIRONMENT': os.environ.get('MPESA_ENVIRONMENT', 'sandbox'),
    'CALLBACK_URL': os.environ.get('MPESA_CALLBACK_URL', 'https://your-domain.com/api/mpesa/callback')
}

# M-Pesa API URLs
MPESA_URLS = {
    'sandbox': {
        'auth': 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        'stkPush': 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        'transactionStatus': 'https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query'
    },
    'production': {
        'auth': 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        'stkPush': 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        'transactionStatus': 'https://api.safaricom.co.ke/mpesa/transactionstatus/v1/query'
    }
}

def get_access_token():
    """Get M-Pesa access token"""
    try:
        auth_string = f"{MPESA_CONFIG['CONSUMER_KEY']}:{MPESA_CONFIG['CONSUMER_SECRET']}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')

        response = requests.get(
            MPESA_URLS[MPESA_CONFIG['ENVIRONMENT']]['auth'],
            headers={'Authorization': f'Basic {auth_b64}'}
        )

        if response.status_code == 200:
            return response.json()['access_token']
        else:
            raise Exception(f"Failed to get access token: {response.status_code}")

    except Exception as e:
        logger.error(f'get_access_token error: {str(e)}')
        raise

def get_timestamp():
    """Get current timestamp in M-Pesa format"""
    return datetime.now().strftime('%Y%m%d%H%M%S')

def generate_password():
    """Generate M-Pesa password"""
    timestamp = get_timestamp()
    password_string = f"{MPESA_CONFIG['BUSINESS_SHORT_CODE']}{MPESA_CONFIG['PASSKEY']}{timestamp}"
    password_bytes = password_string.encode('ascii')
    password_b64 = base64.b64encode(password_bytes).decode('ascii')
    return password_b64, timestamp

@mpesa_bp.route('/stkpush', methods=['POST'])
@firebase_auth_required
def stk_push():
    """Initiate M-Pesa STK Push"""
    try:
        user = request.current_user
        data = request.get_json()
        
        phone_number = data.get('phoneNumber')
        amount = data.get('amount')
        reference = data.get('reference')
        description = data.get('description')
        
        if not all([phone_number, amount, reference, description]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Format phone number (remove +254, add 254)
        if phone_number.startswith('+'):
            phone_number = phone_number[1:]
        if phone_number.startswith('254'):
            phone_number = phone_number
        elif phone_number.startswith('0'):
            phone_number = '254' + phone_number[1:]
        else:
            phone_number = '254' + phone_number
        
        # Get access token
        access_token = get_access_token()
        
        # Generate password
        password, timestamp = generate_password()
        
        # STK Push payload
        payload = {
            "BusinessShortCode": MPESA_CONFIG['BUSINESS_SHORT_CODE'],
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),
            "PartyA": phone_number,
            "PartyB": MPESA_CONFIG['BUSINESS_SHORT_CODE'],
            "PhoneNumber": phone_number,
            "CallBackURL": MPESA_CONFIG['CALLBACK_URL'],
            "AccountReference": reference,
            "TransactionDesc": description
        }
        
        # Make STK Push request
        response = requests.post(
            MPESA_URLS[MPESA_CONFIG['ENVIRONMENT']]['stkPush'],
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            },
            json=payload
        )
        
        if response.status_code == 200:
            result = response.json()
            return jsonify({
                'success': True,
                'checkoutRequestId': result.get('CheckoutRequestID'),
                'merchantRequestId': result.get('MerchantRequestID'),
                'responseCode': result.get('ResponseCode'),
                'responseDescription': result.get('ResponseDescription'),
                'customerMessage': result.get('CustomerMessage')
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'STK Push failed',
                'details': response.text
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@mpesa_bp.route('/transaction-status', methods=['POST'])
@firebase_auth_required
def transaction_status():
    """Check M-Pesa transaction status"""
    try:
        user = request.current_user
        data = request.get_json()
        
        checkout_request_id = data.get('checkoutRequestId')
        
        if not checkout_request_id:
            return jsonify({'error': 'CheckoutRequestID required'}), 400
        
        # Get access token
        access_token = get_access_token()
        
        # Generate password
        password, timestamp = generate_password()
        
        # Transaction status payload
        payload = {
            "BusinessShortCode": MPESA_CONFIG['BUSINESS_SHORT_CODE'],
            "Password": password,
            "Timestamp": timestamp,
            "CheckoutRequestID": checkout_request_id
        }
        
        # Make transaction status request
        response = requests.post(
            MPESA_URLS[MPESA_CONFIG['ENVIRONMENT']]['transactionStatus'],
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            },
            json=payload
        )
        
        if response.status_code == 200:
            result = response.json()
            return jsonify({
                'success': True,
                'resultCode': result.get('ResultCode'),
                'resultDesc': result.get('ResultDesc'),
                'transactionDetails': result.get('ResultParameters', {}).get('ResultParameter', [])
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Transaction status check failed',
                'details': response.text
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@mpesa_bp.route('/callback', methods=['POST'])
def mpesa_callback():
    """Handle M-Pesa callback — webhook secret validated via URL token."""
    try:
        data = request.get_json(silent=True) or {}

        # Verify the webhook secret token embedded in the callback URL
        webhook_secret = os.environ.get('MPESA_WEBHOOK_SECRET', '')
        provided_token = request.args.get('token', '')
        if webhook_secret and provided_token != webhook_secret:
            logger.warning('mpesa_callback: invalid webhook token rejected')
            return jsonify({'error': 'Forbidden'}), 403

        # Validate required payload structure before processing
        stk_callback = data.get('Body', {}).get('stkCallback', {})
        result_code = stk_callback.get('ResultCode')
        result_desc = stk_callback.get('ResultDesc', '')

        if result_code is None:
            logger.warning('mpesa_callback: missing ResultCode in payload')
            return jsonify({'error': 'Invalid callback payload'}), 400

        if result_code == 0:
            callback_items = stk_callback.get('CallbackMetadata', {}).get('Item', [])
            transaction_details = {
                item.get('Name'): item.get('Value')
                for item in callback_items
                if isinstance(item, dict)
            }
            logger.info('mpesa_callback: payment successful, receipt=%s',
                        transaction_details.get('MpesaReceiptNumber', 'n/a'))
            return jsonify({'status': 'success'}), 200
        else:
            logger.info('mpesa_callback: payment failed, code=%s', result_code)
            return jsonify({'status': 'failed'}), 200

    except Exception as e:
        logger.error(f'mpesa_callback error: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500

@mpesa_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'M-Pesa Integration',
        'environment': MPESA_CONFIG['ENVIRONMENT']
    }), 200
