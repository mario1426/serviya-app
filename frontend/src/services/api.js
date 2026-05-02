import axios from 'axios';
import { auth } from '../firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Interceptor: adjunta el token Firebase en cada request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta: manejo global de errores
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Error de red';
    return Promise.reject(new Error(message));
  }
);

export default api;
