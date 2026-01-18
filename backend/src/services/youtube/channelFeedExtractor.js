/**
 * @fileoverview YouTube channel RSS feed extractor.
 * Fetches and parses YouTube channel RSS feeds to get video listings.
 * @module services/youtube/channelFeedExtractor
 */

import axios from 'axios';
import UserAgent from 'user-agents';
import { XMLParser } from 'fast-xml-parser';
import { BadRequestError, NotFoundError, InternalServerError } from '../../utils/errorClasses.util.js';
import logger from '../../utils/logger.js';

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
    timeout: 15000, // 15 seconds timeout
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
 * @return {Promise<Object>} JSON feed if successful
 * @throws {BadRequestError} If channelId is invalid
 * @throws {NotFoundError} If channel is not found
 * @throws {InternalServerError} If an unexpected error occurs
 */
const channelFeedExtractor = async (channelId) => {
    // Validate channelId
    if (!channelId || typeof channelId !== 'string' || channelId.trim().length === 0) {
        logger.error('Invalid channel ID provided to channelFeedExtractor', { channelId });
        throw new BadRequestError('Invalid channel ID provided');
    }

    try {
        const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
        logger.debug(`Fetching channel feed for channel ID: ${channelId}`);

        const response = await axiosInstance.get(url);

        // Check for specific HTTP status codes
        if (response.status === 404) {
            logger.warn(`Channel feed not found: ${channelId}`);
            throw new NotFoundError('Channel not found or has no videos');
        }

        if (response.status === 429) {
            logger.error(`Rate limit exceeded when fetching feed for: ${channelId}`);
            throw new InternalServerError('YouTube rate limit exceeded. Please try again later.');
        }

        if (response.status >= 500) {
            logger.error(`YouTube server error (${response.status}) for channel: ${channelId}`);
            throw new InternalServerError('YouTube service is currently unavailable. Please try again later.');
        }

        if (response.status >= 400) {
            logger.error(`HTTP error ${response.status} when fetching feed for: ${channelId}`);
            throw new InternalServerError(`Unable to fetch channel feed (HTTP ${response.status})`);
        }

        // Check if we got valid data
        if (!response.data) {
            logger.error(`No data returned from YouTube feed for channel: ${channelId}`);
            throw new InternalServerError('No data returned from YouTube feed');
        }

        const parsed = parser.parse(response.data);

        // Validate parsed feed
        if (!parsed || !parsed.feed) {
            logger.error(`Unable to parse feed data for channel: ${channelId}`);
            throw new InternalServerError('Unable to parse feed data');
        }

        logger.debug(`Successfully fetched and parsed feed for channel: ${channelId}`, {
            videoCount: parsed.feed.entry ? (Array.isArray(parsed.feed.entry) ? parsed.feed.entry.length : 1) : 0
        });

        return parsed.feed;

    } catch (error) {
        // If it's already one of our custom errors, just rethrow it
        if (error.isOperational) {
            throw error;
        }

        // Log the unexpected error
        logger.error('Error fetching channel feed', {
            channelId,
            error: error.message,
            code: error.code,
            stack: error.stack
        });

        // Handle axios-specific errors
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            throw new InternalServerError('Request timed out. Please try again later.');
        }

        if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
            throw new InternalServerError('Network error. Please check your connection and try again.');
        }

        // Handle XML parsing errors
        if (error.name === 'XMLParserError' || error.message.includes('parse')) {
            throw new InternalServerError('Failed to parse channel feed data');
        }

        // Generic error for anything else
        throw new InternalServerError('An error occurred while fetching the channel feed');
    }
}

export { channelFeedExtractor };
