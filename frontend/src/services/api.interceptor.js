/**
 * @fileoverview Axios interceptor configuration for authentication.
 * Handles automatic token injection and refresh on 401 responses.
 * @module services/api.interceptor
 */

import api from './api';
import authService from './auth.service';

/**
 * Flag indicating if a token refresh is currently in progress.
 * @type {boolean}
 * @private
 */
let isRefreshing = false;

/**
 * Queue of failed requests waiting for token refresh.
 * @type {Array<{resolve: Function, reject: Function}>}
 * @private
 */
let failedQueue = [];

/**
 * Processes queued requests after token refresh completes.
 * Resolves or rejects all pending promises based on refresh result.
 * @param {Error|null} error - Error if refresh failed, null if successful
 * @param {string|null} token - New access token if refresh succeeded
 * @private
 */
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

/**
 * Request interceptor: automatically adds authorization token.
 * Injects Bearer token from localStorage into request headers.
 */
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

/**
 * Response interceptor: handles token expiration.
 * On 401 response, attempts to refresh token and retry the original request.
 * Queues concurrent requests during refresh to prevent multiple refresh calls.
 */
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