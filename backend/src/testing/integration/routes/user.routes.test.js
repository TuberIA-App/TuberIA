import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import User from '../../../model/User.js';
import Channel from '../../../model/Channel.js';
import UserChannel from '../../../model/UserChannel.js';
import Video from '../../../model/Video.js';

describe('User Routes Integration Tests', () => {
    beforeAll(async () => {
        // Connect to test database
        const testMongoUri = process.env.MONGODB_TEST_URI
            ?.replace('tuberia-test', 'tuberia-test-user-routes')
            || 'mongodb://mongo:mongo@mongo:27017/tuberia-test-user-routes?authSource=tuberia_db';

        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }

        await mongoose.connect(testMongoUri, {
            serverSelectionTimeoutMS: 5000
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    /**
     * GET /api/users/me/stats Tests
     */
    describe('GET /api/users/me/stats', () => {
        let authToken;
        let userId;
        let channel1Id, channel2Id;

        beforeEach(async () => {
            // Create test user and login
            const user = await User.create({
                username: 'userstatstest',
                name: 'User Stats Test',
                email: 'userstatstest@test.com',
                password: 'password123'
            });
            userId = user._id;

            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'userstatstest@test.com',
                    password: 'password123'
                });

            authToken = loginRes.body.data.accessToken;

            // Create test channels
            const channel1 = await Channel.create({
                channelId: 'UCstats-test-1',
                name: 'Stats Test Channel 1',
                username: 'statstestchannel1',
                followersCount: 1
            });
            channel1Id = channel1._id;

            const channel2 = await Channel.create({
                channelId: 'UCstats-test-2',
                name: 'Stats Test Channel 2',
                username: 'statstestchannel2',
                followersCount: 1
            });
            channel2Id = channel2._id;

            // Create UserChannel relationships
            await UserChannel.create([
                { userId, channelId: channel1Id },
                { userId, channelId: channel2Id }
            ]);

            // Create test videos (mix of completed and pending)
            await Video.create([
                {
                    videoId: 'statsvid001',
                    title: 'Stats Test Video 1',
                    url: 'https://youtube.com/watch?v=statsvid001',
                    channelId: channel1Id,
                    publishedAt: new Date(),
                    status: 'completed',
                    summary: 'Summary 1',
                    keyPoints: ['Point 1']
                },
                {
                    videoId: 'statsvid002',
                    title: 'Stats Test Video 2',
                    url: 'https://youtube.com/watch?v=statsvid002',
                    channelId: channel2Id,
                    publishedAt: new Date(),
                    status: 'completed',
                    summary: 'Summary 2',
                    keyPoints: ['Point 2']
                },
                {
                    videoId: 'statsvid003',
                    title: 'Stats Test Video 3 (Pending)',
                    url: 'https://youtube.com/watch?v=statsvid003',
                    channelId: channel1Id,
                    publishedAt: new Date(),
                    status: 'pending'
                }
            ]);
        });

        afterEach(async () => {
            await User.deleteMany({ email: 'userstatstest@test.com' });
            await Channel.deleteMany({ channelId: { $in: ['UCstats-test-1', 'UCstats-test-2'] } });
            await UserChannel.deleteMany({ userId });
            await Video.deleteMany({ videoId: { $in: ['statsvid001', 'statsvid002', 'statsvid003'] } });
        });

        it('should return user stats for authenticated user', async () => {
            const response = await request(app)
                .get('/api/users/me/stats')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('summariesRead');
            expect(response.body.data).toHaveProperty('timeSaved');
            expect(response.body.data).toHaveProperty('followedChannels');
            expect(response.body.data.summariesRead).toBe(2); // 2 completed videos
            expect(response.body.data.followedChannels).toBe(2); // 2 followed channels
            expect(response.body.data.timeSaved).toBe('16m'); // 2 videos * 8 min = 16m
        });

        it('should return zero stats for new user with no channels', async () => {
            // Create a new user with no followed channels
            const newUser = await User.create({
                username: 'newstatsuser',
                name: 'New Stats User',
                email: 'newstatsuser@test.com',
                password: 'password123'
            });

            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'newstatsuser@test.com',
                    password: 'password123'
                });

            const newToken = loginRes.body.data.accessToken;

            const response = await request(app)
                .get('/api/users/me/stats')
                .set('Authorization', `Bearer ${newToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.summariesRead).toBe(0);
            expect(response.body.data.followedChannels).toBe(0);
            expect(response.body.data.timeSaved).toBe('0m');

            // Cleanup
            await User.deleteOne({ _id: newUser._id });
        });

        it('should calculate time saved correctly for many videos', async () => {
            // Create 10 more completed videos (total 12 completed)
            const moreVideos = Array.from({ length: 10 }, (_, i) => ({
                videoId: `statsmore${i}`,
                title: `More Stats Video ${i}`,
                url: `https://youtube.com/watch?v=statsmore${i}`,
                channelId: channel1Id,
                publishedAt: new Date(),
                status: 'completed',
                summary: 'Summary',
                keyPoints: ['Point']
            }));

            await Video.create(moreVideos);

            const response = await request(app)
                .get('/api/users/me/stats')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.summariesRead).toBe(12); // 2 + 10
            expect(response.body.data.timeSaved).toBe('1h 36m'); // 12 * 8 = 96 minutes = 1h 36m

            // Cleanup
            await Video.deleteMany({ videoId: { $regex: /^statsmore/ } });
        });

        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .get('/api/users/me/stats');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should only count completed videos, not pending/processing/failed', async () => {
            // Create videos with different statuses
            await Video.create([
                {
                    videoId: 'statstest1',
                    title: 'Processing Video',
                    url: 'https://youtube.com/watch?v=statstest1',
                    channelId: channel1Id,
                    publishedAt: new Date(),
                    status: 'processing'
                },
                {
                    videoId: 'statstest2',
                    title: 'Failed Video',
                    url: 'https://youtube.com/watch?v=statstest2',
                    channelId: channel1Id,
                    publishedAt: new Date(),
                    status: 'failed'
                }
            ]);

            const response = await request(app)
                .get('/api/users/me/stats')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.summariesRead).toBe(2); // Still only 2 completed

            // Cleanup
            await Video.deleteMany({ videoId: { $in: ['statstest1', 'statstest2'] } });
        });
    });

    /**
     * GET /api/users/me/channels Tests
     */
    describe('GET /api/users/me/channels', () => {
        let authToken;
        let userId;
        let channel1Id, channel2Id;

        beforeEach(async () => {
            // Create test user and login
            const user = await User.create({
                username: 'mychannelstest',
                name: 'My Channels Test',
                email: 'mychannelstest@test.com',
                password: 'password123'
            });
            userId = user._id;

            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'mychannelstest@test.com',
                    password: 'password123'
                });

            authToken = loginRes.body.data.accessToken;

            // Create test channels
            const channel1 = await Channel.create({
                channelId: 'UCmychannels-1',
                name: 'My Channels Test 1',
                username: 'mychannelstest1',
                followersCount: 1,
                thumbnail: 'https://example.com/thumb1.jpg',
                description: 'Test channel 1 description'
            });
            channel1Id = channel1._id;

            const channel2 = await Channel.create({
                channelId: 'UCmychannels-2',
                name: 'My Channels Test 2',
                username: 'mychannelstest2',
                followersCount: 5
            });
            channel2Id = channel2._id;

            // Create UserChannel relationships
            await UserChannel.create([
                { userId, channelId: channel1Id, subscribedAt: new Date('2025-01-01') },
                { userId, channelId: channel2Id, subscribedAt: new Date('2025-01-02') }
            ]);
        });

        afterEach(async () => {
            await User.deleteMany({ email: 'mychannelstest@test.com' });
            await Channel.deleteMany({ channelId: { $in: ['UCmychannels-1', 'UCmychannels-2'] } });
            await UserChannel.deleteMany({ userId });
        });

        it('should return list of followed channels for authenticated user', async () => {
            const response = await request(app)
                .get('/api/users/me/channels')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.channels).toBeInstanceOf(Array);
            expect(response.body.data.channels.length).toBe(2);
            expect(response.body.data.count).toBe(2);
        });

        it('should return channels with enriched data (id, avatar, isFollowing)', async () => {
            const response = await request(app)
                .get('/api/users/me/channels')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const channels = response.body.data.channels;

            expect(channels[0]).toHaveProperty('id');
            expect(channels[0]).toHaveProperty('channelId');
            expect(channels[0]).toHaveProperty('name');
            expect(channels[0]).toHaveProperty('username');
            expect(channels[0]).toHaveProperty('avatar');
            expect(channels[0]).toHaveProperty('description');
            expect(channels[0]).toHaveProperty('followersCount');
            expect(channels[0]).toHaveProperty('subscribedAt');
            expect(channels[0]).toHaveProperty('isFollowing');
            expect(channels[0].isFollowing).toBe(true);
        });

        it('should return channels sorted by subscribedAt descending (newest first)', async () => {
            const response = await request(app)
                .get('/api/users/me/channels')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const channels = response.body.data.channels;
            // Channel 2 was subscribed on 2025-01-02, Channel 1 on 2025-01-01
            expect(channels[0].channelId).toBe('UCmychannels-2');
            expect(channels[1].channelId).toBe('UCmychannels-1');
        });

        it('should use thumbnail if available, otherwise use placeholder', async () => {
            const response = await request(app)
                .get('/api/users/me/channels')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const channels = response.body.data.channels;

            // Channel 2 has no thumbnail (should use placeholder)
            const channel2 = channels.find(c => c.channelId === 'UCmychannels-2');
            expect(channel2.avatar).toContain('placeholder');

            // Channel 1 has thumbnail
            const channel1 = channels.find(c => c.channelId === 'UCmychannels-1');
            expect(channel1.avatar).toBe('https://example.com/thumb1.jpg');
        });

        it('should return empty array if user follows no channels', async () => {
            // Delete all UserChannel relationships
            await UserChannel.deleteMany({ userId });

            const response = await request(app)
                .get('/api/users/me/channels')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.channels).toHaveLength(0);
            expect(response.body.data.count).toBe(0);
        });

        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .get('/api/users/me/channels');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});
