# Node.js/Express Example Service

Complete example of using the observability SDK in a Node.js/Express application.

## Setup

```bash
npm install
npm run build
```

## Running

```bash
npm run dev
```

Server will start on `http://localhost:3000`

## Available Endpoints

- **GET /health** - Full health check
- **GET /health/live** - Liveness probe
- **GET /health/ready** - Readiness probe
- **GET /api/users** - List all users
- **GET /api/users/:id** - Get user by ID
- **POST /api/users** - Create new user
- **GET /api/error** - Trigger test error

## Example Requests

```bash
# Health check
curl http://localhost:3000/health

# List users
curl http://localhost:3000/api/users

# Get specific user
curl http://localhost:3000/api/users/1

# Create user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Charlie"}'

# Trigger error (tests error handler)
curl http://localhost:3000/api/error
```

## Logging Output

All requests will be logged to stdout in structured JSON format:

```json
{
  "level": "info",
  "msg": "GET /api/users",
  "service": "node-example-service",
  "environment": "development",
  "ts": "2024-04-08T10:30:45.123Z",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": null,
  "duration_ms": 2,
  "status_code": 200,
  "route": "/api/users",
  "error": null,
  "traceback": null
}
```

The `X-Request-Id` header will be included in responses so clients can track requests end-to-end.
