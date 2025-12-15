/**
 * @fileoverview Channel controller handling HTTP requests for channel operations.
 * Manages channel search, follow/unfollow, and retrieval endpoints.
 * @module controllers/channel
 */

import { asyncHandler } from '../middlewares/asyncHandler.middleware.js';
import * as channelSearchService from '../services/youtube/channelSearch.service.js';
import * as channelService from '../services/channel.service.js';
import { successResponse } from '../utils/response.util.js';
import { NotFoundError, ConflictError } from '../utils/errorClasses.util.js';

/**
 * Searches for a YouTube channel by username or URL.
 * @route GET /api/channels/search?q=username_or_url
 * @access Public
 * @param {import('express').Request} req - Express request
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.q - Channel username (@handle) or YouTube URL
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>} JSON response with channel information
 * @throws {BadRequestError} 400 - If query is invalid
 * @throws {NotFoundError} 404 - If channel not found
 */
export const searchChannel = asyncHandler(async (req, res) => {
    const { q } = req.query;

    // Llamar al service de búsqueda
    const channelInfo = await channelSearchService.searchChannel(q);

    // Retornar respuesta exitosa
    successResponse(res, channelInfo, 'Channel found successfully', 200);
});

/**
 * Follows a channel for the authenticated user.
 * @route POST /api/channels/:channelId/follow
 * @access Private
 * @param {import('express').Request} req - Express request
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.channelId - MongoDB ObjectId of the channel
 * @param {Object} req.user - Authenticated user (from authMiddleware)
 * @param {Object} [req.body] - Optional channel data for creation
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>} JSON response with channel data
 * @throws {NotFoundError} 404 - If channel not found
 * @throws {ConflictError} 409 - If already following
 */
export const followChannel = asyncHandler(async (req, res) => {
    const userId = req.user.id; // From authMiddleware (toJSON virtual)
    const { channelId } = req.params;
    const channelData = req.body; // Optional: channel info for creation

    const result = await channelService.followChannel(userId, channelId, channelData);

    // Handle errors
    if (result.error === 'not_found') {
        throw new NotFoundError(result.message);
    }

    if (result.error === 'already_following') {
        throw new ConflictError(result.message);
    }

    if (result.error === 'invalid_id') {
        throw new NotFoundError(result.message);
    }

    if (result.error) {
        throw new Error(result.message);
    }

    // Success
    successResponse(res, { channel: result.channel }, 'Channel followed successfully', 200);
});

/**
 * Unfollows a channel for the authenticated user.
 * @route DELETE /api/channels/:channelId/unfollow
 * @access Private
 * @param {import('express').Request} req - Express request
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.channelId - MongoDB ObjectId of the channel
 * @param {Object} req.user - Authenticated user (from authMiddleware)
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>} JSON success response
 * @throws {NotFoundError} 404 - If channel not found or not following
 */
export const unfollowChannel = asyncHandler(async (req, res) => {
    const userId = req.user.id; // From authMiddleware (toJSON virtual)
    const { channelId } = req.params;

    const result = await channelService.unfollowChannel(userId, channelId);

    // Handle errors
    if (result.error === 'not_found') {
        throw new NotFoundError(result.message);
    }

    if (result.error === 'not_following') {
        throw new NotFoundError(result.message);
    }

    if (result.error) {
        throw new Error(result.message);
    }

    // Success
    successResponse(res, null, result.message, 200);
});

/**
 * Gets all channels followed by the authenticated user.
 * @route GET /api/channels/user/followed
 * @access Private
 * @param {import('express').Request} req - Express request
 * @param {Object} req.user - Authenticated user (from authMiddleware)
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>} JSON response with channels array and count
 */
export const getFollowedChannels = asyncHandler(async (req, res) => {
    const userId = req.user.id; // From authMiddleware (toJSON virtual)

    const result = await channelService.getFollowedChannels(userId);

    // Handle errors
    if (result.error) {
        throw new Error(result.message);
    }

    // Success
    successResponse(
        res,
        {
            channels: result.channels,
            count: result.count
        },
        'Followed channels retrieved successfully',
        200
    );
});

/**
 * Gets channel details by YouTube channel ID.
 * Includes isFollowing status if user is authenticated.
 * @route GET /api/channels/:id
 * @access Public (optional auth for isFollowing status)
 * @param {import('express').Request} req - Express request
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - YouTube channel ID (UCxxxxxx format)
 * @param {Object} [req.user] - Optional authenticated user (from optionalAuthMiddleware)
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>} JSON response with channel data
 * @throws {NotFoundError} 404 - If channel not found
 */
export const getChannelById = asyncHandler(async (req, res) => {
    const userId = req.user?.id; // Optional auth
    const { id: channelId } = req.params;

    const result = await channelService.getChannelById(channelId, userId);

    // Handle errors
    if (result.error === 'not_found') {
        throw new NotFoundError(result.message);
    }

    if (result.error) {
        throw new Error(result.message);
    }

    // Success
    successResponse(res, { channel: result.channel }, 'Channel retrieved successfully', 200);
});