import { asyncHandler } from '../middlewares/asyncHandler.middleware.js';
import * as channelSearchService from '../services/youtube/channelSearch.service.js';
import * as channelService from '../services/channel.service.js';
import { successResponse } from '../utils/response.util.js';
import { NotFoundError, ConflictError } from '../utils/errorClasses.util.js';

/**
 * Controller para buscar canales de YouTube
 * @route GET /api/channels/search?q=username_or_url
 * @access Public (puede cambiarse a Private agregando authMiddleware)
 */
export const searchChannel = asyncHandler(async (req, res) => {
    const { q } = req.query;

    // Llamar al service de búsqueda
    const channelInfo = await channelSearchService.searchChannel(q);

    // Retornar respuesta exitosa
    successResponse(res, channelInfo, 'Channel found successfully', 200);
});

/**
 * Follow a channel
 * @route POST /api/channels/:channelId/follow
 * @access Private
 * @body channelData - Optional channel data (name, username, thumbnail, channelId)
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
 * Unfollow a channel
 * @route DELETE /api/channels/:channelId/unfollow
 * @access Private
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
 * Get all followed channels for authenticated user
 * @route GET /api/channels/user/followed
 * @access Private
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