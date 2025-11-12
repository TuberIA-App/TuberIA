import { channelId } from '../../../services/youtube/channelIdExtractor.js';
import { BadRequestError, NotFoundError } from '../../../utils/errorClasses.util.js';

describe('YouTube Channel ID fetcher - Integration (real HTTP)', () => {

  describe('channelId', () => {
    it('should return a valid channel ID for a real YouTube channel URL', async () => {
      const url = 'https://youtube.com/@vegetta777';
      const result = await channelId(url);

      // Verify we got a valid channel ID string
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toBe('UCam8T03EOFBsNdR0thrFHdQ');
    });

    it('should throw BadRequestError for invalid URL', async () => {
      const invalidUrl = 'https://notayoutubeurl.com';

      await expect(channelId(invalidUrl)).rejects.toThrow(BadRequestError);
      await expect(channelId(invalidUrl)).rejects.toThrow('not a YouTube URL');
    });

    it('should throw NotFoundError for non-existent channel', async () => {
      const nonExistentUrl = 'https://youtube.com/@thisChannelDoesNotExist12345XYZ';

      // This should throw NotFoundError when the channel doesn't exist
      await expect(channelId(nonExistentUrl)).rejects.toThrow(NotFoundError);
    });
  });

});
