import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import User from '../../../model/User.js';

describe('User Model', () => {
    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tuberia-test');
    });

    beforeEach(async () => {
        // Clean database before each test
        await User.deleteMany({});
    });

    afterAll(async () => {
        // Clean up and close connection
        await User.deleteMany({});
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
    });

    describe('Virtual id field', () => {
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
    });
});
