import { asyncHandler } from '../middlewares/asyncHandler.middleware.js'
import * as authService from '../services/auth.service.js'
import { ConflictError, UnauthorizedError } from '../utils/errorClasses.util.js';
import { successResponse } from '../utils/response.util.js';

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
    const { username, name, email, password } = req.body;

    const result = await authService.registerUser({
        username,
        name,
        email,
        password
    });

    // Handle errors from service
    if (result.error) {
        if (result.error === 'conflict') {
            throw new ConflictError(result.message);
        }
        throw new Error(result.message);
    }

    // Success
    successResponse(res, result, 'User registered successfully', 201);

});

/**
 * Login user
 * POST /api/auth/login
 */

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await authService.loginUser({ email, password });

    // Handle errors from service
    if (result.error) {
        if (result.error === 'unauthorized') {
            throw new UnauthorizedError(result.message);
        }
        throw new Error(result.message);
    }

    // Success
    successResponse(res, result, 'Login successful', 200);
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    const result = await authService.refreshAccessToken(refreshToken);

    // Handle errors from service
    if (result.error) {
        throw new UnauthorizedError(result.message);
    }

    // Success
    successResponse(res, result, 'Token refreshed successfully', 200);

});

/**
 * Get current user
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
    // req.user is injected & protected by authMiddleware
    successResponse(res, { user: req.user }, 'User data retrieved successfully', 200);
})

/**
 * Logout user (revoke tokens)
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
    // Extract access token from Authorization header
    const authHeader = req.headers.authorization;
    const accessToken = authHeader.substring(7); // Remove "Bearer " prefix

    // Optional: Get refresh token from request body
    const { refreshToken } = req.body;

    const result = await authService.logoutUser(accessToken, refreshToken);

    // Handle errors from service
    if (result.error) {
        throw new Error(result.message);
    }

    // Success
    successResponse(res, result, 'Logout successful', 200);
})
