import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  getProfile: () => api.get('/auth/profile'),
};

// Student API calls
export const studentAPI = {
  getAttendance: () => api.get('/student/attendance'),
  getAppointments: () => api.get('/student/appointments'),
  bookAppointment: (appointmentData) => api.post('/student/appointments', appointmentData),
  getAnnouncements: () => api.get('/student/announcements'),
  updateProfile: (profileData) => api.put('/student/profile', profileData),
};

// Faculty API calls
export const facultyAPI = {
  getClasses: () => api.get('/faculty/classes'),
  markAttendance: (attendanceData) => api.post('/faculty/attendance', attendanceData),
  getAppointments: () => api.get('/faculty/appointments'),
  getStudents: (classId) => api.get(`/faculty/students/${classId}`),
  updateAppointment: (appointmentId, data) => api.put(`/faculty/appointments/${appointmentId}`, data),
  getAttendanceStats: () => api.get('/faculty/attendance-stats'),
};

// Admin API calls
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getSystemStats: () => api.get('/admin/stats'),
  getReports: () => api.get('/admin/reports'),
  generateReport: (reportType) => api.post('/admin/reports', { type: reportType }),
  getSystemLogs: () => api.get('/admin/logs'),
  getSystemHealth: () => api.get('/admin/health'),
};

// Utility API calls
export const utilityAPI = {
  uploadFile: (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  downloadFile: (fileId) => api.get(`/download/${fileId}`, { responseType: 'blob' }),
  sendNotification: (notificationData) => api.post('/notifications', notificationData),
};

// Error handling utility
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || 'Server error occurred';
    return { success: false, message, status: error.response.status };
  } else if (error.request) {
    // Request was made but no response received
    return { success: false, message: 'Network error. Please check your connection.' };
  } else {
    // Something else happened
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

export default api;
