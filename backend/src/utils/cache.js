import { redisClient } from '../config/redis.js';
import logger from './logger.js';

/**
 * Get cached value or execute function and cache result
 * @param {string} key - Cache key
 * @param {number} ttl - Time to live in seconds
 * @param {Function} fetchFunction - Async function to execute if cache miss
 * @returns {Promise<any>} - Cached or fresh result
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
 * Invalidate cache by key pattern
 * @param {string} pattern - Redis key pattern (e.g., 'videos:*')
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
