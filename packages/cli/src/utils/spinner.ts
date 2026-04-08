/**
 * @your-org/observability-cli - CLI spinner wrapper
 */

import ora, { Ora } from 'ora';
import chalk from 'chalk';

/**
 * Create a spinner with consistent success/failure formatting
 */
export function createSpinner(text: string): Ora {
  return ora({
    text,
    prefixText: '',
  });
}

/**
 * Run a task with a spinner
 */
export async function withSpinner<T>(
  text: string,
  task: () => Promise<T>,
): Promise<T> {
  const spinner = createSpinner(text);
  spinner.start();

  try {
    const result = await task();
    spinner.succeed(chalk.green(text));
    return result;
  } catch (error) {
    spinner.fail(chalk.red(`${text} - ${error instanceof Error ? error.message : 'Unknown error'}`));
    throw error;
  }
}

/**
 * Log a success message
 */
export function logSuccess(message: string): void {
  console.log(chalk.green(`✓ ${message}`));
}

/**
 * Log an error message
 */
export function logError(message: string): void {
  console.log(chalk.red(`✗ ${message}`));
}

/**
 * Log an info message
 */
export function logInfo(message: string): void {
  console.log(chalk.blue(`ℹ ${message}`));
}

/**
 * Log a warning message
 */
export function logWarn(message: string): void {
  console.log(chalk.yellow(`⚠ ${message}`));
}
