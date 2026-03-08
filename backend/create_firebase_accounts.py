#!/usr/bin/env python3
"""
Script to create Firebase accounts using Firebase Admin SDK
This will create the test accounts directly in Firebase
"""

import json
import requests
import os
from datetime import datetime

# Firebase project configuration
FIREBASE_PROJECT_ID = "domesticconnect-e1955"
FIREBASE_API_KEY = os.getenv("FIREBASE_API_KEY")

def create_firebase_accounts():
    """Create Firebase accounts for testing"""
    if not FIREBASE_API_KEY:
        print("❌ Error: issue with firebase.")
        print("Please debug it.")
        return
    
    
    # Test accounts to create
    test_accounts = [
        {
            'email': 'sarah.wanjiku@example.com',
            'password': 'password123',
            'displayName': 'Sarah Wanjiku',
            'user_type': 'housegirl'
        },
        {
            'email': 'grace.akinyi@example.com', 
            'password': 'password123',
            'displayName': 'Grace Akinyi',
            'user_type': 'housegirl'
        },
        {
            'email': 'john.doe@example.com',
            'password': 'password123', 
            'displayName': 'John Doe',
            'user_type': 'employer'
        },
        {
            'email': 'admin@domesticconnect.co.ke',
            'password': 'password123',
            'displayName': 'Domestic Connect',
            'user_type': 'agency'
        }
    ]
    
    print("🔥 Creating Firebase accounts...")
    print("=" * 50)
    
    for account in test_accounts:
        print(f"Creating account: {account['email']}")
        
        # Firebase REST API endpoint for creating users
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={FIREBASE_API_KEY}"
        
        payload = {
            "email": account['email'],
            "password": account['password'],
            "phoneNumber": account['phoneNumber'],
            "displayName": account['displayName'],
            "returnSecureToken": True
        }
        
        try:
            response = requests.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Successfully created: {account['email']}")
                print(f"   Firebase UID: {data.get('localId', 'N/A')}")
            else:
                error_data = response.json()
                if 'EMAIL_EXISTS' in str(error_data):
                    print(f"⚠️  Account already exists: {account['email']}")
                else:
                    print(f"❌ Failed to create {account['email']}: {error_data}")
                    
        except Exception as e:
            print(f"❌ Error creating {account['email']}: {str(e)}")
        
        print()
    
    print("🎉 Firebase account creation completed!")
    print("\n📋 You can now login with these credentials:")
    print("=" * 50)
    
    for account in test_accounts:
        print(f"📧 {account['email']}")
        print(f"🔑 {account['password']}")
        print(f"👤 {account['displayName']} ({account['user_type']})")
        print()

if __name__ == '__main__':
    create_firebase_accounts()
