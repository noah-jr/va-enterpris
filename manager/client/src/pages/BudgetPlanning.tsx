import { useState } from 'react';
import { 
    Calculator, Plus, TrendingDown, Target, BarChart3, 
    CheckCircle2, AlertCircle, Loader2, Pencil, Trash2, 
    ShieldCheck, PieChart, Zap, TrendingUp, LayoutGrid, 
    PlusCircle, X, Search, ArrowUpRight, DollarSign,
    Calendar, Filter, Download, ChevronRight, Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from 'recharts';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { SearchableSelect } from '../components/SearchableSelect';
import { usePermissions, useMe } from '../auth/useAuth';

const fmt = (v: number) => {
    return new Intl.NumberFormat('pt-AO', { 
        style: 'currency', 
        currency: 'AOA',
        maximumFractionDigits: 0 
    }).format(v);
}

interface BudgetLine {
    id: string;
    department: string;
    category: string;
    planned: number;
    actual: number;
    variance: number;
    status: 'ON_TRACK' | 'OVER_BUDGET' | 'UNDER_BUDGET';
    period: string;
}

const DEPARTMENTS = ['Comercial', 'RH', 'TI', 'Operações', 'Comunicação', 'Jurídico', 'Financeiro'];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
    ON_TRACK: { 
        label: 'Em Conformidade', 
        color: 'text-emerald-500', 
        bg: 'bg-emerald-500/5', 
        border: 'border-emerald-500/10',
        icon: CheckCircle2 
    },
    OVER_BUDGET: { 
        label: 'Excedido', 
        color: 'text-rose-500', 
        bg: 'bg-rose-500/5', 
        border: 'border-rose-500/10',
        icon: AlertCircle 
    },
    UNDER_BUDGET: { 
        label: 'Abaixo do Teto', 
        color: 'text-sky-500', 
        bg: 'bg-sky-500/5', 
        border: 'border-sky-500/10',
        icon: TrendingDown 
    },
};

export default function BudgetPlanning() {
    const queryClient = useQueryClient();
    const [deptFilter, setDeptFilter] = useState('ALL');
    const [modal, setModal] = useState(false);
    const [year, setYear] = useState(new Date().getFullYear());
    const [editingLine, setEditingLine] = useState<BudgetLine | null>(null);
    const [form, setForm] = useState({ department: 'Comercial', category: '', planned: '', actual: '', period: `${new Date().getFullYear()}-Q1` });
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    
    const { hasPermission } = usePermissions();
    const { data: me } = useMe();
    const isModuleEnabled = me?.company?.enabledModules?.includes('budget') || me?.role === 'SUPER_ADMIN';

    const { data: budgets = [], isLoading } = useQuery({
        queryKey: ['budgets', year],
        queryFn: async () => {
            const res = await api.get('/budget', { params: { period: year.toString() } });
            return res.data as BudgetLine[];
        }
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/budget', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            setModal(false);
            resetForm();
            toast.success('Dotação orçamental registada.');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: any) => api.patch(`/budget/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            setModal(false);
            resetForm();
            toast.success('Dotação actualizada.');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/budget/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            toast.info('Registo removido.');
        }
    });

    const resetForm = () => {
        setForm({ department: 'Comercial', category: '', planned: '', actual: '', period: `${year}-Q1` });
        setEditingLine(null);
    };

    const handleEdit = (line: BudgetLine) => {
        setEditingLine(line);
        setForm({
            department: line.department,
            category: line.category,
            planned: line.planned.toString(),
            actual: line.actual.toString(),
            period: line.period
        });
        setModal(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...form,
            planned: parseFloat(form.planned),
            actual: parseFloat(form.actual)
        };
        if (editingLine) updateMutation.mutate({ id: editingLine.id, data });
        else createMutation.mutate(data);
    };

    const filtered = ( budgets || [] ).filter(l => 
        (deptFilter === 'ALL' || l.department === deptFilter) &&
        (l.category.toLowerCase().includes(searchTerm.toLowerCase()) || l.department.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const itemsPerPage = 8;
    const paginatedData = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const totalPlanned = budgets.reduce((s, l) => s + l.planned, 0);
    const totalActual = budgets.reduce((s, l) => s + l.actual, 0);
    const totalVariance = totalPlanned - totalActual;
    const executionRate = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;

    const chartData = DEPARTMENTS.map(dept => {
        const dLines = budgets.filter(l => l.department === dept);
        return {
            name: dept,
            Previsto: dLines.reduce((s, l) => s + l.planned, 0),
            Realizado: dLines.reduce((s, l) => s + l.actual, 0),
        };
    }).filter(d => d.Previsto > 0);

    const columns = [
        {
            header: 'Categoria / Nodo',
            accessor: (line: BudgetLine) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
                        <Calculator size={16} />
                    </div>
                    <div>
                        <p className="font-bold text-xs text-[var(--text-primary)]">{line.category}</p>
                        <p className="text-[10px] font-medium text-[var(--text-secondary)] opacity-50 uppercase tracking-wider">{line.department} • {line.period}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Previsto',
            accessor: (line: BudgetLine) => <span className="font-bold tabular-nums text-xs">{fmt(line.planned)}</span>
        },
        {
            header: 'Realizado',
            accessor: (line: BudgetLine) => <span className="font-bold tabular-nums text-xs opacity-60">{fmt(line.actual)}</span>
        },
        {
            header: 'Desvio',
            accessor: (line: BudgetLine) => (
                <span className={`font-bold tabular-nums text-xs ${line.variance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {line.variance >= 0 ? '+' : ''}{fmt(line.variance)}
                </span>
            )
        },
        {
            header: 'Execução',
            accessor: (line: BudgetLine) => {
                const pct = line.planned > 0 ? Math.round((line.actual / line.planned) * 100) : 0;
                return (
                    <div className="flex items-center gap-3 w-32">
                        <div className="flex-1 h-1 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-color)]/20">
                            <div className={`h-full rounded-full transition-all duration-1000 ${pct > 100 ? 'bg-rose-500' : 'bg-[var(--accent)]'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className="text-[10px] font-bold tabular-nums w-8">{pct}%</span>
                    </div>
                );
            }
        },
        {
            header: 'Status',
            accessor: (line: BudgetLine) => {
                const s = STATUS_CFG[line.status] || STATUS_CFG.ON_TRACK;
                const Icon = s.icon;
                return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold border uppercase tracking-wider ${s.bg} ${s.color} ${s.border}`}>
                        <Icon size={12} /> {s.label}
                    </span>
                );
            }
        },
        {
            header: '',
            accessor: (line: BudgetLine) => (
                <div className="flex gap-1 justify-end items-center">
                    <button onClick={() => handleEdit(line)} className="p-2 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all"><Pencil size={14}/></button>
                    <button onClick={() => confirm('Eliminar dotação?') && deleteMutation.mutate(line.id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-500 transition-all"><Trash2 size={14}/></button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in text-left pb-20">
            {/* Minimalist Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Gestão Orçamental</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Planeamento e controlo estratégico de alocações financeiras.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1 rounded-[var(--radius-md)] shadow-sm">
                        <button onClick={() => setYear(y => y - 1)} className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg-primary)] transition-all">
                            <ChevronRight size={14} className="rotate-180" />
                        </button>
                        <span className="px-4 text-[10px] font-bold uppercase tracking-widest">{year}</span>
                        <button onClick={() => setYear(y => y + 1)} className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg-primary)] transition-all">
                            <ChevronRight size={14} />
                        </button>
                    </div>
                    {hasPermission('finance:create') && isModuleEnabled && (
                        <button onClick={() => { resetForm(); setModal(true); }} className="premium-button-primary">
                            <Plus size={18} /> Nova Dotação
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="py-40 flex flex-col items-center justify-center gap-6 opacity-40">
                    <Loader2 size={48} className="animate-spin text-[var(--accent)]" />
                    <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Sincronizando dotações...</p>
                </div>
            ) : (
                <>
                    {/* Modern KPIs */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                            { label: 'Orçamento Total', value: fmt(totalPlanned), icon: <ShieldCheck size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                            { label: 'Consumo Realizado', value: fmt(totalActual), icon: <Zap size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                            { label: 'Margem Disponível', value: fmt(totalVariance), icon: <TrendingUp size={15} />, color: totalVariance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400', bg: totalVariance >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-rose-50 dark:bg-rose-500/10' },
                            { label: 'Taxa de Execução', value: `${executionRate}%`, icon: <Activity size={15} />, color: executionRate > 90 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400', bg: executionRate > 90 ? 'bg-amber-50 dark:bg-amber-500/10' : 'bg-emerald-50 dark:bg-emerald-500/10' },
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

                    {/* Analytics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 premium-card p-8 bg-[var(--bg-secondary)] border-none">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-3">
                                    <BarChart3 size={16} className="text-[var(--accent)]" /> Desempenho por Departamento
                                </h2>
                                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider opacity-40">
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--accent)]" /> Realizado</div>
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--border-color)]" /> Previsto</div>
                                </div>
                            </div>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} barGap={8}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                                        <XAxis dataKey="name" stroke="rgba(0,0,0,0.3)" fontSize={9} fontWeight="700" tickLine={false} axisLine={false} />
                                        <YAxis stroke="rgba(0,0,0,0.3)" fontSize={9} fontWeight="700" tickLine={false} axisLine={false} tickFormatter={v => `${v / 1000000}M`} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                            contentStyle={{ backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '12px' }}
                                            itemStyle={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}
                                            formatter={(v: any) => [fmt(v), 'AOA']}
                                        />
                                        <Bar dataKey="Previsto" fill="var(--border-color)" radius={[4, 4, 0, 0]} barSize={30} opacity={0.3} />
                                        <Bar dataKey="Realizado" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="premium-card p-8 bg-[var(--bg-secondary)] border-none flex flex-col justify-between">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-3 mb-8">
                                <Target size={16} className="text-[var(--accent)]" /> Eficiência Estratégica
                            </h2>
                            <div className="space-y-6">
                                {chartData.slice(0, 5).map((d, i) => {
                                    const pct = Math.round((d.Realizado / d.Previsto) * 100);
                                    return (
                                        <div key={i} className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] font-bold text-[var(--text-primary)] opacity-40 uppercase tracking-wider">{d.name}</span>
                                                <span className={`text-[10px] font-bold tabular-nums ${pct > 100 ? 'text-rose-500' : 'text-emerald-500'}`}>{pct}%</span>
                                            </div>
                                            <div className="h-1 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-1000 ${pct > 100 ? 'bg-rose-500' : 'bg-[var(--accent)]'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-8 pt-6 border-t border-[var(--border-color)]/20">
                                <button className="w-full text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] flex items-center justify-center gap-2 hover:translate-x-1 transition-transform">
                                    Ver Relatório Detalhado <ArrowUpRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="space-y-6">
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-[var(--radius-md)] flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="relative flex-1 w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                <input 
                                    type="text"
                                    placeholder="Pesquisar categoria ou departamento..."
                                    className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex bg-[var(--bg-primary)] p-1 rounded-[var(--radius-md)] border border-[var(--border-color)] shadow-sm overflow-x-auto no-scrollbar">
                                {(['ALL', ...DEPARTMENTS.slice(0, 4)] as const).map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDeptFilter(d as string)}
                                        className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${deptFilter === d ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                                    >
                                        {d === 'ALL' ? 'Todos' : d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="premium-card p-0 overflow-hidden">
                            <DataTable 
                                data={paginatedData}
                                columns={columns}
                                isLoading={isLoading}
                                currentPage={page}
                                totalPages={totalPages}
                                totalItems={filtered.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setPage}
                                showSearch={false}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Modal */}
            <Modal
                isOpen={modal}
                onClose={() => setModal(false)}
                title={editingLine ? "Ajustar Dotação" : "Nova Dotação"}
                subtitle="Configuração de dotações orçamentais e limites."
                type="CENTER"
                width="xl"
            >
                <form onSubmit={handleSave} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Departamento Executor</label>
                            <SearchableSelect 
                                options={DEPARTMENTS.map(d => ({ label: d, value: d }))}
                                value={form.department}
                                onChange={val => setForm(p => ({ ...p, department: val }))}
                                placeholder="Selecionar departamento..."
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Categoria</label>
                            <input required placeholder="Ex: Material de Escritório..." className="premium-input !py-4 text-xs font-bold uppercase" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value.toUpperCase() }))} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Teto Planeado (AOA)</label>
                            <input required type="number" className="premium-input !py-4 text-sm font-bold tabular-nums" value={form.planned} onChange={e => setForm(p => ({ ...p, planned: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Consumo Realizado (AOA)</label>
                            <input required type="number" className="premium-input !py-4 text-sm font-bold tabular-nums" value={form.actual} onChange={e => setForm(p => ({ ...p, actual: e.target.value }))} />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Período Fiscal</label>
                            <input required placeholder="Ex: 2026-Q1" className="premium-input !py-4 text-xs font-bold uppercase tracking-widest" value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value.toUpperCase() }))} />
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={() => setModal(false)} className="premium-button-secondary flex-1">Cancelar</button>
                        <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="premium-button-primary flex-[2]">
                            {createMutation.isPending || updateMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                            {editingLine ? 'Guardar Alterações' : 'Criar Dotação'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
