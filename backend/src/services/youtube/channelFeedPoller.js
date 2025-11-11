import axios from 'axios';
import UserAgent from 'user-agents';
import { XMLParser } from 'fast-xml-parser';

const userAgent = new UserAgent();

const axiosInstance = axios.create({
    headers: { 'User-Agent': userAgent.toString() },
    validateStatus: () => true
});

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: ''
});

/**
 * Extracts the RSS feed for a YouTube channel
 *
 * @param {string} channelId - The YouTube channel ID
 * @return {Promise<Object>} JSON feed if successful, or error object { error: 'fetch failed', message: string }
 */
const channelFeedExtractor = async (channelId) => {
    try {
        // Validate channelId
        if (!channelId || typeof channelId !== 'string' || channelId.trim().length === 0) {
            return {
                error: 'fetch failed',
                message: 'Invalid channel ID provided'
            };
        }

        const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
        const response = await axiosInstance.get(url);

        // Check for HTTP errors
        if (response.status >= 400) {
            return {
                error: 'fetch failed',
                message: `HTTP ${response.status}: Unable to fetch channel feed for channel ID "${channelId}"`
            };
        }

        // Check if we got valid data
        if (!response.data) {
            return {
                error: 'fetch failed',
                message: 'No data returned from YouTube feed'
            };
        }

        const parsed = parser.parse(response.data);

        // Validate parsed feed
        if (!parsed || !parsed.feed) {
            return {
                error: 'fetch failed',
                message: 'Unable to parse feed data'
            };
        }

        return parsed.feed;

    } catch (error) {
        return {
            error: 'fetch failed',
            message: error.message || 'Unknown error occurred while fetching channel feed'
        };
    }
}

export { channelFeedExtractor };