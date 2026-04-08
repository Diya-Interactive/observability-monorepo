using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace YourOrg.Observability;

/// <summary>
/// Structured JSON logger for .NET and ASP.NET Core services
/// </summary>
public class ObservabilityLogger
{
    private readonly ObservabilityConfig _config;
    private static readonly AsyncLocal<string?> RequestIdStorage = new();

    /// <summary>
    /// Initializes a new instance of the ObservabilityLogger class
    /// </summary>
    public ObservabilityLogger(ObservabilityConfig config)
    {
        _config = config ?? throw new ArgumentNullException(nameof(config));
    }

    /// <summary>
    /// Static singleton logger instance that reads from environment variables
    /// </summary>
    public static ObservabilityLogger Default { get; } = new(new ObservabilityConfig
    {
        Service = Environment.GetEnvironmentVariable("OBSERVABILITY_SERVICE") ?? "unknown-service",
        Environment = Environment.GetEnvironmentVariable("OBSERVABILITY_ENV") 
                      ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") 
                      ?? "development",
    });

    /// <summary>
    /// Set the request ID for the current context
    /// </summary>
    public static void SetRequestId(string? id)
    {
        RequestIdStorage.Value = id;
    }

    /// <summary>
    /// Get the request ID for the current context
    /// </summary>
    public static string? GetRequestId()
    {
        return RequestIdStorage.Value;
    }

    /// <summary>
    /// Set the request ID for this logger instance
    /// </summary>
    public void SetContextRequestId(string? id)
    {
        RequestIdStorage.Value = id;
    }

    /// <summary>
    /// Get the request ID for this logger instance
    /// </summary>
    public string? GetContextRequestId()
    {
        return RequestIdStorage.Value;
    }

    private void Log(LogLevel level, string msg, object? meta = null, Exception? ex = null)
    {
        var levelStr = level.ToString().ToLowerInvariant();
        var now = DateTime.UtcNow.ToString("o") + "Z";

        var entry = new LogEntry(
            level: levelStr,
            msg: msg,
            service: _config.Service,
            environment: _config.Environment,
            ts: now,
            request_id: RequestIdStorage.Value,
            user_id: null,
            duration_ms: null,
            status_code: null,
            route: null,
            error: ex?.Message ?? null,
            traceback: ex?.StackTrace ?? null
        );

        // Merge metadata if provided
        if (meta is Dictionary<string, object?> metaDict)
        {
            if (metaDict.TryGetValue("user_id", out var userId))
                entry = entry with { user_id = userId?.ToString() };
            if (metaDict.TryGetValue("duration_ms", out var duration))
                entry = entry with { duration_ms = Convert.ToInt32(duration) };
            if (metaDict.TryGetValue("status_code", out var status))
                entry = entry with { status_code = Convert.ToInt32(status) };
            if (metaDict.TryGetValue("route", out var route))
                entry = entry with { route = route?.ToString() };
            if (metaDict.TryGetValue("error", out var error))
                entry = entry with { error = error?.ToString() ?? ex?.Message };
            if (metaDict.TryGetValue("traceback", out var traceback))
                entry = entry with { traceback = traceback?.ToString() ?? ex?.StackTrace };
        }

        var options = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        };

        var json = JsonSerializer.Serialize(entry, options);

        if (level == LogLevel.Error || level == LogLevel.Critical)
        {
            Console.Error.WriteLine(json);
        }
        else
        {
            Console.Out.WriteLine(json);
        }
    }

    /// <summary>
    /// Log a debug-level message
    /// </summary>
    public void Debug(string msg, object? meta = null)
    {
        Log(LogLevel.Debug, msg, meta);
    }

    /// <summary>
    /// Log an info-level message
    /// </summary>
    public void Info(string msg, object? meta = null)
    {
        Log(LogLevel.Info, msg, meta);
    }

    /// <summary>
    /// Log a warn-level message
    /// </summary>
    public void Warn(string msg, object? meta = null)
    {
        Log(LogLevel.Warn, msg, meta);
    }

    /// <summary>
    /// Log an error-level message
    /// </summary>
    public void Error(string msg, Exception? ex = null, object? meta = null)
    {
        Log(LogLevel.Error, msg, meta, ex);
    }

    /// <summary>
    /// Log a critical-level message
    /// </summary>
    public void Critical(string msg, Exception? ex = null, object? meta = null)
    {
        Log(LogLevel.Critical, msg, meta, ex);
    }
}
