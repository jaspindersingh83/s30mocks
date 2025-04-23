import axios from 'axios';

// Create an axios instance with base URL from environment variables
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  withCredentials: true, // Required for cross-domain authenticated requests
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to include the token in every request
api.interceptors.request.use(
  config => {
  
    
    // Get token from localStorage
    const token = localStorage.getItem('token');  
    // If token exists, add it to the headers
    if (token) {
      // Use Authorization header with Bearer scheme as the standard approach
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  response => {
    // If the response includes a token in the header, update localStorage
    const authHeader = response.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      localStorage.setItem('token', token);
    }
    
    return response;
  },
  error => {
    // Handle 401 errors globally
    if (error.response && error.response.status === 401) {
      // Clear localStorage and redirect to login if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if we're in a browser environment and not in an API call from a popup window
      if (typeof window !== 'undefined' && !window.opener) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
