#!/usr/bin/env python3
"""
Test script for bcrypt password hashing functionality
Run this to verify the password hashing works correctly
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app, db
from backend.app.models import User

def test_password_hashing():
    """Test bcrypt password hashing functionality"""
    print("🔐 Testing bcrypt password hashing...")
    
    # Create app context
    app = create_app()
    
    with app.app_context():
        try:
            # Test 1: Create user and set password
            print("\n1. Testing password setting...")
            user = User(
                id="test_user_123",
                email="test@example.com",
                user_type="employer",
                first_name="Test",
                last_name="User"
            )
            
            # Set password
            user.set_password("testpassword123")
            
            # Verify password hash was created
            assert user.password_hash is not None, "Password hash should be created"
            assert len(user.password_hash) > 50, "Password hash should be substantial length"
            print("✅ Password hash created successfully")
            
            # Test 2: Verify password checking
            print("\n2. Testing password verification...")
            assert user.check_password("testpassword123") == True, "Correct password should return True"
            assert user.check_password("wrongpassword") == False, "Wrong password should return False"
            assert user.check_password("") == False, "Empty password should return False"
            print("✅ Password verification works correctly")
            
            # Test 3: Test password property protection
            print("\n3. Testing password property protection...")
            try:
                _ = user.password
                assert False, "Should raise AttributeError when accessing password property"
            except AttributeError as e:
                assert "password is not a readable attribute" in str(e)
                print("✅ Password property protection works")
            
            # Test 4: Test password validation
            print("\n4. Testing password validation...")
            try:
                user.set_password("short")
                assert False, "Should raise ValueError for short password"
            except ValueError as e:
                assert "at least 8 characters" in str(e)
                print("✅ Password length validation works")
            
            try:
                user.set_password("")
                assert False, "Should raise ValueError for empty password"
            except ValueError as e:
                assert "Password cannot be empty" in str(e)
                print("✅ Empty password validation works")
            
            print("\n🎉 All bcrypt tests passed successfully!")
            return True
            
        except Exception as e:
            print(f"\n❌ Test failed: {e}")
            return False

def test_auth_endpoints():
    """Test authentication endpoints"""
    print("\n🔗 Testing authentication endpoints...")
    
    app = create_app()
    
    with app.test_client() as client:
        # Test signup endpoint
        print("\n1. Testing signup endpoint...")
        signup_data = {
            "email": "newuser@example.com",
            "password": "securepassword123",
            "user_type": "employer",
            "first_name": "New",
            "last_name": "User"
        }
        
        response = client.post('/api/auth/signup', 
                              json=signup_data,
                              content_type='application/json')
        
        if response.status_code == 201:
            print("✅ Signup endpoint works")
        else:
            print(f"❌ Signup failed: {response.status_code} - {response.get_json()}")
        
        # Test login endpoint
        print("\n2. Testing login endpoint...")
        login_data = {
            "email": "newuser@example.com",
            "password": "securepassword123"
        }
        
        response = client.post('/api/auth/login',
                              json=login_data,
                              content_type='application/json')
        
        if response.status_code == 200:
            print("✅ Login endpoint works")
        else:
            print(f"❌ Login failed: {response.status_code} - {response.get_json()}")
        
        # Test check_session endpoint
        print("\n3. Testing check_session endpoint...")
        response = client.get('/api/auth/check_session')
        
        if response.status_code == 200:
            print("✅ Check session endpoint works")
        else:
            print(f"❌ Check session failed: {response.status_code}")

if __name__ == "__main__":
    print("🚀 Starting Domestic Connect Security Tests")
    print("=" * 50)
    
    # Test password hashing
    if test_password_hashing():
        print("\n" + "=" * 50)
        print("✅ Password hashing tests completed successfully!")
    else:
        print("\n" + "=" * 50)
        print("❌ Password hashing tests failed!")
        sys.exit(1)
    
    # Test auth endpoints
    test_auth_endpoints()
    
    print("\n" + "=" * 50)
    print("🎉 All security tests completed!")
    print("\nNext steps:")
    print("1. Install bcrypt: pip install bcrypt==4.0.1")
    print("2. Run database migration to add password_hash column")
    print("3. Test the endpoints with your frontend")
