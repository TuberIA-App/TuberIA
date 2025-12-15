/**
 * @fileoverview Authentication service for user registration, login, and token management.
 * Handles localStorage persistence of tokens and user data.
 * @module services/auth
 */

import api from './api';

/**
 * @typedef {Object} User
 * @property {string} id - User's unique identifier
 * @property {string} username - User's username
 * @property {string} [name] - User's display name
 * @property {string} email - User's email address
 */

/**
 * @typedef {Object} AuthResponse
 * @property {boolean} success - Whether the request was successful
 * @property {Object} data - Response data
 * @property {string} data.accessToken - JWT access token
 * @property {string} data.refreshToken - JWT refresh token
 * @property {User} data.user - User object
 */

/**
 * Registers a new user account.
 * Stores tokens and user data in localStorage on success.
 * @param {Object} userData - Registration data
 * @param {string} userData.username - Unique username
 * @param {string} [userData.name] - Display name
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Password (min 8 characters)
 * @returns {Promise<AuthResponse>} Authentication response with tokens and user
 * @throws {Error} If registration fails or validation errors occur
 * @example
 * const response = await register({
 *   username: 'john_doe',
 *   email: 'john@example.com',
 *   password: 'securePassword123'
 * });
 */
const register = async ({ username, name, email, password }) => {
  try {
    const response = await api.post('/auth/register', {
      username,
      name,
      email,
      password
    });

    // Verificar respuesta exitosa
    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken, user } = response.data.data;
      
      // Guardar tokens y usuario
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    }
    
    throw new Error(response.data.message || 'Error en el registro');
  } catch (error) {
    // Manejar errores de validación
    if (error.response?.data?.errors) {
      const errorMessages = error.response.data.errors
        .map(err => err.message)
        .join(', ');
      throw new Error(errorMessages);
    }
    throw new Error(error.response?.data?.message || 'Error en el registro');
  }
};

/**
 * Logs in a user with email and password.
 * Stores tokens and user data in localStorage on success.
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<AuthResponse>} Authentication response with tokens and user
 * @throws {Error} If credentials are invalid or server error occurs
 * @example
 * const response = await login('john@example.com', 'password123');
 */
const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    });

    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken, user } = response.data.data;
      
      // Guardar tokens y usuario
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    }
    
    throw new Error(response.data.message || 'Error en el inicio de sesión');
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Credenciales inválidas');
  }
};

/**
 * Refreshes the access token using the stored refresh token.
 * Updates localStorage with new access token on success.
 * Logs out user if refresh fails.
 * @returns {Promise<string>} New access token
 * @throws {Error} If no refresh token available or refresh fails
 */
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/auth/refresh', {
      refreshToken
    });

    if (response.data.success && response.data.data) {
      const { accessToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      return accessToken;
    }
    
    throw new Error('Token refresh failed');
  } catch (error) {
    // Si falla el refresh, cerrar sesión
    logout();
    throw error;
  }
};

/**
 * Retrieves the current user from localStorage.
 * @returns {User|null} User object or null if not logged in
 */
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};

/**
 * Retrieves the access token from localStorage.
 * @returns {string|null} Access token or null if not stored
 */
const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Retrieves the refresh token from localStorage.
 * @returns {string|null} Refresh token or null if not stored
 */
const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

/**
 * Logs out the current user.
 * Clears all auth data from localStorage.
 */
const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

/**
 * Checks if a user is currently authenticated.
 * Verifies both token and user data exist in localStorage.
 * @returns {boolean} True if user is authenticated, false otherwise
 */
const isAuthenticated = () => {
  const token = getAccessToken();
  const user = getCurrentUser();
  return !!(token && user);
};

const authService = {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  getAccessToken,
  getRefreshToken,
  isAuthenticated
};

export default authService;
