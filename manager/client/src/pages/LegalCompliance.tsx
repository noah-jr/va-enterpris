import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ShieldCheck, Scale, FileText, Plus, Search,
    Filter, Download, MoreHorizontal,
    Clock, X, DollarSign, Loader2,
    Eye, Trash2,
    Zap, LayoutGrid, List, AlertTriangle, Building2,
    Gavel, History, Globe, Lock, Activity, BadgeCheck, Calendar
} from 'lucide-react';
import api from '../api';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import { Modal } from '../components/Modal';

const fmt = (v: number) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(v);

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: any; accent: string }> = {
    ACTIVE: { label: 'Vigente', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', icon: <ShieldCheck size={14} />, accent: 'bg-emerald-500' },
    EXPIRED: { label: 'Expirado', color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20', icon: <Clock size={14} />, accent: 'bg-rose-500' },
    REVIEW: { label: 'Em Revisão', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', icon: <FileText size={14} />, accent: 'bg-amber-500' },
    TERMINATED: { label: 'Terminado', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-500/10', border: 'border-slate-200 dark:border-slate-500/20', icon: <X size={14} />, accent: 'bg-slate-400' },
};

export default function LegalCompliance() {
    const queryClient = useQueryClient();
    const [view, setView] = useState<'TABLE' | 'GRID'>('TABLE');
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({
        title: '',
        entity: '',
        value: '',
        expiryDate: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    });

    const { data: contracts = [], isLoading } = useQuery({
        queryKey: ['legal-contracts'],
        queryFn: async () => (await api.get('/legal/contracts')).data
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/legal/contracts', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['legal-contracts'] });
            toast.success('Protocolo jurídico registado.');
            setIsModalOpen(false);
            setForm({ title: '', entity: '', value: '', expiryDate: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') });
        },
        onError: () => toast.error('Falha ao registar protocolo.')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/legal/contracts/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['legal-contracts'] });
            toast.success('Protocolo revogado com sucesso.');
        }
    });

    const filtered = contracts.filter((c: any) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.entity.toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total: contracts.length,
        active: contracts.filter((c: any) => c.status === 'ACTIVE' || !c.status).length,
        totalValue: contracts.reduce((acc: number, c: any) => acc + (c.value || 0), 0),
        expiringSoon: contracts.filter((c: any) => (c.status === 'ACTIVE' || !c.status) && new Date(c.expiryDate) < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)).length
    };

    return (
        <div className="space-y-8 pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">Jurídico & Compliance</h1>
                    <p className="text-sm text-[var(--text-secondary)] font-medium opacity-60">Governança corporativa, gestão de contratos e repositório legal VA-SEC.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1.5 rounded-2xl shadow-sm">
                        <button onClick={() => setView('TABLE')} className={`p-2.5 rounded-xl transition-all ${view === 'TABLE' ? 'bg-[var(--bg-primary)] text-[var(--accent)] shadow-sm border border-[var(--border-color)]/20' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}><List size={18} /></button>
                        <button onClick={() => setView('GRID')} className={`p-2.5 rounded-xl transition-all ${view === 'GRID' ? 'bg-[var(--bg-primary)] text-[var(--accent)] shadow-sm border border-[var(--border-color)]/20' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}><LayoutGrid size={18} /></button>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="premium-button-primary shadow-xl shadow-[var(--accent)]/20">
                        <Plus size={20} /> Novo Protocolo
                    </button>
                </div>
            </div>

            {/* KPI Summary Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                    { label: 'Exposição Contratual', value: stats.total.toString(), icon: <ShieldCheck size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                    { label: 'Valor em Matriz', value: fmt(stats.totalValue), icon: <DollarSign size={20} />, color: 'text-sky-600', bg: 'bg-sky-50/50' },
                    { label: 'Alertas Expiração', value: stats.expiringSoon.toString(), icon: <AlertTriangle size={20} />, color: stats.expiringSoon > 0 ? 'text-rose-600' : 'text-emerald-600', bg: 'bg-rose-50/50' },
                    { label: 'Compliance Index', value: '100%', icon: <Zap size={20} />, color: 'text-amber-600', bg: 'bg-amber-50/50' },
                ].map((kpi, i) => (
                    <div key={i} className="premium-card p-6 flex flex-col gap-4 group">
                        <div className={`w-12 h-12 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-[var(--border-color)]`}>
                            {kpi.icon}
                        </div>
                        <div>
                            <p className="premium-label !mb-1">{kpi.label}</p>
                            <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tighter tabular-nums">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Workspace Cluster */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    {/* Controls */}
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-2xl flex flex-col sm:flex-row items-center gap-4 shadow-sm">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Pesquisar por título contratual, entidade parceira ou n.º de protocolo..."
                                className="w-full bg-transparent border-none outline-none pl-12 pr-4 py-3 text-sm font-medium"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="py-40 flex flex-col items-center justify-center gap-6 text-[var(--text-secondary)] opacity-40">
                            <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
                            <span className="text-xs font-black uppercase tracking-widest">Validando Repositório Legal VA-SEC...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="premium-card py-40 flex flex-col items-center justify-center text-center opacity-30 border-2 border-dashed border-[var(--border-color)] rounded-[3rem]">
                            <Scale size={64} className="mb-6 opacity-20" />
                            <p className="text-xs font-black uppercase tracking-widest">Nenhum protocolo jurídico indexado</p>
                        </div>
                    ) : view === 'TABLE' ? (
                        <div className="premium-card overflow-hidden bg-[var(--bg-secondary)] border-t-8 border-t-[var(--accent)] group hover:shadow-2xl transition-all">
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="bg-[var(--bg-primary)]/50 border-b border-[var(--border-color)]">
                                        <tr>
                                            {['Contrato / Protocolo', 'Entidade / Outorgante', 'Vencimento', 'Valor Matriz', 'Status', ''].map(h => (
                                                <th key={h} className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-color)]/20">
                                        {filtered.map((c: any) => {
                                            const cfg = STATUS_CFG[c.status] || STATUS_CFG.ACTIVE;
                                            return (
                                                <tr key={c.id} className="hover:bg-[var(--bg-primary)] transition-all group/row cursor-default">
                                                    <td className="px-6 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)] group-hover/row:scale-110 transition-transform shadow-sm`}>
                                                                <FileText size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight leading-none mb-1.5">{c.title}</p>
                                                                <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase opacity-40 italic font-mono">ID: {c.id.slice(0, 8)}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <div className="flex items-center gap-3 text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight group-hover/row:text-[var(--accent)] transition-colors">
                                                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)]"><Building2 size={14} /></div>
                                                            {c.entity}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <div className="flex flex-col gap-1.5">
                                                            <p className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest opacity-80">{format(new Date(c.expiryDate), 'dd MMM yyyy', { locale: pt })}</p>
                                                            {new Date(c.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                                                                <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest animate-pulse">Crítico - 30 Dias</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 font-black text-[var(--text-primary)] text-sm tabular-nums tracking-tighter">{c.value ? fmt(c.value) : '—'}</td>
                                                    <td className="px-6 py-6">
                                                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black border w-fit ${cfg.color} ${cfg.bg} ${cfg.border} uppercase shadow-sm`}>
                                                            {cfg.icon} {cfg.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-6 text-right">
                                                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover/row:opacity-100 transition-all translate-x-4 group-hover/row:translate-x-0">
                                                            <button className="p-3 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all border border-transparent hover:border-[var(--border-color)]/50"><Eye size={18} /></button>
                                                            <button className="p-3 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-emerald-600 transition-all border border-transparent hover:border-[var(--border-color)]/50"><Download size={18} /></button>
                                                            <button onClick={() => confirm('Revogar este protocolo?') && deleteMutation.mutate(c.id)} className="p-3 rounded-xl hover:bg-rose-500/10 text-rose-600 transition-all border border-transparent hover:border-rose-500/20"><Trash2 size={18} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((c: any) => {
                                const cfg = STATUS_CFG[c.status] || STATUS_CFG.ACTIVE;
                                return (
                                    <div key={c.id} className="premium-card p-8 flex flex-col group hover:shadow-2xl transition-all border-b-8 border-b-[var(--border-color)]/10 hover:border-b-[var(--accent)]/30">
                                        <div className="flex items-center justify-between mb-10">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black border w-fit ${cfg.color} ${cfg.bg} ${cfg.border} uppercase tracking-widest shadow-sm`}>
                                                {cfg.icon} {cfg.label}
                                            </span>
                                            <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--accent)] group-hover:rotate-12 transition-transform shadow-inner"><FileText size={20} /></div>
                                        </div>
                                        <div className="mb-10">
                                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-2 opacity-50">Protocolo Corporativo</p>
                                            <h4 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight group-hover:text-[var(--accent)] transition-colors leading-tight line-clamp-2 h-14">{c.title}</h4>
                                        </div>
                                        <div className="space-y-5 mb-10">
                                            <div className="flex items-center gap-4 p-4 bg-[var(--bg-primary)]/50 rounded-2xl border border-[var(--border-color)]/30 group-hover:border-[var(--accent)]/30 transition-all shadow-inner">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] shadow-sm"><Building2 size={20} /></div>
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight truncate">{c.entity}</p>
                                                    <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-widest opacity-40">Entidade Externa</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center px-2">
                                                <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40">Valor Matriz</span>
                                                <span className="text-base font-black text-[var(--text-primary)] tabular-nums tracking-tighter">{c.value ? fmt(c.value) : 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-6 border-t border-[var(--border-color)]/30 mt-auto">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60">
                                                <Calendar size={16} className="text-rose-500" />
                                                {format(new Date(c.expiryDate), 'dd MMM yyyy')}
                                            </div>
                                            <button className="p-3 bg-[var(--bg-primary)] hover:bg-[var(--accent)] hover:text-white rounded-xl transition-all shadow-md group-hover:scale-110"><Eye size={18} /></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Vertical Sidebar Workspace */}
                <div className="space-y-8">
                    {/* Compliance Index Tile */}
                    <div className="premium-card p-10 border-l-4 border-l-amber-600 bg-amber-600/[0.04] relative overflow-hidden group shadow-xl">
                        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] opacity-80 leading-none">Governança</h4>
                            <div className="w-12 h-12 bg-amber-600/20 text-amber-600 rounded-xl shadow-inner flex items-center justify-center"><Gavel size={24} /></div>
                        </div>
                        <div className="text-6xl font-black text-amber-600 tracking-tighter tabular-nums mb-6 drop-shadow-sm group-hover:translate-x-2 transition-transform italic">A1+</div>
                        <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest leading-relaxed opacity-60 mb-12 relative z-10">Nível Maximo de Conformidade Jurídica e Protecção de Terminals VA-TRUST.</p>
                        <button className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl transition-all shadow-xl shadow-amber-600/20 active:scale-95 relative z-10">
                            Auditoria VA-SEC
                        </button>
                    </div>

                    {/* Operational Guardrails */}
                    <div className="premium-card p-8 group">
                        <h3 className="text-xs font-black text-[var(--text-primary)] mb-8 flex items-center gap-4 uppercase tracking-[0.2em] border-b border-[var(--border-color)]/30 pb-5 leading-none">
                            <Lock size={20} className="text-rose-500" /> Matriz Legal
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Criptografia', status: 'AES-512', icon: <ShieldCheck size={16} /> },
                                { label: 'Nó Assinatura', status: 'SYNC OK', icon: <Globe size={16} /> },
                                { label: 'Auditoria', status: 'ACTIVA', icon: <History size={16} /> },
                                { label: 'Sigilo GRC', status: 'ESTRITO', icon: <Scale size={16} /> }
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-[var(--bg-primary)]/50 border border-[var(--border-color)]/40 rounded-2xl group/item hover:border-[var(--accent)]/40 transition-all cursor-default relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent)] opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60 group-hover/item:opacity-100 transition-opacity flex items-center gap-3">
                                        {item.icon} {item.label}
                                    </span>
                                    <span className={`text-[10px] font-black text-[var(--accent)] uppercase tracking-widest`}>{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="premium-card p-10 bg-[var(--bg-primary)]/30 border border-dashed border-[var(--border-color)] flex flex-col items-center gap-6 text-center group shadow-inner">
                        <Scale size={40} className="text-[var(--text-muted)] opacity-20 rotate-12" />
                        <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-tight leading-relaxed opacity-40">
                            Base de dados jurídica mantida em infraestrutura redundante VA-SYNC para governança institucional.
                        </p>
                    </div>
                </div>
            </div>

            {/* MODAL: NOVO CONTRATO */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Registar Protocolo Legal"
                subtitle="VA-SEC Repository v4.0"
                type="CENTER"
                width="xl"
                icon={<Gavel size={24} className="text-[var(--accent)]" />}
            >
                <form 
                    onSubmit={(e) => { 
                        e.preventDefault(); 
                        createMutation.mutate(form); 
                    }} 
                    className="p-8 space-y-8"
                >
                    <div className="space-y-3">
                        <label className="premium-label">Título do Protocolo / Contrato</label>
                        <input 
                            required 
                            className="premium-input !text-lg !font-black uppercase" 
                            placeholder="Ex: Contrato de Prestação de Serviços Digitais"
                            value={form.title}
                            onChange={e => setForm({...form, title: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="premium-label">Entidade / Parceiro</label>
                            <input 
                                required 
                                className="premium-input" 
                                placeholder="Nome da Empresa ou Instituição"
                                value={form.entity}
                                onChange={e => setForm({...form, entity: e.target.value})}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="premium-label">Valor do Contrato (AOA)</label>
                            <input 
                                type="number"
                                className="premium-input !font-mono font-bold" 
                                placeholder="0.00"
                                value={form.value}
                                onChange={e => setForm({...form, value: e.target.value})}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="premium-label">Data de Expiração / Renovação</label>
                            <input 
                                type="date"
                                required 
                                className="premium-input" 
                                value={form.expiryDate}
                                onChange={e => setForm({...form, expiryDate: e.target.value})}
                            />
                        </div>
                        <div className="flex items-end">
                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl w-full flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner"><BadgeCheck size={20} /></div>
                                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-tight">Protocolo pronto para indexação VA-SEC</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 flex gap-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="premium-button-secondary flex-1">Cancelar</button>
                        <button type="submit" disabled={createMutation.isPending} className="premium-button-primary flex-[2] !bg-[var(--text-primary)] !text-[var(--bg-primary)]">
                            {createMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                            Efectivar Protocolo
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
