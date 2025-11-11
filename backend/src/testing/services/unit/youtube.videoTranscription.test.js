import { getTranscript } from '../../../services/youtube/videoTranscription.js'

describe('getTranscript', () => {
    it('should fetch transcript for a valid YouTube video', async () => {
        const videoId = 'kiUM92VDI1Y';
        const transcript = await getTranscript(videoId);

        // Verify it's not an error object
        expect(transcript.error).toBeUndefined();

        // Verify we got a valid transcript array
        expect(Array.isArray(transcript)).toBe(true);
        expect(transcript.length).toBeGreaterThan(0);
    });

    it('should return error object for invalid video ID', async () => {
        const invalidVideoId = 'INVALID_ID';
        const result = await getTranscript(invalidVideoId);

        // Verify we got an error object instead of throwing
        expect(result).toHaveProperty('error');
        expect(result.error).toBe('fetch failed');
        expect(result).toHaveProperty('message');
        expect(typeof result.message).toBe('string');
    });

    it('should return error object for non-existent video', async () => {
        const nonExistentVideoId = 'xxxNONEXISTENTxxx';
        const result = await getTranscript(nonExistentVideoId);

        expect(result).toHaveProperty('error');
        expect(result.error).toBe('fetch failed');
    });
});
