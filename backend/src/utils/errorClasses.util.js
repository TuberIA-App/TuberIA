/**
 * Base Application Error Class
 */
export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends AppError {
    constructor(message = 'Bad Request') {
        super(message, 400)
    }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403)
    }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends AppError {
    constructor(message = 'Resource not Found') {
        super(message, 404);
    }
}

/**
 * 409 Conflict
 */
export class ConflictError extends AppError {
    constructor(message = 'Conflict') {
        super(message, 409);
    }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends AppError {
    constructor(message = 'Internal Server Error') {
        super(message, 500)
    }
}