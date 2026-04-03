from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required
from app.firebase_init import db
from app.utils.audit_log import write_audit_log, ACTION_PAYMENT_COMPLETED, ACTION_PAYMENT_FAILED, ACTION_CONTACT_UNLOCKED
from datetime import datetime
import uuid
import logging
import requests
import os
from urllib.parse import quote as url_quote


logger = logging.getLogger(__name__)
payments_bp = Blueprint('payments', __name__)

CONTACT_BUNDLE_PACKAGE_ID = 'contact_unlock'
CONTACT_BUNDLE_PRICE = 200
CONTACT_BUNDLE_CONTACTS = 3
ACTIVATION_PACKAGE_ID = 'high_demand_activation'
ACTIVATION_PACKAGE_PRICE = 500

PESAPAL_BASE_URL = os.getenv('PESAPAL_BASE_URL', 'https://pay.pesapal.com/v3')
PESAPAL_CONSUMER_KEY = os.getenv('PESAPAL_CONSUMER_KEY', '')
PESAPAL_CONSUMER_SECRET = os.getenv('PESAPAL_CONSUMER_SECRET', '')
PESAPAL_IPN_ID = os.getenv('PESAPAL_IPN_ID', '')
PESAPAL_CALLBACK_URL = os.getenv('PESAPAL_CALLBACK_URL', 'https://domestic-connect.co.ke/payment-callback')
PESAPAL_IPN_URL = os.getenv('PESAPAL_IPN_URL', 'https://domestic-connect.co.ke/api/payments/pesapal-ipn')


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


def get_pesapal_token():
    response = requests.post(
        f"{PESAPAL_BASE_URL}/api/Auth/RequestToken",
        json={"consumer_key": PESAPAL_CONSUMER_KEY, "consumer_secret": PESAPAL_CONSUMER_SECRET},
        headers={"Accept": "application/json", "Content-Type": "application/json"},
        timeout=20
    )
    response.raise_for_status()
    data = response.json()
    if data.get('error'):
        raise Exception(f"Pesapal auth error: {data['error']}")
    return data['token']


def submit_pesapal_order(token, amount, purchase_id, description, billing_email=None, billing_first_name=None):
    payload = {
        "id": purchase_id,
        "currency": "KES",
        "amount": float(amount),
        "description": description,
        "callback_url": PESAPAL_CALLBACK_URL,
        "notification_id": PESAPAL_IPN_ID,
        "billing_address": {
            "email_address": billing_email or "customer@domesticconnect.co.ke",
            "phone_number": "",
            "country_code": "KE",
            "first_name": billing_first_name or "Customer",
            "last_name": "",
            "line_1": "",
            "line_2": "",
            "city": "",
            "state": "",
            "postal_code": None,
            "zip_code": None
        }
    }
    response = requests.post(
        f"{PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest",
        json=payload,
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        },
        timeout=20
    )
    response.raise_for_status()
    return response.json()


def get_pesapal_transaction_status(token, order_tracking_id):
    response = requests.get(
        f"{PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId={url_quote(str(order_tracking_id), safe='')}",
        headers={
            "Accept": "application/json",
            "Authorization": f"Bearer {token}"
        },
        timeout=20
    )
    response.raise_for_status()
    return response.json()


def _complete_purchase(purchase_doc_id, purchase_data, pesapal_status_data):
    """Mark purchase as completed and handle post-payment side-effects."""
    confirmation_code = pesapal_status_data.get('confirmation_code', '')
    amount = pesapal_status_data.get('amount', purchase_data.get('amount'))

    db.collection('user_purchases').document(purchase_doc_id).update({
        'status': 'completed',
        'pesapal_confirmation_code': confirmation_code,
        'amount_paid': amount,
        'completed_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    })

    # Reset high-demand status for activation package
    if purchase_data.get('package_id') == ACTIVATION_PACKAGE_ID:
        user_id = purchase_data.get('user_id')
        if user_id:
            profiles = list(
                db.collection('profiles').where('user_id', '==', user_id).limit(1).stream()
            )
            if profiles:
                profile_id = profiles[0].to_dict().get('id')
                if profile_id:
                    housegirl_profiles = list(
                        db.collection('housegirl_profiles').where('profile_id', '==', profile_id).limit(1).stream()
                    )
                    if housegirl_profiles:
                        db.collection('housegirl_profiles').document(housegirl_profiles[0].id).set({
                            'unlock_count': 0,
                            'is_available': True,
                            'in_demand_alert': False,
                            'activation_fee_paid': True,
                            'updated_at': datetime.utcnow().isoformat()
                        }, merge=True)

    # Auto-unlock contact for contact_unlock purchases (idempotent)
    target_profile_id = purchase_data.get('target_profile_id')
    housegirl_id = purchase_data.get('housegirl_id')
    user_id = purchase_data.get('user_id')

    if purchase_data.get('package_id') == CONTACT_BUNDLE_PACKAGE_ID and target_profile_id and user_id:
        existing = list(
            db.collection('contact_access')
            .where('user_id', '==', user_id)
            .where('target_profile_id', '==', target_profile_id)
            .limit(1).stream()
        )
        if not existing:
            access_id = str(uuid.uuid4())
            db.collection('contact_access').document(access_id).set({
                'id': access_id,
                'user_id': user_id,
                'target_profile_id': target_profile_id,
                'housegirl_id': housegirl_id,
                'accessed_at': datetime.utcnow().isoformat()
            })
            if housegirl_id:
                unlock_count = len(list(
                    db.collection('contact_access').where('housegirl_id', '==', housegirl_id).stream()
                ))
                updates = {
                    'unlock_count': unlock_count,
                    'is_available': unlock_count < 3,
                    'updated_at': datetime.utcnow().isoformat()
                }
                if unlock_count >= 3:
                    updates['in_demand_alert'] = True
                db.collection('housegirl_profiles').document(housegirl_id).set(updates, merge=True)

            write_audit_log(
                user_id=user_id,
                action=ACTION_CONTACT_UNLOCKED,
                details={'access_id': access_id, 'target_profile_id': target_profile_id, 'housegirl_id': housegirl_id}
            )

    write_audit_log(
        user_id=purchase_data.get('user_id', 'unknown'),
        action=ACTION_PAYMENT_COMPLETED,
        details={
            'purchase_id': purchase_doc_id,
            'order_tracking_id': purchase_data.get('order_tracking_id'),
            'confirmation_code': confirmation_code,
            'amount': amount,
            'package_id': purchase_data.get('package_id'),
        }
    )


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
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500


@payments_bp.route('/purchase', methods=['POST'])
@firebase_auth_required
def create_purchase():
    """Create a new purchase and return a Pesapal redirect URL"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.get_json()

        package_id = data.get('package_id')
        amount = data.get('amount')
        target_profile_id = data.get('target_profile_id')
        housegirl_id = data.get('housegirl_id')

        if not package_id or amount is None:
            return jsonify({'error': 'Package ID and amount are required'}), 400

        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError
        except (TypeError, ValueError):
            return jsonify({'error': 'Amount must be a positive number'}), 400

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
            elif package_id == ACTIVATION_PACKAGE_ID:
                package_data = {
                    'id': ACTIVATION_PACKAGE_ID,
                    'name': 'High Demand Activation',
                    'description': 'Reset high demand status for profile visibility',
                    'price': ACTIVATION_PACKAGE_PRICE,
                    'contacts_included': 0,
                    'is_active': True,
                    'created_at': datetime.utcnow().isoformat()
                }
                db.collection('payment_packages').document(ACTIVATION_PACKAGE_ID).set(package_data)
                package_dict = package_data
            else:
                return jsonify({'error': 'Payment package not found'}), 404
        else:
            package_dict = package_doc.to_dict()

        # Enforce server-side price — ignore whatever amount the client sent
        authoritative_amount = float(package_dict.get('price', amount))
        amount = authoritative_amount

        purchase_id = str(uuid.uuid4())
        user_id = getattr(user, 'id')
        billing_email = getattr(user, 'email', None)
        billing_name = getattr(user, 'first_name', None) or getattr(user, 'display_name', None)

        token = get_pesapal_token()
        description = package_dict.get('name', 'Domestic Connect Purchase')
        pesapal_response = submit_pesapal_order(
            token=token,
            amount=amount,
            purchase_id=purchase_id,
            description=description,
            billing_email=billing_email,
            billing_first_name=billing_name
        )

        order_tracking_id = pesapal_response.get('order_tracking_id')
        redirect_url = pesapal_response.get('redirect_url')

        if not order_tracking_id or not redirect_url:
            logger.error(f'Pesapal order failed: {pesapal_response}')
            return jsonify({
                'error': 'Failed to create Pesapal payment order',
                'pesapal_response': pesapal_response
            }), 502

        purchase_data = {
            'id': purchase_id,
            'user_id': user_id,
            'package_id': package_id,
            'amount': amount,
            'status': 'pending',
            'order_tracking_id': order_tracking_id,
            'merchant_reference': purchase_id,
            'target_profile_id': target_profile_id,
            'housegirl_id': housegirl_id,
            'purchase_date': datetime.utcnow().isoformat()
        }
        db.collection('user_purchases').document(purchase_id).set(purchase_data)

        return jsonify({
            'message': 'Purchase initiated successfully',
            'purchase_id': purchase_id,
            'package_id': package_id,
            'status': 'pending',
            'order_tracking_id': order_tracking_id,
            'redirect_url': redirect_url
        }), 202

    except Exception as e:
        logger.error(f'Error creating purchase: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500


@payments_bp.route('/pesapal-ipn', methods=['GET'])
def pesapal_ipn():
    """Handle Pesapal Instant Payment Notification (server-to-server)"""
    try:
        order_tracking_id = request.args.get('OrderTrackingId')
        merchant_reference = request.args.get('OrderMerchantReference')
        notification_type = request.args.get('OrderNotificationType')

        if not order_tracking_id:
            return jsonify({'error': 'OrderTrackingId required'}), 400

        token = get_pesapal_token()
        status_data = get_pesapal_transaction_status(token, order_tracking_id)
        payment_status_desc = status_data.get('payment_status_description', '').upper()

        purchases = list(
            db.collection('user_purchases')
            .where('order_tracking_id', '==', order_tracking_id)
            .limit(1)
            .stream()
        )

        if purchases:
            purchase_doc = purchases[0]
            purchase_data = purchase_doc.to_dict()

            if payment_status_desc == 'COMPLETED' and purchase_data.get('status') != 'completed':
                _complete_purchase(purchase_doc.id, purchase_data, status_data)
            elif payment_status_desc in ('FAILED', 'INVALID') and purchase_data.get('status') == 'pending':
                db.collection('user_purchases').document(purchase_doc.id).update({
                    'status': 'failed',
                    'updated_at': datetime.utcnow().isoformat()
                })
                write_audit_log(
                    user_id=purchase_data.get('user_id', 'unknown'),
                    action=ACTION_PAYMENT_FAILED,
                    details={'purchase_id': purchase_doc.id, 'order_tracking_id': order_tracking_id}
                )

        # Pesapal requires this exact response format
        return jsonify({
            'orderNotificationType': notification_type,
            'orderTrackingId': order_tracking_id,
            'orderMerchantReference': merchant_reference,
            'status': '200'
        }), 200

    except Exception as e:
        logger.error(f'pesapal_ipn error: {str(e)}')
        return jsonify({'error': 'IPN processing failed'}), 500


@payments_bp.route('/purchase-status/<order_tracking_id>', methods=['GET'])
@firebase_auth_required
def get_purchase_status(order_tracking_id):
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401

        user_id = getattr(user, 'id')
        purchases = list(
            db.collection('user_purchases')
            .where('order_tracking_id', '==', order_tracking_id)
            .where('user_id', '==', user_id)
            .limit(1)
            .stream()
        )

        if not purchases:
            return jsonify({'error': 'Purchase not found'}), 404

        purchase_doc = purchases[0]
        purchase_data = purchase_doc.to_dict()
        current_status = purchase_data.get('status', 'pending')

        # If still pending, query Pesapal directly for the latest status
        if current_status == 'pending':
            try:
                token = get_pesapal_token()
                status_data = get_pesapal_transaction_status(token, order_tracking_id)
                payment_status_desc = status_data.get('payment_status_description', '').upper()

                if payment_status_desc == 'COMPLETED':
                    _complete_purchase(purchase_doc.id, purchase_data, status_data)
                    current_status = 'completed'
                elif payment_status_desc in ('FAILED', 'INVALID'):
                    db.collection('user_purchases').document(purchase_doc.id).update({
                        'status': 'failed',
                        'updated_at': datetime.utcnow().isoformat()
                    })
                    current_status = 'failed'
            except Exception as e:
                logger.warning(f'Could not query Pesapal for status: {str(e)}')

        return jsonify({
            'status': current_status,
            'package_id': purchase_data.get('package_id'),
            'order_tracking_id': order_tracking_id,
            'purchase_id': purchase_data.get('id')
        }), 200

    except Exception as e:
        logger.error(f'Error fetching purchase status: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500


@payments_bp.route('/register-pesapal-ipn', methods=['POST'])
@firebase_auth_required
def register_pesapal_ipn():
    """Admin only: Register IPN URL with Pesapal. Run once; save the returned ipn_id as PESAPAL_IPN_ID."""
    try:
        user = request.current_user
        if not user or getattr(user, 'user_type', '') != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403

        token = get_pesapal_token()
        response = requests.post(
            f"{PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN",
            json={"url": PESAPAL_IPN_URL, "ipn_notification_type": "GET"},
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            },
            timeout=20
        )
        response.raise_for_status()
        data = response.json()

        return jsonify({
            'message': 'IPN registered. Copy the ipn_id below and set it as PESAPAL_IPN_ID in your .env.',
            'data': data
        }), 200

    except Exception as e:
        logger.error(f'register_pesapal_ipn error: {str(e)}')
        return jsonify({'error': str(e)}), 500


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
        housegirl_id = data.get('housegirl_id')

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

        access_id = str(uuid.uuid4())
        access_data = {
            'id': access_id,
            'user_id': user_id,
            'target_profile_id': target_profile_id,
            'housegirl_id': housegirl_id,
            'accessed_at': datetime.utcnow().isoformat()
        }

        db.collection('contact_access').document(access_id).set(access_data)

        if housegirl_id:
            unlock_count = len(
                list(
                    db.collection('contact_access')
                    .where('housegirl_id', '==', housegirl_id)
                    .stream()
                )
            )
            updates = {
                'unlock_count': unlock_count,
                'is_available': unlock_count < 3,
                'updated_at': datetime.utcnow().isoformat()
            }
            if unlock_count >= 3:
                updates['in_demand_alert'] = True
            db.collection('housegirl_profiles').document(housegirl_id).set(updates, merge=True)

        updated_summary = get_contact_credit_summary(user_id)

        write_audit_log(
            user_id=user_id,
            action=ACTION_CONTACT_UNLOCKED,
            details={
                'access_id': access_id,
                'target_profile_id': target_profile_id,
                'housegirl_id': housegirl_id,
            },
        )

        return jsonify({
            'message': 'Contact unlocked successfully',
            'access_id': access_id,
            **updated_summary
        }), 201

    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500


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
                'order_tracking_id': p.get('order_tracking_id')
            })

        return jsonify({'purchases': result}), 200

    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500


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
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500


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
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500
