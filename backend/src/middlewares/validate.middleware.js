import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/response.util';

/**
 * Middleware to check validation results
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Format the errors to array of { field, message }
        const formattedErrors = errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg
        }));

        return errorResponse(
            res,
            'Validation failed',
            400,
            formattedErrors
        );
    }

    next();

}