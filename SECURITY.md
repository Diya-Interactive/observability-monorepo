# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it by emailing security@your-org.com instead of using the issue tracker. Please include:

- Description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact
- Suggested fix (if you have one)

We will acknowledge receipt within 48 hours and provide an estimated timeline for a fix.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | ✅ Yes              |
| < 1.0   | ❌ No              |

## Security Best Practices

When using this package:

1. **Keep dependencies updated** - Run `npm audit fix` regularly
2. **Use environment variables** for sensitive configuration
3. **Restrict access** to logs containing user/payment data
4. **Use HTTPS** for log transport
5. **Rotate credentials** (API tokens, SMTP passwords) periodically
6. **Monitor logs** for suspicious activity
7. **Enable authentication** on all observability endpoints (Grafana, Prometheus, etc.)

## Security Considerations

### Data in Logs

This SDK will log request information including headers and body data. Be careful not to log sensitive information like:
- Authentication tokens
- API keys
- Passwords
- Personal Identifiable Information (PII)
- Credit card numbers

### Request Context

The SDK stores request IDs in thread-local/async-local storage. This is cleaned up automatically after each request. Do not leak these to untrusted parties.

### Alerting

Review alert rules and receiver configurations to ensure sensitive alerts are not sent to untrusted channels.

## Dependency Security

We use:
- npm audit for Node.js dependencies
- pip/Snyk for Python dependencies
- NuGet audit for .NET dependencies

Regular security audits are performed via GitHub Actions.
