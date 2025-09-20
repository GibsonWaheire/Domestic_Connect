from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required, get_current_user
from app.models import (
    User, Profile, EmployerProfile, HousegirlProfile, AgencyProfile, 
    JobPosting, JobApplication, Agency, AgencyWorker, AgencyClient
)
from app import db
from datetime import datetime
from sqlalchemy.orm import joinedload

cross_entity_bp = Blueprint('cross_entity', __name__)

@cross_entity_bp.route('/dashboard-data', methods=['GET'])
@firebase_auth_required
def get_dashboard_data():
    """Get comprehensive dashboard data based on user type"""
    try:
        current_user = request.current_user
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        user_type = current_user.user_type
        is_admin = current_user.is_admin
        
        # Base data structure
        dashboard_data = {
            'user': {
                'id': current_user.id,
                'email': current_user.email,
                'user_type': current_user.user_type,
                'first_name': current_user.first_name,
                'last_name': current_user.last_name,
                'is_admin': current_user.is_admin
            },
            'stats': {},
            'recent_activity': [],
            'available_data': {}
        }
        
        if user_type == 'employer' or is_admin:
            # Employers can see housegirls, job postings, and agencies
            dashboard_data['available_data']['housegirls'] = get_housegirls_for_employer()
            dashboard_data['available_data']['job_postings'] = get_job_postings_for_employer(current_user.id)
            dashboard_data['available_data']['agencies'] = get_agencies_for_employer()
            
            # Stats for employers
            dashboard_data['stats'] = {
                'total_housegirls': len(dashboard_data['available_data']['housegirls']),
                'my_job_postings': len(dashboard_data['available_data']['job_postings']),
                'total_applications': get_total_applications_for_employer(current_user.id),
                'available_agencies': len(dashboard_data['available_data']['agencies'])
            }
            
        elif user_type == 'housegirl' or is_admin:
            # Housegirls can see job opportunities, employers, and agencies
            dashboard_data['available_data']['job_opportunities'] = get_job_opportunities_for_housegirl()
            dashboard_data['available_data']['employers'] = get_employers_for_housegirl()
            dashboard_data['available_data']['agencies'] = get_agencies_for_housegirl()
            
            # Stats for housegirls
            dashboard_data['stats'] = {
                'available_jobs': len(dashboard_data['available_data']['job_opportunities']),
                'my_applications': get_my_applications_count(current_user.id),
                'total_employers': len(dashboard_data['available_data']['employers']),
                'available_agencies': len(dashboard_data['available_data']['agencies'])
            }
            
        elif user_type == 'agency' or is_admin:
            # Agencies can see employers, housegirls, and their relationships
            dashboard_data['available_data']['clients'] = get_clients_for_agency(current_user.id)
            dashboard_data['available_data']['workers'] = get_workers_for_agency(current_user.id)
            dashboard_data['available_data']['all_employers'] = get_all_employers_for_agency()
            dashboard_data['available_data']['all_housegirls'] = get_all_housegirls_for_agency()
            
            # Stats for agencies
            dashboard_data['stats'] = {
                'total_clients': len(dashboard_data['available_data']['clients']),
                'total_workers': len(dashboard_data['available_data']['workers']),
                'available_employers': len(dashboard_data['available_data']['all_employers']),
                'available_housegirls': len(dashboard_data['available_data']['all_housegirls'])
            }
        
        if is_admin:
            # Admins can see everything
            dashboard_data['available_data']['all_users'] = get_all_users_for_admin()
            dashboard_data['available_data']['all_job_postings'] = get_all_job_postings_for_admin()
            dashboard_data['available_data']['all_applications'] = get_all_applications_for_admin()
            
            # Admin stats
            dashboard_data['stats'].update({
                'total_users': len(dashboard_data['available_data']['all_users']),
                'total_job_postings': len(dashboard_data['available_data']['all_job_postings']),
                'total_applications': len(dashboard_data['available_data']['all_applications'])
            })
        
        return jsonify(dashboard_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_housegirls_for_employer():
    """Get available housegirls for employers to view"""
    housegirls = HousegirlProfile.query.options(
        joinedload(HousegirlProfile.profile).joinedload(Profile.user)
    ).filter(HousegirlProfile.is_available == True).all()
    
    result = []
    for housegirl in housegirls:
        result.append({
            'id': housegirl.id,
            'profile_id': housegirl.profile_id,
            'age': housegirl.age,
            'bio': housegirl.bio,
            'current_location': housegirl.current_location,
            'location': housegirl.location,
            'education': housegirl.education,
            'experience': housegirl.experience,
            'expected_salary': housegirl.expected_salary,
            'accommodation_type': housegirl.accommodation_type,
            'tribe': housegirl.tribe,
            'is_available': housegirl.is_available,
            'profile_photo_url': housegirl.profile_photo_url,
            'first_name': housegirl.profile.user.first_name,
            'last_name': housegirl.profile.user.last_name,
            'phone_number': housegirl.profile.user.phone_number,
            'created_at': housegirl.created_at.isoformat(),
            'updated_at': housegirl.updated_at.isoformat()
        })
    
    return result

def get_job_postings_for_employer(employer_id):
    """Get job postings created by specific employer"""
    job_postings = JobPosting.query.filter_by(employer_id=employer_id).all()
    
    result = []
    for job in job_postings:
        result.append({
            'id': job.id,
            'employer_id': job.employer_id,
            'title': job.title,
            'description': job.description,
            'location': job.location,
            'salary_min': job.salary_min,
            'salary_max': job.salary_max,
            'accommodation_type': job.accommodation_type,
            'required_experience': job.required_experience,
            'required_education': job.required_education,
            'skills_required': job.skills_required,
            'languages_required': job.languages_required,
            'status': job.status,
            'application_deadline': job.application_deadline.isoformat() if job.application_deadline else None,
            'applications_count': job.applications.count(),
            'created_at': job.created_at.isoformat(),
            'updated_at': job.updated_at.isoformat()
        })
    
    return result

def get_agencies_for_employer():
    """Get available agencies for employers"""
    agencies = Agency.query.filter_by(verification_status='verified').all()
    
    result = []
    for agency in agencies:
        result.append({
            'id': agency.id,
            'name': agency.name,
            'license_number': agency.license_number,
            'verification_status': agency.verification_status,
            'subscription_tier': agency.subscription_tier,
            'rating': agency.rating,
            'services': agency.services,
            'location': agency.location,
            'monthly_fee': agency.monthly_fee,
            'commission_rate': agency.commission_rate,
            'verified_workers': agency.verified_workers,
            'successful_placements': agency.successful_placements,
            'description': agency.description,
            'contact_email': agency.contact_email,
            'contact_phone': agency.contact_phone,
            'website': agency.website,
            'created_at': agency.created_at.isoformat(),
            'updated_at': agency.updated_at.isoformat()
        })
    
    return result

def get_job_opportunities_for_housegirl():
    """Get available job opportunities for housegirls"""
    job_postings = JobPosting.query.filter_by(status='active').all()
    
    result = []
    for job in job_postings:
        # Get employer info
        employer = User.query.get(job.employer_id)
        employer_profile = None
        if employer and employer.profile:
            employer_profile = employer.profile.employer_profile
        
        result.append({
            'id': job.id,
            'employer_id': job.employer_id,
            'title': job.title,
            'description': job.description,
            'location': job.location,
            'salary_min': job.salary_min,
            'salary_max': job.salary_max,
            'accommodation_type': job.accommodation_type,
            'required_experience': job.required_experience,
            'required_education': job.required_education,
            'skills_required': job.skills_required,
            'languages_required': job.languages_required,
            'status': job.status,
            'application_deadline': job.application_deadline.isoformat() if job.application_deadline else None,
            'employer': {
                'name': f"{employer.first_name} {employer.last_name}" if employer else "Unknown",
                'company_name': employer_profile.company_name if employer_profile else None,
                'location': employer_profile.location if employer_profile else None
            },
            'created_at': job.created_at.isoformat(),
            'updated_at': job.updated_at.isoformat()
        })
    
    return result

def get_employers_for_housegirl():
    """Get employers that housegirls can see"""
    employers = EmployerProfile.query.options(
        joinedload(EmployerProfile.profile).joinedload(Profile.user)
    ).all()
    
    result = []
    for employer in employers:
        result.append({
            'id': employer.id,
            'profile_id': employer.profile_id,
            'company_name': employer.company_name,
            'location': employer.location,
            'description': employer.description,
            'first_name': employer.profile.user.first_name,
            'last_name': employer.profile.user.last_name,
            'email': employer.profile.user.email,
            'phone_number': employer.profile.user.phone_number,
            'created_at': employer.created_at.isoformat(),
            'updated_at': employer.updated_at.isoformat()
        })
    
    return result

def get_agencies_for_housegirl():
    """Get agencies that housegirls can see"""
    return get_agencies_for_employer()  # Same data for both

def get_clients_for_agency(agency_id):
    """Get clients (employers) for specific agency"""
    clients = AgencyClient.query.filter_by(agency_id=agency_id).all()
    
    result = []
    for client in clients:
        employer_profile = EmployerProfile.query.get(client.client_id)
        if employer_profile:
            result.append({
                'id': client.id,
                'agency_id': client.agency_id,
                'client_id': client.client_id,
                'hiring_fee': client.hiring_fee,
                'placement_status': client.placement_status,
                'hire_date': client.hire_date.isoformat() if client.hire_date else None,
                'worker_id': client.worker_id,
                'commission_paid': client.commission_paid,
                'dispute_resolution': client.dispute_resolution,
                'employer': {
                    'company_name': employer_profile.company_name,
                    'location': employer_profile.location,
                    'description': employer_profile.description
                },
                'created_at': client.created_at.isoformat(),
                'updated_at': client.updated_at.isoformat()
            })
    
    return result

def get_workers_for_agency(agency_id):
    """Get workers (housegirls) for specific agency"""
    workers = AgencyWorker.query.filter_by(agency_id=agency_id).all()
    
    result = []
    for worker in workers:
        housegirl_profile = HousegirlProfile.query.get(worker.worker_id)
        if housegirl_profile:
            result.append({
                'id': worker.id,
                'agency_id': worker.agency_id,
                'worker_id': worker.worker_id,
                'verification_status': worker.verification_status,
                'training_certificates': worker.training_certificates,
                'background_check_status': worker.background_check_status,
                'membership_fee': worker.membership_fee,
                'join_date': worker.join_date.isoformat() if worker.join_date else None,
                'is_active': worker.is_active,
                'housegirl': {
                    'age': housegirl_profile.age,
                    'bio': housegirl_profile.bio,
                    'location': housegirl_profile.location,
                    'education': housegirl_profile.education,
                    'experience': housegirl_profile.experience,
                    'expected_salary': housegirl_profile.expected_salary,
                    'is_available': housegirl_profile.is_available
                },
                'created_at': worker.created_at.isoformat(),
                'updated_at': worker.updated_at.isoformat()
            })
    
    return result

def get_all_employers_for_agency():
    """Get all employers for agencies to see"""
    return get_employers_for_housegirl()  # Same data

def get_all_housegirls_for_agency():
    """Get all housegirls for agencies to see"""
    return get_housegirls_for_employer()  # Same data

def get_all_users_for_admin():
    """Get all users for admin dashboard"""
    users = User.query.all()
    
    result = []
    for user in users:
        result.append({
            'id': user.id,
            'email': user.email,
            'user_type': user.user_type,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone_number': user.phone_number,
            'is_active': user.is_active,
            'is_admin': user.is_admin,
            'created_at': user.created_at.isoformat(),
            'updated_at': user.updated_at.isoformat()
        })
    
    return result

def get_all_job_postings_for_admin():
    """Get all job postings for admin dashboard"""
    job_postings = JobPosting.query.all()
    
    result = []
    for job in job_postings:
        result.append({
            'id': job.id,
            'employer_id': job.employer_id,
            'title': job.title,
            'description': job.description,
            'location': job.location,
            'salary_min': job.salary_min,
            'salary_max': job.salary_max,
            'status': job.status,
            'applications_count': job.applications.count(),
            'created_at': job.created_at.isoformat(),
            'updated_at': job.updated_at.isoformat()
        })
    
    return result

def get_all_applications_for_admin():
    """Get all job applications for admin dashboard"""
    applications = JobApplication.query.all()
    
    result = []
    for app in applications:
        result.append({
            'id': app.id,
            'job_id': app.job_id,
            'housegirl_id': app.housegirl_id,
            'cover_letter': app.cover_letter,
            'status': app.status,
            'applied_at': app.applied_at.isoformat(),
            'reviewed_at': app.reviewed_at.isoformat() if app.reviewed_at else None
        })
    
    return result

def get_total_applications_for_employer(employer_id):
    """Get total applications for employer's job postings"""
    job_postings = JobPosting.query.filter_by(employer_id=employer_id).all()
    total_applications = 0
    for job in job_postings:
        total_applications += job.applications.count()
    return total_applications

def get_my_applications_count(housegirl_id):
    """Get count of applications by housegirl"""
    return JobApplication.query.filter_by(housegirl_id=housegirl_id).count()
