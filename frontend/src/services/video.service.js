/**
 * @fileoverview Video service for video feed and detail operations.
 * Provides methods for retrieving personalized video feeds and individual videos.
 * @module services/video
 */

import api from './api';

/**
 * Get personalized video feed for authenticated user
 * Private endpoint - requires authentication
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Videos per page (default: 20, max: 100)
 * @param {string} params.status - Filter by status (pending|processing|completed|failed|all)
 * @returns {Promise<Object>} Object with videos array and pagination info
 */
const getMyVideos = async ({ page = 1, limit = 20, status = 'all' } = {}) => {
  try {
    const params = { page, limit };
    if (status && status !== 'all') {
      params.status = status;
    }

    const response = await api.get('/users/me/videos', { params });

    if (response.data.success) {
      return {
        videos: response.data.data.videos,
        pagination: response.data.data.pagination
      };
    }
    
    throw new Error(response.data.message || 'Error al obtener videos');
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;

      if (status === 401) {
        throw new Error('Debes iniciar sesión para ver tus videos');
      } else if (status === 400) {
        throw new Error(message || 'Parámetros inválidos');
      } else if (status === 500) {
        throw new Error('Error del servidor. Intenta más tarde.');
      }
      
      throw new Error(message || 'Error al obtener videos');
    }
    
    throw new Error(error.message || 'Error de conexión');
  }
};

/**
 * Get specific video details by ID
 * Private endpoint - requires authentication
 * @param {string} videoId - MongoDB ObjectId of the video
 * @returns {Promise<Object>} Video object with full details
 */
const getVideoById = async (videoId) => {
  try {
    if (!videoId) {
      throw new Error('ID de video requerido');
    }

    const response = await api.get(`/videos/${videoId}`);

    if (response.data.success) {
      return response.data.data.video;
    }
    
    throw new Error(response.data.message || 'Error al obtener el video');
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;

      if (status === 401) {
        throw new Error('Debes iniciar sesión para ver este video');
      } else if (status === 404) {
        throw new Error('Video no encontrado');
      } else if (status === 403) {
        throw new Error('No tienes permiso para ver este video');
      } else if (status === 400) {
        throw new Error('ID de video inválido');
      }
      
      throw new Error(message || 'Error al obtener el video');
    }
    
    throw new Error(error.message || 'Error de conexión');
  }
};

/**
 * Video service object containing all video-related API methods.
 * @type {Object}
 */
const videoService = {
  getMyVideos,
  getVideoById
};

export default videoService;
