import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@accountable/types';

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Endpoints de autenticação (login, reset, verificação, alteração de senha…) devolvem 401
    // como resposta de negócio — nunca devem disparar refresh/redirecionamento. /auth/me sim.
    const url = originalRequest.url ?? '';
    const isAuthEndpoint = url.includes('/auth/') && !url.includes('/auth/me');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err: unknown) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        // Outro separador pode ter rodado o refresh token ao mesmo tempo: o browser já
        // tem os cookies novos. Se a sessão continuar válida, repete o pedido em vez de sair.
        const stillAuthenticated = await axios
          .get('/api/v1/auth/me', { withCredentials: true })
          .then(() => true)
          .catch(() => false);
        if (stillAuthenticated) {
          processQueue(null);
          return api(originalRequest);
        }

        processQueue(refreshError as AxiosError);
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
