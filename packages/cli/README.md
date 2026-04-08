# @your-org/observability-cli

Observability infrastructure scaffolder and SDK initializer. Quickly deploy a complete monitoring stack (Grafana, Prometheus, Loki, Alertmanager, etc.) and integrate SDKs into your services.

## Features

- **Infrastructure scaffolding** - Generate complete `docker-compose.yml` and all configs
- **SDKless initialization** - Detect your service type and print exact integration steps
- **Service registration** - Add new services to Promtail for log collection
- **Stack health check** - Verify all components are running

## Installation

```bash
npm install -g @your-org/observability-cli
```

Or use without installing:

```bash
npx @your-org/observability-cli --help
```

## Commands

### `observability install`

Scaffold the complete observability infrastructure stack.

```bash
observability install
```

Prompts for:
- Output directory
- SMTP configuration (for email alerts)
- Team email addresses (backend, DevOps, security, on-call)
- Environment name
- Grafana admin password
- Cloud platforms in use

Generates:
- `docker-compose.yml` - Full stack with 7 services
- `prometheus.yml` - Metrics scrape config
- `alertmanager.yml` - Alert routing rules
- `loki-config.yml` - Log aggregation
- `promtail-config.yml` - Log collection
- `otel-config.yml` - Trace collection
- `grafana-datasources.yml` - Data sources
- `grafana-*-dashboard.json` - Pre-built dashboards (app, infra, security)

After installation:

```bash
cd monitoring-infra
docker compose up -d
```

Access services:
- **Grafana**: http://localhost:3000 (admin / {password})
- **Prometheus**: http://localhost:9090
- **Loki**: http://localhost:3100
- **Alertmanager**: http://localhost:9093

### `observability init`

Detect your service type and print SDK integration steps.

```bash
cd my-api-service
observability init
```

Detects:
- **Django** (by `manage.py`) → Install `your-org-observability` via pip
- **Node.js** (by `package.json`) → Install `@your-org/observability` via npm
- **.NET** (by `*.csproj`) → Install `YourOrg.Observability` via NuGet

Prints:
1. Installation command
2. Ready-to-paste code snippet
3. Verification steps

### `observability add-service`

Register a new service for log collection.

```bash
observability add-service
```

Prompts for:
- Service name
- Log file path or Docker container name

Adds a new scrape job to `promtail-config.yml` and restarts Promtail.

### `observability status`

Check the health of all observability stack components.

```bash
observability status
```

Output:
```
Service Status:

Name          | Status | Latency
──────────────┼────────┼─────────
Grafana       | ✓ up   | 45ms
Prometheus    | ✓ up   | 32ms
Loki          | ✓ up   | 28ms
Alertmanager  | ✓ up   | 19ms

Overall: 4/4 services running
```

## Architecture

```
┌─────────────────────────────────────────────┐
│   Your Services                             │
│   (Node.js, Python, .NET)                   │
│   w/ Observability SDKs                     │
└──────────┬──────────────────────────────────┘
           │ (JSON logs, metrics, traces)
           ↓
┌──────────────────────────────────────────────┐
│  Promtail & OpenTelemetry Collector         │
│  (Shipper)                                   │
└─────┬──────────────────────────────────────+─┘
      │                                      │
      ↓ (logs)                               ↓ (traces)
  ┌─────────┐                         ┌──────────────┐
  │  Loki   │                         │ Prometheus   │
  │ (3100)  │                         │ (9090)       │
  └────┬────┘                         └──────┬───────┘
       │                                     │
       │                ┌────────────────────┘
       │                │
       └────────┬───────┴────────────────────┐
                │                            │
        ┌───────┴──────┐          ┌──────────┴──────┐
        │  Grafana     │          │  Alertmanager   │
        │  (3000)      │          │  (9093)         │
        │ Dashboards   │          │ Email/Slack/...│
        └──────────────┘          └─────────────────┘
```

## Configuration Files

### docker-compose.yml

Defines 7 services:
- **loki** - Log aggregation
- **promtail** - Log shipper
- **prometheus** - Metrics store
- **node-exporter** - Host metrics
- **otel-collector** - Trace collection
- **alertmanager** - Alert routing
- **grafana** - Dashboards and alerting UI

### Alert Rules

**app-alerts.yml**
- HighErrorRate
- SlowAPIResponse
- ServiceDown
- HighRequestVolume

**infra-alerts.yml**
- HighCPU
- HighMemory
- DiskAlmostFull
- HostDown

**security-alerts.yml**
- AuthFailureSpike
- SuspiciousIP
- JWTAnomalies

### Alert Routing

Routes configured by severity and job type:

- **Critical + app** → Backend team + on-call
- **Warning + app** → Backend team
- **Critical + infra** → DevOps + on-call
- **Infra** → DevOps team
- **Critical + security** → Security + on-call
- **Security** → Security team

Inhibit rules prevent notification storms (e.g., HostDown suppresses all other alerts from that host).

## Environment Variables

For the CLI tool:
- `OBSERVABILITY_SERVICE` - Set service name (default: auto-detect)
- `OBSERVABILITY_ENV` - Set environment (default: ASPNETCORE_ENVIRONMENT or NODE_ENV)

## Development

```bash
npm install
npm run build
npm run dev -- install
```

## License

MIT
