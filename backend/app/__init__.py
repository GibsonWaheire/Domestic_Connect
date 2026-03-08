from flask import Flask, request
from flask_cors import CORS
import os
import sys

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# The global `db` handles Firebase. We don't initialize it via Flask extensions.
from app.firebase_init import db

def create_app(config_name=None):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration
    config_name = config_name or os.environ.get('FLASK_ENV', 'default')
    from config import config
    app.config.from_object(config[config_name])
    
    # Initialize extensions with app (none needed for FB right now)
    
    # Configure CORS using environment variables/config
    # Call init_app on config if it exists (for ProductionConfig checks)
    config_class = config[config_name]
    if hasattr(config_class, 'init_app'):
        config_class.init_app(app)
        
    origins = os.environ.get(
        'CORS_ORIGINS', 
        'http://localhost:5173'
    ).split(',')

    CORS(app, 
        origins=origins,
        supports_credentials=True,
        allow_headers=['Content-Type', 'Authorization'],
        methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    )
    
    @app.before_request
    def handle_options():
        if request.method == 'OPTIONS':
            return '', 200
    
    # Create upload directory
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register middleware
    from app.middleware.security import add_security_headers
    from app.middleware.performance import add_performance_headers
    
    @app.after_request
    def after_request(response):
        response = add_security_headers(response)
        response = add_performance_headers(response)
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
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error'}, 500
    
    return app
