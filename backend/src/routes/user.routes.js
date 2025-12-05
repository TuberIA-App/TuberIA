import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { getUserStats } from '../controllers/user.controller.js';
import { getFollowedChannels } from '../controllers/channel.controller.js';

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
