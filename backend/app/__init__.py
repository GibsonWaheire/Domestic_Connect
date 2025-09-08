from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials
import os
import sys

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()

def create_app(config_name=None):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration
    config_name = config_name or os.environ.get('FLASK_ENV', 'default')
    from config import config
    app.config.from_object(config[config_name])
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Initialize Firebase Admin SDK
    initialize_firebase(app)
    
    # Create upload directory
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.profiles import profiles_bp
    from app.routes.employers import employers_bp
    from app.routes.housegirls import housegirls_bp
    from app.routes.agencies import agencies_bp
    from app.routes.payments import payments_bp
    from app.routes.photos import photos_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(profiles_bp, url_prefix='/api/profiles')
    app.register_blueprint(employers_bp, url_prefix='/api/employers')
    app.register_blueprint(housegirls_bp, url_prefix='/api/housegirls')
    app.register_blueprint(agencies_bp, url_prefix='/api/agencies')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(photos_bp, url_prefix='/api/photos')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return {'error': 'Internal server error'}, 500
    
    return app

def initialize_firebase(app):
    """Initialize Firebase Admin SDK"""
    try:
        # Check if Firebase is already initialized
        if not firebase_admin._apps:
            # Initialize with service account key
            if app.config.get('FIREBASE_PROJECT_ID'):
                cred = credentials.Certificate({
                    "type": "service_account",
                    "project_id": app.config['FIREBASE_PROJECT_ID'],
                    "private_key": app.config['FIREBASE_PRIVATE_KEY'].replace('\\n', '\n'),
                    "client_email": app.config['FIREBASE_CLIENT_EMAIL'],
                })
                firebase_admin.initialize_app(cred)
            else:
                # Use default credentials (for development)
                firebase_admin.initialize_app()
    except Exception as e:
        app.logger.warning(f"Firebase initialization failed: {e}")
        # Continue without Firebase for development
