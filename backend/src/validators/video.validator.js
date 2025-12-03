import { query, param } from 'express-validator';

/**
 * Validator for GET /api/users/me/videos
 * Validates pagination and filter query parameters
 */
export const getMyVideosValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('status')
    .optional()
    .isIn(['pending', 'processing', 'completed', 'failed', 'all'])
    .withMessage('Status must be one of: pending, processing, completed, failed, all')
];

/**
 * Validator for GET /api/videos/:videoId
 * Validates videoId parameter
 */
export const getVideoByIdValidator = [
  param('videoId')
    .trim()
    .notEmpty()
    .withMessage('Video ID is required')
    .isString()
    .withMessage('Video ID must be a string')
    .isLength({ min: 11, max: 11 })
    .withMessage('Video ID must be 11 characters (YouTube format)')
];
