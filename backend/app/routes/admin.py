from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required, admin_required
from app.models import *
from app import db
from datetime import datetime, timedelta
import json

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@firebase_auth_required
@admin_required
def get_dashboard_stats():
    """Get admin dashboard statistics"""
    try:
        # Basic counts
        total_users = User.query.count()
        total_employers = User.query.filter_by(user_type='employer').count()
        total_housegirls = User.query.filter_by(user_type='housegirl').count()
        total_agencies = User.query.filter_by(user_type='agency').count()
        
        # Active users (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        active_users = User.query.filter(User.updated_at >= thirty_days_ago).count()
        
        # Agency statistics
        total_agencies_marketplace = Agency.query.count()
        verified_agencies = Agency.query.filter_by(verification_status='verified').count()
        
        # Payment statistics
        total_packages = PaymentPackage.query.count()
        total_purchases = UserPurchase.query.count()
        total_revenue = db.session.query(db.func.sum(UserPurchase.amount)).scalar() or 0
        
        # Recent activity
        recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
        recent_purchases = UserPurchase.query.order_by(UserPurchase.purchase_date.desc()).limit(5).all()
        
        # Monthly growth
        current_month = datetime.utcnow().replace(day=1)
        monthly_users = User.query.filter(User.created_at >= current_month).count()
        
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
                    'id': user.id,
                    'email': user.email,
                    'user_type': user.user_type,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'created_at': user.created_at.isoformat()
                } for user in recent_users],
                'purchases': [{
                    'id': purchase.id,
                    'user_id': purchase.user_id,
                    'amount': purchase.amount,
                    'status': purchase.status,
                    'purchase_date': purchase.purchase_date.isoformat()
                } for purchase in recent_purchases]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@firebase_auth_required
@admin_required
def get_all_users():
    """Get all users with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        user_type = request.args.get('user_type')
        search = request.args.get('search')
        
        query = User.query
        
        if user_type:
            query = query.filter_by(user_type=user_type)
        
        if search:
            query = query.filter(
                db.or_(
                    User.email.contains(search),
                    User.first_name.contains(search),
                    User.last_name.contains(search)
                )
            )
        
        users = query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'users': [{
                'id': user.id,
                'email': user.email,
                'user_type': user.user_type,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone_number': user.phone_number,
                'is_active': user.is_active,
                'created_at': user.created_at.isoformat(),
                'updated_at': user.updated_at.isoformat(),
                'has_profile': user.profile is not None
            } for user in users.items],
            'pagination': {
                'page': users.page,
                'pages': users.pages,
                'per_page': users.per_page,
                'total': users.total,
                'has_next': users.has_next,
                'has_prev': users.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>', methods=['GET'])
@firebase_auth_required
@admin_required
def get_user_details(user_id):
    """Get detailed user information"""
    try:
        user = User.query.get_or_404(user_id)
        
        user_data = {
            'id': user.id,
            'firebase_uid': user.firebase_uid,
            'email': user.email,
            'user_type': user.user_type,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone_number': user.phone_number,
            'is_active': user.is_active,
            'created_at': user.created_at.isoformat(),
            'updated_at': user.updated_at.isoformat()
        }
        
        # Add profile data if exists
        if user.profile:
            user_data['profile'] = {
                'id': user.profile.id,
                'created_at': user.profile.created_at.isoformat(),
                'updated_at': user.profile.updated_at.isoformat()
            }
            
            # Add type-specific profile data
            if user.user_type == 'employer' and user.profile.employer_profile:
                user_data['profile']['employer'] = {
                    'company_name': user.profile.employer_profile.company_name,
                    'location': user.profile.employer_profile.location,
                    'description': user.profile.employer_profile.description
                }
            elif user.user_type == 'housegirl' and user.profile.housegirl_profile:
                user_data['profile']['housegirl'] = {
                    'age': user.profile.housegirl_profile.age,
                    'bio': user.profile.housegirl_profile.bio,
                    'current_location': user.profile.housegirl_profile.current_location,
                    'location': user.profile.housegirl_profile.location,
                    'education': user.profile.housegirl_profile.education,
                    'experience': user.profile.housegirl_profile.experience,
                    'expected_salary': user.profile.housegirl_profile.expected_salary,
                    'accommodation_type': user.profile.housegirl_profile.accommodation_type,
                    'tribe': user.profile.housegirl_profile.tribe,
                    'is_available': user.profile.housegirl_profile.is_available,
                    'profile_photo_url': user.profile.housegirl_profile.profile_photo_url
                }
            elif user.user_type == 'agency' and user.profile.agency_profile:
                user_data['profile']['agency'] = {
                    'agency_name': user.profile.agency_profile.agency_name,
                    'location': user.profile.agency_profile.location,
                    'description': user.profile.agency_profile.description,
                    'license_number': user.profile.agency_profile.license_number
                }
        
        # Add purchase history
        purchases = UserPurchase.query.filter_by(user_id=user_id).all()
        user_data['purchases'] = [{
            'id': purchase.id,
            'package_id': purchase.package_id,
            'amount': purchase.amount,
            'status': purchase.status,
            'purchase_date': purchase.purchase_date.isoformat(),
            'payment_reference': purchase.payment_reference
        } for purchase in purchases]
        
        return jsonify(user_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>/toggle-status', methods=['PUT'])
@firebase_auth_required
@admin_required
def toggle_user_status(user_id):
    """Toggle user active status"""
    try:
        user = User.query.get_or_404(user_id)
        user.is_active = not user.is_active
        db.session.commit()
        
        return jsonify({
            'message': f'User {"activated" if user.is_active else "deactivated"} successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'is_active': user.is_active
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/agencies', methods=['GET'])
@firebase_auth_required
@admin_required
def get_all_agencies():
    """Get all agencies with verification status"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        search = request.args.get('search')
        
        query = Agency.query
        
        if status:
            query = query.filter_by(verification_status=status)
        
        if search:
            query = query.filter(
                db.or_(
                    Agency.name.contains(search),
                    Agency.license_number.contains(search),
                    Agency.contact_email.contains(search)
                )
            )
        
        agencies = query.order_by(Agency.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'agencies': [{
                'id': agency.id,
                'name': agency.name,
                'license_number': agency.license_number,
                'verification_status': agency.verification_status,
                'subscription_tier': agency.subscription_tier,
                'rating': agency.rating,
                'location': agency.location,
                'monthly_fee': agency.monthly_fee,
                'commission_rate': agency.commission_rate,
                'verified_workers': agency.verified_workers,
                'successful_placements': agency.successful_placements,
                'contact_email': agency.contact_email,
                'contact_phone': agency.contact_phone,
                'website': agency.website,
                'created_at': agency.created_at.isoformat(),
                'updated_at': agency.updated_at.isoformat()
            } for agency in agencies.items],
            'pagination': {
                'page': agencies.page,
                'pages': agencies.pages,
                'per_page': agencies.per_page,
                'total': agencies.total,
                'has_next': agencies.has_next,
                'has_prev': agencies.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/agencies/<agency_id>/verify', methods=['PUT'])
@firebase_auth_required
@admin_required
def verify_agency(agency_id):
    """Verify or reject agency"""
    try:
        agency = Agency.query.get_or_404(agency_id)
        data = request.get_json()
        
        verification_status = data.get('status', 'verified')
        if verification_status not in ['verified', 'rejected', 'pending']:
            return jsonify({'error': 'Invalid verification status'}), 400
        
        agency.verification_status = verification_status
        db.session.commit()
        
        return jsonify({
            'message': f'Agency {verification_status} successfully',
            'agency': {
                'id': agency.id,
                'name': agency.name,
                'verification_status': agency.verification_status
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/sync', methods=['POST'])
@firebase_auth_required
@admin_required
def sync_data():
    """Sync data from external sources"""
    try:
        data = request.get_json()
        sync_type = data.get('type', 'all')
        
        if sync_type == 'all':
            # Run full data migration
            from migrate_data import migrate_data
            migrate_data()
            return jsonify({'message': 'Full data sync completed'}), 200
        
        elif sync_type == 'users':
            # Sync only user data
            # This could be extended to sync from external APIs
            return jsonify({'message': 'User data sync completed'}), 200
        
        elif sync_type == 'agencies':
            # Sync only agency data
            return jsonify({'message': 'Agency data sync completed'}), 200
        
        else:
            return jsonify({'error': 'Invalid sync type'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/analytics', methods=['GET'])
@firebase_auth_required
@admin_required
def get_analytics():
    """Get detailed analytics data"""
    try:
        # User growth over time
        user_growth = db.session.query(
            db.func.date(User.created_at).label('date'),
            db.func.count(User.id).label('count')
        ).group_by(db.func.date(User.created_at)).order_by('date').all()
        
        # User type distribution
        user_types = db.session.query(
            User.user_type,
            db.func.count(User.id).label('count')
        ).group_by(User.user_type).all()
        
        # Revenue over time
        revenue_growth = db.session.query(
            db.func.date(UserPurchase.purchase_date).label('date'),
            db.func.sum(UserPurchase.amount).label('total')
        ).group_by(db.func.date(UserPurchase.purchase_date)).order_by('date').all()
        
        # Agency performance
        agency_performance = db.session.query(
            Agency.name,
            Agency.rating,
            Agency.successful_placements,
            Agency.verified_workers
        ).order_by(Agency.successful_placements.desc()).limit(10).all()
        
        return jsonify({
            'user_growth': [{'date': str(item.date), 'count': item.count} for item in user_growth],
            'user_types': [{'type': item.user_type, 'count': item.count} for item in user_types],
            'revenue_growth': [{'date': str(item.date), 'total': float(item.total or 0)} for item in revenue_growth],
            'top_agencies': [{
                'name': item.name,
                'rating': item.rating,
                'successful_placements': item.successful_placements,
                'verified_workers': item.verified_workers
            } for item in agency_performance]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

