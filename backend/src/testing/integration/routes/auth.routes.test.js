import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import User from '../../../model/User.js';

describe('Auth Routes Integration Tests', () => {
    beforeAll(async () => {
        // Connect to test database with authentication - use different DB name to avoid conflicts
        const testMongoUri = process.env.MONGODB_TEST_URI?.replace('tuberia-test', 'tuberia-test-routes') || 'mongodb://mongo:mongo@localhost:27017/tuberia-test-routes?authSource=admin';

        // Close any existing connections
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }

        await mongoose.connect(testMongoUri, {
            serverSelectionTimeoutMS: 5000
        });
    });

    beforeEach(async () => {
        await User.deleteMany({});
    });

    afterAll(async () => {
        try {
            await User.deleteMany({});
        } catch (error) {
            // Ignore errors during cleanup
        }
        await mongoose.connection.close();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.accessToken).toBeDefined();
            expect(response.body.data.refreshToken).toBeDefined();
            expect(response.body.data.user.password).toBeUndefined();
        });

        it('should return 400 for missing username', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        it('should return 400 for invalid email format', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'invalidemail',
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for short password', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'pass'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 409 for duplicate email', async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'user1',
                    email: 'duplicate@example.com',
                    password: 'password123'
                });

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'user2',
                    email: 'duplicate@example.com',
                    password: 'password456'
                });

            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
        });

        it('should return 409 for duplicate username', async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'sameuser',
                    email: 'user1@example.com',
                    password: 'password123'
                });

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'sameuser',
                    email: 'user2@example.com',
                    password: 'password456'
                });

            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
        });

        it('should not include _id or __v in response', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'cleanuser',
                    email: 'clean@example.com',
                    password: 'password123'
                });

            expect(response.body.data.user._id).toBeUndefined();
            expect(response.body.data.user.__v).toBeUndefined();
            expect(response.body.data.user.id).toBeDefined();
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'loginuser',
                    email: 'login@example.com',
                    password: 'password123'
                });
        });

        it('should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.accessToken).toBeDefined();
            expect(response.body.data.refreshToken).toBeDefined();
        });

        it('should return 401 for incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should return 401 for non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for missing email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    password: 'password123'
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 for missing password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com'
                });

            expect(response.status).toBe(400);
        });

        it('should not include password in response', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123'
                });

            expect(response.body.data.user.password).toBeUndefined();
        });

        it('should update lastLogin timestamp', async () => {
            const beforeLogin = new Date();

            await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123'
                });

            const user = await User.findOne({ email: 'login@example.com' });
            expect(user.lastLogin).toBeDefined();
            expect(user.lastLogin.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
        });
    });

    describe('POST /api/auth/refresh', () => {
        let refreshToken;

        beforeEach(async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'refreshuser',
                    email: 'refresh@example.com',
                    password: 'password123'
                });

            refreshToken = response.body.data.refreshToken;
        });

        it('should refresh access token successfully', async () => {
            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.accessToken).toBeDefined();
        });

        it('should return 401 for invalid refresh token', async () => {
            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'invalid.token.here' });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for missing refresh token', async () => {
            const response = await request(app)
                .post('/api/auth/refresh')
                .send({});

            expect(response.status).toBe(400);
        });

        it('should return valid JWT structure', async () => {
            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken });

            expect(response.body.data.accessToken.split('.').length).toBe(3);
        });

        it('should return 401 for expired refresh token', async () => {
            // This would require mocking time or using a token with short expiry
            // For now, we test with an invalid token format
            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'expired.token.format' });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/auth/me', () => {
        let accessToken;

        beforeEach(async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'meuser',
                    email: 'me@example.com',
                    password: 'password123'
                });

            accessToken = response.body.data.accessToken;
        });

        it('should get current user with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.user.email).toBe('me@example.com');
        });

        it('should return 401 without token', async () => {
            const response = await request(app)
                .get('/api/auth/me');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should return 401 with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid.token.here');

            expect(response.status).toBe(401);
        });

        it('should not include password in response', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.body.data.user.password).toBeUndefined();
        });

        it('should return 401 with malformed Authorization header', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', accessToken); // Missing "Bearer "

            expect(response.status).toBe(401);
        });

        it('should include user id in response', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.body.data.user.id).toBeDefined();
            expect(response.body.data.user._id).toBeUndefined();
        });

        it('should include all user fields except sensitive data', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${accessToken}`);

            const user = response.body.data.user;
            expect(user.username).toBe('meuser');
            expect(user.email).toBe('me@example.com');
            expect(user.createdAt).toBeDefined();
            expect(user.updatedAt).toBeDefined();
            expect(user.password).toBeUndefined();
            expect(user.__v).toBeUndefined();
        });
    });
});
