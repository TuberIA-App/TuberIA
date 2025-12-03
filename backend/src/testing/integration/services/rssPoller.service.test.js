import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { pollChannelNow } from '../../../services/youtube/rssPoller.service.js';
import Channel from '../../../model/Channel.js';
import Video from '../../../model/Video.js';
import mongoose from 'mongoose';

describe('RSS Poller Service', () => {
  let testChannelId;

  beforeEach(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      const testMongoUri = process.env.MONGODB_TEST_URI || 'mongodb://mongo:mongo@localhost:27017/tuberia-test-rss?authSource=admin';
      await mongoose.connect(testMongoUri);
    }

    // Clean up any existing test data first (in case previous test failed)
    const existingChannel = await Channel.findOne({ channelId: 'UCX6OQ3DkcsbYNE6H8uQQuVA' });
    if (existingChannel) {
      await Video.deleteMany({ channelId: existingChannel._id });
      await Channel.deleteOne({ channelId: 'UCX6OQ3DkcsbYNE6H8uQQuVA' });
    }

    // Create test channel
    const testChannel = await Channel.create({
      channelId: 'UCX6OQ3DkcsbYNE6H8uQQuVA',  // MrBeast channel (real)
      name: 'MrBeast',
      username: 'MrBeast',
      followersCount: 1,
      isActive: true,
      owner: new mongoose.Types.ObjectId()
    });
    testChannelId = testChannel.channelId;
  });

  it('should poll channel and detect videos', async () => {
    const result = await pollChannelNow(testChannelId);

    expect(result.success).toBe(true);
    expect(result.channelId).toBe(testChannelId);

    // Check that channel was updated
    const channel = await Channel.findOne({ channelId: testChannelId });
    expect(channel.lastChecked).toBeDefined();
    expect(channel.lastChecked).toBeInstanceOf(Date);

    // Check that videos were created
    const videos = await Video.find({ channelId: channel._id });
    expect(videos.length).toBeGreaterThan(0);
  }, 30000);  // 30 second timeout

  afterEach(async () => {
    // Clean up test data
    const channel = await Channel.findOne({ channelId: testChannelId });
    if (channel) {
      await Video.deleteMany({ channelId: channel._id });
    }
    await Channel.deleteMany({ channelId: testChannelId });
  });
});
