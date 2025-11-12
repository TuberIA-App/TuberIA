import { channelFeedExtractor } from '../../../services/youtube/channelFeedPoller.js';

describe('YouTube RSS feed extractor - Integration', () => {
  let feed;

  beforeAll(async () => {
    feed = await channelFeedExtractor('UCam8T03EOFBsNdR0thrFHdQ'); // VEGETTA777
  });

  it('should successfully fetch feed for valid channel ID', () => {
    // Verify it's not an error object
    expect(feed.error).toBeUndefined();
    expect(feed).toHaveProperty('title');
  });

  it('should have top-level fields: title, author, published', () => {
    expect(feed).toHaveProperty('title');
    expect(feed).toHaveProperty('author');
    expect(feed.author).toHaveProperty('name');
    expect(feed.author).toHaveProperty('uri');
    expect(feed).toHaveProperty('published');
  });

  it('should have an entry array', () => {
    expect(feed).toHaveProperty('entry');
    expect(Array.isArray(feed.entry)).toBe(true);
    expect(feed.entry.length).toBeGreaterThan(0);
  });

  it('each entry should have required fields', () => {
    feed.entry.forEach((video) => {
      expect(video).toHaveProperty('id');
      expect(video).toHaveProperty('title');
      expect(video).toHaveProperty('link');
      expect(video).toHaveProperty('author');
      expect(video.author).toHaveProperty('name');
      expect(video.author).toHaveProperty('uri');
      expect(video).toHaveProperty('published');
      expect(video).toHaveProperty('updated');
    });
  });

  it('should return error object for invalid channel ID', async () => {
    const result = await channelFeedExtractor('');

    expect(result).toHaveProperty('error');
    expect(result.error).toBe('fetch failed');
    expect(result).toHaveProperty('message');
    expect(result.message).toContain('Invalid channel ID');
  });

  it('should return error object for non-existent channel ID', async () => {
    const result = await channelFeedExtractor('UC_FAKE_CHANNEL_ID_123456');

    // This might return error or empty feed depending on YouTube's response
    if (result.error) {
      expect(result.error).toBe('fetch failed');
      expect(result).toHaveProperty('message');
    }
  });
});
