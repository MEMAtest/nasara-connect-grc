/**
 * Environment configuration utilities
 * Detects current deployment environment based on Vercel environment variables
 */

export type EnvironmentName = 'development' | 'uat' | 'production' | 'local';

// Check URL-based detection as fallback
const nextAuthUrl = process.env.NEXTAUTH_URL || '';
const isDevUrl = nextAuthUrl.includes('dev.nasaraconnect');
const isUatUrl = nextAuthUrl.includes('uat.nasaraconnect');

export const ENV_CONFIG = {
  /**
   * True if running in development environment (dev branch on Vercel)
   */
  isDev: (process.env.VERCEL_ENV === 'preview' &&
         process.env.VERCEL_GIT_COMMIT_REF === 'dev') || isDevUrl,

  /**
   * True if running in UAT environment (uat branch on Vercel)
   */
  isUat: (process.env.VERCEL_ENV === 'preview' &&
         process.env.VERCEL_GIT_COMMIT_REF === 'uat') || isUatUrl,

  /**
   * True if running in production environment (main branch on Vercel)
   */
  isProd: process.env.VERCEL_ENV === 'production',

  /**
   * True if running locally (not on Vercel)
   */
  isLocal: !process.env.VERCEL && !isDevUrl && !isUatUrl,

  /**
   * Current environment name
   */
  envName: ((): EnvironmentName => {
    if (process.env.VERCEL_GIT_COMMIT_REF === 'dev' || isDevUrl) return 'development';
    if (process.env.VERCEL_GIT_COMMIT_REF === 'uat' || isUatUrl) return 'uat';
    if (process.env.VERCEL_ENV === 'production') return 'production';
    if (!process.env.VERCEL) return 'local';
    return 'local';
  })(),

  /**
   * Base URL for the current environment
   */
  baseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
};

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig() {
  return {
    ...ENV_CONFIG,
    // Add any additional computed properties here
    isNonProduction: !ENV_CONFIG.isProd,
    showDebugInfo: ENV_CONFIG.isDev || ENV_CONFIG.isLocal,
  };
}
