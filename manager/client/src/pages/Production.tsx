import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Factory, Settings, Layers, CheckCircle, Clock, AlertTriangle, Search, Plus, Cpu, Gauge, ChevronRight, Activity, Zap, Download, Timer, Thermometer, Box, Package, ArrowUpRight, Loader2, Database, Binary, MoreHorizontal, Filter, X, Trash2, Shield } from 'lucide-react';
import api from '../api';
import { usePermissions } from '../auth/useAuth';
import { toast } from 'sonner';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: any; accent: string }> = {
    COMPLETED: { label: 'Finalizado', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', icon: <CheckCircle size={14} />, accent: 'bg-emerald-500' },
    IN_PROGRESS: { label: 'Em Processamento', color: 'text-sky-700 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10', border: 'border-sky-200 dark:border-sky-500/20', icon: <Settings size={14} className="animate-spin-slow" />, accent: 'bg-sky-500' },
    PENDING: { label: 'Pendente', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', icon: <Clock size={14} />, accent: 'bg-amber-500' },
};
export default function Production() {
    const qc = useQueryClient();
    const { hasPermission } = usePermissions();
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    const [formData, setFormData] = useState({
        productName: '',
        quantity: 1,
        priority: 'MEDIUM',
        notes: ''
    });

    const { data: productionData, isLoading: loadingOrders } = useQuery({
        queryKey: ['production-orders'],
        queryFn: async () => (await api.get('/production/orders')).data
    });

    const { data: linesData } = useQuery({
        queryKey: ['production-lines'],
        queryFn: async () => (await api.get('/production/lines')).data
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/production/orders', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['production-orders'] });
            toast.success('Ordem de fabrico registada.');
            setModal(false);
            setFormData({ productName: '', quantity: 1, priority: 'MEDIUM', notes: '' });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, ...data }: any) => api.patch(`/production/orders/${id}`, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['production-orders'] });
            toast.success('Ordem de produção atualizada.');
            setSelected(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/production/orders/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['production-orders'] });
            toast.success('Ordem removida.');
            setSelected(null);
        }
    });

    const orders: any[] = productionData?.orders || [];
    const filteredOrders = orders.filter(o => 
        o.productName?.toLowerCase().includes(search.toLowerCase()) ||
        o.orderNumber?.toLowerCase().includes(search.toLowerCase())
    );
    const lines: any[] = linesData || [];

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Gestão de Produção & Industrial</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Controlo de ordens de fabrico, monitorização de linhas e OEE.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="premium-button-secondary !py-2.5">
                        <Download size={15} />
                        <span className="text-sm">Relatório</span>
                    </button>
                    {hasPermission('production:manage') && (
                        <button 
                            onClick={() => setModal(true)}
                            className="premium-button-primary !py-2.5"
                        >
                            <Plus size={18} /> Nova Ordem
                        </button>
                    )}
                </div>
            </div>

            {/* Matrix KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Em Progresso', value: loadingOrders ? '—' : String(productionData?.kpis?.inProgress ?? 0), icon: <Gauge size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                    { label: 'Finalizadas', value: loadingOrders ? '—' : String(productionData?.kpis?.completed ?? 0), icon: <Box size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Pendentes', value: loadingOrders ? '—' : String(productionData?.kpis?.pending ?? 0), icon: <Clock size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                    { label: 'OEE Global', value: '88.4%', icon: <Activity size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
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

            {/* Workplace Control */}
            <div className="premium-card p-2 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input 
                        type="text"
                        placeholder="Pesquisar ordens ou produtos..."
                        className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm font-medium text-[var(--text-primary)]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex bg-[var(--bg-primary)] p-1 rounded-lg border border-[var(--border-color)]/50">
                    <button className="p-1.5 px-3 rounded-md bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm text-[10px] font-bold uppercase">Geral</button>
                    <button className="p-1.5 px-3 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[10px] font-bold uppercase">Filtros</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Orders List */}
                <div className="lg:col-span-2 space-y-4">
                    {loadingOrders ? (
                        <div className="py-40 flex flex-col items-center justify-center gap-6 text-[var(--text-secondary)] text-center opacity-40">
                            <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
                            <span className="text-xs font-bold uppercase tracking-widest">Sincronizando Plano de Produção...</span>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="premium-card py-40 flex flex-col items-center justify-center opacity-40 border-dashed">
                            <Package size={48} className="mb-4 opacity-20" />
                            <p className="text-xs font-bold uppercase tracking-widest">Nenhuma ordem de fabrico</p>
                        </div>
                    ) : filteredOrders.map((o, i) => {
                        const cfg = STATUS_CFG[o.status] || STATUS_CFG.PENDING;
                        return (
                            <div key={i} onClick={() => setSelected(o)} className="premium-card p-6 cursor-pointer hover:border-[var(--accent)]/50 transition-all group relative overflow-hidden flex flex-col justify-between">
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-[var(--accent)] group-hover:scale-110 transition-transform pointer-events-none"><Settings size={80} /></div>

                                <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-[var(--border-color)]/30 ${o.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-[var(--bg-primary)] text-[var(--accent)]'} shadow-sm`}>
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-tight">{o.productName}</h3>
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${o.priority === 'HIGH' ? 'border-rose-500/30 text-rose-500 bg-rose-50 dark:bg-rose-500/10' : 'border-[var(--border-color)] text-[var(--text-secondary)] bg-[var(--bg-primary)]'} uppercase tracking-widest`}>{o.priority === 'HIGH' ? 'Prioridade Alta' : 'Normal'}</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-40 italic">REF: {o.orderNumber}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border} uppercase tracking-widest`}>
                                            {cfg.icon} {cfg.label}
                                        </span>
                                        <p className="text-xl font-bold text-[var(--text-primary)] tabular-nums tracking-tighter leading-none">{o.quantity} <span className="text-[10px] opacity-40 uppercase font-bold">UN</span></p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-40">Progresso Industrial</span>
                                        <span className="text-xs font-bold text-[var(--text-primary)] tabular-nums">{o.progress || 0}%</span>
                                    </div>
                                    <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden shadow-inner border border-[var(--border-color)]/10">
                                        <div className={`h-full transition-all duration-1000 ${o.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-[var(--accent)]'} opacity-70`} style={{ width: `${o.progress || 0}%` }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Sidebar Monitoring */}
                <div className="space-y-6">
                    <div className="premium-card p-6 group">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-color)]/10">
                            <h3 className="text-[10px] font-bold text-[var(--text-primary)] flex items-center gap-3 uppercase tracking-widest opacity-60">
                                <Activity size={18} className="text-emerald-500" /> Monitorização de Linhas
                            </h3>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
                        </div>
                        <div className="space-y-8">
                            {lines.map((l, i) => (
                                <div key={i} className="group/line">
                                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest mb-3">
                                        <span className="text-[var(--text-secondary)] opacity-60">{l.name}</span>
                                        <span className={l.status === 'OPERATIVA' ? 'text-emerald-600' : 'text-amber-500'}>{l.status}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div className="p-2.5 bg-[var(--bg-primary)]/50 border border-[var(--border-color)]/20 rounded-lg flex items-center justify-between">
                                            <Thermometer size={12} className="text-rose-500 opacity-40" />
                                            <span className="text-[10px] font-bold text-[var(--text-primary)] tabular-nums">{l.temp}</span>
                                        </div>
                                        <div className="p-2.5 bg-[var(--bg-primary)]/50 border border-[var(--border-color)]/20 rounded-lg flex items-center justify-between">
                                            <Timer size={12} className="text-sky-500 opacity-40" />
                                            <span className="text-[10px] font-bold text-[var(--text-primary)] tabular-nums">{l.speed}</span>
                                        </div>
                                    </div>
                                    <div className="h-1 bg-[var(--bg-primary)] rounded-full overflow-hidden shadow-inner border border-[var(--border-color)]/10">
                                        <div className={`h-full transition-all duration-1000 ${l.load > 85 ? 'bg-rose-500' : 'bg-[var(--accent)]'} opacity-70`} style={{ width: `${l.load}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="premium-card p-6 border-l-4 border-l-indigo-600 bg-indigo-600/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-indigo-600 group-hover:scale-110 transition-transform"><Zap size={100} /></div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest opacity-80">Eficiência OEE</h4>
                            <div className="p-2 bg-indigo-600/10 text-indigo-600 rounded-lg shadow-sm border border-indigo-600/20"><Zap size={18} /></div>
                        </div>
                        <div className="flex justify-center mb-8 relative z-10">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" className="text-indigo-600/10" />
                                    <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="364" strokeDashoffset="100" className="text-indigo-600 opacity-60 transition-all duration-1000" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tighter tabular-nums">72<span className="text-xs">%</span></span>
                                    <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase opacity-40 italic">Industrial</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-tight text-center opacity-40 italic">Optimizado via VA-Industrial Engine.</p>
                    </div>

                    <div className="premium-card p-4 flex items-center justify-between group cursor-pointer hover:bg-[var(--bg-primary)] transition-all">
                        <div className="flex items-center gap-4">
                            <div className="kpi-icon bg-rose-500/10 text-rose-600 flex items-center justify-center"><Settings size={18} /></div>
                            <div>
                                <h5 className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-tight">Manutenção GRC</h5>
                                <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase opacity-40">Ativos & BOM</p>
                            </div>
                        </div>
                        <ArrowUpRight size={16} className="text-[var(--text-secondary)] opacity-10 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>

            {/* Side Panel for Detail & Update */}
            {selected && (
                <div className="fixed inset-0 z-[3000] flex justify-end">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in" onClick={() => setSelected(null)} />
                    <div className="relative z-10 w-full max-w-xl bg-[var(--bg-secondary)] h-full overflow-y-auto p-8 sm:p-12 shadow-2xl animate-in slide-in-from-right border-l border-[var(--border-color)]">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--accent)] mb-2">Relatório de Produção</h3>
                                <h2 className="text-2xl font-bold text-[var(--text-primary)] leading-tight italic">{selected.productName}</h2>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-2 hover:bg-[var(--bg-primary)] rounded-lg"><X size={24} /></button>
                        </div>

                        <div className="space-y-8">
                            <div className="premium-card p-6 space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Estado Atual</span>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${STATUS_CFG[selected.status].bg} ${STATUS_CFG[selected.status].color} ${STATUS_CFG[selected.status].border}`}>
                                        {STATUS_CFG[selected.status].label}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase">
                                        <span>Progresso</span>
                                        <span>{selected.progress}%</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="100" className="w-full accent-[var(--accent)]" 
                                        value={selected.progress}
                                        onChange={(e) => updateMutation.mutate({ id: selected.id, progress: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => updateMutation.mutate({ id: selected.id, status: 'IN_PROGRESS' })}
                                    className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[10px] font-bold uppercase hover:border-[var(--accent)] transition-all flex flex-col items-center gap-2"
                                >
                                    <Activity size={20} /> Em Fabrico
                                </button>
                                <button 
                                    onClick={() => updateMutation.mutate({ id: selected.id, status: 'COMPLETED' })}
                                    className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[10px] font-bold uppercase hover:border-emerald-500 transition-all flex flex-col items-center gap-2"
                                >
                                    <CheckCircle size={20} className="text-emerald-500" /> Finalizar
                                </button>
                            </div>

                            <div className="pt-8 border-t border-[var(--border-color)]/20">
                                <button 
                                    onClick={() => { if(confirm('Eliminar esta ordem?')) deleteMutation.mutate(selected.id) }}
                                    className="w-full py-4 bg-rose-600/10 text-rose-600 rounded-xl text-[10px] font-bold uppercase border border-rose-600/20 hover:bg-rose-600/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={16} /> Eliminar Ordem
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Creation Modal */}
            {modal && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setModal(false)} />
                    <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-color)] w-full max-w-xl rounded-3xl p-8 sm:p-12 shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-2xl font-bold text-[var(--text-primary)] italic">Nova Ordem de Fabrico</h2>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">Configuração de ciclo de produção</p>
                            </div>
                            <button onClick={() => setModal(false)} className="p-2 hover:bg-[var(--bg-primary)] rounded-lg"><X size={24} /></button>
                        </div>

                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }}>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Produto a Fabricar</label>
                                <input 
                                    className="premium-input" 
                                    placeholder="Ex: Água Mineral 500ml" 
                                    value={formData.productName}
                                    onChange={e => setFormData({...formData, productName: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Quantidade</label>
                                    <input 
                                        type="number" className="premium-input" 
                                        value={formData.quantity}
                                        onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Prioridade</label>
                                    <select 
                                        className="premium-input"
                                        value={formData.priority}
                                        onChange={e => setFormData({...formData, priority: e.target.value})}
                                    >
                                        <option value="LOW">Baixa</option>
                                        <option value="MEDIUM">Normal</option>
                                        <option value="HIGH">Crítica</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Notas de Operação</label>
                                <textarea 
                                    className="premium-input min-h-[100px] py-3" 
                                    placeholder="Instruções para a linha de produção..."
                                    value={formData.notes}
                                    onChange={e => setFormData({...formData, notes: e.target.value})}
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={createMutation.isPending}
                                className="w-full py-4 bg-[var(--accent)] text-white rounded-2xl text-sm font-bold uppercase shadow-xl shadow-[var(--accent)]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Settings size={18} />}
                                Iniciar Ciclo de Fabrico
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
