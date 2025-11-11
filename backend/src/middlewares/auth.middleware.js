import User from "../model/User";
import { UnauthorizedError } from "../utils/errorClasses.util";
import { verifyAccessToken } from "../utils/jwt.util";
import { asyncHandler } from "./asyncHandler.middleware";

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

        // Find user
        const user = await User.findById(decoded.userId).select('-password -__v').lean(); // Even if we already hide the password and the __v on the model, we add this just in case

        if (!user) {
            throw new UnauthorizedError("User not found");
        }

        // Attach user to the request object
        req.user = user.toJSON();

        next();

    } catch (error) {
        logger.error(`Auth middleware error, { error: ${error.message} }`)

        if (error.name === 'JsonWebTokenError') {
            throw new UnauthorizedError('Invalid token');
        }
    }
})