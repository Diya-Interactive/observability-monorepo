/**
 * Example Node.js/Express service with observability SDK
 */

import express, { Request, Response } from 'express';
import { createLogger, expressLogger, expressErrorHandler, createHealthRouter } from '@rafaynpmorg/observability';

// Create logger instance
const logger = createLogger({
  serviceName: 'node-example-service',
  environment: 'development',
});

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(expressLogger(logger));

// Health check routes
app.use('/health', createHealthRouter('node-example-service', async () => {
  // Readiness check - validate any dependencies here
  return true;
}));

// Example routes
app.get('/api/users', (_req: Request, res: Response) => {
  logger.info('Fetching users list', { route: '/api/users' });
  
  res.json([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ]);
});

app.get('/api/users/:id', (req: Request, res: Response) => {
  const userId = req.params.id;
  
  logger.info(`Fetching user ${userId}`, { 
    user_id: userId,
    route: `/api/users/${userId}`,
  });
  
  res.json({ id: userId, name: 'User ' + userId });
});

app.post('/api/users', (req: Request, res: Response) => {
  const { name } = req.body;
  
  if (!name) {
    logger.warn('User creation failed - missing name', { 
      route: '/api/users',
      status_code: 400,
    });
    res.status(400).json({ error: 'Name required' });
    return;
  }
  
  logger.info('User created successfully', { 
    route: '/api/users',
    status_code: 201,
  });
  
  res.status(201).json({ id: 3, name });
});

app.get('/api/error', (_req: Request, _res: Response) => {
  // Intentional error for testing error handler
  throw new Error('Intentional test error');
});

// Error handler
app.use(expressErrorHandler(logger));

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, {
    route: '*',
  });
});
