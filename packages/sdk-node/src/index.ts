/**
 * @your-org/observability - Main entry point
 */

// Type exports
export type { LogLevel, LogEntry, Logger, ObservabilityConfig } from './types';

// Logger exports
export { createLogger, defaultLogger } from './logger';

// Middleware exports
export { expressLogger } from './middleware';

// Error handler exports
export { setupErrorHandlers, expressErrorHandler } from './errorCapturer';

// Health check exports
export { createHealthRouter } from './healthCheck';

/**
 * Package version - read from package.json
 */
export const VERSION = '1.0.0';
