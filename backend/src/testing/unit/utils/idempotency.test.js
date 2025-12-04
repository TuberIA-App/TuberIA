import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { withIdempotency } from '../../../utils/idempotency.js';
import { redisClient } from '../../../config/redis.js';

describe('Idempotency Utility', () => {
  afterEach(async () => {
    // Clean up Redis after each test
    await redisClient.flushdb();
  });

  it('should execute operation on first call', async () => {
    let callCount = 0;

    const result = await withIdempotency(
      'test-key-1',
      60,
      async () => {
        callCount++;
        return { data: 'test-result' };
      }
    );

    expect(callCount).toBe(1);
    expect(result.data).toBe('test-result');
  });

  it('should return cached result on second call', async () => {
    let callCount = 0;

    const operation = async () => {
      callCount++;
      return { data: 'test-result' };
    };

    // First call
    await withIdempotency('test-key-2', 60, operation);

    // Second call (should be cached)
    const result = await withIdempotency('test-key-2', 60, operation);

    expect(callCount).toBe(1); // Operation only called once
    expect(result.data).toBe('test-result');
    expect(result.fromCache).toBe(true); // Should have cache flag
  });

  it('should handle different keys independently', async () => {
    let callCount1 = 0;
    let callCount2 = 0;

    const operation1 = async () => {
      callCount1++;
      return { data: 'result-1' };
    };

    const operation2 = async () => {
      callCount2++;
      return { data: 'result-2' };
    };

    // Execute with different keys
    const result1 = await withIdempotency('test-key-3', 60, operation1);
    const result2 = await withIdempotency('test-key-4', 60, operation2);

    // Both operations should have been called
    expect(callCount1).toBe(1);
    expect(callCount2).toBe(1);
    expect(result1.data).toBe('result-1');
    expect(result2.data).toBe('result-2');
  });

  it('should respect TTL expiration', async () => {
    let callCount = 0;

    const operation = async () => {
      callCount++;
      return { data: 'test-result' };
    };

    // First call with 1 second TTL
    await withIdempotency('test-key-5', 1, operation);

    // Wait for cache to expire
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Second call should execute again
    await withIdempotency('test-key-5', 1, operation);

    expect(callCount).toBe(2); // Should be called twice due to expiration
  }, 5000); // Increase test timeout

  it('should handle errors in operation gracefully', async () => {
    const operation = async () => {
      throw new Error('Operation failed');
    };

    // Should propagate the error
    await expect(
      withIdempotency('test-key-6', 60, operation)
    ).rejects.toThrow('Operation failed');

    // Verify error result is not cached
    let callCount = 0;
    const successOperation = async () => {
      callCount++;
      return { data: 'success' };
    };

    const result = await withIdempotency('test-key-6', 60, successOperation);
    expect(callCount).toBe(1); // Should execute since error wasn't cached
    expect(result.data).toBe('success');
  });

  it('should handle complex result objects', async () => {
    const complexResult = {
      summary: 'Test summary',
      keyPoints: ['point 1', 'point 2', 'point 3'],
      aiModel: 'test-model',
      tokensConsumed: 100,
      nested: {
        data: 'nested value'
      }
    };

    const operation = async () => complexResult;

    // First call
    await withIdempotency('test-key-7', 60, operation);

    // Second call should return cached complex object
    const result = await withIdempotency('test-key-7', 60, operation);

    expect(result.summary).toBe('Test summary');
    expect(result.keyPoints).toHaveLength(3);
    expect(result.keyPoints[0]).toBe('point 1');
    expect(result.tokensConsumed).toBe(100);
    expect(result.nested.data).toBe('nested value');
    expect(result.fromCache).toBe(true);
  });

  it('should generate consistent hash for same key', async () => {
    let callCount = 0;

    const operation = async () => {
      callCount++;
      return { data: 'test-result' };
    };

    // Call with same key multiple times
    await withIdempotency('consistent-key', 60, operation);
    await withIdempotency('consistent-key', 60, operation);
    await withIdempotency('consistent-key', 60, operation);

    // Operation should only be called once
    expect(callCount).toBe(1);
  });

  it('should handle empty string keys', async () => {
    const operation = async () => ({ data: 'empty-key-result' });

    const result = await withIdempotency('', 60, operation);

    expect(result.data).toBe('empty-key-result');

    // Second call should use cache
    const cachedResult = await withIdempotency('', 60, operation);
    expect(cachedResult.fromCache).toBe(true);
  });

  it('should handle very long keys', async () => {
    const longKey = 'a'.repeat(10000); // 10k character key
    const operation = async () => ({ data: 'long-key-result' });

    const result = await withIdempotency(longKey, 60, operation);

    expect(result.data).toBe('long-key-result');

    // Verify caching works with long keys
    const cachedResult = await withIdempotency(longKey, 60, operation);
    expect(cachedResult.fromCache).toBe(true);
  });

  it('should cache null and undefined values', async () => {
    let callCount = 0;

    const nullOperation = async () => {
      callCount++;
      return null;
    };

    const result1 = await withIdempotency('test-null', 60, nullOperation);
    expect(result1).toBe(null);

    const result2 = await withIdempotency('test-null', 60, nullOperation);
    expect(result2).toBe(null);
    expect(callCount).toBe(1); // Should only call once
  });
});
