import crypto from 'crypto';
import { redisClient } from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Token Blacklist Service
 * Manages token revocation using Redis with automatic TTL-based cleanup
 */

/**
 * Generates a SHA-256 hash of a token for privacy
 * Tokens are hashed before storage to avoid storing sensitive data in plain text
 * @param {string} token - JWT token to hash
 * @returns {string} - Hexadecimal hash of the token
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Adds a token to the Redis blacklist with automatic expiration
 * @param {string} token - JWT token to blacklist
 * @param {number} ttlSeconds - Time-to-live in seconds (should match token expiry)
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const addToBlacklist = async (token, ttlSeconds) => {
  try {
    const tokenHash = hashToken(token);
    const key = `blacklist:token:${tokenHash}`;

    // Store token hash in Redis with TTL
    // Value is just a timestamp for debugging purposes
    const result = await redisClient.setex(key, ttlSeconds, Date.now().toString());

    if (result === 'OK') {
      logger.info(`Token added to blacklist with TTL of ${ttlSeconds}s`);
      return true;
    }

    logger.warn('Failed to add token to blacklist - Redis returned non-OK result');
    return false;
  } catch (error) {
    logger.error('Error adding token to blacklist:', error);
    // Don't throw - fail gracefully
    return false;
  }
};

/**
 * Checks if a token is in the blacklist
 * @param {string} token - JWT token to check
 * @returns {Promise<boolean>} - True if token is blacklisted, false otherwise
 */
const isBlacklisted = async (token) => {
  try {
    const tokenHash = hashToken(token);
    const key = `blacklist:token:${tokenHash}`;

    const result = await redisClient.get(key);

    // If key exists in Redis, token is blacklisted
    return result !== null;
  } catch (error) {
    logger.error('Error checking token blacklist:', error);
    // Fail-open: If Redis is down, allow access rather than blocking all users
    // This prioritizes availability over security in error scenarios
    logger.warn('Redis error - allowing token (fail-open behavior)');
    return false;
  }
};

/**
 * Removes all blacklisted tokens for a specific user (optional feature)
 * This can be used for "logout from all devices" functionality
 * Note: Requires storing userId mapping, which is not implemented in v1
 * @param {string} userId - User ID whose tokens should be invalidated
 * @returns {Promise<number>} - Number of tokens removed
 */
const removeUserTokens = async (userId) => {
  try {
    // This would require maintaining a userId -> tokens mapping in Redis
    // For now, this is a placeholder for future implementation
    logger.info(`removeUserTokens called for user ${userId} - not yet implemented`);
    return 0;
  } catch (error) {
    logger.error('Error removing user tokens:', error);
    return 0;
  }
};

export {
  addToBlacklist,
  isBlacklisted,
  removeUserTokens,
  hashToken, // Exported for testing purposes
};
