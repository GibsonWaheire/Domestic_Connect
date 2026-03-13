#!/usr/bin/env python3
"""
db_check.py — CLI tool to verify a user's Firestore data and write access.

Usage:
    python scripts/db_check.py <uid>

The uid can be a raw Firebase UID or a user_ prefixed ID.
"""

import sys
import os

# Add the backend root to the path so app imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.firebase_init import db
from datetime import datetime


def normalize_id(uid: str) -> str:
    if uid.startswith('user_'):
        return uid
    return f'user_{uid}'


def check_user(raw_uid: str):
    user_id = normalize_id(raw_uid)
    print(f'\n=== db_check for {user_id} ===\n')

    passed = True

    # 1. users collection
    print('--- users collection ---')
    user_doc = db.collection('users').document(user_id).get()
    if user_doc.exists:
        data = user_doc.to_dict()
        print(f'  FOUND: {user_doc.reference.path}')
        for key in ['email', 'user_type', 'first_name', 'last_name', 'firebase_uid', 'is_active']:
            print(f'    {key}: {data.get(key)}')
    else:
        print(f'  MISSING: users/{user_id}')
        passed = False

    # 2. housegirl_profiles collection
    print('\n--- housegirl_profiles collection ---')
    hg_doc = db.collection('housegirl_profiles').document(user_id).get()
    if hg_doc.exists:
        data = hg_doc.to_dict()
        print(f'  FOUND: {hg_doc.reference.path}')
        for key in ['age', 'location', 'experience', 'profile_id', 'activation_fee_paid']:
            print(f'    {key}: {data.get(key)}')
    else:
        # Fallback: query by user_id field
        fallback = list(
            db.collection('housegirl_profiles')
            .where('user_id', '==', user_id)
            .limit(1)
            .stream()
        )
        if fallback:
            data = fallback[0].to_dict()
            print(f'  FOUND (by user_id field): housegirl_profiles/{fallback[0].id}')
            for key in ['age', 'location', 'experience', 'profile_id', 'activation_fee_paid']:
                print(f'    {key}: {data.get(key)}')
        else:
            print(f'  NOT FOUND (checked by doc ID and user_id field) — OK if not a housegirl')

    # 3. employer_profiles collection
    print('\n--- employer_profiles collection ---')
    emp_doc = db.collection('employer_profiles').document(user_id).get()
    if emp_doc.exists:
        data = emp_doc.to_dict()
        print(f'  FOUND: {emp_doc.reference.path}')
        for key in ['company_name', 'location', 'profile_id', 'full_name']:
            print(f'    {key}: {data.get(key)}')
    else:
        fallback = list(
            db.collection('employer_profiles')
            .where('user_id', '==', user_id)
            .limit(1)
            .stream()
        )
        if fallback:
            data = fallback[0].to_dict()
            print(f'  FOUND (by user_id field): employer_profiles/{fallback[0].id}')
            for key in ['company_name', 'location', 'profile_id', 'full_name']:
                print(f'    {key}: {data.get(key)}')
        else:
            print(f'  NOT FOUND (checked by doc ID and user_id field) — OK if not an employer')

    # 4. Write test
    print('\n--- Firestore write test ---')
    test_ref = db.collection('_db_check_test').document(user_id)
    timestamp = datetime.utcnow().isoformat()
    try:
        test_ref.set({'checked_at': timestamp, 'user_id': user_id})
        verify = test_ref.get()
        if verify.exists and verify.to_dict().get('checked_at') == timestamp:
            print(f'  WRITE OK: _db_check_test/{user_id}')
            test_ref.delete()
        else:
            print(f'  WRITE FAILED: doc written but not readable back')
            passed = False
    except Exception as e:
        print(f'  WRITE ERROR: {e}')
        passed = False

    print(f'\n{"=" * 40}')
    if passed:
        print('RESULT: PASS')
    else:
        print('RESULT: FAIL')
    print('=' * 40 + '\n')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python scripts/db_check.py <uid>')
        sys.exit(1)
    check_user(sys.argv[1])
