import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Wallet, 
    Search, 
    Download, 
    Eye, 
    Printer, 
    ShieldCheck, 
    Zap, 
    Loader2, 
    DollarSign, 
    Activity, 
    Send,
    MoreHorizontal,
    LayoutGrid,
    List
} from 'lucide-react';
import api from '../api';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/format';
import { DataTable } from '../components/DataTable';

const fmt = (v: number) => formatCurrency(v);

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; accent: string }> = {
    PAID: { label: 'Liquidado', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', accent: 'bg-emerald-500' },
    PROCESSED: { label: 'Processado', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', accent: 'bg-amber-500' },
    PENDING: { label: 'Pendente', color: 'text-slate-700 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-500/10', border: 'border-slate-200 dark:border-slate-500/20', accent: 'bg-slate-500' },
};

export default function PayrollPage() {
    const qc = useQueryClient();
    const [search, setSearch] = useState('');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const { data: payrollData, isLoading } = useQuery({
        queryKey: ['payrolls', month, year],
        queryFn: async () => (await api.get(`/payrolls?month=${month}&year=${year}`)).data
    });

    const payrolls = payrollData || [];

    const processMutation = useMutation({
        mutationFn: (data: any) => api.post('/payrolls/process', data),
        onSuccess: () => {
            toast.success('Folha de processamento salarial consolidada com sucesso.');
            qc.invalidateQueries({ queryKey: ['payrolls'] });
        }
    });

    const payMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/payrolls/${id}/pay`, {}),
        onSuccess: () => {
            toast.success('Liquidação de vencimento processada.');
            qc.invalidateQueries({ queryKey: ['payrolls'] });
        }
    });

    const filtered = payrolls.filter((p: any) =>
        (p.employee?.name || '').toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        totalNet: payrolls.reduce((acc: number, p: any) => acc + (p.netSalary || 0), 0),
        paidCount: payrolls.filter((p: any) => p.status === 'PAID').length,
        avgSalary: payrolls.length > 0 ? payrolls.reduce((acc: number, p: any) => acc + (p.baseSalary || 0), 0) / payrolls.length : 0,
        compliance: payrolls.length > 0 ? Number(((payrolls.filter((p: any) => p.status === 'PAID').length / payrolls.length) * 100).toFixed(0)) : 100
    };

    const columns = [
        {
            header: 'Funcionário / Identidade',
            accessor: (p: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] flex items-center justify-center text-[var(--accent)] font-black text-xs">
                        {p.employee?.name?.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold leading-none mb-1 uppercase tracking-tight">{p.employee?.name}</p>
                        <p className="text-[9px] font-bold text-[var(--text-secondary)] opacity-40 uppercase tracking-tight">{p.employee?.position || 'Colaborador'}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Base Salarial',
            accessor: (p: any) => <span className="font-bold tabular-nums text-[11px]">{fmt(p.baseSalary)}</span>
        },
        {
            header: 'Deduções (IRT/SS)',
            accessor: (p: any) => <span className="font-bold tabular-nums text-[11px] text-rose-500">-{fmt(p.deductions)}</span>
        },
        {
            header: 'Salário Líquido',
            accessor: (p: any) => <span className="font-black tabular-nums text-[11px] text-[var(--accent)]">{fmt(p.netSalary)}</span>
        },
        {
            header: 'Estado',
            accessor: (p: any) => {
                const cfg = STATUS_CFG[p.status] || STATUS_CFG.PENDING;
                return (
                    <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        {cfg.label}
                    </span>
                );
            }
        },
        {
            header: '',
            accessor: (p: any) => (
                <div className="flex items-center justify-end gap-2">
                    {p.status !== 'PAID' && (
                        <button 
                            onClick={() => payMutation.mutate(p.id)}
                            className="bg-[var(--text-primary)] text-[var(--bg-primary)] p-2 rounded-lg hover:opacity-80 transition-all"
                        >
                            <Send size={14} />
                        </button>
                    )}
                    <button className="text-[var(--text-secondary)] opacity-20 hover:opacity-100 p-2">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 pb-8">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">
                        Processamento de Salários
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">
                        Consolidação de vencimentos e deduções fiscais
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1 rounded-[var(--radius-md)]">
                        <select 
                            value={month} 
                            onChange={e => setMonth(Number(e.target.value))}
                            className="bg-transparent text-[10px] font-bold uppercase outline-none px-2 py-1 cursor-pointer"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('pt-PT', { month: 'short' }).toUpperCase()}</option>
                            ))}
                        </select>
                        <select 
                            value={year} 
                            onChange={e => setYear(Number(e.target.value))}
                            className="bg-transparent text-[10px] font-bold uppercase outline-none px-2 py-1 cursor-pointer border-l border-[var(--border-color)]"
                        >
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <button 
                        onClick={() => processMutation.mutate({ month, year })}
                        disabled={processMutation.isPending}
                        className="premium-button-primary"
                    >
                        {processMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
                        <span>Consolidar mês</span>
                    </button>
                </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Exposição mensal', value: fmt(stats.totalNet), icon: <DollarSign size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Vencimentos pagos', value: `${stats.paidCount} / ${payrolls.length}`, icon: <Activity size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Média salarial', value: fmt(stats.avgSalary), icon: <Wallet size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                    { label: 'Conformidade fiscal', value: `${stats.compliance}%`, icon: <ShieldCheck size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' }
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

            {/* Workplace Controls */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative group flex-1 w-full max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input 
                        type="text"
                        placeholder="Pesquisar colaborador..."
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] py-2 pl-10 pr-4 rounded-lg text-sm font-medium outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button className="premium-button-secondary flex-1 sm:flex-none py-2">
                        <Printer size={14} />
                        <span>Imprimir</span>
                    </button>
                    <button className="premium-button-secondary flex-1 sm:flex-none py-2">
                        <Download size={14} />
                        <span>Exportar</span>
                    </button>
                </div>
            </div>

            {/* Table Area */}
            {isLoading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm">A carregar dados...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="premium-card py-24 flex flex-col items-center justify-center text-center opacity-60">
                    <Wallet size={32} className="mb-4 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">Nenhum registo para este período</p>
                </div>
            ) : (
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
                    <DataTable 
                        data={filtered}
                        columns={columns}
                        itemsPerPage={10}
                        showSearch={false}
                    />
                </div>
            )}

            {/* Sovereign Footer Ledger */}
            <div className="border border-dashed border-[var(--border-color)] p-10 flex flex-col items-center gap-4 text-center rounded-2xl opacity-40 mt-12">
                <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase leading-none">
                    OneGest Payroll System // Fiscal Audit v3.1
                </p>
                <div className="flex items-center gap-8 text-[8px] font-black uppercase">
                    <span>IRT Sincronizado</span>
                    <span>Segurança Social (3%)</span>
                    <span>Nó Bancário Ativo</span>
                </div>
            </div>
        </div>
    );
}
