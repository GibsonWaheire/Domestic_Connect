import os
import requests
import base64
import json
from datetime import datetime
from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required
from app import db
import uuid

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
            raise Exception(f"Failed to get access token: {response.text}")
            
    except Exception as e:
        print(f"Error getting access token: {e}")
        raise e

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
    """Handle M-Pesa callback"""
    try:
        data = request.get_json()
        
        # Log the callback for debugging
        print(f"M-Pesa Callback received: {json.dumps(data, indent=2)}")
        
        # Process the callback based on the result
        result_code = data.get('Body', {}).get('stkCallback', {}).get('ResultCode')
        result_desc = data.get('Body', {}).get('stkCallback', {}).get('ResultDesc')
        
        if result_code == 0:
            # Payment successful
            callback_metadata = data.get('Body', {}).get('stkCallback', {}).get('CallbackMetadata', {}).get('Item', [])
            
            # Extract transaction details
            transaction_details = {}
            for item in callback_metadata:
                transaction_details[item.get('Name')] = item.get('Value')
            
            # Here you would typically update your database with the successful payment
            # For now, just log it
            print(f"Payment successful: {transaction_details}")
            
            return jsonify({'status': 'success'}), 200
        else:
            # Payment failed
            print(f"Payment failed: {result_desc}")
            return jsonify({'status': 'failed', 'reason': result_desc}), 200
            
    except Exception as e:
        print(f"Error processing callback: {e}")
        return jsonify({'error': str(e)}), 500

@mpesa_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'M-Pesa Integration',
        'environment': MPESA_CONFIG['ENVIRONMENT']
    }), 200
