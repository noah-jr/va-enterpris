import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { authStore } from './auth/authStore';

interface RetryConfig extends AxiosRequestConfig {
    _retry?: boolean;
}

// ─── URL base por ambiente ─────────────────────────────────────────────────────
// Em desenvolvimento (.env.development): VITE_API_URL=/api  → usa o proxy do Vite
// Em produção (.env.production): VITE_API_URL=https://test-api.jftech-angola.ao/api
const IS_PROD = import.meta.env.PROD;
const DEFAULT_URL = IS_PROD ? 'https://test-api.jftech-angola.ao/api' : '/api';
const BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_URL;

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Accept': 'application/json' },
    timeout: 20000,
    withCredentials: true, // Necessário para o cookie HttpOnly de refresh token
});

if (import.meta.env.DEV) {
    console.log(`[API] Modo: ${import.meta.env.VITE_ENV || 'development'} | Base URL: ${BASE_URL}`);
}

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        const headers = authStore.getHeaders();
        if (config.headers) {
            Object.entries(headers).forEach(([key, value]) => {
                config.headers!.set(key, value);
            });
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryConfig;

        // 401 — Tentativa silenciosa de renovação do token
        const isLoginAction = originalRequest.url?.includes('/auth/login');

        if (error.response?.status === 401 && !isLoginAction && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const res = await axios.post(
                    `${BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );
                const newToken: string = (res.data as any).accessToken;
                const currentUser = authStore.getUser();
                if (currentUser) authStore.setSession(newToken, currentUser);

                if (originalRequest.headers) {
                    (originalRequest.headers as any)['Authorization'] = `Bearer ${newToken}`;
                }
                return api(originalRequest);
            } catch {
                authStore.clearSession();
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        // Tratamento de erros genérico
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data as any;

            if (status === 403) {
                const code = data?.code;
                if (code === 'SUBSCRIPTION_EXPIRED') {
                    toast.error('A sua subscrição expirou. Por favor, renove o seu plano.');
                    // Redireciona para a página de subscrição se não for super admin
                    setTimeout(() => {
                        window.location.href = '/subscription';
                    }, 2000);
                } else if (code === 'COMPANY_EXPIRED') {
                    toast.error('A sua conta expirou. Contacte o administrador.');
                    setTimeout(() => {
                        window.location.href = '/tickets';
                    }, 2000);
                } else {
                    toast.error('Acesso negado: sem permissão para esta acção.');
                }
            }
            if (status === 404) toast.error('Recurso não encontrado.');
            if (status >= 500) toast.error('Erro no servidor. A nossa equipa foi notificada.');
            if (status === 400) toast.warning(data?.error || 'Verifique os dados submetidos.');
        } else if (error.request) {
            toast.error('Sem ligação. Verifique a sua internet.');
        }

        return Promise.reject(error);
    }
);

export const lookupTaxpayer = async (nif: string) => {
    try {
        const res = await api.get(`/taxpayer/${nif}`);
        return res.data;
    } catch (error) {
        throw error;
    }
};

export default api;
