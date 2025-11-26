import express from 'express';
import { searchChannel } from '../controllers/channel.controller.js';
import { searchChannelValidator } from '../validators/channel.validator.js';
import { validate } from '../middlewares/validate.middleware.js';
// import { authMiddleware } from '../middlewares/auth.middleware.js'; // Descomentar si quieres proteger la ruta

const router = express.Router();

/**
 * @route   GET /api/channels/search
 * @desc    Buscar canal de YouTube por username o URL
 * @access  Public (cambiar a Private agregando authMiddleware)
 * @query   q - Username (@vegetta777) o URL completa del canal
 */
router.get('/search', searchChannelValidator, validate, searchChannel);

export default router;