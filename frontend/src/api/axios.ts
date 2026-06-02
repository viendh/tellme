import axios from 'axios';

// Dev: dùng '' để request đi qua Vite proxy (tránh CORS)
// Prod: dùng VITE_API_URL để gọi trực tiếp backend
const apiClient = axios.create({
  baseURL: import.meta.env.PROD ? (import.meta.env.VITE_API_URL ?? '') : '',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
