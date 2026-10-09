import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Megaphone, Search, Filter, Download, MoreHorizontal, CheckCircle, Clock, X, DollarSign, Loader2, Eye, Trash2, ArrowUpRight, LayoutGrid, List, TrendingUp, Users, BarChart3, Globe, Activity, Sparkles, Send, Instagram, Facebook, Linkedin, BadgeCheck, MousePointer2, Fingerprint, Rocket, BarChart, ShieldCheck, Target as TargetIcon, Layers as LayersIcon } from 'lucide-react';
import api from '../api';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: any; shadow: string }> = {
    ACTIVE: {
        label: 'Em Circulação',
        color: 'text-emerald-700 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        border: 'border-emerald-200 dark:border-emerald-500/20',
        icon: <Activity size={14} className="animate-pulse" />,
        shadow: 'shadow-emerald-500/20'
    },
    PAUSED: {
        label: 'Sincronização Pausada',
        color: 'text-amber-700 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        border: 'border-amber-200 dark:border-amber-500/20',
        icon: <Clock size={14} />,
        shadow: 'shadow-amber-500/20'
    },
    COMPLETED: {
        label: 'Ciclo Concluído',
        color: 'text-slate-600 dark:text-slate-400',
        bg: 'bg-slate-50 dark:bg-slate-500/10',
        border: 'border-slate-200 dark:border-slate-500/20',
        icon: <CheckCircle size={14} />,
        shadow: 'shadow-slate-500/20'
    },
};

const fmt = (v: number) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(v);

export default function Marketing() {
    const [view, setView] = useState<'TABLE' | 'GRID'>('TABLE');
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(false);

    const { data: marketingData, isLoading } = useQuery({
        queryKey: ['marketing'],
        queryFn: async () => (await api.get('/marketing')).data
    });

    const campaigns = marketingData || [];

    const filtered = campaigns.filter((c: any) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.platform.toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total: campaigns.length,
        totalBudget: campaigns.reduce((acc: number, c: any) => acc + (c.budget || 0), 0),
        avgRoi: marketingData?.avgRoi || '0x',
        reach: marketingData?.reach || '0'
    };

    return (
        <>
            <div className="space-y-6 pb-20">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Marketing & Inteligência de Marca</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Matriz de distribuição multicanal e ROI preditivo de marca.</p>
                </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-[var(--bg-primary)] border border-[var(--border-color)]/50 p-1.5 rounded-2xl gap-1.5 shadow-inner backdrop-blur-sm">
                            <button onClick={() => setView('TABLE')} className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all whitespace-nowrap flex items-center gap-2 ${view === 'TABLE' ? 'bg-[var(--bg-secondary)] text-[var(--accent)] shadow-xl translate-y-[-1px] font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}>
                                <List size={14} /> Tabela
                            </button>
                            <button onClick={() => setView('GRID')} className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all whitespace-nowrap flex items-center gap-2 ${view === 'GRID' ? 'bg-[var(--bg-secondary)] text-[var(--accent)] shadow-xl translate-y-[-1px] font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}>
                                <LayoutGrid size={14} /> Grelha
                            </button>
                        </div>
                        <button
                            onClick={() => setModal(true)}
                            className="bg-[var(--accent)] hover:opacity-90 active:scale-95 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-[var(--accent)]/20 transition-all border border-[var(--accent)]/30 group"
                        >
                            <Rocket size={16} className="group-hover:translate-y-[-2px] group-hover:translate-x-[2px] transition-transform" /> Novo Vector
                        </button>
                    </div>
                </div>

                {/* SCM Telemetry Matrix */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { label: 'Alcance Global', value: stats.reach, trend: 'DIST', icon: <Users size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                        { label: 'Eficiência (ROI)', value: stats.avgRoi, trend: 'PERF', icon: <TrendingUp size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                        { label: 'Capex Publicitário', value: fmt(stats.totalBudget), trend: 'VALOR', icon: <DollarSign size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                        { label: 'Campanhas', value: stats.total, trend: 'NODES', icon: <TargetIcon size={15} />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
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

                {/* Filter Hub */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-[var(--radius-md)] flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Pesquisar campanha ou canal..."
                            className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm font-medium"
                        />
                    </div>
                </div>

                {/* Main Content Area */}
                {isLoading ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-6 text-[var(--text-secondary)] text-center opacity-40">
                        <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Sincronizando Nó de Marketing Intelligence...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="fluent-card py-40 flex flex-col items-center justify-center text-center text-[var(--text-secondary)] opacity-30 border-2 border-dashed border-[var(--border-color)] rounded-3xl m-4 px-5 sm:px-10 group">
                        <Sparkles size={48} className="mb-6 opacity-40 rotate-12" />
                        <p className="text-xs font-black uppercase tracking-[0.3em]">Nenhum vector de campanha detectado nestas coordenadas</p>
                    </div>
                ) : view === 'TABLE' ? (
                    <div className="fluent-card bg-[var(--bg-secondary)] rounded-3xl overflow-hidden shadow-2xl border-t-8 border-t-[var(--accent)]/40 min-h-[500px] group">
                        <div className="overflow-x-auto overflow-y-visible">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[var(--bg-primary)]/30 border-b border-[var(--border-color)]/30">
                                    <tr>
                                        {['Vector / Estratégia', 'Distribuição de Matriz', 'Taxa de Engagement', 'Alocação de Capex', 'Estado Operativo', 'Operacional'].map(h => (
                                            <th key={h} className="px-4 sm:px-8 py-6 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.25em]">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]/20">
                                    {filtered.map((c: any) => {
                                        const cfg = STATUS_CFG[c.status] || STATUS_CFG.PAUSED;
                                        return (
                                            <tr key={c.id} className="hover:bg-[var(--bg-primary)] transition-all group/row cursor-default">
                                                <td className="px-4 sm:px-8 py-8 border-l-4 border-l-transparent hover:border-l-[var(--accent)] transition-all min-w-[280px]">
                                                    <div className="flex items-center gap-5">
                                                        <div className={`w-12 h-12 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)] group-hover/row:scale-110 group-hover/row:rotate-6 transition-transform shadow-inner`}>
                                                            {c.platform === 'INSTAGRAM' ? <Instagram size={24} /> :
                                                                c.platform === 'FACEBOOK' ? <Facebook size={24} /> :
                                                                    c.platform === 'LINKEDIN' ? <Linkedin size={24} /> : <Globe size={24} />}
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight leading-none group-hover/row:text-[var(--accent)] transition-colors line-clamp-1">{c.title}</p>
                                                            <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-40 italic font-mono flex items-center gap-2"><Fingerprint size={10} /> {c.id.substring(0, 12).toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-8 py-8">
                                                    <div className="flex items-center gap-2.5">
                                                        <LayersIcon size={14} className="text-sky-500 opacity-60" />
                                                        <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">{c.platform || 'MULTICANAL'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-8 py-8">
                                                    <div className="flex flex-col gap-2 min-w-[140px]">
                                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                                                            <span>Engagement Score</span>
                                                            <span className="text-emerald-500 font-mono tracking-tighter">{c.engagement || 0}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden shadow-inner border border-[var(--border-color)]/20 p-0.5">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-1000 ${c.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-[var(--text-secondary)]/30'} group-hover/row:shadow-[0_0_12px_current] opacity-80 animate-pulse`}
                                                                style={{ width: `${c.engagement || 0}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-8 py-8">
                                                    <div className="flex flex-col">
                                                        <p className="text-sm font-black text-[var(--text-primary)] tabular-nums italic shadow-sm leading-none">{fmt(c.budget || 0)}</p>
                                                        <p className="text-[8px] font-black text-amber-600 uppercase tracking-tighter mt-1 opacity-60">Matriz Investida</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-8 py-8">
                                                    <span className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-[9px] font-black border w-fit ${cfg.color} ${cfg.bg} ${cfg.border} uppercase tracking-[0.2em] shadow-lg ${cfg.shadow}`}>
                                                        {cfg.icon}
                                                        {cfg.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 sm:px-8 py-8 text-right">
                                                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-all translate-x-4 group-hover/row:translate-x-0">
                                                        <button className="p-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all shadow-md active:scale-95 group/btn"><Eye size={18} className="group-hover/btn:scale-110" /></button>
                                                        <button className="p-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-sky-600 transition-all shadow-md active:scale-95 group/btn"><BarChart size={18} className="group-hover/btn:rotate-12" /></button>
                                                        <button className="p-3 bg-[var(--bg-secondary)] hover:bg-rose-500/10 border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-rose-500 transition-all shadow-md active:scale-95"><Trash2 size={18} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
                        {filtered.map((c: any) => {
                            const cfg = STATUS_CFG[c.status] || STATUS_CFG.PAUSED;
                            return (
                                <div key={c.id} className="fluent-card group p-5 sm:p-10 hover:shadow-2xl transition-all bg-[var(--bg-secondary)] border-b-8 border-b-transparent hover:border-b-[var(--accent)] rounded-[2.5rem] relative overflow-hidden shadow-xl shadow-black/5 min-h-[440px] flex flex-col justify-between">
                                    <div className="absolute top-0 right-0 p-5 sm:p-10 opacity-3 group-hover:opacity-10 transition-opacity rotate-12 group-hover:rotate-0 duration-700 pointer-events-none text-[var(--accent)]"><Sparkles size={100} /></div>

                                    <div className="flex items-center justify-between mb-8 relative z-10">
                                        <span className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl text-[9px] font-black border w-fit ${cfg.color} ${cfg.bg} ${cfg.border} uppercase tracking-[0.2em] shadow-lg ${cfg.shadow}`}>
                                            {cfg.icon}
                                            {cfg.label}
                                        </span>
                                        <div className="p-3 bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-2xl text-[var(--text-secondary)] opacity-40 group-hover:opacity-100 group-hover:text-[var(--accent)] transition-all cursor-pointer">
                                            <MoreHorizontal size={20} />
                                        </div>
                                    </div>

                                    <div className="mb-8 relative z-10">
                                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] mb-3 opacity-40 italic leading-none flex items-center gap-2"><Globe size={12} className="text-[var(--accent)]" /> {c.platform}</p>
                                        <h4 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight group-hover:text-[var(--accent)] transition-colors leading-tight shadow-sm line-clamp-2">{c.title}</h4>
                                    </div>

                                    <div className="space-y-6 mb-8 relative z-10 flex-1">
                                        <p className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.1em] opacity-60 leading-relaxed italic border-l-2 border-[var(--border-color)] pl-6">
                                            {c.description || 'Nenhuma descrição especificada para a estratégia.'}
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-y border-[var(--border-color)]/20 px-2 mt-6">
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-[0.2em] opacity-40 leading-none">Budget Hub</p>
                                                <p className="text-base font-black text-[var(--text-primary)] tabular-nums tracking-tighter italic shadow-sm">{fmt(c.budget)}</p>
                                            </div>
                                            <div className="space-y-1 text-right border-l border-[var(--border-color)]/30 pl-4">
                                                <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-[0.2em] opacity-40 leading-none">Matriz Score</p>
                                                <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter italic flex items-center justify-end gap-1"><TrendingUp size={12} /> {c.engagement || 0}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-4 relative z-10">
                                        <button className="flex-1 py-4 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl font-black text-[10px] uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-md active:scale-95">Telemetria</button>
                                        <button className="p-4 bg-[var(--accent)] hover:opacity-90 text-white rounded-2xl shadow-xl shadow-[var(--accent)]/30 group-hover:scale-110 active:scale-95 transition-all"><MousePointer2 size={18} /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Matrix Insights & Analytics Cluster */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mt-12">
                <div className="fluent-card p-6 sm:p-12 border-l-8 border-l-indigo-600 bg-indigo-600/[0.04] group hover:bg-indigo-600/[0.06] transition-all relative overflow-hidden shadow-2xl rounded-[3rem]">
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />

                    <div className="flex mb-10 relative z-10 items-start gap-4 sm:gap-8">
                        <div className="p-5 bg-indigo-600/10 text-indigo-600 rounded-[2rem] shadow-inner border border-indigo-600/20 group-hover:rotate-12 transition-transform duration-500"><BarChart3 size={40} /></div>
                        <div>
                            <h4 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight leading-none mb-2 shadow-sm">Dashboard de Ad-Intelligence</h4>
                            <p className="text-[11px] text-[var(--text-secondary)] font-black uppercase tracking-[0.3em] opacity-50">Análise de Fluxo e Atribuição VA-Matrix</p>
                        </div>
                    </div>

                    <div className="space-y-8 relative z-10 mb-10 cursor-default">
                        {[
                            { name: 'Ad-Efficiency (Matriz)', val: 78, label: 'Optimizado', color: 'bg-indigo-600' },
                            { name: 'Consolidação de Marca', val: 92, label: 'Superior', color: 'bg-emerald-500' },
                            { name: 'Alcance Orgânico Hub', val: 64, label: 'Sincronizado', color: 'bg-sky-500' }
                        ].map((insight, i) => (
                            <div key={i} className="group/item">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3 opacity-60 group-hover/item:opacity-100 transition-opacity">
                                    <span className="flex items-center gap-3"><div className={`w-2 h-2 rounded-full ${insight.color} shadow-lg shadow-indigo-500/20`} /> {insight.name}</span>
                                    <span className="text-indigo-600 font-mono italic">{insight.label}</span>
                                </div>
                                <div className="h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden shadow-inner p-0.5 border border-[var(--border-color)]/20">
                                    <div className={`h-full ${insight.color} rounded-full transition-all duration-1000 group-hover:shadow-[0_0_12px_current] opacity-80`} style={{ width: `${insight.val}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.5em] text-indigo-600 group-hover:translate-x-6 transition-transform relative z-10">
                        Analisar Reporte Estrutural Q1 <ArrowUpRight size={20} />
                    </button>
                </div>

                <div className="fluent-card p-6 sm:p-12 border-l-8 border-l-emerald-600 bg-emerald-600/[0.04] group relative overflow-hidden flex flex-col justify-between shadow-2xl rounded-[3rem]">
                    <div className="absolute right-0 bottom-0 p-6 sm:p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity rotate-12 group-hover:rotate-0 duration-1000"><BadgeCheck size={180} /></div>

                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="p-5 bg-emerald-600/10 text-emerald-600 rounded-[2rem] shadow-inner border border-emerald-600/20 group-hover:scale-110 transition-transform duration-500"><ShieldCheck size={40} /></div>
                            <div>
                                <h4 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-widest leading-tight shadow-sm opacity-80">Score de Brand<br />Sovereignty</h4>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-5xl sm:text-6xl font-black text-emerald-600 tabular-nums italic drop-shadow-2xl group-hover:scale-110 transition-transform">A+</span>
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.4em] mt-2 opacity-50">HUB_CERTIFIED</p>
                        </div>
                    </div>

                    <p className="text-[11px] text-[var(--text-secondary)] font-black uppercase tracking-[0.15em] leading-[2] border-l-4 border-emerald-600/30 pl-8 mb-12 relative z-10 italic opacity-70">
                        "A autoridade de marca angolana está em conformidade soberana com os protocolos de expansão regional da VA-Matrix. Posicionamento de liderança detectado em todos os canais sincronizados."
                    </p>

                    <button className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.5em] rounded-2xl transition-all shadow-2xl shadow-emerald-600/40 active:scale-95 relative z-10 flex items-center justify-center gap-4 border border-emerald-600/20">
                        Certificado de Identidade <Send size={18} />
                    </button>
                </div>
            </div>

            {/* Matrix Footer Note */}
            <div className="fluent-card p-6 sm:p-12 bg-[var(--bg-primary)]/30 border border-dashed border-[var(--border-color)] flex flex-col items-center gap-6 text-center shadow-inner group/sync">
                <Globe size={64} className="text-[var(--text-secondary)] opacity-10 rotate-12 group-hover/sync:rotate-0 transition-all duration-1000 shadow-sm" />
                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] leading-relaxed opacity-40 font-mono italic">
                    va-marketing-insights.node // encryption-protocol-v4.2 // node-cluster: GLOBAL_DISTRIBUTION
                </p>
                <div className="flex items-center gap-4 sm:gap-8 text-[8px] font-black uppercase tracking-[0.3em] opacity-30 mt-4">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" /> Real-time Feed</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-sky-500 shadow-lg shadow-sky-500/50" /> Multi-region Sync</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/50" /> VA Intelligence OK</span>
                </div>
            </div>

            {/* Modal Placeholder - Premium Overhaul */}
            {
                modal && (
                    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                        <div className="absolute inset-0 z-0 bg-[var(--text-primary)]/5 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setModal(false)} />
                        <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-color)] w-full max-w-2xl rounded-[3rem] p-4 sm:p-8 sm:p-12 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="absolute top-0 right-0 p-6 sm:p-12 opacity-5 pointer-events-none"><Rocket size={120} className="text-[var(--accent)]" /></div>

                            <div className="flex items-center justify-between mb-12 pb-6 border-b border-[var(--border-color)]/30 relative z-10">
                                <div>
                                    <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight leading-none shadow-sm flex items-center gap-4">
                                        <Fingerprint size={28} className="text-[var(--accent)]" /> Instanciação de Vector de Campanha
                                    </h2>
                                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-4 italic opacity-60">Provisionamento de Orçamento e Sincronização de Canais VA.</p>
                                </div>
                                <button onClick={() => setModal(false)} className="p-3 rounded-2xl hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-all cursor-pointer"><X size={20} /></button>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center py-24 opacity-20 relative z-10">
                                <div className="relative">
                                    <Binary size={90} className="text-[var(--accent)] animate-pulse" />
                                    <div className="absolute inset-0 bg-[var(--accent)]/30 blur-[4rem] rounded-full scale-150 animate-pulse" />
                                </div>
                                <p className="mt-14 text-[12px] font-black uppercase tracking-[0.6em] text-[var(--text-primary)] text-center max-w-sm leading-relaxed">
                                    Sincronizando Matriz de Audiência Global... Aguardando Lançamento de Vector.
                                </p>
                                <div className="flex gap-4 mt-10">
                                    <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce delay-0" />
                                    <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce delay-150" />
                                    <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce delay-300" />
                                </div>
                            </div>

                            <button onClick={() => setModal(false)} className="mt-auto py-6 bg-[var(--accent)] hover:opacity-90 text-white font-black uppercase tracking-[0.5em] rounded-2xl shadow-2xl shadow-[var(--accent)]/30 text-[11px] active:scale-95 transition-all relative z-10 border border-white/10">Abortar Sequência de Lançamento</button>
                        </div>
                    </div>
                )
            }
        </>
    );
}

const Binary = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="14" y="14" width="4" height="6" rx="2" />
        <rect x="6" y="4" width="4" height="6" rx="2" />
        <path d="M6 20h4" />
        <path d="M14 10h4" />
        <path d="M6 14v2a2 2 0 0 0 2 2h2" />
        <path d="M14 4v2a2 2 0 0 0 2 2h2" />
    </svg>
);
