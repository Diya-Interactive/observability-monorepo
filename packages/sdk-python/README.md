# your-org-observability

Zero-dependency observability SDK for Python and Django. Provides structured JSON logging, automatic request/response tracking, and health check endpoints.

## Features

- **Zero dependencies** - Only uses Python standard library
- **Structured logging** - All logs are valid JSON matching a shared schema
- **Django integration** - Automatic request/response logging middleware
- **Error handling** - Django signal-based exception handler
- **Health checks** - Pre-built `/health`, `/health/live`, `/health/ready` endpoints
- **Type hints** - Full mypy strict compliance

## Installation

```bash
pip install your-org-observability
```

For Django support, optionally install Django (usually already in your project):

```bash
pip install django
```

## Quick Start

### Basic Logger

```python
from your_org_observability import logger

logger.info("Server started on port 8000")
logger.warn("Running low on memory")
logger.error("Database connection failed")
```

### With Django

Add to your `settings.py`:

```python
INSTALLED_APPS = [
    # ...
    'your_org_observability',
]

MIDDLEWARE = [
    # ...
    'your_org_observability.ObservabilityMiddleware',
]
```

In your `views.py`:

```python
from django.http import JsonResponse
from your_org_observability import logger

def get_users(request):
    logger.info("Fetching users")
    return JsonResponse({"users": []})
```

In your `urls.py`:

```python
from django.urls import path, include
from your_org_observability.health_check import get_health_urls

urlpatterns = [
    # ... your other patterns
    *get_health_urls("my-api"),
]
```

## Configuration

### Environment Variables

- `OBSERVABILITY_SERVICE` - Service name (defaults to `'unknown-service'`)
- `OBSERVABILITY_ENV` - Environment (defaults to `DJANGO_ENV` or `'development'`)

```bash
export OBSERVABILITY_SERVICE=my-api
export OBSERVABILITY_ENV=production
python manage.py runserver
```

### Custom Logger Instance

```python
from your_org_observability import ObservabilityLogger

logger = ObservabilityLogger({
    "service": "my-api",
    "environment": "production",
    "skip_routes": ["/health", "/metrics"],
})

logger.info("Custom logger initialized")
```

## Middleware

### ObservabilityMiddleware

Automatically logs all HTTP requests and responses with:
- UUID4 request ID (attached to `X-Request-Id` header)
- Request duration
- HTTP method, route, status code
- User ID (if `request.user.is_authenticated`)

Log level is determined by status code:
- 2xx → `info`
- 3xx → `info`
- 4xx → `warn`
- 5xx → `error`

## Error Handling

### Django Signal Handler

The error capturer automatically registers via Django signals when the middleware is installed.

For non-Django usage:

```python
from your_org_observability import logger, setup_error_handlers

setup_error_handlers(logger)
```

## Health Checks

### Django Views

Add health check endpoints to your `urls.py`:

```python
from your_org_observability.health_check import get_health_urls

urlpatterns = [
    # ... your other patterns
    *get_health_urls("my-api"),  # Adds /health, /health/live, /health/ready
]
```

With optional readiness check:

```python
def check_db_ready():
    # Check if database is connected
    from django.db import connection
    try:
        connection.ensure_connection()
        return True
    except Exception:
        return False

urlpatterns = [
    *get_health_urls("my-api", readiness_check=check_db_ready),
]
```

### Endpoints

- `GET /health/` - Full health check
  ```json
  { "status": "ok", "service": "my-api", "uptime": 12345, "timestamp": "2026-04-08T10:30:45.123Z" }
  ```

- `GET /health/live/` - Liveness probe (always 200)
  ```json
  { "alive": true }
  ```

- `GET /health/ready/` - Readiness probe (can be customized)
  ```json
  { "ready": true }
  ```

## Log Schema

Every log line is structured JSON with these fields:

```json
{
  "level": "info",
  "msg": "user logged in",
  "service": "my-api",
  "environment": "production",
  "ts": "2026-04-08T10:30:45.123Z",
  "request_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "user_id": "user123",
  "duration_ms": 45,
  "status_code": 200,
  "route": "/api/login/",
  "error": null,
  "traceback": null
}
```

This schema is identical across all `your-org-observability` SDKs (Node.js, Python, .NET).

## Logging API

### Methods

All logging methods accept keyword arguments that override the base schema:

```python
logger.info(
    "User login",
    user_id="user123",
    route="/api/login/",
    duration_ms=45,
)
```

### Levels

- `debug()` - Debug-level log
- `info()` - Info-level log
- `warn()` - Warning-level log
- `error()` - Error-level log
- `critical()` - Critical-level log

### Error Context

When called within an exception handler, `error()` and `critical()` automatically capture the exception:

```python
try:
    vulnerable_operation()
except Exception:
    logger.error("Operation failed")  # Automatically includes traceback
```

## Type Hints

Full mypy strict compliance:

```bash
mypy your_org_observability --strict
```

## License

MIT
