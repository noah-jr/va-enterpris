"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import emergencyService, { type CreateEmergencyRequest, type UpdateEmergencyRequest } from '@/lib/services/emergency.service';

// ============================================
// QUERY KEYS
// ============================================

export const emergencyKeys = {
    all: ['emergencies'] as const,
    lists: () => [...emergencyKeys.all, 'list'] as const,
    list: (filters?: any) => [...emergencyKeys.lists(), filters] as const,
    active: () => [...emergencyKeys.all, 'active'] as const,
    details: () => [...emergencyKeys.all, 'detail'] as const,
    detail: (id: string) => [...emergencyKeys.details(), id] as const,
    stats: () => [...emergencyKeys.all, 'stats'] as const,
    history: (filters?: any) => [...emergencyKeys.all, 'history', filters] as const,
};

// ============================================
// HOOKS
// ============================================

/**
 * Hook para listar todas as emergências
 */
export function useEmergencies(filters?: Parameters<typeof emergencyService.getAll>[0]) {
    return useQuery({
        queryKey: emergencyKeys.list(filters),
        queryFn: () => emergencyService.getAll(filters),
        refetchInterval: 10000, // Atualizar a cada 10 segundos
    });
}

/**
 * Hook para listar emergências ativas
 */
export function useActiveEmergencies() {
    return useQuery({
        queryKey: emergencyKeys.active(),
        queryFn: () => emergencyService.getActive(),
        refetchInterval: 5000, // Atualizar a cada 5 segundos
    });
}

/**
 * Hook para obter detalhes de uma emergência
 */
export function useEmergency(id: string) {
    return useQuery({
        queryKey: emergencyKeys.detail(id),
        queryFn: () => emergencyService.getById(id),
        enabled: !!id,
    });
}

/**
 * Hook para criar emergência
 */
export function useCreateEmergency() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateEmergencyRequest) => emergencyService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: emergencyKeys.lists() });
            queryClient.invalidateQueries({ queryKey: emergencyKeys.active() });
            queryClient.invalidateQueries({ queryKey: emergencyKeys.stats() });
        },
    });
}

/**
 * Hook para atualizar emergência
 */
export function useUpdateEmergency() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateEmergencyRequest }) =>
            emergencyService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: emergencyKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: emergencyKeys.lists() });
            queryClient.invalidateQueries({ queryKey: emergencyKeys.active() });
            queryClient.invalidateQueries({ queryKey: emergencyKeys.stats() });
        },
    });
}

/**
 * Hook para resolver emergência
 */
export function useResolveEmergency() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
            emergencyService.resolve(id, notes),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: emergencyKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: emergencyKeys.lists() });
            queryClient.invalidateQueries({ queryKey: emergencyKeys.active() });
            queryClient.invalidateQueries({ queryKey: emergencyKeys.stats() });
        },
    });
}

/**
 * Hook para obter estatísticas de emergências
 */
export function useEmergencyStats() {
    return useQuery({
        queryKey: emergencyKeys.stats(),
        queryFn: () => emergencyService.getStats(),
        staleTime: 30000, // 30 segundos
    });
}

/**
 * Hook para obter histórico de emergências
 */
export function useEmergencyHistory(filters?: Parameters<typeof emergencyService.getHistory>[0]) {
    return useQuery({
        queryKey: emergencyKeys.history(filters),
        queryFn: () => emergencyService.getHistory(filters),
    });
}
