"use client";

import api from '../axios';

// ============================================
// TIPOS
// ============================================

export interface MTNIUser {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'SUPER_ADMIN' | 'ADMIN_REGIONAL' | 'OPERADOR_CENTRAL' | 'COORDENADOR_EMPRESA' | 'AGENTE_CAMPO';
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
    lat?: number;
    lng?: number;
    createdAt: string;
    updatedAt: string;
}

export interface UserStats {
    total: number;
    active: number;
    suspended: number;
    banned: number;
    byRole: Record<MTNIUser['role'], number>;
}

export interface UserActivity {
    id: string;
    action: string;
    resource: string;
    timestamp: string;
    details?: any;
}

export interface UserFilters {
    role?: MTNIUser['role'];
    status?: MTNIUser['status'];
    search?: string;
}

// ============================================
// SERVIÇO DE UTILIZADORES MTNI
// ============================================

class UserService {
    /**
     * Listar utilizadores com filtros
     */
    async getAll(filters?: UserFilters): Promise<MTNIUser[]> {
        const response = await api.get<MTNIUser[]>('/admin/geospace/users', {
            params: filters,
        });
        return response as any;
    }

    /**
     * Obter estatísticas de utilizadores
     */
    async getStats(): Promise<UserStats> {
        const response = await api.get<UserStats>('/admin/geospace/users/stats');
        return response as any;
    }

    /**
     * Obter detalhes de um utilizador
     */
    async getById(id: string): Promise<MTNIUser> {
        const response = await api.get<MTNIUser>(`/admin/geospace/users/${id}`);
        return response as any;
    }

    /**
     * Obter histórico de atividades do utilizador
     */
    async getHistory(id: string): Promise<UserActivity[]> {
        const response = await api.get<UserActivity[]>(`/admin/geospace/users/${id}/history`);
        return response as any;
    }

    /**
     * Suspender utilizador
     */
    async suspend(id: string, reason?: string): Promise<MTNIUser> {
        const response = await api.put<MTNIUser>(`/admin/geospace/users/${id}/suspend`, {
            reason,
        });
        return response as any;
    }

    /**
     * Ativar utilizador
     */
    async activate(id: string): Promise<MTNIUser> {
        const response = await api.put<MTNIUser>(`/admin/geospace/users/${id}/activate`);
        return response as any;
    }

    /**
     * Criar novo utilizador
     */
    async create(userData: Partial<MTNIUser> & { password?: string }): Promise<MTNIUser> {
        const response = await api.post<MTNIUser>('/admin/geospace/users', userData);
        return response as any;
    }

    /**
     * Banir utilizador
     */
    async ban(id: string, reason?: string): Promise<MTNIUser> {
        const response = await api.put<MTNIUser>(`/admin/geospace/users/${id}/ban`, {
            reason,
        });
        return response as any;
    }

    /**
     * Remover utilizador definitivamente
     */
    async delete(id: string): Promise<void> {
        await api.delete(`/admin/geospace/users/${id}`);
    }
}

// ============================================
// INSTÂNCIA SINGLETON
// ============================================

const userService = new UserService();

export default userService;
