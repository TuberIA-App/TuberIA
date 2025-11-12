import { describe, it, expect, beforeAll } from 'vitest';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../../../utils/jwt.util.js';

describe('JWT Utilities', () => {
   let testPayload;
   let accessToken;
   let refreshToken; 

   beforeAll(() => {

    // Here we define the ENV variables for JWT since vitest doesn't load the env automatically, so we need to load them here, otherwise tests would fail.
    process.env.JWT_SECRET = 'your-super-secret-jwt-key-must-be-at-least-32-characters-long-please-change-this';
    process.env.JWT_REFRESH_SECRET = 'your-super-secret-refresh-key-must-be-at-least-32-characters-long-change-this-too';

    testPayload = {
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com'
    };
   });

   describe('generateAccessToken', () => {
        it('should generate a valid access token', () => {
            accessToken = generateAccessToken(testPayload);

            expect(accessToken).toBeDefined();
            expect(typeof accessToken).toBe('string');
            expect(accessToken.split('.')).toHaveLength(3); // JWT format: header.payload.signature
        });

        it('should include userId and email in payload', () => {
            const token = generateAccessToken(testPayload);
            const decoded = verifyAccessToken(token);

            expect(decoded.userId).toBe(testPayload.userId);
            expect(decoded.email).toBe(testPayload.email);
        });

        it('should include issuer in token', () => {
            const token = generateAccessToken(testPayload);
            const decoded = verifyAccessToken(token);

            expect(decoded.iss).toBe('tuberia-api');
        });
    });

    describe('generateRefreshToken', () => {
        it('should generate a valid refresh token', () => {
            refreshToken = generateRefreshToken({ userId: testPayload.userId });
            
            expect(refreshToken).toBeDefined();
            expect(typeof refreshToken).toBe('string');
            expect(refreshToken.split('.')).toHaveLength(3);

        });

        it('should includ userId in payload', () => {
            const token = generateRefreshToken({ userId: testPayload.userId });
            const decoded = verifyRefreshToken(token);

            expect(decoded.userId).toBe(testPayload.userId);
        });
    });


    describe('verifyAccessToken', () => {
        it('should verify and decode a valid access token', () => {
            const token = generateAccessToken(testPayload);
            const decoded = verifyAccessToken(token);

            expect(decoded.userId).toBe(testPayload.userId);
            expect(decoded.email).toBe(testPayload.email);
        });

        it('should throw error for invalid token', () => {
            const invalidToken = 'invalid.token.here';
            expect(() => verifyAccessToken(invalidToken)).toThrow();
        });

        it('should throw error for malformed token', () => {
            const invalidToken = 'not-a-jwt'
            expect(() => verifyAccessToken(invalidToken)).toThrow();
        })
    });

    describe('verifyRefreshToken', () => {
        it('should verify and decode a valid refresh', () => {
            const token = generateRefreshToken({ userId: testPayload.userId });
            const decoded = verifyRefreshToken(token);

            expect(decoded.userId).toBe(testPayload.userId);
        });

        it('should throw error for invalid refresh token', () => {
            const invalidToken = 'invalid.refresh.tokeen';

            expect(() => verifyRefreshToken(invalidToken)).toThrow();
        });
    });

    describe('Token expiration', () => {
        it('should have exp field in access token', () => {
            const token = generateAccessToken(testPayload);
            const decoded = verifyAccessToken(token);

            expect(decoded.exp).toBeDefined();
            expect(typeof decoded.exp).toBe('number');
        });

        it('should have exp field in refresh token', () => {
            const token = generateRefreshToken({ userId: testPayload.userId });
            const decoded = verifyRefreshToken(token);

            expect(decoded.exp).toBeDefined();
            expect(typeof decoded.exp).toBe('number');
        });
    });

});