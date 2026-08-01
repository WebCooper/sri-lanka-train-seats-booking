import axios from 'axios';

/**
 * Single shared Axios instance for all Admin API requests.
 * Reads the backend server base URL from environment variable VITE_API_BASE_URL.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default axiosInstance;
