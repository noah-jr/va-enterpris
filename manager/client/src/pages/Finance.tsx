import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    ArrowUpRight, 
    ArrowDownRight, 
    Download, 
    Receipt, 
    Plus, 
    Landmark, 
    ShieldAlert, 
    Layers, 
    Loader2, 
    Trash2, 
    Calendar, 
    BadgeCheck, 
    PlusCircle,
    ShieldCheck,
    TrendingUp,
    DollarSign,
    Wallet,
    FileText
} from 'lucide-react';
import api from '../api';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { SearchableSelect } from '../components/SearchableSelect';

import { formatCurrency } from '../utils/format';

const fmt = (v: number) => formatCurrency(v);

export default function Finance() {
    const qc = useQueryClient();
    const [tab, setTab] = useState<'ALL' | 'PAYABLE' | 'RECEIVABLE'>('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    
    // Controlo Avançado
    const [viewMode, setViewMode] = useState<'OPERATIONAL' | 'STRATEGIC'>('OPERATIONAL');
    
    const [form, setForm] = useState({ 
        description: '', 
        type: 'PAYABLE', 
        amount: '', 
        dueDate: '', 
        category: 'Despesa Operacional', // Rubrica
        costCenter: 'Administração Controladoria', // Centro de Custo
        paymentMethod: 'Transferência Bancária',
        bankAccount: 'Conta Corrente BFA',
        notes: '',
        isRecurring: false
    });

    const itemsPerPage = 7;

    const { data: summaryData } = useQuery({
        queryKey: ['finance-summary'],
        queryFn: async () => (await api.get('/finance/summary')).data
    });

    const { data: bankAccounts = [] } = useQuery({
        queryKey: ['finance-bank-accounts'],
        queryFn: async () => (await api.get('/finance/bank-accounts')).data
    });

    const { data: entriesData = [], isLoading: loadingEntries } = useQuery({
        queryKey: ['finance', tab],
        queryFn: async () => (await api.get(`/finance${tab !== 'ALL' ? `?type=${tab}` : ''}`)).data
    });

    const summary = summaryData || { totalPayable: 0, totalReceivable: 0, overdue: 0 };
    const entries = (entriesData as any[]) || [];

    const filteredEntries = entries.filter((e: any) =>
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedData = filteredEntries.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);

    const chartData = entries.slice(-10).map((e: any) => ({ 
        name: format(new Date(e.dueDate), 'dd MMM', { locale: pt }), 
        valor: e.amount 
    }));

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/finance', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['finance'] });
            qc.invalidateQueries({ queryKey: ['finance-summary'] });
            toast.success('Lançamento financeiro registado com sucesso.');
            setIsModalOpen(false);
            setForm({ 
                description: '', 
                type: 'PAYABLE', 
                amount: '', 
                dueDate: '', 
                category: 'Despesa Operacional', 
                costCenter: 'Administração Controladoria',
                paymentMethod: 'Transferência Bancária',
                bankAccount: 'Conta Corrente BFA',
                notes: '',
                isRecurring: false
            });
        }
    });

    const payMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/finance/${id}/pay`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['finance'] });
            qc.invalidateQueries({ queryKey: ['finance-summary'] });
            toast.success('Liquidação financeira processada.');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/finance/${id}`),
        onSuccess: () => { 
            qc.invalidateQueries({ queryKey: ['finance'] }); 
            qc.invalidateQueries({ queryKey: ['finance-summary'] }); 
            toast.info('Registo removido do histórico.'); 
        }
    });

    const columns = [
        {
            header: 'Registo / Descrição',
            accessor: (e: any) => (
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm border ${e.type === 'PAYABLE' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                        <Receipt size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-bold leading-none mb-1 line-clamp-1">{e.description}</p>
                        <p className="text-xs font-bold text-[var(--text-secondary)] opacity-40 font-mono">ID: {e.id.slice(-8)}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Categoria',
            accessor: (e: any) => (
                <span className="px-2 py-1 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)]">
                    {e.category || 'Geral'}
                </span>
            )
        },
        {
            header: 'Vencimento',
            accessor: (e: any) => (
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                    <Calendar size={14} className="opacity-30" />
                    {format(new Date(e.dueDate), 'dd/MM/yyyy')}
                </div>
            )
        },
        {
            header: 'Valor',
            accessor: (e: any) => (
                <span className={`text-sm font-black tabular-nums ${e.type === 'RECEIVABLE' ? 'text-emerald-600' : 'text-[var(--text-primary)]'}`}>
                    {e.type === 'PAYABLE' ? '-' : '+'}{fmt(e.amount)}
                </span>
            )
        },
        {
            header: 'Estado',
            accessor: (e: any) => {
                const isPaid = e.status === 'PAID';
                return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black border shadow-sm ${isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                        {isPaid ? <ShieldCheck size={12} /> : <TrendingUp size={12} />}
                        {isPaid ? 'Liquidado' : 'Pendente'}
                    </span>
                );
            }
        },
        {
            header: '',
            accessor: (e: any) => (
                <div className="flex items-center justify-end gap-2">
                    {e.status !== 'PAID' && (
                        <button onClick={(ev) => { ev.stopPropagation(); payMutation.mutate(e.id); }} className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-200">
                            <BadgeCheck size={14} />
                        </button>
                    )}
                    <button onClick={(ev) => { ev.stopPropagation(); if (confirm('Remover transação?')) deleteMutation.mutate(e.id); }} className="p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-200">
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
            className: "text-right"
        }
    ];

    return (
        <div className="space-y-6 pb-8">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Gestão Financeira</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Controlo estratégico de balanço, liquidez e obrigações institucionais.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="premium-button-secondary py-2">
                        <Download size={14} />
                        <span>Exportar</span>
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="premium-button-primary">
                        <Plus size={15} />
                        <span>Novo lançamento</span>
                    </button>
                </div>
            </div>

            {/* Financial HUD */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Saldo Disponível', value: fmt(summary.totalReceivable - summary.totalPayable), icon: <Wallet size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Contas a Pagar', value: fmt(summary.totalPayable), icon: <ArrowDownRight size={15} />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                    { label: 'Contas a Receber', value: fmt(summary.totalReceivable), icon: <ArrowUpRight size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Exposição Risco', value: fmt(summary.overdue * 125000), icon: <ShieldAlert size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
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

            {/* Charts row — Dashboard style */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Area chart — 2/3 */}
                <div className="lg:col-span-2 premium-card flex flex-col" style={{ height: 300 }}>
                    <div className="flex items-center justify-between p-4 pb-0">
                        <div>
                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Fluxo financeiro</p>
                            <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">Últimos lançamentos registados</p>
                        </div>
                        <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1 rounded-[var(--radius-md)]">
                            <button onClick={() => setViewMode('OPERATIONAL')} className={`px-3 py-1 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase transition-all ${viewMode === 'OPERATIONAL' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>Operacional</button>
                            <button onClick={() => setViewMode('STRATEGIC')} className={`px-3 py-1 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase transition-all ${viewMode === 'STRATEGIC' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>Estratégico</button>
                        </div>
                    </div>
                    <div className="flex-1 p-4 pt-2 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="fin" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.4} />
                                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-muted)' }} dy={6} />
                                <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} tick={{ fill: 'var(--text-muted)' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-color)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}
                                    itemStyle={{ color: 'var(--accent)' }}
                                />
                                <Area type="monotone" dataKey="valor" stroke="var(--accent)" strokeWidth={2.5} fill="url(#fin)" dot={{ r: 3, fill: 'var(--accent)', strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sidebar — 1/3 */}
                <div className="flex flex-col gap-4">
                    {/* Bank accounts */}
                    <div className="premium-card p-4 flex-1">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Contas Bancárias</p>
                            <Landmark size={14} className="text-[var(--text-muted)] opacity-50" />
                        </div>
                        <div className="space-y-2">
                            {bankAccounts.length > 0 ? bankAccounts.map((acc: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-2.5 bg-[var(--bg-secondary)] rounded-[var(--radius-sm)] border border-[var(--border-color)]/50">
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-[var(--text-primary)] truncate">{acc.bank}</p>
                                        <p className="text-[10px] text-[var(--text-muted)] font-mono truncate">{acc.iban}</p>
                                    </div>
                                    <span className="text-xs font-bold text-[var(--text-primary)] tabular-nums ml-2 shrink-0">{fmt(acc.balance)}</span>
                                </div>
                            )) : (
                                <p className="text-xs text-[var(--text-muted)] text-center py-4 opacity-50">Nenhuma conta indexada</p>
                            )}
                        </div>
                    </div>

                    {/* Cost center breakdown */}
                    <div className="premium-card p-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Centros de Custo</p>
                            <Layers size={14} className="text-[var(--text-muted)] opacity-50" />
                        </div>
                        <div className="space-y-3">
                            {[
                                { name: 'Operações', val: 65, color: 'bg-indigo-500' },
                                { name: 'Capital Humano', val: 20, color: 'bg-sky-500' },
                                { name: 'Infraestrutura', val: 15, color: 'bg-emerald-500' }
                            ].map((d, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-[10px] font-bold text-[var(--text-muted)] mb-1">
                                        <span>{d.name}</span>
                                        <span>{d.val}%</span>
                                    </div>
                                    <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]/20">
                                        <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.val}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Entry Table */}
            <div className="space-y-3">
                <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1 rounded-[var(--radius-md)] w-fit">
                    {(['ALL', 'PAYABLE', 'RECEIVABLE'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase flex items-center gap-2 transition-all ${tab === t ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                        >
                            {t === 'ALL' ? 'Todos' : t === 'PAYABLE' ? 'A Pagar' : 'A Receber'}
                        </button>
                    ))}
                </div>

                <DataTable
                    data={paginatedData}
                    columns={columns}
                    isLoading={loadingEntries}
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={filteredEntries.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setPage}
                    onSearchChange={setSearchTerm}
                    searchValue={searchTerm}
                    searchPlaceholder="Pesquisar por descrição ou rubrica..."
                />
            </div>

            {/* Modal de Lançamento em Tesouraria */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Lançamento Tesouraria"
                subtitle="Fluxo financeiro v4.0"
                type="CENTER"
                width="xl"
                icon={<PlusCircle size={24} className="text-[var(--accent)]" />}
            >
                <form onSubmit={e => { e.preventDefault(); createMutation.mutate(form); }} className="p-4 sm:p-8 space-y-8 min-h-[500px] overflow-y-auto no-scrollbar pb-10">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase px-1">Descrição Técnico-Financeira</label>
                        <input 
                            required 
                            placeholder="EX: LIQUIDAÇÃO DE HONORÁRIOS JURÍDICOS..." 
                            className="premium-input !py-4 font-black uppercase placeholder:italic" 
                            value={form.description} 
                            onChange={e => setForm(p => ({ ...p, description: e.target.value.toUpperCase() }))} 
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase px-1">Natureza da Operação</label>
                                <SearchableSelect 
                                    options={[
                                        { label: 'Contas a Pagar (Saída -)', value: 'PAYABLE' },
                                        { label: 'Contas a Receber (Entrada +)', value: 'RECEIVABLE' }
                                    ]}
                                    value={form.type}
                                    onChange={val => setForm(p => ({ ...p, type: val }))}
                                />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase px-1">Montante (AOA)</label>
                            <div className="relative">
                                <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)]" />
                                <input 
                                    required 
                                    type="number" 
                                    className="premium-input !pl-12 !py-4 font-black text-lg tabular-nums" 
                                    placeholder="0,00"
                                    value={form.amount} 
                                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase px-1">Vencimento Programado</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)] opacity-40" />
                                <input 
                                    required 
                                    type="date" 
                                    className="premium-input !pl-12 !py-4 font-bold uppercase" 
                                    value={form.dueDate} 
                                    onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase px-1">Plano de Contas / Rubrica</label>
                                <SearchableSelect 
                                    options={[
                                        { label: '1.1.0 - Despesa Operacional (OPEX)', value: 'Despesa Operacional' },
                                        { label: '1.2.0 - Investimento (CAPEX)', value: 'Investimento' },
                                        { label: '2.1.0 - Impostos e Taxas (AGT)', value: 'Impostos' },
                                        { label: '3.1.0 - Projetos e Serviços', value: 'Projetos' },
                                        { label: '4.1.0 - Recursos Humanos (Folha)', value: 'Recursos Humanos' }
                                    ]}
                                    value={form.category}
                                    onChange={val => setForm(p => ({ ...p, category: val }))}
                                />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase px-1">Centro de Custo</label>
                                <SearchableSelect 
                                    options={[
                                        { label: 'CC-01 ADMINISTRAÇÃO & CONTROLADORIA', value: 'Administração Controladoria' },
                                        { label: 'CC-02 OPERAÇÕES HUB', value: 'Operações Hub' },
                                        { label: 'CC-03 LOGÍSTICA & FROTA', value: 'Logística Frota' },
                                        { label: 'CC-04 COMERCIAL & VENDAS', value: 'Comercial Vendas' }
                                    ]}
                                    value={form.costCenter}
                                    onChange={val => setForm(p => ({ ...p, costCenter: val }))}
                                />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase px-1">Canal de Liquidação</label>
                                <SearchableSelect 
                                    options={['CONTA CORRENTE BFA', 'TESOURARIA BAI', 'INVESTIMENTOS BMA'].map(acc => ({ label: acc, value: acc }))}
                                    value={form.bankAccount}
                                    onChange={val => setForm(p => ({ ...p, bankAccount: val }))}
                                />
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4 mt-auto">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="premium-button-secondary flex-1 py-4">Descartar Protocolo</button>
                        <button type="submit" disabled={createMutation.isPending} className="premium-button-primary flex-[2] py-4 shadow-xl active:scale-95 transition-all">
                            {createMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <BadgeCheck size={20} />} 
                            Registrar no Ledger Matriz
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
