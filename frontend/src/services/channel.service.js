// src/services/channel.service.js
import api from './api';

/**
 * Search for a YouTube channel by username or URL
 * Public endpoint - no authentication required
 * @param {string} query - Channel username or URL
 * @returns {Promise<Object>} Channel data
 */
const searchChannel = async (query) => {
  try {
    if (!query || query.trim().length < 2) {
      throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
    }

    const response = await api.get('/channels/search', {
      params: { q: query.trim() }
    });

    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al buscar el canal');
  } catch (error) {
    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;

      if (status === 404) {
        throw new Error('Canal no encontrado');
      } else if (status === 429) {
        throw new Error('Demasiadas solicitudes. Por favor, espera un momento.');
      } else if (status === 400) {
        // Validation errors
        if (error.response.data?.errors) {
          const errorMessages = error.response.data.errors
            .map(err => err.message)
            .join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(message || 'Solicitud inválida');
      } else if (status === 500) {
        if (message?.includes('rate limit')) {
          throw new Error('YouTube está temporalmente no disponible. Intenta más tarde.');
        } else if (message?.includes('timeout')) {
          throw new Error('La búsqueda tardó demasiado. Intenta de nuevo.');
        }
        throw new Error('Error del servidor. Intenta más tarde.');
      }
      
      throw new Error(message || 'Error al buscar el canal');
    }
    
    // Network or other errors
    throw new Error(error.message || 'Error de conexión. Verifica tu internet.');
  }
};

/**
 * Follow a channel
 * Private endpoint - requires authentication
 * @param {string} channelId - MongoDB ObjectId of the channel (from search result)
 * @returns {Promise<Object>} Updated channel data
 */
const followChannel = async (channelId) => {
  try {
    if (!channelId) {
      throw new Error('ID de canal requerido');
    }

    const response = await api.post(`/channels/${channelId}/follow`);

    if (response.data.success) {
      return response.data.data.channel;
    }
    
    throw new Error(response.data.message || 'Error al seguir el canal');
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;

      if (status === 401) {
        throw new Error('Debes iniciar sesión para seguir canales');
      } else if (status === 404) {
        throw new Error('Canal no encontrado');
      } else if (status === 409) {
        throw new Error('Ya sigues este canal');
      } else if (status === 400) {
        throw new Error('ID de canal inválido');
      }
      
      throw new Error(message || 'Error al seguir el canal');
    }
    
    throw new Error(error.message || 'Error de conexión');
  }
};

/**
 * Unfollow a channel
 * Private endpoint - requires authentication
 * @param {string} channelId - MongoDB ObjectId of the channel
 * @returns {Promise<boolean>} Success status
 */
const unfollowChannel = async (channelId) => {
  try {
    if (!channelId) {
      throw new Error('ID de canal requerido');
    }

    const response = await api.delete(`/channels/${channelId}/unfollow`);

    if (response.data.success) {
      return true;
    }
    
    throw new Error(response.data.message || 'Error al dejar de seguir el canal');
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;

      if (status === 401) {
        throw new Error('Debes iniciar sesión');
      } else if (status === 404) {
        if (message?.includes('not following')) {
          throw new Error('No estás siguiendo este canal');
        }
        throw new Error('Canal no encontrado');
      }
      
      throw new Error(message || 'Error al dejar de seguir el canal');
    }
    
    throw new Error(error.message || 'Error de conexión');
  }
};

/**
 * Get all channels followed by the authenticated user
 * Private endpoint - requires authentication
 * @returns {Promise<Object>} Object with channels array and count
 */
const getFollowedChannels = async () => {
  try {
    const response = await api.get('/channels/user/followed');

    if (response.data.success) {
      return {
        channels: response.data.data.channels,
        count: response.data.data.count
      };
    }
    
    throw new Error(response.data.message || 'Error al obtener canales seguidos');
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;

      if (status === 401) {
        throw new Error('Debes iniciar sesión para ver tus canales');
      }
      
      throw new Error(message || 'Error al obtener canales seguidos');
    }
    
    throw new Error(error.message || 'Error de conexión');
  }
};

/**
 * Check if user is following a specific channel
 * Helper function to determine follow status
 * @param {string} channelId - MongoDB ObjectId of the channel
 * @param {Array} followedChannels - Array of followed channels
 * @returns {boolean} Whether the user is following the channel
 */
const isFollowing = (channelId, followedChannels) => {
  return followedChannels.some(channel => channel._id === channelId);
};

const channelService = {
  searchChannel,
  followChannel,
  unfollowChannel,
  getFollowedChannels,
  isFollowing
};

export default channelService;
