from flask import Flask, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import sys

# Use Redis when available (multi-worker safe); fall back to memory for dev/CI
_redis_url = os.environ.get('REDIS_URL') or os.environ.get('REDIS_PRIVATE_URL')
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[],          # no global limit; applied per route
    storage_uri=_redis_url or "memory://",
)

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# The global `db` handles Firebase. We don't initialize it via Flask extensions   

from app.firebase_init import db

def create_app(config_name=None):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration
    config_name = config_name or os.environ.get('FLASK_ENV', 'default')
    from config import config
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    limiter.init_app(app)
    
    # Configure CORS using environment variables/config
    # Call init_app on config if it exists (for ProductionConfig checks)
    config_class = config[config_name]
    if hasattr(config_class, 'init_app'):
        config_class.init_app(app)
        
    # Read from env var in production; fall back to a minimal safe list.
    # Stale railway subdomains have been removed — if Railway reassigns them
    # to another tenant, they would otherwise have credentialed API access.
    _cors_env = os.environ.get('CORS_ORIGINS', '')
    if _cors_env:
        allowed_origins = [o.strip() for o in _cors_env.split(',') if o.strip()]
    else:
        allowed_origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://domestic-connect.co.ke",
            "https://www.domestic-connect.co.ke",
        ]

    CORS(
        app,
        resources={
            r"/*": {
                "origins": allowed_origins
            }
        },
        supports_credentials=True,
        allow_headers=['Content-Type', 'Authorization', 'Accept'],
        methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    )
    
    # Create upload directory
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register middleware
    from app.middleware.security import add_security_headers
    from app.middleware.performance import add_performance_headers
    
    @app.after_request
    def after_request(response):
        response = add_security_headers(response)
        response = add_performance_headers(response)
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        # CSP is set by add_security_headers — do not override it here to avoid conflicts
        return response
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.profiles import profiles_bp
    from app.routes.employers import employers_bp
    from app.routes.housegirls import housegirls_bp
    from app.routes.agencies import agencies_bp, agency_portal_bp
    from app.routes.payments import payments_bp
    from app.routes.photos import photos_bp
    from app.routes.admin import admin_bp
    from app.routes.mpesa import mpesa_bp
    from app.routes.jobs import jobs_bp
    from app.routes.cross_entity import cross_entity_bp
    from app.routes.health import health_bp
    from app.routes.messages import messages_bp
    from app.routes.worker_inquiries import worker_inquiries_bp
    from app.routes.employer_requests import employer_requests_bp
    from app.routes.workers import workers_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(profiles_bp, url_prefix='/api/profiles')
    app.register_blueprint(employers_bp, url_prefix='/api/employers')
    app.register_blueprint(housegirls_bp, url_prefix='/api/housegirls')
    app.register_blueprint(agencies_bp, url_prefix='/api/agencies')
    app.register_blueprint(agency_portal_bp, url_prefix='/api/agency')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(photos_bp, url_prefix='/api/photos')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(mpesa_bp, url_prefix='/api/mpesa')
    app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
    app.register_blueprint(cross_entity_bp, url_prefix='/api/cross-entity')
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')
    app.register_blueprint(worker_inquiries_bp, url_prefix='/api/worker-inquiries')
    app.register_blueprint(employer_requests_bp, url_prefix='/api/employer-requests')
    app.register_blueprint(workers_bp, url_prefix='/api/workers')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error'}, 500
    
    return app
