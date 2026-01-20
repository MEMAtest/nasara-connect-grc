/**
 * Centralized Logging System for Nasara Connect
 *
 * Uses Pino for high-performance, structured logging.
 * - Development: Pretty-printed, colorized output
 * - Production: JSON format for log aggregation services
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info({ userId, action }, 'User performed action');
 *   logger.error({ err, requestId }, 'Failed to process request');
 */

import pino from 'pino';

// Determine if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Log levels: trace, debug, info, warn, error, fatal
const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Create the base logger configuration
const baseConfig: pino.LoggerOptions = {
  level,
  base: {
    env: process.env.NODE_ENV,
    app: 'nasaraconnect',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      pid: bindings.pid,
      host: bindings.hostname,
      app: bindings.app,
      env: bindings.env,
    }),
  },
  // Redact sensitive fields from logs
  redact: {
    paths: [
      'password',
      'token',
      'apiKey',
      'secret',
      'authorization',
      'cookie',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: '[REDACTED]',
  },
};

// Browser-safe logger (no-op or console fallback)
const browserLogger = {
  trace: (...args: unknown[]) => console.debug('[TRACE]', ...args),
  debug: (...args: unknown[]) => console.debug('[DEBUG]', ...args),
  info: (...args: unknown[]) => console.info('[INFO]', ...args),
  warn: (...args: unknown[]) => console.warn('[WARN]', ...args),
  error: (...args: unknown[]) => console.error('[ERROR]', ...args),
  fatal: (...args: unknown[]) => console.error('[FATAL]', ...args),
  child: () => browserLogger,
} as unknown as pino.Logger;

// Server-side logger with proper configuration
function createServerLogger(): pino.Logger {
  // Use simple pino without transport to avoid thread-stream issues in Next.js
  // The pino-pretty transport causes worker thread errors in Turbopack
  return pino(baseConfig);
}

// Export the appropriate logger based on environment
export const logger: pino.Logger = isBrowser ? browserLogger : createServerLogger();

/**
 * Create a child logger with additional context
 * Useful for adding request-specific data
 *
 * @example
 * const reqLogger = createChildLogger({ requestId, userId });
 * reqLogger.info('Processing request');
 */
export function createChildLogger(context: Record<string, unknown>): pino.Logger {
  return logger.child(context);
}

/**
 * Create a logger for a specific module/component
 *
 * @example
 * const dbLogger = createModuleLogger('database');
 * dbLogger.info('Connection established');
 */
export function createModuleLogger(module: string): pino.Logger {
  return logger.child({ module });
}

/**
 * Log an API request with standard fields
 */
export function logApiRequest(
  method: string,
  path: string,
  context?: Record<string, unknown>
): void {
  logger.info({ method, path, ...context }, `API ${method} ${path}`);
}

/**
 * Log an API response with timing
 */
export function logApiResponse(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  context?: Record<string, unknown>
): void {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  logger[level](
    { method, path, statusCode, durationMs, ...context },
    `API ${method} ${path} - ${statusCode} (${durationMs}ms)`
  );
}

/**
 * Log an error with full context
 */
export function logError(
  err: Error | unknown,
  message: string,
  context?: Record<string, unknown>
): void {
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error(
    {
      err: {
        message: error.message,
        name: error.name,
        stack: error.stack,
      },
      ...context,
    },
    message
  );
}

/**
 * Log a database operation
 */
export function logDbOperation(
  operation: 'query' | 'insert' | 'update' | 'delete',
  table: string,
  durationMs?: number,
  context?: Record<string, unknown>
): void {
  logger.debug(
    { operation, table, durationMs, ...context },
    `DB ${operation.toUpperCase()} on ${table}${durationMs ? ` (${durationMs}ms)` : ''}`
  );
}

/**
 * Log an authentication event
 */
export function logAuthEvent(
  event: 'login' | 'logout' | 'register' | 'password_reset' | 'session_expired',
  userId?: string,
  context?: Record<string, unknown>
): void {
  logger.info({ event, userId, ...context }, `Auth: ${event}`);
}

/**
 * Log a compliance-related event (for audit trail)
 */
export function logComplianceEvent(
  event: string,
  userId: string,
  context: Record<string, unknown>
): void {
  logger.info(
    {
      complianceEvent: true,
      event,
      userId,
      timestamp: new Date().toISOString(),
      ...context,
    },
    `Compliance: ${event}`
  );
}

export default logger;
