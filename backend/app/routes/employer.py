from flask import Blueprint, request, jsonify
from app.services.auth_service import firebase_auth_required
from app.firebase_init import db
import logging
from datetime import datetime
import uuid
from app.routes.payments import submit_pesapal_order, get_pesapal_token, APPLY_CONTACT_UNLOCK_PACKAGE_ID, APPLY_CONTACT_UNLOCK_PRICE

logger = logging.getLogger(__name__)
employer_bp = Blueprint('employers', __name__)

@employer_bp.route('/jobs/<job_id>/applied-housegirls', methods=['GET'])
@firebase_auth_required
def get_applied_housegirls(job_id):
    """
    Employer gets a list of housegirls who applied to a specific job.
    Includes public profile data and contact unlock status.
    """
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401

        if getattr(user, 'user_type', '') != 'employer':
            return jsonify({'error': 'Only employers can view applied housegirls'}), 403

        employer_id = getattr(user, 'id')

        # Verify job ownership
        job_doc = db.collection('job_postings').document(job_id).get()
        if not job_doc.exists:
            return jsonify({'error': 'Job not found'}), 404
        if job_doc.to_dict().get('employer_id') != employer_id:
            return jsonify({'error': 'You do not own this job posting'}), 403

        # Retrieve applied housegirls with 'applied' status
        applications_ref = db.collection('job_applications') \
            .where('job_id', '==', job_id) \
            .where('status', '==', 'applied') \
            .stream()

        applied_housegirls = []
        for app_doc in applications_ref:
            app_data = app_doc.to_dict()
            housegirl_id = app_data.get('housegirl_id')

            # Fetch public profile data
            housegirl_profile_data = {}
            hg_user_doc = db.collection('users').document(housegirl_id).get()
            if hg_user_doc.exists:
                hg_user = hg_user_doc.to_dict()
                housegirl_profile_data['first_name'] = hg_user.get('first_name', '')
                housegirl_profile_data['last_name'] = hg_user.get('last_name', '')
                housegirl_profile_data['email'] = hg_user.get('email', '') # Placeholder, will be replaced if not unlocked
                housegirl_profile_data['phone_number'] = hg_user.get('phone_number', '') # Placeholder, will be replaced if not unlocked

                # Fetch housegirl profile details (e.g., bio, experience)
                profiles_ref = db.collection('profiles').where('user_id', '==', housegirl_id).limit(1).stream()
                for profile_doc in profiles_ref:
                    profile_id = profile_doc.id
                    housegirl_general_profile = db.collection('housegirl_profiles').document(profile_id).get()
                    if housegirl_general_profile.exists:
                        hg_profile_data = housegirl_general_profile.to_dict()
                        housegirl_profile_data['bio'] = hg_profile_data.get('bio', '')
                        housegirl_profile_data['experience'] = hg_profile_data.get('experience', '')
                        housegirl_profile_data['education'] = hg_profile_data.get('education', '')
                        housegirl_profile_data['skills'] = hg_profile_data.get('skills', [])
                        housegirl_profile_data['languages'] = hg_profile_data.get('languages', [])
                        housegirl_profile_data['profile_photo_url'] = hg_profile_data.get('profile_photo_url', '')

            # Check contact unlock status for this employer, housegirl, and job
            contact_unlocked = False
            unlocked_contact_details = {'email': None, 'phone_number': None}

            contact_access_ref = db.collection('contact_access') \
                .where('employer_id', '==', employer_id) \
                .where('housegirl_id', '==', housegirl_id) \
                .where('job_id', '==', job_id) \
                .limit(1).stream()

            for access_doc in contact_access_ref:
                if access_doc.exists:
                    contact_unlocked = True
                    # Return the actual contact details now that access is confirmed
                    unlocked_contact_details['email'] = housegirl_profile_data.get('email')
                    unlocked_contact_details['phone_number'] = housegirl_profile_data.get('phone_number')
                    break

            applied_housegirls.append({
                'application_id': app_data.get('id'),
                'housegirl_id': housegirl_id,
                'public_profile': {
                    'first_name': housegirl_profile_data.get('first_name'),
                    'last_name': housegirl_profile_data.get('last_name'),
                    'bio': housegirl_profile_data.get('bio'),
                    'experience': housegirl_profile_data.get('experience'),
                    'education': housegirl_profile_data.get('education'),
                    'skills': housegirl_profile_data.get('skills'),
                    'languages': housegirl_profile_data.get('languages'),
                    'profile_photo_url': housegirl_profile_data.get('profile_photo_url')
                },
                'contact_unlocked': contact_unlocked,
                'contact_details': unlocked_contact_details if contact_unlocked else {'email': None, 'phone_number': None}
            })

        return jsonify({'applied_housegirls': applied_housegirls}), 200

    except Exception as e:
        logger.error(f'get_applied_housegirls error: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500

@employer_bp.route('/jobs/<job_id>/housegirls/<housegirl_id>/unlock-contact', methods=['POST'])
@firebase_auth_required
def unlock_housegirl_contact(job_id, housegirl_id):
    """
    Employer initiates payment to unlock contact details for a specific housegirl
    who applied to their job.
    """
    try:
        user = request.current_user
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401

        if getattr(user, 'user_type', '') != 'employer':
            return jsonify({'error': 'Only employers can unlock contacts'}), 403

        employer_id = getattr(user, 'id')

        # Verify job ownership
        job_doc = db.collection('job_postings').document(job_id).get()
        if not job_doc.exists:
            return jsonify({'error': 'Job not found'}), 404
        if job_doc.to_dict().get('employer_id') != employer_id:
            return jsonify({'error': 'You do not own this job posting'}), 403

        # Validate application exists and is 'applied'
        application_exists = list(db.collection('job_applications')
            .where('job_id', '==', job_id)
            .where('housegirl_id', '==', housegirl_id)
            .where('status', '==', 'applied')
            .limit(1).stream())

        if not application_exists:
            return jsonify({'error': 'Housegirl has not applied to this job or application is not active'}), 400

        # Check for existing unlock
        existing_unlock = list(db.collection('contact_access')
            .where('employer_id', '==', employer_id)
            .where('housegirl_id', '==', housegirl_id)
            .where('job_id', '==', job_id)
            .limit(1).stream())

        if existing_unlock:
            # Return actual contact details since access is already paid for
            hg_user_doc = db.collection('users').document(housegirl_id).get()
            contact_details = {'email': None, 'phone_number': None}
            if hg_user_doc.exists:
                hg_data = hg_user_doc.to_dict()
                contact_details['email'] = hg_data.get('email')
                contact_details['phone_number'] = hg_data.get('phone_number')
            return jsonify({
                'message': 'Contact already unlocked.',
                'contact_unlocked': True,
                'contact_details': contact_details
            }), 200

        # Initiate payment
        purchase_id = str(uuid.uuid4())
        token = get_pesapal_token()
        description = "Unlock contact details for applied housegirl"

        pesapal_response = submit_pesapal_order(
            token=token,
            amount=APPLY_CONTACT_UNLOCK_PRICE,
            purchase_id=purchase_id,
            description=description,
            billing_email=getattr(user, 'email', None),
            billing_first_name=getattr(user, 'first_name', None) or getattr(user, 'display_name', None)
        )

        order_tracking_id = pesapal_response.get('order_tracking_id')
        redirect_url = pesapal_response.get('redirect_url')

        if not order_tracking_id or not redirect_url:
            logger.error(f'Pesapal order failed for unlock-contact: {pesapal_response}')
            return jsonify({
                'error': 'Failed to create Pesapal payment order',
                'pesapal_response': pesapal_response
            }), 502

        # Store pending purchase with metadata for _complete_purchase
        purchase_data = {
            'id': purchase_id,
            'user_id': employer_id,
            'package_id': APPLY_CONTACT_UNLOCK_PACKAGE_ID,
            'amount': APPLY_CONTACT_UNLOCK_PRICE,
            'status': 'pending',
            'order_tracking_id': order_tracking_id,
            'merchant_reference': purchase_id,
            'job_id': job_id,  # Important metadata
            'housegirl_id': housegirl_id, # Important metadata
            'purchase_date': datetime.utcnow().isoformat()
        }
        db.collection('user_purchases').document(purchase_id).set(purchase_data)

        return jsonify({
            'message': 'Payment initiated successfully',
            'purchase_id': purchase_id,
            'package_id': APPLY_CONTACT_UNLOCK_PACKAGE_ID,
            'status': 'pending',
            'order_tracking_id': order_tracking_id,
            'redirect_url': redirect_url
        }), 202

    except Exception as e:
        logger.error(f'unlock_housegirl_contact error: {str(e)}')
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500

