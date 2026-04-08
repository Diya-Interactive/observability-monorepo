/**
 * @your-org/observability-cli - Interactive prompt utilities
 */

import enquirer from 'enquirer';
import { validateEmail, validateDirectory, validateSMTPPort } from './validate';

export interface InstallConfig {
  outputDir: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  backendTeamEmail: string;
  devopsTeamEmail: string;
  securityTeamEmail: string;
  oncallLeadEmail: string;
  environmentName: string;
  grafanaPassword: string;
  cloudsInUse: string[];
}

export interface ServiceConfig {
  serviceName: string;
  logFilePath: string;
}

/**
 * Prompt for installation configuration
 */
export async function promptForInstallConfig(): Promise<InstallConfig> {
  const answers = await enquirer.prompt<Required<Record<string, string | string[]>>>([
    {
      type: 'input',
      name: 'outputDir',
      message: 'Output directory for monitoring infrastructure',
      initial: './monitoring-infra',
      validate: (value: string) => validateDirectory(value) ? true : 'Invalid directory path',
    },
    {
      type: 'input',
      name: 'smtpHost',
      message: 'SMTP host (for Alertmanager email notifications)',
      initial: 'smtp.gmail.com',
    },
    {
      type: 'input',
      name: 'smtpPort',
      message: 'SMTP port',
      initial: '587',
      validate: (value: string) => validateSMTPPort(value) ? true : 'Invalid SMTP port (expected 1-65535)',
    },
    {
      type: 'input',
      name: 'smtpUsername',
      message: 'SMTP username/email',
    },
    {
      type: 'input',
      name: 'smtpPassword',
      message: 'SMTP password',
    },
    {
      type: 'input',
      name: 'backendTeamEmail',
      message: 'Backend team email address',
      validate: (value: string) => validateEmail(value) ? true : 'Invalid email',
    },
    {
      type: 'input',
      name: 'devopsTeamEmail',
      message: 'DevOps team email address',
      validate: (value: string) => validateEmail(value) ? true : 'Invalid email',
    },
    {
      type: 'input',
      name: 'securityTeamEmail',
      message: 'Security team email address',
      validate: (value: string) => validateEmail(value) ? true : 'Invalid email',
    },
    {
      type: 'input',
      name: 'oncallLeadEmail',
      message: 'On-call lead email address',
      validate: (value: string) => validateEmail(value) ? true : 'Invalid email',
    },
    {
      type: 'select',
      name: 'environmentName',
      message: 'Environment name',
      choices: ['production', 'staging', 'development'],
    },
    {
      type: 'password',
      name: 'grafanaPassword',
      message: 'Grafana admin password (leave blank to auto-generate)',
      initial: '',
    },
    {
      type: 'multiselect',
      name: 'cloudsInUse',
      message: 'Which cloud platforms are in use? (select all that apply)',
      choices: ['AWS', 'Azure', 'GCP', 'Firebase', 'On-prem'],
    },
  ]);

  return {
    outputDir: answers.outputDir as string,
    smtpHost: answers.smtpHost as string,
    smtpPort: parseInt(answers.smtpPort as string, 10),
    smtpUsername: answers.smtpUsername as string,
    smtpPassword: answers.smtpPassword as string,
    backendTeamEmail: answers.backendTeamEmail as string,
    devopsTeamEmail: answers.devopsTeamEmail as string,
    securityTeamEmail: answers.securityTeamEmail as string,
    oncallLeadEmail: answers.oncallLeadEmail as string,
    environmentName: answers.environmentName as string,
    grafanaPassword: answers.grafanaPassword as string || generateRandomPassword(16),
    cloudsInUse: answers.cloudsInUse as string[],
  };
}

/**
 * Prompt for service configuration (for add-service command)
 */
export async function promptForServiceConfig(): Promise<ServiceConfig> {
  const answers = await enquirer.prompt<Required<Record<string, string>>>([
    {
      type: 'input',
      name: 'serviceName',
      message: 'Service name',
    },
    {
      type: 'input',
      name: 'logFilePath',
      message: 'Log file path or Docker container name',
    },
  ]);

  return {
    serviceName: answers.serviceName as string,
    logFilePath: answers.logFilePath as string,
  };
}

/**
 * Confirm an action before proceeding
 */
export async function promptForConfirmation(message: string): Promise<boolean> {
  const answer = await enquirer.prompt<{ confirmed: boolean }>([
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      initial: false,
    },
  ]);

  return answer.confirmed;
}

/**
 * Generate a random password
 */
function generateRandomPassword(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
