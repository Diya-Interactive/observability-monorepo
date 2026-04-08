# Django Example Service

Complete example of using the observability SDK in a Django application.

## Setup

```bash
pip install django your-org-observability

# Create empty __init__.py files
touch config/__init__.py
touch api/__init__.py

python manage.py migrate --database --no-default
```

## Running

```bash
python manage.py runserver 0.0.0.0:8000
```

Server will be available at `http://localhost:8000`

## Available Endpoints

- **GET /health** - Full health check
- **GET /health/live** - Liveness probe
- **GET /health/ready** - Readiness probe
- **GET /api/users/** - List all users
- **GET /api/users/<id>/** - Get user by ID
- **POST /api/users/create/** - Create new user
- **GET /api/error/** - Trigger test error

## Example Requests

```bash
# Health check
curl http://localhost:8000/health

# List users
curl http://localhost:8000/api/users/

# Get specific user
curl http://localhost:8000/api/users/1/

# Create user
curl -X POST http://localhost:8000/api/users/create/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Charlie"}'

# Trigger error (tests error handler)
curl http://localhost:8000/api/error/
```

## Logging Output

All requests will be logged to stdout in structured JSON format:

```json
{
  "level": "info",
  "msg": "Fetching users list",
  "service": "django-example-service",
  "environment": "development",
  "ts": "2024-04-08T10:30:45.123Z",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": null,
  "duration_ms": 5,
  "status_code": 200,
  "route": "/api/users/",
  "error": null,
  "traceback": null
}
```

- **Automatic request tracking** via `ObservabilityMiddleware`
- **Per-request request_id** for end-to-end tracing
- **Duration calculation** for performance monitoring
- **Error capturing** via Django signal handlers
