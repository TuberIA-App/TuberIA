import crypto from 'crypto';
import { redisClient } from '../config/redis.js';
import logger from './logger.js';

/**
 * Execute operation with idempotency guarantee
 * @param {string} key - Unique key for operation
 * @param {number} ttl - TTL in seconds
 * @param {Function} operation - Async function to execute
 * @returns {Promise<any>} Result of operation (cached or fresh)
 */
export async function withIdempotency(key, ttl, operation) {
  // Generate idempotency key hash
  const idempotencyKey = crypto
    .createHash('sha256')
    .update(key)
    .digest('hex');

  const cacheKey = `idempotency:${idempotencyKey}`;

  try {
    // Check cache
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      const result = JSON.parse(cached);
      // Add fromCache flag only if result is an object (not null or primitive)
      if (result !== null && typeof result === 'object') {
        result.fromCache = true;
      }
      logger.debug('Idempotency cache hit', { key });
      return result;
    }

    // Execute operation
    logger.debug('Idempotency cache miss, executing operation', { key });
    const result = await operation();

    // Cache result
    await redisClient.setex(cacheKey, ttl, JSON.stringify(result));

    return result;

  } catch (error) {
    logger.error('Idempotency operation failed', {
      key,
      error: error.message
    });
    throw error;
  }
}
