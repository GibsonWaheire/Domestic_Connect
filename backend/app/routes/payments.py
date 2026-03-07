from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required
from app.firebase_init import db
from datetime import datetime
import uuid

payments_bp = Blueprint('payments', __name__)

CONTACT_BUNDLE_PACKAGE_ID = 'contact_unlock'
CONTACT_BUNDLE_PRICE = 200
CONTACT_BUNDLE_CONTACTS = 3

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
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

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
        
        if not package_id or not amount:
            return jsonify({'error': 'Package ID and amount required'}), 400
        
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
        
        # Create purchase record
        purchase_id = str(uuid.uuid4())
        purchase_data = {
            'id': purchase_id,
            'user_id': getattr(user, 'id'),
            'package_id': package_id,
            'amount': amount,
            'payment_reference': payment_reference,
            'status': 'completed',
            'purchase_date': datetime.utcnow().isoformat()
        }
        
        db.collection('user_purchases').document(purchase_id).set(purchase_data)

        credit_summary = get_contact_credit_summary(getattr(user, 'id'))
        
        return jsonify({
            'message': 'Purchase created successfully',
            'purchase_id': purchase_id,
            'package_id': package_id,
            'contacts_granted': package_dict.get('contacts_included', 0),
            'remaining_credits': credit_summary['remaining_credits']
        }), 201
        
    except Exception as e:
        import traceback
        traceback.print_exc()
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
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

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
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

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
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

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
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
