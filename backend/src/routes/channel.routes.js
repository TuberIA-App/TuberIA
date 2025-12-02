import express from 'express';
import {
    searchChannel,
    followChannel,
    unfollowChannel,
    getFollowedChannels
} from '../controllers/channel.controller.js';
import {
    searchChannelValidator,
    followChannelValidator,
    unfollowChannelValidator
} from '../validators/channel.validator.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

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
 * @desc    Buscar canal de YouTube por username o URL
 * @access  Public (decisión de diseño - permite exploración sin registro)
 * @query   q - Username (@vegetta777) o URL completa del canal
 */
router.get('/search', searchChannelValidator, validate, searchChannel);

export default router;