from flask import Blueprint, request, jsonify
from app.services.auth_service import login_required, get_current_user
from app.models import JobPosting, JobApplication, User, EmployerProfile, Profile
from app import db
from app.middleware.security import rate_limit, validate_json_input, JOB_POSTING_SCHEMA
from app.middleware.performance import cache_response, compress_response
from app.middleware.logging import log_request, log_error, log_user_action
from datetime import datetime
import uuid

jobs_bp = Blueprint('jobs', __name__)

@jobs_bp.route('/', methods=['GET'])
@cache_response(timeout=300)  # Cache for 5 minutes
@compress_response()
@log_request()
def get_jobs():
    """Get all job postings with filtering"""
    try:
        # Query parameters for filtering
        location = request.args.get('location')
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
        
        # Build query
        query = JobPosting.query.join(User).filter(JobPosting.status == status)
        
        if location:
            query = query.filter(JobPosting.location.ilike(f'%{location}%'))
        if salary_min:
            query = query.filter(JobPosting.salary_min >= salary_min)
        if salary_max:
            query = query.filter(JobPosting.salary_max <= salary_max)
        if accommodation_type:
            query = query.filter(JobPosting.accommodation_type == accommodation_type)
        if experience:
            query = query.filter(JobPosting.required_experience == experience)
        if education:
            query = query.filter(JobPosting.required_education == education)
        
        # Paginate results
        jobs = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        result = []
        for job in jobs.items:
            # Get employer profile info
            employer_profile = EmployerProfile.query.join(Profile).filter(Profile.user_id == job.employer_id).first()
            
            result.append({
                'id': job.id,
                'title': job.title,
                'description': job.description,
                'location': job.location,
                'salary_min': job.salary_min,
                'salary_max': job.salary_max,
                'accommodation_type': job.accommodation_type,
                'required_experience': job.required_experience,
                'required_education': job.required_education,
                'skills_required': job.skills_required or [],
                'languages_required': job.languages_required or [],
                'status': job.status,
                'application_deadline': job.application_deadline.isoformat() if job.application_deadline else None,
                'created_at': job.created_at.isoformat(),
                'updated_at': job.updated_at.isoformat(),
                'employer': {
                    'id': job.employer_id,
                    'name': f"{job.employer.first_name} {job.employer.last_name}",
                    'email': job.employer.email,
                    'phone_number': job.employer.phone_number,
                    'company_name': employer_profile.company_name if employer_profile else None,
                    'company_location': employer_profile.location if employer_profile else None
                },
                'applications_count': job.applications.count()
            })
        
        return jsonify({
            'jobs': result,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': jobs.total,
                'pages': jobs.pages,
                'has_next': jobs.has_next,
                'has_prev': jobs.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@jobs_bp.route('/<job_id>', methods=['GET'])
def get_job(job_id):
    """Get specific job posting"""
    try:
        job = JobPosting.query.get_or_404(job_id)
        
        # Get employer profile info
        employer_profile = EmployerProfile.query.join(Profile).filter(Profile.user_id == job.employer_id).first()
        
        return jsonify({
            'id': job.id,
            'title': job.title,
            'description': job.description,
            'location': job.location,
            'salary_min': job.salary_min,
            'salary_max': job.salary_max,
            'accommodation_type': job.accommodation_type,
            'required_experience': job.required_experience,
            'required_education': job.required_education,
            'skills_required': job.skills_required or [],
            'languages_required': job.languages_required or [],
            'status': job.status,
            'application_deadline': job.application_deadline.isoformat() if job.application_deadline else None,
            'created_at': job.created_at.isoformat(),
            'updated_at': job.updated_at.isoformat(),
            'employer': {
                'id': job.employer_id,
                'name': f"{job.employer.first_name} {job.employer.last_name}",
                'email': job.employer.email,
                'phone_number': job.employer.phone_number,
                'company_name': employer_profile.company_name if employer_profile else None,
                'company_location': employer_profile.location if employer_profile else None
            },
            'applications_count': job.applications.count()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@jobs_bp.route('/', methods=['POST'])
@login_required
@rate_limit(max_requests=10, window_seconds=3600)  # 10 job postings per hour
@validate_json_input(JOB_POSTING_SCHEMA)
@log_request()
@log_error()
def create_job():
    """Create new job posting (employers only)"""
    try:
        user = get_current_user()
        
        # Check if user is employer
        if user.user_type != 'employer':
            return jsonify({'error': 'Only employers can create job postings'}), 403
        
        data = request.get_json()
        
        # Validate salary range
        if data['salary_min'] > data['salary_max']:
            return jsonify({'error': 'Minimum salary cannot be greater than maximum salary'}), 400
        
        # Create job posting
        job = JobPosting(
            id=f'job_{uuid.uuid4().hex[:12]}',
            employer_id=user.id,
            title=data['title'],
            description=data['description'],
            location=data['location'],
            salary_min=data['salary_min'],
            salary_max=data['salary_max'],
            accommodation_type=data['accommodation_type'],
            required_experience=data['required_experience'],
            required_education=data['required_education'],
            skills_required=data.get('skills_required', []),
            languages_required=data.get('languages_required', []),
            status=data.get('status', 'active'),
            application_deadline=datetime.fromisoformat(data['application_deadline']) if data.get('application_deadline') else None
        )
        
        # Log user action
        log_user_action(user.id, 'create_job', {'job_id': job.id, 'title': job.title})
        
        return jsonify({
            'id': job.id,
            'title': job.title,
            'description': job.description,
            'location': job.location,
            'salary_min': job.salary_min,
            'salary_max': job.salary_max,
            'accommodation_type': job.accommodation_type,
            'required_experience': job.required_experience,
            'required_education': job.required_education,
            'skills_required': job.skills_required or [],
            'languages_required': job.languages_required or [],
            'status': job.status,
            'application_deadline': job.application_deadline.isoformat() if job.application_deadline else None,
            'created_at': job.created_at.isoformat(),
            'updated_at': job.updated_at.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@jobs_bp.route('/<job_id>', methods=['PUT'])
@login_required
def update_job(job_id):
    """Update job posting (employer only)"""
    try:
        job = JobPosting.query.get_or_404(job_id)
        
        # Check if user owns this job posting
        if job.employer_id != request.current_user.id:
            return jsonify({'error': 'You can only update your own job postings'}), 403
        
        data = request.get_json()
        
        # Update fields
        if 'title' in data:
            job.title = data['title']
        if 'description' in data:
            job.description = data['description']
        if 'location' in data:
            job.location = data['location']
        if 'salary_min' in data:
            job.salary_min = data['salary_min']
        if 'salary_max' in data:
            job.salary_max = data['salary_max']
        if 'accommodation_type' in data:
            job.accommodation_type = data['accommodation_type']
        if 'required_experience' in data:
            job.required_experience = data['required_experience']
        if 'required_education' in data:
            job.required_education = data['required_education']
        if 'skills_required' in data:
            job.skills_required = data['skills_required']
        if 'languages_required' in data:
            job.languages_required = data['languages_required']
        if 'status' in data:
            job.status = data['status']
        if 'application_deadline' in data:
            job.application_deadline = datetime.fromisoformat(data['application_deadline']) if data.get('application_deadline') else None
        
        job.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'id': job.id,
            'title': job.title,
            'description': job.description,
            'location': job.location,
            'salary_min': job.salary_min,
            'salary_max': job.salary_max,
            'accommodation_type': job.accommodation_type,
            'required_experience': job.required_experience,
            'required_education': job.required_education,
            'skills_required': job.skills_required or [],
            'languages_required': job.languages_required or [],
            'status': job.status,
            'application_deadline': job.application_deadline.isoformat() if job.application_deadline else None,
            'created_at': job.created_at.isoformat(),
            'updated_at': job.updated_at.isoformat()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@jobs_bp.route('/<job_id>', methods=['DELETE'])
@login_required
def delete_job(job_id):
    """Delete job posting (employer only)"""
    try:
        job = JobPosting.query.get_or_404(job_id)
        
        # Check if user owns this job posting
        if job.employer_id != request.current_user.id:
            return jsonify({'error': 'You can only delete your own job postings'}), 403
        
        db.session.delete(job)
        db.session.commit()
        
        return jsonify({'message': 'Job posting deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@jobs_bp.route('/<job_id>/apply', methods=['POST'])
@login_required
def apply_to_job(job_id):
    """Apply to a job (housegirls only)"""
    try:
        # Check if user is housegirl
        if request.current_user.user_type != 'housegirl':
            return jsonify({'error': 'Only housegirls can apply to jobs'}), 403
        
        job = JobPosting.query.get_or_404(job_id)
        
        # Check if job is still active
        if job.status != 'active':
            return jsonify({'error': 'This job is no longer accepting applications'}), 400
        
        # Check if already applied
        existing_application = JobApplication.query.filter_by(
            job_id=job_id,
            housegirl_id=request.current_user.id
        ).first()
        
        if existing_application:
            return jsonify({'error': 'You have already applied to this job'}), 400
        
        data = request.get_json()
        
        # Create job application
        application = JobApplication(
            id=f'app_{uuid.uuid4().hex[:12]}',
            job_id=job_id,
            housegirl_id=request.current_user.id,
            cover_letter=data.get('cover_letter', ''),
            status='pending'
        )
        
        db.session.add(application)
        db.session.commit()
        
        return jsonify({
            'id': application.id,
            'job_id': application.job_id,
            'housegirl_id': application.housegirl_id,
            'cover_letter': application.cover_letter,
            'status': application.status,
            'applied_at': application.applied_at.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@jobs_bp.route('/<job_id>/applications', methods=['GET'])
@login_required
def get_job_applications(job_id):
    """Get applications for a job (employer only)"""
    try:
        job = JobPosting.query.get_or_404(job_id)
        
        # Check if user owns this job posting
        if job.employer_id != request.current_user.id:
            return jsonify({'error': 'You can only view applications for your own job postings'}), 403
        
        applications = JobApplication.query.filter_by(job_id=job_id).all()
        
        result = []
        for app in applications:
            result.append({
                'id': app.id,
                'job_id': app.job_id,
                'housegirl_id': app.housegirl_id,
                'cover_letter': app.cover_letter,
                'status': app.status,
                'applied_at': app.applied_at.isoformat(),
                'reviewed_at': app.reviewed_at.isoformat() if app.reviewed_at else None,
                'housegirl': {
                    'id': app.housegirl.id,
                    'name': f"{app.housegirl.first_name} {app.housegirl.last_name}",
                    'email': app.housegirl.email,
                    'phone_number': app.housegirl.phone_number
                }
            })
        
        return jsonify({'applications': result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
