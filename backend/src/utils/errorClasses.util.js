/**
 * @fileoverview Custom error classes for standardized API error handling.
 * All errors extend from AppError to enable error type detection and
 * consistent HTTP status code mapping.
 * @module utils/errorClasses
 */

/**
 * Base application error class for operational errors.
 * All custom HTTP errors extend from this class.
 * @class AppError
 * @extends Error
 * @property {number} statusCode - HTTP status code for the error
 * @property {boolean} isOperational - Flag to distinguish operational errors from programming errors
 * @example
 * throw new AppError('Something went wrong', 500);
 */
export class AppError extends Error {
    /**
     * Creates a new AppError instance
     * @param {string} message - Error message to display
     * @param {number} [statusCode=500] - HTTP status code
     */
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * 400 Bad Request error for invalid client requests.
 * Use when request validation fails or input is malformed.
 * @class BadRequestError
 * @extends AppError
 * @example
 * throw new BadRequestError('Invalid email format');
 */
export class BadRequestError extends AppError {
    /**
     * Creates a new BadRequestError instance
     * @param {string} [message='Bad Request'] - Error message
     */
    constructor(message = 'Bad Request') {
        super(message, 400)
    }
}

/**
 * 401 Unauthorized error for authentication failures.
 * Use when credentials are missing, invalid, or expired.
 * @class UnauthorizedError
 * @extends AppError
 * @example
 * throw new UnauthorizedError('Invalid or expired token');
 */
export class UnauthorizedError extends AppError {
    /**
     * Creates a new UnauthorizedError instance
     * @param {string} [message='Unauthorized'] - Error message
     */
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

/**
 * 403 Forbidden error for authorization failures.
 * Use when user is authenticated but lacks permission.
 * @class ForbiddenError
 * @extends AppError
 * @example
 * throw new ForbiddenError('Admin access required');
 */
export class ForbiddenError extends AppError {
    /**
     * Creates a new ForbiddenError instance
     * @param {string} [message='Forbidden'] - Error message
     */
    constructor(message = 'Forbidden') {
        super(message, 403)
    }
}

/**
 * 404 Not Found error for missing resources.
 * Use when a requested resource does not exist.
 * @class NotFoundError
 * @extends AppError
 * @example
 * throw new NotFoundError('Video not found');
 */
export class NotFoundError extends AppError {
    /**
     * Creates a new NotFoundError instance
     * @param {string} [message='Resource not Found'] - Error message
     */
    constructor(message = 'Resource not Found') {
        super(message, 404);
    }
}

/**
 * 409 Conflict error for resource conflicts.
 * Use when a request conflicts with existing data (e.g., duplicate email).
 * @class ConflictError
 * @extends AppError
 * @example
 * throw new ConflictError('Email already registered');
 */
export class ConflictError extends AppError {
    /**
     * Creates a new ConflictError instance
     * @param {string} [message='Conflict'] - Error message
     */
    constructor(message = 'Conflict') {
        super(message, 409);
    }
}

/**
 * 500 Internal Server Error for unexpected server failures.
 * Use when an unexpected error occurs during request processing.
 * @class InternalServerError
 * @extends AppError
 * @example
 * throw new InternalServerError('Database connection failed');
 */
export class InternalServerError extends AppError {
    /**
     * Creates a new InternalServerError instance
     * @param {string} [message='Internal Server Error'] - Error message
     */
    constructor(message = 'Internal Server Error') {
        super(message, 500)
    }
}