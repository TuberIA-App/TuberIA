/**
 * @fileoverview Redis cache utility functions for application-wide caching.
 * Provides cache-aside pattern implementation with automatic fallback.
 * @module utils/cache
 */

import { redisClient } from '../config/redis.js';
import logger from './logger.js';

/**
 * Gets a cached value or executes a function and caches the result (cache-aside pattern).
 * If Redis fails, falls back to executing the function without caching.
 * @template T
 * @param {string} key - Cache key to store/retrieve data
 * @param {number} ttl - Time to live in seconds
 * @param {() => Promise<T>} fetchFunction - Async function to execute on cache miss
 * @returns {Promise<T>} Cached or freshly fetched result
 * @example
 * const userData = await getOrSet('user:123', 3600, async () => {
 *   return await User.findById('123');
 * });
 */
export async function getOrSet(key, ttl, fetchFunction) {
    try {
        // Try cache first
        const cached = await redisClient.get(key);

        if (cached) {
            logger.debug('Cache hit', { key });
            return JSON.parse(cached);
        }

        logger.debug('Cache miss', { key });

        // Execute function
        const result = await fetchFunction();

        // Cache result
        await redisClient.setex(key, ttl, JSON.stringify(result));

        return result;

    } catch (error) {
        logger.error('Cache operation failed', {
            key,
            error: error.message
        });
        // Fallback: execute function without caching
        return await fetchFunction();
    }
}

/**
 * Invalidates cache entries matching a key pattern.
 * Uses Redis KEYS command to find matching keys and DEL to remove them.
 * @param {string} pattern - Redis key pattern with wildcards (e.g., 'videos:*', 'user:123:*')
 * @returns {Promise<void>}
 * @example
 * // Invalidate all video caches
 * await invalidate('videos:*');
 *
 * // Invalidate specific user's caches
 * await invalidate('user:123:*');
 */
export async function invalidate(pattern) {
    try {
        const keys = await redisClient.keys(pattern);

        if (keys.length > 0) {
            await redisClient.del(...keys);
            logger.info('Cache invalidated', {
                pattern,
                keysDeleted: keys.length
            });
        }
    } catch (error) {
        logger.error('Cache invalidation failed', {
            pattern,
            error: error.message
        });
    }
}
