"use client";

import api from '../axios';

// ============================================
// TIPOS
// ============================================

export interface DashboardStats {
    emergencies: {
        total: number;
        active: number;
        resolved: number;
        falseAlarms: number;
        last24h: number;
        last7days: number;
        last30days: number;
        avgResolutionTime: number;
    };
    users: {
        total: number;
        active: number;
    };
    drivers: {
        total: number;
        online: number;
    };
    trips: {
        total: number;
        active: number;
    };
    finance: {
        totalRevenue: number;
        revenueLast24h: number;
    };
}

export interface RecentActivity {
    id: string;
    type: 'TRIP' | 'EMERGENCY' | 'DRIVER' | 'SYSTEM';
    title: string;
    description: string;
    timestamp: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ChartDataItem {
    label: string;
    value: number;
}

export interface ChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string;
        borderColor?: string;
    }>;
    mapped?: ChartDataItem[];
}

// ============================================
// SERVIÇO DE DASHBOARD
// ============================================

class DashboardService {
    /**
     * Obter estatísticas do dashboard
     */
    async getStats(): Promise<DashboardStats> {
        const response = await api.get<DashboardStats>('/admin/geospace/dashboard/stats');
        return response as any;
    }

    /**
     * Obter atividades recentes
     */
    async getRecentActivities(limit = 10): Promise<RecentActivity[]> {
        const response = await api.get<RecentActivity[]>('/admin/geospace/activities', {
            params: { limit },
        });
        return response as any;
    }

    /**
     * Obter dados para gráfico de corridas
     */
    async getTripsChart(period: 'day' | 'week' | 'month' = 'day'): Promise<ChartData> {
        const response = await api.get<any>('/admin/geospace/charts/trips', {
            params: { period },
        });
        const data = response.data.data;
        return {
            ...data,
            mapped: data.labels.map((label: string, i: number) => ({
                label,
                value: data.datasets[0].data[i]
            }))
        };
    }

    /**
     * Obter dados para gráfico de emergências
     */
    async getEmergenciesChart(period: 'day' | 'week' | 'month' = 'day'): Promise<ChartData> {
        const response = await api.get<any>('/admin/geospace/charts/emergencies', {
            params: { period },
        });
        const data = response.data.data;
        return {
            ...data,
            mapped: data.labels.map((label: string, i: number) => ({
                label,
                value: data.datasets[0].data[i]
            }))
        };
    }

    /**
     * Obter dados para gráfico de motoristas
     */
    async getDriversChart(): Promise<ChartData> {
        const response = await api.get<any>('/admin/geospace/charts/drivers');
        const data = response.data.data;
        return {
            ...data,
            mapped: data.labels.map((label: string, i: number) => ({
                label,
                value: data.datasets[0].data[i]
            }))
        };
    }

    /**
     * Obter motoristas online
     */
    async getOnlineDrivers(): Promise<any[]> {
        const response = await api.get<any[]>('/admin/geospace/dashboard/drivers');
        return response as any;
    }
}

// ============================================
// INSTÂNCIA SINGLETON
// ============================================

const dashboardService = new DashboardService();

export default dashboardService;
