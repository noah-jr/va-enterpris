"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import authService, { type LoginRequest, type RegisterRequest, type ForgotPasswordRequest } from '@/lib/services/auth.service';

// ============================================
// QUERY KEYS
// ============================================

export const authKeys = {
    all: ['auth'] as const,
    profile: () => [...authKeys.all, 'profile'] as const,
    user: () => [...authKeys.all, 'user'] as const,
};

// ============================================
// HOOKS
// ============================================

/**
 * Hook para obter perfil do usuário
 */
export function useProfile() {
    return useQuery({
        queryKey: authKeys.profile(),
        queryFn: () => authService.getProfile(),
        enabled: authService.isAuthenticated(),
        staleTime: 5 * 60 * 1000, // 5 minutos
    });
}

/**
 * Hook para login
 */
export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: LoginRequest) => authService.login(data),
        onSuccess: (data) => {
            queryClient.setQueryData(authKeys.user(), data.user);
            queryClient.invalidateQueries({ queryKey: authKeys.all });
        },
    });
}

/**
 * Hook para registro
 */
export function useRegister() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: RegisterRequest) => authService.register(data),
        onSuccess: (data) => {
            queryClient.setQueryData(authKeys.user(), data.user);
            queryClient.invalidateQueries({ queryKey: authKeys.all });
        },
    });
}

/**
 * Hook para logout
 */
export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            queryClient.clear();
        },
    });
}

/**
 * Hook para recuperação de senha
 */
export function useForgotPassword() {
    return useMutation({
        mutationFn: (data: ForgotPasswordRequest) => authService.forgotPassword(data),
    });
}

/**
 * Hook para obter usuário autenticado do localStorage
 */
export function useAuthUser() {
    return authService.getUser();
}

/**
 * Hook para verificar autenticação
 */
export function useIsAuthenticated() {
    return authService.isAuthenticated();
}
