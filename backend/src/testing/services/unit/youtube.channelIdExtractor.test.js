import { channelId } from '../../../services/youtube/channelIdExtractor.js';

describe('YouTube Channel ID fetcher - Integration (real HTTP)', () => {

  describe('channelId', () => {
    it('should return a valid channel ID for a real YouTube channel URL', async () => {
      const url = 'https://youtube.com/@vegetta777';
      const id = await channelId(url);
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
      expect(id).toBe('UCam8T03EOFBsNdR0thrFHdQ');
    });
  });

});
