"use client";

import api from '../axios';

// ============================================
// TIPOS
// ============================================

export type ReportType = 'trips' | 'financial' | 'drivers' | 'companies' | 'database';
export type ExportFormat = 'csv' | 'pdf' | 'xlsx' | 'sql';

export interface ExportFilters {
    startDate?: string;
    endDate?: string;
}

// ============================================
// SERVIÇO DE RELATÓRIOS
// ============================================

class ReportService {
    /**
     * Exportar dados de reporte
     */
    async exportData(type: ReportType, format: ExportFormat, filters?: ExportFilters): Promise<Blob> {
        const response = await api.get('/reports/export', {
            params: {
                type,
                format,
                ...filters
            },
            responseType: 'blob'
        });
        return response as any;
    }

    /**
     * Obter métricas do dashboard
     */
    async getDashboardMetrics() {
        return await api.get('/reports/dashboard');
    }

    /**
     * Obter relatório de incidentes
     */
    async getIncidentsReport(params: { page?: number; limit?: number; status?: string; type?: string }) {
        return await api.get('/reports/incidents', { params });
    }

    /**
     * Download do arquivo exportado
     */
    downloadFile(blob: Blob, filename: string) {
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

const reportService = new ReportService();
export default reportService;
