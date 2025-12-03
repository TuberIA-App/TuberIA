import { query, param } from 'express-validator';

/**
 * Validator para el endpoint de búsqueda de canales
 * Valida el query parameter 'q' (username o URL del canal)
 */
export const searchChannelValidator = [
    query('q')
        .trim()
        .notEmpty()
        .withMessage('Search query is required')
        .isLength({ min: 2 })
        .withMessage('Search query must be at least 2 characters long')
        .isString()
        .withMessage('Search query must be a string')
];

/**
 * Validator for follow channel endpoint
 * Validates channelId parameter is a valid MongoDB ObjectId
 */
export const followChannelValidator = [
    param('channelId')
        .trim()
        .notEmpty()
        .withMessage('Channel ID is required')
        .isMongoId()
        .withMessage('Invalid channel ID format')
];

/**
 * Validator for unfollow channel endpoint
 * Validates channelId parameter is a valid MongoDB ObjectId
 */
export const unfollowChannelValidator = [
    param('channelId')
        .trim()
        .notEmpty()
        .withMessage('Channel ID is required')
        .isMongoId()
        .withMessage('Invalid channel ID format')
];

/**
 * Validator for get channel by ID endpoint
 * Validates id parameter (YouTube channel ID format: UCxxxxxx)
 */
export const getChannelByIdValidator = [
    param('id')
        .trim()
        .notEmpty()
        .withMessage('Channel ID is required')
        .isString()
        .withMessage('Channel ID must be a string')
        .matches(/^UC[a-zA-Z0-9_-]+$/)
        .withMessage('Invalid YouTube channel ID format (expected: UCxxxxxx)')
        .isLength({ min: 3, max: 30 })
        .withMessage('Channel ID must be between 3 and 30 characters')
];