from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required
from app.models import PaymentPackage, UserPurchase, ContactAccess
from app import db
import uuid

payments_bp = Blueprint('payments', __name__)

CONTACT_BUNDLE_PACKAGE_ID = 'contact_unlock'
CONTACT_BUNDLE_PRICE = 200
CONTACT_BUNDLE_CONTACTS = 3


def get_contact_credit_summary(user_id):
    purchases = UserPurchase.query.filter_by(user_id=user_id, status='completed').all()
    total_credits = sum(
        purchase.payment_package.contacts_included
        for purchase in purchases
        if purchase.payment_package is not None
    )
    used_credits = ContactAccess.query.filter_by(user_id=user_id).count()
    remaining_credits = max(total_credits - used_credits, 0)

    return {
        'total_credits': total_credits,
        'used_credits': used_credits,
        'remaining_credits': remaining_credits
    }

@payments_bp.route('/packages', methods=['GET'])
def get_payment_packages():
    """Get all active payment packages"""
    try:
        packages = PaymentPackage.query.filter_by(is_active=True).all()
        
        result = []
        for package in packages:
            result.append({
                'id': package.id,
                'name': package.name,
                'description': package.description,
                'price': package.price,
                'contacts_included': package.contacts_included,
                'is_active': package.is_active,
                'created_at': package.created_at.isoformat()
            })
        
        return jsonify({'packages': result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/purchase', methods=['POST'])
@firebase_auth_required
def create_purchase():
    """Create a new purchase"""
    try:
        user = request.current_user
        data = request.get_json()
        
        package_id = data.get('package_id')
        amount = data.get('amount')
        payment_reference = data.get('payment_reference')
        
        if not package_id or not amount:
            return jsonify({'error': 'Package ID and amount required'}), 400
        
        package = PaymentPackage.query.get(package_id)
        if not package:
            if package_id == CONTACT_BUNDLE_PACKAGE_ID:
                package = PaymentPackage(
                    id=CONTACT_BUNDLE_PACKAGE_ID,
                    name='Contact Unlock Bundle',
                    description='Unlock 3 contacts for KES 200',
                    price=CONTACT_BUNDLE_PRICE,
                    contacts_included=CONTACT_BUNDLE_CONTACTS,
                    is_active=True
                )
                db.session.add(package)
                db.session.flush()
            else:
                return jsonify({'error': 'Payment package not found'}), 404
        
        # Create purchase record
        purchase = UserPurchase(
            id=str(uuid.uuid4()),
            user_id=user.id,
            package_id=package_id,
            amount=amount,
            payment_reference=payment_reference,
            status='completed'
        )
        
        db.session.add(purchase)
        db.session.commit()

        credit_summary = get_contact_credit_summary(user.id)
        
        return jsonify({
            'message': 'Purchase created successfully',
            'purchase_id': purchase.id,
            'package_id': package.id,
            'contacts_granted': package.contacts_included,
            'remaining_credits': credit_summary['remaining_credits']
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/contact-access', methods=['POST'])
@firebase_auth_required
def unlock_contact():
    """Unlock contact for a housegirl profile"""
    try:
        user = request.current_user
        data = request.get_json()
        
        target_profile_id = data.get('target_profile_id')
        
        if not target_profile_id:
            return jsonify({'error': 'Target profile ID required'}), 400
        
        # Check if user already has access
        existing_access = ContactAccess.query.filter_by(
            user_id=user.id,
            target_profile_id=target_profile_id
        ).first()
        
        if existing_access:
            return jsonify({
                'message': 'Contact already unlocked',
                **get_contact_credit_summary(user.id)
            }), 200
        
        credit_summary = get_contact_credit_summary(user.id)
        if credit_summary['remaining_credits'] <= 0:
            return jsonify({
                'error': 'No contact credits available. Complete payment to unlock contacts.',
                **credit_summary
            }), 402

        # Create contact access record
        contact_access = ContactAccess(
            id=str(uuid.uuid4()),
            user_id=user.id,
            target_profile_id=target_profile_id
        )
        
        db.session.add(contact_access)
        db.session.commit()
        
        updated_summary = get_contact_credit_summary(user.id)

        return jsonify({
            'message': 'Contact unlocked successfully',
            'access_id': contact_access.id,
            **updated_summary
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/my-purchases', methods=['GET'])
@firebase_auth_required
def get_user_purchases():
    """Get user's purchase history"""
    try:
        user = request.current_user
        
        purchases = UserPurchase.query.filter_by(user_id=user.id).all()
        
        result = []
        for purchase in purchases:
            result.append({
                'id': purchase.id,
                'package_name': purchase.payment_package.name,
                'amount': purchase.amount,
                'purchase_date': purchase.purchase_date.isoformat(),
                'status': purchase.status,
                'payment_reference': purchase.payment_reference
            })
        
        return jsonify({'purchases': result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payments_bp.route('/contact-access', methods=['GET'])
@firebase_auth_required
def get_contact_access():
    """Get unlocked contacts for current user"""
    try:
        user = request.current_user
        access_records = ContactAccess.query.filter_by(user_id=user.id).all()
        return jsonify({
            'contact_access': [
                {
                    'id': record.id,
                    'target_profile_id': record.target_profile_id,
                    'accessed_at': record.accessed_at.isoformat()
                }
                for record in access_records
            ]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payments_bp.route('/contact-credits', methods=['GET'])
@firebase_auth_required
def get_contact_credits():
    """Get contact credit summary for current user"""
    try:
        user = request.current_user
        return jsonify(get_contact_credit_summary(user.id)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
