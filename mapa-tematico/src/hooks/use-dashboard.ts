"use client";

import { useQuery } from '@tanstack/react-query';
import dashboardService from '@/lib/services/dashboard.service';

// ============================================
// QUERY KEYS
// ============================================

export const dashboardKeys = {
    all: ['dashboard'] as const,
    stats: () => [...dashboardKeys.all, 'stats'] as const,
    activities: (limit?: number) => [...dashboardKeys.all, 'activities', limit] as const,
    charts: () => [...dashboardKeys.all, 'charts'] as const,
    tripsChart: (period: string) => [...dashboardKeys.charts(), 'trips', period] as const,
    emergenciesChart: (period: string) => [...dashboardKeys.charts(), 'emergencies', period] as const,
    driversChart: () => [...dashboardKeys.charts(), 'drivers'] as const,
};

// ============================================
// HOOKS
// ============================================

/**
 * Hook para obter estatísticas do dashboard
 */
export function useDashboardStats() {
    return useQuery({
        queryKey: dashboardKeys.stats(),
        queryFn: () => dashboardService.getStats(),
        refetchInterval: 30000, // Atualizar a cada 30 segundos
        staleTime: 10000, // Considerar stale após 10 segundos
    });
}

/**
 * Hook para obter atividades recentes
 */
export function useRecentActivities(limit = 10) {
    return useQuery({
        queryKey: dashboardKeys.activities(limit),
        queryFn: () => dashboardService.getRecentActivities(limit),
        refetchInterval: 15000, // Atualizar a cada 15 segundos
    });
}

/**
 * Hook para obter dados do gráfico de corridas
 */
export function useTripsChart(period: 'day' | 'week' | 'month' = 'day') {
    return useQuery({
        queryKey: dashboardKeys.tripsChart(period),
        queryFn: () => dashboardService.getTripsChart(period),
        staleTime: 60000, // 1 minuto
    });
}

/**
 * Hook para obter dados do gráfico de emergências
 */
export function useEmergenciesChart(period: 'day' | 'week' | 'month' = 'day') {
    return useQuery({
        queryKey: dashboardKeys.emergenciesChart(period),
        queryFn: () => dashboardService.getEmergenciesChart(period),
        staleTime: 60000, // 1 minuto
    });
}

/**
 * Hook para obter dados do gráfico de motoristas
 */
export function useDriversChart() {
    return useQuery({
        queryKey: dashboardKeys.driversChart(),
        queryFn: () => dashboardService.getDriversChart(),
        staleTime: 60000, // 1 minuto
    });
}

/**
 * Hook para obter todos os dados do dashboard
 */
export function useDashboard(options?: {
    activitiesLimit?: number;
    chartPeriod?: 'day' | 'week' | 'month';
}) {
    const stats = useDashboardStats();
    const activities = useRecentActivities(options?.activitiesLimit);
    const tripsChart = useTripsChart(options?.chartPeriod);
    const emergenciesChart = useEmergenciesChart(options?.chartPeriod);
    const driversChart = useDriversChart();

    return {
        stats,
        activities,
        charts: {
            trips: tripsChart,
            emergencies: emergenciesChart,
            drivers: driversChart,
        },
        isLoading:
            stats.isLoading ||
            activities.isLoading ||
            tripsChart.isLoading ||
            emergenciesChart.isLoading ||
            driversChart.isLoading,
        isError:
            stats.isError ||
            activities.isError ||
            tripsChart.isError ||
            emergenciesChart.isError ||
            driversChart.isError,
    };
}
