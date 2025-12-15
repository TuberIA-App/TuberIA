/**
 * @fileoverview JWT authentication middleware for protected routes.
 * Verifies access tokens, checks blacklist, and attaches user to request.
 * @module middlewares/auth
 */

import User from "../model/User.js";
import { UnauthorizedError } from "../utils/errorClasses.util.js";
import { verifyAccessToken } from "../utils/jwt.util.js";
import { asyncHandler } from "./asyncHandler.middleware.js";
import logger from "../utils/logger.js";
import { isBlacklisted } from "../services/tokenBlacklist.service.js";

/**
 * Middleware that verifies JWT access tokens and authenticates requests.
 * Extracts token from Authorization header, verifies signature and expiration,
 * checks if token is blacklisted, and attaches user to req.user.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {Promise<void>}
 * @throws {UnauthorizedError} 401 - If no token provided
 * @throws {UnauthorizedError} 401 - If token is invalid, expired, or blacklisted
 * @throws {UnauthorizedError} 401 - If user not found in database
 * @example
 * // Usage in routes
 * router.get('/protected', authMiddleware, protectedHandler);
 */
export const authMiddleware = asyncHandler(async (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('No token provided');
    }

    // Extract token (and remove the "Bearer " prefix)
    const token = authHeader.substring(7);

    try {
        // Verify the token
        const decoded = verifyAccessToken(token);

        // Check if token is blacklisted (revoked)
        const tokenIsBlacklisted = await isBlacklisted(token);
        if (tokenIsBlacklisted) {
            throw new UnauthorizedError('Token has been revoked');
        }

        // Find user (we deleted the old .lean() implementation here so we can leverage the model's toJSON transform, also we avoid violating the DRY principle)
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            throw new UnauthorizedError("User not found");
        }

        // Attach user to request object using toJSON() which includes virtuals and proper transforms
        req.user = user.toJSON();

        next();

    } catch (error) {
        logger.error('Auth middleware error', {
            errorName: error.name,
            errorMessage: error.message
        });

        // Handle JWT-specific errors
        if (error.name === 'JsonWebTokenError') {
            throw new UnauthorizedError('Invalid token');
        }

        if (error.name === 'TokenExpiredError') {
            throw new UnauthorizedError('Token expired');
        }

        if (error.name === 'NotBeforeError') {
            throw new UnauthorizedError('Token not active yet');
        }

        // Re-throw other errors (database, etc.)
        throw error;
    }
})