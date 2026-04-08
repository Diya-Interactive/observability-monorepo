/**
 * @your-org/observability - Health check endpoints
 */

import { Router, RequestHandler } from 'express';

interface HealthResponse {
  status: string;
  service: string;
  uptime: number;
  timestamp: string;
}

interface LiveResponse {
  alive: boolean;
}

interface ReadyResponse {
  ready: boolean;
}

/**
 * Create a router with health check endpoints
 * 
 * Provides:
 * - GET /health - Full health check with uptime
 * - GET /health/live - Liveness probe (always returns 200)
 * - GET /health/ready - Readiness probe (returns 200 or 503)
 * 
 * @example
 * app.use(createHealthRouter());
 */
export function createHealthRouter(
  serviceName: string = 'service',
  readinessCheck?: () => Promise<boolean> | boolean
): Router {
  const router = Router();
  const startTime = Date.now();

  /**
   * Full health check endpoint
   * Returns: { status, service, uptime, timestamp }
   */
  const healthHandler: RequestHandler = (_req, res) => {
    const uptime = Date.now() - startTime;
    const response: HealthResponse = {
      status: 'ok',
      service: serviceName,
      uptime,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  };

  /**
   * Liveness probe - always returns 200 if the process is alive
   */
  const liveHandler: RequestHandler = (_req, res) => {
    const response: LiveResponse = {
      alive: true,
    };
    res.status(200).json(response);
  };

  /**
   * Readiness probe - returns 200 if service is ready, 503 if not
   */
  const readyHandler: RequestHandler = async (_req, res) => {
    try {
      let isReady = true;

      if (readinessCheck) {
        isReady = await Promise.resolve(readinessCheck());
      }

      const response: ReadyResponse = {
        ready: isReady,
      };

      res.status(isReady ? 200 : 503).json(response);
    } catch (error) {
      res.status(503).json({
        ready: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  router.get('/health', healthHandler);
  router.get('/health/live', liveHandler);
  router.get('/health/ready', readyHandler);

  return router;
}
