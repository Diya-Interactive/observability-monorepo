# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-04-08

### Fixed
- Added missing using directives for ASP.NET Core types in .NET SDK
- Added comprehensive debug logging to CI/CD workflows for better troubleshooting
- Fixed missing IServiceCollection, IApplicationBuilder, and HttpContext using statements

### Improved
- Enhanced workflow visibility with detailed environment and dependency logging
- Added verbose output to all build, test, and publish steps

## [1.0.0] - 2026-04-08

### Added
- Initial release of observability SDK ecosystem
- @your-org/observability package for Node.js/Express
- your-org-observability package for Python/Django  
- YourOrg.Observability package for .NET/C#/ASP.NET Core
- @your-org/observability-cli tool for infrastructure scaffolding
- Structured JSON logging schema across all SDKs
- Health check endpoints for Kubernetes/Docker
- Middleware for automatic request tracking
- Error capturing and reporting
- RequestID propagation and correlation
- Grafana dashboards (app, infrastructure, security)
- Prometheus alert rules (11 total)
- Alertmanager routing and receivers
- Loki log aggregation
- OpenTelemetry integration
- Complete integration examples for all 3 stacks
- GitHub Actions CI/CD workflows
- Comprehensive documentation

### Features
- Zero-dependency SDKs (use only language built-ins)
- Identical logging schema across all languages
- Automatic request/response logging via middleware
- Per-request context isolation (ThreadLocal, AsyncLocal, Map)
- Health check endpoints (/health, /health/live, /health/ready)
- Docker Compose stack with 7 services
- 14 auto-generated infrastructure config files
- Interactive CLI tool with validation
- Type-safe implementations (TypeScript strict, Python mypy, C# nullable)

## [1.0.0] - 2024-04-08

### Added
- First stable release
- Full observability stack for Python, Node.js, and .NET
- Production-ready implementations
- Complete documentation and examples
