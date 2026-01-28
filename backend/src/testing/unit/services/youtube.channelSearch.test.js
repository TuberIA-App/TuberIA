import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { searchChannel } from '../../../services/youtube/channelSearch.service.js';
import { BadRequestError, NotFoundError } from '../../../utils/errorClasses.util.js';
import Channel from '../../../model/Channel.js';

describe('YouTube Channel Search Service - Integration Tests', () => {
    beforeAll(async () => {
        // Connect to test database
        const testMongoUri = process.env.MONGODB_TEST_URI
            ?.replace('tuberia-test', 'tuberia-test-channel-search')
            || 'mongodb://mongo:mongo@mongo:27017/tuberia-test-channel-search?authSource=admin';

        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }

        await mongoose.connect(testMongoUri, {
            serverSelectionTimeoutMS: 5000
        });
    });

    afterAll(async () => {
        // Clean up test channels
        await Channel.deleteMany({ channelId: 'UCam8T03EOFBsNdR0thrFHdQ' });
        await mongoose.connection.close();
    });

    describe('searchChannel', () => {
        it('should return valid channel info for a real YouTube channel URL', async () => {
            const url = 'https://youtube.com/@vegetta777';
            const result = await searchChannel(url);

            // Verificar estructura de la respuesta
            expect(result).toBeDefined();
            expect(result).toHaveProperty('_id');
            expect(result).toHaveProperty('channelId');
            expect(result).toHaveProperty('name');
            expect(result).toHaveProperty('username');
            expect(result).toHaveProperty('thumbnail');
            expect(result).toHaveProperty('description');
            expect(result).toHaveProperty('followersCount');

            // Verificar tipos
            expect(typeof result._id).toBe('string');
            expect(typeof result.channelId).toBe('string');
            expect(typeof result.name).toBe('string');
            expect(typeof result.followersCount).toBe('number');
            expect(result.channelId.length).toBeGreaterThan(0);
            expect(result.name.length).toBeGreaterThan(0);

            // Verificar que el channelId sea el esperado para @vegetta777
            expect(result.channelId).toBe('UCam8T03EOFBsNdR0thrFHdQ');
        }, 30000); // Timeout de 30 segundos para requests reales

        it('should return valid channel info for a username with @', async () => {
            const username = '@vegetta777';
            const result = await searchChannel(username);

            expect(result).toBeDefined();
            expect(result.channelId).toBe('UCam8T03EOFBsNdR0thrFHdQ');
            expect(result.name).toBeDefined();
            expect(result.username).toBe('@vegetta777');
        }, 30000);

        it('should return valid channel info for a username without @', async () => {
            const username = 'vegetta777';
            const result = await searchChannel(username);

            expect(result).toBeDefined();
            expect(result.channelId).toBe('UCam8T03EOFBsNdR0thrFHdQ');
            expect(result.username).toBe('@vegetta777');
        }, 30000);

        it('should throw BadRequestError for empty input', async () => {
            await expect(searchChannel(''))
                .rejects.toThrow(BadRequestError);
        });

        it('should throw BadRequestError for null input', async () => {
            await expect(searchChannel(null))
                .rejects.toThrow(BadRequestError);
        });

        it('should throw BadRequestError for undefined input', async () => {
            await expect(searchChannel(undefined))
                .rejects.toThrow(BadRequestError);
        });

        it('should throw BadRequestError for invalid URL', async () => {
            await expect(searchChannel('https://notayoutubeurl.com'))
                .rejects.toThrow(BadRequestError);
        }, 20000);

        it('should throw NotFoundError for non-existent channel', async () => {
            const fakeUsername = '@thischanneldoesnotexist123456789';
            
            await expect(searchChannel(fakeUsername))
                .rejects.toThrow(NotFoundError);
        }, 20000);

        it('should return null for description (not available in RSS feed)', async () => {
            const url = 'https://youtube.com/@vegetta777';
            const result = await searchChannel(url);

            expect(result.description).toBeNull();
        }, 30000);

        it('should return thumbnail if available from feed', async () => {
            const url = 'https://youtube.com/@vegetta777';
            const result = await searchChannel(url);

            // Thumbnail may be null if the channel has no videos
            // but if it has videos, it should be a valid URL
            if (result.thumbnail) {
                expect(typeof result.thumbnail).toBe('string');
                expect(result.thumbnail).toMatch(/^https?:\/\//);
            }
        }, 30000);
    });
});