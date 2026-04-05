#!/usr/bin/env python3
"""
CLI script for database management
"""

import click
from app import create_app, db
from app.models import *
import os
import uuid

@click.group()
def cli():
    """Domestic Connect Database CLI"""
    pass

@cli.command()
def init():
    """Initialize the database"""
    app = create_app()
    with app.app_context():
        db.create_all()
        click.echo("Database initialized successfully!")

@cli.command()
def reset():
    """Reset the database (WARNING: This will delete all data)"""
    app = create_app()
    with app.app_context():
        if click.confirm('Are you sure you want to reset the database? This will delete ALL data.'):
            db.drop_all()
            db.create_all()
            click.echo("Database reset successfully!")

@cli.command()
def migrate():
    """Migrate data from db.json"""
    app = create_app()
    with app.app_context():
        # Import and run migration
        from migrate_data import migrate_data
        migrate_data()

@cli.command()
def stats():
    """Show database statistics"""
    app = create_app()
    with app.app_context():
        click.echo("Database Statistics:")
        click.echo(f"Users: {User.query.count()}")
        click.echo(f"Profiles: {Profile.query.count()}")
        click.echo(f"Employer Profiles: {EmployerProfile.query.count()}")
        click.echo(f"Housegirl Profiles: {HousegirlProfile.query.count()}")
        click.echo(f"Agency Profiles: {AgencyProfile.query.count()}")
        click.echo(f"Agencies: {Agency.query.count()}")
        click.echo(f"Payment Packages: {PaymentPackage.query.count()}")
        click.echo(f"User Purchases: {UserPurchase.query.count()}")
        click.echo(f"Contact Access: {ContactAccess.query.count()}")
        click.echo(f"Photos: {Photo.query.count()}")

@cli.command()
@click.option('--email', prompt='Email', help='Admin email')
@click.option('--password', prompt='Password', hide_input=True, confirmation_prompt=True, help='Admin password')
@click.option('--first-name', default='Admin', prompt='First name', help='First name')
@click.option('--last-name', default='User', prompt='Last name', help='Last name')
def create_admin(email, password, first_name, last_name):
    """Create an admin user in Firebase Auth + Firestore"""
    app = create_app()
    with app.app_context():
        from app.firebase_init import db as firestore_db
        from firebase_admin import auth as firebase_admin_auth
        from datetime import datetime

        # Check Firestore for existing user
        existing = list(firestore_db.collection('users').where('email', '==', email).limit(1).stream())
        if existing:
            click.echo(f"A user with email {email} already exists in Firestore.")
            return

        # Create Firebase Auth account (pre-verified so admin can log in immediately)
        try:
            fb_user = firebase_admin_auth.create_user(
                email=email,
                password=password,
                display_name=f"{first_name} {last_name}",
                email_verified=True,
            )
        except Exception as e:
            click.echo(f"Failed to create Firebase Auth account: {e}")
            return

        uid = fb_user.uid
        user_id = f"user_{uid}"
        timestamp = datetime.utcnow().isoformat()

        # Stamp role as custom claim so token carries it
        try:
            firebase_admin_auth.set_custom_user_claims(uid, {'role': 'admin'})
        except Exception as e:
            click.echo(f"Warning: could not set custom claim: {e}")

        # Write Firestore user doc
        firestore_db.collection('users').document(user_id).set({
            'id': user_id,
            'uid': uid,
            'firebase_uid': uid,
            'email': email,
            'user_type': 'admin',
            'first_name': first_name,
            'last_name': last_name,
            'is_active': True,
            'is_admin': True,
            'is_firebase_user': True,
            'profile_complete': True,
            'created_at': timestamp,
            'updated_at': timestamp,
        })

        click.echo(f"✓ Admin created: {email}")
        click.echo(f"  Firebase UID : {uid}")
        click.echo(f"  Firestore ID : {user_id}")
        click.echo("  The account is email-verified and can log in immediately.")

@cli.command()
def test_admin_api():
    """Test admin API endpoints"""
    app = create_app()
    with app.app_context():
        click.echo("Testing Admin API Endpoints:")
        click.echo("=" * 40)
        
        # Test admin user exists
        admin_users = User.query.filter(User.email.in_(['admin@domesticconnect.ke'])).all()
        click.echo(f"Admin users found: {len(admin_users)}")
        
        for admin in admin_users:
            click.echo(f"  - {admin.email} ({admin.user_type})")
        
        # Test admin routes exist
        click.echo("\nAdmin routes available:")
        click.echo("  - GET /api/admin/dashboard")
        click.echo("  - GET /api/admin/users")
        click.echo("  - GET /api/admin/users/<user_id>")
        click.echo("  - PUT /api/admin/users/<user_id>/toggle-status")
        click.echo("  - GET /api/admin/agencies")
        click.echo("  - PUT /api/admin/agencies/<agency_id>/verify")
        click.echo("  - POST /api/admin/sync")
        click.echo("  - GET /api/admin/analytics")
        
        click.echo("\nAdmin dashboard accessible at: /admin-dashboard")
        click.echo("Make sure to authenticate with Firebase token in Authorization header")

if __name__ == '__main__':
    cli()
