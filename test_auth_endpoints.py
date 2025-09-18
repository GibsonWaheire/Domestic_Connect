#!/usr/bin/env python3
"""
Test authentication endpoints directly
This script tests the auth endpoints without the frontend
"""

import requests
import json

def test_auth_endpoints():
    """Test authentication endpoints"""
    print("🔐 Testing authentication endpoints...")
    
    base_url = "http://localhost:5000"
    
    # Test data
    test_user = {
        "email": "test@example.com",
        "password": "testpassword123",
        "user_type": "employer",
        "first_name": "Test",
        "last_name": "User",
        "phone_number": "+254700000000"
    }
    
    try:
        # Test 1: Signup
        print("\n1. Testing signup...")
        signup_response = requests.post(
            f"{base_url}/api/auth/signup",
            json=test_user,
            headers={"Content-Type": "application/json"}
        )
        
        if signup_response.status_code == 201:
            print("✅ Signup successful")
            signup_data = signup_response.json()
            print(f"   User ID: {signup_data['user']['id']}")
        else:
            print(f"❌ Signup failed: {signup_response.status_code}")
            print(f"   Error: {signup_response.text}")
            return False
        
        # Test 2: Login
        print("\n2. Testing login...")
        login_data = {
            "email": test_user["email"],
            "password": test_user["password"]
        }
        
        login_response = requests.post(
            f"{base_url}/api/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        if login_response.status_code == 200:
            print("✅ Login successful")
            login_data = login_response.json()
            print(f"   Welcome: {login_data['user']['first_name']}")
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"   Error: {login_response.text}")
            return False
        
        # Test 3: Check session
        print("\n3. Testing session check...")
        session_response = requests.get(f"{base_url}/api/auth/check_session")
        
        if session_response.status_code == 200:
            print("✅ Session check successful")
            session_data = session_response.json()
            if session_data['user']:
                print(f"   User logged in: {session_data['user']['email']}")
            else:
                print("   No user in session")
        else:
            print(f"❌ Session check failed: {session_response.status_code}")
        
        # Test 4: Logout
        print("\n4. Testing logout...")
        logout_response = requests.delete(f"{base_url}/api/auth/logout")
        
        if logout_response.status_code == 200:
            print("✅ Logout successful")
        else:
            print(f"❌ Logout failed: {logout_response.status_code}")
        
        # Test 5: Check session after logout
        print("\n5. Testing session after logout...")
        session_response = requests.get(f"{base_url}/api/auth/check_session")
        
        if session_response.status_code == 200:
            session_data = session_response.json()
            if not session_data['user']:
                print("✅ Session cleared successfully")
            else:
                print("❌ Session not cleared")
        
        print("\n🎉 All authentication tests passed!")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Flask server")
        print("   Make sure Flask backend is running on http://localhost:5000")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_existing_users():
    """Test login with existing test users"""
    print("\n👥 Testing login with existing test users...")
    
    base_url = "http://localhost:5000"
    
    test_users = [
        {"email": "employer@example.com", "password": "password123"},
        {"email": "housegirl@example.com", "password": "password123"},
        {"email": "agency@example.com", "password": "password123"},
        {"email": "admin@domesticconnect.ke", "password": "admin123456"}
    ]
    
    for user in test_users:
        try:
            print(f"\nTesting {user['email']}...")
            response = requests.post(
                f"{base_url}/api/auth/login",
                json=user,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Login successful: {data['user']['first_name']} ({data['user']['user_type']})")
            else:
                print(f"❌ Login failed: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ Error testing {user['email']}: {e}")

if __name__ == "__main__":
    print("🚀 Testing Domestic Connect Authentication")
    print("=" * 60)
    
    # Test with existing users first
    test_existing_users()
    
    # Test full auth flow
    if test_auth_endpoints():
        print("\n" + "=" * 60)
        print("🎉 Authentication system is working correctly!")
        print("\nYou can now:")
        print("1. Use the test users to login")
        print("2. Test the frontend authentication")
        print("3. Create new users through the signup form")
    else:
        print("\n❌ Authentication tests failed!")
        print("Make sure to:")
        print("1. Install bcrypt: pip install bcrypt==4.0.1")
        print("2. Run database migration: python migrate_password_auth.py")
        print("3. Create test users: python create_test_users.py")
        print("4. Start Flask backend: python run.py")
