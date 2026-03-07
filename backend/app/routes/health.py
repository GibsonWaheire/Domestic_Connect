"""
Health check endpoint for monitoring application health
"""
from flask import Blueprint, jsonify
from app.firebase_init import db
from app.middleware.performance import get_cache_stats
from app.middleware.logging import logger
import time
import os

try:
    import psutil
except ImportError:  # pragma: no cover - environment-specific dependency
    psutil = None

health_bp = Blueprint('health', __name__)


def _get_system_metrics():
    """
    Return system metrics if psutil is available, else None.
    """
    if psutil is None:
        return None

    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    cpu_percent = psutil.cpu_percent(interval=1)

    return {
        'memory': memory,
        'disk': disk,
        'cpu_percent': cpu_percent
    }

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Basic health check endpoint"""
    try:
        # Check database connection (Firestore)
        docs = list(db.collection('users').limit(1).stream())
        
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
        docs = list(db.collection('users').limit(1).stream())
        
        # Get application metrics
        user_count = len(list(db.collection('users').stream()))
        job_count = len(list(db.collection('job_postings').stream()))
        application_count = len(list(db.collection('job_applications').stream()))
        
        # Get cache stats
        cache_stats = get_cache_stats()
        
        # Get system metrics (optional when psutil is unavailable)
        system_metrics = _get_system_metrics()
        if system_metrics:
            memory = system_metrics['memory']
            disk = system_metrics['disk']
            cpu_percent = system_metrics['cpu_percent']

            memory_healthy = memory.percent < 90
            disk_healthy = disk.percent < 90
            cpu_healthy = cpu_percent < 90
            overall_healthy = memory_healthy and disk_healthy and cpu_healthy

            system_payload = {
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
                },
                'metrics_available': True
            }
        else:
            overall_healthy = True
            system_payload = {
                'metrics_available': False,
                'warning': 'psutil not installed; system metrics unavailable'
            }

        return jsonify({
            'status': 'healthy' if overall_healthy else 'degraded',
            'timestamp': time.time(),
            'version': '1.0.0',
            'system': system_payload,
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
        docs = list(db.collection('users').limit(1).stream())
        
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
        user_count = len(list(db.collection('users').stream()))
        job_count = len(list(db.collection('job_postings').stream()))
        application_count = len(list(db.collection('job_applications').stream()))
        
        # Get system metrics (optional when psutil is unavailable)
        system_metrics = _get_system_metrics()
        memory_percent = system_metrics['memory'].percent if system_metrics else -1
        disk_percent = system_metrics['disk'].percent if system_metrics else -1
        cpu_percent = system_metrics['cpu_percent'] if system_metrics else -1
        system_metrics_available = 1 if system_metrics else 0
        
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

# HELP memory_usage_percent Memory usage percentage (-1 if unavailable)
# TYPE memory_usage_percent gauge
memory_usage_percent {memory_percent}

# HELP disk_usage_percent Disk usage percentage (-1 if unavailable)
# TYPE disk_usage_percent gauge
disk_usage_percent {disk_percent}

# HELP cpu_usage_percent CPU usage percentage (-1 if unavailable)
# TYPE cpu_usage_percent gauge
cpu_usage_percent {cpu_percent}

# HELP system_metrics_available 1 when psutil metrics are available, else 0
# TYPE system_metrics_available gauge
system_metrics_available {system_metrics_available}

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
