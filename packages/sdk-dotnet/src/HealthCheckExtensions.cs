namespace YourOrg.Observability;

/// <summary>
/// Health check response models
/// </summary>
public record HealthResponse(
    string status,
    string service,
    long uptime,
    string timestamp
);

public record LiveResponse(
    bool alive
);

public record ReadyResponse(
    bool ready
);

/// <summary>
/// Extension methods for adding health check endpoints to ASP.NET Core
/// </summary>
public static class HealthCheckExtensions
{
    private static readonly long StartTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    /// <summary>
    /// Map observability health check endpoints to the route builder
    /// 
    /// Provides:
    /// - GET /health - Full health check with uptime
    /// - GET /health/live - Liveness probe (always returns 200)
    /// - GET /health/ready - Readiness probe (returns 200 or 503)
    /// </summary>
    public static IEndpointRouteBuilder MapObservabilityHealth(
        this IEndpointRouteBuilder app,
        string serviceName = "service",
        Func<Task<bool>>? readinessCheck = null)
    {
        app.MapGet("/health", HealthHandler(serviceName))
            .WithName("health")
            .WithOpenApi()
            .Produces<HealthResponse>(200);

        app.MapGet("/health/live", LiveHandler())
            .WithName("health_live")
            .WithOpenApi()
            .Produces<LiveResponse>(200);

        app.MapGet("/health/ready", ReadyHandler(readinessCheck))
            .WithName("health_ready")
            .WithOpenApi()
            .Produces<ReadyResponse>(200)
            .Produces<ReadyResponse>(503);

        return app;
    }

    private static Func<HttpContext, Task> HealthHandler(string serviceName)
    {
        return async context =>
        {
            var uptime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - StartTime;
            var response = new HealthResponse(
                status: "ok",
                service: serviceName,
                uptime: uptime,
                timestamp: DateTime.UtcNow.ToString("o") + "Z"
            );

            await context.Response.WriteAsJsonAsync(response);
        };
    }

    private static Func<HttpContext, Task> LiveHandler()
    {
        return async context =>
        {
            var response = new LiveResponse(alive: true);
            await context.Response.WriteAsJsonAsync(response);
        };
    }

    private static Func<HttpContext, Task> ReadyHandler(Func<Task<bool>>? readinessCheck)
    {
        return async context =>
        {
            try
            {
                var isReady = true;

                if (readinessCheck != null)
                {
                    isReady = await readinessCheck();
                }

                var statusCode = isReady ? 200 : 503;
                var response = new ReadyResponse(ready: isReady);

                context.Response.StatusCode = statusCode;
                await context.Response.WriteAsJsonAsync(response);
            }
            catch (Exception ex)
            {
                context.Response.StatusCode = 503;
                var response = new { ready = false, error = ex.Message };
                await context.Response.WriteAsJsonAsync(response);
            }
        };
    }
}
