/**
 * @fileoverview Application-wide constants and configuration values.
 * Centralizes magic numbers and configuration options for consistency.
 * @module config/constants
 */

/**
 * User role constants for role-based access control
 * @constant {Object}
 * @property {string} USER - Standard user role
 * @property {string} ADMIN - Administrator role with elevated permissions
 */
export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin'
};

/**
 * Video processing status values for tracking video pipeline state
 * @constant {Object}
 * @property {string} PENDING - Video queued, awaiting processing
 * @property {string} PROCESSING - Video currently being transcribed/summarized
 * @property {string} COMPLETED - Video processing finished successfully
 * @property {string} FAILED - Video processing failed with error
 */
export const VIDEO_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed'
};

/**
 * Minimum required password length for user registration
 * @constant {number}
 */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * Number of salt rounds for bcrypt password hashing
 * Higher values increase security but slow down hashing
 * @constant {number}
 */
export const PASSWORD_SALT_ROUNDS = 10;

/**
 * Rate limiting configuration for API endpoints
 * @constant {Object}
 * @property {number} WINDOW_MS - Time window in milliseconds (15 minutes)
 * @property {number} MAX_REQUESTS - Maximum requests allowed per window
 * @property {Object} AUTH - Stricter rate limits for authentication endpoints
 */
export const RATE_LIMIT = {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 1000,
    AUTH: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 10 // Only 10 auth attempts per window
    }
}

/**
 * JWT token expiration times
 * @constant {Object}
 * @property {string} ACCESS - Access token expiry (15 minutes)
 * @property {string} REFRESH - Refresh token expiry (7 days)
 */
export const TOKEN_EXPIRY = {
    ACCESS: '15m',
    REFRESH: '7d'
}