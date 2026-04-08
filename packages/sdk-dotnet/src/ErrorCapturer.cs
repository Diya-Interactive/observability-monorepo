using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Builder;

namespace YourOrg.Observability;

/// <summary>
/// Global exception customization middleware for ASP.NET Core
/// </summary>
public class ExceptionHandlerMiddleware : IMiddleware
{
    private readonly ObservabilityLogger _logger;

    /// <summary>
    /// Initializes a new instance of the ExceptionHandlerMiddleware class
    /// </summary>
    public ExceptionHandlerMiddleware(ObservabilityLogger logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Process the request and handle exceptions
    /// </summary>
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            _logger.Critical(
                "Unhandled exception",
                ex: ex,
                meta: new Dictionary<string, object?>
                {
                    { "path", context.Request.Path.Value },
                    { "method", context.Request.Method },
                }
            );

            // Return error response
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = 500;

            var response = new
            {
                error = "Internal Server Error",
                request_id = context.Response.Headers.ContainsKey("X-Request-Id")
                    ? context.Response.Headers["X-Request-Id"].ToString()
                    : "unknown",
                timestamp = DateTime.UtcNow.ToString("o") + "Z",
            };

            await context.Response.WriteAsJsonAsync(response);
        }
    }
}

/// <summary>
/// Extension methods for adding exception handling to ASP.NET Core
/// </summary>
public static class ExceptionHandlerExtensions
{
    /// <summary>
    /// Use the observability exception handler middleware
    /// </summary>
    public static IApplicationBuilder UseObservabilityExceptionHandler(
        this IApplicationBuilder app)
    {
        return app.UseMiddleware<ExceptionHandlerMiddleware>();
    }
}
