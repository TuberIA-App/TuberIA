import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import * as authService from '../../../services/auth.service.js';
import User from '../../../model/User.js';

describe('Auth Service', () => {
    beforeAll(async () => {
        // Connect to test database with authentication - use different DB name to avoid conflicts
        const testMongoUri = process.env.MONGODB_TEST_URI?.replace('tuberia-test', 'tuberia-test-auth') || 'mongodb://mongo:mongo@localhost:27017/tuberia-test-auth?authSource=admin';

        // Close any existing connections
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }

        await mongoose.connect(testMongoUri, {
            serverSelectionTimeoutMS: 5000
        });
    });

    beforeEach(async () => {
        // Clean database before each test
        await User.deleteMany({});
    });

    afterAll(async () => {
        // Clean up and close connection
        try {
            await User.deleteMany({});
        } catch (error) {
            // Ignore errors during cleanup
        }
        await mongoose.connection.close();
    });

    describe('registerUser', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                username: 'newuser',
                name: 'New User',
                email: 'new@example.com',
                password: 'password123'
            };

            const result = await authService.registerUser(userData);

            expect(result.error).toBeUndefined();
            expect(result.user).toBeDefined();
            expect(result.user.email).toBe(userData.email);
            expect(result.user.username).toBe(userData.username);
            expect(result.accessToken).toBeDefined();
            expect(result.refreshToken).toBeDefined();
        });

        it('should not include password in response', async () => {
            const userData = {
                username: 'secureuser',
                email: 'secure@example.com',
                password: 'password123'
            };

            const result = await authService.registerUser(userData);

            expect(result.user.password).toBeUndefined();
        });

        it('should return error for duplicate email', async () => {
            const userData = {
                username: 'user1',
                email: 'duplicate@example.com',
                password: 'password123'
            };

            await authService.registerUser(userData);
            const result = await authService.registerUser({
                username: 'user2',
                email: 'duplicate@example.com',
                password: 'password456'
            });

            expect(result.error).toBe('conflict');
            expect(result.message).toContain('Email already exists');
        });

        it('should return error for duplicate username', async () => {
            await authService.registerUser({
                username: 'sameuser',
                email: 'user1@example.com',
                password: 'password123'
            });

            const result = await authService.registerUser({
                username: 'sameuser',
                email: 'user2@example.com',
                password: 'password456'
            });

            expect(result.error).toBe('conflict');
            expect(result.message).toContain('Username already exists');
        });

        it('should hash password before storing', async () => {
            const plainPassword = 'myPassword123';
            await authService.registerUser({
                username: 'hashtest',
                email: 'hash@example.com',
                password: plainPassword
            });

            const user = await User.findOne({ email: 'hash@example.com' }).select('+password');
            expect(user.password).not.toBe(plainPassword);
        });

        it('should generate valid JWT tokens', async () => {
            const result = await authService.registerUser({
                username: 'tokenuser',
                email: 'token@example.com',
                password: 'password123'
            });

            expect(result.accessToken).toBeDefined();
            expect(result.refreshToken).toBeDefined();
            expect(result.accessToken.split('.').length).toBe(3);
            expect(result.refreshToken.split('.').length).toBe(3);
        });

        it('should include virtual id in user response', async () => {
            const result = await authService.registerUser({
                username: 'iduser',
                email: 'iduser@example.com',
                password: 'password123'
            });

            expect(result.user.id).toBeDefined();
            expect(result.user._id).toBeUndefined();
        });

        it('should trim whitespace from username and email', async () => {
            const result = await authService.registerUser({
                username: '  spaceuser  ',
                email: '  space@example.com  ',
                password: 'password123'
            });

            expect(result.user.username).toBe('spaceuser');
            expect(result.user.email).toBe('space@example.com');
        });
    });

    describe('loginUser', () => {
        beforeEach(async () => {
            // Create test user
            await authService.registerUser({
                username: 'loginuser',
                email: 'login@example.com',
                password: 'password123'
            });
        });

        it('should login successfully with correct credentials', async () => {
            const result = await authService.loginUser({
                email: 'login@example.com',
                password: 'password123'
            });

            expect(result.error).toBeUndefined();
            expect(result.user).toBeDefined();
            expect(result.user.email).toBe('login@example.com');
            expect(result.accessToken).toBeDefined();
            expect(result.refreshToken).toBeDefined();
        });

        it('should update lastLogin on successful login', async () => {
            const beforeLogin = new Date();

            await authService.loginUser({
                email: 'login@example.com',
                password: 'password123'
            });

            const user = await User.findOne({ email: 'login@example.com' });
            expect(user.lastLogin).toBeDefined();
            expect(user.lastLogin.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
        });

        it('should return error for non-existent email', async () => {
            const result = await authService.loginUser({
                email: 'nonexistent@example.com',
                password: 'password123'
            });

            expect(result.error).toBe('unauthorized');
            expect(result.message).toBe('Invalid credentials');
        });

        it('should return error for incorrect password', async () => {
            const result = await authService.loginUser({
                email: 'login@example.com',
                password: 'wrongpassword'
            });

            expect(result.error).toBe('unauthorized');
            expect(result.message).toBe('Invalid credentials');
        });

        it('should not include password in response', async () => {
            const result = await authService.loginUser({
                email: 'login@example.com',
                password: 'password123'
            });

            expect(result.user.password).toBeUndefined();
        });

        it('should return same error message for invalid email and password', async () => {
            const emailResult = await authService.loginUser({
                email: 'fake@example.com',
                password: 'password123'
            });

            const passwordResult = await authService.loginUser({
                email: 'login@example.com',
                password: 'wrongpass'
            });

            // Both should return same message to prevent enumeration attacks
            expect(emailResult.message).toBe(passwordResult.message);
        });

        it('should generate valid JWT tokens on login', async () => {
            const result = await authService.loginUser({
                email: 'login@example.com',
                password: 'password123'
            });

            expect(result.accessToken.split('.').length).toBe(3);
            expect(result.refreshToken.split('.').length).toBe(3);
        });

        it('should not include _id or __v in response', async () => {
            const result = await authService.loginUser({
                email: 'login@example.com',
                password: 'password123'
            });

            expect(result.user._id).toBeUndefined();
            expect(result.user.__v).toBeUndefined();
        });

        it('should include virtual id in user response', async () => {
            const result = await authService.loginUser({
                email: 'login@example.com',
                password: 'password123'
            });

            expect(result.user.id).toBeDefined();
        });
    });

    describe('refreshAccessToken', () => {
        let validRefreshToken;
        let userId;

        beforeEach(async () => {
            const result = await authService.registerUser({
                username: 'refreshuser',
                email: 'refresh@example.com',
                password: 'password123'
            });

            validRefreshToken = result.refreshToken;
            userId = result.user.id;
        });

        it('should generate new access token with valid refresh token', async () => {
            const result = await authService.refreshAccessToken(validRefreshToken);

            expect(result.error).toBeUndefined();
            expect(result.accessToken).toBeDefined();
            expect(typeof result.accessToken).toBe('string');
        });

        it('should return error for invalid refresh token', async () => {
            const result = await authService.refreshAccessToken('invalid.token.here');

            expect(result.error).toBe('unauthorized');
            expect(result.message).toContain('Invalid or expired');
        });

        it('should return error for refresh token of deleted user', async () => {
            await User.findByIdAndDelete(userId);

            const result = await authService.refreshAccessToken(validRefreshToken);

            expect(result.error).toBe('unauthorized');
            expect(result.message).toBe('User not found');
        });

        it('should generate valid JWT access token structure', async () => {
            const result = await authService.refreshAccessToken(validRefreshToken);

            expect(result.accessToken.split('.').length).toBe(3);
        });

        it('should return error for empty refresh token', async () => {
            const result = await authService.refreshAccessToken('');

            expect(result.error).toBe('unauthorized');
        });

        it('should return error for malformed refresh token', async () => {
            const result = await authService.refreshAccessToken('notajwttoken');

            expect(result.error).toBe('unauthorized');
        });

        it('should include userId and email in new access token payload', async () => {
            const result = await authService.refreshAccessToken(validRefreshToken);

            const decoded = JSON.parse(Buffer.from(result.accessToken.split('.')[1], 'base64').toString());

            expect(decoded.userId).toBeDefined();
            expect(decoded.email).toBe('refresh@example.com');
        });
    });
});
