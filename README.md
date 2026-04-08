# Observability Monorepo

A complete, production-ready observability package ecosystem for Python/Django, .NET/C#, and Node.js/TypeScript backends. Includes SDKs for structured logging, metrics, and a CLI for scaffolding the full Grafana + Loki + Prometheus + Alertmanager infrastructure.

## Packages

| Package | Type | Manager | Purpose |
|---------|------|---------|---------|
| `@your-org/observability` | npm | Node.js/TS | SDK for Express and Node.js services |
| `your-org-observability` | pip | Python/Django | SDK for Django and Python services |
| `YourOrg.Observability` | NuGet | .NET/C# | SDK for ASP.NET Core services |
| `@your-org/observability-cli` | npm | CLI tool | Scaffold full observability stack |

## Quick Start

### For DevOps: Scaffold the Infrastructure

```bash
npx @your-org/observability-cli install
cd monitoring-infra
docker compose up -d
```

This creates a complete stack with:
- **Grafana** (http://localhost:3000) - Dashboards and alerting
- **Prometheus** (http://localhost:9090) - Metrics collection
- **Loki** (http://localhost:3100) - Log aggregation
- **Alertmanager** (http://localhost:9093) - Alert routing
- **Promtail** - Log shipper
- **Node Exporter** - Host metrics
- **OpenTelemetry Collector** - Trace collection

### For Developers: Add SDK to Your Service

#### Node.js/Express

```bash
npm install @your-org/observability
```

```typescript
import express from 'express';
import { createLogger, expressLogger, expressErrorHandler } from '@your-org/observability';

const app = express();
const logger = createLogger({ 
  service: 'my-api',
  environment: process.env.NODE_ENV || 'development'
});

app.use(expressLogger(logger));
app.get('/api/data', (req, res) => {
  logger.info('Fetching data');
  res.json({ data: [] });
});

app.use(expressErrorHandler(logger));
app.listen(3000, () => logger.info('Server started on port 3000'));
```

#### Django/Python

```bash
pip install your-org-observability
```

```python
# settings.py
INSTALLED_APPS = [
    # ...
    'your_org_observability',
]

MIDDLEWARE = [
    # ...
    'your_org_observability.ObservabilityMiddleware',
]

# views.py
from your_org_observability import logger

def my_view(request):
    logger.info('Handling request')
    return JsonResponse({'data': []})
```

#### ASP.NET Core

```bash
dotnet add package YourOrg.Observability
```

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddObservability(options =>
{
    options.Service = "my-api";
    options.Environment = builder.Environment.EnvironmentName;
});

var app = builder.Build();

app.UseObservabilityLogging();
app.UseExceptionHandler("/error");
app.MapObservabilityHealth();

app.MapGet("/api/data", () => new { data = new object[0] });

app.Run();
```

## Shared Log Schema

Every log line from every SDK produces the same JSON structure:

```json
{
  "level": "info",
  "msg": "user logged in",
  "service": "my-api",
  "environment": "production",
  "ts": "2026-04-08T10:30:45.123Z",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user123",
  "duration_ms": null,
  "status_code": null,
  "route": null,
  "error": null,
  "traceback": null
}
```

This ensures all logs are queryable across languages, and Grafana/Loki can parse them consistently.

## Project Structure

```
observability-monorepo/
├── packages/
│   ├── sdk-node/          # @your-org/observability (npm)
│   ├── sdk-python/        # your-org-observability (pip)
│   ├── sdk-dotnet/        # YourOrg.Observability (NuGet)
│   └── cli/               # @your-org/observability-cli (CLI)
├── package.json           # Workspace root (npm workspaces)
├── .npmrc
├── .gitignore
└── README.md
```

## Renaming from "your-org"

To use your actual organization name, replace:

```bash
find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.py" -o -name "*.cs" -o -name "*.md" \) \
  -exec sed -i 's/your-org/my-org/g' {} \; \
  -exec sed -i 's/your_org/my_org/g' {} \; \
  -exec sed -i 's/YourOrg/MyOrg/g' {} \;
```

Or manually update:
- `@your-org/*` → `@my-org/*`
- `your_org_*` → `my_org_*`
- `YourOrg.` → `MyOrg.`

## Quality Standards

- **TypeScript**: Strict mode, no `any` types
- **Python**: Type hints, mypy strict compliance
- **C#**: Nullable reference types enabled
- **Zero dependencies**: All 3 SDKs have zero runtime dependencies
- **Identical schema**: All logs use the same JSON field names
- **CLI**: Handles Ctrl+C gracefully, atomic file writes

## Monitoring Stack Architecture

```
Your Services (Node/Python/.NET)
         ↓
    Log Shipper (Promtail)
         ↓
 Log Aggregation (Loki)
         ↓
 Dashboard and Alerting (Grafana)
         ↓
Metrics Store (Prometheus)
         ↓
Alert Routing (Alertmanager) → Email/Slack/PagerDuty
```

## License

MIT - See [LICENSE](./LICENSE) file for details.
