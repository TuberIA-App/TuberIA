/**
 * @fileoverview Environment variable validation for application startup.
 * Ensures all required configuration is present before the app runs.
 * @module config/env
 */

import logger from '../utils/logger.js';

/**
 * Validates that all required environment variables are set and meet minimum requirements.
 * Should be called during application startup before any other initialization.
 *
 * Required variables:
 * - MONGODB_URI: MongoDB connection string
 * - JWT_SECRET: Secret for signing access tokens (min 32 chars)
 * - JWT_REFRESH_SECRET: Secret for signing refresh tokens (min 32 chars)
 * - OPENROUTER_API_KEY: API key for OpenRouter AI service
 *
 * @throws {Error} If any required environment variable is missing
 * @throws {Error} If JWT secrets are less than 32 characters
 * @example
 * import { validateEnv } from './config/env.js';
 *
 * // Call at startup
 * validateEnv();
 * // If validation passes, continue with app initialization
 */
export const validateEnv = () => {

    // These are the required ENV VARIABLES that we need to exist on .env file
    const requiredEnvVars = [
        'MONGODB_URI',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'OPENROUTER_API_KEY'
    ];

    const missing = [];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            missing.push(envVar);
        }
    }

    // Checking if there is any missing env, and if so then throw an error and log it.
    if (missing.length > 0) {
        const errorMsg = `Missing required environment variables: ${missing.join(', ')}`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
    }

    // Validating the JWT secrets length
    if (process.env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long');
    }

    if (process.env.JWT_REFRESH_SECRET.length < 32) {
        throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
    }

    logger.info('Environment variables validated successfully');

}