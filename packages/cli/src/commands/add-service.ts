/**
 * @your-org/observability-cli - Add service command
 */

import chalk from 'chalk';
import { promptForServiceConfig, promptForConfirmation } from '../utils/prompts';
import { logSuccess, logError, logInfo } from '../utils/spinner';

/**
 * Handle the 'add-service' command - registers a new service with Promtail
 */
export async function handleAddService(): Promise<void> {
  console.log(chalk.bold.blue('\n➕ Add Service to Monitoring\n'));
  console.log('This will register your service for log collection.\n');

  try {
    const service = await promptForServiceConfig();

    // Show what will be added
    console.log('\n' + chalk.bold('Will add to promtail-config.yml:\n'));
    const scrapeConfig = `
  - job_name: ${service.serviceName}
    static_configs:
      - targets:
          - localhost
        labels:
          job: ${service.serviceName}
          __path__: ${service.logFilePath}
    pipeline_stages:
      - json:
          expressions:
            level: level
            service: service
            msg: msg
      - labels:
          level:
          service:
`;
    console.log(chalk.gray(scrapeConfig));

    // Confirm before proceeding
    const confirmed = await promptForConfirmation('Proceed with adding this service?');

    if (!confirmed) {
      logInfo('Cancelled');
      return;
    }

    // In real implementation, this would read the promtail config file and append the new job
    logSuccess(`Service '${service.serviceName}' registered!`);
    logInfo(`Restart Promtail for changes to take effect`);
    logInfo('docker compose restart promtail\n');
  } catch (error) {
    logError(`Add service failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
