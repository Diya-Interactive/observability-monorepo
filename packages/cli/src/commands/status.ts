/**
 * @your-org/observability-cli - Status command
 */

import chalk from 'chalk';
import { logSuccess, logError, logWarn, logInfo, withSpinner } from '../utils/spinner';

interface ServiceStatus {
  name: string;
  url: string;
  status: 'up' | 'down' | 'unknown';
  latency: number;
}

/**
 * Check if a service is running by making an HTTP request
 */
async function checkService(name: string, url: string): Promise<ServiceStatus> {
  try {
    const start = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, { 
      method: 'GET', 
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    const latency = Date.now() - start;

    if (response.ok) {
      return { name, url, status: 'up', latency };
    } else {
      return { name, url, status: 'down', latency };
    }
  } catch {
    return { name, url, status: 'down', latency: 0 };
  }
}

/**
 * Handle the 'status' command - checks observability stack health
 */
export async function handleStatus(): Promise<void> {
  console.log(chalk.bold.blue('\n📊 Observability Stack Status\n'));

  const services = [
    { name: 'Grafana', url: 'http://localhost:3000/api/health' },
    { name: 'Prometheus', url: 'http://localhost:9090/-/ready' },
    { name: 'Loki', url: 'http://localhost:3100/ready' },
    { name: 'Alertmanager', url: 'http://localhost:9093/-/ready' },
  ];

  try {
    const results = await withSpinner('Checking services...', async () => {
      const statusPromises = services.map(s => checkService(s.name, s.url));
      return Promise.all(statusPromises);
    });

    // Print status table
    console.log(chalk.bold('\nService Status:\n'));
    console.log('Name          | Status | Latency');
    console.log('──────────────┼────────┼─────────');

    results.forEach(result => {
      const statusDisplay = result.status === 'up' 
        ? chalk.green('✓ up') 
        : chalk.red('✗ down');
      const latencyDisplay = result.latency > 0 ? `${result.latency}ms` : '—';

      console.log(
        `${result.name.padEnd(13)} | ${statusDisplay} | ${latencyDisplay}`
      );
    });

    // Print summary
    const upCount = results.filter(r => r.status === 'up').length;
    const totalCount = results.length;

    console.log('\n' + chalk.bold(`Overall: ${upCount}/${totalCount} services running\n`));

    if (upCount === totalCount) {
      logSuccess('All services are healthy!');
    } else if (upCount > 0) {
      logWarn('Some services are down. Run: docker compose ps');
    } else {
      logError('Stack appears to be offline. Run: docker compose up -d');
    }

    console.log('\n' + chalk.bold('Access URLs:\n'));
    logInfo('Grafana:       http://localhost:3000');
    logInfo('Prometheus:    http://localhost:9090');
    logInfo('Loki:          http://localhost:3100');
    logInfo('Alertmanager:  http://localhost:9093\n');
  } catch (error) {
    logError(`Status check failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
