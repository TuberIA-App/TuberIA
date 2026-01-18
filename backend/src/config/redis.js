/**
 * @fileoverview Redis connection configuration for caching and BullMQ job queues.
 * Creates separate Redis clients for different purposes to avoid connection conflicts.
 * @module config/redis
 */

import IORedis from 'ioredis';
import logger from '../utils/logger.js';

/**
 * Redis connection configuration object.
 * Uses environment variables for host, port, and password.
 * @private
 * @type {Object}
 * @property {string} host - Redis server host (default: 'localhost')
 * @property {number} port - Redis server port (default: 6379)
 * @property {string} [password] - Redis password if authentication required
 * @property {null} maxRetriesPerRequest - Required for BullMQ compatibility
 * @property {boolean} enableReadyCheck - Disabled for faster connection
 * @property {Function} retryStrategy - Exponential backoff up to 2 seconds
 */
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

/**
 * Redis connection instance dedicated to BullMQ job queues.
 * Configured with maxRetriesPerRequest: null as required by BullMQ.
 * @type {import('ioredis').Redis}
 * @example
 * import { redisConnection } from './config/redis.js';
 *
 * const queue = new Queue('myQueue', { connection: redisConnection });
 */
export const redisConnection = new IORedis(redisConfig);

/**
 * Redis client for general caching and key-value operations.
 * Separate from BullMQ connection to avoid conflicts.
 * @type {import('ioredis').Redis}
 * @example
 * import { redisClient } from './config/redis.js';
 *
 * await redisClient.set('key', 'value');
 * const value = await redisClient.get('key');
 */
export const redisClient = new IORedis(redisConfig);

// Connection event handlers
redisConnection.on('connect', () => {
  logger.info('Redis connected for BullMQ');
});

redisConnection.on('error', (err) => {
  logger.error('Redis connection error', { error: err.message });
});

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

export default redisConnection;
