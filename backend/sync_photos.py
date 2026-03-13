#!/usr/bin/env python3
"""
Standalone Diagnostic & Repair Script for Profile Photos
Synchronizes photos from specialized profile documents back to the core user records.
"""
import json
import os
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

def initialize_firebase():
    # Try to find service account in environment or local file
    firebase_env = os.environ.get('FIREBASE_SERVICE_ACCOUNT', '').strip()
    
    if firebase_env:
        try:
            cred_dict = json.loads(firebase_env)
        except:
            start = firebase_env.find('{')
            end = firebase_env.rfind('}') + 1
            cred_dict = json.loads(firebase_env[start:end])
        cred = credentials.Certificate(cred_dict)
    else:
        # Assumes being run from backend/ directory
        cred_path = 'firebase-service-account.json'
        if not os.path.exists(cred_path):
            cred_path = os.path.join('app', 'firebase-service-account.json')
        
        if not os.path.exists(cred_path):
            print(f"Error: Service account not found at {cred_path}")
            return None
        cred = credentials.Certificate(cred_path)
    
    firebase_admin.initialize_app(cred)
    return firestore.client()

def sync_photos():
    db = initialize_firebase()
    if not db:
        return

    print("Starting photo synchronization...")
    
    # 1. Sync Housegirls
    housegirls = db.collection('housegirl_profiles').stream()
    hg_count = 0
    hg_synced = 0
    
    for hg in housegirls:
        hg_count += 1
        data = hg.to_dict()
        photo = data.get('profile_photo_url') or data.get('photo_url')
        user_id = data.get('user_id') or hg.id
        
        if photo and user_id:
            user_ref = db.collection('users').document(user_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                if not user_data.get('profile_photo_url'):
                    user_ref.update({
                        'profile_photo_url': photo,
                        'updated_at': datetime.utcnow().isoformat()
                    })
                    hg_synced += 1
                    print(f"Synced photo for Housegirl: {user_id}")
    
    # 2. Sync Employers
    employers = db.collection('employer_profiles').stream()
    emp_count = 0
    emp_synced = 0
    
    for emp in employers:
        emp_count += 1
        data = emp.to_dict()
        photo = data.get('profile_photo_url') or data.get('photo_url')
        user_id = data.get('user_id') or emp.id
        
        if photo and user_id:
            user_ref = db.collection('users').document(user_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                if not user_data.get('profile_photo_url'):
                    user_ref.update({
                        'profile_photo_url': photo,
                        'updated_at': datetime.utcnow().isoformat()
                    })
                    emp_synced += 1
                    print(f"Synced photo for Employer: {user_id}")
                    
    print("\nSync Complete!")
    print(f"Housegirls: {hg_count} checked, {hg_synced} updated.")
    print(f"Employers: {emp_count} checked, {emp_synced} updated.")

if __name__ == "__main__":
    sync_photos()
