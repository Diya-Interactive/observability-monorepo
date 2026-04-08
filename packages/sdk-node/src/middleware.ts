/**
 * @your-org/observability - Express middleware
 */

import { RequestHandler } from 'express';
import { randomUUID } from 'crypto';
import { Logger } from './types';

/**
 * Express middleware for automatic request/response logging
 * 
 * Logs all incoming requests and outgoing responses with:
 * - Auto-generated request ID (UUID v4)
 * - Request duration
 * - HTTP method, route, and status code
 * - User ID (if available at req.user?.id or req.userId)
 * 
 * @example
 * app.use(expressLogger(logger));
 */
export function expressLogger(logger: Logger): RequestHandler {
  return (req, res, next) => {
    // Generate and store request ID
    const requestId = randomUUID();
    logger.setRequestId(requestId);

    // Attach to response headers for client visibility
    res.setHeader('X-Request-Id', requestId);

    // Record start time for duration calculation
    const startTime = Date.now();

    // Capture the original res.end to log after the response
    const originalEnd = res.end;

    (res as any).end = function (...args: any[]): any {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      const userId = (req as { user?: { id: string } | undefined }).user?.id || 
                     (req as { userId?: string }).userId ||
                     null;

      // Determine log level based on status code
      let level: 'info' | 'warn' | 'error' = 'info';
      if (statusCode >= 400 && statusCode < 500) {
        level = 'warn';
      } else if (statusCode >= 500) {
        level = 'error';
      }

      logger[level](`${req.method} ${req.path}`, {
        duration_ms: duration,
        status_code: statusCode,
        route: req.path,
        user_id: userId,
      });

      // Clear request ID for this context
      logger.setRequestId(null);

      // Call original end
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (originalEnd as any).apply(res, args);
    };

    next();
  };
}
