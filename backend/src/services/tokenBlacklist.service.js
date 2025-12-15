/**
 * @fileoverview Token blacklist service for JWT token revocation.
 * Uses Redis with automatic TTL-based cleanup for secure token invalidation.
 * Tokens are stored as SHA-256 hashes for security.
 * @module services/tokenBlacklist
 */

import crypto from 'crypto';
import { redisClient } from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Generates a SHA-256 hash of a token for secure storage.
 * Tokens are hashed before storage to avoid storing sensitive data in plain text.
 * @private
 * @param {string} token - JWT token to hash
 * @returns {string} Hexadecimal SHA-256 hash of the token
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Adds a token to the Redis blacklist with automatic expiration.
 * Token is stored as a SHA-256 hash with TTL matching token expiry.
 * @param {string} token - JWT token to blacklist
 * @param {number} ttlSeconds - Time-to-live in seconds (should match remaining token expiry)
 * @returns {Promise<boolean>} True if successfully added, false on failure
 * @example
 * const ttl = decodedToken.exp - Math.floor(Date.now() / 1000);
 * await addToBlacklist(token, ttl);
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
 * Checks if a token is in the blacklist (has been revoked).
 * Uses fail-open strategy: if Redis is unavailable, allows access to prioritize availability.
 * @param {string} token - JWT token to check
 * @returns {Promise<boolean>} True if token is blacklisted, false otherwise
 * @example
 * if (await isBlacklisted(token)) {
 *   throw new UnauthorizedError('Token has been revoked');
 * }
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
 * Removes all blacklisted tokens for a specific user.
 * Enables "logout from all devices" functionality.
 * @todo Implement userId -> tokens mapping in Redis for full functionality
 * @param {string} userId - MongoDB ObjectId of the user
 * @returns {Promise<number>} Number of tokens removed (currently always 0 - not implemented)
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
