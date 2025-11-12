import User from "../model/User.js";
import { UnauthorizedError } from "../utils/errorClasses.util.js";
import { verifyAccessToken } from "../utils/jwt.util.js";
import { asyncHandler } from "./asyncHandler.middleware.js";
import logger from "../utils/logger.js";

/**
 * Middleware to verify JWT tokens and authenticate the user
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

        // Find user (we deleted the old .lean() implementation here so we can leverage the model's toJSON transform, also we avoid violating the DRY principle)
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            throw new UnauthorizedError("User not found");
        }

        // Attach user to request object using toJSON() which includes virtuals and proper transforms
        req.user = user.toJSON();

        next();

    } catch (error) {
        logger.error(`Auth middleware error, { error: ${error.message} }`)

        if (error.name === 'JsonWebTokenError') {
            throw new UnauthorizedError('Invalid token');
        }
    }
})