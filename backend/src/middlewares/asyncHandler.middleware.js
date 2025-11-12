/**
 * Wrapper for async route handlers
 * Catches the errors and passes them to error handling midleware
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};