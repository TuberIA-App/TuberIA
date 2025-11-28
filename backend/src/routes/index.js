import express from 'express';
import authRoutes from './auth.routes.js';
import channelRoutes from './channel.routes.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/channels', channelRoutes);

// Future routes

/**
 * TODO:
 * /users
 * /videos
 */

export default router;