/**
 * @fileoverview User service for user-specific data operations.
 * Provides methods for retrieving user statistics and followed channels.
 * @module services/user
 */

import api from './api';

/**
 * Get dashboard statistics for the authenticated user
 * Private endpoint - requires authentication
 * @returns {Promise<Object>} User stats object
 */
const getStats = async () => {
  try {
    const response = await api.get('/users/me/stats');

    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al obtener estadísticas');
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;

      if (status === 401) {
        throw new Error('Debes iniciar sesión para ver tus estadísticas');
      } else if (status === 500) {
        throw new Error('Error del servidor. Intenta más tarde.');
      }
      
      throw new Error(message || 'Error al obtener estadísticas');
    }
    
    throw new Error(error.message || 'Error de conexión');
  }
};

/**
 * Get list of all channels followed by the authenticated user
 * Private endpoint - requires authentication
 * @returns {Promise<Object>} Object with channels array and count
 */
const getMyChannels = async () => {
  try {
    const response = await api.get('/users/me/channels');

    if (response.data.success) {
      return {
        channels: response.data.data.channels,
        count: response.data.data.count
      };
    }
    
    throw new Error(response.data.message || 'Error al obtener canales');
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;

      if (status === 401) {
        throw new Error('Debes iniciar sesión para ver tus canales');
      } else if (status === 500) {
        throw new Error('Error del servidor. Intenta más tarde.');
      }
      
      throw new Error(message || 'Error al obtener canales');
    }
    
    throw new Error(error.message || 'Error de conexión');
  }
};

/**
 * User service object containing all user-related API methods.
 * @type {Object}
 */
const userService = {
  getStats,
  getMyChannels
};

export default userService;
