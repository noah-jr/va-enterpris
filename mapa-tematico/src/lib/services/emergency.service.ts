"use client";

import api from '../axios';
import type { EmergencyData } from '../socket';

// ============================================
// TIPOS
// ============================================

export interface Emergency extends EmergencyData {
    user?: {
        id: string;
        name: string;
        phone: string;
    };
    trip?: {
        id: string;
        pickup: string;
        destination: string;
    };
    resolvedBy?: string;
    resolvedAt?: string;
    notes?: string;
}

export interface CreateEmergencyRequest {
    userId: string;
    userType: 'DRIVER' | 'PASSENGER';
    location: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    tripId?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description?: string;
}

export interface UpdateEmergencyRequest {
    status?: Emergency['status'];
    notes?: string;
    priority?: Emergency['priority'];
}

// ============================================
// SERVIÇO DE EMERGÊNCIAS
// ============================================

class EmergencyService {
    /**
     * Listar todas as emergências
     */
    async getAll(filters?: {
        status?: Emergency['status'];
        priority?: Emergency['priority'];
        userType?: Emergency['userType'];
    }): Promise<Emergency[]> {
        const response = await api.get<Emergency[]>('/emergency/alerts', {
            params: filters,
        });
        return response as any;
    }

    /**
     * Listar emergências ativas
     */
    async getActive(): Promise<Emergency[]> {
        const response = await api.get<Emergency[]>('/admin/geospace/emergencies');
        return response as any;
    }

    /**
     * Obter detalhes de uma emergência
     */
    async getById(id: string): Promise<Emergency> {
        const response = await api.get<Emergency>(`/admin/geospace/emergencies/${id}`);
        return response as any;
    }

    /**
     * Criar nova emergência
     */
    async create(data: CreateEmergencyRequest): Promise<Emergency> {
        const response = await api.post<Emergency>('/emergency', data);
        return response as any;
    }

    /**
     * Atualizar emergência
     */
    async update(id: string, data: UpdateEmergencyRequest): Promise<Emergency> {
        const response = await api.patch<Emergency>(`/emergency/${id}`, data);
        return response as any;
    }

    /**
     * Atualizar status da emergência
     */
    async updateStatus(
        id: string,
        status: Emergency['status'],
        notes?: string
    ): Promise<Emergency> {
        return this.update(id, { status, notes });
    }

    /**
     * Resolver emergência (usando endpoint GEOSPACE específico)
     */
    async resolve(id: string, notes?: string): Promise<Emergency> {
        const response = await api.post<Emergency>(
            `/admin/geospace/emergencies/${id}/resolve`,
            { notes }
        );
        return response as any;
    }

    /**
     * Marcar como falso alarme
     */
    async markAsFalseAlarm(id: string, notes?: string): Promise<Emergency> {
        const response = await api.post<Emergency>(
            `/admin/geospace/emergencies/${id}/false-alarm`,
            { notes }
        );
        return response as any;
    }

    /**
     * Escalar emergência para autoridades
     */
    async escalate(id: string, notes?: string): Promise<Emergency> {
        const response = await api.post<Emergency>(
            `/admin/geospace/emergencies/${id}/escalate`,
            { notes }
        );
        return response as any;
    }

    /**
     * Adicionar nota a uma emergência
     */
    async addNote(id: string, note: string): Promise<Emergency> {
        const response = await api.post<Emergency>(
            `/admin/geospace/emergencies/${id}/note`,
            { note }
        );
        return response as any;
    }

    /**
     * Cancelar emergência
     */
    async cancel(id: string, notes?: string): Promise<Emergency> {
        return this.updateStatus(id, 'CANCELLED', notes);
    }

    /**
     * Marcar emergência como em progresso
     */
    async markInProgress(id: string, notes?: string): Promise<Emergency> {
        return this.updateStatus(id, 'IN_PROGRESS', notes);
    }

    /**
     * Obter histórico de emergências
     */
    async getHistory(filters?: {
        startDate?: string;
        endDate?: string;
        status?: Emergency['status'];
    }): Promise<Emergency[]> {
        const response = await api.get<Emergency[]>('/emergency/history', {
            params: filters,
        });
        return response as any;
    }

    /**
     * Obter estatísticas de emergências
     */
    async getStats(): Promise<{
        total: number;
        active: number;
        resolved: number;
        cancelled: number;
        byPriority: Record<Emergency['priority'], number>;
        averageResponseTime: number;
    }> {
        const response = await api.get('/emergency/stats');
        return response as any;
    }
}

// ============================================
// INSTÂNCIA SINGLETON
// ============================================

const emergencyService = new EmergencyService();

export default emergencyService;
