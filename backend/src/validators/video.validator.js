/**
 * @fileoverview Express-validator validation rules for video endpoints.
 * Defines validation chains for video feed and individual video retrieval.
 * @module validators/video
 */

import { query, param } from 'express-validator';

/**
 * Validation rules for video feed endpoint (GET /api/users/me/videos).
 * Validates optional pagination and filter query parameters.
 * @type {import('express-validator').ValidationChain[]}
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
 * Validation rules for get video by ID endpoint (GET /api/videos/:videoId).
 * Validates YouTube video ID format (exactly 11 characters).
 * @type {import('express-validator').ValidationChain[]}
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
