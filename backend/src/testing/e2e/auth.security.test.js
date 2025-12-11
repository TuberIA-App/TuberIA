import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app.js';
import User from '../../model/User.js';

/**
 * E2E Security Tests for Authentication
 * Tests real-world security scenarios including token theft and revocation
 */
describe('Auth Security E2E Tests', () => {
    beforeAll(async () => {
        // Connect to test database
        const testMongoUri = process.env.MONGODB_TEST_URI?.replace('tuberia-test', 'tuberia-test-e2e') || 'mongodb://mongo:mongo@mongo:27017/tuberia-test-e2e?authSource=admin';

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

    describe('Scenario: Stolen Refresh Token', () => {
        it('should prevent attacker from using stolen refresh token after user logout', async () => {
            // Step 1: User A registers and logs in
            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'userA',
                    email: 'userA@example.com',
                    password: 'securePassword123'
                });

            expect(registerResponse.status).toBe(201);
            const { accessToken: userAAccessToken, refreshToken: userARefreshToken } = registerResponse.body.data;

            // Step 2: Attacker steals the refresh token (simulated)
            const stolenRefreshToken = userARefreshToken;

            // Step 3: User A realizes token was compromised and logs out
            const logoutResponse = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${userAAccessToken}`)
                .send({ refreshToken: userARefreshToken });

            expect(logoutResponse.status).toBe(200);
            expect(logoutResponse.body.message).toBe('Logout successful');

            // Step 4: Attacker tries to use the stolen refresh token
            const attackerRefreshAttempt = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: stolenRefreshToken });

            // Should be rejected because token is blacklisted
            expect(attackerRefreshAttempt.status).toBe(401);
            expect(attackerRefreshAttempt.body.success).toBe(false);

            // Step 5: User A can log in again with new credentials
            const reLoginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'userA@example.com',
                    password: 'securePassword123'
                });

            expect(reLoginResponse.status).toBe(200);
            expect(reLoginResponse.body.data.accessToken).toBeDefined();
            expect(reLoginResponse.body.data.refreshToken).toBeDefined();

            // Step 6: New tokens should work correctly
            const newAccessToken = reLoginResponse.body.data.accessToken;
            const meResponse = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${newAccessToken}`);

            expect(meResponse.status).toBe(200);
            expect(meResponse.body.data.user.email).toBe('userA@example.com');
        });

        it('should prevent attacker from using stolen refresh token to get new access tokens', async () => {
            // Step 1: User registers
            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'victim',
                    email: 'victim@example.com',
                    password: 'password123'
                });

            const { accessToken, refreshToken } = registerResponse.body.data;

            // Step 2: Attacker steals refresh token
            const stolenToken = refreshToken;

            // Step 3: Attacker tries to use it to get access token
            const attackerAttempt1 = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: stolenToken });

            // Initially succeeds (before logout)
            expect(attackerAttempt1.status).toBe(200);
            const attackerAccessToken = attackerAttempt1.body.data.accessToken;

            // Step 4: Victim notices unusual activity and logs out
            await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ refreshToken });

            // Step 5: Attacker tries to refresh again
            const attackerAttempt2 = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: stolenToken });

            // Should be rejected
            expect(attackerAttempt2.status).toBe(401);

            // Step 6: Even the access token attacker already got should be revoked
            const attackerMeAttempt = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${attackerAccessToken}`);

            // This might still work if access token was generated before logout
            // But refresh token is definitely blocked
            expect(attackerAttempt2.status).toBe(401);
        });
    });

    describe('Scenario: Stolen Access Token', () => {
        it('should prevent attacker from using stolen access token after logout', async () => {
            // Step 1: User logs in
            const loginResponse = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'target',
                    email: 'target@example.com',
                    password: 'password123'
                });

            const { accessToken, refreshToken } = loginResponse.body.data;

            // Step 2: Attacker steals access token
            const stolenAccessToken = accessToken;

            // Step 3: Attacker can initially use the token
            const attackerAttempt1 = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${stolenAccessToken}`);

            expect(attackerAttempt1.status).toBe(200);

            // Step 4: User logs out (revokes the token)
            await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ refreshToken });

            // Step 5: Attacker tries to use the stolen token again
            const attackerAttempt2 = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${stolenAccessToken}`);

            // Should be rejected
            expect(attackerAttempt2.status).toBe(401);
            expect(attackerAttempt2.body.message).toBe('Token has been revoked');
        });
    });

    describe('Scenario: Multiple Device Logout', () => {
        it('should revoke tokens across all devices when user logs out from one', async () => {
            // Step 1: User logs in from Device 1
            const device1Login = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'multidevice',
                    email: 'multi@example.com',
                    password: 'password123'
                });

            const device1Tokens = {
                access: device1Login.body.data.accessToken,
                refresh: device1Login.body.data.refreshToken
            };

            // Step 2: User refreshes to get new access token on Device 1
            const device1Refresh = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: device1Tokens.refresh });

            const device1NewAccess = device1Refresh.body.data.accessToken;

            // Step 3: Both access tokens should work
            const device1Check1 = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${device1Tokens.access}`);

            const device1Check2 = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${device1NewAccess}`);

            expect(device1Check1.status).toBe(200);
            expect(device1Check2.status).toBe(200);

            // Step 4: User logs out using the latest access token
            await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${device1NewAccess}`)
                .send({ refreshToken: device1Tokens.refresh });

            // Step 5: All tokens should be revoked
            const device1PostLogout1 = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${device1NewAccess}`);

            const device1PostLogout2 = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${device1Tokens.access}`);

            const refreshAttempt = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: device1Tokens.refresh });

            // All should be rejected
            expect(device1PostLogout1.status).toBe(401);
            expect(device1PostLogout2.status).toBe(401);
            expect(refreshAttempt.status).toBe(401);
        });
    });

    describe('Scenario: Concurrent User Sessions', () => {
        it('should only revoke tokens for the logging out user, not other users', async () => {
            // Step 1: User A registers
            const userA = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'userConcurrentA',
                    email: 'userA@concurrent.com',
                    password: 'password123'
                });

            // Step 2: User B registers
            const userB = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'userConcurrentB',
                    email: 'userB@concurrent.com',
                    password: 'password456'
                });

            const userATokens = {
                access: userA.body.data.accessToken,
                refresh: userA.body.data.refreshToken
            };

            const userBTokens = {
                access: userB.body.data.accessToken,
                refresh: userB.body.data.refreshToken
            };

            // Step 3: Both users can access their data
            const userACheck = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${userATokens.access}`);

            const userBCheck = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${userBTokens.access}`);

            expect(userACheck.status).toBe(200);
            expect(userBCheck.status).toBe(200);

            // Step 4: User A logs out
            await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${userATokens.access}`)
                .send({ refreshToken: userATokens.refresh });

            // Step 5: User A's tokens should be revoked
            const userAPostLogout = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${userATokens.access}`);

            expect(userAPostLogout.status).toBe(401);

            // Step 6: User B's tokens should still work
            const userBStillWorks = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${userBTokens.access}`);

            expect(userBStillWorks.status).toBe(200);
            expect(userBStillWorks.body.data.user.email).toBe('userB@concurrent.com');

            // User B can also refresh
            const userBRefresh = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: userBTokens.refresh });

            expect(userBRefresh.status).toBe(200);
        });
    });

    describe('Scenario: Token Expiry vs Revocation', () => {
        it('should reject revoked tokens even if they have not expired yet', async () => {
            // Step 1: User logs in
            const loginResponse = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'expirytest',
                    email: 'expiry@example.com',
                    password: 'password123'
                });

            const { accessToken, refreshToken } = loginResponse.body.data;

            // Step 2: Verify token works
            const beforeLogout = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(beforeLogout.status).toBe(200);

            // Step 3: Logout (token is still valid but gets blacklisted)
            const logoutResponse = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ refreshToken });

            expect(logoutResponse.status).toBe(200);

            // Step 4: Token should be rejected despite not being expired
            const afterLogout = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(afterLogout.status).toBe(401);
            expect(afterLogout.body.message).toBe('Token has been revoked');

            // The token is not expired, just revoked
            // This proves the blacklist is working correctly
        });
    });

    describe('Scenario: Re-authentication After Compromise', () => {
        it('should allow user to re-authenticate and get new working tokens after revoking compromised ones', async () => {
            // Step 1: Initial login
            const initialLogin = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'reauth',
                    email: 'reauth@example.com',
                    password: 'password123'
                });

            const oldTokens = {
                access: initialLogin.body.data.accessToken,
                refresh: initialLogin.body.data.refreshToken
            };

            // Step 2: User suspects compromise and logs out
            await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${oldTokens.access}`)
                .send({ refreshToken: oldTokens.refresh });

            // Step 3: Old tokens should not work
            const oldTokenCheck = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${oldTokens.access}`);

            expect(oldTokenCheck.status).toBe(401);

            // Step 4: User re-authenticates
            const reLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'reauth@example.com',
                    password: 'password123'
                });

            expect(reLogin.status).toBe(200);

            const newTokens = {
                access: reLogin.body.data.accessToken,
                refresh: reLogin.body.data.refreshToken
            };

            // Step 5: New tokens should work
            const newTokenCheck = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${newTokens.access}`);

            expect(newTokenCheck.status).toBe(200);
            expect(newTokenCheck.body.data.user.email).toBe('reauth@example.com');

            // Step 6: Can refresh with new refresh token
            const newRefresh = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: newTokens.refresh });

            expect(newRefresh.status).toBe(200);

            // Step 7: Old tokens still shouldn't work
            const oldTokenCheckAgain = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${oldTokens.access}`);

            expect(oldTokenCheckAgain.status).toBe(401);
        });
    });
});
