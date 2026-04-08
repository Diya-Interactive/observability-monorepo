# @rafaynpmorg/observability

Zero-dependency observability SDK for Node.js and Express. Provides structured JSON logging, automatic request/response tracking, and health check endpoints.

## Features

- **Zero dependencies** - Only uses Node.js built-ins
- **Structured logging** - All logs are valid JSON matching a shared schema
- **Express integration** - Automatic request/response logging middleware
- **Error handling** - Global and Express error capturer middleware
- **Health checks** - Pre-built `/health`, `/health/live`, `/health/ready` endpoints
- **Strict TypeScript** - Full type safety with `strict: true`

## Installation

```bash
npm install @rafaynpmorg/observability
```

If you're using Express, install it separately:

```bash
npm install express
```

## Quick Start

### Basic Logger

```typescript
import { createLogger } from '@rafaynpmorg/observability';

const logger = createLogger({
  service: 'my-api',
  environment: 'production'
});

logger.info('Server started on port 3000');
logger.warn('Running low on memory');
logger.error('Database connection failed');
```

### With Express

```typescript
import express from 'express';
import {
  createLogger,
  expressLogger,
  expressErrorHandler,
  createHealthRouter
} from '@rafaynpmorg/observability';

const app = express();
const logger = createLogger({
  service: 'my-api',
  environment: process.env.NODE_ENV || 'development'
});

// Automatic request/response logging
app.use(expressLogger(logger));

// Your routes
app.get('/api/users', (req, res) => {
  logger.info('Fetching users');
  res.json({ users: [] });
});

// Health check endpoints
app.use(createHealthRouter('my-api'));

// Error handling
app.use(expressErrorHandler(logger));

// Graceful error handler
import { setupErrorHandlers } from '@rafaynpmorg/observability';
setupErrorHandlers(logger);

app.listen(3000, () => {
  logger.info('Server started', { port: 3000 });
});
```

## Configuration

### ObservabilityConfig

```typescript
interface ObservabilityConfig {
  service: string;              // Required: service name
  environment?: string;          // Defaults to NODE_ENV
  skipRoutes?: string[];         // Routes to skip logging (default: ['/health', '/metrics'])
  onError?: (entry) => void;     // Optional callback for errors
}
```

## Middleware

### expressLogger

Automatically logs all HTTP requests and responses with:
- UUID v4 request ID (attached to `X-Request-Id` header)
- Request duration
- HTTP method, route, status code
- User ID (from `req.user?.id` or `req.userId`)

Log level is determined by status code:
- 2xx → `info`
- 3xx → `info`
- 4xx → `warn`
- 5xx → `error`

### expresserrorHandler

Catches unhandled errors in Express and logs them. Returns a structured error response without exposing stack traces to clients.

## Error Handling

### setupErrorHandlers

Installs listeners for:
- `uncaughtException` - Logs critical and exits process
- `unhandledRejection` - Logs error and continues

```typescript
setupErrorHandlers(logger);
```

## Health Checks

### createHealthRouter

Provides three endpoints:

- `GET /health` - Full health check
  ```json
  { "status": "ok", "service": "my-api", "uptime": 12345, "timestamp": "2026-04-08T10:30:45Z" }
  ```

- `GET /health/live` - Liveness probe (always 200)
  ```json
  { "alive": true }
  ```

- `GET /health/ready` - Readiness probe (can be customized)
  ```json
  { "ready": true }
  ```

With optional readiness check:

```typescript
const readinessCheck = async () => {
  // Check if database is connected, etc.
  return true;
};

app.use(createHealthRouter('my-api', readinessCheck));
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
  "route": "/api/login",
  "error": null,
  "traceback": null
}
```

This schema is identical across all `@your-org/observability` SDKs (Node.js, Python, .NET).

## Environment Variables

The default logger reads from:

- `OBSERVABILITY_SERVICE` - Service name (defaults to `'unknown-service'`)
- `OBSERVABILITY_ENV` - Environment (defaults to `NODE_ENV`)

```bash
export OBSERVABILITY_SERVICE=my-api
export OBSERVABILITY_ENV=production
node app.js
```

## License

MIT
