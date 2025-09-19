"""
Performance optimization middleware for the Flask application
"""
import gzip
import json
import time
from functools import wraps
from flask import request, Response, g
import hashlib

# Simple in-memory cache (in production, use Redis)
cache = {}
cache_stats = {'hits': 0, 'misses': 0}

def cache_response(timeout=300):
    """
    Cache response decorator
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Generate cache key
            cache_key = f"{request.endpoint}:{request.method}:{hashlib.md5(str(request.args).encode()).hexdigest()}"
            
            # Check cache
            if cache_key in cache:
                cached_data, timestamp = cache[cache_key]
                if time.time() - timestamp < timeout:
                    cache_stats['hits'] += 1
                    return Response(
                        cached_data['data'],
                        status=cached_data['status'],
                        headers=cached_data['headers']
                    )
                else:
                    # Remove expired cache
                    del cache[cache_key]
            
            cache_stats['misses'] += 1
            
            # Execute function
            response = f(*args, **kwargs)
            
            # Cache successful responses
            if hasattr(response, 'status_code') and response.status_code < 400:
                cache[cache_key] = ({
                    'data': response.get_data(),
                    'status': response.status_code,
                    'headers': dict(response.headers)
                }, time.time())
            
            return response
        return decorated_function
    return decorator

def compress_response():
    """
    Compress response if client supports it
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            response = f(*args, **kwargs)
            
            # Check if client accepts gzip
            accept_encoding = request.headers.get('Accept-Encoding', '')
            if 'gzip' in accept_encoding and len(response.get_data()) > 1024:  # Only compress if > 1KB
                compressed_data = gzip.compress(response.get_data())
                response.set_data(compressed_data)
                response.headers['Content-Encoding'] = 'gzip'
                response.headers['Content-Length'] = str(len(compressed_data))
            
            return response
        return decorated_function
    return decorator

def add_performance_headers(response):
    """
    Add performance-related headers
    """
    response.headers['Cache-Control'] = 'public, max-age=300'  # 5 minutes cache
    response.headers['ETag'] = hashlib.md5(response.get_data()).hexdigest()
    return response

def log_performance():
    """
    Log performance metrics
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            start_time = time.time()
            response = f(*args, **kwargs)
            end_time = time.time()
            
            # Log performance metrics
            duration = end_time - start_time
            print(f"Performance: {request.endpoint} took {duration:.3f}s")
            
            # Add performance header
            response.headers['X-Response-Time'] = f"{duration:.3f}s"
            
            return response
        return decorated_function
    return decorator

def get_cache_stats():
    """
    Get cache statistics
    """
    total_requests = cache_stats['hits'] + cache_stats['misses']
    hit_rate = (cache_stats['hits'] / total_requests * 100) if total_requests > 0 else 0
    
    return {
        'hits': cache_stats['hits'],
        'misses': cache_stats['misses'],
        'hit_rate': f"{hit_rate:.2f}%",
        'cache_size': len(cache)
    }

def clear_cache():
    """
    Clear all cached data
    """
    cache.clear()
    cache_stats['hits'] = 0
    cache_stats['misses'] = 0
