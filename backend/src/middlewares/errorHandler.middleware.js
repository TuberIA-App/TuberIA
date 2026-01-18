/**
 * @fileoverview Global error handling middleware for Express.
 * Catches and formats all errors into consistent JSON responses.
 * @module middlewares/errorHandler
 */

import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorClasses.util.js';
import { errorResponse } from '../utils/response.util.js';

/**
 * Global error handling middleware for Express.
 * Handles operational errors (AppError), Mongoose errors, JWT errors,
 * and unknown errors with appropriate HTTP status codes and messages.
 *
 * In production, internal error messages are hidden for security.
 *
 * @param {Error} err - Error object
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function (required for error middleware signature)
 * @returns {void}
 * @example
 * // Usage in app.js (must be last middleware)
 * app.use(errorHandler);
 */
export const errorHandler = (err, req, res, next) => {
    // Log error
    logger.error('Error occurred', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });

    // Operational errors (AppError instance)
    if (err.isOperational) {
        return errorResponse(res, err.message, err.statusCode);
    }

    // Mongoose validation error
    if (err instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
        return errorResponse(res, 'Validation error', 400, errors);
    }

    // Mongoose cast error (invalid ObjectId)
    if (err instanceof mongoose.Error.CastError) {
        return errorResponse(res, 'Invalid ID format', 400);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return errorResponse(res, `${field} already exists`, 409);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return errorResponse(res, 'Invalid token', 401);
    }

    if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token expired', 401);
    }

    // Default error (unknown errors)
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

    return errorResponse(res, message, statusCode);
}