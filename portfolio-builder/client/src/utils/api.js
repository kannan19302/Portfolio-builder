import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:12001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  checkUsers: () => api.get('/auth/check-users'),
  verify: () => api.get('/auth/verify'),
  changePassword: (data) => api.post('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
};

// Content API
export const contentAPI = {
  // Public endpoints
  getSections: () => api.get('/content/sections'),
  getSettings: () => api.get('/content/settings'),
  
  // Admin endpoints
  getAdminSections: () => api.get('/content/admin/sections'),
  getSection: (id) => api.get(`/content/sections/${id}`),
  createSection: (data) => api.post('/content/admin/sections', data),
  updateSection: (id, data) => api.put(`/content/admin/sections/${id}`, data),
  deleteSection: (id) => api.delete(`/content/admin/sections/${id}`),
  reorderSections: (sections) => api.put('/content/admin/sections/reorder', { sections }),
  updateSettings: (settings) => api.put('/content/admin/settings', settings),
  exportData: () => api.get('/content/admin/export'),
  importData: (data) => api.post('/content/admin/import', data),
};

// Upload API
export const uploadAPI = {
  uploadSingle: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadMultiple: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    return api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getFiles: () => api.get('/upload/files'),
  getFile: (id) => api.get(`/upload/files/${id}`),
  deleteFile: (id) => api.delete(`/upload/files/${id}`),
};

export default api;