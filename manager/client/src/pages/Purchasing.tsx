import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ShoppingCart, Package, Truck, X,
    Search, Calendar, ShoppingBag, Clock,
    Trash2, Building2,
    ArrowRight,
    Fingerprint,
    Globe, CreditCard,
    History, BadgeCheck, FileWarning,
    Boxes,
    Handshake, Receipt, Loader2, PlusCircle,
    PackageCheck, LayoutList, Eye,
    TrendingUp, Activity, ShieldCheck
} from 'lucide-react';
import api from '../api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const fmt = (v: number) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(v);

const STATUS_STYLE: Record<string, { label: string; color: string; icon: any; bg: string; border: string }> = {
    DRAFT: { label: 'Rascunho Protocolo', bg: 'bg-slate-50 dark:bg-white/5', color: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-white/10', icon: <History size={12} /> },
    SENT: { label: 'Em Trânsito SCM', bg: 'bg-sky-50 dark:bg-sky-500/10', color: 'text-sky-700 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-500/20', icon: <Truck size={12} /> },
    CONFIRMED: { label: 'Validado / Ordem', bg: 'bg-[var(--accent)]/5 dark:bg-[var(--accent)]/10', color: 'text-[var(--accent)]', border: 'border-[var(--accent)]/20', icon: <BadgeCheck size={12} /> },
    RECEIVED: { label: 'Liquidação / Stock', bg: 'bg-emerald-50 dark:bg-emerald-500/10', color: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20', icon: <PackageCheck size={12} /> },
    CANCELLED: { label: 'Anulado / Protocolo', bg: 'bg-rose-50 dark:bg-rose-500/10', color: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-500/20', icon: <FileWarning size={12} /> },
};

export default function Purchasing() {
    const qc = useQueryClient();
    const [modal, setModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState<any>(null);

    const { data: ordersData, isLoading } = useQuery({
        queryKey: ['purchasing'],
        queryFn: async () => (await api.get('/purchasing')).data
    });

    const { data: suppliersData } = useQuery({
        queryKey: ['suppliers-list'],
        queryFn: async () => (await api.get('/suppliers')).data
    });

    const orders = ordersData?.items || [];
    const suppliers = suppliersData || [];

    const advanceStatus = useMutation({
        mutationFn: ({ id, status }: any) => api.patch(`/purchasing/${id}/status`, { status }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['purchasing'] });
            toast.success('Vector logístico recalibrado com sucesso.');
        }
    });

    const nextStatus: Record<string, string> = { DRAFT: 'SENT', SENT: 'CONFIRMED', CONFIRMED: 'RECEIVED' };

    const filteredOrders = orders.filter((o: any) =>
        o.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalSpent = orders.reduce((acc: number, o: any) => acc + (o.status !== 'CANCELLED' ? o.totalAmount : 0), 0);
    const pendingOrders = orders.filter((o: any) => o.status !== 'RECEIVED' && o.status !== 'CANCELLED').length;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Gestão de Aquisições & SCM</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Sourcing estratégico e governança de compras institucionais.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="h-11 px-5 bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/30 transition-all shadow-sm flex items-center gap-2 font-black text-[10px] uppercase tracking-widest outline-none">
                        <History size={16} /> Histórico
                    </button>
                    <button
                        onClick={() => setModal(true)}
                        className="h-11 bg-[var(--accent)] hover:opacity-95 active:scale-95 text-white px-6 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[var(--accent)]/20 transition-all border border-white/10 group"
                    >
                        <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-300" /> Nova Ordem de Compra
                    </button>
                </div>
            </div>

            {/* SCM Performance Matrix */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Adquirido', value: totalSpent, sub: 'OPEX Investido', icon: <ShoppingBag size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                    { label: 'Ordens em Curso', value: pendingOrders, sub: 'Em Processamento', icon: <Clock size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                    { label: 'Sourcing Hub', value: suppliers.length, sub: 'Parceiros Certificados', icon: <Handshake size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'SLA de Fulfillment', value: '98.2%', sub: 'Eficiência Logística', icon: <TrendingUp size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                ].map((kpi, i) => (
                    <div key={i} className="premium-card p-4 flex items-start gap-3">
                        <div className={`kpi-icon shrink-0 ${kpi.color} ${kpi.bg}`}>
                            {kpi.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-[var(--text-muted)] mb-0.5 truncate">{kpi.label}</p>
                            <p className="text-base font-bold text-[var(--text-primary)] tabular-nums leading-tight">{typeof kpi.value === 'number' && i === 0 ? fmt(kpi.value) : kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Procurement Filters */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-[var(--radius-md)] flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Filtrar por protocolo, ordem, fornecedor ou sku..."
                        className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm font-medium"
                    />
                </div>
            </div>

            {/* Purchase Orders List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-6 text-[var(--text-secondary)] text-center opacity-50">
                        <Loader2 size={40} className="animate-spin text-[var(--accent)]" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em]">Sincronizando Ordens de Aquisição...</span>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="fluent-card py-40 flex flex-col items-center justify-center text-center text-[var(--text-secondary)] border-2 border-dashed border-[var(--border-color)]/30 rounded-[2rem] opacity-40 group">
                        <ShoppingBag size={64} className="mb-6 opacity-20" />
                        <p className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Sem ordens de compra detectadas</p>
                        <p className="text-[10px] uppercase font-bold mt-2 tracking-widest">Inicie um novo protocolo acima</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredOrders.map((o: any) => {
                            const s = STATUS_STYLE[o.status] || STATUS_STYLE.DRAFT;
                            return (
                                <div key={o.id} className="fluent-card group hover:border-[var(--accent)]/30 transition-all bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[var(--radius-lg)] relative overflow-hidden shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]">
                                    <div className="p-4 sm:p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-4 sm:gap-8">
                                        <div className="flex items-center gap-6 flex-1 min-w-0">
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${o.status === 'RECEIVED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--accent)]'}`}>
                                                <ShoppingCart size={24} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-black uppercase tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{o.number}</h3>
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-wider ${s.bg} ${s.color} ${s.border}`}>
                                                        {s.icon} {s.label}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 opacity-60">
                                                    <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight">
                                                        <Building2 size={12} className="text-sky-600" /> {o.supplier?.name}
                                                    </span>
                                                    <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight">
                                                        <LayoutList size={12} className="text-indigo-600" /> {o.items?.length || 0} Linhas
                                                    </span>
                                                    <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight">
                                                        <Calendar size={12} className="text-amber-600" /> {o.expectedDate ? format(new Date(o.expectedDate), 'dd MMM yyyy', { locale: pt }) : 'N/D'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between xl:justify-end gap-5 sm:gap-10 xl:border-l border-[var(--border-color)] xl:pl-10">
                                            <div className="text-right">
                                                <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1 opacity-50">Valor Total</p>
                                                <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tabular-nums tracking-tighter leading-none">{fmt(o.totalAmount)}</p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {nextStatus[o.status] && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); advanceStatus.mutate({ id: o.id, status: nextStatus[o.status] }); }}
                                                        className="h-11 px-5 bg-[var(--bg-primary)] hover:bg-[var(--accent)] hover:text-white border border-[var(--border-color)] rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all group/btn outline-none active:scale-95 shadow-sm"
                                                    >
                                                        {nextStatus[o.status] === 'RECEIVED' ? <PackageCheck size={16} /> : <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />} Próximo
                                                    </button>
                                                )}
                                                <button onClick={() => setSelected(o)} className="h-11 w-11 flex items-center justify-center bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all outline-none active:scale-95 shadow-sm">
                                                    <Eye size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {o.items?.length > 0 && (
                                        <div className="bg-[var(--bg-primary)]/20 border-t border-[var(--border-color)]/10 px-4 sm:px-8 py-5 flex items-center gap-4 overflow-x-auto no-scrollbar">
                                            {o.items.slice(0, 4).map((item: any) => (
                                                <div key={item.id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/30 px-3 py-2 rounded-xl flex items-center gap-4 min-w-fit shadow-xs">
                                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center text-[var(--accent)]"><Package size={14} /></div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase truncate max-w-[120px] text-[var(--text-primary)] leading-none mb-1">{item.product?.name}</p>
                                                        <p className="text-[8px] font-bold text-[var(--text-secondary)] opacity-50 uppercase tracking-widest">{item.quantity} UN × {fmt(item.unitCost)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {o.items.length > 4 && (
                                                <div className="px-4 py-2 bg-white/5 border border-dashed border-white/10 rounded-xl text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest whitespace-nowrap">
                                                    + {o.items.length - 4} Outros
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Order Dossier Side Panel */}
            {selected && (
                <div className="fixed inset-0 z-[3000] flex justify-end">
                    <div className="absolute inset-0 z-0 bg-[var(--text-primary)]/5 backdrop-blur-sm animate-in fade-in duration-500" onClick={() => setSelected(null)} />
                    <div className="relative z-10 w-full max-w-2xl bg-[var(--bg-secondary)] h-full overflow-y-auto p-4 sm:p-8 sm:p-12 shadow-2xl animate-in slide-in-from-right duration-700 border-l border-[var(--border-color)]/30 no-scrollbar">
                        <div className="flex items-start justify-between mb-12">
                            <div>
                                <h3 className="font-black text-[11px] uppercase tracking-[0.25em] text-[var(--accent)] mb-2 flex items-center gap-2">
                                    <ShoppingCart size={14} /> Dossier de Ordem de Compra
                                </h3>
                                <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter leading-none mt-2">{selected.number}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-3 rounded-xl hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-all border border-transparent hover:border-[var(--border-color)] active:scale-95"><X size={24} /></button>
                        </div>

                        <div className="space-y-8">
                            {/* Summary Card */}
                            <div className="p-5 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] border border-[var(--border-color)]/50 shadow-sm relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 opacity-[0.03] scale-[2] pointer-events-none group-hover:rotate-12 transition-transform duration-1000"><ShoppingBag size={120} /></div>
                                <div className="flex justify-between items-start mb-10 relative z-10">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${STATUS_STYLE[selected.status].bg} ${STATUS_STYLE[selected.status].color} ${STATUS_STYLE[selected.status].border}`}>
                                        {STATUS_STYLE[selected.status].label}
                                    </span>
                                    <div className="text-right">
                                        <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1 opacity-50">Liquidação Estimada</p>
                                        <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tabular-nums tracking-tighter">{fmt(selected.totalAmount)}</p>
                                    </div>
                                </div>
                                <div className="space-y-6 relative z-10 border-t border-[var(--border-color)]/30 pt-8">
                                    <div className="flex items-center gap-4">
                                        <div className="kpi-icon bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/10 flex items-center justify-center"><Fingerprint size={20} /></div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50">Sincronização Institucional</p>
                                            <p className="text-xs font-black uppercase text-[var(--text-primary)] tracking-tight">VA-SCM-NODE-{selected.id.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed italic opacity-80 font-medium">
                                            "{selected.notes || 'Sem anotações estratégicas registadas para este protocolo de aquisição.'}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'Sourcing Partner', value: selected.supplier?.name, icon: <Building2 size={18} className="text-sky-400" /> },
                                    { label: 'Densidade SKU', value: (selected.items?.length || 0) + ' Linhas', icon: <Boxes size={18} className="text-indigo-400" /> },
                                    { label: 'Data Estimada', value: selected.expectedDate ? format(new Date(selected.expectedDate), 'dd MMM yyyy', { locale: pt }) : 'N/D', icon: <Calendar size={18} className="text-amber-400" /> },
                                    { label: 'Protocolo PG', value: 'Net-30 / SWIFT', icon: <CreditCard size={18} className="text-emerald-400" /> },
                                ].map((item: any, i) => (
                                    <div key={i} className="fluent-card p-5 border border-[var(--border-color)]/50 bg-[var(--bg-primary)]/30 rounded-[1.5rem] flex flex-col gap-5 hover:bg-[var(--bg-primary)]/50 transition-all group/item shadow-xs">
                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50 border-b border-[var(--border-color)]/20 pb-4">
                                            {item.icon} {item.label}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm uppercase text-[var(--text-primary)] group-hover/item:text-[var(--accent)] transition-colors truncate">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Line Items */}
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-3">
                                    <LayoutList size={18} className="text-[var(--accent)]" /> Manuscrito de Aquisição
                                </h4>
                                <div className="space-y-3">
                                    {selected.items?.map((item: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-5 bg-[var(--bg-primary)]/30 border border-[var(--border-color)]/30 rounded-[1.25rem] hover:border-[var(--accent)]/30 transition-all shadow-xs">
                                            <div className="flex items-center gap-5">
                                                <div className="kpi-icon bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 flex items-center justify-center text-[var(--accent)]"><Package size={20} /></div>
                                                <div>
                                                    <p className="text-[12px] font-black uppercase tracking-tight text-[var(--text-primary)]">{item.product?.name}</p>
                                                    <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-50">{item.quantity} UN × {fmt(item.unitCost)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-[var(--text-primary)] tabular-nums">{fmt(item.unitCost * item.quantity)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-10 flex gap-4">
                                <button className="flex-1 py-4 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-[1.25rem] font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-3 shadow-sm outline-none active:scale-95">
                                    <Receipt size={18} /> Exportar Ordem
                                </button>
                                <button className="flex-1 py-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 rounded-[1.25rem] font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-3 shadow-sm outline-none active:scale-95">
                                    <Trash2 size={18} /> Anular Protocolo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Creation Modal - Governed Form */}
            {modal && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 z-0 bg-[var(--text-primary)]/5 backdrop-blur-sm animate-in fade-in duration-500" onClick={() => setModal(false)} />
                    <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-color)]/30 w-full max-w-2xl rounded-[2.5rem] p-5 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col max-h-[95vh] no-scrollbar">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter leading-none flex items-center gap-4">
                                    Instanciar Ordem de Compra
                                </h2>
                                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-2 opacity-60">Protocolo de Aquisição Institucional & Provisionamento SCM</p>
                            </div>
                            <button onClick={() => setModal(false)} className="p-3 rounded-xl hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-all outline-none active:scale-95"><X size={24} /></button>
                        </div>

                        <form className="space-y-8 overflow-y-auto pr-2 no-scrollbar">
                            {/* Supplier Section */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60 flex items-center gap-2">
                                    <Building2 size={14} className="text-[var(--accent)]" /> Parceiro de Sourcing
                                </label>
                                <select className="w-full h-14 bg-[var(--bg-primary)] border border-[var(--border-color)] px-5 rounded-[1.25rem] text-sm font-bold text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all appearance-none cursor-pointer">
                                    <option value="">Seleccione um Fornecedor Homologado...</option>
                                    {suppliers.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60 flex items-center gap-2">
                                        <Calendar size={14} className="text-amber-500" /> Data Prevista
                                    </label>
                                    <input type="date" className="w-full h-14 bg-[var(--bg-primary)] border border-[var(--border-color)] px-5 rounded-[1.25rem] text-sm font-bold text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60 flex items-center gap-2">
                                        <CreditCard size={14} className="text-emerald-500" /> Protocolo PG
                                    </label>
                                    <select className="w-full h-14 bg-[var(--bg-primary)] border border-[var(--border-color)] px-5 rounded-[1.25rem] text-sm font-bold text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all appearance-none cursor-pointer">
                                        <option value="NET30">NET-30 Institutional</option>
                                        <option value="SWIFT">Transferência SWIFT</option>
                                        <option value="LOA">Carta de Crédito (LC)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Items Section Placeholder */}
                            <div className="p-4 sm:p-8 rounded-[2rem] border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center gap-4 bg-black/5 opacity-40 hover:opacity-100 transition-opacity cursor-pointer group/add">
                                <PlusCircle size={32} className="text-[var(--accent)] group-hover:scale-110 transition-transform" />
                                <p className="text-[11px] font-black uppercase tracking-widest">Adicionar Linhas de SKU ao Protocolo</p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60 flex items-center gap-2">
                                    <FileWarning size={14} className="text-rose-500" /> Notas de Aquisição
                                </label>
                                <textarea 
                                    rows={3}
                                    placeholder="Descreva a finalidade estratégica desta aquisição..."
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-6 rounded-[1.5rem] text-sm font-medium text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all italic placeholder:opacity-20"
                                />
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button type="button" onClick={() => setModal(false)} className="flex-1 h-14 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 outline-none">Descartar</button>
                                <button type="button" className="flex-[2] h-14 bg-[var(--accent)] text-white rounded-[1.25rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-[var(--accent)]/20 active:scale-95 transition-all outline-none border border-white/10">Validar & Commit Ordem</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Matrix Footer Note */}
            <div className="flex flex-col items-center gap-6 text-center pt-20 pb-10 opacity-30 group/footer">
                <div className="flex items-center gap-6 sm:gap-12">
                    {[ShoppingCart, ShieldCheck, Globe].map((I, i) => (
                        <div key={i} className="kpi-icon bg-white/5 flex items-center justify-center border border-white/10 group-hover/footer:border-[var(--accent)]/30 transition-all"><I size={18} /></div>
                    ))}
                </div>
                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4rem] italic font-mono">
                    va-scm-procurement_ledger // node-id: va_scm_ao_central
                </p>
            </div>
        </div>
    );
}
