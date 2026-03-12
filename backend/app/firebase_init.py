import json
import os
import logging
import firebase_admin
from firebase_admin import credentials, firestore

logger = logging.getLogger(__name__)

def initialize_firebase():
    if not firebase_admin._apps:
        firebase_env = os.environ.get(
            'FIREBASE_SERVICE_ACCOUNT', ''
        ).strip()
        
        if firebase_env:
            try:
                cred_dict = json.loads(firebase_env)
            except json.JSONDecodeError:
                start = firebase_env.find('{')
                end = firebase_env.rfind('}') + 1
                cred_dict = json.loads(
                    firebase_env[start:end]
                )
            cred = credentials.Certificate(cred_dict)
        else:
            cred_path = os.path.abspath(
                os.path.join(
                    os.path.dirname(__file__),
                    '..',
                    'firebase-service-account.json'
                )
            )
            cred = credentials.Certificate(cred_path)
        
        firebase_admin.initialize_app(cred)
        app = firebase_admin.get_app()
        logger.info(f'Firebase initialized: {app.project_id}')
    return firestore.client()

db = initialize_firebase()
