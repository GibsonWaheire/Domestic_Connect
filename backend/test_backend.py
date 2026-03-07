#!/usr/bin/env python3
"""
Simple test script to check if the backend works without complex dependencies
"""

import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

try:
    print("🔍 Testing backend imports...")
    
    # Test basic Flask import
    from flask import Flask
    print("✅ Flask imported successfully")
    
    # Test Firebase Admin import
    import firebase_admin
    from firebase_admin import credentials, firestore
    print("✅ Firebase Admin imported successfully")
    
    # Test bcrypt import
    import bcrypt
    print("✅ bcrypt imported successfully")
    
    # Test requests import
    import requests
    print("✅ requests imported successfully")
    
    # Test config import
    from config import Config
    print("✅ Config imported successfully")
    
    # Test app creation
    from app import create_app
    app = create_app()
    print("✅ Flask app created successfully")
    
    print("\n🎉 All imports successful! Backend is ready to run.")
    print("\n📋 Next steps:")
    print("1. cd backend")
    print("2. python run.py")
    print("3. Backend will be available at http://localhost:5001")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("\n🔧 To fix this, run:")
    print("cd backend")
    print("pip install -r requirements.txt")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("\n🔧 Check your Python environment and dependencies")

