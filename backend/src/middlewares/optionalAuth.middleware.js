/**
 * @fileoverview Optional authentication middleware for routes with mixed access.
 * Provides user context when available without requiring authentication.
 * @module middlewares/optionalAuth
 */

import jwt from 'jsonwebtoken';
import User from '../model/User.js';
import { secrets } from '../config/secrets.js';

/**
 * Optional authentication middleware.
 * If a valid token is provided, attaches user to req.user.
 * If token is invalid or missing, continues without error (req.user will be undefined).
 * Useful for routes that have different behavior for authenticated vs anonymous users.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 * @example
 * // Usage in routes - get channel with optional isFollowing status
 * router.get('/channel/:id', optionalAuthMiddleware, getChannelById);
 *
 * // In controller
 * const userId = req.user?.id; // undefined if not authenticated
 */
export const optionalAuthMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided, continue without auth
            return next();
        }

        const token = authHeader.substring(7);

        // Verify token
        const decoded = jwt.verify(token, secrets.jwtSecret);

        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');

        if (user) {
            // Attach user to request object
            req.user = user;
        }

        next();
    } catch (error) {
        // Invalid token, but don't fail - just continue without auth
        next();
    }
};
