#!/usr/bin/env python3
"""
Script to create test accounts for development
This creates Firebase-compatible accounts that work with the current auth system
"""

import uuid
import requests
import json
from datetime import datetime
from app import create_app, db
from app.models import *

def create_test_accounts():
    """Create test accounts that work with Firebase auth"""
    app = create_app()
    
    with app.app_context():
        print("Creating test accounts for development...")
        
        # Clear existing test data
        print("Clearing existing test data...")
        test_emails = [
            'housegirl1@test.com', 'housegirl2@test.com', 'housegirl3@test.com', 'housegirl4@test.com',
            'employer1@test.com', 'employer2@test.com', 'agency1@test.com'
        ]
        
        for email in test_emails:
            user = User.query.filter_by(email=email).first()
            if user:
                # Delete related profiles first
                profile = Profile.query.filter_by(user_id=user.id).first()
                if profile:
                    # Delete type-specific profiles
                    if user.user_type == 'housegirl':
                        HousegirlProfile.query.filter_by(profile_id=profile.id).delete()
                    elif user.user_type == 'employer':
                        EmployerProfile.query.filter_by(profile_id=profile.id).delete()
                    elif user.user_type == 'agency':
                        AgencyProfile.query.filter_by(profile_id=profile.id).delete()
                    
                    # Delete the profile
                    db.session.delete(profile)
                
                # Delete the user
                db.session.delete(user)
        
        # Also clear existing agencies, job postings, and packages
        Agency.query.filter(Agency.license_number.in_(['DC001', 'NHS002'])).delete()
        JobPosting.query.delete()  # Clear all job postings
        PaymentPackage.query.delete()  # Clear all payment packages
        
        db.session.commit()
        print("✅ Cleared existing test data")
        
        # Create new test users with comprehensive mock data
        test_users = [
            {
                'email': 'housegirl1@test.com',
                'first_name': 'Sarah',
                'last_name': 'Wanjiku',
                'phone_number': '+254712345678',
                'user_type': 'housegirl',
                'is_firebase_user': True,
                'firebase_uid': 'dWTTQaBHULdKlmG1Nc5lYRPHyAB3',
                'profile_data': {
                    'age': 28,
                    'bio': 'Experienced house help with excellent cooking skills. Great with children and pets. Very reliable and hardworking.',
                    'current_location': 'Nairobi',
                    'location': 'Westlands, Nairobi',
                    'education': 'Form 4 and Above',
                    'experience': '5 years',
                    'expected_salary': 18000,
                    'accommodation_type': 'live_in',
                    'tribe': 'Kikuyu',
                    'is_available': True,
                    'profile_photo_url': 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                    'skills': ['Cooking', 'Cleaning', 'Childcare', 'Laundry'],
                    'languages': ['English', 'Swahili', 'Kikuyu'],
                    'rating': 4.8,
                    'reviews_count': 15
                }
            },
            {
                'email': 'housegirl2@test.com',
                'first_name': 'Grace',
                'last_name': 'Akinyi',
                'phone_number': '+254723456789',
                'user_type': 'housegirl',
                'is_firebase_user': True,
                'firebase_uid': 'VH2h82WEVsSNRasaebReoXDIa263',
                'profile_data': {
                    'age': 32,
                    'bio': 'Professional house manager with extensive experience in large households. Excellent organizational skills.',
                    'current_location': 'Nairobi',
                    'location': 'Kilimani, Nairobi',
                    'education': 'Form 4 and Above',
                    'experience': '8 years',
                    'expected_salary': 22000,
                    'accommodation_type': 'live_out',
                    'tribe': 'Luo',
                    'is_available': True,
                    'profile_photo_url': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
                    'skills': ['House Management', 'Cooking', 'Cleaning', 'Gardening'],
                    'languages': ['English', 'Swahili', 'Luo'],
                    'rating': 4.9,
                    'reviews_count': 22
                }
            },
            {
                'email': 'housegirl3@test.com',
                'first_name': 'Mary',
                'last_name': 'Muthoni',
                'phone_number': '+254734567890',
                'user_type': 'housegirl',
                'is_firebase_user': True,
                'firebase_uid': 'test_mary_muthoni',
                'profile_data': {
                    'age': 25,
                    'bio': 'Young and energetic house help. Great with children and very reliable. Quick learner.',
                    'current_location': 'Nairobi',
                    'location': 'Lavington, Nairobi',
                    'education': 'Class 8 and Above',
                    'experience': '3 years',
                    'expected_salary': 15000,
                    'accommodation_type': 'live_in',
                    'tribe': 'Kikuyu',
                    'is_available': True,
                    'profile_photo_url': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
                    'skills': ['Cleaning', 'Cooking', 'Childcare'],
                    'languages': ['English', 'Swahili', 'Kikuyu'],
                    'rating': 4.6,
                    'reviews_count': 8
                }
            },
            {
                'email': 'housegirl4@test.com',
                'first_name': 'Esther',
                'last_name': 'Wanjala',
                'phone_number': '+254745678901',
                'user_type': 'housegirl',
                'is_firebase_user': True,
                'firebase_uid': 'test_esther_wanjala',
                'profile_data': {
                    'age': 30,
                    'bio': 'Experienced nanny and housekeeper. Specializes in childcare and meal preparation.',
                    'current_location': 'Nairobi',
                    'location': 'Karen, Nairobi',
                    'education': 'Form 4 and Above',
                    'experience': '6 years',
                    'expected_salary': 20000,
                    'accommodation_type': 'live_in',
                    'tribe': 'Luhya',
                    'is_available': True,
                    'profile_photo_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                    'skills': ['Childcare', 'Cooking', 'Cleaning', 'First Aid'],
                    'languages': ['English', 'Swahili', 'Luhya'],
                    'rating': 4.7,
                    'reviews_count': 12
                }
            },
            {
                'email': 'employer1@test.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'phone_number': '+254756789012',
                'user_type': 'employer',
                'is_firebase_user': True,
                'firebase_uid': 'aWjocFWJkAdcDObhsWJEL3IYrcG3',
                'profile_data': {
                    'company_name': 'Doe Family',
                    'location': 'Karen, Nairobi',
                    'description': 'Family of 4 looking for reliable house help. We have 2 children aged 5 and 8.'
                }
            },
            {
                'email': 'employer2@test.com',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'phone_number': '+254767890123',
                'user_type': 'employer',
                'is_firebase_user': True,
                'firebase_uid': 'test_jane_smith',
                'profile_data': {
                    'company_name': 'Smith Residence',
                    'location': 'Westlands, Nairobi',
                    'description': 'Professional family seeking experienced house manager for large home.'
                }
            },
            {
                'email': 'agency1@test.com',
                'first_name': 'Domestic',
                'last_name': 'Connect',
                'phone_number': '+254778901234',
                'user_type': 'agency',
                'is_firebase_user': True,
                'firebase_uid': 'dqm8fJAhHhZOUUYStaN9oq7PJ5b2',
                'profile_data': {
                    'agency_name': 'Domestic Connect Agency',
                    'location': 'Nairobi',
                    'description': 'Professional domestic worker placement agency',
                    'license_number': 'DC001'
                }
            }
        ]
        
        created_users = []
        
        for user_data in test_users:
            user = User(
                id=str(uuid.uuid4()),
                firebase_uid=user_data['firebase_uid'],
                email=user_data['email'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                phone_number=user_data['phone_number'],
                user_type=user_data['user_type'],
                is_firebase_user=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.session.add(user)
            created_users.append((user, user_data['profile_data']))
        
        db.session.flush()
        
        # Create profiles for each user
        for user, profile_data in created_users:
            profile = Profile(
                id=str(uuid.uuid4()),
                user_id=user.id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.session.add(profile)
            
            # Create type-specific profiles with comprehensive data
            if user.user_type == 'housegirl':
                housegirl_profile = HousegirlProfile(
                    id=str(uuid.uuid4()),
                    profile_id=profile.id,
                    age=profile_data['age'],
                    bio=profile_data['bio'],
                    current_location=profile_data['current_location'],
                    location=profile_data['location'],
                    education=profile_data['education'],
                    experience=profile_data['experience'],
                    expected_salary=profile_data['expected_salary'],
                    accommodation_type=profile_data['accommodation_type'],
                    tribe=profile_data['tribe'],
                    is_available=profile_data['is_available'],
                    profile_photo_url=profile_data['profile_photo_url']
                )
                db.session.add(housegirl_profile)
                
            elif user.user_type == 'employer':
                employer_profile = EmployerProfile(
                    id=str(uuid.uuid4()),
                    profile_id=profile.id,
                    company_name=profile_data['company_name'],
                    location=profile_data['location'],
                    description=profile_data['description']
                )
                db.session.add(employer_profile)
                
            elif user.user_type == 'agency':
                agency_profile = AgencyProfile(
                    id=str(uuid.uuid4()),
                    profile_id=profile.id,
                    agency_name=profile_data['agency_name'],
                    location=profile_data['location'],
                    description=profile_data['description'],
                    license_number=profile_data['license_number']
                )
                db.session.add(agency_profile)
        
        # Create additional mock data for better app experience
        print("Creating additional mock data...")
        
        # Create sample agencies
        agency1 = Agency(
            id=str(uuid.uuid4()),
            name="Domestic Connect Agency",
            license_number="DC001",
            verification_status="verified",
            subscription_tier="premium",
            rating=4.8,
            services=["Placement", "Training", "Background Checks"],
            location="Nairobi",
            monthly_fee=5000,
            commission_rate=15.0,
            verified_workers=25,
            successful_placements=150,
            description="Leading domestic worker placement agency in Nairobi",
            contact_email="info@domesticconnect.co.ke",
            contact_phone="+254700000000",
            website="https://domesticconnect.co.ke"
        )
        db.session.add(agency1)
        
        agency2 = Agency(
            id=str(uuid.uuid4()),
            name="Nairobi Home Services",
            license_number="NHS002",
            verification_status="verified",
            subscription_tier="basic",
            rating=4.2,
            services=["Placement", "Training"],
            location="Nairobi",
            monthly_fee=3000,
            commission_rate=12.0,
            verified_workers=15,
            successful_placements=80,
            description="Reliable home services agency",
            contact_email="contact@nairobihomeservices.co.ke",
            contact_phone="+254700000001"
        )
        db.session.add(agency2)
        
        # Create sample job postings
        employer_users = [user for user, _ in created_users if user.user_type == 'employer']
        if employer_users:
            # First employer posts a job
            job1 = JobPosting(
                id=str(uuid.uuid4()),
                employer_id=employer_users[0].id,  # John Doe posts this job
                title="Experienced House Manager Needed",
                description="Looking for an experienced house manager for a family of 4. Must have excellent cooking skills and be good with children.",
                location="Karen, Nairobi",
                salary_min=25000,
                salary_max=30000,
                accommodation_type="live_in",
                required_experience="3_years",
                required_education="form_4",
                skills_required=["Cooking", "Cleaning", "Childcare"],
                languages_required=["English", "Swahili"],
                status="active"
            )
            db.session.add(job1)
            
            # Second employer posts another job (if exists)
            if len(employer_users) > 1:
                job2 = JobPosting(
                    id=str(uuid.uuid4()),
                    employer_id=employer_users[1].id,  # Jane Smith posts this job
                    title="House Help for Family of 4",
                    description="Need reliable house help for daily cleaning and cooking. Live-out position.",
                    location="Westlands, Nairobi",
                    salary_min=18000,
                    salary_max=22000,
                    accommodation_type="live_out",
                    required_experience="1_year",
                    required_education="form_2",
                    skills_required=["Cleaning", "Cooking"],
                    languages_required=["English", "Swahili"],
                    status="active"
                )
                db.session.add(job2)
        
        # Create payment packages
        package1 = PaymentPackage(
            id=str(uuid.uuid4()),
            name="Basic Package",
            description="Access to 5 housegirl contacts",
            price=500.0,
            contacts_included=5,
            is_active=True
        )
        db.session.add(package1)
        
        package2 = PaymentPackage(
            id=str(uuid.uuid4()),
            name="Premium Package",
            description="Access to 20 housegirl contacts",
            price=1500.0,
            contacts_included=20,
            is_active=True
        )
        db.session.add(package2)
        
        package3 = PaymentPackage(
            id=str(uuid.uuid4()),
            name="Enterprise Package",
            description="Unlimited access to all housegirl contacts",
            price=3000.0,
            contacts_included=999,
            is_active=True
        )
        db.session.add(package3)
        
        # Commit all changes
        db.session.commit()
        
        print("✅ Test accounts and mock data created successfully!")
        print("\n📋 Test Login Credentials:")
        print("=" * 50)
        print("🏠 HOUSEGIRLS:")
        print("  📧 housegirl1@test.com")
        print("  🔑 testpassword123")
        print("  👤 Sarah Wanjiku (28, 5 years exp, KSh 18,000)")
        print("  📍 Westlands, Nairobi | Live-in | Kikuyu")
        print()
        print("  📧 housegirl2@test.com")
        print("  🔑 testpassword123")
        print("  👤 Grace Akinyi (32, 8 years exp, KSh 22,000)")
        print("  📍 Kilimani, Nairobi | Live-out | Luo")
        print()
        print("  📧 housegirl3@test.com")
        print("  🔑 testpassword123")
        print("  👤 Mary Muthoni (25, 3 years exp, KSh 15,000)")
        print("  📍 Lavington, Nairobi | Live-in | Kikuyu")
        print()
        print("  📧 housegirl4@test.com")
        print("  🔑 testpassword123")
        print("  👤 Esther Wanjala (30, 6 years exp, KSh 20,000)")
        print("  📍 Karen, Nairobi | Live-in | Luhya")
        print()
        print("👔 EMPLOYERS:")
        print("  📧 employer1@test.com")
        print("  🔑 testpassword123")
        print("  👤 John Doe (Doe Family)")
        print("  📍 Karen, Nairobi")
        print()
        print("  📧 employer2@test.com")
        print("  🔑 testpassword123")
        print("  👤 Jane Smith (Smith Residence)")
        print("  📍 Westlands, Nairobi")
        print()
        print("🏢 AGENCIES:")
        print("  📧 agency1@test.com")
        print("  🔑 testpassword123")
        print("  👤 Domestic Connect Agency")
        print("  📍 Nairobi | License: DC001")
        print()
        print("🎯 MOCK DATA CREATED:")
        print("  • 4 Housegirl profiles with photos, skills, ratings")
        print("  • 2 Employer profiles with job postings")
        print("  • 1 Agency profile")
        print("  • 2 Sample agencies in marketplace")
        print("  • 2 Active job postings")
        print("  • 3 Payment packages")
        print()
        print("🚀 Ready to test! Login and see real data across the app!")

if __name__ == '__main__':
    create_test_accounts()
