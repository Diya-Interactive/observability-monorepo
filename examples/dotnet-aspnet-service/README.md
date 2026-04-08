# .NET/ASP.NET Core Example Service

Complete example of using the observability SDK in an ASP.NET Core application.

## Setup

```bash
cd examples/dotnet-aspnet-service
dotnet restore
dotnet build
```

## Running

```bash
dotnet run
```

Server will be available at `http://localhost:5000` (HTTP) and `http://localhost:5001` (HTTPS)

## Available Endpoints

- **GET /health** - Full health check
- **GET /health/live** - Liveness probe
- **GET /health/ready** - Readiness probe
- **GET /api/users** - List all users
- **GET /api/users/{id}** - Get user by ID
- **POST /api/users** - Create new user
- **GET /api/error** - Trigger test error

## Example Requests

```bash
# Health check
curl http://localhost:5000/health

# List users
curl http://localhost:5000/api/users

# Get specific user
curl http://localhost:5000/api/users/1

# Create user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Charlie"}'

# Trigger error (tests error handler)
curl http://localhost:5000/api/error
```

## Logging Output

All requests and logging will output structured JSON to the console:

```json
{
  "level": "info",
  "msg": "Fetching users list",
  "service": "example-service",
  "environment": "Production",
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

## Features

- **Automatic request tracking** via `ObservabilityLoggingMiddleware`
- **Per-request request_id** for end-to-end tracing (stored in AsyncLocal)
- **Duration calculation** using Stopwatch
- **HTTP error handling** via error handler middleware
- **Health check endpoints** for Kubernetes/Docker Compose
- **Structured JSON output** for log aggregation
