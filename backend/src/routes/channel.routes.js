/**
 * @fileoverview Channel routes configuration.
 * Defines routes for channel search, follow/unfollow, and retrieval.
 * @module routes/channel
 *
 * @description
 * Available routes:
 * - GET /api/channels/user/followed - Get followed channels (protected)
 * - POST /api/channels/:channelId/follow - Follow a channel (protected)
 * - DELETE /api/channels/:channelId/unfollow - Unfollow a channel (protected)
 * - GET /api/channels/search?q= - Search for channels (public)
 * - GET /api/channels/:id - Get channel by ID (public, optional auth)
 */

import express from 'express';
import {
    searchChannel,
    followChannel,
    unfollowChannel,
    getFollowedChannels,
    getChannelById
} from '../controllers/channel.controller.js';
import {
    searchChannelValidator,
    followChannelValidator,
    unfollowChannelValidator,
    getChannelByIdValidator
} from '../validators/channel.validator.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { optionalAuthMiddleware } from '../middlewares/optionalAuth.middleware.js';

/**
 * Express router for channel endpoints.
 * @type {import('express').Router}
 */
const router = express.Router();

/**
 * @route   GET /api/channels/user/followed
 * @desc    Get all channels followed by authenticated user
 * @access  Private
 */
router.get('/user/followed', authMiddleware, getFollowedChannels);

/**
 * @route   POST /api/channels/:channelId/follow
 * @desc    Follow a channel
 * @access  Private
 */
router.post(
    '/:channelId/follow',
    authMiddleware,
    followChannelValidator,
    validate,
    followChannel
);

/**
 * @route   DELETE /api/channels/:channelId/unfollow
 * @desc    Unfollow a channel
 * @access  Private
 */
router.delete(
    '/:channelId/unfollow',
    authMiddleware,
    unfollowChannelValidator,
    validate,
    unfollowChannel
);

/**
 * @route   GET /api/channels/search
 * @desc    Search YouTube channel by username or URL
 * @access  Public (design decision - allows exploration without registration)
 * @query   q - Username (@vegetta777) or full channel URL
 */
router.get('/search', searchChannelValidator, validate, searchChannel);

/**
 * @route   GET /api/channels/:id
 * @desc    Get channel details by YouTube channel ID
 * @access  Public (optional auth for isFollowing status)
 * @param   id - YouTube channel ID (UCxxxxxx format)
 */
router.get(
    '/:id',
    optionalAuthMiddleware,
    getChannelByIdValidator,
    validate,
    getChannelById
);

export default router;