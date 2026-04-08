# Integration Examples

Complete working examples of the observability SDK integrated into real-world services across all 3 supported language stacks.

## 📋 Available Examples

### 1. Node.js/Express Service
**Location:** `./node-express-service`

A complete Express.js REST API with:
- Automatic request/response logging
- Health check endpoints
- Structured JSON output
- Error handling middleware
- Request ID propagation

**Get started:**
```bash
cd node-express-service
npm install
npm run dev
```

### 2. Python/Django Service
**Location:** `./python-django-service`

A complete Django REST API with:
- ObservabilityMiddleware for automatic request tracking
- Health check URL patterns
- Signal-based error capturing
- Per-request context isolation (threading.local)
- Structured logging

**Get started:**
```bash
cd python-django-service
pip install django your-org-observability
python manage.py runserver
```

### 3. .NET/ASP.NET Core Service
**Location:** `./dotnet-aspnet-service`

A complete ASP.NET Core REST API with:
- Minimal APIs (ASP.NET Core 8+)
- ObservabilityLoggingMiddleware
- AsyncLocal-based request context
- Health check endpoints
- Structured JSON logging

**Get started:**
```bash
cd dotnet-aspnet-service
dotnet restore
dotnet run
```

## 🔄 Comparing the Examples

All three examples expose identical endpoints and logging patterns:

| Endpoint | Purpose |
|----------|---------|
| GET /health | Full health check |
| GET /health/live | Liveness probe |
| GET /health/ready | Readiness probe |
| GET /api/users | List all users |
| GET /api/users/{id} | Get user by ID |
| POST /api/users | Create new user |
| GET /api/error | Trigger test error |

All requests generate identical structured JSON logs:

```json
{
  "level": "info",
  "msg": "Fetching users list",
  "service": "service-name",
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

## 📊 Integration Patterns

### Request Logging

Each example automatically logs:
- HTTP method and path
- Request/response duration
- Status code
- Unique request ID (X-Request-Id header)
- User ID (if available in request context)

### Error Handling

All examples include:
- Global error middleware/handler
- Structured error logging with stack traces
- Proper HTTP error responses

### Health Checks

All examples expose Kubernetes-compatible health endpoints:
- `/health` - Full status
- `/health/live` - Liveness (always 200)
- `/health/ready` - Readiness (checks dependencies)

## 🚀 Running with Docker Compose

To run all examples together with the full observability stack, from the root:

```bash
# Generate infrastructure configs
npm run -w @your-org/observability-cli build
npm run -w @your-org/observability-cli start -- install

# Build example services
cd examples/node-express-service && npm run build
cd examples/python-django-service && docker build -t example-django .
cd examples/dotnet-aspnet-service && dotnet build

# Run with Docker Compose
docker compose up -d
```

Then:
- **Node.js Service**: http://localhost:3000
- **Django Service**: http://localhost:8000
- **ASP.NET Service**: http://localhost:5000
- **Grafana**: http://localhost:3000 (admin/password)
- **Prometheus**: http://localhost:9090

## 💡 Learning Path

1. **Start with Node.js** - Easiest to understand, TypeScript types are clear
2. **Move to Python** - Similar patterns to Node but with threading.local context
3. **Then .NET** - Introduces AsyncLocal and minimal API approach

Each example has detailed comments in the code explaining the observability patterns being used.

## 🔗 Next Steps

- Add more endpoints to examples
- Integrate with distributed tracing (OpenTelemetry)
- Add authentication/authorization logging
- Create database query logging
- Build custom health checks

See parent README for full documentation.
