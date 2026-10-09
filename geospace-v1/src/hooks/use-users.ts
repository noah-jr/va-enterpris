"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userService, { type GEOSPACEUser, type UserFilters } from '@/lib/services/user.service';
import { toast } from '@/hooks/use-toast';

// ============================================
// QUERY KEYS
// ============================================

export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    list: (filters?: UserFilters) => [...userKeys.lists(), filters] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
    stats: () => [...userKeys.all, 'stats'] as const,
    history: (id: string) => [...userKeys.all, 'history', id] as const,
};

// ============================================
// HOOKS
// ============================================

/**
 * Hook para listar usuários
 */
export function useUsers(filters?: UserFilters) {
    return useQuery({
        queryKey: userKeys.list(filters),
        queryFn: () => userService.getAll(filters),
    });
}

/**
 * Hook para obter estatísticas de usuários
 */
export function useUserStats() {
    return useQuery({
        queryKey: userKeys.stats(),
        queryFn: () => userService.getStats(),
    });
}

/**
 * Hook para obter detalhes de um usuário
 */
export function useUser(id: string) {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: () => userService.getById(id),
        enabled: !!id,
    });
}

/**
 * Hook para obter histórico de um usuário
 */
export function useUserHistory(id: string) {
    return useQuery({
        queryKey: userKeys.history(id),
        queryFn: () => userService.getHistory(id),
        enabled: !!id,
    });
}

/**
 * Hook para suspender usuário
 */
export function useSuspendUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            userService.suspend(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            toast({
                title: 'Usuário Suspenso',
                description: 'O usuário foi suspenso com sucesso.',
                variant: 'default',
            });
        },
        onError: () => {
            toast({
                title: 'Erro ao Suspender',
                description: 'Não foi possível suspender o usuário.',
                variant: 'destructive',
            });
        },
    });
}

/**
 * Hook para ativar usuário
 */
export function useActivateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => userService.activate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            toast({
                title: 'Usuário Ativado',
                description: 'O usuário foi ativado com sucesso.',
                variant: 'default',
            });
        },
        onError: () => {
            toast({
                title: 'Erro ao Ativar',
                description: 'Não foi possível ativar o usuário.',
                variant: 'destructive',
            });
        },
    });
}

/**
 * Hook para banir usuário
 */
export function useBanUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            userService.ban(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            toast({
                title: 'Usuário Banido',
                description: 'O usuário foi banido com sucesso.',
                variant: 'default',
            });
        },
        onError: () => {
            toast({
                title: 'Erro ao Banir',
                description: 'Não foi possível banir o usuário.',
                variant: 'destructive',
            });
        },
    });
}
