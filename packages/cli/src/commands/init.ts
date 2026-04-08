/**
 * @your-org/observability-cli - Init command
 */

import { promises as fs } from 'fs';
import chalk from 'chalk';
import { logSuccess, logInfo, logError, logWarn } from '../utils/spinner';

/**
 * Handle the 'init' command - adds SDK to current service
 */
export async function handleInit(): Promise<void> {
  console.log(chalk.bold.blue('\n📦 Observability SDK Initializer\n'));
  console.log('Detecting your service type...\n');

  try {
    const cwd = process.cwd();
    const files = await fs.readdir(cwd);

    let serviceType = 'unknown';
    let installCommand = '';
    let snippet = '';

    // Detect service type
    if (files.includes('manage.py')) {
      serviceType = 'Django (Python)';
      installCommand = 'pip install your-org-observability';
      snippet = `
# settings.py
INSTALLED_APPS = [
    # ...
    'your_org_observability',
]

MIDDLEWARE = [
    # ...
    'your_org_observability.ObservabilityMiddleware',
]

# urls.py
from your_org_observability.health_check import get_health_urls
urlpatterns = [
    # ...
    *get_health_urls("my-api"),
]
`;
    } else if (files.includes('package.json')) {
      serviceType = 'Node.js (TypeScript/JavaScript)';
      installCommand = 'npm install @your-org/observability';
      snippet = `
// app.ts
import express from 'express';
import { createLogger, expressLogger, createHealthRouter } from '@your-org/observability';

const app = express();
const logger = createLogger({ service: 'my-api' });

app.use(expressLogger(logger));
app.use(createHealthRouter('my-api'));

app.get('/api/hello', (req, res) => {
  logger.info('Hello endpoint called');
  res.json({ message: 'Hello' });
});

app.listen(3000, () => logger.info('Server started'));
`;
    } else if (files.some(f => f.endsWith('.csproj'))) {
      serviceType = '.NET/C# (ASP.NET Core)';
      installCommand = 'dotnet add package YourOrg.Observability';
      snippet = `
// Program.cs
using YourOrg.Observability;

var builder = WebApplicationBuilder.CreateBuilder(args);

builder.Services.AddObservability(options =>
{
    options.Service = "my-api";
    options.Environment = builder.Environment.EnvironmentName;
});

var app = builder.Build();

app.UseObservabilityLogging();
app.MapObservabilityHealth("my-api");

app.MapGet("/api/hello", () => new { message = "Hello" });

app.Run();
`;
    }

    if (serviceType === 'unknown') {
      logWarn('Could not detect service type');
      console.log('Supported types:');
      console.log('  - Django: Detected by manage.py');
      console.log('  - Node.js: Detected by package.json');
      console.log('  - .NET: Detected by *.csproj');
      process.exit(1);
    }

    // Print detection result
    logSuccess(`Detected: ${serviceType}\n`);

    // Print install command
    console.log(chalk.bold('1. Install the SDK:\n'));
    console.log(chalk.cyan(`  $ ${installCommand}\n`));

    // Print integration snippet
    console.log(chalk.bold('2. Add to your code:\n'));
    console.log(chalk.gray(snippet));

    // Print next steps
    console.log(chalk.bold('\n3. Verify it works:\n'));
    logInfo('Start your service');
    logInfo('Verify logs appear at: http://localhost:3100 (Loki)');
    logInfo('Check health endpoint: curl http://localhost:3000/health\n');
  } catch (error) {
    logError(`Init failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
