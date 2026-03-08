import json
import os
import firebase_admin
from firebase_admin import credentials, firestore, auth

def initialize_firebase():
    if not firebase_admin._apps:
        cred = None
        firebase_env = os.environ.get('FIREBASE_SERVICE_ACCOUNT')
        if firebase_env:
            try:
                cred = credentials.Certificate(json.loads(firebase_env))
            except json.JSONDecodeError:
                cred = credentials.Certificate(json.loads(firebase_env.replace('\\"', '"')))
        if cred is None:
            project_id = os.environ.get('FIREBASE_PROJECT_ID')
            client_email = os.environ.get('FIREBASE_CLIENT_EMAIL')
            private_key = os.environ.get('FIREBASE_PRIVATE_KEY')
            if project_id and client_email and private_key:
                cred = credentials.Certificate({
                    "type": "service_account",
                    "project_id": project_id,
                    "private_key_id": os.environ.get('FIREBASE_PRIVATE_KEY_ID', ''),
                    "private_key": private_key.replace('\\n', '\n'),
                    "client_email": client_email,
                    "client_id": os.environ.get('FIREBASE_CLIENT_ID', ''),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_x509_cert_url": os.environ.get('FIREBASE_CLIENT_X509_CERT_URL', '')
                })
        if cred is None:
            cred_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT_PATH') or os.path.join(
                os.path.dirname(__file__),
                '..',
                'firebase-service-account.json'
            )
            abs_cred_path = os.path.abspath(cred_path)
            if not os.path.exists(abs_cred_path):
                raise FileNotFoundError(
                    "Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY."
                )
            cred = credentials.Certificate(abs_cred_path)
        firebase_admin.initialize_app(cred)
    return firestore.client()

db = initialize_firebase()
