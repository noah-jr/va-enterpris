import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Calculator, TrendingUp, TrendingDown, ArrowRightLeft, BookOpen, 
    Download, Search, Plus, LayoutGrid, PieChart, ShieldCheck, 
    Receipt, BadgeCheck, Zap, ShieldAlert, History, PlusCircle, 
    X, Wallet, Layers, Loader2, FileText, CheckCircle2,
    Calendar, Filter, FileSpreadsheet, Activity,
    ChevronDown, Printer, Share2, Trash2, Landmark, 
    ActivitySquare, Scale, Box, Target, FileSearch, Files,
    Eye, XCircle, Clock
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, AreaChart, Area, Cell, Pie
} from 'recharts';
import api from '../api';
import { usePermissions, useMe } from '../auth/useAuth';
import { toast } from 'sonner';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { SearchableSelect } from '../components/SearchableSelect';

import { formatCurrency } from '../utils/format';
const fmt = (v: number) => formatCurrency(v);

type TabType = 'DASHBOARD' | 'TRIAL_BALANCE' | 'BALANCE_SHEET' | 'INCOME_STATEMENT' | 'DIARY' | 'PLAN' | 'DOCUMENTS';

export default function Accounting() {
    const [tab, setTab] = useState<TabType>('DASHBOARD');
    const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Manual Entry State
    const [entryDescription, setEntryDescription] = useState('');
    const [entryLines, setEntryLines] = useState<any[]>([
        { accountId: '', debit: 0, credit: 0, description: '' },
        { accountId: '', debit: 0, credit: 0, description: '' }
    ]);

    const { hasPermission } = usePermissions();
    const { data: me } = useMe();
    const isModuleEnabled = me?.company?.enabledModules?.includes('accounting') || me?.company?.enabledModules?.includes('finance') || me?.role === 'SUPER_ADMIN';
    const queryClient = useQueryClient();

    // ── Queries ──────────────────────────────────────────────────────────────
    const { data: summary, isLoading: isLoadingSummary } = useQuery({
        queryKey: ['accounting-summary'],
        queryFn: () => api.get('/accounting-cases/summary').then(r => r.data)
    });

    const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
        queryKey: ['accounting-analytics', period],
        queryFn: () => api.get(`/accounting-cases/analytics?period=${period}`).then(r => r.data)
    });

    const { data: cases = [] } = useQuery({
        queryKey: ['acc-cases-admin'],
        queryFn: () => api.get('/accounting-cases').then(r => r.data),
        enabled: tab === 'DOCUMENTS'
    });

    const { data: trialBalance, isLoading: isLoadingTrial } = useQuery({
        queryKey: ['accounting-trial-balance', year, month],
        queryFn: () => api.get(`/accounting-cases/trial-balance?year=${year}${month ? `&month=${month}` : ''}`).then(r => r.data),
        enabled: tab === 'TRIAL_BALANCE'
    });

    const { data: balanceSheet, isLoading: isLoadingBalance } = useQuery({
        queryKey: ['accounting-balance-sheet', year],
        queryFn: () => api.get(`/accounting-cases/balance-sheet?year=${year}`).then(r => r.data),
        enabled: tab === 'BALANCE_SHEET'
    });

    const { data: incomeStatement, isLoading: isLoadingIncome } = useQuery({
        queryKey: ['accounting-income-statement', year],
        queryFn: () => api.get(`/accounting-cases/income-statement?year=${year}`).then(r => r.data),
        enabled: tab === 'INCOME_STATEMENT'
    });

    const { data: entriesData, isLoading: isLoadingEntries } = useQuery({
        queryKey: ['accounting-journal'],
        queryFn: () => api.get('/accounting-cases/journal').then(r => r.data)
    });

    const { data: chartOfAccounts } = useQuery({
        queryKey: ['accounting-chart'],
        queryFn: () => api.get('/accounting-cases/chart').then(r => r.data)
    });

    // ── Mutations ────────────────────────────────────────────────────────────
    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/accounting-cases/journal', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounting-summary'] });
            queryClient.invalidateQueries({ queryKey: ['accounting-journal'] });
            queryClient.invalidateQueries({ queryKey: ['accounting-analytics'] });
            toast.success('Lançamento registado com sucesso.');
            setIsModalOpen(false);
            setEntryLines([{ accountId: '', debit: 0, credit: 0, description: '' }, { accountId: '', debit: 0, credit: 0, description: '' }]);
            setEntryDescription('');
        },
        onError: (e: any) => {
            toast.error(e.response?.data?.error || 'Erro ao criar lançamento');
        }
    });

    const reviewDoc = useMutation({
        mutationFn: ({ id, ...d }: any) => api.patch(`/accounting-cases/documents/${id}/review`, d),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['acc-cases-admin'] }); toast.success('Documento revisto.'); }
    });

    const handleCreateEntry = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            description: entryDescription,
            lines: entryLines.filter(l => l.accountId && (l.debit > 0 || l.credit > 0))
        });
    };

    const handleExportSaft = async () => {
        try {
            const response = await api.get(`/saft/export?year=${year}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `SAFT_AO_${year}.xml`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Ficheiro SAF-T gerado com sucesso.');
        } catch (error) {
            toast.error('Erro ao gerar SAF-T.');
        }
    };

    // ── Render Helpers ───────────────────────────────────────────────────────
    
    const renderDashboard = () => (
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* Financial HUD - Dashboard Style */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Volume Faturado', value: fmt(summary?.totalRevenue || 0), icon: <TrendingUp size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Custos Totais', value: fmt(summary?.totalExpense || 0), icon: <TrendingDown size={15} />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                    { label: 'Resultado Exercício', value: fmt(summary?.netResult || 0), icon: <Calculator size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Auditoria Pendente', value: summary?.pendingReview || 0, icon: <FileSearch size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
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

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Evolution Chart */}
                <div className="xl:col-span-2 premium-card flex flex-col h-[400px]">
                    <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ActivitySquare size={15} className="text-[var(--accent)]" />
                            <h2 className="text-sm font-bold text-[var(--text-primary)]">Evolução de Competência</h2>
                        </div>
                        <div className="flex items-center gap-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-0.5">
                            {(['weekly', 'monthly', 'yearly'] as const).map(p => (
                                <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${period === p ? 'bg-[var(--bg-secondary)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
                                    {p === 'weekly' ? 'Sem' : p === 'monthly' ? 'Mês' : 'Ano'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics?.trends || []}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                <XAxis dataKey="period" fontSize={11} tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis fontSize={11} tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: 12 }} formatter={(v: any) => [fmt(Number(v) || 0), '']} />
                                <Area type="monotone" dataKey="revenue" name="Proveitos" stroke="var(--accent)" strokeWidth={2} fill="url(#colorRev)" />
                                <Area type="monotone" dataKey="expense" name="Custos" stroke="#ef4444" strokeWidth={2} fill="url(#colorExp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="flex flex-col gap-4">
                    <div className="premium-card p-5 space-y-4">
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">Estado dos Dossiers</h3>
                        <div className="space-y-3">
                            {(analytics?.statusCount || []).map((s: any, i: number) => {
                                const colors = ['bg-indigo-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500'];
                                return (
                                    <div key={i} className="space-y-1.5">
                                        <div className="flex justify-between text-[11px] font-bold text-[var(--text-muted)]">
                                            <span>{s.status}</span>
                                            <span>{s.count}</span>
                                        </div>
                                        <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                                            <div className={`h-full ${colors[i % colors.length]}`} style={{ width: `${(s.count / (analytics?.statusCount?.reduce((a:any,b:any)=>a+b.count,0) || 1)) * 100}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="premium-card p-5">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <Activity size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-[var(--text-muted)]">Taxa de Resolução</p>
                                <p className="text-lg font-bold text-[var(--text-primary)]">
                                    {(() => {
                                        const total = analytics?.statusCount?.reduce((a:any,b:any) => a + b.count, 0) || 0;
                                        if (total === 0) return '0%';
                                        const resolved = analytics?.statusCount?.filter((s:any) => ['CLOSED', 'REVIEWED'].includes(s.status)).reduce((a:any,b:any) => a + b.count, 0) || 0;
                                        return `${((resolved / total) * 100).toFixed(1)}%`;
                                    })()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDocuments = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Repositório de Documentos</h2>
                <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input 
                        placeholder="Pesquisar ficheiro..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-[var(--border-color)] pl-9 pr-4 py-2 rounded-lg text-sm outline-none focus:border-[var(--accent)]"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cases.flatMap((c: any) => c.documents || []).filter((d: any) => d.name.toLowerCase().includes(searchTerm.toLowerCase())).map((doc: any) => (
                    <div key={doc.id} className="premium-card p-4 flex items-center gap-4 hover:border-[var(--accent)] transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:border-[var(--accent)]/30 transition-all">
                            <FileText size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate text-[var(--text-primary)]">{doc.name}</p>
                            <p className="text-[10px] text-[var(--text-muted)] uppercase mt-0.5">{doc.type} · {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <span className={`badge text-[9px] ${doc.status === 'ACCEPTED' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : doc.status === 'REJECTED' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                {doc.status}
                             </span>
                             {doc.status === 'PENDING' && (
                                <div className="flex gap-1">
                                    <button onClick={() => reviewDoc.mutate({ id: doc.id, status: 'ACCEPTED' })} className="p-1 hover:text-emerald-600"><CheckCircle2 size={14} /></button>
                                    <button onClick={() => reviewDoc.mutate({ id: doc.id, status: 'REJECTED' })} className="p-1 hover:text-rose-600"><XCircle size={14} /></button>
                                </div>
                             )}
                        </div>
                    </div>
                ))}
            </div>
            
            {cases.every((c: any) => (c.documents || []).length === 0) && (
                <div className="py-20 text-center opacity-30">
                    <Files size={48} className="mx-auto mb-4" />
                    <p className="text-sm font-medium">Nenhum documento centralizado</p>
                </div>
            )}
        </div>
    );

    if (!isModuleEnabled) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center px-6">
                <ShieldAlert size={64} className="text-rose-500 mb-6 opacity-20" />
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Módulo Não Autorizado</h2>
                <p className="text-sm text-[var(--text-muted)] mt-2 max-w-md">O acesso à **Contabilidade Profissional** requer uma subscrição ativa.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Header - Dashboard Style */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Gestão Contabilística</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Audit & Compliance — Conformidade AGT v4.2</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleExportSaft} className="premium-button-secondary !py-2.5">
                        <Download size={15} />
                        <span className="text-sm">SAF-T AO</span>
                    </button>
                    {hasPermission('finance:write') && (
                        <button onClick={() => setIsModalOpen(true)} className="premium-button-primary !py-2.5">
                            <Plus size={15} />
                            <span className="text-sm">Novo lançamento</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Tabs - Dashboard Style */}
            <div className="flex items-center gap-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-1 overflow-x-auto no-scrollbar">
                {[
                    { id: 'DASHBOARD', label: 'Painel', icon: <PieChart size={14} /> },
                    { id: 'DOCUMENTS', label: 'Documentos', icon: <Files size={14} /> },
                    { id: 'TRIAL_BALANCE', label: 'Balancete', icon: <ActivitySquare size={14} /> },
                    { id: 'BALANCE_SHEET', label: 'Balanço', icon: <Layers size={14} /> },
                    { id: 'INCOME_STATEMENT', label: 'D.R.E', icon: <TrendingUp size={14} /> },
                    { id: 'DIARY', label: 'Diário', icon: <ArrowRightLeft size={14} /> },
                    { id: 'PLAN', label: 'Plano PGC', icon: <BookOpen size={14} /> }
                ].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id as any)} className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${tab === t.id ? 'bg-[var(--bg-secondary)] shadow-sm text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {isLoadingSummary || isLoadingAnalytics ? (
                    <div className="flex items-center justify-center py-20 gap-2 text-[var(--text-muted)]">
                        <Loader2 className="animate-spin" size={18} />
                        <span className="text-sm">A sincronizar dados...</span>
                    </div>
                ) : (
                    <>
                        {tab === 'DASHBOARD' && renderDashboard()}
                        {tab === 'DOCUMENTS' && renderDocuments()}
                        {tab === 'TRIAL_BALANCE' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-bold">Balancete de Verificação</h3>
                                    <div className="flex gap-2">
                                        <button className="premium-button-secondary !py-2 text-xs"><Printer size={14} /> Relatório</button>
                                        <button className="premium-button-secondary !py-2 text-xs"><FileSpreadsheet size={14} /> Exportar</button>
                                    </div>
                                </div>
                                <div className="premium-card overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
                                                    <th className="px-6 py-3 text-left font-bold text-[var(--text-secondary)] uppercase text-[10px] tracking-wider">Código</th>
                                                    <th className="px-6 py-3 text-left font-bold text-[var(--text-secondary)] uppercase text-[10px] tracking-wider">Designação</th>
                                                    <th className="px-6 py-3 text-right font-bold text-[var(--text-secondary)] uppercase text-[10px] tracking-wider">Débito</th>
                                                    <th className="px-6 py-3 text-right font-bold text-[var(--text-secondary)] uppercase text-[10px] tracking-wider">Crédito</th>
                                                    <th className="px-6 py-3 text-right font-bold text-[var(--text-secondary)] uppercase text-[10px] tracking-wider">Saldo Final</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--border-color)]">
                                                {(trialBalance?.rows || []).map((r: any) => (
                                                    <tr key={r.id} className="hover:bg-[var(--bg-primary)]/50 transition-colors">
                                                        <td className="px-6 py-3 font-mono text-[11px] text-[var(--accent)]">{r.code}</td>
                                                        <td className="px-6 py-3 font-medium text-[var(--text-primary)]">{r.name}</td>
                                                        <td className="px-6 py-3 text-right tabular-nums text-sky-600 font-bold">{fmt(r.debit)}</td>
                                                        <td className="px-6 py-3 text-right tabular-nums text-rose-600 font-bold">{fmt(r.credit)}</td>
                                                        <td className={`px-6 py-3 text-right tabular-nums font-bold ${r.endingBalance > 0 ? 'text-sky-600' : r.endingBalance < 0 ? 'text-rose-600' : ''}`}>{fmt(r.endingBalance)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Other tabs remain similar with standardized styling */}
                        {tab === 'BALANCE_SHEET' && (
                             <div className="space-y-6 animate-fade-in pb-10">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-bold">Balanço Geral Consolidado</h3>
                                    <button className="premium-button-primary !py-2 text-xs"><Printer size={14} /> PDF Oficial</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="premium-card p-6 space-y-4">
                                        <div className="flex justify-between items-center border-b pb-4">
                                            <span className="text-sm font-bold">Ativo Total</span>
                                            <span className="text-lg font-bold text-emerald-600">{fmt(balanceSheet?.ativo?.total || 0)}</span>
                                        </div>
                                        <div className="space-y-2 pt-2">
                                            <div className="flex justify-between text-xs"><span>Disponibilidades</span> <span>{fmt(balanceSheet?.ativo?.circulante?.caixa || 0)}</span></div>
                                            <div className="flex justify-between text-xs"><span>Clientes C.C.</span> <span>{fmt(balanceSheet?.ativo?.circulante?.clientesContaCorrente || 0)}</span></div>
                                        </div>
                                    </div>
                                    <div className="premium-card p-6 space-y-4">
                                        <div className="flex justify-between items-center border-b pb-4">
                                            <span className="text-sm font-bold">Passivo & Próprio</span>
                                            <span className="text-lg font-bold text-indigo-600">{fmt((balanceSheet?.passivo?.total || 0) + (balanceSheet?.capitalProprio?.total || 0))}</span>
                                        </div>
                                        <div className="space-y-2 pt-2">
                                            <div className="flex justify-between text-xs"><span>Fornecedores</span> <span>{fmt(balanceSheet?.passivo?.circulante?.fornecedores || 0)}</span></div>
                                            <div className="flex justify-between text-xs"><span>Resultado Exerc.</span> <span className="font-bold">{fmt(balanceSheet?.capitalProprio?.resultadoExercicio || 0)}</span></div>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        )}
                        {tab === 'DIARY' && (
                             <div className="space-y-6 animate-fade-in">
                                <h3 className="text-base font-bold">Livro Diário</h3>
                                <div className="premium-card overflow-hidden">
                                    <DataTable data={entriesData || []} columns={[
                                        { header: 'Cod.', accessor: (e: any) => <span className="font-mono text-[10px] text-[var(--accent)]">#{e.number}</span> },
                                        { header: 'Data', accessor: (e: any) => <span className="text-xs">{new Date(e.date).toLocaleDateString()}</span> },
                                        { header: 'Descrição', accessor: (e: any) => <span className="text-xs font-medium truncate max-w-[200px]">{e.description}</span> },
                                        { header: 'Débito', accessor: (e: any) => <span className="text-sky-600 font-bold tabular-nums text-xs">{fmt(e.totalDebit)}</span> },
                                        { header: 'Crédito', accessor: (e: any) => <span className="text-rose-600 font-bold tabular-nums text-xs">{fmt(e.totalCredit)}</span> },
                                    ]} isLoading={isLoadingEntries} />
                                </div>
                             </div>
                        )}
                        {tab === 'PLAN' && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-base font-bold">Plano Geral de Contas (PGC-AO)</h3>
                                <div className="premium-card overflow-hidden">
                                    <DataTable data={chartOfAccounts || []} columns={[
                                        { header: 'Conta', accessor: (c: any) => <span className="font-mono text-indigo-600 text-xs">{c.code}</span> },
                                        { header: 'Designação', accessor: (c: any) => <span className="text-xs font-medium">{c.name}</span> },
                                        { header: 'Natureza', accessor: (c: any) => (
                                            <span className={`badge text-[9px] ${c.nature === 'DEBIT' ? 'bg-sky-50 text-sky-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {c.nature === 'DEBIT' ? 'Devedora' : 'Credora'}
                                            </span>
                                        )},
                                    ]} />
                                </div>
                            </div>
                        )}
                        {tab === 'INCOME_STATEMENT' && (
                             <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-bold">Demonstração de Resultados</h3>
                                    <button className="premium-button-secondary !py-2 text-xs"><Printer size={14} /> Exportar P&L</button>
                                </div>
                                <div className="premium-card overflow-hidden border-l-4 border-l-indigo-600">
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y divide-[var(--border-color)]">
                                            <tr>
                                                <td className="px-6 py-6"><span className="font-bold text-indigo-600">Proveitos Operacionais</span></td>
                                                <td className="px-6 py-6 text-right font-bold text-lg text-indigo-700">{fmt(incomeStatement?.totals?.revenue || 0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-6"><span className="font-bold text-rose-600">Gastos Operacionais</span></td>
                                                <td className="px-6 py-6 text-right font-bold text-lg text-rose-600">({fmt(incomeStatement?.totals?.expense || 0)})</td>
                                            </tr>
                                            <tr className="bg-indigo-600 text-white">
                                                <td className="px-6 py-8"><span className="font-bold uppercase tracking-wider text-xs">Resultado Líquido</span></td>
                                                <td className="px-6 py-8 text-right font-bold text-2xl">{fmt(incomeStatement?.totals?.netResult || 0)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                             </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal: Manual Entry - Dashboard Style */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Escrituração" subtitle="Lançamento manual por partidas dobradas" width="3xl">
                <form onSubmit={handleCreateEntry} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto no-scrollbar">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Descrição do Lançamento</label>
                        <input value={entryDescription} onChange={e => setEntryDescription(e.target.value)} required placeholder="Ex: Pagamento de Rendas - Maio" className="premium-input !py-3 font-medium" />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold">Partidas</h3>
                            <button type="button" onClick={() => setEntryLines([...entryLines, { accountId: '', debit: 0, credit: 0, description: '' }])} className="text-xs font-bold text-[var(--accent)]">+ Adicionar linha</button>
                        </div>

                        <div className="space-y-3">
                            {entryLines.map((line, idx) => (
                                <div key={idx} className="flex gap-3 items-start p-4 bg-[var(--bg-primary)] border border-[var(--border-color)]/50 rounded-lg">
                                    <div className="flex-1 min-w-0">
                                        <SearchableSelect 
                                            options={chartOfAccounts?.map((a: any) => ({ label: `${a.code} - ${a.name}`, value: a.id })) || []}
                                            value={line.accountId}
                                            onChange={val => {
                                                const newLines = [...entryLines];
                                                newLines[idx].accountId = val;
                                                setEntryLines(newLines);
                                            }}
                                        />
                                    </div>
                                    <div className="w-28">
                                        <input type="number" step="0.01" placeholder="Débito" value={line.debit || ''} onChange={e => {
                                            const newLines = [...entryLines];
                                            newLines[idx].debit = Number(e.target.value);
                                            if (newLines[idx].debit > 0) newLines[idx].credit = 0;
                                            setEntryLines(newLines);
                                        }} className="premium-input !py-2 text-sm text-right tabular-nums text-sky-600 font-bold" />
                                    </div>
                                    <div className="w-28">
                                        <input type="number" step="0.01" placeholder="Crédito" value={line.credit || ''} onChange={e => {
                                            const newLines = [...entryLines];
                                            newLines[idx].credit = Number(e.target.value);
                                            if (newLines[idx].credit > 0) newLines[idx].debit = 0;
                                            setEntryLines(newLines);
                                        }} className="premium-input !py-2 text-sm text-right tabular-nums text-rose-600 font-bold" />
                                    </div>
                                    <button type="button" onClick={() => setEntryLines(entryLines.filter((_, i) => i !== idx))} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl">
                        <div className="flex gap-8">
                            <div><p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Total Débito</p><p className="text-lg font-bold text-sky-600 dark:text-sky-400">{fmt(entryLines.reduce((s, l) => s + (l.debit || 0), 0))}</p></div>
                            <div><p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Total Crédito</p><p className="text-lg font-bold text-rose-600 dark:text-rose-400">{fmt(entryLines.reduce((s, l) => s + (l.credit || 0), 0))}</p></div>
                        </div>
                        <div className={`text-right ${Math.abs(entryLines.reduce((s, l) => s + (l.debit || 0), 0) - entryLines.reduce((s, l) => s + (l.credit || 0), 0)) < 0.01 ? 'text-emerald-600' : 'text-rose-600'}`}>
                             <p className="text-[10px] font-bold uppercase">Estado</p>
                             <p className="font-bold">{Math.abs(entryLines.reduce((s, l) => s + (l.debit || 0), 0) - entryLines.reduce((s, l) => s + (l.credit || 0), 0)) < 0.01 ? 'EQUILIBRADO' : 'DESEQUILIBRADO'}</p>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="premium-button-secondary flex-1 py-3">Cancelar</button>
                        <button type="submit" disabled={createMutation.isPending || Math.abs(entryLines.reduce((s, l) => s + (l.debit || 0), 0) - entryLines.reduce((s, l) => s + (l.credit || 0), 0)) >= 0.01} className="premium-button-primary flex-1 py-3">
                            {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <BadgeCheck size={18} />} 
                            Registar lançamento
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
