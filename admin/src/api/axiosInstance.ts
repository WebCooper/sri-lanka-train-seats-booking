import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Single shared Axios instance for all Admin API requests.
 * Configured with:
 * 1. withCredentials: true (sends cookies e.g. better-auth.session_token)
 * 2. Request Interceptor (attaches Bearer token in Authorization header)
 */
export const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Helper to retrieve stored token from localStorage or document cookies
 */
export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  // 1. Check explicit admin_token in localStorage
  const adminToken = localStorage.getItem('admin_token');
  if (adminToken) return adminToken;

  // 2. Check better-auth token in localStorage
  const baToken = localStorage.getItem('better-auth.token');
  if (baToken) return baToken;

  // 3. Fallback to parsing cookie string for better-auth.session_token
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'better-auth.session_token' || name === '__Secure-better-auth.session_token') {
        return decodeURIComponent(value);
      }
    }
  } catch {
    // Ignore cookie parse error
  }

  return null;
};

// Request Interceptor: Attach Bearer token to EVERY request header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Utility helper to extract clean, meaningful error messages from API responses
 */
export const getApiErrorMessage = (err: unknown, defaultFallback = 'An unexpected API error occurred.'): string => {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data;

    if (status === 401) {
      return 'Unauthorized: Your session has expired or is invalid. Please log in again.';
    }
    if (status === 403) {
      return 'Forbidden: You do not have permission to perform this action.';
    }
    if (status === 404) {
      return (typeof data === 'object' && data?.message) ? data.message : 'Resource not found.';
    }
    if (status === 409) {
      return (typeof data === 'object' && data?.message) ? data.message : 'Conflict: Resource already exists.';
    }

    if (data) {
      if (typeof data === 'string' && data.trim()) {
        return data;
      }
      if (Array.isArray(data.message) && data.message.length > 0) {
        return data.message.join(', ');
      }
      if (typeof data.message === 'string' && data.message.trim()) {
        return data.message;
      }
      if (typeof data.error === 'string' && data.error.trim()) {
        return data.error;
      }
    }

    if (err.message) {
      return err.message;
    }
  } else if (err instanceof Error) {
    return err.message;
  }

  return defaultFallback;
};

export default axiosInstance;
