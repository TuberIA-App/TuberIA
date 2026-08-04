/**
 * @fileoverview Startup validation for non-secret configuration.
 * @module config/env
 *
 * @description
 * Secrets (JWT keys, API keys) are validated in `config/secrets.js`, which is
 * imported first in `index.js`. This module covers the remaining configuration
 * so that a misconfigured deployment fails immediately on boot with a message
 * that says exactly what is missing.
 */

import logger from '../utils/logger.js';

/**
 * Configuration that must be present for the app to function at all.
 * @type {Array<{name: string, hint: string}>}
 */
const REQUIRED_VARS = [
  {
    name: 'MONGODB_URI',
    hint: 'MongoDB connection string, e.g. mongodb://user:pass@mongo:27017/tuberia_db?authSource=admin',
  },
];

/**
 * Configuration that has a sane default but is worth warning about when unset,
 * because the default is only correct for local development.
 * @type {Array<{name: string, hint: string}>}
 */
const RECOMMENDED_VARS = [
  { name: 'REDIS_HOST', hint: "defaults to 'localhost'; inside Docker it should be 'redis'" },
  { name: 'FRONTEND_URL', hint: 'required for CORS to accept the browser origin in production' },
];

/**
 * Validate the runtime environment. Call once, at startup, before any service
 * initialisation.
 *
 * @throws {Error} If a required environment variable is missing.
 * @example
 * import { validateEnv } from './config/env.js';
 * validateEnv();
 */
export const validateEnv = () => {
  const missing = REQUIRED_VARS.filter(({ name }) => !process.env[name]);

  if (missing.length > 0) {
    const details = missing.map(({ name, hint }) => `  - ${name}: ${hint}`).join('\n');
    const errorMsg = `Missing required environment variables:\n${details}`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  for (const { name, hint } of RECOMMENDED_VARS) {
    if (!process.env[name]) {
      logger.warn(`${name} is not set (${hint})`, { module: 'env' });
    }
  }

  // Guard against the classic "deployed with NODE_ENV unset" mistake, which
  // silently keeps Express in development mode (verbose errors, no caching).
  if (!process.env.NODE_ENV) {
    logger.warn("NODE_ENV is not set; defaulting to 'development' behaviour", { module: 'env' });
  }

  logger.info('Environment variables validated successfully');
};
