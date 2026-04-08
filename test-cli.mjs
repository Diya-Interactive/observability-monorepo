#!/usr/bin/env node

/**
 * CLI Test Script - Simulates the install command
 */

import { promises as fs } from 'fs';
import path from 'path';
import { generateDockerCompose } from './packages/cli/dist/generators/docker-compose.js';
import { generatePrometheusConfig, generateAppAlerts, generateInfraAlerts, generateSecurityAlerts } from './packages/cli/dist/generators/prometheus.js';
import { generateAlertmanager } from './packages/cli/dist/generators/alertmanager.js';
import { generateLokiConfig } from './packages/cli/dist/generators/loki.js';
import { generatePromtailDocker } from './packages/cli/dist/generators/promtail.js';
import { generateOtelConfig } from './packages/cli/dist/generators/otel.js';
import { generateGrafanaDatasources, generateGrafanaDashboardProvider, generateAppDashboard, generateInfraDashboard, generateSecurityDashboard } from './packages/cli/dist/generators/grafana.js';

async function testCLI() {
  const testDir = '/tmp/observability-cli-test';
  await fs.mkdir(testDir, { recursive: true });

  console.log('\n📋 Testing Observability CLI Generator Functions\n');
  console.log(`Test directory: ${testDir}\n`);

  const config = {
    outputDir: testDir,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: 'admin@company.com',
    smtpPassword: 'password123',
    backendTeamEmail: 'backend@company.com',
    devopsTeamEmail: 'devops@company.com',
    securityTeamEmail: 'security@company.com',
    oncallLeadEmail: 'oncall@company.com',
    environmentName: 'production',
    grafanaPassword: 'admin123456!!',
    cloudsInUse: ['AWS', 'Azure'],
  };

  try {
    // Test each generator
    const generators = [
      { name: 'docker-compose.yml', gen: () => generateDockerCompose(config) },
      { name: 'prometheus.yml', gen: () => generatePrometheusConfig() },
      { name: 'app-alerts.yml', gen: () => generateAppAlerts() },
      { name: 'infra-alerts.yml', gen: () => generateInfraAlerts() },
      { name: 'security-alerts.yml', gen: () => generateSecurityAlerts() },
      { name: 'alertmanager.yml', gen: () => generateAlertmanager(config) },
      { name: 'loki-config.yml', gen: () => generateLokiConfig() },
      { name: 'promtail-config.yml', gen: () => generatePromtailDocker() },
      { name: 'otel-config.yml', gen: () => generateOtelConfig(config) },
      { name: 'grafana-datasources.yml', gen: () => generateGrafanaDatasources() },
      { name: 'grafana-dashboard-provider.yml', gen: () => generateGrafanaDashboardProvider() },
      { name: 'grafana-app-dashboard.json', gen: () => generateAppDashboard() },
      { name: 'grafana-infra-dashboard.json', gen: () => generateInfraDashboard() },
      { name: 'grafana-security-dashboard.json', gen: () => generateSecurityDashboard() },
    ];

    let successCount = 0;
    for (const { name, gen } of generators) {
      try {
        const content = gen();
        const filePath = path.join(testDir, name);
        await fs.writeFile(filePath, content);
        console.log(`✅ Generated ${name} (${content.length} bytes)`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to generate ${name}:`, error);
      }
    }

    console.log(`\n📊 Summary: ${successCount}/${generators.length} configs generated successfully\n`);

    // List generated files
    const files = await fs.readdir(testDir);
    console.log('Generated files:');
    for (const file of files) {
      const stat = await fs.stat(path.join(testDir, file));
      console.log(`  - ${file} (${stat.size} bytes)`);
    }

    console.log('\n✨ CLI test completed successfully!\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testCLI();
