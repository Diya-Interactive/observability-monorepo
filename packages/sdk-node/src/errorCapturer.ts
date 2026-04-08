/**
 * @your-org/observability - Global error handler setup
 */

import { ErrorRequestHandler } from 'express';
import { Logger } from './types';

/**
 * Set up global process-level error handlers
 * 
 * Catches:
 * - uncaughtException: unhandled synchronous errors → logs critical + exits
 * - unhandledRejection: unhandled promise rejections → logs error
 * 
 * @example
 * setupErrorHandlers(logger);
 */
export function setupErrorHandlers(logger: Logger): void {
  process.on('uncaughtException', (error: Error) => {
    logger.critical('Uncaught exception', {
      error: error.message,
      traceback: error.stack,
    });
    // Exit after logging to prevent undefined behavior
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logger.error('Unhandled promise rejection', {
      error: error.message,
      traceback: error.stack,
    });
  });
}

/**
 * Express error handler middleware
 * 
 * Use as the last middleware in your Express app:
 * 
 * @example
 * app.use(expressErrorHandler(logger));
 */
export function expressErrorHandler(logger: Logger): ErrorRequestHandler {
  return (err: Error, _req, res, _next) => {
    const requestId = res.getHeader('X-Request-Id') ?? 'unknown';

    logger.error('Express error handler', {
      error: err.message,
      traceback: err.stack,
      request_id: String(requestId),
    });

    // Return structured error response without stack trace
    res.status(500).json({
      error: 'Internal Server Error',
      request_id: requestId,
      timestamp: new Date().toISOString(),
    });
  };
}
