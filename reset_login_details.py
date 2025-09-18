#!/usr/bin/env python3
"""
Reset all login details and create fresh test users
This script will:
1. Clear all existing users from database
2. Create new test users with fresh credentials
3. Reset all authentication data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app, db
from backend.app.models import User, Profile, EmployerProfile, HousegirlProfile, AgencyProfile

def reset_all_users():
    """Remove all existing users and related data"""
    print("🗑️  Resetting all existing users...")
    
    app = create_app()
    
    with app.app_context():
        try:
            # Delete all related profiles first (due to foreign key constraints)
            print("   Deleting all profiles...")
            EmployerProfile.query.delete()
            HousegirlProfile.query.delete()
            AgencyProfile.query.delete()
            Profile.query.delete()
            
            # Delete all users
            print("   Deleting all users...")
            User.query.delete()
            
            # Commit the changes
            db.session.commit()
            
            print("✅ All users and profiles deleted successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Error resetting users: {e}")
            db.session.rollback()
            return False

def create_fresh_test_users():
    """Create completely new test users with fresh credentials"""
    print("\n👥 Creating fresh test users...")
    
    app = create_app()
    
    with app.app_context():
        try:
            # Fresh test users with new credentials
            fresh_users = [
                {
                    'id': 'fresh_employer_001',
                    'email': 'john.employer@domesticconnect.ke',
                    'password': 'SecurePass123!',
                    'user_type': 'employer',
                    'first_name': 'John',
                    'last_name': 'Mwangi',
                    'phone_number': '+254712345678'
                },
                {
                    'id': 'fresh_housegirl_001',
                    'email': 'grace.housegirl@domesticconnect.ke',
                    'password': 'HouseHelp456!',
                    'user_type': 'housegirl',
                    'first_name': 'Grace',
                    'last_name': 'Wanjiku',
                    'phone_number': '+254723456789'
                },
                {
                    'id': 'fresh_agency_001',
                    'email': 'info@premiumdomestic.ke',
                    'password': 'AgencyPass789!',
                    'user_type': 'agency',
                    'first_name': 'Premium',
                    'last_name': 'Domestic Agency',
                    'phone_number': '+254734567890'
                },
                {
                    'id': 'fresh_admin_001',
                    'email': 'admin@domesticconnect.ke',
                    'password': 'AdminSecure2024!',
                    'user_type': 'employer',
                    'first_name': 'System',
                    'last_name': 'Administrator',
                    'phone_number': '+254700000000'
                },
                {
                    'id': 'fresh_demo_001',
                    'email': 'demo@domesticconnect.ke',
                    'password': 'DemoUser123!',
                    'user_type': 'employer',
                    'first_name': 'Demo',
                    'last_name': 'User',
                    'phone_number': '+254711111111'
                }
            ]
            
            created_count = 0
            
            for user_data in fresh_users:
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
            
            print(f"\n🎉 Successfully created {created_count} fresh test users!")
            
            # Display new login credentials
            print("\n📋 NEW LOGIN CREDENTIALS:")
            print("=" * 60)
            for user_data in fresh_users:
                print(f"Email: {user_data['email']}")
                print(f"Password: {user_data['password']}")
                print(f"Type: {user_data['user_type']}")
                print(f"Name: {user_data['first_name']} {user_data['last_name']}")
                print("-" * 40)
            
            return True
            
        except Exception as e:
            print(f"❌ Error creating fresh users: {e}")
            db.session.rollback()
            return False

def verify_fresh_users():
    """Verify the fresh users were created correctly"""
    print("\n🔍 Verifying fresh users...")
    
    app = create_app()
    
    with app.app_context():
        try:
            fresh_emails = [
                'john.employer@domesticconnect.ke',
                'grace.housegirl@domesticconnect.ke',
                'info@premiumdomestic.ke',
                'admin@domesticconnect.ke',
                'demo@domesticconnect.ke'
            ]
            
            verified_count = 0
            
            for email in fresh_emails:
                user = User.query.filter_by(email=email).first()
                
                if user:
                    # Test password verification
                    test_passwords = [
                        'SecurePass123!',
                        'HouseHelp456!',
                        'AgencyPass789!',
                        'AdminSecure2024!',
                        'DemoUser123!'
                    ]
                    
                    password_works = False
                    for pwd in test_passwords:
                        if user.check_password(pwd):
                            password_works = True
                            break
                    
                    if password_works:
                        print(f"✅ {email} - Password verification works")
                        verified_count += 1
                    else:
                        print(f"❌ {email} - Password verification failed")
                else:
                    print(f"❌ {email} - User not found")
            
            print(f"\n✅ Verified {verified_count}/{len(fresh_emails)} users")
            return verified_count == len(fresh_emails)
            
        except Exception as e:
            print(f"❌ Verification failed: {e}")
            return False

def clear_local_storage():
    """Instructions to clear browser local storage"""
    print("\n🌐 BROWSER CLEANUP REQUIRED:")
    print("=" * 50)
    print("To complete the reset, clear your browser's local storage:")
    print("1. Open Developer Tools (F12)")
    print("2. Go to Application/Storage tab")
    print("3. Clear Local Storage for localhost:5173")
    print("4. Refresh the page")
    print("=" * 50)

if __name__ == "__main__":
    print("🔄 DOMESTIC CONNECT - RESET ALL LOGIN DETAILS")
    print("=" * 70)
    
    # Step 1: Reset all existing users
    if reset_all_users():
        # Step 2: Create fresh test users
        if create_fresh_test_users():
            # Step 3: Verify fresh users
            if verify_fresh_users():
                print("\n" + "=" * 70)
                print("🎉 LOGIN RESET COMPLETED SUCCESSFULLY!")
                print("\nNext steps:")
                print("1. Clear browser local storage (see instructions above)")
                print("2. Start Flask backend: cd backend && python run.py")
                print("3. Start frontend: npm run dev")
                print("4. Use the NEW credentials above to login")
                
                clear_local_storage()
            else:
                print("\n❌ Fresh user verification failed!")
                sys.exit(1)
        else:
            print("\n❌ Fresh user creation failed!")
            sys.exit(1)
    else:
        print("\n❌ User reset failed!")
        sys.exit(1)
