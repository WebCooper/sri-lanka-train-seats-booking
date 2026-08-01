import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  const passengerToken = localStorage.getItem('passenger_token');
  if (passengerToken) return passengerToken;

  const baToken = localStorage.getItem('better-auth.token');
  if (baToken) return baToken;

  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'better-auth.session_token' || name === '__Secure-better-auth.session_token') {
        return decodeURIComponent(value);
      }
    }
  } catch {
    // Ignore
  }

  return null;
};

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

export const getApiErrorMessage = (err: unknown, defaultFallback = 'An unexpected error occurred.'): string => {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data;

    if (status === 401) {
      return 'Session expired. Please log in to your account.';
    }
    if (status === 403) {
      return 'Access denied. You do not have permission to access this resource.';
    }
    if (status === 404) {
      return (typeof data === 'object' && data?.message) ? data.message : 'Resource not found.';
    }
    if (status === 409) {
      return (typeof data === 'object' && data?.message) ? data.message : 'An account with this email already exists.';
    }

    if (data) {
      if (typeof data === 'string' && data.trim()) return data;
      if (Array.isArray(data.message) && data.message.length > 0) return data.message.join(', ');
      if (typeof data.message === 'string' && data.message.trim()) return data.message;
      if (typeof data.error === 'string' && data.error.trim()) return data.error;
    }

    if (err.message) return err.message;
  } else if (err instanceof Error) {
    return err.message;
  }

  return defaultFallback;
};

export default axiosInstance;
