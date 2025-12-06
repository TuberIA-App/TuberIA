import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import User from '../../../model/User.js';
import Channel from '../../../model/Channel.js';
import UserChannel from '../../../model/UserChannel.js';

describe('Channel Routes Integration Tests', () => {
    beforeAll(async () => {
        // Conectar a DB de test
        const testMongoUri = process.env.MONGODB_TEST_URI
            ?.replace('tuberia-test', 'tuberia-test-channel-routes')
            || 'mongodb://mongo:mongo@mongo:27017/tuberia-test-channel-routes?authSource=admin';

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

    describe('GET /api/channels/search', () => {
        it('should return 400 if query parameter is missing', async () => {
            const response = await request(app)
                .get('/api/channels/search');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation failed');
        });

        it('should return 400 if query parameter is too short', async () => {
            const response = await request(app)
                .get('/api/channels/search?q=a');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 200 and channel info for valid username with @', async () => {
            const response = await request(app)
                .get('/api/channels/search?q=@vegetta777');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Channel found successfully');
            expect(response.body.data).toBeDefined();
            expect(response.body.data.channelId).toBe('UCam8T03EOFBsNdR0thrFHdQ');
            expect(response.body.data.name).toBeDefined();
            expect(response.body.data.username).toBe('@vegetta777');

            // Verificar que incluya followersCount y _id (ahora se guarda en DB)
            expect(response.body.data).toHaveProperty('followersCount');
            expect(typeof response.body.data.followersCount).toBe('number');
            expect(response.body.data.followersCount).toBeGreaterThanOrEqual(0);
            expect(response.body.data).toHaveProperty('_id');
            expect(response.body.data._id).toBeDefined();
        }, 30000);

        it('should return 200 and channel info for valid username without @', async () => {
            const response = await request(app)
                .get('/api/channels/search?q=vegetta777');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.channelId).toBe('UCam8T03EOFBsNdR0thrFHdQ');
        }, 30000);

        it('should return 200 and channel info for valid URL', async () => {
            const response = await request(app)
                .get('/api/channels/search?q=https://youtube.com/@vegetta777');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.channelId).toBe('UCam8T03EOFBsNdR0thrFHdQ');
        }, 30000);

        it('should return 404 for non-existent channel', async () => {
            const response = await request(app)
                .get('/api/channels/search?q=@thischanneldoesnotexist123456789');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        }, 30000);

        it('should return 400 for invalid YouTube URL', async () => {
            const response = await request(app)
                .get('/api/channels/search?q=https://notayoutubeurl.com');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        }, 20000);

        it('should return description as null or undefined (not available in RSS)', async () => {
            const response = await request(app)
                .get('/api/channels/search?q=@vegetta777');

            expect(response.status).toBe(200);
            // RSS feeds don't provide description, can be null or undefined
            expect([null, undefined]).toContain(response.body.data.description);
        }, 30000);

        it('should create channel in database when found on YouTube', async () => {
            // Clear any existing test channel
            await Channel.deleteMany({ channelId: 'UCam8T03EOFBsNdR0thrFHdQ' });

            const response = await request(app)
                .get('/api/channels/search?q=@vegetta777');

            expect(response.status).toBe(200);

            // Verify channel was saved to database
            const channelInDb = await Channel.findOne({ channelId: 'UCam8T03EOFBsNdR0thrFHdQ' });
            expect(channelInDb).toBeDefined();
            expect(channelInDb.name).toBeDefined();
            expect(channelInDb.followersCount).toBe(0);
        }, 30000);

        it('should update existing channel data on search', async () => {
            // Clear any existing test channel first
            await Channel.deleteMany({ channelId: 'UCam8T03EOFBsNdR0thrFHdQ' });

            // Create channel with old data
            const existingChannel = await Channel.create({
                channelId: 'UCam8T03EOFBsNdR0thrFHdQ',
                name: 'Old Name',
                username: '@oldusername',
                followersCount: 5
            });

            const response = await request(app)
                .get('/api/channels/search?q=@vegetta777');

            expect(response.status).toBe(200);

            // Verify channel was updated
            const updatedChannel = await Channel.findById(existingChannel._id);
            expect(updatedChannel.name).not.toBe('Old Name'); // Updated from YouTube
            expect(updatedChannel.username).toBe('@vegetta777'); // Updated
            expect(updatedChannel.followersCount).toBe(5); // Preserved
        }, 30000);

        it('should return MongoDB _id in response', async () => {
            const response = await request(app)
                .get('/api/channels/search?q=@vegetta777');

            expect(response.status).toBe(200);
            expect(response.body.data._id).toBeDefined();
            expect(typeof response.body.data._id).toBe('string');
            expect(response.body.data._id).toMatch(/^[a-f\d]{24}$/i); // Valid MongoDB ObjectId
        }, 30000);
    });

    /**
     * FOLLOW/UNFOLLOW CHANNEL TESTS
     */
    describe('POST /api/channels/:channelId/follow', () => {
        let authToken;
        let testChannelId;
        let userId;

        beforeEach(async () => {
            // Create test user and login
            const user = await User.create({
                username: 'followtest',
                name: 'Follow Test User',
                email: 'followtest@test.com',
                password: 'password123'
            });
            userId = user._id;

            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'followtest@test.com',
                    password: 'password123'
                });

            authToken = loginRes.body.data.accessToken;

            // Create test channel
            const channel = await Channel.create({
                channelId: 'UCtest-follow-123',
                name: 'Test Follow Channel',
                username: 'testfollowchannel',
                followersCount: 0
            });
            testChannelId = channel._id;
        });

        afterEach(async () => {
            await User.deleteMany({ email: 'followtest@test.com' });
            await Channel.deleteMany({ channelId: 'UCtest-follow-123' });
            await UserChannel.deleteMany({ userId });
        });

        it('should follow a channel successfully', async () => {
            const response = await request(app)
                .post(`/api/channels/${testChannelId}/follow`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Channel followed successfully');
            expect(response.body.data.channel._id).toBe(testChannelId.toString());

            // Verify UserChannel was created
            const userChannel = await UserChannel.findOne({ userId, channelId: testChannelId });
            expect(userChannel).toBeDefined();

            // Verify followersCount was incremented
            const channel = await Channel.findById(testChannelId);
            expect(channel.followersCount).toBe(1);
        });

        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .post(`/api/channels/${testChannelId}/follow`);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should return 404 if channel does not exist', async () => {
            const fakeChannelId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .post(`/api/channels/${fakeChannelId}/follow`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('not found');
        });

        it('should return 409 if already following (idempotency)', async () => {
            // Follow first time
            await request(app)
                .post(`/api/channels/${testChannelId}/follow`)
                .set('Authorization', `Bearer ${authToken}`);

            // Try to follow again
            const response = await request(app)
                .post(`/api/channels/${testChannelId}/follow`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('already following');

            // Verify followersCount wasn't incremented twice
            const channel = await Channel.findById(testChannelId);
            expect(channel.followersCount).toBe(1);
        });

        it('should return 400 if channelId is invalid format', async () => {
            const response = await request(app)
                .post('/api/channels/invalid-id/follow')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /api/channels/:channelId/unfollow', () => {
        let authToken;
        let testChannelId;
        let userId;

        beforeEach(async () => {
            // Create test user and login
            const user = await User.create({
                username: 'unfollowtest',
                name: 'Unfollow Test User',
                email: 'unfollowtest@test.com',
                password: 'password123'
            });
            userId = user._id;

            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'unfollowtest@test.com',
                    password: 'password123'
                });

            authToken = loginRes.body.data.accessToken;

            // Create test channel
            const channel = await Channel.create({
                channelId: 'UCtest-unfollow-123',
                name: 'Test Unfollow Channel',
                username: 'testunfollowchannel',
                followersCount: 1
            });
            testChannelId = channel._id;

            // Create UserChannel relationship
            await UserChannel.create({
                userId,
                channelId: testChannelId
            });
        });

        afterEach(async () => {
            await User.deleteMany({ email: 'unfollowtest@test.com' });
            await Channel.deleteMany({ channelId: 'UCtest-unfollow-123' });
            await UserChannel.deleteMany({ userId });
        });

        it('should unfollow a channel successfully', async () => {
            const response = await request(app)
                .delete(`/api/channels/${testChannelId}/unfollow`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('unfollowed');

            // Verify UserChannel was deleted
            const userChannel = await UserChannel.findOne({ userId, channelId: testChannelId });
            expect(userChannel).toBeNull();

            // Verify followersCount was decremented
            const channel = await Channel.findById(testChannelId);
            expect(channel.followersCount).toBe(0);
        });

        it('should set isActive to false when followersCount reaches 0', async () => {
            // Follow channel first
            await request(app)
                .post(`/api/channels/${testChannelId}/follow`)
                .set('Authorization', `Bearer ${authToken}`);

            // Verify it's active
            let channel = await Channel.findById(testChannelId);
            expect(channel.followersCount).toBe(1);
            expect(channel.isActive).toBe(true);

            // Unfollow (count goes to 0)
            await request(app)
                .delete(`/api/channels/${testChannelId}/unfollow`)
                .set('Authorization', `Bearer ${authToken}`);

            // Verify isActive is now false
            channel = await Channel.findById(testChannelId);
            expect(channel.followersCount).toBe(0);
            expect(channel.isActive).toBe(false);  // CRITICAL ASSERTION
        });

        it('should set isActive to true when channel gains a follower', async () => {
            // Delete existing UserChannel first to start fresh
            await UserChannel.deleteOne({ userId, channelId: testChannelId });

            // Ensure channel starts with 0 followers and inactive
            await Channel.findByIdAndUpdate(testChannelId, {
                followersCount: 0,
                isActive: false
            });

            // Follow the channel
            await request(app)
                .post(`/api/channels/${testChannelId}/follow`)
                .set('Authorization', `Bearer ${authToken}`);

            // Verify it's now active
            const channel = await Channel.findById(testChannelId);
            expect(channel.followersCount).toBe(1);
            expect(channel.isActive).toBe(true);  // Should reactivate
        });

        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .delete(`/api/channels/${testChannelId}/unfollow`);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should return 404 if not following the channel', async () => {
            // Delete the UserChannel first
            await UserChannel.deleteOne({ userId, channelId: testChannelId });

            const response = await request(app)
                .delete(`/api/channels/${testChannelId}/unfollow`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('not following');
        });

        it('should return 404 if channel does not exist', async () => {
            const fakeChannelId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .delete(`/api/channels/${fakeChannelId}/unfollow`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/channels/user/followed', () => {
        let authToken;
        let userId;
        let channel1Id, channel2Id;

        beforeEach(async () => {
            // Create test user and login
            const user = await User.create({
                username: 'followedtest',
                name: 'Followed Test User',
                email: 'followedtest@test.com',
                password: 'password123'
            });
            userId = user._id;

            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'followedtest@test.com',
                    password: 'password123'
                });

            authToken = loginRes.body.data.accessToken;

            // Create test channels
            const channel1 = await Channel.create({
                channelId: 'UCtest-followed-1',
                name: 'Test Channel 1',
                username: 'testchannel1',
                followersCount: 1
            });
            channel1Id = channel1._id;

            const channel2 = await Channel.create({
                channelId: 'UCtest-followed-2',
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
        });

        afterEach(async () => {
            await User.deleteMany({ email: 'followedtest@test.com' });
            await Channel.deleteMany({ channelId: { $in: ['UCtest-followed-1', 'UCtest-followed-2'] } });
            await UserChannel.deleteMany({ userId });
        });

        it('should return all followed channels', async () => {
            const response = await request(app)
                .get('/api/channels/user/followed')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.count).toBe(2);
            expect(response.body.data.channels).toHaveLength(2);
            expect(response.body.data.channels[0]).toHaveProperty('channelId');
            expect(response.body.data.channels[0]).toHaveProperty('name');
            expect(response.body.data.channels[0]).toHaveProperty('subscribedAt');
        });

        it('should return empty array if not following any channels', async () => {
            // Delete all UserChannel relationships
            await UserChannel.deleteMany({ userId });

            const response = await request(app)
                .get('/api/channels/user/followed')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.count).toBe(0);
            expect(response.body.data.channels).toHaveLength(0);
        });

        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .get('/api/channels/user/followed');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    /**
     * GET /api/channels/:id Tests
     */
    describe('GET /api/channels/:id', () => {
        let authToken;
        let userId;
        let testChannelId;
        let testChannelYouTubeId;

        beforeEach(async () => {
            // Create test user and login
            const user = await User.create({
                username: 'channeldetailtest',
                name: 'Channel Detail Test User',
                email: 'channeldetailtest@test.com',
                password: 'password123'
            });
            userId = user._id;

            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'channeldetailtest@test.com',
                    password: 'password123'
                });

            authToken = loginRes.body.data.accessToken;

            // Create test channel with valid YouTube channel ID format
            const testChannel = await Channel.create({
                channelId: 'UCtest-channeldetail123', // 24 characters total
                name: 'Channel Detail Test',
                username: 'channeldetailtest',
                thumbnail: 'https://example.com/avatar.jpg',
                description: 'Test channel description',
                followersCount: 10
            });
            testChannelId = testChannel._id;
            testChannelYouTubeId = testChannel.channelId;
        });

        afterEach(async () => {
            await User.deleteMany({ email: 'channeldetailtest@test.com' });
            await Channel.deleteMany({ channelId: 'UCtest-channeldetail123' });
            await UserChannel.deleteMany({ userId });
        });

        it('should return channel details for unauthenticated user (isFollowing = false)', async () => {
            const response = await request(app)
                .get(`/api/channels/${testChannelYouTubeId}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.channel).toHaveProperty('id');
            expect(response.body.data.channel).toHaveProperty('channelId', testChannelYouTubeId);
            expect(response.body.data.channel).toHaveProperty('name', 'Channel Detail Test');
            expect(response.body.data.channel).toHaveProperty('avatar');
            expect(response.body.data.channel).toHaveProperty('description');
            expect(response.body.data.channel).toHaveProperty('followersCount', 10);
            expect(response.body.data.channel).toHaveProperty('isFollowing', false);
        });

        it('should return channel with isFollowing = true if user is following', async () => {
            // Create UserChannel relationship
            await UserChannel.create({ userId, channelId: testChannelId });

            const response = await request(app)
                .get(`/api/channels/${testChannelYouTubeId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.channel.isFollowing).toBe(true);
        });

        it('should return channel with isFollowing = false if authenticated but not following', async () => {
            const response = await request(app)
                .get(`/api/channels/${testChannelYouTubeId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.channel.isFollowing).toBe(false);
        });

        it('should use thumbnail if available, otherwise use placeholder', async () => {
            const response = await request(app)
                .get(`/api/channels/${testChannelYouTubeId}`);

            expect(response.status).toBe(200);
            expect(response.body.data.channel.avatar).toBe('https://example.com/avatar.jpg');

            // Test with channel without thumbnail
            const noThumbChannel = await Channel.create({
                channelId: 'UCtestNoThumb1234567890', // 24 characters
                name: 'No Thumb Channel',
                username: 'nothumbchannel',
                followersCount: 1
            });

            const response2 = await request(app)
                .get(`/api/channels/${noThumbChannel.channelId}`);

            expect(response2.status).toBe(200);
            expect(response2.body.data.channel.avatar).toContain('placeholder');

            // Cleanup
            await Channel.deleteOne({ _id: noThumbChannel._id });
        });

        it('should return 404 if channel does not exist', async () => {
            const response = await request(app)
                .get('/api/channels/UCnonexistent1234567890');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('not found');
        });

        it('should return 400 if channel ID format is invalid', async () => {
            const response = await request(app)
                .get('/api/channels/invalid-id');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    /**
     * Channel isActive Lifecycle Tests
     */
    describe('Channel isActive Lifecycle', () => {
        beforeEach(async () => {
            // Clean up ALL channels to avoid contamination from previous tests
            await Channel.deleteMany({});
        });

        afterEach(async () => {
            // Clean up ALL channels after test
            await Channel.deleteMany({});
        });

        it('RSS poller query should NOT include channels with isActive: false', async () => {
            // Create inactive channel (no followers)
            const inactiveChannel = await Channel.create({
                channelId: 'UCinactive123',
                name: 'Inactive Channel',
                followersCount: 0,
                isActive: false
            });

            // Create active channel with followers
            const activeChannel = await Channel.create({
                channelId: 'UCactive456',
                name: 'Active Channel',
                followersCount: 5,
                isActive: true
            });

            // Query like RSS poller does (rssPoller.service.js:140-143)
            const channels = await Channel.find({
                isActive: true,
                followersCount: { $gt: 0 }
            });

            // Should only include active channel
            expect(channels.length).toBe(1);
            expect(channels[0].channelId).toBe('UCactive456');
            expect(channels[0].isActive).toBe(true);
            expect(channels[0].followersCount).toBeGreaterThan(0);

            // Verify inactive channel is NOT included
            const inactiveFound = channels.find(ch => ch.channelId === 'UCinactive123');
            expect(inactiveFound).toBeUndefined();
        });

        it('RSS poller query should NOT include channels with followersCount = 0 even if isActive: true', async () => {
            // Create channel with 0 followers but still marked active (inconsistent state)
            const inconsistentChannel = await Channel.create({
                channelId: 'UCinactive123',
                name: 'Inconsistent Channel',
                followersCount: 0,
                isActive: true  // Inconsistent: active but no followers
            });

            // Query like RSS poller does
            const channels = await Channel.find({
                isActive: true,
                followersCount: { $gt: 0 }
            });

            // Should return empty array (followersCount: 0 fails the $gt: 0 condition)
            expect(channels.length).toBe(0);
        });

        it('RSS poller query should include channels with followers and isActive: true', async () => {
            // Create multiple active channels with followers
            await Channel.create([
                {
                    channelId: 'UCactive456',
                    name: 'Active Channel 1',
                    followersCount: 10,
                    isActive: true
                },
                {
                    channelId: 'UCinactive123',
                    name: 'Active Channel 2',
                    followersCount: 5,
                    isActive: true
                }
            ]);

            // Query like RSS poller does
            const channels = await Channel.find({
                isActive: true,
                followersCount: { $gt: 0 }
            });

            // Should include both channels
            expect(channels.length).toBe(2);
            channels.forEach(channel => {
                expect(channel.isActive).toBe(true);
                expect(channel.followersCount).toBeGreaterThan(0);
            });
        });
    });
});