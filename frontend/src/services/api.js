/**
 * @fileoverview Axios API instance configuration.
 * Creates a configured axios instance for API requests.
 * @module services/api
 */

import axios from 'axios';

/**
 * Base URL for API requests.
 * Uses environment variable or falls back to localhost.
 * @type {string}
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Configured axios instance for API communication.
 * Pre-configured with base URL and JSON content type.
 * Token handling and refresh logic is added via interceptors in api.interceptor.js.
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
});

export default api;
