/**
 * @your-org/observability - Core logger implementation
 */

import { LogLevel, LogEntry, Logger, ObservabilityConfig } from './types';

/**
 * Create a logger instance with the given configuration
 * 
 * @example
 * const logger = createLogger({ service: 'my-api' });
 * logger.info('Server started');
 */
export function createLogger(config: ObservabilityConfig): Logger {
  const environment = config.environment || process.env.NODE_ENV || 'development';

  // Thread-local storage for request_id using Map keyed by a unique context
  const requestIdMap = new Map<string, string>();
  let currentContextId = '';

  const log = (level: LogLevel, msg: string, meta?: Partial<LogEntry>): void => {
    const entry: LogEntry = {
      level,
      msg,
      service: config.service,
      environment,
      ts: new Date().toISOString(),
      request_id: requestIdMap.get(currentContextId) || null,
      user_id: meta?.user_id ?? null,
      duration_ms: meta?.duration_ms ?? null,
      status_code: meta?.status_code ?? null,
      route: meta?.route ?? null,
      error: meta?.error ?? null,
      traceback: meta?.traceback ?? null,
    };

    // Convert Error objects to error and traceback
    if (meta !== null && typeof meta === 'object' && (meta as any) instanceof Error) {
      entry.error = (meta as any).message;
      entry.traceback = (meta as any).stack ?? null;
    } else if (meta && typeof meta === 'object' && 'error' in meta && (meta as any).error instanceof Error) {
      entry.error = (meta as any).error.message;
      entry.traceback = (meta as any).error.stack ?? null;
    }

    const jsonStr = JSON.stringify(entry);

    // error and critical go to stderr, others to stdout
    if (level === 'error' || level === 'critical') {
      console.error(jsonStr);
    } else {
      console.log(jsonStr);
    }

    // Invoke error callback if configured
    if ((level === 'error' || level === 'critical') && config.onError) {
      config.onError(entry);
    }
  };

  const logger: Logger = {
    debug: (msg: string, meta?: Partial<LogEntry>): void => log('debug', msg, meta),
    info: (msg: string, meta?: Partial<LogEntry>): void => log('info', msg, meta),
    warn: (msg: string, meta?: Partial<LogEntry>): void => log('warn', msg, meta),
    error: (msg: string, meta?: Partial<LogEntry>): void => log('error', msg, meta),
    critical: (msg: string, meta?: Partial<LogEntry>): void => log('critical', msg, meta),
    setRequestId: (id: string | null): void => {
      if (id === null) {
        requestIdMap.delete(currentContextId);
      } else {
        requestIdMap.set(currentContextId, id);
      }
    },
    getRequestId: (): string | null => requestIdMap.get(currentContextId) ?? null,
  };

  return logger;
}

/**
 * Default logger instance that reads configuration from environment variables
 * - OBSERVABILITY_SERVICE (required)
 * - OBSERVABILITY_ENV (optional, defaults to NODE_ENV)
 */
export const defaultLogger = createLogger({
  service: process.env.OBSERVABILITY_SERVICE || 'unknown-service',
  environment: process.env.OBSERVABILITY_ENV || process.env.NODE_ENV || 'development',
});
