#!/usr/bin/env python3
"""
Simple test script to check if the backend works without complex dependencies
"""

import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

try:
    print("🔍 Testing backend imports...")
    
    # Test basic Flask import
    from flask import Flask
    print("✅ Flask imported successfully")
    
    # Test SQLAlchemy import
    from flask_sqlalchemy import SQLAlchemy
    print("✅ SQLAlchemy imported successfully")
    
    # Test bcrypt import
    import bcrypt
    print("✅ bcrypt imported successfully")
    
    # Test requests import
    import requests
    print("✅ requests imported successfully")
    
    # Test config import
    from backend.config import Config
    print("✅ Config imported successfully")
    
    # Test app creation
    from backend.app import create_app
    app = create_app()
    print("✅ Flask app created successfully")
    
    print("\n🎉 All imports successful! Backend is ready to run.")
    print("\n📋 Next steps:")
    print("1. cd backend")
    print("2. python run.py")
    print("3. Backend will be available at http://localhost:5000")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("\n🔧 To fix this, run:")
    print("cd backend")
    print("pip install -r requirements.txt")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("\n🔧 Check your Python environment and dependencies")

