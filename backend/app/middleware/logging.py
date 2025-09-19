"""
Logging middleware for the Flask application
"""
import logging
import time
from functools import wraps
from flask import request, g
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def log_request():
    """
    Log incoming requests
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            start_time = time.time()
            
            # Log request details
            logger.info(f"Request: {request.method} {request.path} from {request.remote_addr}")
            
            # Log request body for POST/PUT requests (excluding sensitive data)
            if request.method in ['POST', 'PUT', 'PATCH'] and request.is_json:
                data = request.get_json()
                # Remove sensitive fields
                safe_data = {k: v for k, v in data.items() if k not in ['password', 'token', 'secret']}
                logger.info(f"Request body: {json.dumps(safe_data)}")
            
            # Execute function
            response = f(*args, **kwargs)
            
            # Log response
            duration = time.time() - start_time
            status_code = getattr(response, 'status_code', 200)
            logger.info(f"Response: {status_code} in {duration:.3f}s")
            
            return response
        return decorated_function
    return decorator

def log_error():
    """
    Log errors with stack traces
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                return f(*args, **kwargs)
            except Exception as e:
                logger.error(f"Error in {request.endpoint}: {str(e)}", exc_info=True)
                raise
        return decorated_function
    return decorator

def log_security_event(event_type, details):
    """
    Log security-related events
    """
    logger.warning(f"Security Event: {event_type} - {details}")

def log_performance_issue(endpoint, duration, threshold=1.0):
    """
    Log performance issues
    """
    if duration > threshold:
        logger.warning(f"Performance Issue: {endpoint} took {duration:.3f}s (threshold: {threshold}s)")

def log_user_action(user_id, action, details=None):
    """
    Log user actions for audit trail
    """
    log_data = {
        'user_id': user_id,
        'action': action,
        'timestamp': time.time(),
        'ip_address': request.remote_addr,
        'user_agent': request.headers.get('User-Agent'),
        'details': details
    }
    logger.info(f"User Action: {json.dumps(log_data)}")

def log_api_usage(endpoint, user_id=None):
    """
    Log API usage for analytics
    """
    logger.info(f"API Usage: {endpoint} by user {user_id or 'anonymous'}")

def log_database_query(query, duration):
    """
    Log database query performance
    """
    if duration > 0.1:  # Log slow queries
        logger.warning(f"Slow Query: {query} took {duration:.3f}s")
    else:
        logger.debug(f"Query: {query} took {duration:.3f}s")
