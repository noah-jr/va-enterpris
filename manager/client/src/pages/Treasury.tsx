import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Wallet, Landmark, ArrowUpRight, ArrowDownLeft, Calendar,
    Search, Plus, Download, TrendingUp,
    ShieldCheck, BadgeCheck,
    PiggyBank, BarChart3,
    Target, Loader2, Clock, Pencil, Trash2, CheckCircle2,
    X, LayoutGrid, List, FileText
} from 'lucide-react';
import api from '../api';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { SearchableSelect } from '../components/SearchableSelect';

import { formatCurrency } from '../utils/format';
const fmt = (v: number) => formatCurrency(v);

export default function Treasury() {
    const qc = useQueryClient();
    const [tab, setTab] = useState<'CASH_FLOW' | 'RECONCILIATION'>('CASH_FLOW');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: 'PAYABLE',
        category: 'OPERATIONAL',
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        status: 'PENDING'
    });

    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [editingBank, setEditingBank] = useState<any>(null);
    const [bankForm, setBankForm] = useState({
        bank: '',
        iban: '',
        balance: '',
        type: 'CURRENT',
        color: 'indigo'
    });

    const itemsPerPage = 10;

    const { data: summaryData } = useQuery({
        queryKey: ['treasury-summary'],
        queryFn: async () => (await api.get('/treasury/summary')).data
    });

    const { data: entriesData, isLoading: loadingEntries } = useQuery({
        queryKey: ['treasury-entries'],
        queryFn: async () => (await api.get('/treasury')).data
    });

    const { data: bankData, isLoading: loadingBanks } = useQuery({
        queryKey: ['bank-accounts'],
        queryFn: async () => (await api.get('/finance/bank-accounts')).data
    });

    const entries: any[] = entriesData || [];
    const bankAccounts: any[] = bankData || [];

    const filteredEntries = entries.filter(e => 
        e.description.toLowerCase().includes(search.toLowerCase()) ||
        (e.category || '').toLowerCase().includes(search.toLowerCase())
    );

    const paginatedEntries = filteredEntries.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/treasury', data),
        onSuccess: () => {
            toast.success('Lançamento registado.');
            qc.invalidateQueries({ queryKey: ['treasury-entries'] });
            qc.invalidateQueries({ queryKey: ['treasury-summary'] });
            setIsModalOpen(false);
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: any) => api.patch(`/treasury/${id}`, data),
        onSuccess: () => {
            toast.success('Lançamento actualizado.');
            qc.invalidateQueries({ queryKey: ['treasury-entries'] });
            qc.invalidateQueries({ queryKey: ['treasury-summary'] });
            setIsModalOpen(false);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/treasury/${id}`),
        onSuccess: () => {
            toast.success('Lançamento removido.');
            qc.invalidateQueries({ queryKey: ['treasury-entries'] });
            qc.invalidateQueries({ queryKey: ['treasury-summary'] });
        }
    });

    const payMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/treasury/${id}/pay`, {}),
        onSuccess: () => {
            toast.success('Liquidação confirmada.');
            qc.invalidateQueries({ queryKey: ['treasury-entries'] });
            qc.invalidateQueries({ queryKey: ['treasury-summary'] });
        }
    });

    const createBankMutation = useMutation({
        mutationFn: (data: any) => api.post('/finance/bank-accounts', data),
        onSuccess: () => {
            toast.success('Conta bancária registada.');
            qc.invalidateQueries({ queryKey: ['bank-accounts'] });
            setIsBankModalOpen(false);
            resetBankForm();
        }
    });

    const updateBankMutation = useMutation({
        mutationFn: ({ id, data }: any) => api.patch(`/finance/bank-accounts/${id}`, data),
        onSuccess: () => {
            toast.success('Conta actualizada.');
            qc.invalidateQueries({ queryKey: ['bank-accounts'] });
            setIsBankModalOpen(false);
            resetBankForm();
        }
    });

    const deleteBankMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/finance/bank-accounts/${id}`),
        onSuccess: () => {
            toast.success('Conta removida.');
            qc.invalidateQueries({ queryKey: ['bank-accounts'] });
        }
    });

    const resetForm = () => {
        setFormData({
            description: '',
            amount: '',
            type: 'PAYABLE',
            category: 'OPERATIONAL',
            dueDate: format(new Date(), 'yyyy-MM-dd'),
            status: 'PENDING'
        });
        setEditingEntry(null);
    };

    const resetBankForm = () => {
        setBankForm({
            bank: '',
            iban: '',
            balance: '',
            type: 'CURRENT',
            color: 'indigo'
        });
        setEditingBank(null);
    };

    const handleEditBank = (bank: any) => {
        setEditingBank(bank);
        setBankForm({
            bank: bank.bank,
            iban: bank.iban,
            balance: bank.balance.toString(),
            type: bank.type || 'CURRENT',
            color: bank.color || 'indigo'
        });
        setIsBankModalOpen(true);
    };

    const handleEdit = (entry: any) => {
        setEditingEntry(entry);
        setFormData({
            description: entry.description,
            amount: entry.amount.toString(),
            type: entry.type,
            category: entry.category || 'OPERATIONAL',
            dueDate: format(new Date(entry.dueDate || entry.createdAt), 'yyyy-MM-dd'),
            status: entry.status
        });
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...formData, amount: Number(formData.amount) };
        if (editingEntry) updateMutation.mutate({ id: editingEntry.id, data: payload });
        else createMutation.mutate(payload);
    };

    const handleSaveBank = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...bankForm, balance: Number(bankForm.balance) };
        if (editingBank) updateBankMutation.mutate({ id: editingBank.id, data: payload });
        else createBankMutation.mutate(payload);
    };

    const totalLiquidity = bankAccounts.reduce((acc, b) => acc + (b.balance || 0), 0);

    const columns = [
        {
            header: 'Data / Ref',
            accessor: (f: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)]">
                        <Calendar size={18} />
                    </div>
                    <div>
                        <p className="font-bold leading-none mb-1">{format(new Date(f.dueDate || f.createdAt), 'dd/MM/yyyy')}</p>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50 uppercase">#FIN-{f.id.slice(-4)}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Descrição / Categoria',
            accessor: (f: any) => (
                <div>
                    <p className="font-bold leading-none mb-1 uppercase tracking-tight">{f.description}</p>
                    <p className="text-[9px] font-bold text-[var(--text-secondary)] opacity-50 uppercase">{f.category || 'GERAL'}</p>
                </div>
            )
        },
        {
            header: 'Fluxo',
            accessor: (f: any) => (
                <span className={`font-bold tabular-nums ${f.type === 'RECEIVABLE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {f.type === 'RECEIVABLE' ? '+ ' : '- '}{fmt(f.amount)}
                </span>
            )
        },
        {
            header: 'Estado',
            accessor: (f: any) => (
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${f.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {f.status === 'PAID' ? <BadgeCheck size={12} /> : <Clock size={12} />}
                    {f.status === 'PAID' ? 'Liquidado' : 'Pendente'}
                </div>
            )
        },
        {
            header: '',
            accessor: (f: any) => (
                <div className="flex items-center justify-end gap-2">
                    {f.status === 'PENDING' && (
                        <button onClick={(e) => { e.stopPropagation(); payMutation.mutate(f.id); }} className="p-2 rounded-lg bg-[var(--bg-primary)] text-emerald-600 border border-[var(--border-color)] transition-all">
                            <CheckCircle2 size={14} />
                        </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(f); }} className="p-2 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--accent)] border border-[var(--border-color)] transition-all">
                        <Pencil size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); if (confirm('Remover?')) deleteMutation.mutate(f.id); }} className="p-2 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-rose-500 border border-[var(--border-color)] transition-all">
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
            className: "text-right"
        }
    ];

    if (loadingEntries || loadingBanks) return (
        <div className="flex items-center justify-center gap-3 py-32 text-[var(--text-muted)]">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">A carregar tesouraria...</span>
        </div>
    );

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Tesouraria e Reservas</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Gestão de liquidez e ativos financeiros institucionais.</p>
                </div>

                <div className="flex items-center gap-2">
                    <button className="premium-button-secondary !px-3 !py-2">
                        <Download size={15} /> Exportar
                    </button>
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="premium-button-primary !px-3 !py-2"
                    >
                        <Plus size={15} /> Novo Lançamento
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Liquidez Disponível', value: fmt(totalLiquidity), trend: '+12.4%', icon: <PiggyBank size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Recebimentos', value: fmt(entries.filter(e => e.type === 'RECEIVABLE' && e.status === 'PAID').reduce((acc, e) => acc + e.amount, 0)), trend: 'MÊS', icon: <ArrowUpRight size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Pagamentos', value: fmt(entries.filter(e => e.type === 'PAYABLE' && e.status === 'PAID').reduce((acc, e) => acc + e.amount, 0)), trend: 'MÊS', icon: <ArrowDownLeft size={15} />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                    { label: 'Balance Score', value: 'Estável', trend: 'SINAL', icon: <Target size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Sidebar: Bank Accounts */}
                <div className="space-y-4">
                    <div className="premium-card p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Landmark size={14} className="text-[var(--accent)] opacity-70" />
                                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Contas Bancárias</p>
                            </div>
                            <button onClick={() => { resetBankForm(); setIsBankModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--accent)] transition-all">
                                <Plus size={14} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {bankAccounts.length === 0 ? (
                                <div className="py-6 flex flex-col items-center opacity-40 border border-dashed border-[var(--border-color)] rounded-lg text-center">
                                    <PiggyBank size={20} className="mb-1" />
                                    <p className="text-xs">Nenhuma conta registada</p>
                                </div>
                            ) : bankAccounts.map((acc: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-2.5 bg-[var(--bg-secondary)] rounded-[var(--radius-sm)] border border-[var(--border-color)]/50 hover:border-[var(--accent)]/30 transition-all cursor-pointer" onClick={() => handleEditBank(acc)}>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-[var(--text-primary)] truncate">{acc.bank}</p>
                                        <p className="text-[10px] text-[var(--text-muted)] font-mono truncate">{acc.iban}</p>
                                    </div>
                                    <span className="text-xs font-bold text-[var(--text-primary)] tabular-nums ml-2 shrink-0">{fmt(acc.balance || 0)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="premium-card p-4 border-l-4 border-emerald-500">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <TrendingUp size={15} />
                            </div>
                            <p className="text-xs font-bold text-[var(--text-primary)]">Previsão de Fluxo</p>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-2">
                            Entrada projetada: <span className="text-emerald-600 font-bold">{fmt(850000)}</span> no ciclo atual.
                        </p>
                        <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]/20">
                            <div className="h-full bg-emerald-500" style={{ width: '75%' }} />
                        </div>
                    </div>
                </div>

                {/* Ledger Matrix */}
                <div className="lg:col-span-2">
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex bg-[var(--bg-primary)] p-1 rounded-[var(--radius-md)] border border-[var(--border-color)] shadow-sm">
                                {[{ key: 'CASH_FLOW', label: 'Fluxo de Caixa' }, { key: 'RECONCILIATION', label: 'Conciliação' }].map(t => (
                                    <button
                                        key={t.key}
                                        onClick={() => setTab(t.key as any)}
                                        className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider transition-all ${tab === t.key ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                <input 
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Filtrar movimentos..." 
                                    className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm font-medium" 
                                />
                            </div>
                        </div>

                        {tab === 'CASH_FLOW' ? (
                            <DataTable 
                                data={paginatedEntries}
                                columns={columns}
                                isLoading={loadingEntries}
                                currentPage={page}
                                totalPages={totalPages}
                                totalItems={filteredEntries.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setPage}
                                onRowClick={handleEdit}
                                showSearch={false}
                            />
                        ) : (
                            <div className="p-12 text-center flex flex-col items-center space-y-6">
                                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center border border-rose-100 shadow-sm">
                                    <ShieldCheck size={32} />
                                </div>
                                <div className="max-w-md">
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-tight mb-2">Conciliação de Ativos</h3>
                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed opacity-70">
                                        O sistema está a cruzar os lançamentos de caixa com os extratos importados. Existem <span className="text-rose-600 font-bold">4 divergências</span> que requerem atenção.
                                    </p>
                                </div>
                                <button className="premium-button-primary">
                                    Importar Extrato (.OFX)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal: Lançamento */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingEntry ? 'Editar Lançamento' : 'Novo Lançamento'}
                subtitle="Registo de tesouraria institucional"
                type="CENTER"
                width="xl"
                icon={<ArrowUpRight size={24} className="text-[var(--accent)]" />}
            >
                <form onSubmit={handleSave} className="p-4 sm:p-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Tipo de Fluxo</label>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl">
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, type: 'PAYABLE'})}
                                    className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${formData.type === 'PAYABLE' ? 'bg-rose-500 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                >
                                    Saída (-)
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, type: 'RECEIVABLE'})}
                                    className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${formData.type === 'RECEIVABLE' ? 'bg-emerald-500 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                >
                                    Entrada (+)
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Montante (AOA)</label>
                            <input 
                                required
                                type="number"
                                value={formData.amount}
                                onChange={e => setFormData({...formData, amount: e.target.value})}
                                className="premium-input !py-4 font-bold text-lg tabular-nums"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Descrição do Lançamento</label>
                        <input 
                            required
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value.toUpperCase()})}
                            className="premium-input !py-4 font-bold uppercase"
                            placeholder="EX: PAGAMENTO DE FORNECEDORES"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Categoria</label>
                                <SearchableSelect 
                                    options={[
                                        { label: 'OPERACIONAL', value: 'OPERATIONAL' },
                                        { label: 'IMPOSTOS / TAXAS', value: 'TAX' },
                                        { label: 'RECURSOS HUMANOS', value: 'SALARY' },
                                        { label: 'INVESTIMENTO', value: 'INVESTMENT' },
                                        { label: 'DIVERSOS', value: 'OTHER' }
                                    ]}
                                    value={formData.category}
                                    onChange={val => setFormData({...formData, category: val})}
                                />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Data de Valor</label>
                            <input 
                                type="date"
                                required
                                value={formData.dueDate}
                                onChange={e => setFormData({...formData, dueDate: e.target.value})}
                                className="premium-input !py-4 font-bold"
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="premium-button-secondary flex-1 uppercase">Cancelar</button>
                        <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="premium-button-primary flex-[2] uppercase">
                            {createMutation.isPending || updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={18} />}
                            {editingEntry ? 'Confirmar Ajuste' : 'Registar Lançamento'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Banco */}
            <Modal
                isOpen={isBankModalOpen}
                onClose={() => setIsBankModalOpen(false)}
                title={editingBank ? 'Editar Conta' : 'Nova Conta Bancária'}
                subtitle="Gestão de ativos financeiros"
                type="CENTER"
                width="lg"
                icon={<Landmark size={24} className="text-[var(--accent)]" />}
            >
                <form onSubmit={handleSaveBank} className="p-4 sm:p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Instituição Bancária</label>
                        <input 
                            required
                            value={bankForm.bank}
                            onChange={e => setBankForm({...bankForm, bank: e.target.value.toUpperCase()})}
                            className="premium-input !py-4 font-bold uppercase"
                            placeholder="EX: BANCO BAI / BFA"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">IBAN</label>
                        <input 
                            required
                            value={bankForm.iban}
                            onChange={e => setBankForm({...bankForm, iban: e.target.value.toUpperCase()})}
                            className="premium-input !py-4 font-mono font-bold text-xs"
                            placeholder="AO06 ..."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Saldo Inicial</label>
                            <input 
                                required
                                type="number"
                                value={bankForm.balance}
                                onChange={e => setBankForm({...bankForm, balance: e.target.value})}
                                className="premium-input !py-4 font-bold"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Tipo</label>
                                <SearchableSelect 
                                    options={[
                                        { label: 'ORDEM', value: 'CURRENT' },
                                        { label: 'POUPANÇA', value: 'SAVINGS' },
                                        { label: 'INVESTIMENTO', value: 'INVESTMENT' }
                                    ]}
                                    value={bankForm.type}
                                    onChange={val => setBankForm({...bankForm, type: val})}
                                />
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={() => setIsBankModalOpen(false)} className="premium-button-secondary flex-1 uppercase">Cancelar</button>
                        <button type="submit" disabled={createBankMutation.isPending || updateBankMutation.isPending} className="premium-button-primary flex-1 uppercase">
                            {createBankMutation.isPending || updateBankMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={18} />}
                            Guardar Conta
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
