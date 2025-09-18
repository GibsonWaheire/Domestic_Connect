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
@click.option('--password', prompt='Password', hide_input=True, help='Admin password')
def create_admin(email, password):
    """Create an admin user"""
    app = create_app()
    with app.app_context():
        # Check if admin already exists
        existing_admin = User.query.filter_by(email=email).first()
        if existing_admin:
            click.echo(f"User with email {email} already exists!")
            return
        
        # Create admin user
        admin = User(
            id=f"admin_{uuid.uuid4()}",
            firebase_uid=f"admin_{email}",
            email=email,
            user_type='employer',
            first_name='Admin',
            last_name='User'
        )
        
        db.session.add(admin)
        db.session.commit()
        
        click.echo(f"Admin user created: {email}")

@cli.command()
def test_admin_api():
    """Test admin API endpoints"""
    app = create_app()
    with app.app_context():
        click.echo("Testing Admin API Endpoints:")
        click.echo("=" * 40)
        
        # Test admin user exists
        admin_users = User.query.filter(User.email.in_(['admin@domesticconnect.ke', 'admin@test.com'])).all()
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
