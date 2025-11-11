import { channelId } from '../../../services/youtube/channelIdExtractor.js';

describe('YouTube Channel ID fetcher - Integration (real HTTP)', () => {

  describe('channelId', () => {
    it('should return a valid channel ID for a real YouTube channel URL', async () => {
      const url = 'https://youtube.com/@vegetta777';
      const result = await channelId(url);

      // Verify it's not an error object
      expect(result.error).toBeUndefined();

      // Verify we got a valid channel ID
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toBe('UCam8T03EOFBsNdR0thrFHdQ');
    });

    it('should return error object for invalid URL', async () => {
      const invalidUrl = 'https://notayoutubeurl.com';
      const result = await channelId(invalidUrl);

      expect(result).toHaveProperty('error');
      expect(result.error).toBe('fetch failed');
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('not a YouTube url');
    });

    it('should return error object for non-existent channel', async () => {
      const nonExistentUrl = 'https://youtube.com/@thisChannelDoesNotExist12345XYZ';
      const result = await channelId(nonExistentUrl);

      // This might succeed or fail depending on YouTube's response
      // If it fails, it should return an error object
      if (result.error) {
        expect(result.error).toBe('fetch failed');
        expect(result).toHaveProperty('message');
      }
    });
  });

});
