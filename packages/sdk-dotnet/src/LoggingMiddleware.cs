using System.Diagnostics;
using Microsoft.AspNetCore.Http;

namespace YourOrg.Observability;

/// <summary>
/// ASP.NET Core middleware for automatic request/response logging
/// </summary>
public class ObservabilityLoggingMiddleware : IMiddleware
{
    private readonly ObservabilityLogger _logger;

    /// <summary>
    /// Initializes a new instance of the ObservabilityLoggingMiddleware class
    /// </summary>
    public ObservabilityLoggingMiddleware(ObservabilityLogger logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Process the request and response
    /// </summary>
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        // Generate and store request ID
        var requestId = Guid.NewGuid().ToString();
        ObservabilityLogger.SetRequestId(requestId);

        // Attach to response headers
        context.Response.Headers.Add("X-Request-Id", requestId);

        // Check if route should be skipped
        var shouldSkip = false;
        if (context.Request.Path.HasValue)
        {
            var path = context.Request.Path.Value;
            shouldSkip = path.StartsWith("/health") || path == "/metrics";
        }

        var sw = Stopwatch.StartNew();

        try
        {
            await next(context);
        }
        finally
        {
            sw.Stop();

            if (!shouldSkip)
            {
                var statusCode = context.Response.StatusCode;
                var method = context.Request.Method;
                var path = context.Request.Path.Value ?? "/";
                var duration = (int)sw.ElapsedMilliseconds;

                // Get user ID if available
                string? userId = null;
                if (context.User?.FindFirst("sub") is { } subClaim)
                {
                    userId = subClaim.Value;
                }

                // Determine log level based on status code
                var logLevel = statusCode switch
                {
                    >= 500 => "error",
                    >= 400 => "warn",
                    _ => "info",
                };

                var meta = new Dictionary<string, object?>
                {
                    { "duration_ms", duration },
                    { "status_code", statusCode },
                    { "route", path },
                    { "user_id", userId },
                };

                // Log based on level
                if (logLevel == "error")
                {
                    _logger.Error($"{method} {path}", meta: meta);
                }
                else if (logLevel == "warn")
                {
                    _logger.Warn($"{method} {path}", meta: meta);
                }
                else
                {
                    _logger.Info($"{method} {path}", meta: meta);
                }
            }

            // Clear request ID
            ObservabilityLogger.SetRequestId(null);
        }
    }
}

/// <summary>
/// Extension methods for adding observability logging to ASP.NET Core
/// </summary>
public static class ObservabilityLoggingExtensions
{
    /// <summary>
    /// Add observability logging to the service collection
    /// </summary>
    public static IServiceCollection AddObservability(
        this IServiceCollection services,
        Action<ObservabilityConfig>? configure = null)
    {
        var config = new ObservabilityConfig
        {
            Service = Environment.GetEnvironmentVariable("OBSERVABILITY_SERVICE") ?? "unknown-service",
            Environment = Environment.GetEnvironmentVariable("OBSERVABILITY_ENV") ?? "development",
        };

        configure?.Invoke(config);

        services.AddSingleton(config);
        services.AddSingleton(new ObservabilityLogger(config));
        services.AddSingleton<ObservabilityLoggingMiddleware>();

        return services;
    }

    /// <summary>
    /// Use observability logging middleware in the request pipeline
    /// </summary>
    public static IApplicationBuilder UseObservabilityLogging(
        this IApplicationBuilder app)
    {
        return app.UseMiddleware<ObservabilityLoggingMiddleware>();
    }
}
