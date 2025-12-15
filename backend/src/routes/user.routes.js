/**
 * @fileoverview User routes configuration.
 * Defines routes for user-specific data like stats and channels.
 * @module routes/user
 *
 * @description
 * Available routes:
 * - GET /api/users/me/stats - Get user dashboard statistics (protected)
 * - GET /api/users/me/channels - Get user's followed channels (protected)
 */

import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { getUserStats } from '../controllers/user.controller.js';
import { getFollowedChannels } from '../controllers/channel.controller.js';

/**
 * Express router for user endpoints.
 * @type {import('express').Router}
 */
const router = express.Router();

/**
 * @route   GET /api/users/me/stats
 * @desc    Get user dashboard statistics
 * @access  Private
 */
router.get('/users/me/stats', authMiddleware, getUserStats);

/**
 * @route   GET /api/users/me/channels
 * @desc    Get all channels followed by authenticated user
 * @access  Private
 */
router.get('/users/me/channels', authMiddleware, getFollowedChannels);

export default router;
