from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required
from app.firebase_init import db
from datetime import datetime
import uuid
import logging
import requests
import base64
import os


logger = logging.getLogger(__name__)
payments_bp = Blueprint('payments', __name__)

CONTACT_BUNDLE_PACKAGE_ID = 'contact_unlock'
CONTACT_BUNDLE_PRICE = 200
CONTACT_BUNDLE_CONTACTS = 3

DARAJA_BASE_URL = os.getenv('DARAJA_BASE_URL', 'https://sandbox.safaricom.co.ke')
DARAJA_SHORTCODE = os.getenv('DARAJA_SHORTCODE', '174379')
DARAJA_PASSKEY = os.getenv('DARAJA_PASSKEY', '')
DARAJA_CONSUMER_KEY = os.getenv('DARAJA_CONSUMER_KEY', '')
DARAJA_CONSUMER_SECRET = os.getenv('DARAJA_CONSUMER_SECRET', '')
DARAJA_CALLBACK_URL = os.getenv('DARAJA_CALLBACK_URL', 'https://example.com/api/payments/mpesa-callback')

def get_contact_credit_summary(user_id):
    purchases_ref = db.collection('user_purchases').where('user_id', '==', user_id).where('status', '==', 'completed').stream()
    
    total_credits = 0
    for p_doc in purchases_ref:
        p_data = p_doc.to_dict()
        pkg_id = p_data.get('package_id')
        if pkg_id:
            pkg_doc = db.collection('payment_packages').document(pkg_id).get()
            if pkg_doc.exists:
                total_credits += pkg_doc.to_dict().get('contacts_included', 0)
                
    used_credits = len(list(db.collection('contact_access').where('user_id', '==', user_id).stream()))
    remaining_credits = max(total_credits - used_credits, 0)

    return {
        'total_credits': total_credits,
        'used_credits': used_credits,
        'remaining_credits': remaining_credits
    }


def get_daraja_access_token():
    credentials = f"{DARAJA_CONSUMER_KEY}:{DARAJA_CONSUMER_SECRET}"
    encoded_credentials = base64.b64encode(credentials.encode('utf-8')).decode('utf-8')
    token_response = requests.get(
        f"{DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials",
        headers={"Authorization": f"Basic {encoded_credentials}"},
        timeout=20
    )
    token_response.raise_for_status()
    token_json = token_response.json()
    return token_json.get('access_token')


def initiate_stk_push(phone, amount, reference):
    # TODO: Switch to production Daraja credentials before go-live
    access_token = get_daraja_access_token()
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    password = base64.b64encode(f"{DARAJA_SHORTCODE}{DARAJA_PASSKEY}{timestamp}".encode('utf-8')).decode('utf-8')
    payload = {
        "BusinessShortCode": DARAJA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": str(phone),
        "PartyB": DARAJA_SHORTCODE,
        "PhoneNumber": str(phone),
        "CallBackURL": DARAJA_CALLBACK_URL,
        "AccountReference": str(reference),
        "TransactionDesc": "Domestic Connect contact purchase"
    }
    response = requests.post(
        f"{DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest",
        json=payload,
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=20
    )
    response.raise_for_status()
    return response.json()

@payments_bp.route('/packages', methods=['GET'])
def get_payment_packages():
    """Get all active payment packages"""
    try:
        packages_ref = db.collection('payment_packages').where('is_active', '==', True).stream()
        
        result = []
        for doc in packages_ref:
            p = doc.to_dict()
            result.append({
                'id': p.get('id'),
                'name': p.get('name'),
                'description': p.get('description'),
                'price': p.get('price'),
                'contacts_included': p.get('contacts_included'),
                'is_active': p.get('is_active'),
                'created_at': p.get('created_at')
            })
        
        return jsonify({'packages': result}), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@payments_bp.route('/purchase', methods=['POST'])
@firebase_auth_required
def create_purchase():
    """Create a new purchase"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        data = request.get_json()
        
        package_id = data.get('package_id')
        amount = data.get('amount')
        payment_reference = data.get('payment_reference')
        phone_number = data.get('phone_number')
        
        if not package_id or not amount or not phone_number:
            return jsonify({'error': 'Package ID, amount and phone number required'}), 400
        
        package_doc = db.collection('payment_packages').document(package_id).get()
        if not package_doc.exists:
            if package_id == CONTACT_BUNDLE_PACKAGE_ID:
                package_data = {
                    'id': CONTACT_BUNDLE_PACKAGE_ID,
                    'name': 'Contact Unlock Bundle',
                    'description': 'Unlock 3 contacts for KES 200',
                    'price': CONTACT_BUNDLE_PRICE,
                    'contacts_included': CONTACT_BUNDLE_CONTACTS,
                    'is_active': True,
                    'created_at': datetime.utcnow().isoformat()
                }
                db.collection('payment_packages').document(CONTACT_BUNDLE_PACKAGE_ID).set(package_data)
                package_dict = package_data
            else:
                return jsonify({'error': 'Payment package not found'}), 404
        else:
            package_dict = package_doc.to_dict()
        
        stk_response = initiate_stk_push(
            phone=phone_number,
            amount=amount,
            reference=payment_reference or package_dict.get('name', 'Domestic Connect Purchase')
        )
        checkout_request_id = stk_response.get('CheckoutRequestID')
        if not checkout_request_id:
            return jsonify({
                'error': 'Failed to initiate M-Pesa STK push',
                'mpesa_response': stk_response
            }), 502

        purchase_id = str(uuid.uuid4())
        purchase_data = {
            'id': purchase_id,
            'user_id': getattr(user, 'id'),
            'package_id': package_id,
            'amount': amount,
            'payment_reference': payment_reference,
            'phone_number': phone_number,
            'status': 'pending',
            'checkout_request_id': checkout_request_id,
            'merchant_request_id': stk_response.get('MerchantRequestID'),
            'purchase_date': datetime.utcnow().isoformat()
        }
        db.collection('user_purchases').document(purchase_id).set(purchase_data)
        
        return jsonify({
            'message': 'Purchase initiated successfully',
            'purchase_id': purchase_id,
            'package_id': package_id,
            'status': 'pending',
            'checkout_request_id': checkout_request_id
        }), 202
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500


@payments_bp.route('/mpesa-callback', methods=['POST'])
def mpesa_callback():
    try:
        callback_data = request.get_json(silent=True) or {}
        stk_callback = callback_data.get('Body', {}).get('stkCallback', {})

        result_code = stk_callback.get('ResultCode', callback_data.get('ResultCode'))
        checkout_request_id = stk_callback.get('CheckoutRequestID', callback_data.get('CheckoutRequestID'))
        if checkout_request_id is None:
            return jsonify({'error': 'CheckoutRequestID is required'}), 400

        purchases = list(
            db.collection('user_purchases')
            .where('checkout_request_id', '==', checkout_request_id)
            .where('status', '==', 'pending')
            .limit(1)
            .stream()
        )
        if not purchases:
            return jsonify({'message': 'No pending purchase found for callback'}), 200

        purchase_doc = purchases[0]
        purchase_data = purchase_doc.to_dict()

        if int(result_code or 1) != 0:
            db.collection('user_purchases').document(purchase_doc.id).update({
                'status': 'failed',
                'result_code': result_code,
                'result_desc': stk_callback.get('ResultDesc', callback_data.get('ResultDesc')),
                'updated_at': datetime.utcnow().isoformat()
            })
            return jsonify({'message': 'Payment callback recorded as failed'}), 200

        callback_items = stk_callback.get('CallbackMetadata', {}).get('Item', [])
        metadata = {item.get('Name'): item.get('Value') for item in callback_items if isinstance(item, dict)}
        amount = metadata.get('Amount', callback_data.get('Amount'))
        receipt = metadata.get('MpesaReceiptNumber', callback_data.get('MpesaReceiptNumber'))
        phone_number = metadata.get('PhoneNumber', callback_data.get('PhoneNumber'))

        db.collection('user_purchases').document(purchase_doc.id).update({
            'status': 'completed',
            'result_code': result_code,
            'mpesa_receipt_number': receipt,
            'amount_paid': amount,
            'phone_number': phone_number or purchase_data.get('phone_number'),
            'completed_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        })

        return jsonify({
            'message': 'Payment confirmed and credits added',
            'checkout_request_id': checkout_request_id
        }), 200
    except Exception as e:
        logger.error(f'Error processing M-Pesa callback: {str(e)}')
        return jsonify({'error': 'Failed to process callback'}), 500

@payments_bp.route('/purchase-status/<checkout_request_id>', methods=['GET'])
@firebase_auth_required
def get_purchase_status(checkout_request_id):
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401

        user_id = getattr(user, 'id')
        purchases = list(
            db.collection('user_purchases')
            .where('checkout_request_id', '==', checkout_request_id)
            .where('user_id', '==', user_id)
            .limit(1)
            .stream()
        )

        if not purchases:
            return jsonify({'error': 'Purchase not found'}), 404

        purchase = purchases[0].to_dict()
        return jsonify({'status': purchase.get('status', 'pending')}), 200
    except Exception as e:
        logger.error(f'Error fetching purchase status: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500

@payments_bp.route('/contact-access', methods=['POST'])
@firebase_auth_required
def unlock_contact():
    """Unlock contact for a housegirl profile"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        data = request.get_json()
        
        target_profile_id = data.get('target_profile_id')
        
        if not target_profile_id:
            return jsonify({'error': 'Target profile ID required'}), 400
        
        user_id = getattr(user, 'id')
        
        # Check if user already has access
        docs = list(db.collection('contact_access').where('user_id', '==', user_id).where('target_profile_id', '==', target_profile_id).limit(1).stream())
        if docs:
            return jsonify({
                'message': 'Contact already unlocked',
                **get_contact_credit_summary(user_id)
            }), 200
        
        credit_summary = get_contact_credit_summary(user_id)
        if credit_summary['remaining_credits'] <= 0:
            return jsonify({
                'error': 'No contact credits available. Complete payment to unlock contacts.',
                **credit_summary
            }), 402

        # Create contact access record
        access_id = str(uuid.uuid4())
        access_data = {
            'id': access_id,
            'user_id': user_id,
            'target_profile_id': target_profile_id,
            'accessed_at': datetime.utcnow().isoformat()
        }
        
        db.collection('contact_access').document(access_id).set(access_data)
        
        updated_summary = get_contact_credit_summary(user_id)

        return jsonify({
            'message': 'Contact unlocked successfully',
            'access_id': access_id,
            **updated_summary
        }), 201
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@payments_bp.route('/my-purchases', methods=['GET'])
@firebase_auth_required
def get_user_purchases():
    """Get user's purchase history"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        purchases_ref = db.collection('user_purchases').where('user_id', '==', getattr(user, 'id')).stream()
        
        result = []
        for doc in purchases_ref:
            p = doc.to_dict()
            package_name = "Unknown Package"
            pkg_id = p.get('package_id')
            if pkg_id:
                pkg_doc = db.collection('payment_packages').document(pkg_id).get()
                if pkg_doc.exists:
                    package_name = pkg_doc.to_dict().get('name', package_name)
                    
            result.append({
                'id': p.get('id'),
                'package_name': package_name,
                'amount': p.get('amount'),
                'purchase_date': p.get('purchase_date'),
                'status': p.get('status'),
                'payment_reference': p.get('payment_reference')
            })
        
        return jsonify({'purchases': result}), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@payments_bp.route('/contact-access', methods=['GET'])
@firebase_auth_required
def get_contact_access():
    """Get unlocked contacts for current user"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        access_ref = db.collection('contact_access').where('user_id', '==', getattr(user, 'id')).stream()
        return jsonify({
            'contact_access': [
                {
                    'id': record.to_dict().get('id'),
                    'target_profile_id': record.to_dict().get('target_profile_id'),
                    'accessed_at': record.to_dict().get('accessed_at')
                }
                for record in access_ref
            ]
        }), 200
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@payments_bp.route('/contact-credits', methods=['GET'])
@firebase_auth_required
def get_contact_credits():
    """Get contact credit summary for current user"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        return jsonify(get_contact_credit_summary(getattr(user, 'id'))), 200
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500
