from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required
from app.firebase_init import db
import logging
# Commenting out middlewares that might rely on SQLAlchemy or need separate refactoring
# from app.middleware.security import rate_limit, validate_json_input, JOB_POSTING_SCHEMA
# from app.middleware.performance import cache_response, compress_response
# from app.middleware.logging import log_request, log_error, log_user_action
from datetime import datetime
import uuid


logger = logging.getLogger(__name__)
jobs_bp = Blueprint('jobs', __name__)

@jobs_bp.route('/', methods=['GET'])
def get_jobs():
    """Get all job postings with filtering"""
    try:
        # Query parameters for filtering
        location = request.args.get('location', '').lower()
        salary_min = request.args.get('salary_min', type=int)
        salary_max = request.args.get('salary_max', type=int)
        accommodation_type = request.args.get('accommodation_type')
        experience = request.args.get('experience')
        education = request.args.get('education')
        status = request.args.get('status', 'active')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        # Validate pagination parameters
        if page < 1 or per_page < 1 or per_page > 100:
            return jsonify({'error': 'Invalid pagination parameters'}), 400
        
        query = db.collection('job_postings').where('status', '==', status)
        
        if accommodation_type:
            query = query.where('accommodation_type', '==', accommodation_type)
        if experience:
            query = query.where('required_experience', '==', experience)
        if education:
            query = query.where('required_education', '==', education)
            
        docs = list(query.stream())
        all_jobs = [doc.to_dict() for doc in docs]
        
        # In-memory filtering for ranges and ilike
        filtered_jobs = []
        for job in all_jobs:
            if location and location not in job.get('location', '').lower():
                continue
            if salary_min and job.get('salary_min', 0) < salary_min:
                continue
            if salary_max and job.get('salary_max', float('inf')) > salary_max:
                continue
            filtered_jobs.append(job)
            
        # sort by created_at desc
        filtered_jobs.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            
        total = len(filtered_jobs)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated = filtered_jobs[start_idx:end_idx]
        
        result = []
        for job in paginated:
            # Get employer info
            emp_id = job.get('employer_id')
            emp_data = {}
            comp_name = None
            comp_loc = None
            
            if emp_id:
                user_doc = db.collection('users').document(emp_id).get()
                if user_doc.exists:
                    emp_data = user_doc.to_dict()
                    
                prof_docs = list(db.collection('profiles').where('user_id', '==', emp_id).limit(1).stream())
                if prof_docs:
                    prof_id = prof_docs[0].to_dict().get('id')
                    emp_prof_docs = list(db.collection('employer_profiles').where('profile_id', '==', prof_id).limit(1).stream())
                    if emp_prof_docs:
                        e_prof = emp_prof_docs[0].to_dict()
                        comp_name = e_prof.get('company_name')
                        comp_loc = e_prof.get('location')
                        
            # Get apps count
            apps_count = len(list(db.collection('job_applications').where('job_id', '==', job.get('id')).stream()))
            
            result.append({
                'id': job.get('id'),
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
                'created_at': job.get('created_at'),
                'updated_at': job.get('updated_at'),
                'employer': {
                    'id': emp_id,
                    'name': f"{emp_data.get('first_name', '')} {emp_data.get('last_name', '')}".strip(),
                    'email': emp_data.get('email'),
                    'phone_number': emp_data.get('phone_number'),
                    'company_name': comp_name,
                    'company_location': comp_loc
                },
                'applications_count': apps_count
            })
        
        return jsonify({
            'jobs': result,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page if per_page else 0,
                'has_next': end_idx < total,
                'has_prev': page > 1
            }
        }), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@jobs_bp.route('/<job_id>', methods=['GET'])
def get_job(job_id):
    """Get specific job posting"""
    try:
        job_doc = db.collection('job_postings').document(job_id).get()
        if not job_doc.exists:
            return jsonify({'error': 'Job not found'}), 404
            
        job = job_doc.to_dict()
        
        # Get employer info
        emp_id = job.get('employer_id')
        emp_data = {}
        comp_name = None
        comp_loc = None
        
        if emp_id:
            user_doc = db.collection('users').document(emp_id).get()
            if user_doc.exists:
                emp_data = user_doc.to_dict()
                
            prof_docs = list(db.collection('profiles').where('user_id', '==', emp_id).limit(1).stream())
            if prof_docs:
                prof_id = prof_docs[0].to_dict().get('id')
                emp_prof_docs = list(db.collection('employer_profiles').where('profile_id', '==', prof_id).limit(1).stream())
                if emp_prof_docs:
                    e_prof = emp_prof_docs[0].to_dict()
                    comp_name = e_prof.get('company_name')
                    comp_loc = e_prof.get('location')
                    
        apps_count = len(list(db.collection('job_applications').where('job_id', '==', job_id).stream()))
        
        return jsonify({
            'id': job.get('id'),
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
            'created_at': job.get('created_at'),
            'updated_at': job.get('updated_at'),
            'employer': {
                'id': emp_id,
                'name': f"{emp_data.get('first_name', '')} {emp_data.get('last_name', '')}".strip(),
                'email': emp_data.get('email'),
                'phone_number': emp_data.get('phone_number'),
                'company_name': comp_name,
                'company_location': comp_loc
            },
            'applications_count': apps_count
        }), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@jobs_bp.route('/', methods=['POST'])
@firebase_auth_required
def create_job():
    """Create new job posting (employers only)"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Check if user is employer
        if getattr(user, 'user_type', '') != 'employer':
            return jsonify({'error': 'Only employers can create job postings'}), 403
        
        data = request.get_json()
        
        # Validate salary range
        if data.get('salary_min', 0) > data.get('salary_max', 0):
            return jsonify({'error': 'Minimum salary cannot be greater than maximum salary'}), 400
        
        # Create job posting
        job_id = f'job_{uuid.uuid4().hex[:12]}'
        job_data = {
            'id': job_id,
            'employer_id': getattr(user, 'id'),
            'title': data['title'],
            'description': data['description'],
            'location': data['location'],
            'salary_min': data['salary_min'],
            'salary_max': data['salary_max'],
            'accommodation_type': data.get('accommodation_type'),
            'required_experience': data.get('required_experience'),
            'required_education': data.get('required_education'),
            'skills_required': data.get('skills_required', []),
            'languages_required': data.get('languages_required', []),
            'status': data.get('status', 'active'),
            'application_deadline': data.get('application_deadline'),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        db.collection('job_postings').document(job_id).set(job_data)
        
        return jsonify(job_data), 201
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@jobs_bp.route('/<job_id>', methods=['PUT'])
@firebase_auth_required
def update_job(job_id):
    """Update job posting (employer only)"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        job_doc_ref = db.collection('job_postings').document(job_id)
        job_doc = job_doc_ref.get()
        if not job_doc.exists:
            return jsonify({'error': 'Job not found'}), 404
            
        job = job_doc.to_dict()
        
        # Check if user owns this job posting
        if job.get('employer_id') != getattr(user, 'id'):
            return jsonify({'error': 'You can only update your own job postings'}), 403
        
        data = request.get_json()
        updates = {}
        fields = [
            'title', 'description', 'location', 'salary_min', 'salary_max',
            'accommodation_type', 'required_experience', 'required_education',
            'skills_required', 'languages_required', 'status', 'application_deadline'
        ]
        
        for field in fields:
            if field in data:
                updates[field] = data[field]
                
        if updates:
            updates['updated_at'] = datetime.utcnow().isoformat()
            job_doc_ref.update(updates)
            
        updated_doc = job_doc_ref.get()
        return jsonify(updated_doc.to_dict()), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@jobs_bp.route('/<job_id>', methods=['DELETE'])
@firebase_auth_required
def delete_job(job_id):
    """Delete job posting (employer only)"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        job_doc_ref = db.collection('job_postings').document(job_id)
        job_doc = job_doc_ref.get()
        if not job_doc.exists:
            return jsonify({'error': 'Job not found'}), 404
            
        job = job_doc.to_dict()
        
        # Check if user owns this job posting
        if job.get('employer_id') != getattr(user, 'id'):
            return jsonify({'error': 'You can only delete your own job postings'}), 403
        
        job_doc_ref.delete()
        
        return jsonify({'message': 'Job posting deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@jobs_bp.route('/<job_id>/apply', methods=['POST'])
@firebase_auth_required
def apply_to_job(job_id):
    """Apply to a job (housegirls only)"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        # Check if user is housegirl
        if getattr(user, 'user_type', '') != 'housegirl':
            return jsonify({'error': 'Only housegirls can apply to jobs'}), 403
        
        job_doc = db.collection('job_postings').document(job_id).get()
        if not job_doc.exists:
            return jsonify({'error': 'Job not found'}), 404
            
        job = job_doc.to_dict()
        
        # Check if job is still active
        if job.get('status') != 'active':
            return jsonify({'error': 'This job is no longer accepting applications'}), 400
        
        user_id = getattr(user, 'id')
        # Check if already applied
        existing = list(db.collection('job_applications')
                        .where('job_id', '==', job_id)
                        .where('housegirl_id', '==', user_id).limit(1).stream())
        
        if existing:
            return jsonify({'error': 'You have already applied to this job'}), 400
        
        data = request.get_json()
        
        # Create job application
        app_id = f'app_{uuid.uuid4().hex[:12]}'
        application_data = {
            'id': app_id,
            'job_id': job_id,
            'housegirl_id': user_id,
            'cover_letter': data.get('cover_letter', ''),
            'status': 'pending',
            'applied_at': datetime.utcnow().isoformat()
        }
        
        db.collection('job_applications').document(app_id).set(application_data)
        
        return jsonify(application_data), 201
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500

@jobs_bp.route('/<job_id>/applications', methods=['GET'])
@firebase_auth_required
def get_job_applications(job_id):
    """Get applications for a job (employer only)"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
            
        job_doc = db.collection('job_postings').document(job_id).get()
        if not job_doc.exists:
            return jsonify({'error': 'Job not found'}), 404
            
        job = job_doc.to_dict()
        
        # Check if user owns this job posting
        if job.get('employer_id') != getattr(user, 'id'):
            return jsonify({'error': 'You can only view applications for your own job postings'}), 403
        
        apps_docs = db.collection('job_applications').where('job_id', '==', job_id).stream()
        
        result = []
        for doc in apps_docs:
            app = doc.to_dict()
            hg_id = app.get('housegirl_id')
            hg_name = ""
            hg_email = ""
            hg_phone = ""
            
            if hg_id:
                hg_user_doc = db.collection('users').document(hg_id).get()
                if hg_user_doc.exists:
                    hg_u = hg_user_doc.to_dict()
                    hg_name = f"{hg_u.get('first_name', '')} {hg_u.get('last_name', '')}".strip()
                    hg_email = hg_u.get('email', '')
                    hg_phone = hg_u.get('phone_number', '')
                    
            result.append({
                'id': app.get('id'),
                'job_id': app.get('job_id'),
                'housegirl_id': app.get('housegirl_id'),
                'cover_letter': app.get('cover_letter'),
                'status': app.get('status'),
                'applied_at': app.get('applied_at'),
                'reviewed_at': app.get('reviewed_at'),
                'housegirl': {
                    'id': hg_id,
                    'name': hg_name,
                    'email': hg_email,
                    'phone_number': hg_phone
                }
            })
        
        return jsonify({'applications': result}), 200
        
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500
