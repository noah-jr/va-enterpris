"use client";

import api from '../axios';

// ============================================
// TIPOS
// ============================================

export interface Settings {
    id: string;
    // Configurações Gerais
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    contactPhone: string;

    // Configurações de Emergência
    emergencyAutoAssign: boolean;
    emergencyResponseTime: number; // em minutos
    emergencyPriorityLevels: string[];

    // Configurações de Notificações
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;

    // Configurações de Mapa
    mapCenter: {
        latitude: number;
        longitude: number;
    };
    mapZoom: number;
    mapRefreshInterval: number; // em segundos

    // Configurações de Sistema
    maintenanceMode: boolean;
    debugMode: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';

    updatedAt: string;
    updatedBy: string;
}

export interface UpdateSettingsRequest {
    siteName?: string;
    siteDescription?: string;
    contactEmail?: string;
    contactPhone?: string;
    emergencyAutoAssign?: boolean;
    emergencyResponseTime?: number;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
    mapCenter?: {
        latitude: number;
        longitude: number;
    };
    mapZoom?: number;
    mapRefreshInterval?: number;
    maintenanceMode?: boolean;
    debugMode?: boolean;
    logLevel?: Settings['logLevel'];
}

// ============================================
// SERVIÇO DE CONFIGURAÇÕES
// ============================================

class SettingsService {
    /**
     * Obter configurações
     */
    async get(): Promise<Settings> {
        const response = await api.get<Settings>('/admin/settings');
        return response as any;
    }

    /**
     * Atualizar configurações
     */
    async update(data: UpdateSettingsRequest): Promise<Settings> {
        const response = await api.patch<Settings>('/admin/settings', data);
        return response as any;
    }

    /**
     * Resetar configurações para padrão
     */
    async reset(): Promise<Settings> {
        const response = await api.post<Settings>('/admin/settings/reset');
        return response as any;
    }

    /**
     * Exportar configurações
     */
    async export(): Promise<Blob> {
        const response = await api.get('/admin/settings/export', {
            responseType: 'blob',
        });
        return response as any;
    }

    /**
     * Importar configurações
     */
    async import(file: File): Promise<Settings> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<Settings>('/admin/settings/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response as any;
    }

    /**
     * Obter configurações do localStorage (cache)
     */
    getCached(): Settings | null {
        if (typeof window === 'undefined') return null;

        const cached = localStorage.getItem('settings');
        if (!cached) return null;

        try {
            return JSON.parse(cached);
        } catch (error) {
            console.error('Erro ao parsear configurações:', error);
            return null;
        }
    }

    /**
     * Salvar configurações no localStorage (cache)
     */
    setCached(settings: Settings): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem('settings', JSON.stringify(settings));
    }

    /**
     * Limpar cache de configurações
     */
    clearCached(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('settings');
    }
}

// ============================================
// INSTÂNCIA SINGLETON
// ============================================

const settingsService = new SettingsService();

export default settingsService;
