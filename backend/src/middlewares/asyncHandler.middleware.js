/**
 * @fileoverview Async handler middleware for Express route error handling.
 * Wraps async route handlers to automatically catch and forward errors.
 * @module middlewares/asyncHandler
 */

/**
 * Wraps an async route handler to catch errors and pass them to Express error middleware.
 * Eliminates the need for try-catch blocks in every async route handler.
 * @param {Function} fn - Async route handler function (req, res, next) => Promise
 * @returns {Function} Express middleware function that catches promise rejections
 * @example
 * // Instead of:
 * router.get('/users', async (req, res, next) => {
 *   try {
 *     const users = await User.find();
 *     res.json(users);
 *   } catch (error) {
 *     next(error);
 *   }
 * });
 *
 * // Use:
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};