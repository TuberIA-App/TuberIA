/**
 * @fileoverview Unified secrets management with environment-aware loading.
 * Handles sensitive configuration from environment variables (development)
 * or Docker secrets (production) with validation.
 * @module config/secrets
 */

/**
 * @description
 * Handles loading sensitive configuration from:
 * - Development: .env file via process.env
 * - Production: Docker secrets from /run/secrets/
 *
 * This provides a single source of truth for all secrets across environments.
 */
import 'dotenv/config';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import logger from '../utils/logger.js';

/**
 * Get secret value from Docker secret file or environment variable
 * @param {string} envVarName - Environment variable name (e.g., 'JWT_SECRET')
 * @param {string} secretFileName - Docker secret file name (e.g., 'jwt_secret')
 * @returns {string} The secret value
 */
function getSecret(envVarName, secretFileName) {
  const secretPath = join('/run/secrets', secretFileName);

  // Production: Try to read from Docker secret first
  if (existsSync(secretPath)) {
    try {
      const secretValue = readFileSync(secretPath, 'utf8').trim();
      if (secretValue) {
        return secretValue;
      }
    } catch (error) {
      logger.error(`Error reading Docker secret ${secretFileName}`, { module: 'secrets', error: error.message });
      // Fall through to environment variable
    }
  }

  // Development: Read from environment variable
  const envValue = process.env[envVarName];
  if (!envValue) {
    throw new Error(
      `Secret '${envVarName}' not found. ` +
      `In development, set it in .env file. ` +
      `In production, create /run/secrets/${secretFileName} file.`
    );
  }

  return envValue;
}

/**
 * Validate secret value meets requirements
 * @param {string} name - Secret name for error messages
 * @param {string} value - Secret value to validate
 * @param {number} minLength - Minimum required length
 */
function validateSecret(name, value, minLength = 32) {
  if (!value || value.length < minLength) {
    throw new Error(
      `${name} must be at least ${minLength} characters long. ` +
      `Current length: ${value?.length || 0}. ` +
      `Generate a secure secret with: openssl rand -base64 ${minLength}`
    );
  }
}

// Load and validate all secrets
let jwtSecret;
let jwtRefreshSecret;
let openRouterApiKey;

try {
  // JWT Secret (required, minimum 32 characters)
  jwtSecret = getSecret('JWT_SECRET', 'jwt_secret');
  validateSecret('JWT_SECRET', jwtSecret, 32);

  // JWT Refresh Secret (required, minimum 32 characters)
  jwtRefreshSecret = getSecret('JWT_REFRESH_SECRET', 'jwt_refresh_secret');
  validateSecret('JWT_REFRESH_SECRET', jwtRefreshSecret, 32);

  // OpenRouter API Key (optional - may be used in future features)
  try {
    openRouterApiKey = getSecret('OPENROUTER_API_KEY', 'openrouter_api_key');
  } catch (error) {
    // Optional secret - don't fail if missing
    openRouterApiKey = null;
  }

  // Log successful secrets loading (without exposing values)
  const source = existsSync('/run/secrets/jwt_secret') ? 'Docker secrets' : 'environment variables';
  logger.info(`Loaded secrets from ${source}`, { module: 'secrets' });

  // Set secrets in process.env for compatibility with environment validation
  process.env.JWT_SECRET = jwtSecret;
  process.env.JWT_REFRESH_SECRET = jwtRefreshSecret;
  if (openRouterApiKey) {
    process.env.OPENROUTER_API_KEY = openRouterApiKey;
  }

} catch (error) {
  logger.error('Failed to load secrets', { module: 'secrets', error: error.message });
  throw error;
}

/**
 * Exported secrets object containing all application secrets.
 * Use this instead of directly accessing process.env for security-sensitive values.
 * Object is frozen to prevent accidental modification.
 *
 * @constant {Object}
 * @property {string} jwtSecret - Secret key for signing JWT access tokens
 * @property {string} jwtRefreshSecret - Secret key for signing JWT refresh tokens
 * @property {string|null} openRouterApiKey - API key for OpenRouter AI service (optional)
 * @example
 * import { secrets } from './config/secrets.js';
 *
 * jwt.sign(payload, secrets.jwtSecret, { expiresIn: '15m' });
 */
export const secrets = {
  /** JWT access token secret key */
  jwtSecret,

  /** JWT refresh token secret key */
  jwtRefreshSecret,

  /** OpenRouter API key (optional) */
  openRouterApiKey,
};

/**
 * JWT token expiration configuration from environment variables.
 * Uses defaults if not specified: 15 minutes for access, 7 days for refresh.
 * Object is frozen to prevent accidental modification.
 *
 * @constant {Object}
 * @property {string} accessExpiry - Access token expiration time (default: '15m')
 * @property {string} refreshExpiry - Refresh token expiration time (default: '7d')
 */
export const jwtConfig = {
  accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
};

// Freeze the secrets object to prevent accidental modification
Object.freeze(secrets);
Object.freeze(jwtConfig);

export default secrets;
