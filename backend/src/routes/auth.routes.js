import express from 'express';
import { register, login, refreshToken, getMe } from '../controllers/auth.controller.js';
import { registerValidator, loginValidator, refreshTokenValidator } from '../validators/auth.validator.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/refresh', refreshTokenValidator, validate, refreshToken);

// Protected routes
router.get('/me', authMiddleware, getMe);

export default router;
