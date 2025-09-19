"""
Health check endpoint for monitoring application health
"""
from flask import Blueprint, jsonify, request
from app import db
from app.models import User, JobPosting, JobApplication
from app.middleware.performance import get_cache_stats
from app.middleware.logging import logger
import time
import psutil
import os

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Basic health check endpoint"""
    try:
        # Check database connection
        db.session.execute('SELECT 1')
        
        return jsonify({
            'status': 'healthy',
            'timestamp': time.time(),
            'version': '1.0.0'
        }), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': time.time()
        }), 503

@health_bp.route('/health/detailed', methods=['GET'])
def detailed_health_check():
    """Detailed health check with system metrics"""
    try:
        # Database health
        db.session.execute('SELECT 1')
        
        # Get system metrics
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        cpu_percent = psutil.cpu_percent(interval=1)
        
        # Get application metrics
        user_count = User.query.count()
        job_count = JobPosting.query.count()
        application_count = JobApplication.query.count()
        
        # Get cache stats
        cache_stats = get_cache_stats()
        
        # Check if system resources are healthy
        memory_healthy = memory.percent < 90
        disk_healthy = disk.percent < 90
        cpu_healthy = cpu_percent < 90
        
        overall_healthy = memory_healthy and disk_healthy and cpu_healthy
        
        return jsonify({
            'status': 'healthy' if overall_healthy else 'degraded',
            'timestamp': time.time(),
            'version': '1.0.0',
            'system': {
                'memory': {
                    'total': memory.total,
                    'available': memory.available,
                    'percent': memory.percent,
                    'healthy': memory_healthy
                },
                'disk': {
                    'total': disk.total,
                    'free': disk.free,
                    'percent': disk.percent,
                    'healthy': disk_healthy
                },
                'cpu': {
                    'percent': cpu_percent,
                    'healthy': cpu_healthy
                }
            },
            'application': {
                'users': user_count,
                'jobs': job_count,
                'applications': application_count,
                'cache': cache_stats
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Detailed health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': time.time()
        }), 503

@health_bp.route('/health/readiness', methods=['GET'])
def readiness_check():
    """Kubernetes readiness probe"""
    try:
        # Check if application is ready to serve traffic
        db.session.execute('SELECT 1')
        
        return jsonify({
            'status': 'ready',
            'timestamp': time.time()
        }), 200
        
    except Exception as e:
        logger.error(f"Readiness check failed: {str(e)}")
        return jsonify({
            'status': 'not_ready',
            'error': str(e),
            'timestamp': time.time()
        }), 503

@health_bp.route('/health/liveness', methods=['GET'])
def liveness_check():
    """Kubernetes liveness probe"""
    try:
        # Simple check to see if application is alive
        return jsonify({
            'status': 'alive',
            'timestamp': time.time(),
            'uptime': time.time() - os.path.getctime('/proc/1') if os.path.exists('/proc/1') else 0
        }), 200
        
    except Exception as e:
        logger.error(f"Liveness check failed: {str(e)}")
        return jsonify({
            'status': 'dead',
            'error': str(e),
            'timestamp': time.time()
        }), 503

@health_bp.route('/metrics', methods=['GET'])
def metrics():
    """Prometheus-style metrics endpoint"""
    try:
        # Get application metrics
        user_count = User.query.count()
        job_count = JobPosting.query.count()
        application_count = JobApplication.query.count()
        
        # Get system metrics
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        cpu_percent = psutil.cpu_percent(interval=1)
        
        # Get cache stats
        cache_stats = get_cache_stats()
        
        metrics_text = f"""# HELP users_total Total number of users
# TYPE users_total counter
users_total {user_count}

# HELP jobs_total Total number of job postings
# TYPE jobs_total counter
jobs_total {job_count}

# HELP applications_total Total number of job applications
# TYPE applications_total counter
applications_total {application_count}

# HELP memory_usage_percent Memory usage percentage
# TYPE memory_usage_percent gauge
memory_usage_percent {memory.percent}

# HELP disk_usage_percent Disk usage percentage
# TYPE disk_usage_percent gauge
disk_usage_percent {disk.percent}

# HELP cpu_usage_percent CPU usage percentage
# TYPE cpu_usage_percent gauge
cpu_usage_percent {cpu_percent}

# HELP cache_hits_total Total cache hits
# TYPE cache_hits_total counter
cache_hits_total {cache_stats.get('hits', 0)}

# HELP cache_misses_total Total cache misses
# TYPE cache_misses_total counter
cache_misses_total {cache_stats.get('misses', 0)}

# HELP cache_size Current cache size
# TYPE cache_size gauge
cache_size {cache_stats.get('cache_size', 0)}
"""
        
        return metrics_text, 200, {'Content-Type': 'text/plain; charset=utf-8'}
        
    except Exception as e:
        logger.error(f"Metrics endpoint failed: {str(e)}")
        return jsonify({
            'error': str(e),
            'timestamp': time.time()
        }), 500
