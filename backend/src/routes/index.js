import express from 'express';
import authRoutes from './auth.routes.js';
import channelRoutes from './channel.routes.js';
import videoRoutes from './video.routes.js';
import healthRoutes from './health.routes.js';

const router = express.Router();

// Health check route (no /api prefix)
router.use('/', healthRoutes);

// Mount routes
router.use('/auth', authRoutes);
router.use('/channels', channelRoutes);
router.use('/', videoRoutes);

// Future routes
/**
 * TODO:
 * /users
 */

export default router;