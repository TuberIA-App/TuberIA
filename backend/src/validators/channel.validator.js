import { query } from 'express-validator';

/**
 * Validator para el endpoint de búsqueda de canales
 * Valida el query parameter 'q' (username o URL del canal)
 */
export const searchChannelValidator = [
    query('q')
        .trim()
        .notEmpty()
        .withMessage('Search query is required')
        .isLength({ min: 2 })
        .withMessage('Search query must be at least 2 characters long')
        .isString()
        .withMessage('Search query must be a string')
];