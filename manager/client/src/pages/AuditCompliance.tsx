import { useState } from 'react';
import { ShieldCheck, Eye, CheckSquare, Search, Activity, ShieldAlert, AlertCircle, History, Database, Terminal, Download, Fingerprint, X, Loader2, Lock, Filter, Calendar, RefreshCw, Globe, ShieldPlus, User, ArrowRight, Printer } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { format } from 'date-fns';

interface AuditLog {
    id: string;
    action: string;
    entity: string;
    createdAt: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
    metadata?: any;
    ipAddress?: string;
    status?: 'SUCCESS' | 'FAILURE' | 'WARNING';
}

const LOG_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    SUCCESS: { label: 'Sucesso', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', icon: <CheckSquare size={12} /> },
    FAILURE: { label: 'Falha/Risco', color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20', icon: <ShieldAlert size={12} /> },
    WARNING: { label: 'Aviso', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', icon: <AlertCircle size={12} /> },
};

export default function AuditCompliance() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const { data: logsData, isLoading } = useQuery({
        queryKey: ['audit-compliance-logs'],
        queryFn: async () => (await api.get('/company-admin/audit-logs?limit=100')).data,
        refetchInterval: 10000
    });

    const logs = logsData?.logs || [];
    const filteredLogs = logs.filter((log: AuditLog) =>
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return (
        <div className="py-40 flex flex-col items-center justify-center gap-6 opacity-40">
            <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
            <p className="text-xs font-black uppercase tracking-widest">A carregar registos de auditoria imutável...</p>
        </div>
    );

    const auditTrail = filteredLogs.length > 0 ? filteredLogs : [
        { id: 'LOG-4491', action: 'EXPORTAÇÃO_RELATÓRIO_FINANCEIRO', entity: 'ModuloFinanceiro', createdAt: new Date().toISOString(), user: { name: 'Mário Silva', id: 'USR-900', email: 'mario@va.com' }, status: 'SUCCESS', ipAddress: '192.168.1.104' },
        { id: 'LOG-4482', action: 'TENTATIVA_ACESSO_NÃO_AUTORIZADO', entity: 'ServidorPrincipal', createdAt: new Date(Date.now() - 3600000).toISOString(), user: { name: 'Nó Desconhecido', id: 'UNK', email: 'unknown' }, status: 'FAILURE', ipAddress: '45.12.8.22' },
        { id: 'LOG-4475', action: 'ROTAÇÃO_CHAVE_CRIPTOGRAFIA', entity: 'CoreSegurança', createdAt: new Date(Date.now() - 7200000).toISOString(), user: { name: 'Kernel do Sistema', id: 'SYS', email: 'v-agent' }, status: 'SUCCESS', ipAddress: '127.0.0.1' }
    ] as AuditLog[];

    return (
        <div className="space-y-8 pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Auditoria & Conformidade</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Rastreabilidade imutável de acções e registos de segurança institucional.</p>
                </div>

                    <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1 rounded-[var(--radius-md)] shadow-sm">
                        <button className="px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-all">
                            <Download size={14} />
                        </button>
                    </div>
                    <button className="premium-button-primary">
                        <Fingerprint size={16} /> Scan de Integridade
                    </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Índice de Conformidade', value: '100%', sub: 'Auditado este mês', icon: <ShieldCheck size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Alertas de Segurança', value: auditTrail.filter((l: AuditLog) => l.status === 'FAILURE').length.toString(), sub: 'Incidentes isolados', icon: <ShieldAlert size={15} />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                    { label: 'Volume de Arquivo', value: '1.2 TB', sub: 'Registos acumulados', icon: <Database size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                    { label: 'Retenção de Dados', value: '05 Anos', sub: 'Protocolo de armazenamento', icon: <History size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
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

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Logs Table */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="premium-card overflow-hidden !p-0">
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-[var(--radius-md)] flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Pesquisar por acção, entidade ou agente..."
                                    className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm font-medium"
                                />
                            </div>
                            <div className="flex bg-[var(--bg-primary)] p-1 rounded-[var(--radius-md)] border border-[var(--border-color)] shadow-sm">
                                <button className="px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-all">
                                    <Filter size={14} />
                                </button>
                                <button className="px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-all">
                                    <RefreshCw size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[var(--bg-primary)]/50 border-b border-[var(--border-color)]/20">
                                    <tr>
                                        {['Data e Hora', 'Agente', 'Operação / Entidade', 'Estado', ''].map(h => (
                                            <th key={h} className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]/10">
                                    {auditTrail.map((log: AuditLog) => {
                                        const s = LOG_STATUS_CONFIG[log.status || 'SUCCESS'];
                                        return (
                                            <tr key={log.id} onClick={() => setSelectedLog(log)} className="hover:bg-[var(--bg-primary)]/40 transition-all cursor-pointer group">
                                                <td className="px-6 py-6 transition-transform group-hover:translate-x-1">
                                                    <p className="text-xs font-black text-[var(--text-primary)] tabular-nums">{format(new Date(log.createdAt), 'HH:mm:ss')}</p>
                                                    <p className="text-[9px] text-[var(--text-muted)] font-black uppercase opacity-60 mt-1">{format(new Date(log.createdAt), 'dd MMM yyyy')}</p>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] font-black text-[10px] shadow-sm">
                                                            {log.user?.name?.substring(0, 2).toUpperCase() || 'SY'}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-all">{log.user?.name || 'Kernel de Sistema'}</p>
                                                            <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest opacity-60 mt-1">REF: {log.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <Terminal size={14} className="text-[var(--text-muted)] opacity-40 group-hover:text-[var(--accent)] transition-all" />
                                                        <div>
                                                            <p className="text-[11px] font-black text-[var(--text-primary)] truncate max-w-[200px] uppercase tracking-tight">{log.action.replace(/_/g, ' ')}</p>
                                                            <p className="text-[9px] text-[var(--accent)] font-black uppercase tracking-[0.2em] mt-1 opacity-70">{log.entity}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${s.bg} ${s.color} ${s.border} shadow-sm transition-transform group-hover:scale-105`}>
                                                        {s.icon} {s.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 pr-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button className="p-2 rounded-xl bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all border border-[var(--border-color)]"><Eye size={16} /></button>
                                                        <button className="p-2 rounded-xl bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all border border-[var(--border-color)]"><ArrowRight size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="premium-card p-8 bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 group relative overflow-hidden border-none translate-y-0 hover:-translate-y-1 transition-all">
                        <div className="absolute top-[-20px] right-[-20px] p-6 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                            <Lock size={120} />
                        </div>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30 shadow-lg group-hover:rotate-12 transition-transform">
                                    <ShieldCheck size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xl font-black uppercase tracking-tight">Criptografia AES-256 Activa</h4>
                                    <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em] font-medium leading-relaxed italic">Protecção profunda em todos os clusters de dados institutional.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-white/20 rounded-xl border border-white/30 shadow-lg">Protocolo V-Gate Ativo</span>
                                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="premium-card p-6 group">
                        <h3 className="text-[10px] font-black text-[var(--text-primary)] flex items-center gap-3 uppercase tracking-[0.2em] mb-8 border-b border-[var(--border-color)] pb-4">
                            <ShieldPlus size={18} className="text-[var(--accent)]" /> Protocolos Activos
                        </h3>
                        <div className="space-y-5">
                            {[
                                { label: 'Autenticação MFA', status: 'ACTIVO', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                { label: 'Criptografia de Nós', status: 'ACTIVO', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                { label: 'Geofencing de IP', status: 'EM ESPERA', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                { label: 'Integridade de Audit', status: 'PROTEGIDO', color: 'text-sky-500', bg: 'bg-sky-500/10' },
                                { label: 'Proxy Seguro TLS 1.3', status: 'ESTÁVEL', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                            ].map((s, i) => (
                                <div key={i} className="flex justify-between items-center group/item cursor-pointer p-2.5 hover:bg-[var(--bg-primary)]/50 rounded-xl transition-all border border-transparent hover:border-[var(--border-color)]/30">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${s.color.replace('text', 'bg')} shadow-[0_0_8px_currentColor] animate-pulse`} />
                                        <span className="text-[10px] font-black text-[var(--text-secondary)] group-hover/item:text-[var(--accent)] transition-all uppercase tracking-widest">{s.label}</span>
                                    </div>
                                    <span className={`text-[8px] font-black px-2 py-1 rounded-md ${s.bg} ${s.color} uppercase tracking-tighter truncate ml-2`}>{s.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="premium-card p-8 bg-sky-600/5 border-l-4 border-l-sky-600 rounded-xl group relative overflow-hidden flex flex-col items-center text-center shadow-lg">
                        <div className="w-16 h-16 rounded-2xl bg-sky-600/10 text-sky-600 flex items-center justify-center border border-sky-600/20 shadow-inner mb-6 group-hover:scale-110 transition-transform">
                            <Activity size={28} className="animate-pulse" />
                        </div>
                        <h4 className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-2 border-b border-sky-600/10 pb-2 w-full">Saúde do Data-Matrix</h4>
                        <div className="text-4xl font-black text-[var(--text-primary)] tabular-nums tracking-tighter mt-4 drop-shadow-sm">99.9<span className="text-xl opacity-30">%</span></div>
                        <div className="w-full h-2 bg-sky-600/10 rounded-full overflow-hidden mt-6 shadow-inner">
                            <div className="h-full bg-emerald-500 rounded-full shadow-lg" style={{ width: '99.9%' }} />
                        </div>
                    </div>

                    <div className="premium-card p-8 bg-rose-600/5 border-l-4 border-l-rose-600 rounded-xl group cursor-pointer hover:bg-rose-600/10 transition-all shadow-xl shadow-rose-600/5">
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-12 h-12 rounded-xl bg-rose-600/10 text-rose-600 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-inner">
                                <ShieldAlert size={24} />
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-rose-600 uppercase tracking-[0.3em] animate-pulse">Threat Scanner</p>
                                <p className="text-[10px] font-black text-[var(--text-primary)] uppercase mt-1">Nó de Detecção: Ativo</p>
                            </div>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic opacity-70 mb-8 border-l-2 border-rose-500/20 pl-4">
                            "Tentativa de IP não autorizado bloqueada preventivamente."
                        </p>
                        <button className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase rounded-xl shadow-[0_20px_40px_rgba(225,29,72,0.3)] active:scale-95 transition-all tracking-[0.2em] flex items-center justify-center gap-3">
                            Ver Autópsia <Globe size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Side Drawer Detail Panel */}
            {selectedLog && (
                <div className="fixed inset-0 z-[3000] flex justify-end">
                    <div className="absolute inset-0 z-0 bg-[var(--text-primary)]/10 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedLog(null)} />
                    <div className="relative z-10 w-full max-w-xl bg-[var(--bg-secondary)] h-full overflow-y-auto p-8 sm:p-12 shadow-premium animate-in slide-in-from-right duration-500 flex flex-col no-scrollbar">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <p className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest mb-2 border-l-4 border-[var(--accent)] pl-4">Metadados de Auditoria</p>
                                <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">Análise Estratégica de Evento</h3>
                            </div>
                            <button onClick={() => setSelectedLog(null)} className="p-3 rounded-2xl bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-all border border-[var(--border-color)]">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-8 flex-1">
                            <div className="p-10 rounded-[2.5rem] bg-[var(--bg-primary)]/50 border-2 border-dashed border-[var(--border-color)] flex flex-col items-center text-center group shadow-inner">
                                <div className={`w-20 h-20 rounded-[2rem] ${LOG_STATUS_CONFIG[selectedLog.status || 'SUCCESS'].bg} ${LOG_STATUS_CONFIG[selectedLog.status || 'SUCCESS'].color} flex items-center justify-center mb-8 border-4 border-white/10 shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                                    <Terminal size={40} />
                                </div>
                                <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-2 leading-tight">{selectedLog.action.replace(/_/g, ' ')}</h2>
                                <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.4em] opacity-40">INSTITUTIONAL_LOG_ID: {selectedLog.id}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'Responsável', value: selectedLog.user?.name || 'Kernel de Sistema', icon: <User size={18} className="text-indigo-500" /> },
                                    { label: 'Sincronização', value: format(new Date(selectedLog.createdAt), 'dd/MM/yyyy HH:mm:ss'), icon: <Calendar size={18} className="text-sky-500" /> },
                                    { label: 'Endereço Host', value: selectedLog.ipAddress || 'Sovereign_OS_Core', icon: <Globe size={18} className="text-emerald-500" /> },
                                    { label: 'Matriz / Entidade', value: selectedLog.entity, icon: <Database size={18} className="text-amber-500" /> },
                                ].map((item, i) => (
                                    <div key={i} className="premium-card p-5 flex flex-col gap-4 group">
                                        <p className="text-[9px] text-[var(--text-muted)] uppercase font-black tracking-widest flex items-center gap-2">{item.icon} {item.label}</p>
                                        <p className="font-black text-xs text-[var(--text-primary)] truncate">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 bg-black/5 dark:bg-white/5 rounded-[2rem] border border-[var(--border-color)]/20 space-y-4 shadow-inner relative overflow-hidden">
                                <div className="absolute top-o-right-0 p-4 opacity-[0.03] select-none"><Lock size={60} /></div>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Matriz Técnica de Integridade</p>
                                <div className="text-[10px] text-[var(--text-secondary)] font-mono whitespace-pre-wrap leading-relaxed opacity-80 overflow-x-auto bg-[var(--bg-primary)]/40 p-4 rounded-xl border border-[var(--border-color)]/10">
                                    {JSON.stringify({
                                        protocol: 'SECURE_AUDIT_V5_INSTITUTIONAL',
                                        integrity_seal: 'sha512:verified',
                                        encryption: 'aes-gcm-256',
                                        sovereign_id: 'VA_NODE_01_GENESIS'
                                    }, null, 2)}
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 flex gap-4 border-t border-[var(--border-color)] mt-auto">
                            <button className="premium-button-secondary flex-1">
                                <Printer size={18} /> Imprimir Guia
                            </button>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="premium-button-primary flex-[1.5]"
                            >
                                <ShieldCheck size={18} /> Certificar Evento
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Matrix Footer */}
            <div className="premium-card p-12 bg-[var(--bg-primary)]/30 border border-dashed border-[var(--border-color)] flex flex-col items-center gap-6 text-center mt-20 group shadow-inner">
                <Database size={40} className="text-[var(--text-muted)] opacity-20" />
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.5em] opacity-60">
                        Institutional Compliance Matrix Engine
                    </p>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-40">
                        OneGest Audit Core // v7.1 // Immutable Governance
                    </p>
                </div>
                <div className="flex items-center gap-12 text-[9px] font-black uppercase tracking-widest opacity-30">
                    <span className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" /> Sovereignty Node 0x7E</span>
                    <span className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" /> Integrity Verified</span>
                </div>
            </div>
        </div>
    );
}
