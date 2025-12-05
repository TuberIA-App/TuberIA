import jwt from 'jsonwebtoken';
import User from '../model/User.js';
import { secrets } from '../config/secrets.js';

/**
 * Optional Authentication Middleware
 * If token is provided and valid, attaches user to req.user
 * If token is invalid or missing, continues without error
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
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
