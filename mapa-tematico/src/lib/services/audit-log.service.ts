"use client";

import api from '../axios';

// ============================================
// TIPOS
// ============================================

export interface AuditLog {
    id: string;
    userId: string;
    userName?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
}

export interface AuditLogStats {
    total: number;
    byAction: Record<string, number>;
    byResource: Record<string, number>;
    byUser: Record<string, number>;
}

export interface AuditLogFilters {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    search?: string;
}

// ============================================
// SERVIÇO DE AUDIT LOGS
// ============================================

class AuditLogService {
    /**
     * Listar logs com filtros
     */
    async getAll(filters?: AuditLogFilters): Promise<{ data: AuditLog[]; pagination: any }> {
        const response = await api.get('/admin/geospace/audit-logs', {
            params: filters,
        });
        return response as any;
    }

    /**
     * Obter estatísticas de auditoria
     */
    async getStats(filters?: AuditLogFilters): Promise<AuditLogStats> {
        const response = await api.get<AuditLogStats>('/admin/geospace/audit-logs/stats', {
            params: filters,
        });
        return response as any;
    }

    /**
     * Obter detalhes de um log
     */
    async getById(id: string): Promise<AuditLog> {
        const response = await api.get<AuditLog>(`/admin/geospace/audit-logs/${id}`);
        return response as any;
    }

    /**
     * Obter logs de um usuário
     */
    async getByUser(userId: string): Promise<AuditLog[]> {
        const response = await api.get<AuditLog[]>(`/admin/geospace/audit-logs/user/${userId}`);
        return response as any;
    }

    /**
     * Obter logs de um recurso
     */
    async getByResource(resource: string, resourceId: string): Promise<AuditLog[]> {
        const response = await api.get<AuditLog[]>(
            `/admin/geospace/audit-logs/resource/${resource}/${resourceId}`
        );
        return response as any;
    }

    /**
     * Exportar logs
     */
    async export(filters?: AuditLogFilters): Promise<Blob> {
        const response = await api.get('/admin/geospace/audit-logs/export', {
            params: filters,
            responseType: 'blob',
        });
        return response as any;
    }

    /**
     * Download de export
     */
    downloadExport(blob: Blob, filename: string = 'audit-logs.csv') {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}

// ============================================
// INSTÂNCIA SINGLETON
// ============================================

const auditLogService = new AuditLogService();

export default auditLogService;
