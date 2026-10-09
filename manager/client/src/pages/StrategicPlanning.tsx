import { useState } from 'react';
import {
    Target, TrendingUp, Trophy,
    Loader2, X, Clock, Activity,
    History, ArrowUpRight,
    Search, Filter,
    ShieldAlert, BadgeCheck,
    BarChart3, Fingerprint,
    ShieldCheck, Layers as LayersIcon,
    Star, PlusCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../api';
import { usePermissions, useMe } from '../auth/useAuth';
import { format } from 'date-fns';

interface KeyResult { id: string; title: string; target: number; current: number; unit: string; progress: number; }
interface Obj { id: string; title: string; description: string; progress: number; status: 'ON_TRACK' | 'AT_RISK' | 'EXCEEDED' | 'PENDING'; krsCount?: number; keyResults: KeyResult[]; owners?: string[]; period?: string; startDate: string; endDate: string; }

const SC: Record<Obj['status'], { label: string; color: string; bg: string; border: string; icon: any }> = {
    ON_TRACK: {
        label: 'No Prazo',
        color: 'text-sky-700 dark:text-sky-400',
        bg: 'bg-sky-50 dark:bg-sky-500/10',
        border: 'border-sky-200 dark:border-sky-500/20',
        icon: <Activity size={12} />,
    },
    AT_RISK: {
        label: 'Em Risco',
        color: 'text-rose-700 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-500/10',
        border: 'border-rose-200 dark:border-rose-500/20',
        icon: <ShieldAlert size={12} />,
    },
    EXCEEDED: {
        label: 'Superado',
        color: 'text-emerald-700 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        border: 'border-emerald-200 dark:border-emerald-500/20',
        icon: <Trophy size={12} />,
    },
    PENDING: {
        label: 'Pendente',
        color: 'text-slate-600 dark:text-slate-400',
        bg: 'bg-slate-50 dark:bg-slate-500/10',
        border: 'border-slate-200 dark:border-slate-500/20',
        icon: <Clock size={12} />,
    },
};

export default function StrategicPlanning() {
    const queryClient = useQueryClient();
    const [modal, setModal] = useState(false);
    const [editingObj, setEditingObj] = useState<Obj | null>(null);
    const [quarter, setQuarter] = useState('Q1');
    const [form, setForm] = useState({ title: '', description: '', period: '2026-Q1' });
    const [krs, setKrs] = useState<{ title: string; target: number; current: number; unit: string }[]>([]);
    
    const { hasPermission } = usePermissions();
    const { data: me } = useMe();
    const isModuleEnabled = me?.company?.enabledModules?.includes('strategy') || me?.role === 'SUPER_ADMIN';

    const { data: objectives = [], isLoading } = useQuery<Obj[]>({
        queryKey: ['objectives'],
        queryFn: async () => (await api.get('/strategy/objectives')).data,
        retry: 1,
        staleTime: 5000
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/strategy/objectives', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['objectives'] });
            setModal(false);
            setForm({ title: '', description: '', period: '2026-Q1' });
            setKrs([]);
            toast.success('Objetivo estratégico registado com sucesso.');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<Obj>) => api.put(`/strategy/objectives/${data.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['objectives'] });
            setModal(false);
            setEditingObj(null);
            setForm({ title: '', description: '', period: '2026-Q1' });
            toast.success('Objetivo estratégico actualizado.');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/strategy/objectives/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['objectives'] });
            toast.success('Objetivo eliminado permanentemente.');
        }
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const year = parseInt(form.period.split('-')[0]) || 2026;
        const q = form.period.includes('Q') ? parseInt(form.period.split('Q')[1]) : 1;
        
        const payload = {
            ...form,
            startDate: new Date(year, (q - 1) * 3, 1).toISOString(),
            endDate: new Date(year, q * 3, 0).toISOString(),
            keyResults: krs
        };

        if (editingObj) {
            updateMutation.mutate({ ...editingObj, ...form });
        } else {
            createMutation.mutate(payload);
        }
    };

    if (isLoading) return (
        <div className="py-40 flex flex-col items-center justify-center gap-6 text-[var(--text-secondary)] text-center opacity-40">
            <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
            <span className="text-xs font-bold uppercase tracking-widest">Sincronizando Metas Estratégicas...</span>
        </div>
    );

    const list: Obj[] = objectives.length > 0 ? objectives : [];
    const healthScore = 94.1;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Planeamento Estratégico</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Monitorização de OKRs, metas institucionais e desempenho global.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-[var(--bg-primary)] border border-[var(--border-color)]/50 p-1 rounded-lg gap-1 shadow-sm">
                        {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                            <button
                                key={q}
                                onClick={() => setQuarter(q)}
                                className={`px-4 py-1.5 rounded-md transition-all text-[10px] font-bold uppercase tracking-wider ${quarter === q ? 'bg-[var(--bg-secondary)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] opacity-60'}`}
                            >
                                {q} 2026
                            </button>
                        ))}
                    </div>
                    {hasPermission('strategy:create') && isModuleEnabled && (
                        <button
                            onClick={() => setModal(true)}
                            className="bg-[var(--accent)] hover:opacity-90 active:scale-95 text-white px-5 py-2.5 rounded-lg font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
                        >
                            <PlusCircle size={18} /> Novo Objetivo
                        </button>
                    )}
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Objetivos Totais', value: list.length, trend: 'METAS', icon: <Target size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'No Prazo', value: list.filter(o => o.status === 'ON_TRACK').length, trend: 'DIA', icon: <Activity size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                    { label: 'Superados', value: list.filter(o => o.status === 'EXCEEDED').length, trend: 'ALTO', icon: <Trophy size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Em Risco', value: list.filter(o => o.status === 'AT_RISK').length, trend: 'RISCO', icon: <ShieldAlert size={15} />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                ].map((kpi, i) => (
                    <div key={i} className="premium-card p-4 flex items-start gap-3">
                        <div className={`kpi-icon shrink-0 ${kpi.color} ${kpi.bg}`}>
                            {kpi.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-[var(--text-muted)] mb-0.5 truncate">{kpi.label}</p>
                            <p className="text-base font-bold text-[var(--text-primary)] tabular-nums leading-tight">{kpi.value.toString().padStart(2, '0')}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-[var(--radius-md)] flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input
                        placeholder="Pesquisar por objetivo ou indicador analítico..."
                        className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm font-medium"
                    />
                </div>
            </div>

            {/* Objectives List */}
            <div className="space-y-6">
                {list.length === 0 ? (
                    <div className="fluent-card py-40 flex flex-col items-center justify-center text-center text-[var(--text-secondary)] opacity-30 border-2 border-dashed border-[var(--border-color)] rounded-xl px-5 sm:px-10 group">
                        <Target size={48} className="mb-6 opacity-40" />
                        <p className="text-xs font-bold uppercase tracking-widest">Nenhum objetivo estratégico delineado</p>
                    </div>
                ) : list.map((o) => {
                    const s = SC[o.status];
                    return (
                        <div key={o.id} className="fluent-card p-4 sm:p-8 group bg-[var(--bg-secondary)] border border-[var(--border-color)]/30 rounded-xl relative overflow-hidden shadow-lg hover:shadow-xl transition-all">
                            <div className="flex flex-col lg:flex-row items-start justify-between gap-4 sm:gap-8 mb-8">
                                <div className="flex items-start gap-6 flex-1">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border border-[var(--border-color)]/30 bg-[var(--bg-primary)] text-[var(--accent)] shadow-sm group-hover:scale-110 transition-transform`}>
                                        <Fingerprint size={28} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight">{o.title}</h3>
                                                {o.period && <span className="text-[10px] font-bold px-2 py-0.5 bg-[var(--bg-primary)] border border-[var(--border-color)]/50 rounded-md text-[var(--text-secondary)] opacity-60">{o.period}</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingObj(o);
                                                        setForm({ title: o.title, description: o.description, period: format(new Date(o.startDate), 'yyyy-MM-dd') });
                                                        setModal(true);
                                                    }}
                                                    className="w-8 h-8 rounded-full border border-[var(--border-color)]/50 flex items-center justify-center hover:bg-[var(--accent)] hover:border-[var(--accent)] hover:text-white transition-all text-[var(--text-secondary)]"
                                                >
                                                    <Fingerprint size={14} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Eliminar este objetivo estratégico permanentemente? Todos os Key Results serão perdidos.')) {
                                                            deleteMutation.mutate(o.id);
                                                        }
                                                    }}
                                                    className="w-8 h-8 rounded-full border border-[var(--border-color)]/50 flex items-center justify-center hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all text-[var(--text-secondary)]"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-[var(--text-secondary)] font-medium opacity-60 leading-relaxed mb-6 line-clamp-2 pr-4">
                                            {o.description}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4">
                                            <span className="flex items-center gap-2 text-[10px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-500/10 px-2.5 py-1.5 rounded-lg border border-sky-100 dark:border-sky-500/20 uppercase tracking-tight">
                                                <Activity size={12} /> {o.krsCount || 0} Indicadores Chave
                                            </span>
                                            {o.owners && (
                                                <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]/30">
                                                    <div className="flex -space-x-1.5">
                                                        {o.owners.map((ow, idx) => (
                                                            <div key={idx} className="w-6 h-6 rounded-md bg-[var(--accent)] text-white flex items-center justify-center text-[10px] font-bold border-2 border-[var(--bg-secondary)] shadow-sm" title={ow}>{ow.charAt(0)}</div>
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] text-[var(--text-secondary)] font-bold opacity-40 uppercase tracking-tighter">Responsáveis</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center lg:items-end gap-2 shrink-0 bg-[var(--bg-primary)]/50 p-6 rounded-xl border border-[var(--border-color)]/30 shadow-inner min-w-[160px]">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border shadow-sm ${s.color} ${s.bg} ${s.border}`}>
                                        {s.icon} {s.label}
                                    </span>
                                    <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tabular-nums tracking-tighter mt-1">{o.progress}%</div>
                                    <p className="text-[9px] font-bold text-[var(--text-secondary)] opacity-40 uppercase tracking-[0.2em]">Execução</p>
                                </div>
                            </div>

                            {/* Progress Visual */}
                            <div className="h-2.5 bg-[var(--bg-primary)] rounded-full overflow-hidden mb-10 shadow-inner border border-[var(--border-color)]/20">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${o.status === 'EXCEEDED' ? 'bg-emerald-500' : o.status === 'AT_RISK' ? 'bg-rose-500' : 'bg-[var(--accent)]'}`}
                                    style={{ width: `${o.progress}%` }}
                                />
                            </div>

                            {/* Key Results Grid */}
                            {o.keyResults?.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {o.keyResults.map(kr => (
                                        <div key={kr.id} className="p-5 bg-[var(--bg-primary)]/50 border border-[var(--border-color)]/20 rounded-xl hover:bg-[var(--bg-primary)] transition-all shadow-sm group/kr">
                                            <div className="flex justify-between items-start mb-4 gap-3">
                                                <p className="text-xs font-bold text-[var(--text-primary)] flex-1 leading-snug line-clamp-2 group-hover/kr:text-[var(--accent)] transition-colors">{kr.title}</p>
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner ${kr.progress >= 100 ? 'bg-emerald-500 text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)]/50 opacity-40'}`}>
                                                    <BadgeCheck size={16} />
                                                </div>
                                            </div>
                                            <div className="flex items-end justify-between mb-3 pr-2">
                                                <div>
                                                    <span className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{kr.current}{kr.unit}</span>
                                                    <p className="text-[9px] font-bold text-[var(--text-secondary)] opacity-30 uppercase tracking-tighter">Estado Atual</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-20 uppercase">Meta: {kr.target}{kr.unit}</span>
                                                </div>
                                            </div>
                                            <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden shadow-inner border border-[var(--border-color)]/10">
                                                <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-1000 opacity-60" style={{ width: `${Math.min(100, kr.progress)}%` }} />
                                            </div>
                                            <div className="flex justify-between items-center mt-3">
                                                <p className="text-[10px] font-bold text-[var(--accent)] opacity-80">{kr.progress}% Alcançado</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border-color)]/10">
                                <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-30 uppercase tracking-widest flex items-center gap-2">
                                    <Clock size={12} /> Última Auditoria: 08 Março 2026
                                </span>
                                <div className="flex items-center gap-3">
                                    <button className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]/50">
                                        <History size={14} className="opacity-40" /> Histórico
                                    </button>
                                    <button className="text-[10px] font-bold uppercase tracking-widest text-white bg-[var(--accent)] hover:opacity-90 transition-all flex items-center gap-2 px-5 py-2 rounded-lg shadow-md active:scale-95">
                                        <ArrowUpRight size={14} /> Detalhes
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Performance Global Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
                <div className="fluent-card p-4 sm:p-8 bg-[var(--bg-secondary)] border border-[var(--border-color)]/30 rounded-xl shadow-lg group">
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-8 flex items-center gap-3 uppercase tracking-widest opacity-60">
                        <BarChart3 size={18} className="text-[var(--accent)]" /> Desempenho Setorial
                    </h3>
                    <div className="space-y-6">
                        {[
                            { name: 'Comercial & Vendas', perf: 98, color: 'bg-emerald-500' },
                            { name: 'Operações Logísticas', perf: 85, color: 'bg-sky-500' },
                            { name: 'Engenharia de Sistemas', perf: 72, color: 'bg-rose-500' },
                            { name: 'Administrativo', perf: 92, color: 'bg-indigo-500' }
                        ].map((d, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-tighter">
                                    <span className="text-[var(--text-secondary)] opacity-60">{d.name}</span>
                                    <span className="text-[var(--text-primary)]">{d.perf}%</span>
                                </div>
                                <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-color)]/10">
                                    <div className={`h-full ${d.color} opacity-70 transition-all duration-1000`} style={{ width: `${d.perf}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="fluent-card p-5 sm:p-10 flex flex-col items-center justify-center text-center bg-[var(--bg-secondary)] border border-[var(--border-color)]/30 rounded-xl shadow-lg group">
                    <div className="p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]/30 shadow-inner mb-6 transition-all group-hover:scale-110">
                        <Star size={32} className="text-[var(--accent)]" />
                    </div>
                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase opacity-40 tracking-widest mb-2">Corporate Health Score</p>
                    <p className="text-5xl sm:text-6xl font-black text-[var(--text-primary)] tabular-nums tracking-tighter mb-4 leading-none">{healthScore}<span className="text-xl sm:text-2xl opacity-20 font-bold">%</span></p>
                    <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center gap-2 shadow-sm animate-pulse">
                        <TrendingUp size={14} /> Em Ascensão
                    </div>
                </div>

                <div className="fluent-card p-4 sm:p-8 bg-[var(--bg-secondary)] border border-[var(--border-color)]/30 rounded-xl shadow-lg flex flex-col justify-between group">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-sky-50 dark:bg-sky-500/10 text-sky-600 rounded-lg border border-sky-100 dark:border-sky-500/20"><LayersIcon size={20} /></div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest opacity-60">Status de Auditoria</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-[var(--bg-primary)] border border-dashed border-[var(--border-color)] rounded-xl flex items-center gap-4">
                            <div className="kpi-icon bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shadow-sm"><ShieldCheck size={20} /></div>
                            <div>
                                <p className="text-xs font-bold text-[var(--text-primary)] uppercase">Plano Validado</p>
                                <p className="text-[10px] text-emerald-600 font-bold opacity-60">Matriz Sincronizada</p>
                            </div>
                        </div>
                        <button className="w-full py-3 bg-[var(--accent)] hover:opacity-95 text-white rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95">
                            Exportar Relatório Estratégico
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 z-0 bg-[var(--text-primary)]/5 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => { setModal(false); setEditingObj(null); setKrs([]); }} />
                    <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-color)]/20 w-full max-w-2xl rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 sm:p-8 border-b border-[var(--border-color)]/10 flex items-center justify-between bg-gradient-to-r from-[var(--bg-primary)] to-transparent">
                            <div>
                                <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-3">
                                    <Target size={24} className="text-[var(--accent)]" />
                                    {editingObj ? 'Editar Objetivo Estratégico' : 'Novo Objetivo Estratégico'}
                                </h2>
                                <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium opacity-70">Definição de OKRs e metas institucionais de alto impacto.</p>
                            </div>
                            <button onClick={() => { setModal(false); setEditingObj(null); setKrs([]); }} className="p-2 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-all cursor-pointer"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-4 sm:p-8 space-y-6 overflow-y-auto no-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider opacity-60">Título Institucional</label>
                                    <input required placeholder="Ex: Expansão de Mercado Luanda..." className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)]/50 p-4 rounded-xl text-sm font-bold text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all shadow-inner" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                                </div>

                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider opacity-60">Delineamento Estratégico</label>
                                    <textarea required rows={3} placeholder="Descreva o impacto e metas operacionais..." className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)]/50 p-4 rounded-xl text-sm font-bold text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all shadow-inner resize-none" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider opacity-60">Ciclo / Período (AAAA-QX)</label>
                                    <input required className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)]/50 p-4 rounded-xl text-sm font-bold text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all shadow-inner" value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))} />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider opacity-60">Proprietário do Nó</label>
                                    <select className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)]/50 p-4 rounded-xl text-sm font-bold text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all shadow-inner cursor-pointer appearance-none">
                                        <option>Conselho de Administração</option>
                                        <option>Direção Comercial</option>
                                        <option>Operações Industriais</option>
                                    </select>
                                </div>
                            </div>

                            {!editingObj && (
                                <div className="space-y-4 pt-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-[0.2em] opacity-50">Indicadores Chave (Key Results)</h3>
                                        <button type="button" onClick={() => setKrs([...krs, { title: '', target: 100, current: 0, unit: '%' }])} className="text-[9px] font-bold uppercase text-[var(--accent)] hover:underline">Add Indicador</button>
                                    </div>
                                    <div className="space-y-3">
                                        {krs.map((kr, i) => (
                                            <div key={i} className="p-4 bg-[var(--bg-primary)]/50 border border-[var(--border-color)]/30 rounded-xl flex items-center gap-3">
                                                <input placeholder="Título do KR" className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-[var(--text-primary)]" value={kr.title} onChange={e => {
                                                    const n = [...krs]; n[i].title = e.target.value; setKrs(n);
                                                }} />
                                                <input type="number" className="w-16 bg-transparent border-none outline-none text-xs font-bold text-[var(--accent)]" value={kr.target} onChange={e => {
                                                    const n = [...krs]; n[i].target = Number(e.target.value); setKrs(n);
                                                }} />
                                                <input className="w-12 bg-transparent border-none outline-none text-center text-xs font-bold opacity-30" value={kr.unit} onChange={e => {
                                                    const n = [...krs]; n[i].unit = e.target.value; setKrs(n);
                                                }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-8 flex gap-4 mt-auto">
                                <button type="button" onClick={() => { setModal(false); setEditingObj(null); setKrs([]); }} className="flex-1 py-4 bg-[var(--bg-primary)] hover:bg-[var(--border-color)]/10 border border-[var(--border-color)]/20 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)] transition-all">Descartar</button>
                                <button 
                                    type="submit" 
                                    disabled={createMutation.isPending || updateMutation.isPending} 
                                    className="flex-[2] bg-[var(--accent)] hover:opacity-95 text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-[var(--accent)]/10 active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                                >
                                    {(createMutation.isPending || updateMutation.isPending) ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={18} />} 
                                    {editingObj ? 'Actualizar Meta' : 'Consolidar Planeamento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
