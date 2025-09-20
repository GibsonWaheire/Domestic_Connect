#!/usr/bin/env python3
"""
Database initialization script to populate SQLite database with sample data
"""

import uuid
from datetime import datetime
from app import create_app, db
from app.models import *

def init_database():
    """Initialize database with sample data"""
    app = create_app()
    
    with app.app_context():
        # Create all tables
        db.create_all()
        
        print("Starting database initialization...")
        
        # Clear existing data
        print("Clearing existing data...")
        db.drop_all()
        db.create_all()
        
        # Create sample users
        print("Creating sample users...")
        
        # Sample employers
        employer1 = User(
            id=str(uuid.uuid4()),
            email="john.doe@example.com",
            first_name="John",
            last_name="Doe",
            phone_number="+254712345678",
            user_type="employer",
            is_firebase_user=False
        )
        db.session.add(employer1)
        
        employer2 = User(
            id=str(uuid.uuid4()),
            email="jane.smith@example.com",
            first_name="Jane",
            last_name="Smith",
            phone_number="+254723456789",
            user_type="employer",
            is_firebase_user=False
        )
        db.session.add(employer2)
        
        # Sample housegirls
        housegirl1 = User(
            id=str(uuid.uuid4()),
            email="sarah.wanjiku@example.com",
            first_name="Sarah",
            last_name="Wanjiku",
            phone_number="+254734567890",
            user_type="housegirl",
            is_firebase_user=False
        )
        db.session.add(housegirl1)
        
        housegirl2 = User(
            id=str(uuid.uuid4()),
            email="grace.akinyi@example.com",
            first_name="Grace",
            last_name="Akinyi",
            phone_number="+254745678901",
            user_type="housegirl",
            is_firebase_user=False
        )
        db.session.add(housegirl2)
        
        housegirl3 = User(
            id=str(uuid.uuid4()),
            email="mary.muthoni@example.com",
            first_name="Mary",
            last_name="Muthoni",
            phone_number="+254756789012",
            user_type="housegirl",
            is_firebase_user=False
        )
        db.session.add(housegirl3)
        
        # Sample agency
        agency_user = User(
            id=str(uuid.uuid4()),
            email="admin@domesticconnect.co.ke",
            first_name="Domestic",
            last_name="Connect",
            phone_number="+254767890123",
            user_type="agency",
            is_firebase_user=False
        )
        db.session.add(agency_user)
        
        # Sample admin
        admin_user = User(
            id=str(uuid.uuid4()),
            email="admin@admin.com",
            first_name="Admin",
            last_name="User",
            phone_number="+254778901234",
            user_type="employer",
            is_admin=True,
            is_firebase_user=False
        )
        db.session.add(admin_user)
        
        db.session.flush()
        
        # Create profiles
        print("Creating profiles...")
        
        # Employer profiles
        emp_profile1 = Profile(id=str(uuid.uuid4()), user_id=employer1.id)
        db.session.add(emp_profile1)
        
        emp_profile2 = Profile(id=str(uuid.uuid4()), user_id=employer2.id)
        db.session.add(emp_profile2)
        
        # Housegirl profiles
        hg_profile1 = Profile(id=str(uuid.uuid4()), user_id=housegirl1.id)
        db.session.add(hg_profile1)
        
        hg_profile2 = Profile(id=str(uuid.uuid4()), user_id=housegirl2.id)
        db.session.add(hg_profile2)
        
        hg_profile3 = Profile(id=str(uuid.uuid4()), user_id=housegirl3.id)
        db.session.add(hg_profile3)
        
        # Agency profile
        ag_profile = Profile(id=str(uuid.uuid4()), user_id=agency_user.id)
        db.session.add(ag_profile)
        
        # Admin profile
        admin_profile = Profile(id=str(uuid.uuid4()), user_id=admin_user.id)
        db.session.add(admin_profile)
        
        db.session.flush()
        
        # Create type-specific profiles
        print("Creating type-specific profiles...")
        
        # Employer profiles
        employer_profile1 = EmployerProfile(
            id=str(uuid.uuid4()),
            profile_id=emp_profile1.id,
            company_name="Doe Family",
            location="Karen, Nairobi",
            description="Family looking for reliable house help"
        )
        db.session.add(employer_profile1)
        
        employer_profile2 = EmployerProfile(
            id=str(uuid.uuid4()),
            profile_id=emp_profile2.id,
            company_name="Smith Residence",
            location="Westlands, Nairobi",
            description="Professional family seeking experienced house manager"
        )
        db.session.add(employer_profile2)
        
        # Housegirl profiles
        housegirl_profile1 = HousegirlProfile(
            id=str(uuid.uuid4()),
            profile_id=hg_profile1.id,
            age=28,
            bio="Experienced house help with excellent cooking skills. Great with children and pets.",
            current_location="Nairobi",
            location="Westlands, Nairobi",
            education="Form 4 and Above",
            experience="5 years",
            expected_salary=18000,
            accommodation_type="live_in",
            tribe="Kikuyu",
            is_available=True,
            profile_photo_url="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
        )
        db.session.add(housegirl_profile1)
        
        housegirl_profile2 = HousegirlProfile(
            id=str(uuid.uuid4()),
            profile_id=hg_profile2.id,
            age=32,
            bio="Professional house manager with extensive experience in large households.",
            current_location="Nairobi",
            location="Kilimani, Nairobi",
            education="Form 4 and Above",
            experience="8 years",
            expected_salary=22000,
            accommodation_type="live_out",
            tribe="Luo",
            is_available=True,
            profile_photo_url="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
        )
        db.session.add(housegirl_profile2)
        
        housegirl_profile3 = HousegirlProfile(
            id=str(uuid.uuid4()),
            profile_id=hg_profile3.id,
            age=25,
            bio="Young and energetic house help. Great with children and very reliable.",
            current_location="Nairobi",
            location="Lavington, Nairobi",
            education="Class 8 and Above",
            experience="3 years",
            expected_salary=15000,
            accommodation_type="live_in",
            tribe="Kikuyu",
            is_available=True,
            profile_photo_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
        )
        db.session.add(housegirl_profile3)
        
        # Agency profile
        agency_profile = AgencyProfile(
            id=str(uuid.uuid4()),
            profile_id=ag_profile.id,
            agency_name="Domestic Connect Agency",
            location="Nairobi",
            description="Professional domestic worker placement agency",
            license_number="DC001"
        )
        db.session.add(agency_profile)
        
        # Admin profile
        admin_employer_profile = EmployerProfile(
            id=str(uuid.uuid4()),
            profile_id=admin_profile.id,
            company_name="Admin Account",
            location="Nairobi",
            description="System administrator account"
        )
        db.session.add(admin_employer_profile)
        
        # Create sample agencies
        print("Creating sample agencies...")
        
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
        
        # Create payment packages
        print("Creating payment packages...")
        
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
        
        # Create sample job postings
        print("Creating sample job postings...")
        
        job1 = JobPosting(
            id=str(uuid.uuid4()),
            employer_id=employer1.id,
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
        
        job2 = JobPosting(
            id=str(uuid.uuid4()),
            employer_id=employer2.id,
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
        
        # Commit all changes
        db.session.commit()
        
        print("Database initialization completed!")
        print(f"Created {User.query.count()} users")
        print(f"Created {Profile.query.count()} profiles")
        print(f"Created {EmployerProfile.query.count()} employer profiles")
        print(f"Created {HousegirlProfile.query.count()} housegirl profiles")
        print(f"Created {AgencyProfile.query.count()} agency profiles")
        print(f"Created {Agency.query.count()} agencies")
        print(f"Created {PaymentPackage.query.count()} payment packages")
        print(f"Created {JobPosting.query.count()} job postings")
        
        print("\nSample accounts created:")
        print("Employers:")
        print(f"  - john.doe@example.com (password: password123)")
        print(f"  - jane.smith@example.com (password: password123)")
        print("Housegirls:")
        print(f"  - sarah.wanjiku@example.com (password: password123)")
        print(f"  - grace.akinyi@example.com (password: password123)")
        print(f"  - mary.muthoni@example.com (password: password123)")
        print("Agency:")
        print(f"  - admin@domesticconnect.co.ke (password: password123)")
        print("Admin:")
        print(f"  - admin@admin.com (password: password123)")

if __name__ == '__main__':
    init_database()
