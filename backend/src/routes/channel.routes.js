import express from 'express';
import { searchChannel } from '../controllers/channel.controller.js';
import { searchChannelValidator } from '../validators/channel.validator.js';
import { validate } from '../middlewares/validate.middleware.js';
// authMiddleware no es necesario - este endpoint es público intencionalmente
// Las operaciones de seguimiento de canales (follow/unfollow) usarán authMiddleware

const router = express.Router();

/**
 * @route   GET /api/channels/search
 * @desc    Buscar canal de YouTube por username o URL
 * @access  Public (decisión de diseño - permite exploración sin registro)
 * @query   q - Username (@vegetta777) o URL completa del canal
 */
router.get('/search', searchChannelValidator, validate, searchChannel);

export default router;