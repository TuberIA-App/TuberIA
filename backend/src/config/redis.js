import IORedis from 'ioredis';
import logger from '../utils/logger.js';

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

// Main Redis client for BullMQ
export const redisConnection = new IORedis(redisConfig);

// Separate client for caching/general use
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
