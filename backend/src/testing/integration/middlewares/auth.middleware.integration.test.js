import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import jwt from 'jsonwebtoken';
import { secrets } from '../../../config/secrets.js';
import User from '../../../model/User.js';

describe('Auth Middleware Integration - Token Expiration', () => {
  let testUser;

  beforeAll(async () => {
    // Connect to test database
    const testMongoUri = process.env.MONGODB_TEST_URI?.replace('tuberia-test', 'tuberia-test-auth-middleware') || 'mongodb://mongo:mongo@mongo:27017/tuberia-test-auth-middleware?authSource=admin';

    // Close any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    await mongoose.connect(testMongoUri, {
      serverSelectionTimeoutMS: 5000
    });

    // Clean up any existing test users to avoid duplicate key errors
    await User.deleteMany({});

    // Create a test user
    testUser = await User.create({
      email: 'auth-test@test.com',
      username: 'authtest',
      password: 'TestPassword123!',
      isActive: true
    });
  });

  afterAll(async () => {
    // Cleanup
    try {
      if (testUser) {
        await User.findByIdAndDelete(testUser._id);
      }
    } catch (error) {
      // Ignore cleanup errors
    }
    await mongoose.connection.close();
  });

  it('should return 401 immediately for expired token (< 1 second)', async () => {
    // Create an expired token (expired 1 hour ago)
    const expiredToken = jwt.sign(
      { userId: testUser._id.toString() },
      secrets.jwtSecret,
      { expiresIn: '-1h' } // Negative expiry = already expired
    );

    const startTime = Date.now();

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    const responseTime = Date.now() - startTime;

    // Should respond immediately (within 1 second)
    expect(responseTime).toBeLessThan(1000);

    // Should return 401
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Token expired');
  });

  it('should return 401 immediately for invalid token (< 1 second)', async () => {
    const startTime = Date.now();

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token-here');

    const responseTime = Date.now() - startTime;

    // Should respond immediately
    expect(responseTime).toBeLessThan(1000);
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Invalid token');
  });

  it('should NOT hang on malformed token (< 1 second)', async () => {
    const startTime = Date.now();

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer malformed.jwt.token');

    const responseTime = Date.now() - startTime;

    // Should respond immediately
    expect(responseTime).toBeLessThan(1000);
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should return 401 immediately when no token is provided (< 1 second)', async () => {
    const startTime = Date.now();

    const response = await request(app)
      .get('/api/auth/me');

    const responseTime = Date.now() - startTime;

    // Should respond immediately
    expect(responseTime).toBeLessThan(1000);
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('No token provided');
  });

  it('should succeed with valid token (< 1 second)', async () => {
    // Create a valid token
    const validToken = jwt.sign(
      { userId: testUser._id.toString() },
      secrets.jwtSecret,
      { expiresIn: '15m' }
    );

    const startTime = Date.now();

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${validToken}`);

    const responseTime = Date.now() - startTime;

    // Should respond immediately
    expect(responseTime).toBeLessThan(1000);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('auth-test@test.com');
  });

  it('should return 401 immediately for token with nbf claim in future (< 1 second)', async () => {
    // Create a token that's not valid yet (valid 1 hour from now)
    const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const notBeforeToken = jwt.sign(
      { userId: testUser._id.toString(), nbf: futureTime },
      secrets.jwtSecret,
      { expiresIn: '2h' }
    );

    const startTime = Date.now();

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${notBeforeToken}`);

    const responseTime = Date.now() - startTime;

    // Should respond immediately
    expect(responseTime).toBeLessThan(1000);
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Token not active yet');
  });
});
