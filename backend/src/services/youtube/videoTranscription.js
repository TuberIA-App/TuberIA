import { fetchTranscript } from 'youtube-transcript-plus';
import { BadRequestError, NotFoundError, InternalServerError } from '../../utils/errorClasses.util.js';
import logger from '../../utils/logger.js';
import { createYoutubeTranscriptConfig } from '../../utils/youtubeProxyConfig.util.js';

/**
 * Fetches the transcript for a YouTube video
 *
 * @param {string} videoId - The YouTube video ID
 * @returns {Promise<Array>} Returns the transcript array if successful
 * @throws {BadRequestError} If videoId is invalid
 * @throws {NotFoundError} If transcript is not available for the video
 * @throws {InternalServerError} If an unexpected error occurs
 */
const getTranscript = async (videoId) => {
    // Validate input
    if (!videoId || typeof videoId !== 'string' || videoId.trim().length === 0) {
        logger.error('Invalid video ID provided to getTranscript', { videoId });
        throw new BadRequestError('Invalid video ID provided');
    }

    try {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        logger.debug(`Fetching transcript for video: ${videoId}`);

        // Create config with rotative user agents and optional proxy
        const config = createYoutubeTranscriptConfig();

        // Fetch transcript with custom configuration
        const transcript = await fetchTranscript(videoUrl, config);

        // Validate that we actually got a transcript
        if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
            logger.warn(`No transcript data returned for video: ${videoId}`);
            throw new NotFoundError('No transcript available for this video');
        }

        logger.debug(`Successfully fetched transcript for video: ${videoId}`, {
            segmentCount: transcript.length
        });

        return transcript;

    } catch (error) {
        // If it's already one of our custom errors, just rethrow it
        if (error.isOperational) {
            throw error;
        }

        // Log the unexpected error
        logger.error('Error fetching transcript', {
            videoId,
            error: error.message,
            stack: error.stack
        });

        // Handle specific error cases from youtube-transcript-plus
        const errorMessage = error.message || '';

        if (errorMessage.includes('not available') ||
            errorMessage.includes('disabled') ||
            errorMessage.includes('Transcript is disabled')) {
            throw new NotFoundError('Transcript is not available for this video');
        }

        if (errorMessage.includes('Invalid video') ||
            errorMessage.includes('Video unavailable')) {
            throw new NotFoundError('Video not found or unavailable');
        }

        if (errorMessage.includes('fetch failed') ||
            errorMessage.includes('network') ||
            errorMessage.includes('timeout')) {
            throw new InternalServerError('Unable to fetch transcript due to network issues. Please try again later.');
        }

        // Generic error for anything else
        throw new InternalServerError('An error occurred while fetching the transcript');
    }
};

export { getTranscript };