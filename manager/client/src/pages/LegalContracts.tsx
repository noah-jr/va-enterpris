import { useState } from 'react';
import { Gavel, FileText, Scale, ShieldAlert, Plus, Search, Clock, Calendar, History, Printer, Lock, AlertTriangle, FileSignature, Zap, Activity, ShieldCheck, Eye, Filter, Building, ArrowUpRight, Loader2, X, Bookmark, Key } from 'lucide-react';
import { SearchableSelect } from '../components/SearchableSelect';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Contract {
    id: string;
    title: string;
    companyEntity: string;
    value: number;
    status: 'ACTIVE' | 'RENEWAL' | 'LITIGATION' | 'EXPIRED' | 'DRAFT';
    createdAt : string;
    expiryDate: string;
    category: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

const STATUS_CONFIG: Record<Contract['status'], { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    ACTIVE: { label: 'ACTIVO', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: <ShieldCheck size={12} /> },
    RENEWAL: { label: 'RENOVAÇÃO', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', icon: <Clock size={12} /> },
    LITIGATION: { label: 'CONTENCIOSO', color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20', icon: <AlertTriangle size={12} /> },
    EXPIRED: { label: 'EXPIRADO', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', icon: <X size={12} /> },
    DRAFT: { label: 'RASCUNHO', color: 'text-sky-500', bg: 'bg-sky-500/10 border-sky-500/20', icon: <FileSignature size={12} /> },
};

export default function LegalContracts() {
    const [selected, setSelected] = useState<Contract | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState(false);

    const { data: legalData, isLoading } = useQuery({
        queryKey: ['legal-contracts'],
        queryFn: async () => {
            const res = await api.get('/legal/contracts');
            return res.data;        
        }
    });

    if (isLoading) return (
        <div className="py-40 flex flex-col items-center justify-center gap-6 opacity-40">
            <Loader2 size={48} className="animate-spin text-[var(--accent)]" />
            <p className="text-xs font-black uppercase tracking-[0.4em]">Sincronizando Nó de Governação Jurídica...</p>
        </div>
    );

    const contracts: Contract[] = legalData || [];

    const filtered = contracts.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.companyEntity.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-32 animate-fade-in">
            {/* Strategy Hub Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-4">
                        <Gavel size={36} className="text-[var(--accent)]" />
                        Repositório Jurídico
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] font-medium opacity-60 mt-1">Gestão centralizada de contratos, minutas e conformidade legal.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button className="premium-button-secondary py-4 px-6">
                        <FileSignature size={18} /> Nova Minuta
                    </button>
                    <button
                        onClick={() => setModal(true)}
                        className="premium-button-primary py-4 px-8 !bg-indigo-600 shadow-indigo-600/20"
                    >
                        <Plus size={20} /> Novo Contrato
                    </button>
                </div>
            </div>

            {/* Legal Defense & Asset KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Contratos Ativos', value: contracts.length, sub: 'Vigência Validada', icon: <FileText size={22} />, color: 'text-sky-600', bg: 'bg-sky-50/50' },
                    { label: 'Alertas de Renovação', value: contracts.filter(c => c.status === 'RENEWAL').length, sub: 'Ciclo T-Minus 30', icon: <Clock size={22} />, color: 'text-amber-600', bg: 'bg-amber-50/50' },
                    { label: 'Exposição Legal', value: contracts.filter(c => c.status === 'LITIGATION').length, sub: 'Pontos de Contencioso', icon: <Scale size={22} />, color: 'text-rose-600', bg: 'bg-rose-50/50' },
                    { label: 'Score Compliance', value: '100%', sub: 'Saúde Institucional', icon: <ShieldCheck size={22} />, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                ].map((kpi, i) => (
                    <div key={i} className="premium-card p-6 flex flex-col gap-6 group">
                        <div className={`w-14 h-14 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center shadow-sm border border-[var(--border-color)] group-hover:rotate-12 transition-transform`}>
                            {kpi.icon}
                        </div>
                        <div>
                            <p className="premium-label !mb-1">{kpi.label}</p>
                            <p className="text-2xl font-black text-[var(--text-primary)] tracking-tighter tabular-nums">{kpi.value}</p>
                            <p className="text-[10px] font-bold text-[var(--accent)] mt-1 opacity-60 uppercase tracking-widest italic">{kpi.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Contract Ledger Workspace */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="premium-card !p-0 overflow-hidden">
                        <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30 gap-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">Livro de Contratos</h2>
                            <div className="relative flex-1 max-w-md w-full">
                                <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Localizar contrato ou entidade..."
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] py-3 pl-14 pr-6 rounded-[1.5rem] text-xs font-medium outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                                />
                            </div>
                            <button className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all shadow-sm"><Filter size={18} /></button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[var(--bg-primary)]/50 border-b border-[var(--border-color)]/20">
                                    <tr>
                                        {['Identidade / Meta', 'Entidade Externa', 'Valor Nominal', 'Estado', ''].map(h => (
                                            <th key={h} className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]/10">
                                    {filtered.map((c) => {
                                        const s = STATUS_CONFIG[c.status];
                                        return (
                                            <tr key={c.id} onClick={() => setSelected(c)} className="hover:bg-[var(--bg-primary)]/40 transition-all cursor-pointer group">
                                                <td className="px-8 py-8">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:scale-110 transition-all shadow-sm">
                                                            <Bookmark size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-all uppercase tracking-tight">{c.title}</p>
                                                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                                                ID: {c.id.slice(-8)} • <span className="text-rose-500/70">EXP: {format(new Date(c.expiryDate), 'dd MMM yyyy')}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[8px] font-black text-[var(--text-muted)] uppercase">EXT</div>
                                                        <span className="text-xs font-bold text-[var(--text-secondary)]">{c.companyEntity}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <p className="text-sm font-black text-[var(--text-primary)] tabular-nums tracking-tighter">{c.value > 0 ? new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(c.value) : 'N/A'}</p>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest shadow-sm ${s.bg} ${s.color} group-hover:scale-105 transition-transform`}>
                                                        {s.icon} {s.label}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-8 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button className="p-2.5 rounded-xl bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-[var(--accent)] transition-all"><Eye size={16} /></button>
                                                        <button className="p-2.5 rounded-xl bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-[var(--accent)] transition-all"><Printer size={16} /></button>
                                                        <button className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"><ArrowUpRight size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Strategy Sidebar */}
                <div className="space-y-8">
                    <div className="premium-card p-8 bg-rose-600/5 border-l-4 border-l-rose-600 rounded-3xl group relative overflow-hidden">
                        <div className="absolute top-[-20px] right-[-20px] p-6 opacity-5 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                            <Gavel size={100} />
                        </div>
                        <div className="flex items-center gap-4 mb-8">
                            <ShieldAlert size={22} className="text-rose-600" />
                            <h2 className="text-[10px] font-black uppercase text-[var(--text-primary)] tracking-[0.2em]">Contencioso Activo</h2>
                        </div>
                        <div className="space-y-4 relative z-10">
                            {[
                                { case: 'Impugnação Fiscal - Cluster Alpha', alert: 'Prioridade Alta', date: 'T-Minus 12 Dias', color: 'text-rose-600', bg: 'bg-rose-600/10' },
                                { case: 'Mediação Laboral - Sul', alert: 'Risco Médio', date: 'T-Minus 24 Dias', color: 'text-amber-600', bg: 'bg-amber-600/10' },
                            ].map((l, i) => (
                                <div key={i} className="p-5 bg-[var(--bg-primary)]/80 backdrop-blur-sm rounded-2xl border border-[var(--border-color)] hover:border-rose-300 transition-all cursor-pointer group/item shadow-sm">
                                    <p className="text-[11px] font-black text-[var(--text-primary)] uppercase leading-tight mb-3 group-hover/item:text-rose-600 transition-colors">{l.case}</p>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${l.bg} ${l.color}`}>{l.alert}</span>
                                        <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase">{l.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="premium-card p-8 bg-indigo-600 text-white rounded-3xl group relative overflow-hidden border-none shadow-xl shadow-indigo-600/20">
                        <div className="absolute top-[-20px] right-[-20px] p-6 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                            <Lock size={100} />
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <Lock size={20} className="text-white/80" />
                            <h2 className="text-[10px] font-black uppercase text-white tracking-[0.3em]">Arquivo Seguro</h2>
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed font-medium mb-10 italic">
                            Protocolo de segurança activo. Todos os documentos são encriptados e assinados digitalmente para garantir integridade soberana.
                        </p>
                        <button className="w-full bg-white text-indigo-600 py-4 rounded-[1.5rem] text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all tracking-widest">
                            Aceder Cofre
                        </button>
                    </div>

                    <div className="premium-card p-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2.5rem] flex flex-col gap-6 group hover:border-indigo-500 transition-all cursor-pointer shadow-sm">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">Biblioteca Regulatória</h4>
                            <ArrowUpRight size={20} className="text-[var(--text-muted)] group-hover:text-indigo-600 transition-all" />
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed italic opacity-70">
                            Sincronização em tempo real com o <span className="font-bold text-[var(--text-primary)]">Diário da República</span>. Monitores activos para novas leis fiscais ou societárias.
                        </p>
                        <div className="h-1.5 w-full bg-[var(--bg-primary)] rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-indigo-600 w-3/4 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Contract Dossier - Side Drawer */}
            {selected && (
                <div className="fixed inset-0 z-[3000] flex justify-end">
                    <div className="absolute inset-0 z-0 bg-[var(--text-primary)]/10 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelected(null)} />
                    <div className="relative z-10 w-full max-w-2xl bg-[var(--bg-secondary)] h-full overflow-y-auto p-12 sm:p-20 shadow-premium animate-in slide-in-from-right duration-700 no-scrollbar">
                        <div className="flex items-center justify-between mb-16">
                            <div className="flex items-center gap-4">
                                <History size={20} className="text-indigo-600" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Ciclo de Vida do Contrato #_{selected.id.slice(-8).toUpperCase()}</h3>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-4 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)] transition-all">
                                <X size={24} className="text-[var(--text-muted)]" />
                            </button>
                        </div>

                        <div className="space-y-12">
                            <div className="p-10 rounded-[3.5rem] bg-[var(--bg-primary)]/50 border-2 border-dashed border-[var(--border-color)] flex flex-col items-center text-center group relative overflow-hidden shadow-inner">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-[4] group-hover:rotate-12 transition-transform duration-1000 select-none grayscale"><Bookmark size={32} /></div>

                                <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-600/10 text-indigo-600 flex items-center justify-center mb-10 border border-indigo-600/20 shadow-inner group-hover:scale-110 transition-transform">
                                    <Gavel size={48} />
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg border border-[var(--border-color)] inline-block mb-8 ${STATUS_CONFIG[selected.status].bg} ${STATUS_CONFIG[selected.status].color}`}>
                                    {STATUS_CONFIG[selected.status].label}
                                </span>
                                <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tight leading-tight">{selected.title}</h2>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-4 opacity-50">Dossiê Estratégico / Categoria: {selected.category}</p>

                                <div className="w-full h-px bg-[var(--border-color)] my-12" />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full text-left">
                                    <div className="premium-card !p-8 border border-indigo-500/10 bg-indigo-500/5 shadow-inner flex flex-col gap-4">
                                        <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-3"><Activity size={14} /> Equidade do Nó</p>
                                        <p className="text-2xl font-black text-[var(--text-primary)] tracking-tighter tabular-nums">{selected.value > 0 ? new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(selected.value) : 'N/A'}</p>
                                    </div>
                                    <div className="premium-card !p-8 border border-emerald-500/10 bg-emerald-500/5 shadow-inner flex flex-col gap-4">
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-3"><ShieldCheck size={14} /> Prioridade</p>
                                        <p className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">{selected.priority}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                    { label: 'Jurisdição Externa', value: selected.companyEntity, icon: <Building size={18} className="text-indigo-600" /> },
                                    { label: 'Data de Ingestão', value: format(new Date(selected.createdAt), 'dd MMMM yyyy', { locale: pt }), icon: <Calendar size={18} className="text-sky-600" /> },
                                    { label: 'Terminação Nó', value: format(new Date(selected.expiryDate), 'dd MMMM yyyy', { locale: pt }), icon: <Clock size={18} className="text-rose-600" /> },
                                    { label: 'Nó ID Soberano', value: selected.id, icon: <Key size={18} className="text-amber-600" /> },
                                ].map((item, i) => (
                                    <div key={i} className="premium-card p-6 flex flex-col gap-5 hover:bg-[var(--bg-primary)]/50 transition-all border border-[var(--border-color)] shadow-sm">
                                        <div className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest flex items-center gap-4">
                                            {item.icon} {item.label}
                                        </div>
                                        <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-12 grid grid-cols-2 gap-6">
                                <button className="premium-button-secondary py-6 px-4 !rounded-[2rem]">
                                    <Printer size={20} /> Versão Física
                                </button>
                                <button className="premium-button-primary py-6 px-4 !rounded-[2rem] !bg-indigo-600 shadow-indigo-600/20">
                                    <Zap size={20} /> Re-Estratégia
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ingestion Modal */}
            {modal && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 sm:p-12">
                    <div className="absolute inset-0 z-0 bg-[var(--text-primary)]/10 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setModal(false)} />
                    <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-color)] w-full max-w-2xl rounded-[3rem] p-12 sm:p-16 shadow-premium animate-in zoom-in-95 duration-500 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-transparent via-indigo-600 to-transparent opacity-50" />

                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h2 className="text-2xl font-black uppercase text-[var(--text-primary)] tracking-tight">Ingestão de Contrato</h2>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-2">Segurança Jurídica Institucional / Node Deployment</p>
                            </div>
                            <button onClick={() => setModal(false)} className="p-4 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)] transition-all">
                                <X size={24} className="text-[var(--text-muted)]" />
                            </button>
                        </div>

                        <div className="space-y-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="premium-label pl-4">Nomenclatura do Acordo</label>
                                    <input placeholder="Ex: Protocolo de Colaboração Estratégica Hub-X..." className="premium-input !py-5" />
                                </div>
                                <div className="col-span-2">
                                    <label className="premium-label pl-4">Entidade Externa Autoritária</label>
                                    <input placeholder="Ex: Ministério das Telecomunicações e TI..." className="premium-input !py-5" />
                                </div>
                                <div>
                                    <label className="premium-label pl-4">Valor Nominal (AOA)</label>
                                    <input type="number" placeholder="0.00" className="premium-input !py-4" />
                                </div>
                                <div className="space-y-2">
                                    <label className="premium-label pl-4">Categoria de Governação</label>
                                    <SearchableSelect 
                                        options={[
                                            { label: 'OPERACIONAL COMERCIAL', value: 'Operacional Comercial' },
                                            { label: 'JURÍDICO INSTITUCIONAL', value: 'Jurídico Institucional' },
                                            { label: 'FORENSE FISCAL', value: 'Forense Fiscal' },
                                            { label: 'NDA / CONFIDENCIAL', value: 'NDA / Confidencial' }
                                        ]}
                                        value=""
                                        onChange={() => {}}
                                    />
                                </div>
                            </div>

                            <div className="pt-8 flex gap-4">
                                <button onClick={() => setModal(false)} className="premium-button-secondary flex-1 py-5">Descartar</button>
                                <button className="premium-button-primary flex-[2] py-5 !bg-indigo-600 shadow-indigo-600/20">
                                    <ShieldCheck size={20} /> Commit para Vault
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
