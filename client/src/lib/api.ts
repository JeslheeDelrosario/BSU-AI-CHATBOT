// client/src/lib/api.ts
import axios, { AxiosError } from 'axios';

// Production API URL from environment, fallback to relative path for dev proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout — good default
});

// Request interceptor - add auth token if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Optional: remove or comment out in production
      // console.log(`[API REQUEST] Adding Bearer token to: ${config.url}`);
    } else {
      // Optional: remove or comment out in production
      // console.warn(`[API REQUEST] NO TOKEN FOUND for: ${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Public routes that should NEVER trigger auto-redirect on 401
const PUBLIC_PATHS = ['/', '/login', '/signup', '/faqs'];

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Remove token (cleanup)
      localStorage.removeItem('token');

      // IMPORTANT CHANGE: Only redirect if NOT on a public route
      const currentPath = window.location.pathname;
      const isPublicRoute = PUBLIC_PATHS.some(p => currentPath === p || currentPath.startsWith(p));

      if (!isPublicRoute) {
        // Redirect only on protected/private pages
        window.location.href = '/login';
      }

      // Optional: You could also add a toast/message here later if you want
      // e.g. "Session expired. Please log in again." — but only on private routes
    }

    // Handle network errors (keep original logging)
    if (!error.response) {
      console.error('Network error:', error.message);
    }

    // Always reject so the caller can handle it (e.g. show error UI)
    return Promise.reject(error);
  }
);

export default api;