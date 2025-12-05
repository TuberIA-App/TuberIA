import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import User from '../../../model/User.js';

describe('User Model', () => {
    beforeAll(async () => {
        // Connect to test database with authentication
        const testMongoUri = process.env.MONGODB_TEST_URI || 'mongodb://mongo:mongo@mongo:27017/tuberia-test?authSource=admin';

        // Close any existing connections
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }

        await mongoose.connect(testMongoUri, {
            serverSelectionTimeoutMS: 5000
        });

        // Ensure indexes are created (critical for unique constraint tests)
        await User.syncIndexes();
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

    describe('Schema Validation', () => {
        it('should create a user with valid data', async () => {
            const userData = {
                username: 'testuser',
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };

            const user = new User(userData);
            await user.save();

            expect(user._id).toBeDefined();
            expect(user.username).toBe(userData.username);
            expect(user.email).toBe(userData.email);
            expect(user.password).not.toBe(userData.password);
        });

        it('should require username', async () => {
            const user = new User({
                email: 'test2@example.com',
                password: 'password123'
            });

            await expect(user.save()).rejects.toThrow();
        });

        it('should require email', async () => {
            const user = new User({
                username: 'testuser2',
                password: 'password123'
            });

            await expect(user.save()).rejects.toThrow();
        });

        it('should enforce unique email', async () => {
            const userData = {
                username: 'user1',
                email: 'duplicate@example.com',
                password: 'password123'
            }

            await User.create(userData);

            const duplicateUser = new User({
                username: 'user2',
                email: 'duplicate@example.com',
                password: 'password456'
            });

            await expect(duplicateUser.save()).rejects.toThrow();
        });

        it('should require password', async () => {
            const user = new User({
                username: 'testuser3',
                email: 'test3@example.com'
            });

            await expect(user.save()).rejects.toThrow();
        });

        it('should enforce unique username', async () => {
            await User.create({
                username: 'uniqueuser',
                email: 'unique1@example.com',
                password: 'password123'
            });

            const duplicateUser = new User({
                username: 'uniqueuser',
                email: 'unique2@example.com',
                password: 'password456'
            });

            await expect(duplicateUser.save()).rejects.toThrow();
        });

        it('should trim whitespace from username and email', async () => {
            const user = await User.create({
                username: '  trimuser  ',
                email: '  trim@example.com  ',
                password: 'password123'
            });

            expect(user.username).toBe('trimuser');
            expect(user.email).toBe('trim@example.com');
        });

        it('should lowercase email', async () => {
            const user = await User.create({
                username: 'caseuser',
                email: 'UPPERCASE@EXAMPLE.COM',
                password: 'password123'
            });

            expect(user.email).toBe('uppercase@example.com');
        });

        it('should reject invalid email format', async () => {
            const user = new User({
                username: 'invalidemailuser',
                email: 'notanemail',
                password: 'password123'
            });

            await expect(user.save()).rejects.toThrow();
        });

        it('should enforce minimum password length', async () => {
            const user = new User({
                username: 'shortpass',
                email: 'short@example.com',
                password: 'short'
            });

            await expect(user.save()).rejects.toThrow();
        });

        it('should allow name field to be optional', async () => {
            const user = await User.create({
                username: 'noname',
                email: 'noname@example.com',
                password: 'password123'
            });

            expect(user.name).toBeUndefined();
        });

        it('should save name field when provided', async () => {
            const user = await User.create({
                username: 'withname',
                name: 'John Doe',
                email: 'withname@example.com',
                password: 'password123'
            });

            expect(user.name).toBe('John Doe');
        });

        it('should allow lastLogin to be set', async () => {
            const loginDate = new Date();
            const user = await User.create({
                username: 'loginuser',
                email: 'login@example.com',
                password: 'password123',
                lastLogin: loginDate
            });

            expect(user.lastLogin).toBeDefined();
            expect(user.lastLogin).toBeInstanceOf(Date);
        });
    });

    describe('Password Hashing', () => {
        it('should hash password before saving', async () => {
            const plainPassword = 'mySecretPassword123';
            const user = await User.create({
                username: 'hashuser',
                email: 'hash@example.com',
                password: plainPassword
            });

            expect(user.password).not.toBe(plainPassword);
            expect(user.password.startsWith('$2')).toBe(true); // bcrypt hash format
        });

        it('should not rehash password if not modified', async () => {
            const user = await User.create({
                username: 'norehash',
                email: 'norehash@example.com',
                password: 'password123'
            });

            const originalHash = user.password;
            user.name = 'Updated Name';
            await user.save();

            expect(user.password).toBe(originalHash);
        });

        it('should not include password by default when querying (select: false)', async () => {
            await User.create({
                username: 'selecttest',
                email: 'select@example.com',
                password: 'password123'
            });

            const user = await User.findOne({ username: 'selecttest' });

            expect(user.password).toBeUndefined();
        });

        it('should include password when explicitly selected', async () => {
            await User.create({
                username: 'explicitselect',
                email: 'explicitselect@example.com',
                password: 'password123'
            });

            const user = await User.findOne({ username: 'explicitselect' }).select('+password');

            expect(user.password).toBeDefined();
            expect(user.password.startsWith('$2')).toBe(true);
        });
    });

    describe('comparePassword method', () => {
        it('should return true for correct password', async () => {
            const plainPassword = 'correctPassword123';
            const user = await User.create({
                username: 'compareuser',
                email: 'compare@example.com',
                password: plainPassword
            });

            const isMatch = await user.comparePassword(plainPassword);
            expect(isMatch).toBe(true);
        });

        it('should return false for incorrect password', async () => {
            const user = await User.create({
                username: 'wrongpass',
                email: 'wrong@example.com',
                password: 'correctPassword123'
            });

            const isMatch = await user.comparePassword('wrongPassword456');
            expect(isMatch).toBe(false);
        });
    });

    describe('generateAuthTokens method', () => {
        it('should generate access and refresh tokens', async () => {
            const user = await User.create({
                username: 'tokenuser',
                email: 'token@example.com',
                password: 'password123'
            });

            const tokens = user.generateAuthTokens();

            expect(tokens).toHaveProperty('accessToken');
            expect(tokens).toHaveProperty('refreshToken');
            expect(typeof tokens.accessToken).toBe('string');
            expect(typeof tokens.refreshToken).toBe('string');
        });

        it('should include userId and email in access token', async () => {
            const user = await User.create({
                username: 'payloaduser',
                email: 'payload@example.com',
                password: 'password123'
            });

            const { accessToken } = user.generateAuthTokens();
            const decoded = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());

            expect(decoded.userId).toBe(user._id.toString());
            expect(decoded.email).toBe(user.email);
        });

        it('should include only userId in refresh token', async () => {
            const user = await User.create({
                username: 'refreshuser',
                email: 'refresh@example.com',
                password: 'password123'
            });

            const { refreshToken } = user.generateAuthTokens();
            const decoded = JSON.parse(Buffer.from(refreshToken.split('.')[1], 'base64').toString());

            expect(decoded.userId).toBe(user._id.toString());
            expect(decoded.email).toBeUndefined();
        });

        it('should generate valid JWT tokens with proper structure', async () => {
            const user = await User.create({
                username: 'jwtuser',
                email: 'jwt@example.com',
                password: 'password123'
            });

            const { accessToken, refreshToken } = user.generateAuthTokens();

            // JWT tokens should have 3 parts separated by dots
            expect(accessToken.split('.').length).toBe(3);
            expect(refreshToken.split('.').length).toBe(3);
        });

        it('should include standard JWT claims (iss, exp, iat)', async () => {
            const user = await User.create({
                username: 'claimsuser',
                email: 'claims@example.com',
                password: 'password123'
            });

            const { accessToken } = user.generateAuthTokens();
            const decoded = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());

            expect(decoded.iss).toBe('tuberia-api');
            expect(decoded.exp).toBeDefined();
            expect(decoded.iat).toBeDefined();
            expect(decoded.exp).toBeGreaterThan(decoded.iat);
        });
    });

    describe('Timestamps', () => {
        it('should add createdAt and updatedAt timestamps', async () => {
            const user = await User.create({
                username: 'timestampuser',
                email: 'timestamp@example.com',
                password: 'password123'
            });

            expect(user.createdAt).toBeDefined();
            expect(user.updatedAt).toBeDefined();
            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.updatedAt).toBeInstanceOf(Date);
        });

        it('should update updatedAt when document is modified', async () => {
            const user = await User.create({
                username: 'updatetime',
                email: 'updatetime@example.com',
                password: 'password123'
            });

            const originalUpdatedAt = user.updatedAt;

            // Wait a bit to ensure different timestamp
            await new Promise(resolve => setTimeout(resolve, 10));

            user.name = 'Updated Name';
            await user.save();

            expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        });

        it('should not change createdAt when document is modified', async () => {
            const user = await User.create({
                username: 'createtime',
                email: 'createtime@example.com',
                password: 'password123'
            });

            const originalCreatedAt = user.createdAt;

            user.name = 'Updated Name';
            await user.save();

            expect(user.createdAt.getTime()).toBe(originalCreatedAt.getTime());
        });
    });

    describe('Virtual id field and toJSON transform', () => {
        it('should include virtual id in toJSON', async () => {
            const user = await User.create({
                username: 'virtualuser',
                email: 'virtual@example.com',
                password: 'password123'
            });

            const json = user.toJSON();

            expect(json.id).toBeDefined();
            expect(json.id).toBe(user._id.toString());
            expect(json._id).toBeUndefined(); // Should not include _id
        });

        it('should not include password in toJSON', async () => {
            const user = await User.create({
                username: 'jsonuser',
                email: 'json@example.com',
                password: 'password123'
            });

            const json = user.toJSON();

            expect(json.password).toBeUndefined();
        });

        it('should not include __v (version key) in toJSON', async () => {
            const user = await User.create({
                username: 'versionuser',
                email: 'version@example.com',
                password: 'password123'
            });

            const json = user.toJSON();

            expect(json.__v).toBeUndefined();
        });

        it('should include all other fields in toJSON', async () => {
            const user = await User.create({
                username: 'fulluser',
                name: 'Full User',
                email: 'full@example.com',
                password: 'password123'
            });

            const json = user.toJSON();

            expect(json.id).toBeDefined();
            expect(json.username).toBe('fulluser');
            expect(json.name).toBe('Full User');
            expect(json.email).toBe('full@example.com');
            expect(json.createdAt).toBeDefined();
            expect(json.updatedAt).toBeDefined();
            // Should NOT have
            expect(json._id).toBeUndefined();
            expect(json.password).toBeUndefined();
            expect(json.__v).toBeUndefined();
        });

        it('should access virtual id field directly', async () => {
            const user = await User.create({
                username: 'directid',
                email: 'directid@example.com',
                password: 'password123'
            });

            expect(user.id).toBe(user._id.toString());
        });
    });
});
