import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    BadgeCheck, CheckCircle, Clock, Plus, Search, Filter,
    Download, MoreHorizontal, Eye, Trash2, BarChart3,
    ArrowUpRight, Shield, Loader2,
    LayoutGrid, List, FileCheck, ClipboardCheck,
    Binary, Activity, Layers, Star,
    Award, History, Globe,
    Database, Rocket, ShieldAlert,
    Fingerprint, Briefcase, TrendingUp, Zap, ChevronRight
} from 'lucide-react';
import api from '../api';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: any; accent: string }> = {
    PASSED: { label: 'Em Conformidade', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', icon: <CheckCircle size={14} />, accent: 'bg-emerald-500' },
    IN_REVIEW: { label: 'Sob Auditoria', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', icon: <Clock size={14} />, accent: 'bg-amber-500' },
    FAILED: { label: 'Não Conforme', color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20', icon: <ShieldAlert size={14} />, accent: 'bg-rose-500' },
};

export default function QualityStandards() {
    const [view, setView] = useState<'TABLE' | 'GRID'>('TABLE');
    const [search, setSearch] = useState('');

    const { data: qualityData, isLoading } = useQuery({
        queryKey: ['quality'],
        queryFn: async () => (await api.get('/quality')).data
    });

    const standards = qualityData || [];

    const filtered = standards.filter((s: any) =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total: standards.length,
        passed: standards.filter((s: any) => s.status === 'PASSED').length,
        inReview: standards.filter((s: any) => s.status === 'IN_REVIEW').length,
        qualityScore: 94.8
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">Padrões e Normas de Qualidade</h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium opacity-70">Certificações ISO, auditorias de processos e compliance institucional.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-[var(--bg-primary)] border border-[var(--border-color)]/50 p-1 rounded-lg gap-1 shadow-sm">
                        <button onClick={() => setView('TABLE')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${view === 'TABLE' ? 'bg-[var(--bg-secondary)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] opacity-60'}`}>
                            Ledger
                        </button>
                        <button onClick={() => setView('GRID')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${view === 'GRID' ? 'bg-[var(--bg-secondary)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] opacity-60'}`}>
                            Matriz
                        </button>
                    </div>
                    <button className="bg-[var(--accent)] hover:opacity-90 active:scale-95 text-white px-5 py-2.5 rounded-lg font-semibold text-xs flex items-center gap-2 shadow-md transition-all">
                        <Plus size={18} /> Nova Norma
                    </button>
                    <button className="p-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)]/50 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all shadow-sm"><Download size={18} /></button>
                </div>
            </div>

            {/* Matrix KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Matrizes Activas', value: stats.total, sub: 'Vectores de Auditoria', icon: <Layers size={18} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Conformidade OK', value: stats.passed, sub: 'Processos Validados', icon: <CheckCircle size={18} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Auditorias em Curso', value: stats.inReview, sub: 'Revisão VA-SEC Master', icon: <History size={18} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                    { label: 'Score de Excelência', value: `${stats.qualityScore}%`, sub: 'Quality Index VA-HQ', icon: <Award size={18} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                ].map((kpi, i) => (
                    <div key={i} className="fluent-card p-6 flex flex-col gap-4 group rounded-xl shadow-md border border-[var(--border-color)]/20">
                        <div className="flex items-center justify-between">
                            <div className={`w-10 h-10 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>{kpi.icon}</div>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text-secondary)] font-medium mb-1 opacity-60">{kpi.label}</p>
                            <p className="text-xl font-bold text-[var(--text-primary)] tabular-nums tracking-tighter leading-none">{kpi.value}</p>
                            <span className="text-[10px] font-semibold text-[var(--accent)] opacity-70 mt-2 block italic">{kpi.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Workplace Control */}
            <div className="fluent-card p-4 bg-[var(--bg-secondary)] flex flex-col md:flex-row items-center gap-4 border border-[var(--border-color)]/30 rounded-xl shadow-md group">
                <div className="relative group/search flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40 group-focus-within/search:text-[var(--accent)] transition-all" size={16} />
                    <input
                        placeholder="Rastrear n.º de norma ISO, designação ou protocolo..."
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
                        <Briefcase size={18} />
                    </button>
                </div>
            </div>

            {/* Matrix Data Streaming */}
            {isLoading ? (
                <div className="py-40 flex flex-col items-center justify-center gap-6 text-[var(--text-secondary)] text-center opacity-40">
                    <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
                    <span className="text-xs font-bold uppercase tracking-widest">Sincronizando Normas de Qualidade...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="fluent-card py-40 flex flex-col items-center justify-center text-center text-[var(--text-secondary)] opacity-30 border-2 border-dashed border-[var(--border-color)] rounded-xl px-5 sm:px-10 group">
                    <Star size={48} className="mb-6 opacity-40" />
                    <p className="text-xs font-bold uppercase tracking-widest">Nenhum protocolo registado nas coordenadas atuais</p>
                </div>
            ) : view === 'TABLE' ? (
                <div className="fluent-card bg-[var(--bg-secondary)] rounded-xl overflow-hidden shadow-xl border border-[var(--border-color)]/20 min-h-[500px] group">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[var(--bg-primary)]/50 border-b border-[var(--border-color)]/20">
                                <tr>
                                    {['Norma / Protocolo', 'Qualidade (Telemetry)', 'Ciclo de Auditoria', 'Estado Legal', ''].map(h => (
                                        <th key={h} className="px-6 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]/10">
                                {filtered.map((s: any) => {
                                    const cfg = STATUS_CFG[s.status] || STATUS_CFG.IN_REVIEW;
                                    return (
                                        <tr key={s.id} className="hover:bg-[var(--bg-primary)]/30 transition-all group/row cursor-pointer">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="kpi-icon bg-[var(--bg-primary)] border border-[var(--border-color)]/50 flex items-center justify-center text-[var(--accent)] shadow-sm group-hover/row:scale-110 transition-transform">
                                                        <FileCheck size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-[var(--text-primary)] group-hover/row:text-[var(--accent)] transition-colors">{s.title}</p>
                                                        <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-40 uppercase tracking-tighter">VA-SEC: {s.code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex flex-col gap-2 min-w-[140px]">
                                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                                                        <span>Auditoria Vector</span>
                                                        <span className="text-emerald-600">98.2%</span>
                                                    </div>
                                                    <div className="h-1 bg-[var(--bg-primary)] rounded-full overflow-hidden shadow-inner border border-[var(--border-color)]/10">
                                                        <div className="h-full bg-emerald-500 opacity-60 transition-all duration-1000" style={{ width: '98%' }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-sm font-bold text-[var(--text-primary)] tabular-nums">{format(new Date(s.date), 'dd MMM yyyy', { locale: pt })}</p>
                                                    <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase opacity-30 italic">VA-SYNC OK</p>
                                                </div>
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
                    {filtered.map((s: any) => {
                        const cfg = STATUS_CFG[s.status] || STATUS_CFG.IN_REVIEW;
                        return (
                            <div key={s.id} className="fluent-card group p-6 hover:shadow-2xl transition-all bg-[var(--bg-secondary)] border border-[var(--border-color)]/20 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-lg h-full">
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-[var(--accent)] transition-transform group-hover:scale-110 pointer-events-none"><FileCheck size={80} /></div>

                                <div>
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-[var(--border-color)]/30 bg-[var(--bg-primary)] text-[var(--accent)] shadow-sm group-hover:scale-110 transition-transform`}>
                                            <FileCheck size={24} />
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border border-dashed transition-all ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${cfg.accent} shadow-sm animate-pulse`} />
                                            {cfg.label}
                                        </span>
                                    </div>

                                    <div className="mb-6">
                                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-40 mb-1 leading-none">{s.code}</p>
                                        <h4 className="text-lg font-black text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-tight tracking-tighter line-clamp-2">{s.title}</h4>
                                    </div>

                                    <div className="p-4 bg-[var(--bg-primary)]/50 border border-[var(--border-color)]/20 rounded-xl mb-6 shadow-inner italic text-[10px] text-[var(--text-secondary)] opacity-60 leading-relaxed min-h-[80px]">
                                        {s.description || 'Vector de excelência operacional sob auditoria institucional sincronizada.'}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-[var(--border-color)]/10">
                                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                                        <span className="text-[var(--text-secondary)] flex items-center gap-2 opacity-50"><TrendingUp size={12} className="text-emerald-500" /> Auditoria Vector</span>
                                        <span className="text-emerald-600">98.2%</span>
                                    </div>
                                    <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden shadow-inner border border-[var(--border-color)]/10">
                                        <div className="h-full bg-emerald-500 opacity-60 transition-all duration-1000" style={{ width: '98%' }} />
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-[9px] font-bold text-[var(--text-secondary)] opacity-30 uppercase tracking-widest flex items-center gap-2"><History size={12} /> {format(new Date(s.date), 'dd/MM/yyyy')}</span>
                                        <button className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] hover:opacity-80 transition-all flex items-center gap-1 group/btn">
                                            Dossier <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Strategic Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
                <div className="fluent-card p-5 sm:p-10 border-l-4 border-l-indigo-600 bg-indigo-600/5 relative overflow-hidden group shadow-xl rounded-xl">
                    <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-[0.03] text-indigo-600 group-hover:scale-110 transition-transform"><Database size={120} /></div>
                    <div className="flex items-center gap-4 sm:gap-8 relative z-10 mb-10">
                        <div className="p-4 bg-indigo-600/10 text-indigo-600 rounded-2xl border border-indigo-600/20 shadow-sm"><BarChart3 size={32} /></div>
                        <div>
                            <h4 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-tight">Telemetria de Conformidade</h4>
                            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest opacity-60 mt-0.5">Análise Preditiva VA-SEC</p>
                        </div>
                    </div>
                    <div className="space-y-8 relative z-10 mb-12">
                        {[
                            { name: 'Aderência a Normas Matriz', val: 96, color: 'bg-indigo-600' },
                            { name: 'Consistência de Auditoria', val: 88, color: 'bg-indigo-500' },
                            { name: 'Indexador de Falhas GRC', val: 4, color: 'bg-indigo-400' }
                        ].map((insight, i) => (
                            <div key={i} className="group/line">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest mb-3 opacity-60 group-hover/line:opacity-100 transition-opacity italic">
                                    <span>{insight.name}</span>
                                    <span>{insight.val}%</span>
                                </div>
                                <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden shadow-inner border border-[var(--border-color)]/10">
                                    <div className={`h-full ${insight.color} opacity-70 transition-all duration-1000`} style={{ width: `${insight.val}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:translate-x-2 transition-transform relative z-10 group-hover:text-indigo-500">
                        Roadmap de Excelência <ArrowUpRight size={18} />
                    </button>
                </div>

                <div className="fluent-card p-5 sm:p-10 border-l-4 border-l-emerald-600 bg-emerald-600/5 relative overflow-hidden group shadow-xl rounded-xl flex flex-col justify-between">
                    <div className="absolute -right-10 -top-10 opacity-[0.03] text-emerald-600 group-hover:scale-110 transition-transform"><Award size={150} /></div>
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-emerald-600/10 text-emerald-600 rounded-2xl border border-emerald-600/20 shadow-sm"><Award size={32} /></div>
                            <div>
                                <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">Selo de Qualidade VA-A1</h4>
                                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest opacity-60 mt-1 italic">Certificado 9001:2026</p>
                            </div>
                        </div>
                        <span className="text-7xl font-black text-emerald-600 tabular-nums italic drop-shadow-sm select-none opacity-40">TOP</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] opacity-60 font-medium leading-relaxed italic border-l-2 border-emerald-500/20 pl-4 mb-10 relative z-10">
                        A conformidade de processos está alinhada 100% com as melhores práticas de governação institucional ISO-CERT. Auditoria externa concluída com zero falhas críticas identificadas.
                    </p>
                    <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 relative z-10 flex items-center justify-center gap-4">
                        Matriz de Excelência Sincronizada <BadgeCheck size={20} />
                    </button>
                </div>
            </div>

            {/* Sovereign Matrix Footer */}
            <div className="fluent-card p-5 sm:p-10 bg-[var(--bg-primary)]/30 border border-dashed border-[var(--border-color)] flex flex-col items-center gap-4 text-center rounded-xl mt-12 shadow-inner group">
                <Shield size={32} className="text-[var(--text-secondary)] opacity-10" />
                <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.4em] opacity-40 italic">
                    OneGest Quality Framework // v3.2 // HQ Compliance
                </p>
                <div className="flex items-center gap-5 sm:gap-10 text-[8px] font-bold uppercase tracking-widest opacity-20">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> GRC Compliant</span>
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Audit Synced</span>
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Matrix Certified</span>
                </div>
            </div>
        </div>
    );
}
