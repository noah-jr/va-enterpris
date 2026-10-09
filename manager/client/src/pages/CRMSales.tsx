import { useState } from 'react';
import { 
    UserCheck, 
    PhoneCall, 
    Mail, 
    Plus, 
    TrendingUp, 
    Search, 
    X, 
    Building2, 
    MessageSquare, 
    DollarSign, 
    Loader2, 
    MoreHorizontal, 
    Activity, 
    Zap, 
    Globe, 
    BadgeCheck,
    LayoutGrid, 
    List,
    PieChart,
    ArrowUpRight,
    Target,
    BarChart3,
    Calendar,
    Users,
    FileText,
    TrendingDown,
    Clock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { toast } from 'sonner';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { SearchableSelect } from '../components/SearchableSelect';

import { formatCurrency } from '../utils/format';

const fmt = (v: number) => formatCurrency(v);

type Stage = 'PROSPECTION' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED';

interface Lead {
    id: string;
    name: string;
    stage: Stage;
    status: 'HOT' | 'WARM' | 'COLD';
    value: number;
    contact: string;
    email: string;
    probability: number;
    notes: string;
    company: string;
    lastContact: string;
}

const STAGE_CONFIG: Record<Stage, { label: string; color: string; bg: string; border: string; accent: string }> = {
    PROSPECTION: { label: 'Prospecção', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', accent: 'bg-slate-400' },
    QUALIFIED: { label: 'Qualificado', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', accent: 'bg-sky-400' },
    PROPOSAL: { label: 'Proposta', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', accent: 'bg-indigo-400' },
    NEGOTIATION: { label: 'Negociação', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', accent: 'bg-amber-400' },
    CLOSED: { label: 'Fechado', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'bg-emerald-400' },
};

const STATUS_COLOR: Record<string, string> = {
    HOT: 'bg-rose-500 text-white shadow-sm',
    WARM: 'bg-amber-500 text-white shadow-sm',
    COLD: 'bg-slate-500 text-white',
};

export default function CRMSales() {
    const queryClient = useQueryClient();
    const [selected, setSelected] = useState<Lead | null>(null);
    const [modal, setModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState<'KANBAN' | 'LIST'>('KANBAN');
    const [page, setPage] = useState(1);
    const [form, setForm] = useState({ 
        name: '', 
        company: '', 
        stage: 'PROSPECTION' as Stage, 
        value: '', 
        probability: 50, 
        notes: '', 
        contact: '', 
        email: '',
        nif: '',
        position: '',
        expectedCloseDate: ''
    });

    const itemsPerPage = 8;

    const { data, isLoading } = useQuery({
        queryKey: ['crm-pipeline'],
        queryFn: async () => (await api.get('/crm/pipeline')).data
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/crm/leads', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crm-pipeline'] });
            setModal(false);
            setForm({ 
                name: '', 
                company: '', 
                stage: 'PROSPECTION', 
                value: '', 
                probability: 50, 
                notes: '', 
                contact: '', 
                email: '',
                nif: '',
                position: '',
                expectedCloseDate: ''
            });
            toast.success('Lead integrado no pipeline institucional.');
        }
    });

    const leads: Lead[] = data?.leads || [];
    const filteredLeads = leads.filter(l =>
        (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.company?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const paginatedLeads = filteredLeads.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

    const columns = [
        {
            header: 'Oportunidade',
            accessor: (l: Lead) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)] font-black text-xs shadow-sm shadow-inner uppercase">
                        {l.name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-black text-sm uppercase leading-tight">{l.name}</p>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] opacity-50 uppercase tracking-widest">{l.company || 'Consumidor Final'}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Fase Comercial',
            accessor: (l: Lead) => (
                <span className={`px-3 py-1 rounded-[var(--radius-sm)] text-[9px] font-black uppercase tracking-widest border ${STAGE_CONFIG[l.stage].bg} ${STAGE_CONFIG[l.stage].color} ${STAGE_CONFIG[l.stage].border}`}>
                    {STAGE_CONFIG[l.stage].label}
                </span>
            )
        },
        { header: 'Volume Negócio', accessor: (l: Lead) => <span className="font-black tabular-nums text-sm">{fmt(l.value)}</span> },
        { 
            header: 'Probabilidade', 
            accessor: (l: Lead) => (
                <div className="flex items-center gap-3 min-w-[100px]">
                    <div className="flex-1 h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-color)]/20 shadow-inner">
                        <div className={`h-full transition-all duration-700 ${l.probability > 70 ? 'bg-emerald-500' : l.probability > 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${l.probability}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-[var(--text-secondary)] tabular-nums">{l.probability}%</span>
                </div>
            )
        },
        {
            header: '',
            accessor: (l: Lead) => (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setSelected(l); }} className="p-2 rounded-lg bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--accent)] border border-[var(--border-color)] transition-all">
                        <ArrowUpRight size={16} />
                    </button>
                </div>
            ),
            className: "text-right"
        }
    ];

    return (
        <div className="space-y-8 pb-20 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Célula de Vendas CRM</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Monitorização de pipelines, prospecção e taxa de conversão institucional.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1 rounded-[var(--radius-md)] shadow-sm">
                        <button onClick={() => setView('KANBAN')} className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${view === 'KANBAN' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
                            <LayoutGrid size={16} />
                        </button>
                        <button onClick={() => setView('LIST')} className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${view === 'LIST' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
                            <List size={16} />
                        </button>
                    </div>
                    <button onClick={() => setModal(true)} className="premium-button-primary">
                        <Plus size={18} /> Nova Oportunidade
                    </button>
                </div>
            </div>

            {/* Predictive Pipeline KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="premium-card p-4 bg-indigo-600 text-white border-none shadow-lg flex flex-col justify-between">
                    <div>
                        <p className="text-xs text-indigo-100/70 mb-0.5">Forecast Preditivo</p>
                        <p className="text-base font-bold tabular-nums leading-tight">{fmt((data?.totalPipeline || 0) * 0.65)}</p>
                    </div>
                    <p className="text-[10px] font-bold text-indigo-200 mt-2">Probabilidade: 65%</p>
                </div>

                {[
                    { label: 'Pipeline Bruto', value: fmt(data?.totalPipeline || 0), icon: <BarChart3 size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                    { label: 'Taxa Conversão', value: '24.8%', icon: <Zap size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                    { label: 'Ticket Médio', value: fmt(data?.avgTicket || 0), icon: <BadgeCheck size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
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

            {/* View Switching */}
            {view === 'KANBAN' ? (
                <div className="space-y-6">
                    <div className="bg-[var(--bg-secondary)] p-2 rounded-xl border border-[var(--border-color)] shadow-sm">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                            <input 
                                type="text"
                                placeholder="Pesquisar leads ou empresas..."
                                className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar">
                        {(Object.entries(STAGE_CONFIG) as [Stage, any][]).map(([stage, cfg]) => {
                            const stageLeads = filteredLeads.filter(l => l.stage === stage);
                            const stageValue = stageLeads.reduce((s, l) => s + l.value, 0);

                            return (
                                <div key={stage} className="flex flex-col gap-4 min-w-[320px] flex-shrink-0 animate-slide-up">
                                    <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] shadow-sm flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${cfg.accent} shadow-sm animate-pulse`} />
                                            <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest opacity-60">{cfg.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-[var(--text-muted)] tabular-nums">{fmt(stageValue)}</span>
                                            <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--accent)]">{stageLeads.length}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 min-h-[500px]">
                                        {stageLeads.map(lead => (
                                            <div key={lead.id} onClick={() => setSelected(lead)} className="premium-card p-6 cursor-pointer group">
                                                <div className="flex items-start justify-between mb-4">
                                                    <span className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${STATUS_COLOR[lead.status]}`}>{lead.status}</span>
                                                    <button className="p-1 opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--accent)] transition-all"><MoreHorizontal size={14} /></button>
                                                </div>

                                                <h4 className="text-sm font-black text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-2 uppercase tracking-tight">{lead.name}</h4>
                                                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest opacity-50 mb-6 flex items-center gap-2">
                                                    <Building2 size={12} className="text-[var(--accent)]/50" /> {lead.company || 'Investidor Independente'}
                                                </p>

                                                <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between mt-auto">
                                                    <p className="text-sm font-black tabular-nums">{fmt(lead.value)}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black text-emerald-600 tabular-nums">{lead.probability}%</span>
                                                        <div className="w-12 h-1 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-color)]/20">
                                                            <div className="h-full bg-emerald-500 opacity-60" style={{ width: `${lead.probability}%` }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <DataTable 
                    data={paginatedLeads}
                    columns={columns}
                    isLoading={isLoading}
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={filteredLeads.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setPage}
                    onSearchChange={setSearchTerm}
                    searchValue={searchTerm}
                    onRowClick={setSelected}
                />
            )}

            {/* Painel Lateral de Detalhes do Lead */}
            <Modal 
                isOpen={!!selected} 
                onClose={() => setSelected(null)} 
                title={selected?.name || ''} 
                subtitle={`Pipeline Comercial · Ref: #${selected?.id.slice(0, 8)}`} 
                type="SIDE"
                width="lg"
                icon={<UserCheck size={24} className="text-[var(--accent)]" />}
            >
                {selected && (
                    <div className="p-4 sm:p-8 space-y-10 flex-1 overflow-y-auto no-scrollbar">
                        <div className="flex items-center justify-center">
                            <span className={`px-5 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${STAGE_CONFIG[selected.stage].bg} ${STAGE_CONFIG[selected.stage].color} ${STAGE_CONFIG[selected.stage].border}`}>
                                {STAGE_CONFIG[selected.stage].label}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="premium-card p-6 flex flex-col gap-3 group">
                                <div className="p-2 w-fit rounded-[var(--radius-sm)] bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--accent)]">
                                    <DollarSign size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Volume Negócio</p>
                                    <p className="text-lg font-black text-[var(--text-primary)] tabular-nums">{fmt(selected.value)}</p>
                                </div>
                            </div>
                            <div className="premium-card p-6 flex flex-col gap-3 group">
                                <div className="p-2 w-fit rounded-[var(--radius-sm)] bg-[var(--bg-primary)] border border-[var(--border-color)] text-emerald-600">
                                    <Zap size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Probabilidade</p>
                                    <p className="text-lg font-black text-emerald-600 tabular-nums">{selected.probability}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] mb-4 px-2 border-l-2 border-[var(--accent)] pl-4">Atividade & Engagement</h4>
                            <div className="space-y-4">
                                {[
                                    { type: 'CALL', date: 'Hoje, 09:45', desc: 'Qualificação técnica realizada.', icon: <PhoneCall size={14} />, color: 'text-sky-500' },
                                    { type: 'EMAIL', date: 'Ontem, 14:20', desc: 'Envio de proposta comercial v2.', icon: <Mail size={14} />, color: 'text-indigo-500' },
                                    { type: 'MEETING', date: '07 Abr 2026', desc: 'Reunião de alinhamento com Board.', icon: <Users size={14} />, color: 'text-amber-500' },
                                ].map((act, i) => (
                                    <div key={i} className="flex gap-4 relative">
                                        {i < 2 && <div className="absolute left-[19px] top-10 w-px h-8 bg-[var(--border-color)] opacity-30" />}
                                        <div className={`w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]/50 flex items-center justify-center ${act.color} shadow-sm z-10 animate-fade-in`}>
                                            {act.icon}
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40">{act.date}</span>
                                                <span className="text-[8px] font-black text-[var(--accent)] uppercase tracking-widest bg-[var(--bg-secondary)] px-2 py-0.5 rounded border border-[var(--border-color)]">{act.type}</span>
                                            </div>
                                            <p className="text-[11px] font-bold text-[var(--text-primary)]">{act.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="premium-card p-8 border-dashed bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)] group">
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] flex items-center gap-2"><MessageSquare size={14} /> Intelligence Notes</h4>
                                <Clock size={16} className="text-[var(--text-secondary)] opacity-20" />
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic opacity-80 border-l-2 border-[var(--accent)]/30 pl-4 py-1">
                                "{selected.notes || 'Nenhum insight estratégico registrado.'}"
                            </p>
                        </div>

                        <div className="pt-8 border-t border-[var(--border-color)] flex gap-4">
                            <button className="premium-button-secondary flex-1 px-2 py-5">Registrar Atividade</button>
                            <button className="premium-button-primary flex-[2] py-5">
                                <Zap size={18} /> Avançar Pipeline
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal de Nova Oportunidade */}
            <Modal
                isOpen={modal}
                onClose={() => setModal(false)}
                title="Nova Oportunidade"
                subtitle="Pipelines de Crescimento"
                type="CENTER"
                width="xl"
                icon={<BadgeCheck size={24} className="text-[var(--accent)]" />}
            >
                <form onSubmit={e => { e.preventDefault(); createMutation.mutate({ ...form, status: 'WARM' }); }} className="p-4 sm:p-8 space-y-6">
                    <div>
                        <label className="premium-label">Nome do Lead / Entidade</label>
                        <input required placeholder="Ex: João Manuel ou Sonangol..." className="premium-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="premium-label">Empresa</label>
                            <input placeholder="Ex: Grupo Carrinho" className="premium-input" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
                        </div>
                        <div>
                            <label className="premium-label">Fase Comercial</label>
                            <SearchableSelect 
                                options={Object.entries(STAGE_CONFIG).map(([k, v]) => ({ label: v.label.toUpperCase(), value: k }))}
                                value={form.stage}
                                onChange={val => setForm(p => ({ ...p, stage: val as Stage }))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="premium-label">Valor Estimado (AOA)</label>
                            <input required type="number" className="premium-input" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} />
                        </div>
                        <div>
                            <label className="premium-label">Probabilidade ({form.probability}%)</label>
                            <input type="range" min="0" max="100" className="w-full h-1 mt-4 accent-[var(--accent)] cursor-pointer" value={form.probability} onChange={e => setForm(p => ({ ...p, probability: parseInt(e.target.value) }))} />
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={() => setModal(false)} className="premium-button-secondary flex-1">Cancelar</button>
                        <button type="submit" disabled={createMutation.isPending} className="premium-button-primary flex-[2]">
                            {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={18} />} 
                            Consolidar prospecção
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
