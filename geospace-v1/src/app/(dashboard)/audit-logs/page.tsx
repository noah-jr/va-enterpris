'use client';

import React, { useState, useEffect } from 'react';
import { useAuditLogs, useAuditLogStats, exportAuditLogs } from '@/hooks/use-audit-logs';
import type { AuditLog, AuditLogFilters } from '@/lib/services/audit-log.service';
import { cn } from '@/lib/utils';
import { Search, ChevronLeft, ChevronRight, X, Eye } from 'lucide-react';

export default function AuditLogsPage() {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [mounted, setMounted] = useState(false);
    const [filters, setFilters] = useState<AuditLogFilters>({
        page: 1,
        limit: 20
    });
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { data: logsData, isLoading } = useAuditLogs({ ...filters, page, search: searchTerm });
    const { data: statsRaw } = useAuditLogStats({ ...filters, search: searchTerm });
    const stats = statsRaw;

    // Ensure logs is always an array
    const logs = Array.isArray(logsData) ? logsData : (logsData as any)?.data || [];
    const pagination = (logsData as any)?.pagination || { total: 0, totalPages: 1 };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportAuditLogs(filters);
        } finally {
            setIsExporting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString()
        };
    };

    const getActionColor = (action: string) => {
        if (action.includes('CREATE')) return 'text-green-500';
        if (action.includes('UPDATE')) return 'text-yellow-500';
        if (action.includes('DELETE')) return 'text-red-500';
        if (action.includes('VIEW')) return 'text-blue-500';
        return 'text-muted-foreground';
    };

    return (
        <div className="flex flex-col gap-8 w-full pb-20">
            {/* Tactical Header */}
            <div className="border-b border-border pb-8 flex flex-col md:flex-row justify-between items-end gap-8 relative">
                <div className="absolute top-0 right-0 opacity-[0.01] pointer-events-none font-black text-[80px] leading-none -translate-y-1/4 select-none">AUDITORIA</div>

                <div className="space-y-3 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-1 bg-foreground" />
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Logs de Auditoria</h1>
                    </div>
                    <div className="flex gap-6 font-tactical">
                        {stats && (
                            <div className="flex items-center gap-2">
                                <span className="text-foreground/40 text-[8px] font-black uppercase tracking-[0.3em]">
                                    Total: {stats.total}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 z-10">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="tactical-btn-primary px-8 text-[9px]"
                    >
                        {isExporting ? 'EXPORTANDO...' : 'EXPORTAR CSV'}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-border border border-border">
                    <div className="bg-card p-6">
                        <div className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2 font-tactical">Total de Logs</div>
                        <div className="text-3xl font-black">{stats.total}</div>
                    </div>
                    <div className="bg-card p-6">
                        <div className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2 font-tactical">Ações Únicas</div>
                        <div className="text-3xl font-black">{Object.keys(stats?.byAction || {}).length}</div>
                    </div>
                    <div className="bg-card p-6">
                        <div className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2 font-tactical">Recursos</div>
                        <div className="text-3xl font-black">{Object.keys(stats?.byResource || {}).length}</div>
                    </div>
                    <div className="bg-card p-6">
                        <div className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2 font-tactical">Usuários</div>
                        <div className="text-3xl font-black">{Object.keys(stats?.byUser || {}).length}</div>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative col-span-1 md:col-span-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-30" />
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        className="tactical-btn pl-10 pr-4 w-full text-[9px] bg-background"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                <input
                    type="text"
                    placeholder="Filtrar por ação..."
                    className="tactical-btn px-4 text-[9px] bg-background"
                    value={filters.action || ''}
                    onChange={(e) => setFilters({ ...filters, action: e.target.value || undefined, page: 1 })}
                />
                <input
                    type="text"
                    placeholder="Filtrar por recurso..."
                    className="tactical-btn px-4 text-[9px] bg-background"
                    value={filters.resource || ''}
                    onChange={(e) => setFilters({ ...filters, resource: e.target.value || undefined, page: 1 })}
                />
                <input
                    type="date"
                    placeholder="Data inicial..."
                    className="tactical-btn px-4 text-[9px] bg-background"
                    value={filters.startDate || ''}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined, page: 1 })}
                />
                <input
                    type="date"
                    placeholder="Data final..."
                    className="tactical-btn px-4 text-[9px] bg-background"
                    value={filters.endDate || ''}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined, page: 1 })}
                />
            </div>

            {/* Tactical Data Grid */}
            <div className="border border-border w-full overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-muted/40 h-10 border-b border-border text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em] font-tactical">
                    <div className="col-span-2 flex items-center px-6 border-r border-border">Data/Hora</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">Usuário</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">Ação</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">Recurso</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">ID Recurso</div>
                    <div className="col-span-1 flex items-center px-6 border-r border-border">IP</div>
                    <div className="col-span-1 flex items-center px-6 justify-end">VER</div>
                </div>

                {/* Table Content */}
                <div className="divide-y divide-border/20 max-h-[600px] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-20 text-center opacity-10">
                            <span className="text-[8px] font-black uppercase tracking-[0.5em] font-tactical animate-pulse">Carregando...</span>
                        </div>
                    ) : !logs || logs.length === 0 ? (
                        <div className="p-20 text-center text-[8px] font-black uppercase text-muted-foreground opacity-20 font-tactical">Nenhum log encontrado</div>
                    ) : (
                        logs.map((log: any) => {
                            const { date, time } = formatDate(log.createdAt);
                            return (
                                <div key={log.id} className="grid grid-cols-12 min-h-16 hover:bg-muted/30 group transition-all items-center">
                                    <div className="col-span-2 px-6 h-full flex flex-col justify-center border-r border-border/10 font-tactical opacity-60">
                                        <span className="text-[8px] font-black">{date}</span>
                                        <span className="text-[7px] font-bold opacity-50">{time}</span>
                                    </div>
                                    <div className="col-span-2 px-6 h-full flex flex-col justify-center border-r border-border/10">
                                        <span className="text-[10px] font-black uppercase tracking-tight truncate">
                                            {log.userName || 'Sistema'}
                                        </span>
                                        <span className="text-[7px] font-bold opacity-30 uppercase font-tactical mt-0.5 truncate">
                                            {log.userId.substring(0, 8)}
                                        </span>
                                    </div>
                                    <div className="col-span-2 px-6 h-full flex items-center border-r border-border/10">
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-tight",
                                            getActionColor(log.action)
                                        )}>
                                            {log.action}
                                        </span>
                                    </div>
                                    <div className="col-span-2 px-6 h-full flex items-center border-r border-border/10">
                                        <span className="text-[9px] font-bold uppercase truncate">{log.resource}</span>
                                    </div>
                                    <div className="col-span-2 px-6 h-full flex items-center border-r border-border/10">
                                        <span className="text-[8px] opacity-40 font-tactical truncate">
                                            {log.resourceId ? `#${log.resourceId.substring(0, 8)}` : '-'}
                                        </span>
                                    </div>
                                    <div className="col-span-1 px-6 h-full flex items-center border-r border-border/10">
                                        <span className="text-[8px] opacity-30 font-mono truncate">
                                            {log.ipAddress || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="col-span-1 px-6 h-full flex items-center justify-end">
                                        <button
                                            onClick={() => setSelectedLog(log)}
                                            className="tactical-btn w-8 h-8 p-0 flex items-center justify-center border-border/40 hover:bg-foreground hover:text-background transition-all"
                                        >
                                            <Eye className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center bg-card/20 p-4 border border-border">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Log_Sequence_Control</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="h-10 px-6 border border-border text-[8px] font-black hover:bg-foreground hover:text-background disabled:opacity-20 transition-all font-tactical flex items-center gap-2"
                    >
                        <ChevronLeft className="w-3 h-3" /> [ANTERIOR]
                    </button>
                    <div className="w-24 h-10 border border-border flex items-center justify-center text-[10px] font-black font-tactical">
                        {page} / {pagination.totalPages}
                    </div>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                        className="h-10 px-6 border border-border text-[8px] font-black hover:bg-foreground hover:text-background disabled:opacity-20 transition-all font-tactical flex items-center gap-2"
                    >
                        [PRÓXIMO] <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Modal de Detalhes */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-card border border-border w-full max-w-2xl overflow-hidden shadow-2xl">
                        <div className="h-12 border-b border-border px-6 flex items-center justify-between bg-muted/40 font-tactical">
                            <span className="text-[10px] font-black uppercase tracking-widest">Detalhes do Evento::{selectedLog.id.substring(0, 8)}</span>
                            <button onClick={() => setSelectedLog(null)} className="hover:opacity-50 transition-opacity">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div className="space-y-4">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">DATA_HORA</span>
                                        <span className="text-[12px] font-black">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">OPERADOR</span>
                                        <span className="text-[12px] font-black uppercase">{selectedLog.userName || 'SISTEMA'}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">AÇÃO</span>
                                        <span className={cn("text-[12px] font-black uppercase", getActionColor(selectedLog.action))}>
                                            {selectedLog.action}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">RECURSO</span>
                                        <span className="text-[12px] font-black uppercase">{selectedLog.resource} {selectedLog.resourceId && `:: ${selectedLog.resourceId}`}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-2">DADOS_CARGA_PAYLOAD</span>
                                <div className="bg-muted p-4 border border-border overflow-auto max-h-[300px]">
                                    <pre className="text-[10px] font-mono whitespace-pre-wrap">
                                        {JSON.stringify(selectedLog.details, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                        <div className="h-12 border-t border-border px-6 flex items-center justify-end bg-muted/20">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="tactical-btn px-6 text-[10px]"
                            >
                                FECHAR_VIEW
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Info */}
            <div className="flex justify-between items-center opacity-20">
                <span className="text-[8px] font-black uppercase tracking-[0.4em] font-tactical">
                    Sistema de Auditoria::GEOSPACE_Admin
                </span>
                <span className="text-[7px] font-tactical">
                    Última atualização: {mounted ? new Date().toLocaleString() : ''}
                </span>
            </div>
        </div>
    );
}
