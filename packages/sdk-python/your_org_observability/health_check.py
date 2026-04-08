"""
your-org-observability - Health check endpoints
"""

import time
from datetime import datetime
from typing import Any, Optional, Callable, Union

try:
    from django.http import JsonResponse
    from django.urls import path
    HAS_DJANGO = True
except ImportError:
    HAS_DJANGO = False


# Track when the application started
_start_time = time.time()


def health_view(request: Any) -> Any:
    """
    Django view for GET /health
    
    Returns: { status, service, uptime, timestamp }
    """
    if not HAS_DJANGO:
        raise RuntimeError("health_view requires Django")
    
    from django.http import JsonResponse
    
    uptime_ms = int((time.time() - _start_time) * 1000)
    
    return JsonResponse({
        "status": "ok",
        "service": "service",
        "uptime": uptime_ms,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    })


def live_view(request: Any) -> Any:
    """
    Django view for GET /health/live (liveness probe)
    
    Returns: { alive: true }
    """
    if not HAS_DJANGO:
        raise RuntimeError("live_view requires Django")
    
    from django.http import JsonResponse
    
    return JsonResponse({
        "alive": True,
    })


def ready_view(
    request: Any,
    readiness_check: Optional[Callable[[], Union[bool, Any]]] = None,
) -> Any:
    """
    Django view for GET /health/ready (readiness probe)
    
    Returns: { ready: true } or { ready: false } with 503 status
    """
    if not HAS_DJANGO:
        raise RuntimeError("ready_view requires Django")
    
    from django.http import JsonResponse
    
    try:
        is_ready = True
        if readiness_check:
            is_ready = bool(readiness_check())
        
        return JsonResponse(
            {"ready": is_ready},
            status=200 if is_ready else 503,
        )
    except Exception as e:
        return JsonResponse(
            {
                "ready": False,
                "error": str(e),
            },
            status=503,
        )


def get_health_urls(
    service_name: str = "service",
    readiness_check: Optional[Callable[[], Union[bool, Any]]] = None,
) -> Any:
    """
    Get Django URL patterns for health check endpoints
    
    Usage in urls.py:
        from your_org_observability.health_check import get_health_urls
        
        urlpatterns = [
            # ... your other patterns
            *get_health_urls("my-api"),
        ]
    """
    if not HAS_DJANGO:
        raise RuntimeError("get_health_urls requires Django")
    
    # Create views with captured service_name and readiness_check
    def health_handler(request: Any) -> Any:
        if not HAS_DJANGO:
            raise RuntimeError("health_view requires Django")
        
        from django.http import JsonResponse
        
        uptime_ms = int((time.time() - _start_time) * 1000)
        
        return JsonResponse({
            "status": "ok",
            "service": service_name,
            "uptime": uptime_ms,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        })
    
    def ready_handler(request: Any) -> Any:
        if not HAS_DJANGO:
            raise RuntimeError("ready_view requires Django")
        
        from django.http import JsonResponse
        
        try:
            is_ready = True
            if readiness_check:
                is_ready = bool(readiness_check())
            
            return JsonResponse(
                {"ready": is_ready},
                status=200 if is_ready else 503,
            )
        except Exception as e:
            return JsonResponse(
                {
                    "ready": False,
                    "error": str(e),
                },
                status=503,
            )
    
    return [
        path("health/", health_handler, name="health"),
        path("health/live/", live_view, name="health_live"),
        path("health/ready/", ready_handler, name="health_ready"),
    ]
