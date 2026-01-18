/**
 * @fileoverview Lightweight YouTube channel RSS feed extractor for polling.
 * Similar to channelFeedExtractor but returns error objects instead of throwing.
 * Used by the RSS polling scheduler for background video discovery.
 * @module services/youtube/channelFeedPoller
 */

import axios from 'axios';
import UserAgent from 'user-agents';
import { XMLParser } from 'fast-xml-parser';

/**
 * Random user agent for requests.
 * @private
 */
const userAgent = new UserAgent();

/**
 * Axios instance configured for RSS feed fetching.
 * @private
 * @type {import('axios').AxiosInstance}
 */
const axiosInstance = axios.create({
    headers: { 'User-Agent': userAgent.toString() },
    validateStatus: () => true
});

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: ''
});

/**
 * Extracts the RSS feed for a YouTube channel (non-throwing version).
 * Returns error object instead of throwing for graceful error handling in polling.
 * @param {string} channelId - YouTube channel ID (UCxxxxxx format)
 * @returns {Promise<Object>} Feed object with entries, or error object { error: 'fetch failed', message: string }
 * @example
 * const feed = await channelFeedExtractor('UCxxxxxxx');
 * if (feed.error) {
 *   console.error('Feed fetch failed:', feed.message);
 * } else {
 *   const videos = feed.entry || [];
 * }
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