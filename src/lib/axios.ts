import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête : ajoute le token si on en a un
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  const url = config.url || '';
  
  // On n'envoie pas le token uniquement si on est sur login ou register
  const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register');

  if (token && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Intercepteur de réponse : gère les erreurs 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthRoute = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
      const isOnLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';
      
      // Si l'erreur 401 ne vient pas du login, on déconnecte et on redirige
      if (!isAuthRoute && !isOnLoginPage) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;