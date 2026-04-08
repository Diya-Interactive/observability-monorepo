/**
 * @your-org/observability-cli - Input validation utilities
 */

/**
 * Validate email address format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate directory path
 */
export function validateDirectory(path: string): boolean {
  // Simple validation - must be a relative or absolute path
  return path.length > 0 && !path.includes('\x00');
}

/**
 * Validate SMTP port
 */
export function validateSMTPPort(port: string): boolean {
  const portNum = parseInt(port, 10);
  return !Number.isNaN(portNum) && portNum > 0 && portNum <= 65535;
}

/**
 * Validate service name (alphanumeric, hyphens, underscores only)
 */
export function validateServiceName(name: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(name);
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
