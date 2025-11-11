import mongoose from 'mongoose';
import logger from '../utils/logger';
import { AppError } from '../utils/errorClasses.util';
import { errorResponse } from '../utils/response.util';

/**
 * Global error handling middleware
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