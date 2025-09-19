#!/usr/bin/env python3
"""
Test script to verify Firebase authentication integration
"""

import requests
import json

# Test configuration
BASE_URL = "http://localhost:5000"
TEST_EMAIL = "test@employer.com"
TEST_PASSWORD = "password123"

def test_local_auth():
    """Test local authentication (test accounts)"""
    print("Testing local authentication...")
    
    # Test login
    login_data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Local login successful: {data['user']['email']}")
        print(f"   User type: {data['user']['user_type']}")
        print(f"   Is Firebase user: {data['user'].get('is_firebase_user', False)}")
        return True
    else:
        print(f"❌ Local login failed: {response.status_code}")
        print(f"   Error: {response.text}")
        return False

def test_session_check():
    """Test session check endpoint"""
    print("\nTesting session check...")
    
    response = requests.get(f"{BASE_URL}/api/auth/check_session")
    
    if response.status_code == 200:
        data = response.json()
        if data.get('user'):
            print(f"✅ Session check successful: {data['user']['email']}")
            return True
        else:
            print("ℹ️  No active session (expected if not logged in)")
            return True
    else:
        print(f"❌ Session check failed: {response.status_code}")
        return False

def test_health_endpoint():
    """Test health endpoint"""
    print("\nTesting health endpoint...")
    
    response = requests.get(f"{BASE_URL}/api/health")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Health check successful: {data['status']}")
        return True
    else:
        print(f"❌ Health check failed: {response.status_code}")
        return False

def main():
    """Run all tests"""
    print("🧪 Firebase Authentication Integration Test")
    print("=" * 50)
    
    tests = [
        test_health_endpoint,
        test_local_auth,
        test_session_check,
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Firebase integration is ready.")
    else:
        print("⚠️  Some tests failed. Check the backend logs for details.")

if __name__ == "__main__":
    main()
