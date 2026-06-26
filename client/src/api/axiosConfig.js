import axios from 'axios';

const DEFAULT_API_URL = 'https://vendecercaapi.onrender.com/api/v1/';

const normalizeApiUrl = (url) => {
  const cleanUrl = (url || DEFAULT_API_URL).trim().replace(/\/+$/, '');
  return cleanUrl.endsWith('/api/v1') ? `${cleanUrl}/` : `${cleanUrl}/api/v1/`;
};

const api = axios.create({
  baseURL: normalizeApiUrl(import.meta.env.VITE_API_URL),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept responses for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors (e.g., redirect to login or clear token)
      console.error('Unauthorized access. Please login again.');
      localStorage.removeItem('token');
      // Optional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
