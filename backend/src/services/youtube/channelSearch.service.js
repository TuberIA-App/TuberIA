/**
 * @fileoverview YouTube channel search service.
 * Searches for channels by username or URL and saves them to the database.
 * @module services/youtube/channelSearch
 */

import { channelId as extractChannelId } from './channelIdExtractor.js';
import { channelFeedExtractor } from './channelFeedExtractor.js';
import { BadRequestError } from '../../utils/errorClasses.util.js';
import logger from '../../utils/logger.js';
import { findOrCreateChannel } from '../channel.service.js';

/**
 * Parses input to determine if it's a YouTube URL or username.
 * Adds @ prefix to usernames if missing.
 * @private
 * @param {string} input - Username (@vegetta777) or full YouTube URL
 * @returns {{type: 'url'|'username', value: string}} Parsed input type and normalized value
 * @throws {BadRequestError} If input is invalid or empty
 */
const parseInput = (input) => {
    if (!input || typeof input !== 'string') {
        throw new BadRequestError('Invalid input: must be a non-empty string');
    }

    const trimmedInput = input.trim();

    // If starts with http:// or https://, it's a URL
    if (trimmedInput.startsWith('http://') || trimmedInput.startsWith('https://')) {
        return { type: 'url', value: trimmedInput };
    }

    // If starts with @, it's a username
    if (trimmedInput.startsWith('@')) {
        return { type: 'username', value: trimmedInput };
    }

    // If no @, add it (assuming it's a username without @)
    return { type: 'username', value: `@${trimmedInput}` };
};

/**
 * Constructs the full YouTube channel URL from a username.
 * @private
 * @param {string} username - Username with @ prefix (e.g., @vegetta777)
 * @returns {string} Full YouTube channel URL
 */
const buildChannelUrl = (username) => {
    return `https://www.youtube.com/${username}`;
};

/**
 * Searches for a YouTube channel and returns its information.
 * Extracts channel ID, fetches RSS feed, and saves to database.
 * @param {string} query - Username (@vegetta777, vegetta777) or full YouTube channel URL
 * @returns {Promise<Object>} Channel information with database _id
 * @returns {string} result._id - MongoDB ObjectId as string
 * @returns {string} result.channelId - YouTube channel ID (UCxxxxxx format)
 * @returns {string} result.name - Channel display name
 * @returns {string|null} result.username - Channel username with @ prefix
 * @returns {string|null} result.thumbnail - Channel/video thumbnail URL
 * @returns {string|null} result.description - Channel description
 * @returns {number} result.followersCount - Number of app users following this channel
 * @throws {BadRequestError} If the input is invalid
 * @throws {NotFoundError} If the channel does not exist
 * @example
 * const channel = await searchChannel('@mkbhd');
 * // or
 * const channel = await searchChannel('https://www.youtube.com/@mkbhd');
 */
export const searchChannel = async (query) => {
    try {
        logger.info(`Starting channel search with query: ${query}`);

        // 1. Parse input to determine if URL or username
        const { type, value } = parseInput(query);
        logger.info(`Input type detected: ${type}, value: ${value}`);

        // 2. Build channel URL if needed
        let channelUrl;
        if (type === 'url') {
            channelUrl = value;
        } else {
            channelUrl = buildChannelUrl(value);
        }
        logger.info(`Channel URL: ${channelUrl}`);

        // 3. Extract Channel ID using existing service
        logger.info(`Extracting Channel ID from URL...`);
        const youtubeChannelId = await extractChannelId(channelUrl);
        logger.info(`Channel ID extracted: ${youtubeChannelId}`);

        // 4. Get channel info via RSS feed
        logger.info(`Fetching channel feed for Channel ID: ${youtubeChannelId}`);
        const feedData = await channelFeedExtractor(youtubeChannelId);
        logger.info(`Channel feed fetched successfully`);

        // 5. Extract relevant info from feed
        const channelName = feedData.feed?.title || feedData.title || 'Unknown Channel';
        const channelAuthor = feedData.feed?.author?.name || feedData.author?.name || '';
        const channelUri = feedData.feed?.author?.uri || feedData.author?.uri || channelUrl;

        // 6. Extract username from URI if available
        let username = null;
        if (channelUri && channelUri.includes('/@')) {
            const match = channelUri.match(/@([^\/]+)/);
            if (match) {
                username = `@${match[1]}`;
            }
        } else if (type === 'username') {
            username = value;
        }

        // 7. Try to get thumbnail (from first video in feed)
        let thumbnail = null;
        const entries = feedData.feed?.entry || feedData.entry || [];
        if (entries.length > 0 && entries[0]['media:group']) {
            thumbnail = entries[0]['media:group']['media:thumbnail']?.['@_url'] || null;
        }

        // 8. Structure the response
        const channelInfo = {
            channelId: youtubeChannelId,
            name: channelName,
            username: username,
            thumbnail: thumbnail,
            description: null // RSS feed doesn't include channel description
        };

        // 9. Save/update channel in database
        logger.info(`Saving channel to database: ${channelName}`);
        const savedChannel = await findOrCreateChannel(channelInfo);
        logger.info(`Channel saved to database with _id: ${savedChannel._id}`);

        // 10. Return enriched info with DB data
        const enrichedChannelInfo = {
            _id: savedChannel._id.toString(),
            channelId: savedChannel.channelId,
            name: savedChannel.name,
            username: savedChannel.username,
            thumbnail: savedChannel.thumbnail,
            description: savedChannel.description,
            followersCount: savedChannel.followersCount
        };

        logger.info(`Channel search completed successfully for: ${channelName}`);
        return enrichedChannelInfo;

    } catch (error) {
        // If error is already operational (from channelIdExtractor or channelFeedExtractor), re-throw it
        if (error.isOperational) {
            logger.error(`Channel search failed (operational error): ${error.message}`);
            throw error;
        }

        // Si es un error desconocido, lo logueamos y lanzamos BadRequestError
        logger.error(`Unexpected error in channel search: ${error.message}`, {
            stack: error.stack
        });
        throw new BadRequestError(error.message || 'Error searching for channel');
    }
};