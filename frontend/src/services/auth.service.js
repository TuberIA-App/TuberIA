// src/services/auth.service.js
import api from './api';

// Registro de usuario
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

// Inicio de sesión
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

// Refrescar token
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

// Obtener usuario actual
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

// Obtener token de acceso
const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

// Obtener refresh token
const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

// Cerrar sesión
const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Verificar si el usuario está autenticado
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
