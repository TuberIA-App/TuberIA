import { fetchTranscript } from 'youtube-transcript-plus';

/**
 * Fetches the transcript for a YouTube video
 *
 * @param {string} videoId - The YouTube video ID
 * @returns {Promise<Array|Object>} Returns the transcript array if successful, or an error object { error: 'fetch failed', message: string } if failed
 */
const getTranscript = async (videoId) => {
    try {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const transcript = await fetchTranscript(videoUrl);

        // Validate that we actually got a transcript
        if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
            return {
                error: 'fetch failed',
                message: 'No transcript data returned'
            };
        }

        // Return the transcript only if we successfully fetched it
        console.log(transcript)
        return transcript;

    } catch (error) {
        // Return error object instead of throwing
        return {
            error: 'fetch failed',
            message: error.message || 'Unknown error occurred while fetching transcript'
        };
    }
};

export { getTranscript };