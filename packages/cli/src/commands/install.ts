/**
 * @your-org/observability-cli - Install command
 */

import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { promptForInstallConfig } from '../utils/prompts';
import { withSpinner, logSuccess, logInfo, logError } from '../utils/spinner';
import { generateDockerCompose } from '../generators/docker-compose';
import { generatePrometheusConfig, generateAppAlerts, generateInfraAlerts, generateSecurityAlerts } from '../generators/prometheus';
import { generateAlertmanager } from '../generators/alertmanager';
import { generateLokiConfig } from '../generators/loki';
import { generatePromtailDocker } from '../generators/promtail';
import { generateOtelConfig } from '../generators/otel';
import { generateGrafanaDatasources, generateGrafanaDashboardProvider, generateAppDashboard, generateInfraDashboard, generateSecurityDashboard } from '../generators/grafana';

/**
 * Handle the 'install' command - scaffolds full observability infrastructure
 */
export async function handleInstall(): Promise<void> {
  console.log(chalk.bold.blue('\n🔧 Observability Infrastructure Installer\n'));
  console.log('This will scaffold the complete monitoring stack:');
  console.log('  - Grafana (dashboards)');
  console.log('  - Prometheus (metrics)');
  console.log('  - Loki (logs)');
  console.log('  - Alertmanager (alerts)');
  console.log('  - Promtail (log shipper)');
  console.log('  - Node Exporter (host metrics)');
  console.log('  - OpenTelemetry Collector (traces)\n');

  try {
    // Collect configuration
    const config = await promptForInstallConfig();

    // Create output directory
    await withSpinner('Creating output directory', async () => {
      await fs.mkdir(config.outputDir, { recursive: true });
    });

    // Generate all files
    const files = [
      { name: 'docker-compose.yml', content: generateDockerCompose(config) },
      { name: 'prometheus.yml', content: generatePrometheusConfig() },
      { name: 'app-alerts.yml', content: generateAppAlerts() },
      { name: 'infra-alerts.yml', content: generateInfraAlerts() },
      { name: 'security-alerts.yml', content: generateSecurityAlerts() },
      { name: 'alertmanager.yml', content: generateAlertmanager(config) },
      { name: 'loki-config.yml', content: generateLokiConfig() },
      { name: 'promtail-config.yml', content: generatePromtailDocker() },
      { name: 'otel-config.yml', content: generateOtelConfig(config) },
      { name: 'grafana-datasources.yml', content: generateGrafanaDatasources() },
      { name: 'grafana-dashboard-provider.yml', content: generateGrafanaDashboardProvider() },
      { name: 'grafana-app-dashboard.json', content: generateAppDashboard() },
      { name: 'grafana-infra-dashboard.json', content: generateInfraDashboard() },
      { name: 'grafana-security-dashboard.json', content: generateSecurityDashboard() },
    ];

    for (const file of files) {
      await withSpinner(`Creating ${file.name}`, async () => {
        const filePath = path.join(config.outputDir, file.name);
        await fs.writeFile(filePath, file.content, 'utf-8');
      });
    }

    // Print next steps
    console.log('\n' + chalk.bold.green('✓ Infrastructure scaffold complete!\n'));
    console.log(chalk.bold('Next steps:\n'));
    logInfo(`cd ${config.outputDir}`);
    logInfo('docker compose up -d');
    console.log('\n' + chalk.bold('Access the stack:\n'));
    logSuccess('Grafana: http://localhost:3000');
    logSuccess('Prometheus: http://localhost:9090');
    logSuccess('Loki: http://localhost:3100');
    logSuccess('Alertmanager: http://localhost:9093');
    console.log('\n' + chalk.dim(`Default Grafana credentials: admin / ${config.grafanaPassword}\n`));
  } catch (error) {
    logError(`Installation failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
