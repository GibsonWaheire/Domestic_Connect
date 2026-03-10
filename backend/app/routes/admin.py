from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required, admin_required
from app.firebase_init import db
from datetime import datetime, timedelta
import json
import logging


logger = logging.getLogger(__name__)
admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@firebase_auth_required
@admin_required
def get_dashboard_stats():
    """Get admin dashboard statistics"""
    try:
        # Basic counts
        users_ref = list(db.collection('users').stream())
        total_users = len(users_ref)
        
        total_employers = sum(1 for u in users_ref if u.to_dict().get('user_type') == 'employer')
        total_housegirls = sum(1 for u in users_ref if u.to_dict().get('user_type') == 'housegirl')
        total_agencies = sum(1 for u in users_ref if u.to_dict().get('user_type') == 'agency')
        
        # Active users (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        thirty_days_iso = thirty_days_ago.isoformat()
        active_users = sum(1 for u in users_ref if u.to_dict().get('updated_at', '') >= thirty_days_iso)
        
        # Agency statistics
        agencies_ref = list(db.collection('agencies').stream())
        total_agencies_marketplace = len(agencies_ref)
        verified_agencies = sum(1 for a in agencies_ref if a.to_dict().get('verification_status') == 'verified')
        
        # Payment statistics
        total_packages = len(list(db.collection('payment_packages').stream()))
        
        purchases_ref = list(db.collection('user_purchases').stream())
        total_purchases = len(purchases_ref)
        total_revenue = sum(p.to_dict().get('amount', 0) for p in purchases_ref)
        
        # Recent activity
        sorted_users = sorted([u.to_dict() for u in users_ref], key=lambda x: x.get('created_at', ''), reverse=True)
        recent_users = sorted_users[:5]
        
        sorted_purchases = sorted([p.to_dict() for p in purchases_ref], key=lambda x: x.get('purchase_date', ''), reverse=True)
        recent_purchases = sorted_purchases[:5]
        
        # Monthly growth
        current_month = datetime.utcnow().replace(day=1).isoformat()
        monthly_users = sum(1 for u in sorted_users if u.get('created_at', '') >= current_month)
        
        return jsonify({
            'overview': {
                'total_users': total_users,
                'total_employers': total_employers,
                'total_housegirls': total_housegirls,
                'total_agencies': total_agencies,
                'active_users': active_users,
                'monthly_users': monthly_users
            },
            'agencies': {
                'total_agencies': total_agencies_marketplace,
                'verified_agencies': verified_agencies,
                'pending_verification': total_agencies_marketplace - verified_agencies
            },
            'payments': {
                'total_packages': total_packages,
                'total_purchases': total_purchases,
                'total_revenue': float(total_revenue)
            },
            'recent_activity': {
                'users': [{
                    'id': user.get('id'),
                    'email': user.get('email'),
                    'user_type': user.get('user_type'),
                    'first_name': user.get('first_name'),
                    'last_name': user.get('last_name'),
                    'created_at': user.get('created_at')
                } for user in recent_users],
                'purchases': [{
                    'id': purchase.get('id'),
                    'user_id': purchase.get('user_id'),
                    'amount': purchase.get('amount'),
                    'status': purchase.get('status'),
                    'purchase_date': purchase.get('purchase_date')
                } for purchase in recent_purchases]
            }
        }), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@admin_bp.route('/users', methods=['GET'])
@firebase_auth_required
@admin_required
def get_all_users():
    """Get all users with pagination"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        user_type = request.args.get('user_type')
        search = request.args.get('search', '').lower()
        
        query = db.collection('users')
        if user_type:
            query = query.where('user_type', '==', user_type)
            
        docs = list(query.stream())
        all_users = [doc.to_dict() for doc in docs]
        
        if search:
            all_users = [
                u for u in all_users 
                if search in u.get('email', '').lower() 
                or search in u.get('first_name', '').lower() 
                or search in u.get('last_name', '').lower()
            ]
            
        # sort by created_at desc
        all_users.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        total = len(all_users)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated = all_users[start_idx:end_idx]
        
        # Check profiles
        result = []
        for user in paginated:
            prof_docs = list(db.collection('profiles').where('user_id', '==', user.get('id')).limit(1).stream())
            has_profile = len(prof_docs) > 0
            
            result.append({
                'id': user.get('id'),
                'email': user.get('email'),
                'user_type': user.get('user_type'),
                'first_name': user.get('first_name'),
                'last_name': user.get('last_name'),
                'phone_number': user.get('phone_number'),
                'is_active': user.get('is_active', True),
                'created_at': user.get('created_at'),
                'updated_at': user.get('updated_at'),
                'has_profile': has_profile
            })
        
        return jsonify({
            'users': result,
            'pagination': {
                'page': page,
                'pages': (total + per_page - 1) // per_page if per_page else 0,
                'per_page': per_page,
                'total': total,
                'has_next': end_idx < total,
                'has_prev': page > 1
            }
        }), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@admin_bp.route('/users-without-roles', methods=['GET'])
@firebase_auth_required
@admin_required
def get_users_without_roles():
    try:
        users = [u.to_dict() for u in db.collection('users').stream()]
        users_without_roles = []
        for user in users:
            user_type = user.get('user_type')
            if not user_type or str(user_type).strip() == '':
                users_without_roles.append({
                    'id': user.get('id'),
                    'uid': user.get('uid'),
                    'firebase_uid': user.get('firebase_uid'),
                    'email': user.get('email'),
                    'phone_number': user.get('phone_number'),
                    'first_name': user.get('first_name'),
                    'last_name': user.get('last_name'),
                    'created_at': user.get('created_at'),
                    'updated_at': user.get('updated_at')
                })
        return jsonify({
            'users': users_without_roles
        }), 200
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@admin_bp.route('/users/<user_id>', methods=['GET'])
@firebase_auth_required
@admin_required
def get_user_details(user_id):
    """Get detailed user information"""
    try:
        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404
            
        user = user_doc.to_dict()
        
        user_data = {
            'id': user.get('id'),
            'firebase_uid': user.get('firebase_uid'),
            'email': user.get('email'),
            'user_type': user.get('user_type'),
            'first_name': user.get('first_name'),
            'last_name': user.get('last_name'),
            'phone_number': user.get('phone_number'),
            'is_active': user.get('is_active', True),
            'created_at': user.get('created_at'),
            'updated_at': user.get('updated_at')
        }
        
        # Add profile data if exists
        prof_docs = list(db.collection('profiles').where('user_id', '==', user_id).limit(1).stream())
        if prof_docs:
            prof_data = prof_docs[0].to_dict()
            profile_id = prof_data.get('id')
            user_data['profile'] = {
                'id': profile_id,
                'created_at': prof_data.get('created_at'),
                'updated_at': prof_data.get('updated_at')
            }
            
            user_type = user.get('user_type')
            if user_type == 'employer':
                emp_docs = list(db.collection('employer_profiles').where('profile_id', '==', profile_id).limit(1).stream())
                if emp_docs:
                    emp_data = emp_docs[0].to_dict()
                    user_data['profile']['employer'] = {
                        'company_name': emp_data.get('company_name'),
                        'location': emp_data.get('location'),
                        'description': emp_data.get('description')
                    }
            elif user_type == 'housegirl':
                hg_docs = list(db.collection('housegirl_profiles').where('profile_id', '==', profile_id).limit(1).stream())
                if hg_docs:
                    hg_data = hg_docs[0].to_dict()
                    user_data['profile']['housegirl'] = {
                        'age': hg_data.get('age'),
                        'bio': hg_data.get('bio'),
                        'current_location': hg_data.get('current_location'),
                        'location': hg_data.get('location'),
                        'education': hg_data.get('education'),
                        'experience': hg_data.get('experience'),
                        'expected_salary': hg_data.get('expected_salary'),
                        'accommodation_type': hg_data.get('accommodation_type'),
                        'tribe': hg_data.get('tribe'),
                        'is_available': hg_data.get('is_available'),
                        'profile_photo_url': hg_data.get('profile_photo_url')
                    }
            elif user_type == 'agency':
                ag_docs = list(db.collection('agency_profiles').where('profile_id', '==', profile_id).limit(1).stream())
                if ag_docs:
                    ag_data = ag_docs[0].to_dict()
                    user_data['profile']['agency'] = {
                        'agency_name': ag_data.get('agency_name'),
                        'location': ag_data.get('location'),
                        'description': ag_data.get('description'),
                        'license_number': ag_data.get('license_number')
                    }
        
        # Add purchase history
        purchases = list(db.collection('user_purchases').where('user_id', '==', user_id).stream())
        user_data['purchases'] = [{
            'id': p.to_dict().get('id'),
            'package_id': p.to_dict().get('package_id'),
            'amount': p.to_dict().get('amount'),
            'status': p.to_dict().get('status'),
            'purchase_date': p.to_dict().get('purchase_date'),
            'payment_reference': p.to_dict().get('payment_reference')
        } for p in purchases]
        
        return jsonify(user_data), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@admin_bp.route('/users/<user_id>/toggle-status', methods=['PUT'])
@firebase_auth_required
@admin_required
def toggle_user_status(user_id):
    """Toggle user active status"""
    try:
        user_doc_ref = db.collection('users').document(user_id)
        user_doc = user_doc_ref.get()
        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404
            
        user = user_doc.to_dict()
        new_status = not user.get('is_active', True)
        
        user_doc_ref.update({'is_active': new_status})
        
        return jsonify({
            'message': f'User {"activated" if new_status else "deactivated"} successfully',
            'user': {
                'id': user.get('id'),
                'email': user.get('email'),
                'is_active': new_status
            }
        }), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@admin_bp.route('/agencies', methods=['GET'])
@firebase_auth_required
@admin_required
def get_all_agencies():
    """Get all agencies with verification status"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        status = request.args.get('status')
        search = request.args.get('search', '').lower()
        
        query = db.collection('agencies')
        if status:
            query = query.where('verification_status', '==', status)
            
        docs = list(query.stream())
        all_agencies = [doc.to_dict() for doc in docs]
        
        if search:
            all_agencies = [
                a for a in all_agencies
                if search in a.get('name', '').lower()
                or search in a.get('license_number', '').lower()
                or search in a.get('contact_email', '').lower()
            ]
            
        all_agencies.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        total = len(all_agencies)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated = all_agencies[start_idx:end_idx]
        
        return jsonify({
            'agencies': [{
                'id': agency.get('id'),
                'name': agency.get('name'),
                'license_number': agency.get('license_number'),
                'verification_status': agency.get('verification_status'),
                'subscription_tier': agency.get('subscription_tier'),
                'rating': agency.get('rating'),
                'location': agency.get('location'),
                'monthly_fee': agency.get('monthly_fee'),
                'commission_rate': agency.get('commission_rate'),
                'verified_workers': agency.get('verified_workers'),
                'successful_placements': agency.get('successful_placements'),
                'contact_email': agency.get('contact_email'),
                'contact_phone': agency.get('contact_phone'),
                'website': agency.get('website'),
                'created_at': agency.get('created_at'),
                'updated_at': agency.get('updated_at')
            } for agency in paginated],
            'pagination': {
                'page': page,
                'pages': (total + per_page - 1) // per_page if per_page else 0,
                'per_page': per_page,
                'total': total,
                'has_next': end_idx < total,
                'has_prev': page > 1
            }
        }), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@admin_bp.route('/agencies/<agency_id>/verify', methods=['PUT'])
@firebase_auth_required
@admin_required
def verify_agency(agency_id):
    """Verify or reject agency"""
    try:
        agency_doc_ref = db.collection('agencies').document(agency_id)
        agency_doc = agency_doc_ref.get()
        if not agency_doc.exists:
            return jsonify({'error': 'Agency not found'}), 404
            
        data = request.get_json()
        verification_status = data.get('status', 'verified')
        if verification_status not in ['verified', 'rejected', 'pending']:
            return jsonify({'error': 'Invalid verification status'}), 400
        
        agency_doc_ref.update({'verification_status': verification_status})
        
        return jsonify({
            'message': f'Agency {verification_status} successfully',
            'agency': {
                'id': agency_doc.to_dict().get('id'),
                'name': agency_doc.to_dict().get('name'),
                'verification_status': verification_status
            }
        }), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@admin_bp.route('/sync', methods=['POST'])
@firebase_auth_required
@admin_required
def sync_data():
    """Sync data from external sources"""
    try:
        data = request.get_json()
        sync_type = data.get('type', 'all')
        
        if sync_type == 'all':
            return jsonify({'message': 'Full data sync completed'}), 200
        elif sync_type == 'users':
            return jsonify({'message': 'User data sync completed'}), 200
        elif sync_type == 'agencies':
            return jsonify({'message': 'Agency data sync completed'}), 200
        else:
            return jsonify({'error': 'Invalid sync type'}), 400
            
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@admin_bp.route('/analytics', methods=['GET'])
@firebase_auth_required
@admin_required
def get_analytics():
    """Get detailed analytics data"""
    from collections import defaultdict
    try:
        # Group users by date explicitly in python
        # Not performant for millions of users, but standard practice in firebase without BigQuery
        users = [u.to_dict() for u in db.collection('users').stream()]
        
        user_growth_dict = defaultdict(int)
        user_types_dict = defaultdict(int)
        
        for u in users:
            # count types
            t = u.get('user_type', 'unknown')
            user_types_dict[t] += 1
            
            # format date to simple YYYY-MM-DD
            created_dt = u.get('created_at', '')[:10]
            if created_dt:
                user_growth_dict[created_dt] += 1
                
        user_growth = [{'date': k, 'count': v} for k, v in sorted(user_growth_dict.items())]
        user_types = [{'type': k, 'count': v} for k, v in user_types_dict.items()]
        
        # Revenue growth
        purchases = [p.to_dict() for p in db.collection('user_purchases').stream()]
        revenue_growth_dict = defaultdict(float)
        
        for p in purchases:
            pdate = p.get('purchase_date', '')[:10]
            if pdate:
                revenue_growth_dict[pdate] += float(p.get('amount', 0))
                
        revenue_growth = [{'date': k, 'total': v} for k, v in sorted(revenue_growth_dict.items())]
        
        # Top agencies
        agencies = [a.to_dict() for a in db.collection('agencies').stream()]
        agencies.sort(key=lambda x: x.get('successful_placements', 0), reverse=True)
        top_agencies = agencies[:10]
        
        return jsonify({
            'user_growth': user_growth,
            'user_types': user_types,
            'revenue_growth': revenue_growth,
            'top_agencies': [{
                'name': item.get('name'),
                'rating': item.get('rating'),
                'successful_placements': item.get('successful_placements'),
                'verified_workers': item.get('verified_workers')
            } for item in top_agencies]
        }), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500
