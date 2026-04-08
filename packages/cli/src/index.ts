#!/usr/bin/env node

/**
 * @your-org/observability-cli - Main entry point
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { handleInstall } from './commands/install';
import { handleInit } from './commands/init';
import { handleAddService } from './commands/add-service';
import { handleStatus } from './commands/status';

const VERSION = '1.0.0';

const program = new Command();

program
  .name('observability')
  .description('Observability infrastructure scaffolder and SDK initializer')
  .version(VERSION, '-v, --version', 'output the current version');

/**
 * 'install' command - Full infrastructure setup
 */
program
  .command('install')
  .description('Scaffold the complete observability infrastructure stack')
  .action(async () => {
    try {
      await handleInstall();
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

/**
 * 'init' command - Add SDK to current service
 */
program
  .command('init')
  .description('Initialize observability SDK in your service')
  .action(async () => {
    try {
      await handleInit();
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

/**
 * 'add-service' command - Register a new service
 */
program
  .command('add-service')
  .description('Add a new service to the monitoring stack')
  .action(async () => {
    try {
      await handleAddService();
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

/**
 * 'status' command - Check stack health
 */
program
  .command('status')
  .description('Check the health of the observability stack')
  .action(async () => {
    try {
      await handleStatus();
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Print help on missing command
program
  .addHelpCommand(false)
  .help();

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
