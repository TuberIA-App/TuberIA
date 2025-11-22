import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { getTranscript } from '../../../services/youtube/videoTranscription.js';
import { BadRequestError } from '../../../utils/errorClasses.util.js';

describe('getTranscript', () => {
    it('should fetch transcript for a valid YouTube video', async () => {
        const videoId = 'E5Zd3w_vYAg';
        const transcript = await getTranscript(videoId);

        // Verify we got a valid transcript array
        expect(Array.isArray(transcript)).toBe(true);
        expect(transcript.length).toBeGreaterThan(0);
    });

    it('should throw BadRequestError for invalid video ID', async () => {
        const invalidVideoId = '';

        await expect(getTranscript(invalidVideoId)).rejects.toThrow(BadRequestError);
        await expect(getTranscript(invalidVideoId)).rejects.toThrow('Invalid video ID provided');
    });

    it('should throw error for non-existent video', async () => {
        const nonExistentVideoId = 'xxxNONEXISTENTxxx';

        // This should throw NotFoundError or InternalServerError depending on the failure mode
        await expect(getTranscript(nonExistentVideoId)).rejects.toThrow();
    });
});
