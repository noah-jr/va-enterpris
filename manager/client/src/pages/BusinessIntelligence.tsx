import { useState } from 'react';
import { BarChart3, Download, Activity, ArrowUpRight, RefreshCw, Layers, Globe, PieChart, ShieldCheck, Zap, Target, Wallet, Binary, Fingerprint, Database, Layers as LayersIcon, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../api';

const fmt = (v: any) => {
    const n = Number(v) || 0;
    return new Intl.NumberFormat('pt-AO', { 
        style: 'currency', 
        currency: 'AOA', 
        maximumFractionDigits: 0 
    }).format(n);
};

export default function BusinessIntelligence() {
    const { data: kpiData, isLoading: loadingKPIs } = useQuery({
        queryKey: ['kpis'],
        queryFn: async () => (await api.get('/kpis')).data
    });

    const { data: finSummary, isLoading: loadingFin } = useQuery({
        queryKey: ['finance-summary'],
        queryFn: async () => (await api.get('/finance/summary')).data
    });

    const kpis = kpiData || [];
    const summary = finSummary || { totalPayable: 0, totalReceivable: 0, overdue: 0, netProfit: 0, totalAssets: 0 };

    const avgCompletion = kpis.length > 0
        ? (kpis.reduce((acc: number, k: any) => acc + (k.target > 0 ? k.current / k.target : 0), 0) / kpis.length) * 100
        : 84.2;

    const REVENUE_DATA = [
        { m: 'JAN', r: 40, p: 35 }, { m: 'FEV', r: 45, p: 42 }, { m: 'MAR', r: 60, p: 58 },
        { m: 'ABR', r: 55, p: 62 }, { m: 'MAI', r: 80, p: 75 }, { m: 'JUN', r: 70, p: 78 },
        { m: 'JUL', r: 90, p: 85 }, { m: 'AGO', r: 95, p: 90 }, { m: 'SET', r: 85, p: 92 },
        { m: 'OUT', r: 100, p: 98 }, { m: 'NOV', r: 110, p: 105 }, { m: 'DEZ', r: 125, p: 115 }
    ];

    const isLoading = loadingKPIs || loadingFin;

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-1000">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Business Intelligence</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Análise preditiva, indicadores globais e inteligência estratégica de negócio.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="premium-button-secondary !py-2.5">
                        <Download size={15} />
                        <span className="text-sm">Dossier</span>
                    </button>
                    <button className="premium-button-primary !py-2.5">
                        <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                        <span className="text-sm">{isLoading ? 'Sincronizando...' : 'Actualizar Matriz'}</span>
                    </button>
                </div>
            </div>

            {/* KPI Summary Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Exposição Comercial', value: fmt(summary.totalReceivable), trend: '+12.4%', icon: <Wallet size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Fluxo de Caixa (Livre)', value: fmt(summary.netProfit), trend: '+5.2%', icon: <Zap size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Execução de Objectivos', value: `${avgCompletion.toFixed(1)}%`, trend: '+4.2%', icon: <Activity size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                    { label: 'Rastreadores Activos', value: kpis.length.toString(), trend: 'Status OK', icon: <Fingerprint size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
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

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Main Visualization Cluster */}
                <div className="xl:col-span-3 space-y-6">
                    <div className="premium-card p-6 sm:p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-[var(--accent)] group-hover:scale-110 transition-transform pointer-events-none"><Database size={120} /></div>
                        
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 relative z-10 gap-6">
                            <div>
                                <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-3">
                                    <Activity size={20} className="text-[var(--accent)]" /> Performance de Receita Consolidada
                                </h2>
                                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-[0.2em] opacity-40 mt-1">Comparativo de Projecção Financeira vs Realizado (AOA)</p>
                            </div>
                            <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest border border-[var(--border-color)]/50 px-4 py-2 rounded-xl bg-[var(--bg-primary)]/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-[var(--accent)] rounded shadow-sm" />
                                    <span className="opacity-70">Real</span>
                                </div>
                                <div className="flex items-center gap-2 border-l border-[var(--border-color)]/20 pl-4">
                                    <div className="w-3 h-3 border border-dashed border-[var(--text-secondary)] rounded shadow-sm" />
                                    <span className="opacity-40">Projeção</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-80 relative z-10 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorBI" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.1} />
                                    <XAxis dataKey="m" tick={{ fontSize: 9, fill: 'var(--text-secondary)', fontWeight: 700 }} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis tick={{ fontSize: 9, fill: 'var(--text-secondary)', fontWeight: 700 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}M`} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', fontSize: '10px', boxShadow: 'var(--shadow-xl)' }}
                                        formatter={(v: any) => [fmt(v * 1000000), 'Volume']}
                                    />
                                    <Area type="monotone" dataKey="p" stroke="var(--text-secondary)" strokeOpacity={0.2} fill="none" strokeWidth={2} strokeDasharray="5 5" />
                                    <Area type="monotone" dataKey="r" stroke="var(--accent)" fill="url(#colorBI)" strokeWidth={3} animationDuration={2000} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="premium-card p-6 group">
                            <h3 className="text-[10px] font-bold text-[var(--text-primary)] mb-8 flex items-center gap-3 uppercase tracking-widest border-b border-[var(--border-color)]/10 pb-4 opacity-60">
                                <LayersIcon size={18} className="text-sky-500" /> Execução de Indicadores (KPI)
                            </h3>
                            <div className="space-y-8">
                                {kpis.length === 0 ? (
                                    <div className="py-10 text-center opacity-40 italic text-xs font-bold uppercase tracking-widest">Nenhum KPI activo no momento</div>
                                ) : kpis.slice(0, 4).map((k: any, i: number) => {
                                    const progress = k.target > 0 ? (k.current / k.target) * 100 : 0;
                                    return (
                                        <div key={i} className="group/progress">
                                            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest mb-3">
                                                <span className="text-[var(--text-secondary)] opacity-60 flex items-center gap-2 italic"><div className={`w-1.5 h-1.5 rounded-full ${progress >= 85 ? 'bg-emerald-500' : 'bg-amber-500'}`} /> {k.name}</span>
                                                <span className={`${progress >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>{progress.toFixed(1)}%</span>
                                            </div>
                                            <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden shadow-inner border border-[var(--border-color)]/10">
                                                <div className={`h-full transition-all duration-1000 ${progress >= 85 ? 'bg-emerald-500' : 'bg-amber-500'} opacity-70`} style={{ width: `${progress}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="premium-card p-6 border-l-4 border-l-indigo-600 bg-indigo-600/5 flex flex-col justify-between group overflow-hidden relative">
                            <div className="absolute -right-10 -bottom-10 opacity-[0.03] text-indigo-600 group-hover:scale-110 transition-transform"><Zap size={120} /></div>
                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-600/10 text-indigo-600 rounded-xl border border-indigo-600/20"><Binary size={24} /></div>
                                    <div>
                                        <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight italic">Análise Predetiva AI</h4>
                                        <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest opacity-60 mt-0.5">VA-Engine Insight</p>
                                    </div>
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic opacity-70 font-medium">
                                    "A correlação vectorial de performance aponta crescimento consolidado. Recomenda-se reforço estratégico nas unidades operacionais para optimização de EBITDA Q2."
                                </p>
                            </div>
                            <button className="mt-8 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:translate-x-2 transition-transform relative z-10 group-hover:text-indigo-500">
                                Ver Relatório Detalhado <ArrowUpRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Monitoring */}
                <div className="space-y-6">
                    <div className="premium-card p-6 group">
                        <h3 className="text-[10px] font-bold text-[var(--text-primary)] mb-8 flex items-center gap-3 uppercase tracking-widest opacity-60 italic border-b border-[var(--border-color)]/10 pb-4">
                            <Globe size={18} className="text-[var(--accent)]" /> Hub Estratégico
                        </h3>
                        <div className="space-y-4">
                            {[
                                { icon: <Activity size={16} />, label: 'EBITDA Consolidado', color: 'text-emerald-500', bg: 'bg-emerald-500/10', st: 'Estável' },
                                { icon: <ShieldCheck size={16} />, label: 'Exposição ao Risco', color: 'text-amber-500', bg: 'bg-amber-500/10', st: 'Nominal' },
                                { icon: <Target size={16} />, label: 'Execução Budget', color: 'text-indigo-500', bg: 'bg-indigo-500/10', st: '94%' },
                            ].map((dim, i) => (
                                <div key={i} className="p-4 bg-[var(--bg-primary)]/40 border border-[var(--border-color)]/20 rounded-xl hover:bg-[var(--bg-primary)] transition-all cursor-pointer shadow-sm border-l-2 border-l-transparent hover:border-l-[var(--accent)]">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg ${dim.bg} ${dim.color} flex items-center justify-center border border-current opacity-60`}>{dim.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold text-[var(--text-primary)] truncate uppercase leading-none mb-1">{dim.label}</p>
                                            <p className="text-[9px] font-bold text-emerald-600 uppercase opacity-60">{dim.st}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="premium-card p-6 border-l-4 border-l-emerald-600 bg-emerald-600/5 relative overflow-hidden group shadow-xl flex flex-col justify-between min-h-[320px]">
                        <div className="absolute -right-10 -bottom-10 opacity-[0.03] text-emerald-600 group-hover:scale-110 transition-transform"><PieChart size={120} /></div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest opacity-80 italic">ESG Compliance Score</h4>
                            <div className="p-2 bg-emerald-600/10 text-emerald-600 rounded-lg shadow-sm border border-emerald-500/20"><PieChart size={18} /></div>
                        </div>
                        <div className="flex flex-col items-center flex-1 justify-center">
                            <div className="text-7xl font-black text-emerald-600 tracking-tighter tabular-nums mb-4 drop-shadow-sm italic select-none">A<span className="opacity-40 text-3xl font-bold">+</span></div>
                            <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest opacity-40 text-center max-w-[150px]">Liderança Sustentável Hub</p>
                        </div>
                        <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 relative z-10 mt-6">
                            Auditoria ESG
                        </button>
                    </div>
                </div>
            </div>

            {/* Matrix Footer */}
            <div className="premium-card p-10 flex flex-col items-center gap-4 text-center border-dashed">
                <Database size={32} className="text-[var(--text-secondary)] opacity-10" />
                <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.4em] opacity-40 italic">
                    OneGest Analytics Matrix // v2.4 // Industrial Cluster
                </p>
                <div className="flex items-center gap-10 text-[8px] font-bold uppercase tracking-widest opacity-20">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sincronismo Fiscal</span>
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Matriz de Performance</span>
                </div>
            </div>
        </div>
    );
}
