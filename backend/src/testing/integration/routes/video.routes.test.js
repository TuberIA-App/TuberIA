import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import User from '../../../model/User.js';
import Channel from '../../../model/Channel.js';
import UserChannel from '../../../model/UserChannel.js';
import Video from '../../../model/Video.js';

describe('Video Routes Integration Tests', () => {
    beforeAll(async () => {
        // Conectar a DB de test
        const testMongoUri = process.env.MONGODB_TEST_URI
            ?.replace('tuberia-test', 'tuberia-test-video-routes')
            || 'mongodb://mongo:mongo@mongo:27017/tuberia-test-video-routes?authSource=tuberia_db';

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
     * GET /api/users/me/videos Tests
     */
    describe('GET /api/users/me/videos', () => {
        let authToken;
        let userId;
        let channel1Id, channel2Id;

        beforeEach(async () => {
            // Create test user and login
            const user = await User.create({
                username: 'videofeedtest',
                name: 'Video Feed Test User',
                email: 'videofeedtest@test.com',
                password: 'password123'
            });
            userId = user._id;

            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'videofeedtest@test.com',
                    password: 'password123'
                });

            authToken = loginRes.body.data.accessToken;

            // Create test channels
            const channel1 = await Channel.create({
                channelId: 'UCtest-video-1',
                name: 'Test Channel 1',
                username: 'testchannel1',
                followersCount: 1
            });
            channel1Id = channel1._id;

            const channel2 = await Channel.create({
                channelId: 'UCtest-video-2',
                name: 'Test Channel 2',
                username: 'testchannel2',
                followersCount: 1
            });
            channel2Id = channel2._id;

            // Create UserChannel relationships
            await UserChannel.create([
                { userId, channelId: channel1Id },
                { userId, channelId: channel2Id }
            ]);

            // Create test videos
            const videos = [
                {
                    videoId: 'video1-test',
                    title: 'Test Video 1',
                    url: 'https://youtube.com/watch?v=video1-test',
                    channelId: channel1Id,
                    publishedAt: new Date('2025-01-01'),
                    status: 'completed',
                    summary: 'Summary 1',
                    keyPoints: ['Point 1']
                },
                {
                    videoId: 'video2-test',
                    title: 'Test Video 2',
                    url: 'https://youtube.com/watch?v=video2-test',
                    channelId: channel2Id,
                    publishedAt: new Date('2025-01-02'),
                    status: 'completed',
                    summary: 'Summary 2',
                    keyPoints: ['Point 2']
                },
                {
                    videoId: 'video3-test',
                    title: 'Test Video 3 (Pending)',
                    url: 'https://youtube.com/watch?v=video3-test',
                    channelId: channel1Id,
                    publishedAt: new Date('2025-01-03'),
                    status: 'pending'
                }
            ];

            await Video.create(videos);
        });

        afterEach(async () => {
            await User.deleteMany({ email: 'videofeedtest@test.com' });
            await Channel.deleteMany({ channelId: { $in: ['UCtest-video-1', 'UCtest-video-2'] } });
            await UserChannel.deleteMany({ userId });
            await Video.deleteMany({ videoId: { $in: ['video1-test', 'video2-test', 'video3-test'] } });
        });

        it('should return video feed for authenticated user', async () => {
            const response = await request(app)
                .get('/api/users/me/videos')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.videos).toBeInstanceOf(Array);
            expect(response.body.data.videos.length).toBe(3);
            expect(response.body.data.pagination).toHaveProperty('currentPage');
            expect(response.body.data.pagination).toHaveProperty('totalPages');
            expect(response.body.data.pagination).toHaveProperty('totalCount');
            expect(response.body.data.pagination.totalCount).toBe(3);
        });

        it('should return videos sorted by publishedAt descending (newest first)', async () => {
            const response = await request(app)
                .get('/api/users/me/videos')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const videos = response.body.data.videos;
            expect(videos[0].videoId).toBe('video3-test'); // 2025-01-03
            expect(videos[1].videoId).toBe('video2-test'); // 2025-01-02
            expect(videos[2].videoId).toBe('video1-test'); // 2025-01-01
        });

        it('should support pagination with page and limit', async () => {
            const response = await request(app)
                .get('/api/users/me/videos?page=1&limit=2')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.videos.length).toBe(2);
            expect(response.body.data.pagination.currentPage).toBe(1);
            expect(response.body.data.pagination.limit).toBe(2);
            expect(response.body.data.pagination.hasNextPage).toBe(true);
            expect(response.body.data.pagination.hasPreviousPage).toBe(false);
        });

        it('should filter videos by status=completed', async () => {
            const response = await request(app)
                .get('/api/users/me/videos?status=completed')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const videos = response.body.data.videos;
            expect(videos.length).toBe(2);
            expect(videos.every(v => v.status === 'completed')).toBe(true);
        });

        it('should filter videos by status=pending', async () => {
            const response = await request(app)
                .get('/api/users/me/videos?status=pending')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const videos = response.body.data.videos;
            expect(videos.length).toBe(1);
            expect(videos[0].videoId).toBe('video3-test');
            expect(videos[0].status).toBe('pending');
        });

        it('should return empty array if user follows no channels', async () => {
            // Delete all UserChannel relationships
            await UserChannel.deleteMany({ userId });

            const response = await request(app)
                .get('/api/users/me/videos')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.videos).toHaveLength(0);
            expect(response.body.data.pagination.totalCount).toBe(0);
        });

        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .get('/api/users/me/videos');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 if limit is invalid (> 100)', async () => {
            const response = await request(app)
                .get('/api/users/me/videos?limit=101')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 if status is invalid', async () => {
            const response = await request(app)
                .get('/api/users/me/videos?status=invalid')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    /**
     * GET /api/videos/:videoId Tests
     */
    describe('GET /api/videos/:videoId', () => {
        let authToken;
        let userId;
        let channelId;
        let videoId;

        beforeEach(async () => {
            // Create test user and login
            const user = await User.create({
                username: 'videodetailtest',
                name: 'Video Detail Test User',
                email: 'videodetailtest@test.com',
                password: 'password123'
            });
            userId = user._id;

            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'videodetailtest@test.com',
                    password: 'password123'
                });

            authToken = loginRes.body.data.accessToken;

            // Create test channel
            const channel = await Channel.create({
                channelId: 'UCtest-video-detail',
                name: 'Test Channel',
                username: 'testchannel',
                followersCount: 1
            });
            channelId = channel._id;

            // Create UserChannel relationship
            await UserChannel.create({ userId, channelId });

            // Create test video (using valid 11-character YouTube format)
            const video = await Video.create({
                videoId: 'testVid1234',
                title: 'Test Video Detail',
                url: 'https://youtube.com/watch?v=testVid1234',
                channelId,
                publishedAt: new Date(),
                status: 'completed',
                summary: 'Test summary',
                keyPoints: ['Point 1', 'Point 2']
            });
            videoId = video.videoId;
        });

        afterEach(async () => {
            await User.deleteMany({ email: 'videodetailtest@test.com' });
            await Channel.deleteMany({ channelId: 'UCtest-video-detail' });
            await UserChannel.deleteMany({ userId });
            await Video.deleteMany({ videoId: 'testVid1234' });
        });

        it('should return video details for authenticated user who follows the channel', async () => {
            const response = await request(app)
                .get(`/api/videos/${videoId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.video.videoId).toBe(videoId);
            expect(response.body.data.video.title).toBe('Test Video Detail');
            expect(response.body.data.video.summary).toBe('Test summary');
        });

        it('should return 403 if user does not follow the channel', async () => {
            // Delete UserChannel relationship
            await UserChannel.deleteOne({ userId, channelId });

            const response = await request(app)
                .get(`/api/videos/${videoId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('follow');
        });

        it('should return 404 if video does not exist', async () => {
            const response = await request(app)
                .get('/api/videos/nonexistent')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .get(`/api/videos/${videoId}`);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});
