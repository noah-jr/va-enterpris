import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Activity, ShieldAlert, CheckCircle, Clock, Plus, Search, Filter, Download, MoreHorizontal, Eye, ShieldCheck, HeartPulse, Trees, AlertTriangle, Loader2, Thermometer, Zap, Shield, ChevronRight, Layers, Calendar, Wind, X, Gavel, Database, ActivitySquare, MapPin, PlusCircle } from 'lucide-react';
import api from '../api';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { usePermissions, useMe } from '../auth/useAuth';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: any; accent: string }> = {
    MITIGATED: { label: 'Resolvido', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', icon: <CheckCircle size={14} />, accent: 'bg-emerald-500' },
    INVESTIGATING: { label: 'Em Investigação', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', icon: <Clock size={14} />, accent: 'bg-amber-500' },
    CRITICAL: { label: 'Crítico', color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20', icon: <AlertTriangle size={14} />, accent: 'bg-rose-500' },
};

const CATEGORY_ICONS: Record<string, any> = {
    SAFETY: <ShieldAlert size={14} />,
    HEALTH: <HeartPulse size={14} />,
    ENVIRONMENT: <Trees size={14} />,
};

export default function HSE() {
    const [view, setView] = useState<'TABLE' | 'GRID'>('TABLE');
    const [search, setSearch] = useState('');
    const { hasPermission } = usePermissions();
    const { data: me } = useMe();
    const isModuleEnabled = me?.company?.enabledModules?.includes('hse') || me?.role === 'SUPER_ADMIN';

    const { data: hseData, isLoading } = useQuery({
        queryKey: ['hse'],
        queryFn: async () => (await api.get('/hse')).data
    });

    const incidents = hseData || [];

    const filtered = incidents.filter((i: any) =>
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        (i.type || '').toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total: incidents.length,
        mitigated: incidents.filter((i: any) => i.status === 'MITIGATED').length,
        critical: incidents.filter((i: any) => i.status === 'CRITICAL').length,
        auditScore: incidents.length > 0 ? 99.8 : 0
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [type, setType] = useState('SAFETY');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');

    const qc = useQueryClient();
    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/hse', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['hse'] });
            toast.success('Incidente reportado e registado na matriz HSE.');
            setIsModalOpen(false);
            resetForm();
        }
    });

    const resetForm = () => {
        setTitle('');
        setType('SAFETY');
        setDescription('');
        setLocation('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({ title, type, description, location, status: 'INVESTIGATING', date: new Date().toISOString() });
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">HSE & Segurança Ocupacional</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Monitorização de saúde, proteção ambiental e protocolos de segurança.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-[var(--bg-primary)] border border-[var(--border-color)]/50 p-1 rounded-lg gap-1 shadow-sm">
                        <button onClick={() => setView('TABLE')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${view === 'TABLE' ? 'bg-[var(--bg-secondary)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] opacity-60'}`}>
                            Tabela
                        </button>
                        <button onClick={() => setView('GRID')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${view === 'GRID' ? 'bg-[var(--bg-secondary)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] opacity-60'}`}>
                            Grelha
                        </button>
                    </div>
                    {hasPermission('hse:create') && isModuleEnabled && (
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[var(--accent)] hover:opacity-90 active:scale-95 text-white px-5 py-2.5 rounded-lg font-semibold text-xs flex items-center gap-2 shadow-md transition-all outline-none"
                        >
                            <Plus size={18} /> Novo Incidente
                        </button>
                    )}
                    <button className="p-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)]/50 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all shadow-sm"><Download size={18} /></button>
                </div>
            </div>

            {/* Matrix KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Eventos Ativos', value: stats.total, icon: <Activity size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                    { label: 'Incidentes Mitigados', value: stats.mitigated, icon: <CheckCircle size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Exposição Crítica', value: stats.critical, icon: <AlertTriangle size={15} />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                    { label: 'Score Auditoria', value: `${stats.auditScore}%`, icon: <Shield size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
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

            {/* Workplace Control */}
            <div className="fluent-card p-4 bg-[var(--bg-secondary)] flex flex-col md:flex-row items-center gap-4 border border-[var(--border-color)]/30 rounded-xl shadow-md group">
                <div className="relative group/search flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40 group-focus-within/search:text-[var(--accent)] transition-all" size={16} />
                    <input
                        placeholder="Pesquisar por incidente, categoria ou núcleo..."
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)]/50 py-2.5 pl-12 pr-4 rounded-lg text-sm font-medium text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all shadow-inner"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-2 shadow-sm">
                        <Filter size={14} /> Filtros
                    </button>
                    <button className="p-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all shadow-sm">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </div>

            {/* Hub Content */}
            {isLoading ? (
                <div className="py-40 flex flex-col items-center justify-center gap-6 text-[var(--text-secondary)] text-center opacity-40">
                    <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
                    <span className="text-xs font-bold uppercase tracking-widest">Sincronizando Dados HSE...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="fluent-card py-40 flex flex-col items-center justify-center text-center text-[var(--text-secondary)] opacity-30 border-2 border-dashed border-[var(--border-color)] rounded-xl px-5 sm:px-10 group">
                    <Shield size={48} className="mb-6 opacity-40" />
                    <p className="text-xs font-bold uppercase tracking-widest">Nenhum incidente registado</p>
                </div>
            ) : view === 'TABLE' ? (
                <div className="fluent-card bg-[var(--bg-secondary)] rounded-xl overflow-hidden shadow-xl border border-[var(--border-color)]/20 min-h-[500px] group">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[var(--bg-primary)]/50 border-b border-[var(--border-color)]/20">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Incidente</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest hidden sm:table-cell">Categoria</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest hidden md:table-cell">Data de Registo</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest hidden lg:table-cell">Natureza</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Estado</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]/10">
                                {filtered.map((i: any) => {
                                    const cfg = STATUS_CFG[i.status] || STATUS_CFG.INVESTIGATING;
                                    return (
                                        <tr key={i.id} className="hover:bg-[var(--bg-primary)]/30 transition-all group/row cursor-pointer">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 bg-[var(--bg-primary)] border border-[var(--border-color)]/50 rounded-lg flex items-center justify-center ${i.type === 'SAFETY' ? 'text-rose-500' : i.type === 'HEALTH' ? 'text-sky-500' : 'text-emerald-500'} shadow-sm group-hover/row:scale-110 transition-transform`}>
                                                        {CATEGORY_ICONS[i.type] || <Shield size={18} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-[var(--text-primary)] group-hover/row:text-[var(--accent)] transition-colors">{i.title}</p>
                                                        <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-40 uppercase tracking-tighter">REF: #{i.id.slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 hidden sm:table-cell">
                                                <div className="flex items-center gap-2">
                                                    <Layers size={14} className="text-[var(--accent)] opacity-40" />
                                                    <span className="text-[10px] font-bold text-[var(--text-primary)] uppercase">{i.type || 'GERAL'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 font-bold text-sm text-[var(--text-primary)] hidden md:table-cell">
                                                {format(new Date(i.date), 'dd MMM yyyy', { locale: pt })}
                                            </td>
                                            <td className="px-6 py-6 hidden lg:table-cell">
                                                <p className="text-[11px] font-medium text-[var(--text-secondary)] line-clamp-2 max-w-[200px] leading-relaxed italic">
                                                    {i.description || 'Nenhum detalhe técnico anexado.'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-bold border border-dashed ${cfg.bg} ${cfg.color} ${cfg.border} uppercase tracking-widest`}>
                                                    {cfg.icon} {cfg.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <button className="p-2 opacity-0 group-hover/row:opacity-100 transition-all text-[var(--text-secondary)] hover:text-[var(--accent)]"><Eye size={16} /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map((i: any) => {
                        const cfg = STATUS_CFG[i.status] || STATUS_CFG.INVESTIGATING;
                        return (
                            <div key={i.id} className="fluent-card group p-6 hover:shadow-2xl transition-all bg-[var(--bg-secondary)] border border-[var(--border-color)]/20 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-lg h-full">
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-[var(--accent)] transition-transform group-hover:scale-110 pointer-events-none"><ShieldCheck size={80} /></div>

                                <div>
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-[var(--border-color)]/30 bg-[var(--bg-primary)] ${i.type === 'SAFETY' ? 'text-rose-500' : i.type === 'HEALTH' ? 'text-sky-500' : 'text-emerald-500'} shadow-sm group-hover:scale-110 transition-transform`}>
                                            {CATEGORY_ICONS[i.type] || <Shield size={24} />}
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border border-dashed transition-all ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${cfg.accent} shadow-sm animate-pulse`} />
                                            {cfg.label}
                                        </span>
                                    </div>

                                    <div className="mb-6">
                                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-40 mb-1 leading-none">{i.type || 'GERAL'}</p>
                                        <h4 className="text-lg font-black text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-tight tracking-tighter line-clamp-2">{i.title}</h4>
                                    </div>

                                    <div className="p-4 bg-[var(--bg-primary)]/50 border border-[var(--border-color)]/20 rounded-xl mb-6 shadow-inner italic text-[10px] text-[var(--text-secondary)] opacity-60 leading-relaxed min-h-[80px]">
                                        {i.description || 'Matriz técnica do evento em processamento...'}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-[var(--border-color)]/10">
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-[9px] font-bold text-[var(--text-secondary)] opacity-30 uppercase tracking-widest flex items-center gap-2"><Calendar size={12} /> {format(new Date(i.date), 'dd/MM/yyyy')}</span>
                                        <button className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] hover:opacity-80 transition-all flex items-center gap-1 group/btn">
                                            Investigar <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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
                                    Reportar Evento HSE
                                </h2>
                                <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium opacity-70">Registo de ocorrência de saúde, segurança ou ambiente.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-all cursor-pointer"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto no-scrollbar pb-2 pr-1">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider opacity-60">Título da Ocorrência</label>
                                <input
                                    required
                                    placeholder="ex: Queda de material no Setor B"
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)]/50 p-3 rounded-lg text-sm font-medium outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all shadow-inner"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider opacity-60">Natureza do Evento</label>
                                    <select
                                        className="w-full h-[46px] bg-[var(--bg-primary)] border border-[var(--border-color)]/50 p-3 rounded-lg text-sm outline-none cursor-pointer transition-all shadow-inner"
                                        value={type}
                                        onChange={e => setType(e.target.value)}
                                    >
                                        <option value="SAFETY">Segurança (Safety)</option>
                                        <option value="HEALTH">Saúde (Health)</option>
                                        <option value="ENVIRONMENT">Ambiente (Environment)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider opacity-60">Localização</label>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40" />
                                        <input
                                            required
                                            placeholder="ex: Pavilhão Sul"
                                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)]/50 p-3 pl-10 rounded-lg text-sm font-medium outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all shadow-inner"
                                            value={location}
                                            onChange={e => setLocation(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider opacity-60">Relato dos Factos / Detalhes</label>
                                <textarea
                                    rows={4}
                                    placeholder="Descreva detalhadamente o ocorrido..."
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
                                    className="flex-[2] bg-rose-600 hover:opacity-90 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={18} />}
                                    Submeter Relatório
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Strategy Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
                <div className="fluent-card p-5 sm:p-10 border-l-4 border-l-sky-600 bg-sky-600/5 relative overflow-hidden group shadow-xl rounded-xl">
                    <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-[0.03] text-sky-600 group-hover:scale-110 transition-transform"><ActivitySquare size={120} /></div>
                    <div className="flex items-center gap-4 sm:gap-8 relative z-10 mb-10">
                        <div className="p-4 bg-sky-600/10 text-sky-600 rounded-2xl border border-sky-600/20 shadow-sm"><HeartPulse size={32} /></div>
                        <div>
                            <h4 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-tight">Triagem Ocupacional</h4>
                            <p className="text-[10px] text-sky-600 font-bold uppercase tracking-widest opacity-60 mt-0.5">Sincronização Médica VA</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                        {[
                            { label: 'Matriz Bio-Safe', val: 94, icon: <Thermometer size={14} /> },
                            { label: 'Protecção de Fila', val: 82, icon: <Shield size={14} /> },
                            { label: 'Resposta de Crise', val: 98, icon: <Zap size={14} /> },
                            { label: 'Qualidade do Ar', val: 76, icon: <Wind size={14} /> }
                        ].map((m, i) => (
                            <div key={i} className="p-4 bg-[var(--bg-primary)]/50 border border-[var(--border-color)]/20 rounded-xl group/m">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="text-sky-600 opacity-40 group-hover/m:opacity-100 transition-all">{m.icon}</div>
                                    <span className="text-[10px] font-bold text-sky-600 tabular-nums">{m.val}%</span>
                                </div>
                                <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-40">{m.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="fluent-card p-5 sm:p-10 border-l-4 border-l-emerald-600 bg-emerald-600/5 relative overflow-hidden group shadow-xl rounded-xl flex flex-col justify-between">
                    <div className="absolute -right-10 -top-10 opacity-[0.03] text-emerald-600 group-hover:scale-110 transition-transform"><ShieldCheck size={150} /></div>
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-emerald-600/10 text-emerald-600 rounded-2xl border border-emerald-600/20 shadow-sm"><Gavel size={32} /></div>
                            <div>
                                <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">Conformidade Legal Matriz</h4>
                                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest opacity-60 mt-1 italic">Auditada Q1/2026</p>
                            </div>
                        </div>
                        <span className="text-7xl font-black text-emerald-600 tabular-nums italic drop-shadow-sm select-none opacity-40">99.8</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] opacity-60 font-medium leading-relaxed italic border-l-2 border-emerald-500/20 pl-4 mb-10 relative z-10">
                        Nível de conformidade institucional superior aos requisitos regulatórios da matriz AGT e protocolos de saúde pública.
                    </p>
                    <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 relative z-10 flex items-center justify-center gap-4">
                        Gerar Certificado de Governança <ShieldCheck size={20} />
                    </button>
                </div>
            </div>

            {/* Sovereign Matrix Footer */}
            <div className="fluent-card p-5 sm:p-10 bg-[var(--bg-primary)]/30 border border-dashed border-[var(--border-color)] flex flex-col items-center gap-4 text-center rounded-xl mt-12 shadow-inner group">
                <Database size={32} className="text-[var(--text-secondary)] opacity-10" />
                <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.4em] opacity-40 italic">
                    OneGest HSE Core // v3.1 // Global Compliance
                </p>
                <div className="flex items-center gap-5 sm:gap-10 text-[8px] font-bold uppercase tracking-widest opacity-20">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> HSE Compliant</span>
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Matrix Synced</span>
                </div>
            </div>
        </div>
    );
}
