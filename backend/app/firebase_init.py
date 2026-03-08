import json
import os
import firebase_admin
from firebase_admin import credentials, firestore, auth

def initialize_firebase():
    if not firebase_admin._apps:
        firebase_env = os.environ.get(
            'FIREBASE_SERVICE_ACCOUNT'
        )
        if firebase_env:
            cred_dict = json.loads(firebase_env)
            cred = credentials.Certificate(cred_dict)
        else:
            cred_path = os.path.join(
                os.path.dirname(__file__),
                '..',
                'firebase-service-account.json'
            )
            cred = credentials.Certificate(
                os.path.abspath(cred_path)
            )
        firebase_admin.initialize_app(cred)
    return firestore.client()

db = initialize_firebase()
