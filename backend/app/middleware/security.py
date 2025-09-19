"""
Security middleware for the Flask application
"""
import time
from functools import wraps
from flask import request, jsonify, g
from collections import defaultdict, deque
import re
import html

# Rate limiting storage (in production, use Redis)
rate_limit_storage = defaultdict(lambda: deque(maxlen=100))

def rate_limit(max_requests=100, window_seconds=60):
    """
    Rate limiting decorator
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get client IP
            client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
            if client_ip:
                client_ip = client_ip.split(',')[0].strip()
            
            # Get current time
            current_time = time.time()
            
            # Clean old requests
            while rate_limit_storage[client_ip] and rate_limit_storage[client_ip][0] < current_time - window_seconds:
                rate_limit_storage[client_ip].popleft()
            
            # Check if limit exceeded
            if len(rate_limit_storage[client_ip]) >= max_requests:
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'message': f'Too many requests. Maximum {max_requests} requests per {window_seconds} seconds.'
                }), 429
            
            # Add current request
            rate_limit_storage[client_ip].append(current_time)
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def validate_input(data, schema):
    """
    Validate input data against a schema
    """
    errors = []
    
    for field, rules in schema.items():
        value = data.get(field)
        
        # Required field check
        if rules.get('required', False) and (value is None or value == ''):
            errors.append(f"{field} is required")
            continue
        
        if value is None:
            continue
        
        # Type validation
        expected_type = rules.get('type')
        if expected_type and not isinstance(value, expected_type):
            errors.append(f"{field} must be of type {expected_type.__name__}")
            continue
        
        # String length validation
        if isinstance(value, str):
            min_length = rules.get('min_length')
            max_length = rules.get('max_length')
            
            if min_length and len(value) < min_length:
                errors.append(f"{field} must be at least {min_length} characters long")
            
            if max_length and len(value) > max_length:
                errors.append(f"{field} must be no more than {max_length} characters long")
        
        # Numeric range validation
        if isinstance(value, (int, float)):
            min_val = rules.get('min')
            max_val = rules.get('max')
            
            if min_val is not None and value < min_val:
                errors.append(f"{field} must be at least {min_val}")
            
            if max_val is not None and value > max_val:
                errors.append(f"{field} must be no more than {max_val}")
        
        # Pattern validation
        pattern = rules.get('pattern')
        if pattern and isinstance(value, str):
            if not re.match(pattern, value):
                errors.append(f"{field} format is invalid")
        
        # Enum validation
        enum_values = rules.get('enum')
        if enum_values and value not in enum_values:
            errors.append(f"{field} must be one of: {', '.join(enum_values)}")
    
    return errors

def sanitize_input(data):
    """
    Sanitize input data to prevent XSS attacks
    """
    if isinstance(data, dict):
        return {key: sanitize_input(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    elif isinstance(data, str):
        return html.escape(data)
    else:
        return data

def validate_json_input(schema):
    """
    Decorator to validate JSON input against a schema
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.is_json:
                return jsonify({'error': 'Content-Type must be application/json'}), 400
            
            data = request.get_json()
            if not data:
                return jsonify({'error': 'Request body must contain valid JSON'}), 400
            
            # Sanitize input
            data = sanitize_input(data)
            
            # Validate input
            errors = validate_input(data, schema)
            if errors:
                return jsonify({
                    'error': 'Validation failed',
                    'details': errors
                }), 400
            
            # Store validated data in g for use in route
            g.validated_data = data
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def require_https():
    """
    Decorator to require HTTPS in production
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if request.is_secure or request.headers.get('X-Forwarded-Proto') == 'https':
                return f(*args, **kwargs)
            else:
                return jsonify({'error': 'HTTPS required'}), 403
        return decorated_function
    return decorator

def add_security_headers(response):
    """
    Add security headers to response
    """
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "default-src 'self'"
    return response

# Common validation schemas
USER_SCHEMA = {
    'email': {
        'required': True,
        'type': str,
        'pattern': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
        'max_length': 255
    },
    'password': {
        'required': True,
        'type': str,
        'min_length': 8,
        'max_length': 128
    },
    'first_name': {
        'required': True,
        'type': str,
        'min_length': 1,
        'max_length': 100
    },
    'last_name': {
        'required': True,
        'type': str,
        'min_length': 1,
        'max_length': 100
    },
    'phone_number': {
        'required': False,
        'type': str,
        'pattern': r'^\+?[1-9]\d{1,14}$',
        'max_length': 20
    },
    'user_type': {
        'required': True,
        'enum': ['employer', 'housegirl', 'agency']
    }
}

JOB_POSTING_SCHEMA = {
    'title': {
        'required': True,
        'type': str,
        'min_length': 5,
        'max_length': 200
    },
    'description': {
        'required': True,
        'type': str,
        'min_length': 20,
        'max_length': 2000
    },
    'location': {
        'required': True,
        'type': str,
        'min_length': 2,
        'max_length': 100
    },
    'salary_min': {
        'required': True,
        'type': int,
        'min': 0,
        'max': 1000000
    },
    'salary_max': {
        'required': True,
        'type': int,
        'min': 0,
        'max': 1000000
    },
    'accommodation_type': {
        'required': True,
        'enum': ['live_in', 'live_out', 'both']
    },
    'required_experience': {
        'required': True,
        'enum': ['no_experience', '1_year', '2_years', '3_years', '4_years', '5_plus_years']
    },
    'required_education': {
        'required': True,
        'enum': ['primary', 'form_2', 'form_4', 'certificate', 'diploma', 'degree']
    },
    'skills_required': {
        'required': False,
        'type': list
    },
    'languages_required': {
        'required': False,
        'type': list
    }
}
