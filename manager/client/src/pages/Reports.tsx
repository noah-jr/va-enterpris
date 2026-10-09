import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
    FileBarChart, TrendingUp, TrendingDown, Package,
    Briefcase, Truck, Filter, Download,
    ShieldCheck, Globe, Zap, Activity, ArrowUpRight,
    PieChart as PieChartIcon
} from 'lucide-react';
import api from '../api';
import { toast } from 'sonner';

const COLORS = ['var(--accent)', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const fmt = (v: number) => new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0
}).format(v);

export default function Reports() {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const { data: summary, isLoading: loadingSummary } = useQuery({
        queryKey: ['report-summary'],
        queryFn: async () => (await api.get('/reports/summary')).data
    });

    const { data: flow, isLoading: loadingFlow } = useQuery({
        queryKey: ['report-flow', dateRange],
        queryFn: async () => (await api.get('/reports/financial-flow', { params: dateRange })).data
    });

    const { data: dre, isLoading: loadingDre } = useQuery({
        queryKey: ['report-dre', dateRange],
        queryFn: async () => (await api.get('/reports/dre', { params: dateRange })).data
    });

    const financeData = summary?.finance?.map((f: any) => ({
        name: f.type === 'RECEIVABLE' ? 'Receitas' : 'Despesas',
        value: f._sum.amount
    })) || [];

    const kpis = [
        { label: 'Capital Humano', value: summary?.activeEmployees || 0, icon: <Briefcase size={16} />, color: 'var(--accent)', sub: 'Funcionários Ativos' },
        { label: 'Projetos', value: summary?.ongoingProjects || 0, icon: <FileBarChart size={16} />, color: '#10b981', sub: 'Em curso' },
        { label: 'Logística', value: summary?.totalVehicles || 0, icon: <Truck size={16} />, color: '#f59e0b', sub: 'Veículos Registados' },
        { label: 'Inventário', value: summary?.lowStockCount || 0, icon: <Package size={16} />, color: '#ef4444', sub: 'Stock Crítico' },
    ];

    const handleExport = () => {
        const headers = ['Categoria', 'Valor (AOA)'];
        const rows = [
            ['Proveitos Operacionais', dre?.revenue || 0],
            ['Custos de Operação', -(dre?.operationalCosts || 0)],
            ['Margem Bruta', dre?.grossMargin || 0],
            ['Custos Administrativos', -(dre?.otherExpenses || 0)],
            ['Recursos Humanos', -(dre?.payrollCosts || 0)],
            ['EBITDA', dre?.ebitda || 0],
            ['Provisões e Impostos', -(dre?.taxCosts || 0)],
            ['Resultado Líquido', dre?.netResult || 0],
        ];

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `RELATORIO_DRE_${new Date().getFullYear()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Relatório CSV gerado com sucesso.');
    };

    const handleReportClick = (name: string) => {
        toast.info(`A gerar relatório: ${name}`);
        
        // Simular a geração de um ficheiro de texto como "relatório"
        const content = `RELATÓRIO: ${name.toUpperCase()}\nDATA: ${new Date().toLocaleString()}\n\nEste é um documento gerado automaticamente pelo sistema VA ONEGEST.\n\n[DADOS DE PERFORMANCE]\nReceita Total: ${fmt(dre?.revenue || 0)}\nResultado Líquido: ${fmt(dre?.netResult || 0)}\n\n--- FIM DO DOCUMENTO ---`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${name.replace(/\s+/g, '_').toUpperCase()}.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Download concluído: ${name}`);
    };

    if (loadingSummary || loadingFlow || loadingDre) {
        return (
            <div className="flex items-center justify-center p-20 gap-3 text-[var(--text-secondary)]">
                <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm">A carregar relatórios...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-32 animate-fade-in">
            {/* Sovereign Reports Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 border-b border-[var(--border-color)] pb-10">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Relatórios e Performance</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Inteligência operacional e reporte executivo consolidado.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 gap-3">
                        <input 
                            type="date" 
                            className="bg-transparent text-[10px] font-bold outline-none text-[var(--text-primary)] uppercase"
                            value={dateRange.start}
                            onChange={e => setDateRange({...dateRange, start: e.target.value})}
                        />
                        <span className="text-[10px] font-bold opacity-20">/</span>
                        <input 
                            type="date" 
                            className="bg-transparent text-[10px] font-bold outline-none text-[var(--text-primary)] uppercase"
                            value={dateRange.end}
                            onChange={e => setDateRange({...dateRange, end: e.target.value})}
                        />
                    </div>
                    <button 
                        onClick={() => setDateRange({ start: '', end: '' })}
                        className="bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] px-6 py-3 rounded-lg text-[10px] font-black uppercase hover:bg-[var(--bg-secondary)] transition-all active:scale-95 shadow-sm"
                    >
                        Reset
                    </button>
                    <button 
                        onClick={handleExport}
                        className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-8 py-3 rounded-lg text-[10px] font-black uppercase hover:opacity-90 transition-all active:scale-95 shadow-lg"
                    >
                        Exportar Dados
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className="premium-card p-4 flex items-start gap-3">
                        <div className="kpi-icon shrink-0" style={{ backgroundColor: `${kpi.color}10`, color: kpi.color }}>
                            {kpi.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-[var(--text-muted)] mb-0.5 truncate">{kpi.label}</p>
                            <p className="text-base font-bold text-[var(--text-primary)] tabular-nums leading-tight">{kpi.value.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Analytics Hub */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="premium-card overflow-hidden group border-none bg-[var(--bg-secondary)] shadow-2xl">
                        <div className="p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-3 uppercase tracking-tight">
                                    <Activity size={24} className="text-[var(--accent)] animate-pulse" />
                                    Performance Executiva
                                </h2>
                                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mt-1 opacity-50">Análise de Tendência de Fluxo & Margem</p>
                            </div>
                        </div>
                        <div className="p-8 h-[380px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={flow}>
                                    <defs>
                                        <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="5 5" stroke="var(--border-color)" vertical={false} opacity={0.2} />
                                    <XAxis dataKey="date" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} tickFormatter={(val) => new Date(val).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }).toUpperCase()} />
                                    <YAxis fontSize={10} fontWeight="900" tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                                            backdropFilter: 'blur(20px)',
                                            borderRadius: '20px', 
                                            border: '1px solid var(--border-color)', 
                                            boxShadow: '0 20px 50px rgba(0,0,0,0.1)', 
                                            fontSize: '11px', 
                                            fontWeight: '900'
                                        }} 
                                    />
                                    <Area type="monotone" dataKey="inflow" stroke="var(--accent)" strokeWidth={4} fill="url(#colorInflow)" dot={{ r: 6, fill: 'var(--accent)', strokeWidth: 3, stroke: 'white' }} />
                                    <Area type="monotone" dataKey="outflow" stroke="#f43f5e" strokeWidth={4} fillOpacity={0} dot={{ r: 6, fill: '#f43f5e', strokeWidth: 3, stroke: 'white' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* DRE - Demonstração de Resultados (P&L) */}
                    <div className="premium-card p-10 bg-[var(--bg-secondary)] group">
                        <div className="flex items-center justify-between mb-10 pb-6 border-b border-[var(--border-color)]/30">
                            <div>
                                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.2em] mb-1">DRE Consolidada</h3>
                                <p className="text-[10px] font-bold text-[var(--accent)] opacity-60 uppercase tracking-widest leading-none">Demonstração do Resultado do Exercício</p>
                            </div>
                            <span className="text-[9px] font-black px-4 py-2 bg-[var(--bg-primary)] rounded-full border border-[var(--border-color)]">PERÍODO ATUAL</span>
                        </div>

                        <div className="space-y-1">
                            {[
                                { label: 'Proveitos Operacionais', val: dre?.revenue || 0, type: 'TOTAL', color: 'text-[var(--text-primary)]' },
                                { label: '(-) Custos de Operação', val: -(dre?.operationalCosts || 0), type: 'SUB', color: 'text-rose-500' },
                                { label: 'MARGEM BRUTA', val: dre?.grossMargin || 0, type: 'RESULT', color: 'text-emerald-600' },
                                { label: '(-) Custos Administrativos', val: -(dre?.otherExpenses || 0), type: 'SUB', color: 'text-rose-500' },
                                { label: '(-) Recursos Humanos', val: -(dre?.payrollCosts || 0), type: 'SUB', color: 'text-rose-500' },
                                { label: 'EBITDA', val: dre?.ebitda || 0, type: 'RESULT', color: 'text-indigo-600' },
                                { label: '(-) Provisões e Impostos', val: -(dre?.taxCosts || 0), type: 'SUB', color: 'text-rose-500' },
                                { label: 'RESULTADO LÍQUIDO', val: dre?.netResult || 0, type: 'FINAL', color: 'bg-[var(--accent)] text-white' },
                            ].map((row, i) => (
                                <div key={i} className={`flex items-center justify-between p-4 rounded-xl transition-all ${row.type === 'FINAL' ? `${row.color} mt-6 shadow-xl` : row.type === 'RESULT' ? 'bg-[var(--bg-primary)] mt-4 mb-2 border border-[var(--border-color)]/40' : 'hover:bg-[var(--bg-primary)]/40'}`}>
                                    <span className={`text-[11px] font-black uppercase tracking-widest ${row.type === 'FINAL' ? 'text-white' : 'text-[var(--text-secondary)]'}`}>{row.label}</span>
                                    <span className={`text-sm font-black tabular-nums ${row.type === 'FINAL' ? 'text-white' : row.color}`}>{fmt(row.val)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Lateral Distribution & Reports */}
                <div className="flex flex-col gap-8">
                    <div className="premium-card p-10 flex flex-col group border-none shadow-2xl bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)]">
                        <div className="mb-12">
                            <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.2em] mb-2 flex items-center gap-3">
                                <PieChartIcon size={18} className="text-emerald-500" />
                                Alocação de Ativos
                            </h2>
                            <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50 uppercase tracking-widest">Distribuição por Categoria</p>
                        </div>

                        <div className="flex-1 w-full flex items-center justify-center relative min-h-[250px] animate-fade-in">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={financeData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                                        {financeData.map((_: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: 'var(--shadow-xl)', fontSize: '10px', fontWeight: 'bold' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase opacity-40">Portfolio</span>
                                <span className="text-xl font-black tabular-nums tracking-tighter">{fmt(financeData.reduce((a: any, b: any) => a + b.value, 0))}</span>
                            </div>
                        </div>

                        <div className="mt-12 space-y-4">
                            {financeData.map((d: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-[var(--bg-primary)]/40 rounded-2xl border border-[var(--border-color)]/10 hover:border-[var(--accent)]/30 transition-all group/item shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider group-hover/item:text-[var(--text-primary)] transition-colors">{d.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-[var(--text-primary)] tabular-nums">{fmt(d.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="premium-card p-10 group bg-[var(--bg-secondary)]">
                        <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-[var(--text-primary)] mb-8 opacity-40 flex items-center gap-3">
                            <Download size={14} className="text-[var(--accent)]" />
                            Relatórios Analíticos
                        </h4>
                        <div className="space-y-4">
                            {[
                                { id: 'audit', label: 'Audit Log 2026', sub: 'Histórico de Transações', icon: <ShieldCheck size={16} /> },
                                { id: 'tax', label: 'Tax Report (AGT)', sub: 'Mapa de Impostos Retidos', icon: <FileBarChart size={16} /> },
                                { id: 'stock', label: 'Stock Valuation', sub: 'Inventário Consolidado', icon: <Package size={16} /> }
                            ].map((report, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => handleReportClick(report.label)}
                                    className="w-full p-5 bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-2xl flex items-center justify-between hover:bg-[var(--accent)] hover:text-white group/btn transition-all shadow-sm active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-[var(--bg-secondary)] rounded-xl text-[var(--accent)] group-hover/btn:bg-white/20 group-hover/btn:text-white transition-colors">{report.icon}</div>
                                        <div className="text-left">
                                            <p className="text-[11px] font-black uppercase tracking-tight">{report.label}</p>
                                            <p className="text-[9px] font-bold opacity-50 group-hover/btn:text-white/70">{report.sub}</p>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={16} className="opacity-0 group-hover/btn:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Detailed Reports Selection */}
            <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Relatório de Vendas', sub: 'Análise por período e cliente', icon: <TrendingUp size={20} />, color: 'text-indigo-600' },
                    { label: 'Artigos Vendidos', sub: 'Ranking de performance de stock', icon: <Package size={20} />, color: 'text-emerald-600' },
                    { label: 'IVA & Impostos', sub: 'Mapa de IVA Liquidado/Dedutível', icon: <Zap size={20} />, color: 'text-amber-600' },
                    { label: 'Caixa Diário', sub: 'Fecho e reconciliação de tesouraria', icon: <TrendingDown size={20} />, color: 'text-rose-600' },
                ].map((item, i) => (
                    <button 
                        key={i} 
                        onClick={() => handleReportClick(item.label)}
                        className="fluent-card p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)]/30 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-left flex items-start gap-4 active:scale-95 group"
                    >
                        <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-900 ${item.color} shadow-inner group-hover:bg-[var(--accent)] group-hover:text-white transition-colors`}>
                            {item.icon}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-[var(--text-primary)]">{item.label}</h4>
                            <p className="text-[10px] font-medium text-[var(--text-secondary)] opacity-60 mt-1">{item.sub}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Footer Notice */}
            <div className="fluent-card p-5 sm:p-10 bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-[var(--radius-lg)] mt-8 overflow-hidden relative group">

                <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-[0.02] group-hover:scale-125 transition-transform duration-1000 pointer-events-none">
                    <ShieldCheck size={160} />
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-10 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="kpi-icon bg-[var(--bg-primary)] shadow-xl border border-[var(--border-color)] flex items-center justify-center group-hover:rotate-3 transition-transform">
                            <ShieldCheck size={32} className="text-[var(--accent)]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest leading-none mb-2">Garantia de Integridade Financeira</h3>
                            <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest opacity-50">Métricas auditadas e em conformidade permanente com as normas do BNA e AGT.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 px-6 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-sm hover:shadow-md transition-all">
                            <Globe size={16} className="text-[var(--accent)]" />
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Sincronizado</span>
                        </div>
                        <div className="flex items-center gap-3 px-6 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-sm hover:shadow-md transition-all">
                            <Zap size={16} className="text-amber-500" />
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Real-time Hub</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
