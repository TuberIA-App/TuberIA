/**
 * @fileoverview Video controller handling HTTP requests for video operations.
 * Manages video feed retrieval and individual video access.
 * @module controllers/video
 */

import { asyncHandler } from '../middlewares/asyncHandler.middleware.js';
import * as videoService from '../services/video.service.js';
import { successResponse } from '../utils/response.util.js';
import { NotFoundError, ForbiddenError } from '../utils/errorClasses.util.js';
import { getOrSet } from '../utils/cache.js';

/**
 * Gets a personalized video feed for the authenticated user.
 * Results are cached for 60 seconds to improve performance.
 * @route GET /api/users/me/videos
 * @access Private
 * @param {import('express').Request} req - Express request
 * @param {Object} req.user - Authenticated user (from authMiddleware)
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=1] - Page number
 * @param {number} [req.query.limit=20] - Videos per page (max 100)
 * @param {string} [req.query.status] - Filter by status (pending|processing|completed|failed|all)
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>} JSON response with videos array and pagination metadata
 */
export const getMyVideos = asyncHandler(async (req, res) => {
    const userId = req.user.id; // From authMiddleware (toJSON virtual)
    const { page = 1, limit = 20, status } = req.query;

    // Build cache key with all relevant parameters
    const cacheKey = `videos:feed:${userId}:${status || 'all'}:${page}:${limit}`;

    // Use getOrSet with 60 seconds TTL
    const result = await getOrSet(
        cacheKey,
        60, // 60 seconds TTL
        async () => {
            // Execute the original query
            return await videoService.getUserVideoFeed(userId, {
                page,
                limit,
                status: status === 'all' ? undefined : status
            });
        }
    );

    // Handle errors
    if (result.error) {
        throw new Error(result.message);
    }

    // Success
    successResponse(
        res,
        {
            videos: result.videos,
            pagination: result.pagination
        },
        'Video feed retrieved successfully',
        200
    );
});

/**
 * Gets detailed information for a specific video.
 * User must follow the channel to access the video.
 * @route GET /api/videos/:videoId
 * @access Private
 * @param {import('express').Request} req - Express request
 * @param {Object} req.user - Authenticated user (from authMiddleware)
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.videoId - YouTube video ID (11 characters)
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>} JSON response with video details including summary
 * @throws {NotFoundError} 404 - If video not found
 * @throws {ForbiddenError} 403 - If user doesn't follow the channel
 */
export const getVideoById = asyncHandler(async (req, res) => {
    const userId = req.user.id; // From authMiddleware (toJSON virtual)
    const { videoId } = req.params;

    const result = await videoService.getVideoById(userId, videoId);

    // Handle errors
    if (result.error === 'not_found') {
        throw new NotFoundError(result.message);
    }

    if (result.error === 'forbidden') {
        throw new ForbiddenError(result.message);
    }

    if (result.error) {
        throw new Error(result.message);
    }

    // Success
    successResponse(res, { video: result.video }, 'Video retrieved successfully', 200);
});
