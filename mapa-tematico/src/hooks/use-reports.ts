"use client";

import { useMutation, useQuery } from '@tanstack/react-query';
import reportService, { type ReportType, type ExportFormat, type ExportFilters } from '@/lib/services/report.service';
import { toast } from '@/hooks/use-toast';

export function useReportStats() {
    return useQuery({
        queryKey: ['report-stats'],
        queryFn: () => reportService.getDashboardMetrics()
    });
}

export function useIncidentsReport(params: { page?: number; limit?: number; status?: string; type?: string }) {
    return useQuery({
        queryKey: ['incidents-report', params],
        queryFn: () => reportService.getIncidentsReport(params)
    });
}

export function useExportReport() {
    return useMutation({
        mutationFn: async ({ type, format, filters }: { type: ReportType, format: ExportFormat, filters?: ExportFilters }) => {
            const blob = await reportService.exportData(type, format, filters);
            const extension = format === 'xlsx' ? 'xlsx' : format;
            const filename = `report_${type}_${new Date().toISOString().split('T')[0]}.${extension}`;
            reportService.downloadFile(blob, filename);
            return true;
        },
        onSuccess: () => {
            toast({
                title: "Exportação Concluída",
                description: "O arquivo foi gerado e o download iniciado.",
            });
        },
        onError: (error) => {
            console.error('Erro na exportação:', error);
            toast({
                title: "Erro na Exportação",
                description: "Não foi possível gerar o arquivo de reporte.",
                variant: "destructive"
            });
        }
    });
}
