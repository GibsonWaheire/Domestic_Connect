from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required
from app.firebase_init import db
from app import limiter
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
@limiter.limit("60 per hour")
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

@jobs_bp.route('/my-applications', methods=['GET'])
@firebase_auth_required
def get_my_applications():
    """Get all applications submitted by the current housegirl"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
        if getattr(user, 'user_type', '') != 'housegirl':
            return jsonify({'error': 'Only housegirls can view their applications'}), 403

        user_id = getattr(user, 'id')
        apps_docs = list(db.collection('job_applications').where('housegirl_id', '==', user_id).stream())

        result = []
        for doc in apps_docs:
            app_data = doc.to_dict()
            job_id_ref = app_data.get('job_id')
            job_title = ''
            job_location = ''
            job_salary_min = None
            job_salary_max = None

            if job_id_ref:
                job_doc = db.collection('job_postings').document(job_id_ref).get()
                if job_doc.exists:
                    jd = job_doc.to_dict()
                    job_title = jd.get('title', '')
                    job_location = jd.get('location', '')
                    job_salary_min = jd.get('salary_min')
                    job_salary_max = jd.get('salary_max')

            result.append({
                'id': app_data.get('id'),
                'job_id': job_id_ref,
                'job_title': job_title,
                'job_location': job_location,
                'job_salary_min': job_salary_min,
                'job_salary_max': job_salary_max,
                'cover_letter': app_data.get('cover_letter'),
                'status': app_data.get('status'),
                'applied_at': app_data.get('applied_at'),
            })

        result.sort(key=lambda x: x.get('applied_at', ''), reverse=True)
        return jsonify({'applications': result}), 200

    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500


@jobs_bp.route('/<job_id>', methods=['GET'])
@limiter.limit("60 per hour")
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
        
        data = request.get_json() or {}

        # Required fields
        required = ['title', 'description', 'location', 'salary_min', 'salary_max']
        missing = [f for f in required if not data.get(f) and data.get(f) != 0]
        if missing:
            return jsonify({'error': f'Missing required fields: {", ".join(missing)}'}), 400

        # Length limits
        if len(str(data['title'])) > 200:
            return jsonify({'error': 'Title must be 200 characters or fewer'}), 400
        if len(str(data['description'])) > 3000:
            return jsonify({'error': 'Description must be 3000 characters or fewer'}), 400
        if len(str(data['location'])) > 100:
            return jsonify({'error': 'Location must be 100 characters or fewer'}), 400

        # Salary must be non-negative numbers
        try:
            salary_min = int(data['salary_min'])
            salary_max = int(data['salary_max'])
            if salary_min < 0 or salary_max < 0:
                raise ValueError
        except (TypeError, ValueError):
            return jsonify({'error': 'Salary values must be non-negative numbers'}), 400

        # Salary range
        if salary_min > salary_max:
            return jsonify({'error': 'Minimum salary cannot be greater than maximum salary'}), 400

        # Sanitize free-text enum fields (accept any reasonable string; no hard enum list)
        if data.get('accommodation_type') and len(str(data['accommodation_type'])) > 50:
            return jsonify({'error': 'accommodation_type is too long'}), 400
        if data.get('required_experience') and len(str(data['required_experience'])) > 50:
            return jsonify({'error': 'required_experience is too long'}), 400

        # Create job posting
        job_id = f'job_{uuid.uuid4().hex[:12]}'
        job_data = {
            'id': job_id,
            'employer_id': getattr(user, 'id'),
            'title': str(data['title']).strip(),
            'description': str(data['description']).strip(),
            'location': str(data['location']).strip(),
            'salary_min': salary_min,
            'salary_max': salary_max,
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
@limiter.limit("20 per hour; 5 per minute")
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
            return jsonify({'error': 'You have already applied to this job'}), 409
        
        data = request.get_json() or {}

        cover_letter = str(data.get('cover_letter', '') or '').strip()
        if len(cover_letter) > 2000:
            return jsonify({'error': 'Cover letter must be 2000 characters or fewer'}), 400

        # Create job application
        app_id = f'app_{uuid.uuid4().hex[:12]}'
        application_data = {
            'id': app_id,
            'job_id': job_id,
            'housegirl_id': user_id,
            'cover_letter': cover_letter,
            'status': 'applied',
            'applied_at': datetime.utcnow().isoformat()
        }
        
        db.collection('job_applications').document(app_id).set(application_data)

        # Auto-close job when it reaches 5 applicants — drops from public listing for renewal
        MAX_APPLICANTS = 5
        total_apps = len(list(db.collection('job_applications').where('job_id', '==', job_id).stream()))
        if total_apps >= MAX_APPLICANTS:
            db.collection('job_postings').document(job_id).update({
                'status': 'full',
                'updated_at': datetime.utcnow().isoformat()
            })
            logger.info('Job %s closed (full): %d applicants', job_id, total_apps)

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

        MAX_APPLICANTS_VISIBLE = 7

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

        result = result[:MAX_APPLICANTS_VISIBLE]

        return jsonify({'applications': result, 'applicants_cap': MAX_APPLICANTS_VISIBLE}), 200

    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({
            'error': 'Something went wrong. Please try again.'
        }), 500


@jobs_bp.route('/employer-applications', methods=['GET'])
@firebase_auth_required
def get_employer_applications():
    """All applications across all jobs posted by the logged-in employer"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401

        job_docs = list(
            db.collection('job_postings')
            .where('employer_id', '==', getattr(user, 'id'))
            .stream()
        )

        result = []
        for job_doc in job_docs:
            job = job_doc.to_dict()
            job_id = job_doc.id
            app_docs = list(
                db.collection('job_applications').where('job_id', '==', job_id).stream()
            )
            for app_doc in app_docs:
                app = app_doc.to_dict()
                hg_id = app.get('housegirl_id', '')
                hg_name, hg_phone = '', ''
                if hg_id:
                    hg_doc = db.collection('users').document(hg_id).get()
                    if hg_doc.exists:
                        hg = hg_doc.to_dict()
                        hg_name = f"{hg.get('first_name', '')} {hg.get('last_name', '')}".strip()
                        hg_phone = hg.get('phone_number', '')
                result.append({
                    'id': app.get('id') or app_doc.id,
                    'job_id': job_id,
                    'job_title': job.get('title', ''),
                    'job_location': job.get('location', ''),
                    'housegirl_id': hg_id,
                    'housegirl_name': hg_name or 'Applicant',
                    'housegirl_phone': hg_phone,
                    'cover_letter': app.get('cover_letter', ''),
                    'status': app.get('status', 'pending'),
                    'applied_at': app.get('applied_at', ''),
                })

        result.sort(key=lambda x: x.get('applied_at') or '', reverse=True)
        return jsonify({'applications': result}), 200

    except Exception as e:
        logger.error(f'get_employer_applications error: {str(e)}')
        return jsonify({'error': 'Something went wrong.'}), 500


@jobs_bp.route('/applications/<app_id>/status', methods=['PUT'])
@firebase_auth_required
def update_application_status(app_id):
    """Employer updates an application status"""
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.get_json() or {}
        new_status = data.get('status', '')
        if new_status not in ('pending', 'reviewed', 'accepted', 'rejected'):
            return jsonify({'error': 'Invalid status'}), 400

        app_ref = db.collection('job_applications').document(app_id)
        app_snap = app_ref.get()
        if not app_snap.exists:
            docs = list(db.collection('job_applications').where('id', '==', app_id).limit(1).stream())
            if not docs:
                return jsonify({'error': 'Application not found'}), 404
            app_ref = docs[0].reference
            app_snap = docs[0]

        app = app_snap.to_dict()
        job_doc = db.collection('job_postings').document(app.get('job_id', '')).get()
        if not job_doc.exists or job_doc.to_dict().get('employer_id') != getattr(user, 'id'):
            return jsonify({'error': 'Forbidden'}), 403

        from datetime import datetime
        app_ref.update({'status': new_status, 'reviewed_at': datetime.utcnow().isoformat()})
        return jsonify({'success': True, 'status': new_status}), 200

    except Exception as e:
        logger.error(f'update_application_status error: {str(e)}')
        return jsonify({'error': 'Something went wrong.'}), 500
