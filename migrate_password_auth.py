#!/usr/bin/env python3
"""
Database migration script to add password_hash column
Run this after updating the User model
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app, db
from backend.app.models import User

def migrate_database():
    """Add password_hash column to existing users table"""
    print("🔄 Starting database migration...")
    
    app = create_app()
    
    with app.app_context():
        try:
            # Check if password_hash column already exists
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('users')]
            
            if 'password_hash' in columns:
                print("✅ password_hash column already exists")
                return True
            
            # Add password_hash column
            print("📝 Adding password_hash column...")
            db.engine.execute('ALTER TABLE users ADD COLUMN password_hash VARCHAR(128)')
            
            # Update firebase_uid to be nullable
            print("📝 Updating firebase_uid to be nullable...")
            db.engine.execute('ALTER TABLE users ALTER COLUMN firebase_uid DROP NOT NULL')
            
            print("✅ Database migration completed successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            return False

def verify_migration():
    """Verify the migration was successful"""
    print("\n🔍 Verifying migration...")
    
    app = create_app()
    
    with app.app_context():
        try:
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('users')]
            
            if 'password_hash' in columns:
                print("✅ password_hash column exists")
            else:
                print("❌ password_hash column missing")
                return False
            
            # Check if we can create a user with password
            test_user = User(
                id="migration_test_123",
                email="migration@test.com",
                user_type="employer",
                first_name="Migration",
                last_name="Test"
            )
            
            test_user.set_password("testpassword123")
            print("✅ Password hashing works with new column")
            
            return True
            
        except Exception as e:
            print(f"❌ Verification failed: {e}")
            return False

if __name__ == "__main__":
    print("🚀 Starting Database Migration")
    print("=" * 50)
    
    if migrate_database():
        if verify_migration():
            print("\n" + "=" * 50)
            print("🎉 Migration completed successfully!")
            print("\nNext steps:")
            print("1. Install bcrypt: pip install bcrypt==4.0.1")
            print("2. Test the new authentication endpoints")
            print("3. Update your frontend to use local auth")
        else:
            print("\n❌ Migration verification failed!")
            sys.exit(1)
    else:
        print("\n❌ Migration failed!")
        sys.exit(1)
