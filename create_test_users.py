#!/usr/bin/env python3
"""
Create test users for development
This script creates test users with proper bcrypt hashing
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app, db
from backend.app.models import User

def create_test_users():
    """Create test users for development"""
    print("👥 Creating test users...")
    
    app = create_app()
    
    with app.app_context():
        try:
            # Test users data
            test_users = [
                {
                    'id': 'test_employer_1',
                    'email': 'employer@example.com',
                    'password': 'password123',
                    'user_type': 'employer',
                    'first_name': 'John',
                    'last_name': 'Employer',
                    'phone_number': '+254700123456'
                },
                {
                    'id': 'test_housegirl_1',
                    'email': 'housegirl@example.com',
                    'password': 'password123',
                    'user_type': 'housegirl',
                    'first_name': 'Sarah',
                    'last_name': 'Wanjiku',
                    'phone_number': '+254700789012'
                },
                {
                    'id': 'test_agency_1',
                    'email': 'agency@example.com',
                    'password': 'password123',
                    'user_type': 'agency',
                    'first_name': 'Domestic',
                    'last_name': 'Agency',
                    'phone_number': '+254700345678'
                },
                {
                    'id': 'admin_user_1',
                    'email': 'admin@domesticconnect.ke',
                    'password': 'admin123456',
                    'user_type': 'employer',
                    'first_name': 'Admin',
                    'last_name': 'User',
                    'phone_number': '+254700000000'
                }
            ]
            
            created_count = 0
            
            for user_data in test_users:
                # Check if user already exists
                existing_user = User.query.filter_by(email=user_data['email']).first()
                
                if existing_user:
                    print(f"⚠️  User {user_data['email']} already exists, skipping...")
                    continue
                
                # Create new user
                user = User(
                    id=user_data['id'],
                    email=user_data['email'],
                    user_type=user_data['user_type'],
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name'],
                    phone_number=user_data['phone_number']
                )
                
                # Set password (this will hash it with bcrypt)
                user.set_password(user_data['password'])
                
                # Save to database
                db.session.add(user)
                created_count += 1
                
                print(f"✅ Created user: {user_data['email']} ({user_data['user_type']})")
            
            # Commit all changes
            db.session.commit()
            
            print(f"\n🎉 Successfully created {created_count} test users!")
            
            # Display login credentials
            print("\n📋 Test User Credentials:")
            print("=" * 50)
            for user_data in test_users:
                print(f"Email: {user_data['email']}")
                print(f"Password: {user_data['password']}")
                print(f"Type: {user_data['user_type']}")
                print("-" * 30)
            
            return True
            
        except Exception as e:
            print(f"❌ Error creating test users: {e}")
            db.session.rollback()
            return False

def verify_test_users():
    """Verify test users were created correctly"""
    print("\n🔍 Verifying test users...")
    
    app = create_app()
    
    with app.app_context():
        try:
            test_emails = [
                'employer@example.com',
                'housegirl@example.com', 
                'agency@example.com',
                'admin@domesticconnect.ke'
            ]
            
            for email in test_emails:
                user = User.query.filter_by(email=email).first()
                
                if user:
                    # Test password verification
                    if user.check_password('password123') or user.check_password('admin123456'):
                        print(f"✅ {email} - Password verification works")
                    else:
                        print(f"❌ {email} - Password verification failed")
                else:
                    print(f"❌ {email} - User not found")
            
            return True
            
        except Exception as e:
            print(f"❌ Verification failed: {e}")
            return False

if __name__ == "__main__":
    print("🚀 Setting up test users for Domestic Connect")
    print("=" * 60)
    
    if create_test_users():
        if verify_test_users():
            print("\n" + "=" * 60)
            print("🎉 Test users setup completed successfully!")
            print("\nNext steps:")
            print("1. Start Flask backend: cd backend && python run.py")
            print("2. Start frontend: npm run dev")
            print("3. Test login with the credentials above")
        else:
            print("\n❌ Test user verification failed!")
            sys.exit(1)
    else:
        print("\n❌ Test user creation failed!")
        sys.exit(1)
