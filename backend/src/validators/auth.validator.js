import { body } from 'express-validator';

/**
 * Validation rules for user registration
 */
export const registerValidator = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .isAlphanumeric()
        .withMessage('Username must contain only letters and numbers'),
    
    body('name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Name must not exceed 100 characters'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
        .withMessage('Password must contain at least one letter and one number')
];

/**
 * Validation rules for user login
 */
export const loginValidator = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

/**
 * Validation rules for refresh token
 */
export const refreshTokenValidator = [
    body('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required')
        .isJWT()
        .withMessage('Invalid token format')
];
