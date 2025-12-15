/**
 * @fileoverview Express-validator validation rules for channel endpoints.
 * Defines validation chains for channel search, follow/unfollow, and retrieval.
 * @module validators/channel
 */

import { query, param } from 'express-validator';

/**
 * Validation rules for channel search endpoint (GET /api/channels/search).
 * Validates the 'q' query parameter (channel username or URL).
 * @type {import('express-validator').ValidationChain[]}
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
 * Validation rules for follow channel endpoint (POST /api/channels/:channelId/follow).
 * Validates channelId parameter is a valid MongoDB ObjectId.
 * @type {import('express-validator').ValidationChain[]}
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
 * Validation rules for unfollow channel endpoint (DELETE /api/channels/:channelId/unfollow).
 * Validates channelId parameter is a valid MongoDB ObjectId.
 * @type {import('express-validator').ValidationChain[]}
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
 * Validation rules for get channel by ID endpoint (GET /api/channels/:id).
 * Validates YouTube channel ID format (UCxxxxxx pattern).
 * @type {import('express-validator').ValidationChain[]}
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