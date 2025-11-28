import { channelFeedExtractor } from '../../../services/youtube/channelFeedExtractor.js';
import { BadRequestError, NotFoundError } from '../../../utils/errorClasses.util.js';

describe('YouTube RSS feed extractor - Integration', () => {
  let feed;

  beforeAll(async () => {
    feed = await channelFeedExtractor('UCam8T03EOFBsNdR0thrFHdQ'); // VEGETTA777
  });

  it('should successfully fetch feed for valid channel ID', () => {
    // Verify it's a valid feed object (not an error)
    expect(feed).toHaveProperty('title');
    expect(feed.title).toBeTruthy();
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

  it('should throw BadRequestError for invalid channel ID', async () => {
    await expect(channelFeedExtractor('')).rejects.toThrow(BadRequestError);
    await expect(channelFeedExtractor('')).rejects.toThrow('Invalid channel ID provided');
  });

  it('should throw NotFoundError for non-existent channel ID', async () => {
    await expect(channelFeedExtractor('UC_FAKE_CHANNEL_ID_123456')).rejects.toThrow(NotFoundError);
  });
});
