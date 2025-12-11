// src/services/api.interceptor.js
import api from './api';
import authService from './auth.service';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor de request: añadir token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response: manejar token expirado
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Detectar si el error es 401
    if (error.response?.status === 401 && !originalRequest._retry) {
  if (originalRequest.url.includes('/auth/refresh')) {
    authService.logout();
    return Promise.reject(error);
  }

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then(token => {
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    }).catch(err => Promise.reject(err));
  }

  originalRequest._retry = true;
  isRefreshing = true;

  try {
    const newToken = await authService.refreshToken();
    processQueue(null, newToken);
    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return api(originalRequest);
  } catch (refreshError) {
    processQueue(refreshError, null);
    authService.logout();
    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
}
    return Promise.reject(error);
  }
);

export default api;