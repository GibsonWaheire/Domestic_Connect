from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required
from app.firebase_init import db
import logging


logger = logging.getLogger(__name__)
cross_entity_bp = Blueprint('cross_entity', __name__)

@cross_entity_bp.route('/dashboard-data', methods=['GET'])
@firebase_auth_required
def get_dashboard_data():
    """Get comprehensive dashboard data based on user type"""
    try:
        current_user = request.current_user
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
            
        user_type = getattr(current_user, 'user_type', '')
        is_admin = getattr(current_user, 'is_admin', False)
        user_id = getattr(current_user, 'id', '')
        
        # Base data structure
        dashboard_data = {
            'user': {
                'id': user_id,
                'email': getattr(current_user, 'email', ''),
                'user_type': user_type,
                'first_name': getattr(current_user, 'first_name', ''),
                'last_name': getattr(current_user, 'last_name', ''),
                'is_admin': is_admin
            },
            'stats': {},
            'recent_activity': [],
            'available_data': {}
        }
        
        if user_type == 'employer' or is_admin:
            dashboard_data['available_data']['housegirls'] = get_housegirls_for_employer(
                include_unavailable=is_admin
            )
            dashboard_data['available_data']['job_postings'] = get_job_postings_for_employer(user_id)
            dashboard_data['available_data']['agencies'] = get_agencies_for_employer()
            
            dashboard_data['stats'] = {
                'total_housegirls': len(dashboard_data['available_data']['housegirls']),
                'my_job_postings': len(dashboard_data['available_data']['job_postings']),
                'total_applications': get_total_applications_for_employer(user_id),
                'available_agencies': len(dashboard_data['available_data']['agencies'])
            }
            
        if user_type == 'housegirl' or is_admin:
            dashboard_data['available_data']['job_opportunities'] = get_job_opportunities_for_housegirl()
            dashboard_data['available_data']['employers'] = get_employers_for_housegirl()
            dashboard_data['available_data']['agencies'] = get_agencies_for_housegirl()
            
            dashboard_data['stats'].update({
                'available_jobs': len(dashboard_data['available_data']['job_opportunities']),
                'my_applications': get_my_applications_count(user_id),
                'total_employers': len(dashboard_data['available_data']['employers']),
                'available_agencies': len(dashboard_data['available_data']['agencies'])
            })
            
        if user_type == 'agency' or is_admin:
            dashboard_data['available_data']['clients'] = get_clients_for_agency(user_id)
            dashboard_data['available_data']['workers'] = get_workers_for_agency(user_id)
            dashboard_data['available_data']['all_employers'] = get_all_employers_for_agency()
            dashboard_data['available_data']['all_housegirls'] = get_all_housegirls_for_agency(
                include_unavailable=is_admin
            )
            
            dashboard_data['stats'].update({
                'total_clients': len(dashboard_data['available_data']['clients']),
                'total_workers': len(dashboard_data['available_data']['workers']),
                'available_employers': len(dashboard_data['available_data']['all_employers']),
                'available_housegirls': len(dashboard_data['available_data']['all_housegirls'])
            })
        
        if is_admin:
            dashboard_data['available_data']['all_users'] = get_all_users_for_admin()
            dashboard_data['available_data']['all_job_postings'] = get_all_job_postings_for_admin()
            dashboard_data['available_data']['all_applications'] = get_all_applications_for_admin()
            
            dashboard_data['stats'].update({
                'total_users': len(dashboard_data['available_data']['all_users']),
                'total_job_postings': len(dashboard_data['available_data']['all_job_postings']),
                'total_applications': len(dashboard_data['available_data']['all_applications'])
            })
        
        return jsonify(dashboard_data), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

def get_housegirls_for_employer(include_unavailable=False):
    """Get available housegirls for employers to view"""
    query = db.collection('housegirl_profiles')
    if not include_unavailable:
        query = query.where('is_available', '==', True)
    hg_docs = query.stream()

    result = []
    for doc in hg_docs:
        housegirl = doc.to_dict()
        hg_id = housegirl.get('id') or doc.id
        pid = housegirl.get('profile_id')
        first_name = ""
        last_name = ""
        phone = ""
        email = ""

        if not pid:
            logger.warning(f'get_housegirls_for_employer: housegirl doc {hg_id} missing profile_id')
        else:
            prof_doc = db.collection('profiles').document(pid).get()
            if prof_doc.exists:
                user_id = prof_doc.to_dict().get('user_id')
                if not user_id:
                    logger.warning(f'get_housegirls_for_employer: profile {pid} missing user_id')
                else:
                    user_doc = db.collection('users').document(user_id).get()
                    if user_doc.exists:
                        u = user_doc.to_dict()
                        first_name = u.get('first_name', '')
                        last_name = u.get('last_name', '')
                        phone = u.get('phone_number', '')
                        email = u.get('email', '')

        unlock_count = len(list(
            db.collection('contact_access')
            .where('housegirl_id', '==', hg_id)
            .stream()
        ))

        result.append({
            'id': hg_id,
            'profile_id': pid,
            'age': housegirl.get('age'),
            'bio': housegirl.get('bio'),
            'current_location': housegirl.get('current_location'),
            'location': housegirl.get('location'),
            'education': housegirl.get('education'),
            'experience': housegirl.get('experience'),
            'skills': housegirl.get('skills', []),
            'expected_salary': housegirl.get('expected_salary'),
            'accommodation_type': housegirl.get('accommodation_type'),
            'tribe': housegirl.get('tribe'),
            'is_available': housegirl.get('is_available'),
            'profile_photo_url': housegirl.get('profile_photo_url'),
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'phone_number': phone,
            'unlock_count': unlock_count,
            'created_at': housegirl.get('created_at'),
            'updated_at': housegirl.get('updated_at')
        })
    return result

def get_job_postings_for_employer(employer_id):
    """Get job postings created by specific employer"""
    job_docs = db.collection('job_postings').where('employer_id', '==', employer_id).stream()
    
    result = []
    for doc in job_docs:
        job = doc.to_dict()
        apps_count = len(list(db.collection('job_applications').where('job_id', '==', job.get('id')).stream()))
        
        result.append({
            'id': job.get('id'),
            'employer_id': job.get('employer_id'),
            'title': job.get('title'),
            'description': job.get('description'),
            'location': job.get('location'),
            'salary_min': job.get('salary_min'),
            'salary_max': job.get('salary_max'),
            'accommodation_type': job.get('accommodation_type'),
            'required_experience': job.get('required_experience'),
            'required_education': job.get('required_education'),
            'skills_required': job.get('skills_required', []),
            'languages_required': job.get('languages_required', []),
            'status': job.get('status'),
            'application_deadline': job.get('application_deadline'),
            'applications_count': apps_count,
            'created_at': job.get('created_at'),
            'updated_at': job.get('updated_at')
        })
    return result

def get_agencies_for_employer():
    """Get available agencies for employers"""
    agencies_docs = db.collection('agencies').where('verification_status', '==', 'verified').stream()
    
    result = []
    for doc in agencies_docs:
        agency = doc.to_dict()
        result.append({
            'id': agency.get('id'),
            'name': agency.get('name'),
            'license_number': agency.get('license_number'),
            'verification_status': agency.get('verification_status'),
            'subscription_tier': agency.get('subscription_tier'),
            'rating': agency.get('rating'),
            'services': agency.get('services', []),
            'location': agency.get('location'),
            'monthly_fee': agency.get('monthly_fee'),
            'commission_rate': agency.get('commission_rate'),
            'verified_workers': agency.get('verified_workers'),
            'successful_placements': agency.get('successful_placements'),
            'description': agency.get('description'),
            'contact_email': agency.get('contact_email'),
            'contact_phone': agency.get('contact_phone'),
            'website': agency.get('website'),
            'created_at': agency.get('created_at'),
            'updated_at': agency.get('updated_at')
        })
    return result

def get_job_opportunities_for_housegirl():
    """Get available job opportunities for housegirls"""
    job_docs = db.collection('job_postings').where('status', '==', 'active').stream()
    
    result = []
    for doc in job_docs:
        job = doc.to_dict()
        emp_id = job.get('employer_id')
        emp_name = "Unknown"
        comp_name = None
        comp_loc = None
        
        if emp_id:
            user_doc = db.collection('users').document(emp_id).get()
            if user_doc.exists:
                u = user_doc.to_dict()
                emp_name = f"{u.get('first_name', '')} {u.get('last_name', '')}".strip()
                
            prof_docs = list(db.collection('profiles').where('user_id', '==', emp_id).limit(1).stream())
            if prof_docs:
                p_id = prof_docs[0].to_dict().get('id')
                emp_prof_docs = list(db.collection('employer_profiles').where('profile_id', '==', p_id).limit(1).stream())
                if emp_prof_docs:
                    ep = emp_prof_docs[0].to_dict()
                    comp_name = ep.get('company_name')
                    comp_loc = ep.get('location')
                    
        result.append({
            'id': job.get('id'),
            'employer_id': emp_id,
            'title': job.get('title'),
            'description': job.get('description'),
            'location': job.get('location'),
            'salary_min': job.get('salary_min'),
            'salary_max': job.get('salary_max'),
            'accommodation_type': job.get('accommodation_type'),
            'required_experience': job.get('required_experience'),
            'required_education': job.get('required_education'),
            'skills_required': job.get('skills_required', []),
            'languages_required': job.get('languages_required', []),
            'status': job.get('status'),
            'application_deadline': job.get('application_deadline'),
            'employer': {
                'name': emp_name,
                'company_name': comp_name,
                'location': comp_loc
            },
            'created_at': job.get('created_at'),
            'updated_at': job.get('updated_at')
        })
    return result

def get_employers_for_housegirl():
    """Get employers that housegirls can see"""
    emp_docs = db.collection('employer_profiles').stream()
    
    result = []
    for doc in emp_docs:
        emp = doc.to_dict()
        pid = emp.get('profile_id')
        first_name = ""
        last_name = ""
        email = ""
        phone = ""
        
        if pid:
            prof_doc = db.collection('profiles').document(pid).get()
            if prof_doc.exists:
                user_id = prof_doc.to_dict().get('user_id')
                if user_id:
                    user_doc = db.collection('users').document(user_id).get()
                    if user_doc.exists:
                        u = user_doc.to_dict()
                        first_name = u.get('first_name', '')
                        last_name = u.get('last_name', '')
                        email = u.get('email', '')
                        phone = u.get('phone_number', '')
                        
        result.append({
            'id': emp.get('id'),
            'profile_id': pid,
            'company_name': emp.get('company_name'),
            'location': emp.get('location'),
            'description': emp.get('description'),
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'phone_number': phone,
            'created_at': emp.get('created_at'),
            'updated_at': emp.get('updated_at')
        })
    return result

def get_agencies_for_housegirl():
    return get_agencies_for_employer()

def get_clients_for_agency(agency_id):
    clients_docs = db.collection('agency_clients').where('agency_id', '==', agency_id).stream()
    
    result = []
    for doc in clients_docs:
        client = doc.to_dict()
        client_id = client.get('client_id')
        comp_name = ""
        comp_loc = ""
        comp_desc = ""
        
        if client_id:
            emp_prof_doc = db.collection('employer_profiles').document(client_id).get()
            if emp_prof_doc.exists:
                ep = emp_prof_doc.to_dict()
                comp_name = ep.get('company_name', '')
                comp_loc = ep.get('location', '')
                comp_desc = ep.get('description', '')
                
        result.append({
            'id': client.get('id'),
            'agency_id': client.get('agency_id'),
            'client_id': client_id,
            'hiring_fee': client.get('hiring_fee'),
            'placement_status': client.get('placement_status'),
            'hire_date': client.get('hire_date'),
            'worker_id': client.get('worker_id'),
            'commission_paid': client.get('commission_paid'),
            'dispute_resolution': client.get('dispute_resolution'),
            'employer': {
                'company_name': comp_name,
                'location': comp_loc,
                'description': comp_desc
            },
            'created_at': client.get('created_at'),
            'updated_at': client.get('updated_at')
        })
    return result

def get_workers_for_agency(agency_id):
    workers_docs = db.collection('agency_workers').where('agency_id', '==', agency_id).stream()
    
    result = []
    for doc in workers_docs:
        worker = doc.to_dict()
        worker_id = worker.get('worker_id')
        hg_data = {}
        
        if worker_id:
            hg_doc = db.collection('housegirl_profiles').document(worker_id).get()
            if hg_doc.exists:
                hg_data = hg_doc.to_dict()
                
        result.append({
            'id': worker.get('id'),
            'agency_id': worker.get('agency_id'),
            'worker_id': worker_id,
            'verification_status': worker.get('verification_status'),
            'training_certificates': worker.get('training_certificates'),
            'background_check_status': worker.get('background_check_status'),
            'membership_fee': worker.get('membership_fee'),
            'join_date': worker.get('join_date'),
            'is_active': worker.get('is_active'),
            'housegirl': {
                'age': hg_data.get('age'),
                'bio': hg_data.get('bio'),
                'location': hg_data.get('location'),
                'education': hg_data.get('education'),
                'experience': hg_data.get('experience'),
                'expected_salary': hg_data.get('expected_salary'),
                'is_available': hg_data.get('is_available')
            },
            'created_at': worker.get('created_at'),
            'updated_at': worker.get('updated_at')
        })
    return result

def get_all_employers_for_agency():
    return get_employers_for_housegirl()

def get_all_housegirls_for_agency(include_unavailable=False):
    return get_housegirls_for_employer(include_unavailable=include_unavailable)

def get_all_users_for_admin():
    users_docs = db.collection('users').stream()
    return [{
        'id': u.to_dict().get('id'),
        'email': u.to_dict().get('email'),
        'user_type': u.to_dict().get('user_type'),
        'first_name': u.to_dict().get('first_name'),
        'last_name': u.to_dict().get('last_name'),
        'phone_number': u.to_dict().get('phone_number'),
        'is_active': u.to_dict().get('is_active', True),
        'is_admin': u.to_dict().get('is_admin', False),
        'created_at': u.to_dict().get('created_at'),
        'updated_at': u.to_dict().get('updated_at')
    } for u in users_docs]

def get_all_job_postings_for_admin():
    job_docs = db.collection('job_postings').stream()
    result = []
    for doc in job_docs:
        job = doc.to_dict()
        apps_count = len(list(db.collection('job_applications').where('job_id', '==', job.get('id')).stream()))
        
        result.append({
            'id': job.get('id'),
            'employer_id': job.get('employer_id'),
            'title': job.get('title'),
            'description': job.get('description'),
            'location': job.get('location'),
            'salary_min': job.get('salary_min'),
            'salary_max': job.get('salary_max'),
            'status': job.get('status'),
            'applications_count': apps_count,
            'created_at': job.get('created_at'),
            'updated_at': job.get('updated_at')
        })
    return result

def get_all_applications_for_admin():
    app_docs = db.collection('job_applications').stream()
    return [{
        'id': a.to_dict().get('id'),
        'job_id': a.to_dict().get('job_id'),
        'housegirl_id': a.to_dict().get('housegirl_id'),
        'cover_letter': a.to_dict().get('cover_letter'),
        'status': a.to_dict().get('status'),
        'applied_at': a.to_dict().get('applied_at'),
        'reviewed_at': a.to_dict().get('reviewed_at')
    } for a in app_docs]

def get_total_applications_for_employer(employer_id):
    job_docs = db.collection('job_postings').where('employer_id', '==', employer_id).stream()
    total = 0
    for job in job_docs:
        job_id = job.to_dict().get('id')
        total += len(list(db.collection('job_applications').where('job_id', '==', job_id).stream()))
    return total

def get_my_applications_count(housegirl_id):
    return len(list(db.collection('job_applications').where('housegirl_id', '==', housegirl_id).stream()))
