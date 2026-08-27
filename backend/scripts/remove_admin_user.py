#!/usr/bin/env python3
"""
One-time script: remove pwriter455@gmail.com admin account from Firestore and Firebase Auth.
Run from the backend directory: python scripts/remove_admin_user.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.firebase_init import db
from firebase_admin import auth as firebase_admin_auth

TARGET_EMAIL = 'pwriter455@gmail.com'

def main():
    print(f'Looking for user with email: {TARGET_EMAIL}')

    # 1. Find in Firestore by email
    users_ref = list(db.collection('users').where('email', '==', TARGET_EMAIL).stream())
    if not users_ref:
        print('No Firestore document found for that email.')
    else:
        for doc in users_ref:
            data = doc.to_dict()
            print(f'Found Firestore doc: {doc.id} | user_type={data.get("user_type")} | is_admin={data.get("is_admin")}')
            confirm = input(f'Delete Firestore doc {doc.id}? (yes/no): ').strip().lower()
            if confirm == 'yes':
                doc.reference.delete()
                print(f'Deleted Firestore doc: {doc.id}')
            else:
                print('Skipped Firestore deletion.')

    # 2. Find and delete Firebase Auth user
    try:
        fb_user = firebase_admin_auth.get_user_by_email(TARGET_EMAIL)
        print(f'Found Firebase Auth user: {fb_user.uid}')
        confirm = input(f'Delete Firebase Auth user {fb_user.uid}? (yes/no): ').strip().lower()
        if confirm == 'yes':
            firebase_admin_auth.delete_user(fb_user.uid)
            print(f'Deleted Firebase Auth user: {fb_user.uid}')
        else:
            print('Skipped Firebase Auth deletion.')
    except firebase_admin_auth.UserNotFoundError:
        print('No Firebase Auth user found for that email.')
    except Exception as e:
        print(f'Firebase Auth error: {e}')

    print('Done.')

if __name__ == '__main__':
    main()
