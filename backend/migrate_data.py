#!/usr/bin/env python3
"""
Data migration script to transfer data from db.json to SQLite database
"""

import json
import uuid
from datetime import datetime
from app import create_app, db
from app.models import *

def migrate_data():
    """Migrate data from db.json to SQLite database"""
    app = create_app()
    
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Load data from db.json
        with open('../db.json', 'r') as f:
            data = json.load(f)
        
        print("Starting data migration...")
        
        # Migrate profiles
        print("Migrating profiles...")
        for profile_data in data.get('profiles', []):
            # Create user
            user = User(
                id=profile_data.get('id', str(uuid.uuid4())),
                firebase_uid=f"migrated_{profile_data.get('user_id', '')}",
                email=profile_data['email'],
                user_type=profile_data['user_type'],
                first_name=profile_data['first_name'],
                last_name=profile_data['last_name'],
                phone_number=profile_data.get('phone_number'),
                created_at=datetime.fromisoformat(profile_data['created_at'].replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(profile_data['updated_at'].replace('Z', '+00:00'))
            )
            
            try:
                db.session.add(user)
                db.session.flush()
                
                # Create profile
                profile = Profile(
                    id=str(uuid.uuid4()),
                    user_id=user.id
                )
                db.session.add(profile)
                db.session.flush()
                
                # Create type-specific profile
                if user.user_type == 'employer':
                    employer_data = next((ep for ep in data.get('employer_profiles', []) 
                                        if ep['profile_id'] == profile_data['id']), None)
                    if employer_data:
                        employer_profile = EmployerProfile(
                            id=employer_data.get('id', str(uuid.uuid4())),
                            profile_id=profile.id,
                            company_name=employer_data.get('company_name', ''),
                            location=employer_data.get('location', ''),
                            description=employer_data.get('description', ''),
                            created_at=datetime.fromisoformat(employer_data['created_at'].replace('Z', '+00:00')),
                            updated_at=datetime.fromisoformat(employer_data['updated_at'].replace('Z', '+00:00'))
                        )
                        db.session.add(employer_profile)
                
                elif user.user_type == 'housegirl':
                    housegirl_data = next((hp for hp in data.get('housegirl_profiles', []) 
                                         if hp['profile_id'] == profile_data['id']), None)
                    if housegirl_data:
                        housegirl_profile = HousegirlProfile(
                            id=housegirl_data.get('id', str(uuid.uuid4())),
                            profile_id=profile.id,
                            age=housegirl_data.get('age'),
                            bio=housegirl_data.get('bio', ''),
                            current_location=housegirl_data.get('current_location', ''),
                            location=housegirl_data.get('location', ''),
                            education=housegirl_data.get('education', ''),
                            experience=housegirl_data.get('experience', ''),
                            expected_salary=housegirl_data.get('expected_salary'),
                            accommodation_type=housegirl_data.get('accommodation_type', ''),
                            tribe=housegirl_data.get('tribe', ''),
                            is_available=housegirl_data.get('is_available', True),
                            profile_photo_url=housegirl_data.get('profile_photo_url'),
                            created_at=datetime.fromisoformat(housegirl_data['created_at'].replace('Z', '+00:00')),
                            updated_at=datetime.fromisoformat(housegirl_data['updated_at'].replace('Z', '+00:00'))
                        )
                        db.session.add(housegirl_profile)
                
                elif user.user_type == 'agency':
                    agency_data = next((ap for ap in data.get('agency_profiles', []) 
                                      if ap['profile_id'] == profile_data['id']), None)
                    if agency_data:
                        agency_profile = AgencyProfile(
                            id=agency_data.get('id', str(uuid.uuid4())),
                            profile_id=profile.id,
                            agency_name=agency_data.get('agency_name', ''),
                            location=agency_data.get('location', ''),
                            description=agency_data.get('description', ''),
                            license_number=agency_data.get('license_number', ''),
                            created_at=datetime.fromisoformat(agency_data['created_at'].replace('Z', '+00:00')),
                            updated_at=datetime.fromisoformat(agency_data['updated_at'].replace('Z', '+00:00'))
                        )
                        db.session.add(agency_profile)
                
                db.session.commit()
                print(f"Migrated profile: {user.email}")
                
            except Exception as e:
                db.session.rollback()
                print(f"Error migrating profile {profile_data['email']}: {e}")
        
        # Migrate agencies
        print("Migrating agencies...")
        for agency_data in data.get('agencies', []):
            agency = Agency(
                id=agency_data['id'],
                name=agency_data['name'],
                license_number=agency_data.get('license_number'),
                verification_status=agency_data.get('verification_status', 'pending'),
                subscription_tier=agency_data.get('subscription_tier', 'basic'),
                rating=agency_data.get('rating', 0.0),
                services=agency_data.get('services', []),
                location=agency_data.get('location', ''),
                monthly_fee=agency_data.get('monthly_fee', 0),
                commission_rate=agency_data.get('commission_rate', 0.0),
                verified_workers=agency_data.get('verified_workers', 0),
                successful_placements=agency_data.get('successful_placements', 0),
                description=agency_data.get('description', ''),
                contact_email=agency_data.get('contact_email', ''),
                contact_phone=agency_data.get('contact_phone', ''),
                website=agency_data.get('website', ''),
                created_at=datetime.fromisoformat(agency_data['created_at'].replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(agency_data['updated_at'].replace('Z', '+00:00'))
            )
            
            try:
                db.session.add(agency)
                db.session.commit()
                print(f"Migrated agency: {agency.name}")
            except Exception as e:
                db.session.rollback()
                print(f"Error migrating agency {agency_data['name']}: {e}")
        
        # Migrate payment packages
        print("Migrating payment packages...")
        for package_data in data.get('payment_packages', []):
            package = PaymentPackage(
                id=package_data['id'],
                name=package_data['name'],
                description=package_data.get('description', ''),
                price=package_data['price'],
                contacts_included=package_data['contacts_included'],
                is_active=package_data.get('is_active', True),
                created_at=datetime.fromisoformat(package_data['created_at'].replace('Z', '+00:00'))
            )
            
            try:
                db.session.add(package)
                db.session.commit()
                print(f"Migrated package: {package.name}")
            except Exception as e:
                db.session.rollback()
                print(f"Error migrating package {package_data['name']}: {e}")
        
        print("Data migration completed!")
        print(f"Migrated {User.query.count()} users")
        print(f"Migrated {Profile.query.count()} profiles")
        print(f"Migrated {EmployerProfile.query.count()} employer profiles")
        print(f"Migrated {HousegirlProfile.query.count()} housegirl profiles")
        print(f"Migrated {AgencyProfile.query.count()} agency profiles")
        print(f"Migrated {Agency.query.count()} agencies")
        print(f"Migrated {PaymentPackage.query.count()} payment packages")

if __name__ == '__main__':
    migrate_data()
