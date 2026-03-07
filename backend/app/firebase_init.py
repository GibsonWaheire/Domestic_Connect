import firebase_admin
from firebase_admin import credentials, firestore, auth
import os

def initialize_firebase():
    """Initialize Firebase Admin SDK and return Firestore client"""
    if not firebase_admin._apps:
        # Load from the local service account file in backend directory
        cred_path = os.path.join(os.path.dirname(__file__), '..', 'firebase-service-account.json')
        # If the backend executes from the root directory, adjust path if needed.
        # It's better to ensure this is an absolute path based on the file location.
        abs_cred_path = os.path.abspath(cred_path)
        
        try:
            cred = credentials.Certificate(abs_cred_path)
            firebase_admin.initialize_app(cred)
            print(f"Successfully initialized Firebase from {abs_cred_path}")
        except Exception as e:
            print(f"Error initializing Firebase with path {abs_cred_path}: {e}")
            raise e

    return firestore.client()

# Create a singleton db instance
db = initialize_firebase()
