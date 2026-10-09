import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Search, Clock, ShieldCheck, Activity,
    Download, Filter, Eye, Share2,
    AlertTriangle, Shield, Loader2, History,
    Calendar, User, ChevronLeft, ChevronRight,
    BadgeCheck, FileText
} from 'lucide-react';
import api from '../api';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { DataTable } from '../components/DataTable';

const getActionStyle = (action: string) => {
    if (!action) return 'text-[var(--text-secondary)] bg-[var(--bg-primary)] border-[var(--border-color)]';
    const a = action.toUpperCase();
    if (a.includes('CREATE')) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (a.includes('UPDATE')) return 'text-amber-600 bg-amber-50 border-amber-100';
    if (a.includes('DELETE')) return 'text-rose-600 bg-rose-50 border-rose-100';
    if (a.includes('LOGIN')) return 'text-sky-600 bg-sky-50 border-sky-100';
    if (a.includes('ACCESS')) return 'text-indigo-600 bg-indigo-50 border-indigo-100';
    return 'text-[var(--text-secondary)] bg-[var(--bg-primary)] border-[var(--border-color)]';
};

export default function AuditLogs() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selectedLog, setSelectedLog] = useState<any>(null);
    const itemsPerPage = 12;

    // Debounce manual simple para pesquisa
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data: logsData, isLoading } = useQuery({
        queryKey: ['audit-logs', page, itemsPerPage, debouncedSearch],
        queryFn: async () => (await api.get(`/company-admin/audit-logs?page=${page}&limit=${itemsPerPage}&search=${debouncedSearch}`)).data,
        refetchInterval: 5000 // Atualiza a tabela a cada 5 segundos
    });

    const logs = logsData?.logs || [];
    const totalItems = logsData?.total || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedLogs = logs;

    const columns = [
        {
            header: 'Data e Hora',
            accessor: (log: any) => (
                <div className="flex items-center gap-3">
                    <Calendar size={14} className="text-[var(--accent)] opacity-40" />
                    <div>
                        <p className="font-bold leading-none mb-1">{format(new Date(log.createdAt), 'dd MMM yyyy', { locale: pt })}</p>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50 uppercase">{format(new Date(log.createdAt), 'HH:mm:ss')}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Utilizador',
            accessor: (log: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[10px] font-bold text-[var(--accent)]">
                        {log.user?.name?.substring(0, 1).toUpperCase() || 'S'}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">{log.user?.name || 'Sistema'}</p>
                        <p className="text-[9px] font-bold text-[var(--text-secondary)] opacity-40 uppercase tracking-tight">{log.user?.role || 'SYSTEM'}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Ação',
            accessor: (log: any) => (
                <span className={`inline-flex px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-tight ${getActionStyle(log.action)}`}>
                    {log.action}
                </span>
            )
        },
        {
            header: 'Entidade',
            accessor: (log: any) => (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-30" />
                    <span className="text-[10px] font-bold uppercase text-[var(--text-primary)] tracking-tight">{log.entity}</span>
                </div>
            )
        },
        {
            header: 'Detalhes',
            accessor: (log: any) => (
                <p className="text-[10px] font-medium text-[var(--text-secondary)] opacity-70 truncate italic max-w-xs">
                    {log.details || 'Registo sem metadados adicionais.'}
                </p>
            )
        },
        {
            header: '',
            accessor: (log: any) => (
                <div className="flex justify-end gap-2">
                    <button 
                        onClick={() => setSelectedLog(log)}
                        className="p-2 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all">
                        <Eye size={14} />
                    </button>
                </div>
            ),
            className: "text-right"
        }
    ];

    if (isLoading) return (
        <div className="flex items-center justify-center gap-3 py-32 text-[var(--text-muted)]">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">A carregar registos...</span>
        </div>
    );

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Rastreabilidade (Audit Trail)</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Histórico completo de actividades e segurança do ecossistema.</p>
                </div>
                
                <button className="premium-button-secondary !px-3 !py-2">
                    <Download size={15} /> Exportar Relatório
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Eventos Totais', value: totalItems.toString(), icon: <History size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Integridade', value: '100%', icon: <BadgeCheck size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Ações na Página', value: logs.length.toString(), icon: <AlertTriangle size={15} />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                    { label: 'Sessões Recentes', value: logs.filter((l: any) => (l.action || '').includes('LOGIN')).length.toString(), icon: <Activity size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                ].map((kpi, i) => (
                    <div key={i} className="premium-card p-4 flex items-start gap-3">
                        <div className={`kpi-icon shrink-0 ${kpi.color} ${kpi.bg}`}>
                            {kpi.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-[var(--text-muted)] mb-0.5 truncate">{kpi.label}</p>
                            <p className="text-base font-bold text-[var(--text-primary)] tabular-nums leading-tight">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-[var(--radius-md)] flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                        placeholder="Filtrar por ação, utilizador ou entidade..."
                        className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm font-medium"
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
                <DataTable 
                    data={paginatedLogs}
                    columns={columns}
                    isLoading={isLoading}
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setPage}
                    showSearch={false}
                />
            </div>

            {/* Modal de Detalhes */}
            {selectedLog && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={() => setSelectedLog(null)} />
                    <div className="relative z-10 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[var(--radius-lg)] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-secondary)]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                                    <FileText size={16} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-[var(--text-primary)]">Detalhes do Evento</h3>
                                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{selectedLog.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedLog(null)} className="p-2 text-[var(--text-muted)] hover:text-red-500 rounded-lg transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh] text-sm custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Ação</p>
                                    <p className="font-medium text-[var(--text-primary)]">{selectedLog.action}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Entidade</p>
                                    <p className="font-medium text-[var(--text-primary)]">{selectedLog.entity}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">ID da Entidade</p>
                                    <p className="font-medium text-[var(--text-primary)] truncate" title={selectedLog.entityId}>{selectedLog.entityId}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Endereço IP</p>
                                    <p className="font-medium text-[var(--text-primary)]">{selectedLog.ipAddress || 'Não registado'}</p>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-[var(--border-color)]">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Utilizador Responsável</p>
                                <div className="flex items-center gap-3 bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-color)]">
                                    <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold text-xs uppercase">
                                        {selectedLog.user?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm text-[var(--text-primary)] truncate">{selectedLog.user?.name || 'Sistema / Desconhecido'}</p>
                                        <p className="text-xs text-[var(--text-muted)] truncate">{selectedLog.user?.email || 'Email não disponível'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[var(--border-color)]">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Detalhes da Transação</p>
                                <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono whitespace-pre-wrap break-words">
                                    {selectedLog.details || 'Nenhuma informação adicional foi associada a este evento de auditoria.'}
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-[var(--border-color)]">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Data e Hora (Local)</p>
                                <p className="font-medium text-[var(--text-primary)]">{format(new Date(selectedLog.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", { locale: pt })}</p>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
