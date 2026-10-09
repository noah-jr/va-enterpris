'use client';

import React, { useState } from 'react';
import { useReportStats, useExportReport } from '@/hooks/use-reports';
import { useEmergenciesChart } from '@/hooks/use-dashboard';
import { StatCard } from '@/components/dashboard/DashboardStats';
import { OverviewChart } from '@/components/dashboard/OverviewChart';
import { cn } from '@/lib/utils';
import {
    FileText,
    Download,
    TrendingUp,
    AlertTriangle,
    Clock,
    CheckCircle,
    Calendar,
    Filter,
    BarChart3,
    School,
    Hospital,
    Users
} from 'lucide-react';
import { format } from 'date-fns';

export default function ReportsPage() {
    const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);
    const { data: statsRaw, isLoading: isLoadingStats } = useReportStats();
    const { data: chartData, isLoading: isLoadingChart } = useEmergenciesChart(groupBy);
    const exportMutation = useExportReport();

    const stats = statsRaw?.data;

    const handleExport = (type: 'trips' | 'financial' | 'drivers' | 'companies' | 'database', format: 'csv' | 'pdf' | 'xlsx' | 'sql') => {
        exportMutation.mutate({ type, format });
    };

    return (
        <div className="flex flex-col gap-8 w-full pb-20 p-8">
            {/* Tactical Header */}
            <div className="border-b border-border pb-8 flex flex-col md:flex-row justify-between items-end gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-[0.01] pointer-events-none font-black text-[120px] leading-none -translate-y-1/3 select-none uppercase">Reports</div>

                <div className="space-y-3 z-10 w-full lg:w-2/3">
                    <div className="flex items-center gap-4">
                        <div className="h-4 w-1 bg-primary" />
                        <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">Relatórios Táticos</h1>
                    </div>
                    <div className="flex flex-wrap gap-6 font-tactical">
                        <div className="flex items-center gap-2">
                            <span className="text-foreground/40 text-[8px] font-black uppercase tracking-[0.3em]">Central de Inteligência</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground border-l border-border pl-6">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30">Análise de Malha Operacional</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 z-10">
                    <button
                        onClick={() => handleExport('database', 'xlsx')}
                        className="tactical-btn h-12 px-8 bg-primary/10 border-primary/30 text-primary hover:bg-primary hover:text-white transition-all text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        EXPORTAR_FULL_DB
                    </button>
                </div>
            </div>

            {/* Stats Summary Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border mt-4">
                <StatCard
                    code="SOS_TOT"
                    label="Incidentes Totais"
                    value={stats?.emergencies?.total || 0}
                    sub="Histórico Global"
                    isLoading={isLoadingStats}
                />
                <StatCard
                    code="SOS_ACT"
                    label="Alertas Ativos"
                    value={stats?.emergencies?.active || 0}
                    sub="Pendências Atuais"
                    isLoading={isLoadingStats}
                />
                <StatCard
                    code="RSP_AVG"
                    label="Tempo Resposta"
                    value={`${stats?.emergencies?.avgResolutionTime || 0}M`}
                    sub="Média de Resolução"
                    isLoading={isLoadingStats}
                />
                <StatCard
                    code="SOS_SCS"
                    label="Resolvidos Hoje"
                    value={stats?.emergencies?.last24h || 0}
                    sub="Taxa de Sucesso"
                    isLoading={isLoadingStats}
                />
            </div>

            {/* Analysis Center */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Trend Analysis Chart */}
                <div className="xl:col-span-2 tactical-panel p-8 bg-card flex flex-col gap-8 border border-border">
                    <div className="flex items-center justify-between border-b border-border/20 pb-4">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Tendência de Incidentes</span>
                                <span className="text-[7px] font-black uppercase tracking-widest opacity-40">Análise Temporal de Fluxo SOS</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {(['day', 'week', 'month'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setGroupBy(mode)}
                                    className={cn(
                                        "px-3 py-1 text-[8px] font-black uppercase transition-all border",
                                        groupBy === mode
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "border-border text-muted-foreground hover:border-foreground"
                                    )}
                                >
                                    {mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : 'Mês'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[400px] w-full mt-4">
                        <OverviewChart 
                            data={chartData?.mapped} 
                            isLoading={isLoadingChart} 
                            color={chartData?.datasets?.[0]?.borderColor}
                        />
                    </div>
                </div>

                {/* Tactical Export Hub */}
                <div className="flex flex-col gap-8">
                    <div className="tactical-panel p-8 bg-card border border-border flex flex-col gap-6 h-full">
                        <div className="flex items-center gap-3 border-b border-border pb-4">
                            <FileText className="w-5 h-5 opacity-40" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Centro de Exportação</span>
                        </div>

                        <div className="space-y-4 flex-1">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 leading-relaxed">
                                Selecione o módulo operacional para geração de relatório estático e auditoria externa.
                            </p>

                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    { id: 'incidents', label: 'Sinistralidade & Alertas', icon: AlertTriangle },
                                    { id: 'schools', label: 'Infraestrutura Escolar', icon: School },
                                    { id: 'hospitals', label: 'Rede Hospitalar', icon: Hospital },
                                    { id: 'demographics', label: 'Matriz Demográfica', icon: Users },
                                ].map((item) => (
                                    <div key={item.id} className="p-4 bg-muted/20 border border-border hover:border-primary/50 transition-all group flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-background border border-border">
                                                <item.icon className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-tight">{item.label}</span>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleExport(item.id as any, 'xlsx')} className="p-2 hover:bg-primary hover:text-white border border-border text-[8px] font-black uppercase">XLSX</button>
                                            <button onClick={() => handleExport(item.id as any, 'pdf')} className="p-2 hover:bg-primary hover:text-white border border-border text-[8px] font-black uppercase">PDF</button>
                                            <button onClick={() => handleExport(item.id as any, 'csv')} className="p-2 hover:bg-primary hover:text-white border border-border text-[8px] font-black uppercase">CSV</button>
                                        </div>
                                    </div>
                                ))}
                                <div className="p-4 p-4 border border-magenta-500/20 bg-magenta-500/5 hover:bg-magenta-500 hover:border-magenta-500 group transition-all cursor-pointer mt-4" onClick={() => handleExport('database', 'sql')}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-background border border-magenta-500/30">
                                                <AlertTriangle className="w-3.5 h-3.5 text-magenta-500" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-tight group-hover:text-white">DUMP_COMPLETO_SQL</span>
                                        </div>
                                        <span className="text-[8px] font-black group-hover:text-white opacity-40">PROTOCOLO_ALFA</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border mt-auto">
                            <div className="flex items-center gap-2 text-[7px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-30 font-tactical">
                                <span>{'>'} Auditoria_Level_7_Enabled</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

    {/* Matrix Data Id (Overlay-style footer) */}
    <div className="text-[7px] font-black text-muted-foreground uppercase tracking-[0.5em] opacity-30 font-tactical mt-10">
        Sincronizando Malha de Reporte // Unidade_Prime_GEOSPACE // {mounted ? format(new Date(), 'yyyy-MM-dd HH:mm:ss') : '--:--:--'}
    </div>
        </div>
    );
}

function ShieldCheck(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
