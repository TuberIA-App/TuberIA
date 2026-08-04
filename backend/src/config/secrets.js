/**
 * @fileoverview Centralised, validated access to the application's secrets.
 * @module config/secrets
 *
 * @description
 * Secrets are read from the process environment, which is populated from:
 *   - local development : `backend/.env` (loaded by dotenv, gitignored)
 *   - Docker            : the `env_file:` / `environment:` keys in compose
 *   - CI                : GitHub Actions secrets exported as env vars
 *
 * A single mechanism for every environment means there is exactly one place to
 * look when a secret is missing, and no code path that only runs in production.
 *
 * Values are validated at import time so the process fails fast on boot rather
 * than at the first request that happens to need a JWT.
 */
import 'dotenv/config';
import logger from '../utils/logger.js';

/**
 * Read a required secret from the environment.
 * @param {string} name - Environment variable name (e.g. 'JWT_SECRET').
 * @returns {string} The secret value.
 * @throws {Error} If the variable is unset or empty.
 */
function requireSecret(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Secret '${name}' is not set. ` +
      `Add it to backend/.env locally, or to the environment of the ` +
      `backend service (see backend/.env.example for the full list).`
    );
  }

  return value;
}

/**
 * Reject secrets that are too short to be cryptographically meaningful, and
 * placeholder values copied verbatim out of `.env.example`.
 * @param {string} name - Secret name, used in the error message.
 * @param {string} value - Secret value to validate.
 * @param {number} [minLength=32] - Minimum acceptable length.
 * @throws {Error} If the value is too short or is a known placeholder.
 */
function validateSecret(name, value, minLength = 32) {
  if (value.length < minLength) {
    throw new Error(
      `${name} must be at least ${minLength} characters long ` +
      `(current length: ${value.length}). ` +
      `Generate one with: openssl rand -hex 32`
    );
  }

  // The example file ships long-but-worthless defaults; catch them before they
  // reach a deployed environment.
  if (/^your-super-secret|^your_api_key|change-this/i.test(value)) {
    throw new Error(
      `${name} still holds the placeholder value from .env.example. ` +
      `Generate a real one with: openssl rand -hex 32`
    );
  }
}

const jwtSecret = requireSecret('JWT_SECRET');
validateSecret('JWT_SECRET', jwtSecret, 32);

const jwtRefreshSecret = requireSecret('JWT_REFRESH_SECRET');
validateSecret('JWT_REFRESH_SECRET', jwtRefreshSecret, 32);

if (jwtSecret === jwtRefreshSecret) {
  throw new Error(
    'JWT_SECRET and JWT_REFRESH_SECRET must be different. Reusing one key for ' +
    'both token types lets a leaked access token be replayed as a refresh token.'
  );
}

// Required: AI summarisation is the product's core feature, so a deployment
// without a key is a misconfiguration we want to catch at boot, not at runtime.
const openRouterApiKey = requireSecret('OPENROUTER_API_KEY');

logger.info('Secrets loaded and validated from environment', { module: 'secrets' });

/**
 * Application secrets. Prefer importing this over reading `process.env`
 * directly: it is validated, typed by JSDoc, and frozen.
 *
 * @constant {Object}
 * @property {string} jwtSecret - Signing key for JWT access tokens.
 * @property {string} jwtRefreshSecret - Signing key for JWT refresh tokens.
 * @property {string} openRouterApiKey - OpenRouter API key.
 * @example
 * import { secrets } from './config/secrets.js';
 * jwt.sign(payload, secrets.jwtSecret, { expiresIn: '15m' });
 */
export const secrets = Object.freeze({
  jwtSecret,
  jwtRefreshSecret,
  openRouterApiKey,
});

/**
 * JWT lifetime configuration.
 *
 * @constant {Object}
 * @property {string} accessExpiry - Access token TTL (default '15m').
 * @property {string} refreshExpiry - Refresh token TTL (default '7d').
 */
export const jwtConfig = Object.freeze({
  accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
});

export default secrets;
