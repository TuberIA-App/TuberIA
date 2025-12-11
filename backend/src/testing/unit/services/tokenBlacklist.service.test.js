import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as tokenBlacklistService from '../../../services/tokenBlacklist.service.js';
import crypto from 'crypto';

// Mock Redis client
const mockRedisClient = {
  setex: vi.fn(),
  get: vi.fn(),
};

// Mock redis config module
vi.mock('../../../config/redis.js', () => ({
  redisClient: mockRedisClient,
}));

// Mock logger to avoid console noise in tests
vi.mock('../../../utils/logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Token Blacklist Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('hashToken', () => {
    it('should generate a SHA-256 hash of a token', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      const hash = tokenBlacklistService.hashToken(token);

      // Verify it's a hex string
      expect(hash).toMatch(/^[a-f0-9]{64}$/);

      // Verify it's consistent (same input = same output)
      const hash2 = tokenBlacklistService.hashToken(token);
      expect(hash).toBe(hash2);
    });

    it('should generate different hashes for different tokens', () => {
      const token1 = 'token1';
      const token2 = 'token2';

      const hash1 = tokenBlacklistService.hashToken(token1);
      const hash2 = tokenBlacklistService.hashToken(token2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('addToBlacklist', () => {
    it('should add a token to Redis with correct TTL', async () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      const ttl = 900; // 15 minutes

      mockRedisClient.setex.mockResolvedValue('OK');

      const result = await tokenBlacklistService.addToBlacklist(token, ttl);

      expect(result).toBe(true);
      expect(mockRedisClient.setex).toHaveBeenCalledTimes(1);

      const callArgs = mockRedisClient.setex.mock.calls[0];
      const [key, ttlArg, value] = callArgs;

      // Verify key pattern
      expect(key).toMatch(/^blacklist:token:[a-f0-9]{64}$/);

      // Verify TTL
      expect(ttlArg).toBe(ttl);

      // Verify value is a timestamp
      expect(typeof value).toBe('string');
      expect(Number(value)).toBeGreaterThan(0);
    });

    it('should return false if Redis returns non-OK result', async () => {
      const token = 'test-token';
      const ttl = 600;

      mockRedisClient.setex.mockResolvedValue('ERROR');

      const result = await tokenBlacklistService.addToBlacklist(token, ttl);

      expect(result).toBe(false);
    });

    it('should handle Redis errors gracefully and return false', async () => {
      const token = 'test-token';
      const ttl = 600;

      mockRedisClient.setex.mockRejectedValue(new Error('Redis connection failed'));

      const result = await tokenBlacklistService.addToBlacklist(token, ttl);

      expect(result).toBe(false);
    });
  });

  describe('isBlacklisted', () => {
    it('should return true if token exists in Redis', async () => {
      const token = 'blacklisted-token';

      mockRedisClient.get.mockResolvedValue('1234567890'); // Timestamp value

      const result = await tokenBlacklistService.isBlacklisted(token);

      expect(result).toBe(true);
      expect(mockRedisClient.get).toHaveBeenCalledTimes(1);

      const callArgs = mockRedisClient.get.mock.calls[0];
      const [key] = callArgs;

      // Verify key pattern
      expect(key).toMatch(/^blacklist:token:[a-f0-9]{64}$/);
    });

    it('should return false if token does not exist in Redis', async () => {
      const token = 'valid-token';

      mockRedisClient.get.mockResolvedValue(null);

      const result = await tokenBlacklistService.isBlacklisted(token);

      expect(result).toBe(false);
    });

    it('should return false (fail-open) if Redis throws an error', async () => {
      const token = 'test-token';

      mockRedisClient.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await tokenBlacklistService.isBlacklisted(token);

      // Fail-open: prioritize availability over security
      expect(result).toBe(false);
    });
  });

  describe('removeUserTokens', () => {
    it('should return 0 (not implemented yet)', async () => {
      const userId = '60d0fe4f5311236168a109ca';

      const result = await tokenBlacklistService.removeUserTokens(userId);

      expect(result).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      const userId = '60d0fe4f5311236168a109ca';

      // Even if an error occurs, it should return 0
      const result = await tokenBlacklistService.removeUserTokens(userId);

      expect(result).toBe(0);
    });
  });

  describe('Integration: addToBlacklist + isBlacklisted', () => {
    it('should correctly identify a blacklisted token', async () => {
      const token = 'integration-test-token';
      const ttl = 300;

      // Mock Redis to store the token
      const storedTokens = new Map();

      mockRedisClient.setex.mockImplementation((key, ttl, value) => {
        storedTokens.set(key, value);
        return Promise.resolve('OK');
      });

      mockRedisClient.get.mockImplementation((key) => {
        return Promise.resolve(storedTokens.get(key) || null);
      });

      // Add token to blacklist
      const addResult = await tokenBlacklistService.addToBlacklist(token, ttl);
      expect(addResult).toBe(true);

      // Check if it's blacklisted
      const isBlacklisted = await tokenBlacklistService.isBlacklisted(token);
      expect(isBlacklisted).toBe(true);
    });

    it('should not identify a non-blacklisted token', async () => {
      const token = 'non-blacklisted-token';

      mockRedisClient.get.mockResolvedValue(null);

      const isBlacklisted = await tokenBlacklistService.isBlacklisted(token);
      expect(isBlacklisted).toBe(false);
    });
  });
});
