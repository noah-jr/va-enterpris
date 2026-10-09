import { 
    ShoppingCart, CreditCard, Receipt, Plus, 
    Monitor, Search, Settings, Power, Terminal, Tablet, 
    Loader2, Activity, DollarSign, Smartphone, RefreshCw, CheckCircle,
    Unlock, Lock, Play, Layout, Package, History, Tag, ChevronRight,
    ArrowUpRight, ArrowDownRight, Filter, Download, List, LayoutGrid, Printer
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/Modal';
import { formatCurrency } from '../utils/format';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const fmt = (v: number) => formatCurrency(v);

export default function POSModule() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    
    // State
    const [activeTab, setActiveTab] = useState<'TERMINALS' | 'SALES' | 'STOCK' | 'SHIFTS'>('TERMINALS');
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(false);
    const [sessionModal, setSessionModal] = useState<any>(null);
    const [zReportModal, setZReportModal] = useState<any>(null);
    const [openingBalance, setOpeningBalance] = useState('0');
    const [newTerminal, setNewTerminal] = useState({ name: '', description: '' });
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Queries
    const { data: terminals = [], isLoading: isLoadingTerminals } = useQuery({
        queryKey: ['pos-terminals'],
        queryFn: async () => (await api.get('/pos/terminals')).data
    });

    const { data: stats } = useQuery({
        queryKey: ['pos-stats'],
        queryFn: async () => (await api.get('/pos/stats')).data
    });

    const { data: sales = [] } = useQuery({
        queryKey: ['pos-global-sales'],
        queryFn: async () => (await api.get('/pos/sales')).data,
        enabled: activeTab === 'SALES'
    });

    const { data: products = [] } = useQuery({
        queryKey: ['pos-products-list'],
        queryFn: async () => (await api.get('/products')).data,
        enabled: activeTab === 'STOCK'
    });

    // Mutations
    const createTerminalMutation = useMutation({
        mutationFn: (data: any) => api.post('/pos/terminals', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos-terminals'] });
            setModal(false);
            setNewTerminal({ name: '', description: '' });
            toast.success('Terminal registado com sucesso.');
        }
    });

    const openSessionMutation = useMutation({
        mutationFn: (data: any) => api.post('/pos/sessions/open', data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['pos-terminals'] });
            setSessionModal(null);
            toast.success('Sessão iniciada.');
            navigate(`/pos/console/${data.data.terminalId}`);
        },
        onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao abrir sessão.')
    });

    const closeSessionMutation = useMutation({
        mutationFn: (id: string) => api.post(`/pos/sessions/${id}/close`, { closingBalance: 0 }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos-terminals'] });
            toast.warning('Sessão encerrada.');
        }
    });

    // Logic
    const filteredTerminals = terminals.filter((t: any) => 
        t.name?.toLowerCase().includes(search.toLowerCase()) || 
        t.id.toLowerCase().includes(search.toLowerCase())
    );

    const filteredSales = sales.filter((s: any) => 
        s.id.toLowerCase().includes(search.toLowerCase()) || 
        s.terminal?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const filteredProducts = products.filter((p: any) => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.code?.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoadingTerminals) return (
        <div className="flex items-center justify-center gap-3 py-32 text-[var(--text-muted)]">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Sincronizando malha de terminais...</span>
        </div>
    );

    return (
        <div className="space-y-6 pb-8 animate-fade-in">
            {/* Header - Aligned with Dashboard */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Gestão de PDV</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">
                        {format(time, "EEEE, dd 'de' MMMM · HH:mm:ss", { locale: pt })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setModal(true)} className="premium-button-primary !px-4">
                        <Plus size={16} />
                        <span>Novo Terminal</span>
                    </button>
                </div>
            </div>

            {/* KPIs - Aligned with Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Faturação Hoje', value: fmt(stats?.todayRevenue || 0), trend: '+12%', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: <DollarSign size={15} /> },
                    { label: 'Caixas Abertos', value: stats?.activeSessions || 0, trend: 'Estável', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10', icon: <Monitor size={15} /> },
                    { label: 'Itens em Catálogo', value: stats?.totalProducts || 0, trend: 'Sincro', color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-500/10', icon: <Package size={15} /> },
                    { label: 'Estado da Malha', value: stats?.status || 'ONLINE', trend: 'Activo', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-500/10', icon: <Activity size={15} /> },
                ].map((kpi, i) => (
                    <div key={i} className="premium-card p-4 flex items-start gap-3">
                        <div className={`kpi-icon shrink-0 ${kpi.color} ${kpi.bg}`}>
                            {kpi.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-[var(--text-muted)] mb-0.5 truncate">{kpi.label}</p>
                            <p className="text-base font-bold text-[var(--text-primary)] tabular-nums leading-tight truncate">{kpi.value}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <ArrowUpRight size={11} className="text-emerald-500" />
                                <span className="text-[11px] font-medium text-emerald-500">{kpi.trend}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs & Search Navigation */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-0.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-1 w-full lg:w-auto overflow-x-auto no-scrollbar">
                    {[
                        { id: 'TERMINALS', label: 'Terminais', icon: <Tablet size={14} /> },
                        { id: 'SALES', label: 'Vendas', icon: <Receipt size={14} /> },
                        { id: 'STOCK', label: 'Stock PDV', icon: <Package size={14} /> },
                        { id: 'SHIFTS', label: 'Turnos', icon: <History size={14} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id as any); setSearch(''); }}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-[var(--radius-sm)] text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full lg:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                    <input
                        placeholder="Pesquisar..."
                        className="premium-input !pl-9 !py-1.5 !text-xs !rounded-[var(--radius-md)]"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'TERMINALS' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTerminals.map((t: any) => {
                            const activeSession = t.sessions?.[0];
                            return (
                                <div key={t.id} className="premium-card p-5 flex flex-col gap-5 hover:border-[var(--border-strong)] transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--accent)] flex items-center justify-center">
                                                <Tablet size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-[var(--text-primary)]">{t.name}</h3>
                                                <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">NODE: {t.id.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                        <span className={`badge ${activeSession ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'}`}>
                                            {activeSession ? 'Operacional' : 'Offline'}
                                        </span>
                                    </div>

                                    <div className="bg-[var(--bg-primary)] rounded-lg p-4 border border-[var(--border-color)] space-y-3">
                                        <div className="flex justify-between items-center text-[11px] font-medium text-[var(--text-muted)]">
                                            <span>Operador</span>
                                            <span className="text-[var(--text-primary)] font-bold">{activeSession?.operatorId.slice(0, 8) || 'S/ INFO'}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-[var(--border-color)]">
                                            <span className="text-[11px] font-medium text-[var(--text-muted)]">Faturação</span>
                                            <span className="text-sm font-bold text-emerald-600 tabular-nums">
                                                {fmt(activeSession?.sales?.reduce((sum: number, s: any) => sum + s.amount, 0) || 0)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-auto">
                                        {activeSession ? (
                                            <>
                                                <button 
                                                    onClick={() => navigate(`/pos/console/${t.id}`)}
                                                    className="flex-1 premium-button-primary !py-2 !text-xs"
                                                >
                                                    Entrar na Consola
                                                </button>
                                                <button 
                                                    onClick={() => setZReportModal(activeSession)}
                                                    className="premium-button-secondary !p-2 !rounded-lg text-[var(--accent)]"
                                                    title="Resumo de Turno"
                                                >
                                                    <Activity size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => closeSessionMutation.mutate(activeSession.id)}
                                                    className="premium-button-secondary !p-2 !rounded-lg text-rose-500"
                                                    title="Encerrar Caixa"
                                                >
                                                    <Power size={16} />
                                                </button>
                                            </>
                                        ) : (
                                            <button 
                                                onClick={() => setSessionModal(t)}
                                                className="w-full premium-button-secondary !py-2 !text-xs border-dashed"
                                            >
                                                <Play size={14} className="text-emerald-500 mr-1" /> Abrir Caixa
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'SALES' && (
                    <div className="premium-table-container">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th># ID</th>
                                    <th>Terminal</th>
                                    <th>Data & Hora</th>
                                    <th>Itens</th>
                                    <th>Método</th>
                                    <th className="text-right">Total</th>
                                    <th className="text-center">Acção</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSales.map((sale: any) => (
                                    <tr key={sale.id}>
                                        <td className="font-bold text-[var(--accent)]">#{sale.id.slice(-8).toUpperCase()}</td>
                                        <td className="font-medium">{sale.terminal?.name}</td>
                                        <td className="text-[11px] text-[var(--text-muted)]">{new Date(sale.date).toLocaleString()}</td>
                                        <td className="font-bold">{sale.itemsCount}</td>
                                        <td>
                                            <span className={`badge ${sale.paymentMethod === 'CASH' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10'}`}>
                                                {sale.paymentMethod === 'CASH' ? 'Numerário' : 'Multicaixa'}
                                            </span>
                                        </td>
                                        <td className="text-right font-bold tabular-nums">{fmt(sale.amount)}</td>
                                        <td className="text-center">
                                            <button className="p-1.5 hover:bg-[var(--bg-primary)] rounded-md text-[var(--text-muted)]">
                                                <ChevronRight size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'STOCK' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {filteredProducts.map((product: any) => (
                            <div key={product.id} className="premium-card p-4 flex items-center gap-4 hover:border-[var(--border-strong)] transition-all">
                                <div className="w-10 h-10 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)]">
                                    <Package size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">{product.name}</h4>
                                    <p className="text-[11px] font-bold text-[var(--accent)] tabular-nums">{fmt(product.price)}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                        <span className="text-[10px] font-medium text-[var(--text-muted)]">Stock: {product.stock} un</span>
                                    </div>
                                </div>
                                <button onClick={() => navigate(`/products/edit/${product.id}`)} className="p-2 hover:bg-[var(--bg-primary)] rounded-lg text-[var(--text-muted)]">
                                    <Settings size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'SHIFTS' && (
                    <div className="premium-table-container">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th># Turno</th>
                                    <th>Terminal</th>
                                    <th>Operador</th>
                                    <th>Abertura</th>
                                    <th>Encerramento</th>
                                    <th className="text-right">Fundo Inic.</th>
                                    <th className="text-right">Faturação</th>
                                    <th className="text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {terminals.flatMap((t: any) => t.sessions || []).filter((s: any) => s.status === 'CLOSED').map((shift: any) => (
                                    <tr key={shift.id}>
                                        <td className="font-bold">#{shift.id.slice(-6).toUpperCase()}</td>
                                        <td className="font-medium text-[var(--accent)]">{terminals.find((t: any) => t.id === shift.terminalId)?.name}</td>
                                        <td>{shift.operatorId.slice(0, 8)}</td>
                                        <td className="text-[11px]">{new Date(shift.openedAt).toLocaleString()}</td>
                                        <td className="text-[11px]">{shift.closedAt ? new Date(shift.closedAt).toLocaleString() : '---'}</td>
                                        <td className="text-right tabular-nums">{fmt(shift.openingBalance)}</td>
                                        <td className="text-right font-bold tabular-nums text-emerald-600">{fmt(shift.sales?.reduce((a: any, b: any) => a + b.amount, 0) || 0)}</td>
                                        <td className="text-center"><span className="badge bg-zinc-100 text-zinc-600">Arquivado</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            <Modal
                isOpen={modal}
                onClose={() => setModal(false)}
                title="Novo Terminal"
                subtitle="Configurar novo ponto de venda"
                width="xl"
            >
                <form onSubmit={(e) => { e.preventDefault(); createTerminalMutation.mutate(newTerminal); }} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="premium-label">Nome do Terminal</label>
                        <input required placeholder="Ex: Caixa Frontal" className="premium-input" value={newTerminal.name} onChange={e => setNewTerminal(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="premium-label">Observações</label>
                        <textarea placeholder="Localização ou detalhes adicionais..." className="premium-input min-h-[100px] py-3" value={newTerminal.description} onChange={e => setNewTerminal(p => ({ ...p, description: e.target.value }))} />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setModal(false)} className="premium-button-secondary flex-1">Cancelar</button>
                        <button type="submit" className="premium-button-primary flex-1">Salvar Terminal</button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={!!sessionModal}
                onClose={() => setSessionModal(null)}
                title="Abertura de Caixa"
                subtitle={`Terminal: ${sessionModal?.name}`}
                width="xl"
            >
                <form onSubmit={(e) => { e.preventDefault(); openSessionMutation.mutate({ terminalId: sessionModal.id, openingBalance }); }} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="premium-label text-center block">Saldo de Abertura (AOA)</label>
                        <input 
                            required 
                            type="number" 
                            className="premium-input !text-3xl !font-bold !text-center !py-6 !bg-emerald-50 dark:!bg-emerald-500/5 !border-emerald-200 dark:!border-emerald-500/20 text-emerald-600 tabular-nums" 
                            value={openingBalance}
                            onChange={e => setOpeningBalance(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {['500', '1000', '2000', '5000'].map(val => (
                            <button key={val} type="button" onClick={() => setOpeningBalance(val)} className="py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[10px] font-bold hover:border-[var(--accent)]">+{val}</button>
                        ))}
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setSessionModal(null)} className="premium-button-secondary flex-1">Cancelar</button>
                        <button type="submit" className="premium-button-primary !bg-emerald-600 flex-1">Iniciar Turno</button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={!!zReportModal}
                onClose={() => setZReportModal(null)}
                title="Resumo de Turno (Relatório Z)"
                subtitle={`Sessão: ${zReportModal?.id.slice(-8).toUpperCase()}`}
                width="lg"
            >
                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-[var(--text-muted)]">Saldo de Abertura</span>
                            <span className="font-bold">{fmt(zReportModal?.openingBalance || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-[var(--text-muted)]">Vendas em Numerário</span>
                            <span className="font-bold">{fmt(zReportModal?.sales?.filter((s:any) => s.paymentMethod === 'CASH').reduce((a:any, b:any) => a + b.amount, 0) || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-[var(--text-muted)]">Vendas Multicaixa</span>
                            <span className="font-bold">{fmt(zReportModal?.sales?.filter((s:any) => s.paymentMethod === 'CARD').reduce((a:any, b:any) => a + b.amount, 0) || 0)}</span>
                        </div>
                        <div className="pt-4 border-t border-[var(--border-color)] flex justify-between text-lg font-bold">
                            <span>TOTAL TURNO</span>
                            <span className="text-emerald-600">{fmt(zReportModal?.sales?.reduce((a:any, b:any) => a + b.amount, 0) || 0)}</span>
                        </div>
                    </div>
                    <button onClick={() => window.print()} className="premium-button-primary w-full">
                        <Printer size={16} /> Imprimir Relatório de Fecho
                    </button>
                </div>
            </Modal>
        </div>
    );
}
