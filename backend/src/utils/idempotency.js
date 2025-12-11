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

    // Determine if we should cache the result
    let shouldCache = true; // Default to caching

    // Only skip caching in specific cases
    if (result !== null && typeof result === 'object') {
      // Never cache error responses
      if (result.error) {
        logger.warn('Result not cached (error response)', {
          key,
          error: result.error
        });
        shouldCache = false;
      }
      // For video summary results from generateVideoSummary, check for unique signature
      // Real video summaries have: summary + keyPoints + aiModel + transcriptSegments + transcriptLength
      // This avoids false positives with test objects or other data that happen to have similar properties
      else if (result.aiModel !== undefined &&
               result.transcriptSegments !== undefined &&
               result.transcriptLength !== undefined) {
        // This is definitely a video summary from our service, validate it strictly
        if (result.summary !== undefined && result.keyPoints !== undefined) {
          const isValidSummary = result.summary &&
                                typeof result.summary === 'string' &&
                                result.summary.trim().length >= 50;

          if (!isValidSummary) {
            logger.warn('Result not cached (invalid video summary)', {
              key,
              hasSummary: !!result.summary,
              summaryLength: result.summary?.trim().length || 0
            });
            shouldCache = false;
          }
        }
      }
      // For all other objects (no aiModel = not a video summary), cache them normally
    }
    // Cache null, undefined, and primitive values too (for generic caching)

    if (shouldCache) {
      await redisClient.setex(cacheKey, ttl, JSON.stringify(result));
      logger.debug('Result cached successfully', { key });
    }

    return result;

  } catch (error) {
    logger.error('Idempotency operation failed', {
      key,
      error: error.message
    });
    throw error;
  }
}
