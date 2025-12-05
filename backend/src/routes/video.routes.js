import express from 'express';
import {
    getMyVideos,
    getVideoById
} from '../controllers/video.controller.js';
import {
    getMyVideosValidator,
    getVideoByIdValidator
} from '../validators/video.validator.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/users/me/videos
 * @desc    Get personalized video feed for authenticated user
 * @access  Private
 * @query   page (optional, default: 1) - Page number
 * @query   limit (optional, default: 20, max: 100) - Videos per page
 * @query   status (optional) - Filter by status (pending|processing|completed|failed|all)
 */
router.get(
    '/users/me/videos',
    authMiddleware,
    getMyVideosValidator,
    validate,
    getMyVideos
);

/**
 * @route   GET /api/videos/:videoId
 * @desc    Get specific video details
 * @access  Private
 */
router.get(
    '/videos/:videoId',
    authMiddleware,
    getVideoByIdValidator,
    validate,
    getVideoById
);

export default router;
