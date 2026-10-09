"use client";

import { toast } from "@/hooks/use-toast";
import axios from "axios";

const GEOSPACE_API_URL = process.env.NEXT_PUBLIC_FILOGO_API_URL;
const GEOSPACE_API_VERSION = process.env.NEXT_PUBLIC_FILOGO_API_VERSION || '/api/v1';
const GEOSPACE_API_KEY = process.env.NEXT_PUBLIC_FILOGO_API_KEY;

const getBaseUrl = () => {
    if (GEOSPACE_API_URL) return `${GEOSPACE_API_URL}${GEOSPACE_API_VERSION}`;

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port;
        // Fallback to the current same-origin if no URL is specified
        if (port) return `${protocol}//${hostname}:${port}${GEOSPACE_API_VERSION}`;
        return `${protocol}//${hostname}${GEOSPACE_API_VERSION}`;
    }

    return `http://localhost:3000${GEOSPACE_API_VERSION}`;
};

const API_BASE_URL = getBaseUrl();

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        "x-api-key": GEOSPACE_API_KEY,
    },
});

function showToast(
    title: string,
    description?: string,
    status: "destructive" | "default" = "destructive",
) {
    toast({
        title,
        description,
        variant: status,
    });
}

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// INTERCEPTOR DE RESPOSTA
axiosInstance.interceptors.response.use(
    (response) => {
        const data = response.data;


        // Suporte ao padrão uniformizado { message, object, statusCode }
        if (
            data &&
            typeof data === "object" &&
            "object" in data
        ) {
            return data.object;
        }

        return data;
    },
    async (error) => {
        const originalRequest = error.config;
        const apiMessage = error.response?.data?.message;

        const isAuthRoute = originalRequest?.url?.includes("/auth/login");
        // originalRequest?.url?.includes("/auth/register");

        if (
            error.response?.status === 401 &&
            originalRequest?.url?.includes("/auth/login")
        ) {
            showToast('Erro ao entrar no sistema', apiMessage);
            return Promise.reject(error);
        }
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isAuthRoute
        ) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (refreshToken) {
                    const response = await axios.post(
                        `${API_BASE_URL}/auth/refresh`,
                        {
                            refreshToken,
                        },
                        {
                            headers: {
                                "x-api-key": GEOSPACE_API_KEY,
                            },
                        },
                    );

                    const { accessToken, refreshToken: newRefreshToken } =
                        response.data.object;

                    setTokens(accessToken, newRefreshToken || refreshToken);

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                clearTokens();
                window.location.href = "/login";

                showToast("Sessão expirada", "Faça login novamente.", "destructive");
                return Promise.reject(refreshError);
            }
        } else if (error.response) {
            const status = error.response.status;
            const errorData = error.response.data;

            // Novo padrão: { message, object, statusCode }
            const apiMessage = errorData?.message;
            const apiObject = errorData?.object;
            const apiCode = apiObject?.code;
            const apiDetails = apiObject?.details || apiObject;

            let title = "Falha na Operação";
            let description =
                apiMessage || "Ocorreu um erro inesperado. Por favor, tente novamente.";

            switch (status) {
                case 400:
                    title = "Dados Inválidos";
                    if (Array.isArray(apiDetails)) {
                        description = apiDetails
                            .map((d: any) => {
                                const field = d.path || d.field || "Campo";
                                return `${field}: ${d.message}`;
                            })
                            .join("\n");
                    } else if (apiMessage) {
                        description = apiMessage;
                    }
                    break;
                case 401:
                    title = "Sessão Expirada";
                    break;
                case 403:
                    title = "Acesso Negado";
                    break;
                case 404:
                    title = "Não Encontrado";
                    break;
                case 409:
                    title = "Conflito de Registo";
                    break;
                case 422:
                    title = "Erro de Negócio";
                    break;
                case 429:
                    title = "Limite Excedido";
                    break;
                case 500:
                    title = "Erro Interno";
                    break;
            }

            if (process.env.NODE_ENV === "development") {
                console.error("DEBUG: API Error Status:", error.response?.status);
                console.error("DEBUG: API Error Data:", error.response?.data);
            }

            // Don't show error toast for logout - we're cleaning up anyway
            if (!originalRequest?.url?.includes("/auth/logout")) {
                showToast(title, description, "destructive");
            }
        } else {
            showToast(
                "Erro de Conexão",
                "Não foi possível contactar o servidor GEOSPACE. Verifique a sua ligação ou tente mais tarde.",
                "destructive",
            );
        }

        return Promise.reject(error);
    },
);

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

export function showSuccessToast(title: string, description?: string) {
    showToast(title, description, "default");
}

// ============================================
// FUNÇÕES DE AUTENTICAÇÃO
// ============================================

export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
}

export function getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
}

export function setTokens(accessToken: string, refreshToken: string, role?: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // Set cookies for middleware
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // 7 days

    document.cookie = `token=${accessToken}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    if (role) {
        document.cookie = `user_role=${role}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    }
}

export function clearTokens() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Clear cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

export function isAuthenticated(): boolean {
    return !!getAccessToken();
}

// ============================================
// EXPORT DEFAULT
// ============================================

export const api = axiosInstance;
export default axiosInstance;
