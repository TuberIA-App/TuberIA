/**
 * @fileoverview Authentication routes configuration.
 * Defines routes for user registration, login, logout, and token management.
 * @module routes/auth
 *
 * @description
 * Available routes:
 * - POST /api/auth/register - Register new user (public)
 * - POST /api/auth/login - User login (public)
 * - POST /api/auth/refresh - Refresh access token (public)
 * - GET /api/auth/me - Get current user (protected)
 * - POST /api/auth/logout - Logout user (protected)
 */

import express from 'express';
import { register, login, refreshToken, getMe, logout } from '../controllers/auth.controller.js';
import { registerValidator, loginValidator, refreshTokenValidator } from '../validators/auth.validator.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

/**
 * Express router for authentication endpoints.
 * @type {import('express').Router}
 */
const router = express.Router();

// Public routes
router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/refresh', refreshTokenValidator, validate, refreshToken);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.post('/logout', authMiddleware, logout);

export default router;
