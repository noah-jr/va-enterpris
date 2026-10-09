import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Wrench, Plus, Search, Download,
    CheckCircle2, Clock, Loader2,
    ShieldCheck, Activity,
    Settings, History,
    Package, Timer, X, Calendar, ChevronRight, BadgeCheck, PlusCircle
} from 'lucide-react';
import api from '../api';
import { format } from 'date-fns';
import { usePermissions, useMe } from '../auth/useAuth';
import { toast } from 'sonner';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
    PENDING: { label: 'Pendente', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', icon: <Clock size={12} /> },
    IN_PROGRESS: { label: 'Em Curso', color: 'text-sky-700 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10', border: 'border-sky-200 dark:border-sky-500/20', icon: <Settings size={12} className="animate-spin-slow" /> },
    COMPLETED: { label: 'Concluído', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', icon: <CheckCircle2 size={12} /> },
};

const PRIORITY_CFG: Record<string, { label: string; color: string; dot: string }> = {
    HIGH: { label: 'Crítica', color: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' },
    MEDIUM: { label: 'Média', color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
    LOW: { label: 'Baixa', color: 'text-sky-600 dark:text-sky-400', dot: 'bg-sky-500' },
};

export default function Maintenance() {
    const [tab, setTab] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
    const [search, setSearch] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const { hasPermission } = usePermissions();
    const { data: me } = useMe();
    const isModuleEnabled = me?.company?.enabledModules?.includes('fleet') || me?.role === 'SUPER_ADMIN';

    const { data: maintenanceData, isLoading } = useQuery({
        queryKey: ['maintenance'],
        queryFn: async () => (await api.get('/maintenance')).data
    });

    const maintenance = maintenanceData || [];

    const filtered = maintenance.filter((m: any) => {
        const matchesSearch = 
            (m.title || '').toLowerCase().includes(search.toLowerCase()) ||
            (m.asset?.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (m.description || '').toLowerCase().includes(search.toLowerCase());
        
        const matchesTab = tab === 'ALL' || m.status === tab;
        return matchesSearch && matchesTab;
    });

    const stats = {
        total: maintenance.length,
        pending: maintenance.filter((m: any) => m.status === 'PENDING').length,
        inProgress: maintenance.filter((m: any) => m.status === 'IN_PROGRESS').length,
        completed: maintenance.filter((m: any) => m.status === 'COMPLETED').length,
        avgResponse: '2.4h'
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [assetId, setAssetId] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState('');

    const qc = useQueryClient();
    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/maintenance', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['maintenance'] });
            toast.success('Protocolo de manutenção registado.');
            setIsModalOpen(false);
            resetForm();
        }
    });

    const resetForm = () => {
        setTitle('');
        setAssetId('');
        setPriority('MEDIUM');
        setDescription('');
        setCost('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({ title, assetId, priority, description, cost: Number(cost), status: 'PENDING' });
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">Manutenção & Suporte</h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium opacity-70">Intervenções técnicas, preventivas e corretivas.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all shadow-sm"><Download size={18} /></button>
                    {hasPermission('maintenance:create') && isModuleEnabled && (
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[var(--accent)] hover:opacity-90 active:scale-95 text-white px-5 py-2.5 rounded-lg font-semibold text-xs flex items-center gap-2 shadow-md transition-all outline-none"
                        >
                            <Plus size={16} /> Nova Intervenção
                        </button>
                    )}
                </div>
            </div>

            {/* KPI Summary Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Requisições Totais', value: stats.total, sub: 'Protocolos registados', icon: <Wrench size={18} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Em Triagem', value: stats.pending, sub: 'Aguardando início', icon: <Clock size={18} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                    { label: 'Em Curso', value: stats.inProgress, sub: 'Intervenções ativas', icon: <Settings size={18} className="animate-spin-slow" />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                    { label: 'Tempo de Resposta', value: stats.avgResponse, sub: 'Média de atendimento', icon: <Timer size={18} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                ].map((kpi, i) => (
                    <div key={i} className="fluent-card p-6 flex flex-col gap-4 group rounded-xl shadow-md border border-[var(--border-color)]/20">
                        <div className="flex items-center justify-between">
                            <div className={`w-10 h-10 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>{kpi.icon}</div>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text-secondary)] font-medium mb-1 opacity-60">{kpi.label}</p>
                            <p className="text-xl font-bold text-[var(--text-primary)] tabular-nums tracking-tighter">{kpi.value}</p>
                            <span className="text-[10px] font-semibold text-[var(--accent)] opacity-70 mt-1 block">{kpi.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="fluent-card p-4 bg-[var(--bg-secondary)] flex flex-col md:flex-row items-center gap-4 border border-[var(--border-color)]/20 rounded-xl shadow-md group">
                <div className="flex items-center bg-[var(--bg-primary)] border border-[var(--border-color)]/50 p-1 rounded-lg gap-1 shadow-sm w-full md:w-fit overflow-x-auto">
                    {(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${tab === t ? 'bg-[var(--bg-secondary)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                            {t === 'ALL' ? 'Todos' : t === 'PENDING' ? 'Pendente' : t === 'IN_PROGRESS' ? 'Em Curso' : 'Concluído'}
                        </button>
                    ))}
                </div>
                <div className="relative group/search flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40 group-focus-within/search:text-[var(--accent)] transition-opacity" size={16} />
                    <input
                        placeholder="Pesquisar por título, ativo ou descrição..."
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)]/50 py-2.5 pl-12 pr-4 rounded-lg text-sm font-medium text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:opacity-40 shadow-inner"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Matrix Ledger Cluster */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    {isLoading ? (
                        <div className="py-40 flex flex-col items-center justify-center gap-4 text-[var(--text-secondary)] opacity-40">
                            <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
                            <span className="text-xs font-semibold tracking-widest">A carregar registos...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-40 flex flex-col items-center justify-center text-center text-[var(--text-secondary)] opacity-30 border-2 border-dashed border-[var(--border-color)] rounded-xl px-5 sm:px-10">
                            <Wrench size={48} className="mb-4 opacity-40 rotate-12" />
                            <p className="text-sm font-bold uppercase tracking-widest">Nenhuma intervenção encontrada</p>
                        </div>
                    ) : (
                        <div className="fluent-card overflow-hidden bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]/20 shadow-lg group">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[var(--bg-primary)] border-b border-[var(--border-color)]/20">
                                        <tr>
                                            {['Intervenção / Ativo', 'Informações', 'Prioridade', 'Custo Estimado', 'Estado', ''].map(h => (
                                                <th key={h} className="px-6 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-color)]/10">
                                        {filtered.map((m: any) => {
                                            const cfg = STATUS_CFG[m.status] || STATUS_CFG.PENDING;
                                            const prio = PRIORITY_CFG[m.priority] || PRIORITY_CFG.MEDIUM;
                                            return (
                                                <tr key={m.id} onClick={() => setSelectedRequest(m)} className="hover:bg-[var(--bg-primary)]/50 transition-all group/row cursor-pointer">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)] shadow-sm`}>
                                                                <Settings size={20} className={m.status === 'IN_PROGRESS' ? 'animate-spin-slow' : ''} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-[var(--text-primary)]">{m.title}</p>
                                                                <p className="text-[10px] font-bold text-[var(--accent)] opacity-70 flex items-center gap-1 uppercase tracking-tight">
                                                                    <Package size={10} className="opacity-40" /> {m.asset?.name || 'Não especificado'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-xs font-medium text-[var(--text-primary)] opacity-70 line-clamp-1">{m.description || 'Sem descrição.'}</p>
                                                        <p className="text-[9px] font-bold text-[var(--text-secondary)] opacity-40 font-mono uppercase tracking-tighter">ID: {m.id.substring(0, 8).toUpperCase()}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${prio.color} flex items-center gap-2`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${prio.dot}`} />
                                                                {prio.label}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-bold text-[var(--text-primary)] tabular-nums">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(m.cost || 0)}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border} uppercase tracking-wider shadow-sm`}>
                                                            {cfg.icon} {cfg.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <ChevronRight size={18} className="text-[var(--text-secondary)] opacity-0 group-hover/row:opacity-40 transition-all ml-auto" />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Compliance Index Tile */}
                    <div className="fluent-card p-4 sm:p-8 bg-[var(--bg-secondary)] border border-[var(--border-color)]/20 shadow-md rounded-xl relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-60">Status de Engenharia</h4>
                            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><ShieldCheck size={20} /></div>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tabular-nums">100%</span>
                            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Eficiência</span>
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed opacity-60 mb-6">Nível máximo de operacionalidade e protocolos preventivos ativos.</p>
                        <button className="w-full py-2.5 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-sm">
                            Relatório Mensal
                        </button>
                    </div>

                    {/* Operational Insights */}
                    <div className="fluent-card p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)]/20 shadow-md rounded-xl space-y-6 group">
                        <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2 uppercase tracking-widest border-b border-[var(--border-color)]/10 pb-4">
                            <Activity size={16} className="text-[var(--accent)]" /> Metas Operacionais
                        </h3>
                        <div className="space-y-5">
                            {[
                                { label: 'Tempo Resposta (MTTR)', status: '2.4H', val: 85, color: 'bg-emerald-500' },
                                { label: 'Ciclo de Vida de Ativo', status: '92%', val: 92, color: 'bg-sky-500' },
                                { label: 'Prevenção de Falhas', status: 'Alta', val: 95, color: 'bg-indigo-500' }
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                        <span className="text-[var(--text-secondary)] opacity-60">{item.label}</span>
                                        <span className="text-[var(--text-primary)]">{item.status}</span>
                                    </div>
                                    <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-color)]/10">
                                        <div className={`h-full ${item.color} rounded-full transition-all duration-1000 opacity-80`} style={{ width: `${item.val}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="fluent-card p-6 bg-[var(--bg-primary)]/30 border border-dashed border-[var(--border-color)] flex flex-col items-center gap-4 text-center rounded-xl opacity-60 group">
                        <History size={32} className="text-[var(--text-secondary)] opacity-40 group-hover:rotate-[-45deg] transition-transform duration-500" />
                        <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed">Histórico Geral de Intervenções</p>
                    </div>
                </div>
            </div>

            {/* Request Detail Side Panel */}
            {selectedRequest && (
                <div className="fixed inset-0 z-[3000] flex justify-end">
                    <div className="absolute inset-0 z-0 bg-[var(--text-primary)]/5 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedRequest(null)} />
                    <div className="relative z-10 w-full max-w-lg bg-[var(--bg-secondary)] h-full overflow-y-auto p-4 sm:p-8 shadow-2xl animate-in slide-in-from-right duration-500 border-l border-[var(--border-color)]/20">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] mb-1">Dossiê de Intervenção</h3>
                                <p className="text-xl font-bold text-[var(--text-primary)]">{selectedRequest.title}</p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="p-2 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-all cursor-pointer"><X size={20} /></button>
                        </div>

                        <div className="space-y-8">
                            <div className="p-6 rounded-xl border border-[var(--accent)]/10 bg-[var(--bg-primary)]/40 relative overflow-hidden">
                                <div className="flex justify-between items-start mb-6">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md border ${STATUS_CFG[selectedRequest.status].bg} ${STATUS_CFG[selectedRequest.status].color} ${STATUS_CFG[selectedRequest.status].border}`}>
                                        {STATUS_CFG[selectedRequest.status].label}
                                    </span>
                                    <div className="text-right">
                                        <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase opacity-40">Prioridade</p>
                                        <p className={`text-lg font-bold ${PRIORITY_CFG[selectedRequest.priority].color} uppercase tracking-tighter`}>{PRIORITY_CFG[selectedRequest.priority].label}</p>
                                    </div>
                                </div>
                                <h2 className="font-bold text-lg text-[var(--text-primary)] mb-1 uppercase tracking-tight">{selectedRequest.asset?.name || 'Item não especificado'}</h2>
                                <p className="font-bold font-mono text-[var(--accent)] text-xs tracking-widest mb-6 uppercase opacity-40">Protocolo: {selectedRequest.id.toUpperCase()}</p>

                                <div className="space-y-4 pt-6 border-t border-[var(--border-color)]/10">
                                    <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] opacity-60">Sumário da Ocorrência</p>
                                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic border-l-2 border-[var(--accent)]/30 pl-4 py-1">
                                        "{selectedRequest.description || 'Nenhuma descrição técnica disponível para este protocolo.'}"
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'Data de Abertura', value: selectedRequest.createdAt ? format(new Date(selectedRequest.createdAt), 'dd/MM/yyyy HH:mm') : 'N/D', icon: <Calendar size={16} className="text-sky-500" /> },
                                    { label: 'Custo Previsto', value: new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(selectedRequest.cost || 0), icon: <Activity size={16} className="text-emerald-500" /> },
                                    { label: 'Responsável', value: selectedRequest.technician || 'Equipa Técnica Central', icon: <Package size={16} className="text-amber-500" /> },
                                    { label: 'Prazo Limite (SLA)', value: '24 Horas', icon: <Timer size={16} className="text-rose-500" /> },
                                ].map((item: any, i) => (
                                    <div key={i} className="p-4 bg-[var(--bg-primary)]/40 border border-[var(--border-color)]/10 rounded-lg">
                                        <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wide flex items-center gap-2 opacity-50 mb-2">{item.icon} {item.label}</p>
                                        <p className="font-bold text-sm text-[var(--text-primary)]">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 border-t border-[var(--border-color)]/10 flex gap-4">
                                <button className="flex-1 py-3 bg-[var(--accent)] hover:opacity-90 text-white rounded-lg font-bold uppercase tracking-wider text-[10px] shadow-md transition-all flex items-center justify-center gap-2 active:scale-95">
                                    <CheckCircle2 size={16} /> Resolver Protocolo
                                </button>
                                <button className="flex-1 py-3 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm">
                                    <History size={16} /> Ver Histórico
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Registration Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 z-0 bg-[var(--text-primary)]/5 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-color)]/20 w-full max-w-lg rounded-xl p-4 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-color)]/10">
                            <div>
                                <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-3">
                                    <PlusCircle size={24} className="text-[var(--accent)]" />
                                    Abertura de Protocolo
                                </h2>
                                <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium opacity-70">Pedido de intervenção técnica ou manutenção.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-all cursor-pointer"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto no-scrollbar pb-2 pr-1">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider opacity-60">Título da Ocorrência</label>
                                <input
                                    required
                                    placeholder="ex: Ruído excessivo no motor"
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)]/50 p-3 rounded-lg text-sm font-medium outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all shadow-inner"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider opacity-60">Ativo / Equipamento</label>
                                    <div className="relative">
                                        <Package size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40" />
                                        <input
                                            required
                                            placeholder="AST-..."
                                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)]/50 p-3 pl-10 rounded-lg text-sm font-medium outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all shadow-inner"
                                            value={assetId}
                                            onChange={e => setAssetId(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider opacity-60">Prioridade</label>
                                    <select
                                        className="w-full h-[46px] bg-[var(--bg-primary)] border border-[var(--border-color)]/50 p-3 rounded-lg text-sm outline-none cursor-pointer transition-all shadow-inner"
                                        value={priority}
                                        onChange={e => setPriority(e.target.value)}
                                    >
                                        <option value="LOW">Baixa</option>
                                        <option value="MEDIUM">Média</option>
                                        <option value="HIGH">Crítica</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider opacity-60">Previsão de Custo (AOA)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)]/50 p-3 rounded-lg text-sm font-bold outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all tabular-nums shadow-inner"
                                    value={cost}
                                    onChange={e => setCost(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider opacity-60">Descrição Detalhada</label>
                                <textarea
                                    rows={4}
                                    placeholder="Descreva a falha ou o serviço necessário..."
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)]/50 p-3 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all resize-none shadow-inner text-[var(--text-primary)] font-medium"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="pt-6 flex gap-3 mt-auto">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-[var(--border-color)]/20 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[var(--bg-primary)] transition-all">Cancelar</button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="flex-[2] bg-[var(--accent)] hover:opacity-90 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={18} />}
                                    Finalizar Protocolo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="pt-12 border-t border-[var(--border-color)]/20 text-center">
                <p className="text-[10px] font-semibold text-[var(--text-secondary)] opacity-40 uppercase tracking-widest flex items-center justify-center gap-2">
                    <ShieldCheck size={12} /> Manutenção Certificada • VA 2026
                </p>
            </div>
        </div>
    );
}
