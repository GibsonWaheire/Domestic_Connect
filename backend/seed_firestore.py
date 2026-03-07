import os
import uuid
import datetime
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admins SDK
if not firebase_admin._apps:
    cred = credentials.Certificate('firebase-service-account.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

def seed_test_accounts():
    print("⏳ Seeding test accounts into Firestore...")
    
    test_users = [
        {
            'email': 'sarah.wanjiku@example.com',
            'user_type': 'housegirl',
            'first_name': 'Sarah',
            'last_name': 'Wanjiku',
            'firebase_uid': 'MCLtNyfMU3cZ5rt5hx7DjhYr9uN2' # Will be updated dynamically if we don't know it, but login doesn't check this strictly for existence if email matches
        },
        {
            'email': 'grace.akinyi@example.com', 
            'user_type': 'housegirl',
            'first_name': 'Grace',
            'last_name': 'Akinyi',
        },
        {
            'email': 'john.doe@example.com',
            'user_type': 'employer',
            'first_name': 'John',
            'last_name': 'Doe',
        },
        {
            'email': 'admin@domesticconnect.co.ke',
            'user_type': 'agency',
            'first_name': 'Domestic',
            'last_name': 'Connect',
        }
    ]

    for user_data in test_users:
        # Check if user already exists
        users_ref = db.collection('users').where('email', '==', user_data['email']).get()
        if len(users_ref) > 0:
            print(f"✅ User {user_data['email']} already exists in Firestore.")
            continue
            
        user_id = str(uuid.uuid4())
        doc_data = {
            'id': user_id,
            'email': user_data['email'],
            'user_type': user_data['user_type'],
            'first_name': user_data['first_name'],
            'last_name': user_data['last_name'],
            'is_active': True,
            'is_firebase_user': True,
            'firebase_uid': user_data.get('firebase_uid', ''),
            'created_at': datetime.datetime.utcnow().isoformat(),
            'updated_at': datetime.datetime.utcnow().isoformat()
        }
        
        db.collection('users').document(user_id).set(doc_data)
        
        # Create a profile
        profile_id = str(uuid.uuid4())
        profile_data = {
            'id': profile_id,
            'user_id': user_id,
            'created_at': datetime.datetime.utcnow().isoformat(),
            'updated_at': datetime.datetime.utcnow().isoformat(),
            'location': 'Nairobi',
            'bio': f"Test {user_data['user_type']} account",
        }
        if user_data['user_type'] == 'housegirl':
            profile_data.update({
                'age': 25,
                'experience': '2 Years',
                'expectedSalary': '15000',
                'skills': ['Cooking', 'Cleaning']
            })
            
        db.collection('profiles').document(profile_id).set(profile_data)
        print(f"🚀 Successfully created {user_data['user_type']} data for {user_data['email']}")
        
    print("🎉 Done seeding Firestore!")

if __name__ == '__main__':
    seed_test_accounts()
