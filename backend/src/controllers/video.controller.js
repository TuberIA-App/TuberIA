import { asyncHandler } from '../middlewares/asyncHandler.middleware.js';
import * as videoService from '../services/video.service.js';
import { successResponse } from '../utils/response.util.js';
import { NotFoundError, ForbiddenError } from '../utils/errorClasses.util.js';

/**
 * Get personalized video feed for authenticated user
 * @route GET /api/users/me/videos
 * @access Private
 */
export const getMyVideos = asyncHandler(async (req, res) => {
    const userId = req.user.id; // From authMiddleware (toJSON virtual)
    const { page, limit, status } = req.query;

    const result = await videoService.getUserVideoFeed(userId, {
        page,
        limit,
        status: status === 'all' ? undefined : status
    });

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
 * Get specific video details
 * @route GET /api/videos/:videoId
 * @access Private
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
