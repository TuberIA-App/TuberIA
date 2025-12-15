/**
 * @fileoverview Idempotency utility for preventing duplicate operations.
 * Uses Redis to cache operation results and ensure operations are only executed once
 * within a specified time window.
 * @module utils/idempotency
 */

import crypto from 'crypto';
import { redisClient } from '../config/redis.js';
import logger from './logger.js';

/**
 * Executes an operation with idempotency guarantee using Redis caching.
 * The operation result is cached using a SHA-256 hash of the key.
 * Subsequent calls with the same key within TTL return the cached result.
 *
 * Special handling for video summary results: validates summary quality before caching.
 * Error results are never cached to allow retries.
 *
 * @template T
 * @param {string} key - Unique identifier for the operation (e.g., 'summarize:videoId')
 * @param {number} ttl - Time-to-live for the cached result in seconds
 * @param {() => Promise<T>} operation - Async function to execute if not cached
 * @returns {Promise<T>} Operation result (with `fromCache: true` property if from cache)
 * @throws {Error} If the operation fails and is not cached
 * @example
 * const summary = await withIdempotency('summarize:abc123', 86400, async () => {
 *   return await generateVideoSummary(videoId);
 * });
 *
 * // Check if result was cached
 * if (summary.fromCache) {
 *   console.log('Result retrieved from cache');
 * }
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
