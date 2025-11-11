import express from 'express';
import authRoutes from './auth.routes.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);

// Future routes

/**
 * TODO:
 * /users
 * /channels
 * /videos
 */

export default router;
