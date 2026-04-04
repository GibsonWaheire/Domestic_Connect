from flask import Flask, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import sys

# Module-level limiter — routes import this to apply decorators
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[],          # no global limit; apply selectively
    storage_uri="memory://",    # upgrade to redis:// in production if multiple workers
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
        
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://domestic-connect.up.railway.app",
        "https://domestic-connect-production.up.railway.app",
        "https://domesticconnect-production.up.railway.app",
        "https://domesticconnect.vercel.app",
        "https://domestic-connect.co.ke",
        "https://www.domestic-connect.co.ke"
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
        response.headers['Content-Security-Policy'] = "default-src 'self'; frame-ancestors 'self' https://accounts.google.com"
        return response
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.profiles import profiles_bp
    from app.routes.employers import employers_bp
    from app.routes.housegirls import housegirls_bp
    from app.routes.agencies import agencies_bp
    from app.routes.payments import payments_bp
    from app.routes.photos import photos_bp
    from app.routes.admin import admin_bp
    from app.routes.mpesa import mpesa_bp
    from app.routes.jobs import jobs_bp
    from app.routes.cross_entity import cross_entity_bp
    from app.routes.health import health_bp
    from app.routes.messages import messages_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(profiles_bp, url_prefix='/api/profiles')
    app.register_blueprint(employers_bp, url_prefix='/api/employers')
    app.register_blueprint(housegirls_bp, url_prefix='/api/housegirls')
    app.register_blueprint(agencies_bp, url_prefix='/api/agencies')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(photos_bp, url_prefix='/api/photos')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(mpesa_bp, url_prefix='/api/mpesa')
    app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
    app.register_blueprint(cross_entity_bp, url_prefix='/api/cross-entity')
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error'}, 500
    
    return app
