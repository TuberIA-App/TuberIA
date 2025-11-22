import { asyncHandler } from '../middlewares/asyncHandler.middleware.js';
import * as channelSearchService from '../services/youtube/channelSearch.service.js';
import { successResponse } from '../utils/response.util.js';

/**
 * Controller para buscar canales de YouTube
 * @route GET /api/channels/search?q=username_or_url
 * @access Public (puede cambiarse a Private agregando authMiddleware)
 */
export const searchChannel = asyncHandler(async (req, res) => {
    const { q } = req.query;

    // Llamar al service de búsqueda
    const channelInfo = await channelSearchService.searchChannel(q);

    // Retornar respuesta exitosa
    successResponse(res, channelInfo, 'Channel found successfully', 200);
});