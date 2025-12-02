import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { redisConnection, redisClient } from '../../../config/redis.js';

describe('Redis Configuration', () => {
  beforeAll(async () => {
    // Wait for Redis connections to be ready
    if (redisConnection.status !== 'ready') {
      await new Promise((resolve) => {
        redisConnection.once('ready', resolve);
      });
    }
    if (redisClient.status !== 'ready') {
      await new Promise((resolve) => {
        redisClient.once('ready', resolve);
      });
    }
  });

  it('should connect to Redis successfully', () => {
    expect(redisConnection.status).toBe('ready');
  });

  it('should allow basic operations', async () => {
    await redisClient.set('test:key', 'test-value');
    const value = await redisClient.get('test:key');
    expect(value).toBe('test-value');
    await redisClient.del('test:key');
  });

  afterAll(async () => {
    await redisConnection.quit();
    await redisClient.quit();
  });
});
