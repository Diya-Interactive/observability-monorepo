namespace YourOrg.Observability;

/// <summary>
/// Log level enumeration
/// </summary>
public enum LogLevel
{
    Debug,
    Info,
    Warn,
    Error,
    Critical,
}

/// <summary>
/// Complete structured log entry schema - used consistently across all SDKs
/// </summary>
public record LogEntry(
    string level,
    string msg,
    string service,
    string environment,
    string ts,
    string? request_id,
    string? user_id,
    int? duration_ms,
    int? status_code,
    string? route,
    string? error,
    string? traceback
);

/// <summary>
/// Configuration for ObservabilityLogger
/// </summary>
public record ObservabilityConfig
{
    /// <summary>
    /// Required: name of your microservice
    /// </summary>
    public required string Service { get; init; }

    /// <summary>
    /// Environment name; defaults to EnvironmentName
    /// </summary>
    public string Environment { get; init; } = "development";

    /// <summary>
    /// Routes to skip logging for (default: ['/health', '/metrics'])
    /// </summary>
    public string[] SkipRoutes { get; init; } = ["/health", "/metrics"];
}
