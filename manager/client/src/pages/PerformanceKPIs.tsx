import { useState } from 'react';
import { TrendingUp, TrendingDown, Target, Plus, X, CheckCircle2, AlertCircle, Clock, Award, Loader2, Radar as RadarIcon, Zap, ShieldCheck, Layers, Search, Building, User, FileText, Presentation, BarChart3, FileLineChart, PlusCircle } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

interface KPI {
    id: string;
    name: string;
    department: string;
    category: string;
    current: number;
    target: number;
    unit: string;
    trend: number;
    period: string;
    owner: string;
    status: 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'EXCEEDED';
    description: string;
}

const STATUS_STYLE: Record<KPI['status'], { label: string; color: string; bg: string; border: string; icon: any }> = {
    ON_TRACK: { label: 'Em Conformidade', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', icon: CheckCircle2 },
    AT_RISK: { label: 'Em Risco', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', icon: AlertCircle },
    BEHIND: { label: 'Crítico / Atraso', color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20', icon: TrendingDown },
    EXCEEDED: { label: 'Meta Superada', color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-200 dark:border-indigo-500/20', icon: Award },
};

const DEPTS = ['Todos os Sectores', 'Vendas Institucionais', 'Suporte Técnico', 'TI e Core', 'Capital Humano', 'Marketing Digital', 'Finanças e Tesouraria'];

const BAR_COLORS: Record<KPI['status'], string> = {
    ON_TRACK: '#10b981', AT_RISK: '#f59e0b', BEHIND: '#ef4444', EXCEEDED: '#6366f1'
};

export default function PerformanceKPIs() {
    const queryClient = useQueryClient();
    const [dept, setDept] = useState('Todos os Sectores');
    const [selected, setSelected] = useState<KPI | null>(null);
    const [modal, setModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'dept' | 'status' | 'pct'>('pct');
    const [form, setForm] = useState({ name: '', department: 'Vendas Institucionais', category: '', current: '', target: '', unit: '%', owner: '', period: 'Q1 2026', description: '' });

    const { data: kpisData = [], isLoading } = useQuery({
        queryKey: ['kpis'],
        queryFn: async () => (await api.get('/kpis')).data as KPI[]
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/kpis', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kpis'] });
            setModal(false);
            setForm({ name: '', department: 'Vendas Institucionais', category: '', current: '', target: '', unit: '%', owner: '', period: 'Q1 2026', description: '' });
            toast.success('Novo indicador de performance registado com sucesso.');
        }
    });

    const handleExport = () => {
        const headers = ['Nome', 'Sector', 'Categoria', 'Actual', 'Meta', 'Unidade', 'Realização (%)', 'Estado'];
        const rows = kpisData.map(k => [
            k.name,
            k.department,
            k.category,
            k.current,
            k.target,
            k.unit,
            pct(k),
            STATUS_STYLE[k.status].label
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `KPI_LEDGER_${new Date().getFullYear()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Ledger de KPIs exportado com sucesso.');
    };

    const handleUpdateMétrica = (kpi: KPI) => {
        const newVal = prompt(`Actualizar valor para "${kpi.name}" (Actual: ${kpi.current} ${kpi.unit}):`, kpi.current.toString());
        if (newVal !== null && !isNaN(Number(newVal))) {
            updateMutation.mutate({ id: kpi.id, current: Number(newVal) });
        }
    };

    const updateMutation = useMutation({
        mutationFn: ({ id, ...data }: any) => api.patch(`/kpis/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kpis'] });
            setSelected(null);
            toast.success('Métrica actualizada com sucesso.');
        }
    });

    const handleFullReport = (name: string) => {
        toast.info(`A gerar dossiê analítico: ${name}`);
        const content = `DOSSIÊ DE PERFORMANCE: ${name.toUpperCase()}\nDATA: ${new Date().toLocaleString()}\n\nEste documento contém a análise técnica detalhada do indicador ${name}.\nStatus Actual: ${STATUS_STYLE[selected?.status || 'ON_TRACK'].label}\nValor: ${selected?.current} / ${selected?.target}\n\n[RECOMENDAÇÕES ESTRATÉGICAS]\nManter a monitorização contínua e ajustar os recursos conforme o desvio da meta.`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `REPORT_${name.replace(/\s+/g, '_').toUpperCase()}.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Relatório gerado.');
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(form);
    };

    const pct = (k: KPI) => Math.round((k.current / k.target) * 100);

    const filtered = (dept === 'Todos os Sectores' ? kpisData : kpisData.filter(k => k.department === dept))
        .filter(k => k.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'dept') return a.department.localeCompare(b.department);
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        return (b.current / b.target) - (a.current / a.target);
    });

    const globalScore = kpisData.length > 0 ? Math.round(kpisData.reduce((s, k) => s + pct(k), 0) / kpisData.length) : 0;

    const barData = sorted.slice(0, 8).map(k => ({
        name: k.name.length > 20 ? k.name.substring(0, 18) + '...' : k.name.toUpperCase(),
        pct: pct(k),
        status: k.status
    }));

    const deptScores = DEPTS.filter(d => d !== 'Todos os Sectores').map(d => {
        const dKpis = kpisData.filter(k => k.department === d);
        const avg = dKpis.length > 0 ? Math.round(dKpis.reduce((s, k) => s + pct(k), 0) / dKpis.length) : 0;
        return { subject: d.split(' ')[0], A: avg, fullMark: 100 };
    });

    return (
        <div className="space-y-12 pb-32 animate-fade-in">
            {/* Sovereign Performance Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 pb-10 border-b border-[var(--border-color)]">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight uppercase leading-none">
                        Indicadores de Performance
                    </h1>
                    <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mt-3 opacity-40">Matriz de Monitorização Estratégica</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleExport}
                        className="bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] px-6 py-3 rounded-lg text-[10px] font-black uppercase hover:bg-[var(--bg-secondary)] transition-all active:scale-95 shadow-sm"
                    >
                        Exportar Ledger
                    </button>
                    <button
                        onClick={() => setModal(true)}
                        className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-8 py-3 rounded-lg text-[10px] font-black uppercase hover:opacity-90 transition-all active:scale-95 shadow-lg"
                    >
                        Novo Indicador
                    </button>
                </div>
            </div>

            {/* Global Score & Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Main Score Card */}
                <div className="lg:col-span-1 border border-[var(--border-color)] p-8 flex flex-col items-center justify-center text-center bg-[var(--bg-secondary)] rounded-2xl">
                    <div className="relative w-32 h-32 mb-6">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                            <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border-color)" strokeWidth="1.5" />
                            <circle cx="18" cy="18" r="16" fill="none" stroke="var(--text-primary)" strokeWidth="1.5" strokeDasharray={`${globalScore} 100`} strokeLinecap="square" className="transition-all duration-1000" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">{globalScore}%</span>
                        </div>
                    </div>
                    <h3 className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-50">Índice Global</h3>
                </div>

                {/* Status Distribution */}
                <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {(['EXCEEDED', 'ON_TRACK', 'AT_RISK', 'BEHIND'] as const).map((status) => {
                        const s = STATUS_STYLE[status];
                        const count = kpisData.filter(k => k.status === status).length;
                        return (
                            <div key={status} className="border border-[var(--border-color)] p-6 flex flex-col justify-between bg-[var(--bg-secondary)] rounded-2xl hover:bg-[var(--bg-primary)] transition-all">
                                <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-md border w-fit ${s.bg} ${s.color} ${s.border}`}>
                                    {s.label}
                                </span>
                                <p className="text-4xl font-bold text-[var(--text-primary)] leading-none mt-8 tabular-nums">{count.toString().padStart(2, '0')}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Radar Chart Area */}
                <div className="premium-card p-4 sm:p-8 bg-[var(--bg-secondary)] shadow-sm group">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] flex items-center gap-3">
                                <RadarIcon size={18} className="text-indigo-500" /> Dispersão Sectorial
                            </h2>
                            <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mt-1 opacity-60">Média de Performance por Sector (%)</p>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%" minHeight={1}>
                            <RadarChart data={deptScores}>
                                <PolarGrid stroke="var(--border-color)" strokeDasharray="3 3" />
                                <PolarAngleAxis dataKey="subject" stroke="var(--text-secondary)" fontSize={10} fontWeight="bold" />
                                <Radar name="Média" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} strokeWidth={3} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Alignment Bar Chart */}
                <div className="premium-card p-4 sm:p-8 bg-[var(--bg-secondary)] shadow-sm group">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6">
                        <div>
                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] flex items-center gap-3">
                                <Target size={18} className="text-rose-500" /> Matriz de Alinhamento
                            </h2>
                            <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mt-1 opacity-60">Realização de Objectivos Corporativos (%)</p>
                        </div>
                        <div className="flex bg-[var(--bg-primary)] p-1 rounded-lg border border-[var(--border-color)] overflow-x-auto no-scrollbar max-w-full">
                            {DEPTS.slice(0, 4).map(d => (
                                <button key={d} onClick={() => setDept(d)} className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${dept === d ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                                    {d.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%" minHeight={1}>
                            <BarChart data={barData} layout="vertical" barSize={12} margin={{ left: 40, right: 30 }}>
                                <XAxis type="number" domain={[0, 110]} hide />
                                <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} width={120} />
                                <Tooltip
                                    cursor={{ fill: 'var(--bg-primary)', opacity: 0.5 }}
                                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                                    {barData.map((entry, i) => <Cell key={i} fill={BAR_COLORS[entry.status as KPI['status']]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Main KPI Table */}
            <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] rounded-2xl overflow-hidden shadow-sm">
                <div className="flex flex-col xl:flex-row items-center justify-between px-8 py-8 border-b border-[var(--border-color)] gap-6">
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">Matriz de Performance Detalhada</h2>
                        <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.3em] mt-2 opacity-40">Controlo de Objectivos por Sector</p>
                    </div>

                    <div className="flex items-center gap-4 w-full xl:w-auto">
                        <div className="relative flex-1 xl:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-30" size={12} />
                            <input
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="PROCURAR..."
                                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] py-2.5 pl-9 pr-4 rounded-lg text-[10px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] transition-all uppercase tracking-widest"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--bg-primary)]/50">
                                <th className="px-4 sm:px-8 py-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Indicador / Sector</th>
                                <th className="px-4 sm:px-8 py-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Valor Actual</th>
                                <th className="px-4 sm:px-8 py-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Meta Objectivo</th>
                                <th className="px-4 sm:px-8 py-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Realização (%)</th>
                                <th className="px-4 sm:px-8 py-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Responsável</th>
                                <th className="px-4 sm:px-8 py-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest text-right">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]/30">
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-4 sm:px-8 py-20 text-center opacity-40 text-xs font-bold uppercase tracking-widest">Sincronizando Dados de Desempenho...</td></tr>
                            ) : sorted.length === 0 ? (
                                <tr><td colSpan={6} className="px-4 sm:px-8 py-20 text-center opacity-40 text-xs font-bold uppercase tracking-widest">Nenhum dado encontrado</td></tr>
                            ) : (
                                sorted.map(kpi => {
                                    const s = STATUS_STYLE[kpi.status];
                                    const Icon = s.icon;
                                    const p = pct(kpi);
                                    return (
                                        <tr key={kpi.id} onClick={() => setSelected(kpi)} className="hover:bg-[var(--bg-primary)]/30 transition-all cursor-pointer group">
                                            <td className="px-4 sm:px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-1 h-10 bg-[var(--border-color)] rounded-full group-hover:bg-[var(--accent)] transition-colors" />
                                                    <div>
                                                        <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight group-hover:text-[var(--accent)]">{kpi.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[8px] text-[var(--text-secondary)] font-black uppercase tracking-widest opacity-60">{kpi.department}</span>
                                                            <span className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
                                                            <span className="text-[8px] text-[var(--accent)] font-black uppercase tracking-widest opacity-40">{kpi.category}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-8 py-5">
                                                <span className="text-sm font-black text-[var(--text-primary)] tabular-nums">{kpi.current.toLocaleString()} <span className="text-[9px] opacity-40">{kpi.unit}</span></span>
                                            </td>
                                            <td className="px-4 sm:px-8 py-5">
                                                <div className="flex items-center gap-2 opacity-60">
                                                    <Target size={12} className="text-[var(--text-secondary)]" />
                                                    <span className="text-xs font-black tabular-nums">{kpi.target.toLocaleString()} {kpi.unit}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1 min-w-[120px] h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-color)]/30">
                                                        <div className={`h-full rounded-full transition-all duration-1000 ${p >= 100 ? 'bg-indigo-500' : p >= 85 ? 'bg-emerald-500' : p >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(p, 100)}%` }} />
                                                    </div>
                                                    <span className="text-xs font-black text-[var(--text-primary)] tabular-nums w-8 text-right">{p}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[10px] font-black text-[var(--text-secondary)] uppercase">{kpi.owner?.[0] || 'U'}</div>
                                                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase">{kpi.owner}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-8 py-5 text-right">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[8px] font-black uppercase ${s.bg} ${s.color} ${s.border}`}>
                                                    <Icon size={10} /> {s.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* KPI Detailed Side Panel */}
            {selected && (
                <div className="fixed inset-0 z-[3000] flex justify-end">
                    <div className="absolute inset-0 z-0 bg-[var(--text-primary)]/5 backdrop-blur-sm" onClick={() => setSelected(null)} />
                    <div className="relative z-10 w-full max-w-xl bg-[var(--bg-secondary)] h-full overflow-y-auto p-4 sm:p-8 shadow-2xl animate-in slide-in-from-right duration-500 border-l border-[var(--border-color)]">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="font-black text-[10px] uppercase tracking-widest text-[var(--accent)] mb-1 border-l-4 border-[var(--accent)] pl-4 leading-none">Dossier Detalhado do Indicador</h3>
                                <p className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight mt-3">Ficha Técnica de Performance</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-all cursor-pointer border border-transparent hover:border-[var(--border-color)]"><X size={24} /></button>
                        </div>

                        <div className="space-y-8">
                            <div className={`p-4 sm:p-8 rounded-2xl border ${STATUS_STYLE[selected.status].border} ${STATUS_STYLE[selected.status].bg} relative overflow-hidden group`}>
                                <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-5 scale-[2] rotate-12">
                                    {(() => {
                                        const Icon = STATUS_STYLE[selected.status].icon;
                                        return <Icon size={64} />;
                                    })()}
                                </div>

                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-sm ${STATUS_STYLE[selected.status].bg} ${STATUS_STYLE[selected.status].color} ${STATUS_STYLE[selected.status].border}`}>
                                        {STATUS_STYLE[selected.status].label}
                                    </span>
                                    <div className="text-right">
                                        <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1 opacity-40">Taxa de Realização</p>
                                        <p className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tabular-nums tracking-tighter">{pct(selected)}<span className="text-sm ml-0.5 opacity-30">%</span></p>
                                    </div>
                                </div>
                                <h2 className="font-black text-xl sm:text-2xl text-[var(--text-primary)] uppercase tracking-tight mb-8 border-b border-[var(--border-color)]/30 pb-6 leading-tight relative z-10">{selected.name}</h2>
                                <div className="flex justify-between items-end relative z-10">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40 mb-1">Valor Actual</p>
                                        <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tabular-nums tracking-tighter">{selected.current.toLocaleString()} <span className="text-xs font-bold opacity-30">{selected.unit}</span></p>
                                    </div>
                                    <div className={`flex flex-col items-end ${selected.trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        <div className="flex items-center gap-2">
                                            {selected.trend >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                                            <span className="text-xl sm:text-2xl font-black tabular-nums">{Math.abs(selected.trend)}%</span>
                                        </div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40 mt-1">Tendência Mensal</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'Sector de Jurisdição', value: selected.department, sub: 'Hub Operacional', icon: <Building size={16} className="text-[var(--accent)]" /> },
                                    { label: 'Categoria Estratégica', value: selected.category, sub: 'Classificação de Negócio', icon: <Layers size={16} className="text-sky-500" /> },
                                    { label: 'Responsável (Owner)', value: selected.owner, sub: 'Accountability Institucional', icon: <User size={16} className="text-indigo-500" /> },
                                    { label: 'Período de Auditoria', value: selected.period, sub: 'Horizonte Temporal', icon: <Clock size={16} className="text-amber-500" /> },
                                ].map((item, i) => (
                                    <div key={i} className="fluent-card p-5 border border-[var(--border-color)]/50 bg-[var(--bg-primary)]/30 rounded-xl flex flex-col gap-4 shadow-sm group">
                                        <p className="text-[9px] text-[var(--text-secondary)] uppercase font-black tracking-widest flex items-center gap-2 opacity-40">{item.icon} {item.label}</p>
                                        <div className="min-w-0">
                                            <p className="font-black text-xs uppercase truncate text-[var(--text-primary)]">{item.value || 'N/D'}</p>
                                            <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1 block opacity-30">{item.sub}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="fluent-card p-6 bg-[var(--bg-primary)]/50 border-dashed border-2 border-[var(--border-color)] rounded-2xl group">
                                <h4 className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <FileText size={14} className="text-indigo-500" /> Narrativa de Análise Corporativa
                                </h4>
                                <p className="text-[13px] leading-relaxed italic text-[var(--text-secondary)] opacity-80 border-l-4 border-[var(--accent)]/30 pl-6 py-2">
                                    "{selected.description || 'A análise estratética detalhada para este indicador ainda não foi submetida pelo responsável do sector. Os dados actuais sugerem uma progressão nominal em linha com as projecções do trimestre.'}"
                                </p>
                            </div>

                            <div className="pt-8 border-t border-[var(--border-color)] flex gap-4">
                                <button 
                                    onClick={() => handleFullReport(selected.name)}
                                    className="flex-1 py-4 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                                >
                                    <FileLineChart size={14} className="text-[var(--accent)]" /> Relatório Completo
                                </button>
                                <button
                                    onClick={() => handleUpdateMétrica(selected)}
                                    className="flex-1 py-4 bg-[var(--accent)] border border-[var(--accent)]/50 text-white rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-[var(--accent)]/10"
                                >
                                    <Zap size={14} /> Actualizar métrica
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI Creation Modal */}
            {modal && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 z-0 bg-[var(--text-primary)]/5 backdrop-blur-sm" onClick={() => setModal(false)} />
                    <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-color)] w-full max-w-2xl rounded-2xl p-4 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[95vh]">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight leading-none">Configurar Novo Indicador (KPI)</h2>
                                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-2 italic shadow-sm">Definição de Parâmetros e Metas Estratégicas</p>
                            </div>
                            <button onClick={() => setModal(false)} className="p-2 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-all cursor-pointer"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-6 overflow-y-auto pr-2 no-scrollbar">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">Designação do KPI</label>
                                <input
                                    required
                                    placeholder="EX: TAXA DE RETENÇÃO DE CLIENTES..."
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded-xl text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all text-[15px] font-black uppercase tracking-tight shadow-inner"
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value.toUpperCase() }))}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">Sector Responsável</label>
                                    <select
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 rounded-xl text-[10px] font-black uppercase text-[var(--text-primary)] outline-none cursor-pointer"
                                        value={form.department}
                                        onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                                    >
                                        {DEPTS.filter(d => d !== 'Todos os Sectores').map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">Classificação Estratégica</label>
                                    <input placeholder="EX: FINANCEIRO / OPERAÇÕES" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 rounded-xl text-[10px] font-black uppercase text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)]" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">Valor Actual</label>
                                    <input required type="number" step="any" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 rounded-xl text-sm font-black text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)] shadow-sm tabular-nums" value={form.current} onChange={e => setForm(p => ({ ...p, current: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">Meta Objectivo</label>
                                    <input required type="number" step="any" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 rounded-xl text-sm font-black text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)] shadow-sm tabular-nums" value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">Unidade</label>
                                    <input placeholder="%, AOA, HORA..." className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 rounded-xl text-[10px] font-black uppercase text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)]" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value.toUpperCase() }))} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">Responsável Institucional</label>
                                    <input placeholder="NOME DO OWNER" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 rounded-xl text-[10px] font-black uppercase text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)]" value={form.owner} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">Horizonte Temporal</label>
                                    <input placeholder="EX: Q1 2026" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 rounded-xl text-[10px] font-black uppercase text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)]" value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">Metodologia e Contexto de Análise</label>
                                <textarea
                                    rows={3}
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded-xl text-xs font-medium text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none italic shadow-inner leading-relaxed"
                                    placeholder="Descreva a lógica de cálculo e factores de influência..."
                                    value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                />
                            </div>

                            <div className="pt-6 flex gap-3">
                                <button type="button" onClick={() => setModal(false)} className="flex-1 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border border-[var(--border-color)] shadow-sm">Descartar Protocolo</button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="flex-[2] bg-[var(--accent)] hover:opacity-95 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[var(--accent)]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} Instanciar Indicador
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
