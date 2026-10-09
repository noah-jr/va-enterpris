"use client";

import { useQuery } from '@tanstack/react-query';
import auditLogService, { type AuditLog, type AuditLogFilters } from '@/lib/services/audit-log.service';
import { toast } from '@/hooks/use-toast';

// ============================================
// QUERY KEYS
// ============================================

export const auditLogKeys = {
    all: ['audit-logs'] as const,
    lists: () => [...auditLogKeys.all, 'list'] as const,
    list: (filters?: AuditLogFilters) => [...auditLogKeys.lists(), filters] as const,
    details: () => [...auditLogKeys.all, 'detail'] as const,
    detail: (id: string) => [...auditLogKeys.details(), id] as const,
    stats: () => [...auditLogKeys.all, 'stats'] as const,
    byUser: (userId: string) => [...auditLogKeys.all, 'user', userId] as const,
    byResource: (resource: string, resourceId: string) =>
        [...auditLogKeys.all, 'resource', resource, resourceId] as const,
};

// ============================================
// HOOKS
// ============================================

/**
 * Hook para listar logs de auditoria
 */
export function useAuditLogs(filters?: AuditLogFilters) {
    return useQuery({
        queryKey: auditLogKeys.list(filters),
        queryFn: () => auditLogService.getAll(filters),
    });
}

/**
 * Hook para obter estatísticas de auditoria
 */
export function useAuditLogStats(filters?: AuditLogFilters) {
    return useQuery({
        queryKey: [...auditLogKeys.stats(), filters],
        queryFn: () => auditLogService.getStats(filters),
    });
}

/**
 * Hook para obter detalhes de um log
 */
export function useAuditLog(id: string) {
    return useQuery({
        queryKey: auditLogKeys.detail(id),
        queryFn: () => auditLogService.getById(id),
        enabled: !!id,
    });
}

/**
 * Hook para obter logs de um usuário
 */
export function useUserAuditLogs(userId: string) {
    return useQuery({
        queryKey: auditLogKeys.byUser(userId),
        queryFn: () => auditLogService.getByUser(userId),
        enabled: !!userId,
    });
}

/**
 * Hook para obter logs de um recurso
 */
export function useResourceAuditLogs(resource: string, resourceId: string) {
    return useQuery({
        queryKey: auditLogKeys.byResource(resource, resourceId),
        queryFn: () => auditLogService.getByResource(resource, resourceId),
        enabled: !!resource && !!resourceId,
    });
}

/**
 * Função para exportar logs
 */
export async function exportAuditLogs(filters?: AuditLogFilters) {
    try {
        const blob = await auditLogService.export(filters);
        const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        auditLogService.downloadExport(blob, filename);

        toast({
            title: 'Export Concluído',
            description: 'Os logs foram exportados com sucesso.',
            variant: 'default',
        });
    } catch (error) {
        toast({
            title: 'Erro no Export',
            description: 'Não foi possível exportar os logs.',
            variant: 'destructive',
        });
    }
}
