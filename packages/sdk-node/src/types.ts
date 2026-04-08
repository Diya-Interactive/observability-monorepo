/**
 * @your-org/observability - Shared type definitions
 */

/**
 * Log level enumeration
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

/**
 * Complete structured log entry schema - used consistently across all SDKs
 */
export interface LogEntry {
  /** Log level */
  level: LogLevel;

  /** Human-readable log message */
  msg: string;

  /** Name of the microservice emitting this log */
  service: string;

  /** Environment (production, staging, development, etc.) */
  environment: string;

  /** ISO8601 UTC timestamp */
  ts: string;

  /** Request ID for tracing across services (UUID v4) */
  request_id: string | null;

  /** Application user ID if available */
  user_id: string | null;

  /** Response duration in milliseconds (response logs only) */
  duration_ms: number | null;

  /** HTTP status code (response logs only) */
  status_code: number | null;

  /** HTTP route/path (response logs only) */
  route: string | null;

  /** Error message if this is an error log */
  error: string | null;

  /** Full stack trace if this is an error log */
  traceback: string | null;
}

/**
 * Configuration for ObservabilityLogger
 */
export interface ObservabilityConfig {
  /** Required: name of your microservice */
  service: string;

  /** Environment name; defaults to process.env.NODE_ENV */
  environment?: string;

  /** Routes to skip logging for (default: ['/health', '/metrics']) */
  skipRoutes?: string[];

  /** Optional callback invoked when an error is logged */
  onError?: (entry: LogEntry) => void;
}

/**
 * Logger instance interface
 */
export interface Logger {
  /**
   * Log a debug-level message
   */
  debug(msg: string, meta?: Partial<LogEntry>): void;

  /**
   * Log an info-level message
   */
  info(msg: string, meta?: Partial<LogEntry>): void;

  /**
   * Log a warn-level message
   */
  warn(msg: string, meta?: Partial<LogEntry>): void;

  /**
   * Log an error-level message
   */
  error(msg: string, meta?: Partial<LogEntry>): void;

  /**
   * Log a critical-level message
   */
  critical(msg: string, meta?: Partial<LogEntry>): void;

  /**
   * Set the request ID for current context
   */
  setRequestId(id: string | null): void;

  /**
   * Get the current request ID
   */
  getRequestId(): string | null;
}
