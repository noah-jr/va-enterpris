import { useState } from 'react';
import {
    Wallet, FileText,
    Plus, Search,
    Plane, Hotel, Coffee,
    CheckCircle, Clock,
    PieChart, TrendingUp,
    Camera, Calendar,
    Loader2, X, Pencil, Trash2, CheckCircle2, AlertCircle, Download,
    LayoutGrid, List,
    FileCheck,
    CreditCard,
    BadgeCheck
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { SearchableSelect } from '../components/SearchableSelect';

import { formatCurrency } from '../utils/format';
const fmt = (v: number) => formatCurrency(v);

interface ExpenseClaim {
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
    description?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function Expenses() {
    const qc = useQueryClient();
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [editingExpense, setEditingExpense] = useState<ExpenseClaim | null>(null);
    
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'TRAVEL',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        status: 'PENDING' as 'PENDING' | 'APPROVED' | 'REJECTED'
    });

    const itemsPerPage = 10;

    const { data: expensesData, isLoading } = useQuery({
        queryKey: ['expense-claims'],
        queryFn: async () => (await api.get('/compliance-hse/expenses')).data as ExpenseClaim[]
    });

    const expenses = expensesData || [];
    const filtered = expenses.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedData = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/compliance-hse/expenses', data),
        onSuccess: () => {
            toast.success('Pedido de reembolso submetido.');
            qc.invalidateQueries({ queryKey: ['expense-claims'] });
            setIsModalOpen(false);
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: any) => api.patch(`/compliance-hse/expenses/${id}`, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['expense-claims'] });
            toast.success('Registo de despesa actualizado.');
            setIsModalOpen(false);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/compliance-hse/expenses/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['expense-claims'] });
            toast.success('Despesa removida.');
        }
    });

    const resetForm = () => {
        setFormData({
            title: '',
            amount: '',
            category: 'TRAVEL',
            date: format(new Date(), 'yyyy-MM-dd'),
            description: '',
            status: 'PENDING'
        });
        setEditingExpense(null);
    };

    const handleEdit = (expense: any) => {
        setEditingExpense(expense);
        setFormData({
            title: expense.title,
            amount: expense.amount.toString(),
            category: expense.category,
            date: format(new Date(expense.date), 'yyyy-MM-dd'),
            description: expense.description || '',
            status: expense.status
        });
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            amount: Number(formData.amount)
        };
        if (editingExpense) {
            updateMutation.mutate({ id: editingExpense.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const columns = [
        {
            header: 'Despesa / Título',
            accessor: (e: ExpenseClaim) => (
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                        e.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        e.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                        {e.category === 'TRAVEL' ? <Plane size={18} /> : e.category === 'HOTEL' ? <Hotel size={18} /> : <Coffee size={18} />}
                    </div>
                    <div>
                        <p className="font-bold leading-none mb-1">{e.title}</p>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50 uppercase tracking-wider">{e.category}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Data',
            accessor: (e: ExpenseClaim) => <span className="text-[11px] font-bold text-[var(--text-secondary)]">{format(new Date(e.date), 'dd/MM/yyyy')}</span>
        },
        {
            header: 'Valor',
            accessor: (e: ExpenseClaim) => <span className="font-bold tabular-nums text-[var(--text-primary)]">{fmt(e.amount)}</span>
        },
        {
            header: 'Estado',
            accessor: (e: ExpenseClaim) => (
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    e.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    e.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                    'bg-rose-50 text-rose-600 border-rose-100'
                }`}>
                    {e.status === 'APPROVED' ? <CheckCircle2 size={12}/> : e.status === 'PENDING' ? <Clock size={12}/> : <X size={12}/>}
                    {e.status === 'APPROVED' ? 'Aprovado' : e.status === 'PENDING' ? 'Pendente' : 'Rejeitado'}
                </div>
            )
        },
        {
            header: '',
            accessor: (e: ExpenseClaim) => (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={(ev) => { ev.stopPropagation(); handleEdit(e); }} className="p-2 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--accent)] border border-[var(--border-color)] transition-all">
                        <Pencil size={14} />
                    </button>
                    <button onClick={(ev) => { ev.stopPropagation(); if (confirm('Apagar registo?')) deleteMutation.mutate(e.id); }} className="p-2 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-rose-500 border border-[var(--border-color)] transition-all">
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
            className: "text-right"
        }
    ];

    if (isLoading) return (
        <div className="flex items-center justify-center gap-3 py-32 text-[var(--text-muted)]">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">A carregar registo de despesas...</span>
        </div>
    );

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Gestão de Despesas</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Reembolsos, adiantamentos e controlo de custos operacionais.</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1 rounded-[var(--radius-md)]">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-[var(--radius-sm)] transition-colors ${viewMode === 'grid' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}><LayoutGrid size={15} /></button>
                        <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-[var(--radius-sm)] transition-colors ${viewMode === 'table' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}><List size={15} /></button>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="premium-button-primary !px-3 !py-2"
                    >
                        <Plus size={15} /> Novo Reembolso
                    </button>
                </div>
            </div>

            {/* Expense KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total do Mês', val: expenses.reduce((acc, e) => acc + e.amount, 0), icon: <Wallet size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Em Aprovação', val: expenses.filter(e => e.status === 'PENDING').reduce((acc, e) => acc + e.amount, 0), icon: <Clock size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                    { label: 'Liquidados', val: expenses.filter(e => e.status === 'APPROVED').reduce((acc, e) => acc + e.amount, 0), icon: <FileCheck size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Rejeitados', val: expenses.filter(e => e.status === 'REJECTED').length.toString(), icon: <AlertCircle size={15} />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                ].map((kpi, i) => (
                    <div key={i} className="premium-card p-4 flex items-start gap-3">
                        <div className={`kpi-icon shrink-0 ${kpi.color} ${kpi.bg}`}>
                            {kpi.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-[var(--text-muted)] mb-0.5 truncate">{kpi.label}</p>
                            <p className="text-base font-bold text-[var(--text-primary)] tabular-nums leading-tight">{typeof kpi.val === 'number' ? fmt(kpi.val) : kpi.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {viewMode === 'grid' ? (
                        <div className="space-y-6">
                            <div className="bg-[var(--bg-secondary)] p-2 rounded-[var(--radius-md)] border border-[var(--border-color)] flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                    <input 
                                        type="text"
                                        placeholder="Pesquisar por título ou categoria..."
                                        className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm font-medium"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {paginatedData.map(e => (
                                    <div key={e.id} className="premium-card p-6 group">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border group-hover:scale-105 transition-transform ${
                                                e.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                e.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                                'bg-rose-50 text-rose-600 border-rose-100'
                                            }`}>
                                                {e.category === 'TRAVEL' ? <Plane size={24} /> : e.category === 'HOTEL' ? <Hotel size={24} /> : <Coffee size={24} />}
                                            </div>
                                            <div className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                                                e.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-500/10' : 
                                                e.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-500/10' : 
                                                'bg-rose-50 text-rose-600 border-rose-500/10'
                                            }`}>
                                                {e.status === 'APPROVED' ? 'Aprovado' : e.status === 'PENDING' ? 'Pendente' : 'Rejeitado'}
                                            </div>
                                        </div>
                                        <div className="space-y-1 mb-6">
                                            <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-tight line-clamp-2 uppercase">{e.title}</h3>
                                            <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-40 flex items-center gap-2">
                                                <Calendar size={12} /> {format(new Date(e.date), 'dd/MM/yyyy')} · {e.category}
                                            </p>
                                        </div>
                                        <div className="bg-[var(--bg-primary)]/40 border border-[var(--border-color)]/20 rounded-xl p-4 mb-8 flex flex-col items-center">
                                            <p className="text-xl font-bold text-[var(--accent)] tabular-nums">{fmt(e.amount)}</p>
                                            <p className="text-[9px] text-[var(--text-secondary)] font-bold opacity-40 uppercase">Montante do Reembolso</p>
                                        </div>
                                        <div className="flex items-center justify-end pt-4 border-t border-[var(--border-color)] gap-2">
                                            <button onClick={() => handleEdit(e)} className="p-2 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => confirm('Apagar registo?') && deleteMutation.mutate(e.id)} className="p-2 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-rose-500 transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <DataTable 
                            data={paginatedData}
                            columns={columns}
                            isLoading={isLoading}
                            currentPage={page}
                            totalPages={totalPages}
                            totalItems={filtered.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setPage}
                            onSearchChange={setSearchTerm}
                            searchValue={searchTerm}
                            onRowClick={handleEdit}
                            searchPlaceholder="Pesquisar por título ou categoria..."
                        />
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="premium-card p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <PieChart size={14} className="text-[var(--accent)] opacity-70" />
                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Distribuição de Gastos</p>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Viagens & Transportes', p: 55, color: 'bg-indigo-500' },
                                { label: 'Alojamento', p: 30, color: 'bg-sky-500' },
                                { label: 'Alimentação', p: 15, color: 'bg-amber-500' },
                            ].map((c, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-[10px] font-bold text-[var(--text-muted)] mb-1">
                                        <span>{c.label}</span>
                                        <span>{c.p}%</span>
                                    </div>
                                    <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]/20">
                                        <div className={`h-full ${c.color}`} style={{ width: `${c.p}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="premium-card p-4 border-l-4 border-emerald-500">
                        <div className="flex flex-col items-center text-center">
                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Plafond Mensal</p>
                            <div className="relative h-24 w-24 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-[var(--bg-secondary)]" />
                                    <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="263.9" strokeDashoffset={263.9 * (1 - 0.72)} className="text-emerald-500 transition-all duration-1000" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-bold text-[var(--text-primary)] tabular-nums">72%</span>
                                </div>
                            </div>
                            <div className="mt-3 w-full bg-[var(--bg-secondary)] py-2 px-3 rounded-lg border border-[var(--border-color)]">
                                <p className="text-[10px] text-[var(--text-muted)] mb-0.5">Disponível</p>
                                <p className="text-sm font-bold text-emerald-600 tabular-nums">{fmt(428000)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="premium-card p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100"><FileText size={15}/></div>
                            <p className="text-xs font-bold text-[var(--text-primary)]">Política de Reembolsos</p>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-3">Consulte as normas para pedidos de reembolso e limites operacionais (v2026).</p>
                        <button className="w-full premium-button-secondary !py-2 text-xs gap-2">
                            Manual em PDF <Download size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingExpense ? 'Editar Despesa' : 'Novo Reembolso'}
                subtitle="Registo de despesa institucional"
                type="CENTER"
                width="xl"
                icon={<CreditCard size={24} className="text-[var(--accent)]" />}
            >
                <form onSubmit={handleSave} className="p-4 sm:p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] px-1 uppercase tracking-wider">Título da Despesa</label>
                        <input 
                            required
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value.toUpperCase()})}
                            className="premium-input !py-4 font-bold uppercase"
                            placeholder="EX: VIAGEM DE AUDITORIA LUANDA-BENGUELA"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] px-1 uppercase tracking-wider">Valor do Reembolso</label>
                            <div className="relative">
                                <input 
                                    type="number"
                                    required
                                    value={formData.amount}
                                    onChange={e => setFormData({...formData, amount: e.target.value})}
                                    className="premium-input !py-4 font-bold text-lg tabular-nums"
                                    placeholder="0.00"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--text-secondary)] opacity-40 tracking-widest">AOA</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] px-1 uppercase tracking-wider">Data da Despesa</label>
                            <input 
                                type="date"
                                required
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                                className="premium-input !py-4 font-bold"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] px-1 uppercase tracking-wider">Categoria</label>
                            <SearchableSelect 
                                options={[
                                    { label: 'Viagens & Deslocações', value: 'TRAVEL' },
                                    { label: 'Alojamento / Estadia', value: 'HOTEL' },
                                    { label: 'Alimentação', value: 'MEALS' },
                                    { label: 'Combustível', value: 'FUEL' },
                                    { label: 'Consumíveis / Escritório', value: 'UTILITIES' },
                                    { label: 'Outros Diversos', value: 'OTHER' }
                                ]}
                                value={formData.category}
                                onChange={val => setFormData({ ...formData, category: val })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] px-1 uppercase tracking-wider">Comprovativo Digital</label>
                            <div className="w-full h-[52px] bg-[var(--bg-primary)] border border-dashed border-[var(--border-color)] rounded-xl flex items-center justify-center cursor-pointer hover:border-[var(--accent)]/50 transition-all text-[var(--text-secondary)] opacity-40 hover:opacity-100">
                                <div className="flex items-center gap-3">
                                    <Camera size={18} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">Anexar Fatura/Recibo</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="premium-button-secondary flex-1 uppercase">Cancelar</button>
                        <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="premium-button-primary flex-[2] uppercase">
                            {createMutation.isPending || updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={18} />}
                            {editingExpense ? 'Validar Alterações' : 'Submeter Pedido'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
