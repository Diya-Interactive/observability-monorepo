# YourOrg.Observability

Zero-dependency observability SDK for .NET and ASP.NET Core. Provides structured JSON logging, automatic request/response tracking, and health check endpoints.

## Features

- **Zero dependencies** - Only uses .NET standard library and ASP.NET Core framework reference
- **Structured logging** - All logs are valid JSON matching a shared schema
- **ASP.NET Core integration** - Automatic request/response logging middleware
- **Error handling** - Global exception handler middleware
- **Health checks** - Pre-built `/health`, `/health/live`, `/health/ready` endpoints
- **Nullable reference types** - Full null safety with C# 11

## Installation

```bash
dotnet add package YourOrg.Observability
```

## Quick Start

### Basic Logger

```csharp
var logger = new ObservabilityLogger(new ObservabilityConfig
{
    Service = "my-api",
    Environment = "production",
});

logger.Info("Server started on port 5000");
logger.Warn("Running low on memory");
logger.Error("Database connection failed");
```

### With ASP.NET Core

In your `Program.cs`:

```csharp
using YourOrg.Observability;

var builder = WebApplicationBuilder.CreateBuilder(args);

// Add observability logging
builder.Services.AddObservability(options =>
{
    options.Service = "my-api";
    options.Environment = builder.Environment.EnvironmentName;
});

var app = builder.Build();

// Use observability middleware
app.UseObservabilityLogging();
app.UseObservabilityExceptionHandler();

// Map health check endpoints
app.MapObservabilityHealth("my-api");

// Your endpoints
app.MapGet("/api/users", () => new { users = new object[0] });

app.Run();
```

With optional readiness check:

```csharp
async Task<bool> CheckDatabaseReady()
{
    // Check if database connection is working
    // Example: var result = await dbContext.Database.CanConnectAsync();
    return true;
}

app.MapObservabilityHealth("my-api", readinessCheck: CheckDatabaseReady);
```

## Configuration

### Environment Variables

- `OBSERVABILITY_SERVICE` - Service name (defaults to `'unknown-service'`)
- `OBSERVABILITY_ENV` - Environment (defaults to `ASPNETCORE_ENVIRONMENT`)

```bash
export OBSERVABILITY_SERVICE=my-api
export OBSERVABILITY_ENV=production
dotnet run
```

### Inline Configuration

```csharp
builder.Services.AddObservability(options =>
{
    options.Service = "my-api";
    options.Environment = "production";
    options.SkipRoutes = ["/health", "/metrics"];
});
```

## Middleware

### ObservabilityLoggingMiddleware

Automatically logs all HTTP requests and responses with:
- Guid request ID (attached to `X-Request-Id` header)
- Request duration in milliseconds
- HTTP method, route, status code
- User ID (if available in JWT `sub` claim)

Log level is determined by status code:
- 2xx → `info`
- 3xx → `info`
- 4xx → `warn`
- 5xx → `error`

### ExceptionHandlerMiddleware

Catches unhandled exceptions in the request pipeline and logs them with full stack trace. Returns a structured error response without exposing sensitive details.

## Error Handling

Exceptions are automatically captured and logged:

```csharp
try
{
    throw new InvalidOperationException("Something went wrong");
}
catch (Exception ex)
{
    logger.Error("Operation failed", ex: ex);
}
```

## Health Checks

### ASP.NET Core Endpoints

Register health check endpoints in `Program.cs`:

```csharp
app.MapObservabilityHealth("my-api");
```

Provides three endpoints:

- `GET /health` - Full health check
  ```json
  { "status": "ok", "service": "my-api", "uptime": 12345, "timestamp": "2026-04-08T10:30:45.000Z" }
  ```

- `GET /health/live` - Liveness probe (always 200)
  ```json
  { "alive": true }
  ```

- `GET /health/ready` - Readiness probe (can be customized)
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
  "ts": "2026-04-08T10:30:45.000Z",
  "requestId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "userId": "user123",
  "durationMs": 45,
  "statusCode": 200,
  "route": "/api/login",
  "error": null,
  "traceback": null
}
```

This schema is identical across all `YourOrg.Observability` SDKs (Node.js, Python, .NET).

## Logging API

### Methods

All logging methods accept optional metadata:

```csharp
logger.Info("User login", meta: new Dictionary<string, object?>
{
    { "user_id", "user123" },
    { "duration_ms", 45 },
});

logger.Error("Database error", ex: dbException, meta: new Dictionary<string, object?>
{
    { "operation", "SELECT" },
});
```

### Levels

- `Debug()` - Debug-level log
- `Info()` - Info-level log
- `Warn()` - Warning-level log
- `Error()` - Error-level log
- `Critical()` - Critical-level log

### Static Methods

For global access without dependency injection:

```csharp
ObservabilityLogger.SetRequestId("request-123");
var requestId = ObservabilityLogger.GetRequestId();
ObservabilityLogger.Default.Info("Message");
```

## Nullable Reference Types

Full C# nullable reference types support:

```csharp
public void ProcessMessage(string message, string? optionalId = null)
{
    logger.Info("Processing", meta: new Dictionary<string, object?>
    {
        { "message", message },  // Required
        { "optional_id", optionalId },  // Nullable
    });
}
```

## License

MIT
