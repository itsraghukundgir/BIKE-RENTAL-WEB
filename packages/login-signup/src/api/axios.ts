import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.API_BASE_URL ?? 'http://localhost:8081/api',
    headers: { 'Content-Type': 'application/json' },
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
  })

  export default api;