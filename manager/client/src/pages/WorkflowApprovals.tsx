import { useState, useEffect, type ReactNode } from 'react'; // Fixed syntax error if any
import { 
    CheckCircle2, Clock, AlertCircle, Plus, X, User, ThumbsUp, ThumbsDown, 
    Loader2, Calendar, Briefcase, DollarSign, Building, FileText, 
    ChevronRight, Search, Flame, Layers, Activity, ShieldCheck,
    Workflow, Filter, GitMerge
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { format } from 'date-fns';

type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION';
type RequestType = 'EXPENSE' | 'LEAVE' | 'PURCHASE' | 'OVERTIME' | 'TRAVEL' | 'CONTRACT' | 'HIRING';

interface ApprovalStep {
    id: string;
    role: string;
    approverName: string;
    status: ApprovalStatus;
    decidedAt?: string;
    comment?: string;
}

interface ApprovalRequest {
    id: string;
    title: string;
    type: RequestType;
    requester: string;
    department: string;
    amount?: number;
    createdAt: string;
    status: ApprovalStatus;
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    description: string;
    steps: ApprovalStep[];
}

const fmtAOA = (v: number) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(v);

const TYPE_CONFIG: Record<RequestType, { label: string; color: string; bg: string; icon: any }> = {
    EXPENSE: { label: 'Reembolso', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: DollarSign },
    LEAVE: { label: 'Ausência/Férias', color: 'text-sky-500', bg: 'bg-sky-500/10', icon: Calendar },
    PURCHASE: { label: 'Requisição Compra', color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: Briefcase },
    OVERTIME: { label: 'Horas Extra', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: Clock },
    TRAVEL: { label: 'Viagem Serviço', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: Activity },
    CONTRACT: { label: 'Contrato Legal', color: 'text-violet-500', bg: 'bg-violet-500/10', icon: FileText },
    HIRING: { label: 'Recrutamento', color: 'text-rose-500', bg: 'bg-rose-500/10', icon: User },
};

const PRIORITY_STYLE: Record<string, string> = {
    LOW: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
    NORMAL: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    HIGH: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    URGENT: 'text-white bg-rose-600 border-rose-600 shadow-lg shadow-rose-500/20',
};

const STATUS_CONFIG: Record<ApprovalStatus, { label: string; color: string; bg: string; icon: any }> = {
    PENDING: { label: 'Pendente', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock },
    APPROVED: { label: 'Aprovado', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
    REJECTED: { label: 'Rejeitado', color: 'text-rose-500', bg: 'bg-rose-500/10', icon: AlertCircle },
    REVISION: { label: 'Em Revisão', color: 'text-sky-500', bg: 'bg-sky-500/10', icon: Activity },
};

export default function WorkflowApprovals() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<'ALL' | ApprovalStatus>('ALL');
    const [selected, setSelected] = useState<ApprovalRequest | null>(null);
    const [modal, setModal] = useState(false);
    const [comment, setComment] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [form, setForm] = useState({ 
        title: '', 
        type: 'EXPENSE' as RequestType, 
        description: '', 
        amount: '', 
        priority: 'NORMAL', 
        department: 'Geral',
        requester: 'Administrador'
    });

    const { data: requestsData = [], isLoading } = useQuery({
        queryKey: ['approvals'],
        queryFn: async () => (await api.get('/approvals')).data as ApprovalRequest[]
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/approvals', {
            ...data,
            steps: [
                { role: 'Responsável Directo', name: 'Sistema' },
                { role: 'Direcção Financeira', name: 'Pendente' }
            ]
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['approvals'] });
            setModal(false);
            setForm({ 
                title: '', 
                type: 'EXPENSE', 
                description: '', 
                amount: '', 
                priority: 'NORMAL', 
                department: 'Geral',
                requester: 'Administrador'
            });
            toast.success('Solicitação enviada para o fluxo de aprovação.');
        }
    });

    const decisionMutation = useMutation({
        mutationFn: ({ stepId, status, comment }: { stepId: string, status: ApprovalStatus, comment: string }) =>
            api.patch(`/approvals/steps/${stepId}`, { status, comment, approverName: 'Diretor Executivo' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['approvals'] });
            setSelected(null);
            setComment('');
            toast.success('Decisão registada com sucesso.');
        }
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(form);
    };

    const filtered = (filter === 'ALL' ? requestsData : requestsData.filter(r => r.status === filter))
        .filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.requester.toLowerCase().includes(searchTerm.toLowerCase()));

    const kpis = [
        { label: 'Pendentes', value: requestsData.filter(r => r.status === 'PENDING').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Aprovados', value: requestsData.filter(r => r.status === 'APPROVED').length, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Urgentes', value: requestsData.filter(r => r.priority === 'URGENT').length, icon: Flame, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        { label: 'Total', value: requestsData.length, icon: Layers, color: 'text-[var(--accent)]', bg: 'bg-[var(--accent)]/10' },
    ];

    return (
        <div className="space-y-6 pb-8 text-left">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight italic flex items-center gap-3">
                        <Workflow className="text-[var(--accent)]" size={32} />
                        Fluxos de Aprovação
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] font-medium opacity-60">Gestão de protocolos e governança de decisões institucionais.</p>
                </div>

                <button
                    onClick={() => setModal(true)}
                    className="premium-button-primary w-full md:w-auto justify-center"
                >
                    <Plus size={20} /> Nova Solicitação
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, i) => (
                    <div key={i} className="premium-card p-6 flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                            <h3 className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest opacity-60">{kpi.label}</h3>
                            <div className={`p-2 rounded-xl ${kpi.bg} ${kpi.color}`}>
                                <kpi.icon size={18} />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-black tracking-tight text-[var(--text-primary)]">{kpi.value.toString().padStart(2, '0')}</p>
                            <p className={`text-[10px] font-bold uppercase tracking-tight mt-1 flex items-center gap-2 ${kpi.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${kpi.bg.replace('/10', '')} animate-pulse`} />
                                Monitorização Activa
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="premium-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 w-full">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Pesquisar por título, solicitante ou ID..."
                        className="premium-input pl-11 py-2 w-full"
                    />
                </div>
                <div className="flex bg-[var(--bg-primary)] p-1 rounded-[var(--radius-sm)] border border-[var(--border-color)] overflow-x-auto w-full sm:w-auto no-scrollbar">
                    {(['ALL', 'PENDING', 'APPROVED', 'REVISION', 'REJECTED'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}
                        >
                            {f === 'ALL' ? 'Geral' : STATUS_CONFIG[f].label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex items-center justify-center gap-3 py-32 text-[var(--text-muted)]">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-sm">A carregar fluxos...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="premium-card py-20 flex flex-col items-center justify-center opacity-40 text-center">
                        <GitMerge size={48} className="mb-4 text-[var(--text-muted)]" />
                        <h3 className="text-sm font-black uppercase tracking-widest">Sem protocolos activos</h3>
                        <p className="text-[10px] font-medium mt-2">Nenhum fluxo de decisão encontrado para os filtros seleccionados.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filtered.map(req => {
                            const T = TYPE_CONFIG[req.type];
                            const S = STATUS_CONFIG[req.status];
                            const Icon = T.icon;
                            const progress = Math.round((req.steps.filter(s => s.status !== 'PENDING').length / req.steps.length) * 100);

                            return (
                                <div 
                                    key={req.id} 
                                    onClick={() => setSelected(req)}
                                    className="premium-card group hover:border-[var(--accent)] transition-all cursor-pointer overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
                                        <div className={`w-14 h-14 rounded-2xl ${T.bg} ${T.color} flex items-center justify-center shrink-0 border border-[var(--border-color)] group-hover:scale-110 transition-transform`}>
                                            <Icon size={24} />
                                        </div>

                                        <div className="flex-1 space-y-2 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${T.bg} ${T.color} border-current/20 uppercase tracking-widest`}>{T.label}</span>
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${PRIORITY_STYLE[req.priority]} uppercase tracking-widest`}>{req.priority}</span>
                                                <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold">#{req.id.slice(-8).toUpperCase()}</span>
                                            </div>
                                            <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight truncate group-hover:text-[var(--accent)] transition-colors">{req.title}</h3>
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-[var(--text-secondary)] opacity-60 uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5"><User size={12} /> {req.requester}</span>
                                                <span className="flex items-center gap-1.5"><Building size={12} /> {req.department}</span>
                                                <span className="flex items-center gap-1.5"><Calendar size={12} /> {format(new Date(req.createdAt), 'dd.MM.yyyy')}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3 shrink-0">
                                            {req.amount && (
                                                <p className="text-xl font-black text-[var(--text-primary)] tracking-tight">{fmtAOA(req.amount)}</p>
                                            )}
                                            <span className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${S.bg} ${S.color} border-current/20`}>
                                                {S.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-1 bg-[var(--bg-primary)] w-full overflow-hidden">
                                        <div 
                                            className="h-full bg-[var(--accent)] transition-all duration-1000" 
                                            style={{ width: `${progress}%` }} 
                                        />
                                    </div>

                                    <div className="px-6 py-4 bg-[var(--bg-primary)]/50 border-t border-[var(--border-color)] flex items-center justify-between">
                                        <div className="flex items-center -space-x-2">
                                            {req.steps.map((step, i) => (
                                                <div 
                                                    key={step.id} 
                                                    title={`${step.role}: ${step.status}`}
                                                    className={`w-8 h-8 rounded-full border-2 border-[var(--bg-secondary)] flex items-center justify-center text-[10px] font-black ${step.status === 'APPROVED' ? 'bg-emerald-500 text-white' : step.status === 'REJECTED' ? 'bg-rose-500 text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}
                                                >
                                                    {step.status === 'APPROVED' ? <CheckCircle2 size={14} /> : i + 1}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">{progress}% Alinhado</span>
                                            <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Details Sidebar/Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in" onClick={() => setSelected(null)} />
                    <div className="relative w-full max-w-2xl bg-[var(--bg-secondary)]/95 border-l border-[var(--border-color)] h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col backdrop-blur-xl">
                        <div className="p-8 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-primary)]/50">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tighter text-[var(--text-primary)]">Gestão de Protocolo</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 italic">Audit Ledger: #{selected.id.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelected(null)} className="w-10 h-10 hover:bg-[var(--bg-primary)] rounded-full transition-all text-[var(--text-secondary)] flex items-center justify-center border border-transparent hover:border-[var(--border-color)]">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Summary Card */}
                            <div className="premium-card p-8 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] space-y-6 relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 opacity-[0.03] scale-[3] group-hover:rotate-12 transition-transform duration-1000 select-none pointer-events-none">
                                    {(() => {
                                        const Icon = TYPE_CONFIG[selected.type].icon;
                                        return <Icon size={64} />;
                                    })()}
                                </div>
                                
                                <div className="flex items-start justify-between relative z-10">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${TYPE_CONFIG[selected.type].bg} ${TYPE_CONFIG[selected.type].color} border-current/20 uppercase tracking-widest shadow-sm`}>{TYPE_CONFIG[selected.type].label}</span>
                                            <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${PRIORITY_STYLE[selected.priority]} uppercase tracking-widest shadow-sm`}>{selected.priority}</span>
                                        </div>
                                        <h3 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter leading-none">{selected.title}</h3>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-[var(--text-secondary)] opacity-60 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><User size={12} /> {selected.requester}</span>
                                            <span className="flex items-center gap-1.5"><Building size={12} /> {selected.department}</span>
                                        </div>
                                    </div>
                                    <div className={`w-16 h-16 rounded-[2rem] ${TYPE_CONFIG[selected.type].bg} ${TYPE_CONFIG[selected.type].color} flex items-center justify-center border border-current/20 shadow-xl group-hover:rotate-6 transition-transform`}>
                                        {(() => {
                                            const Icon = TYPE_CONFIG[selected.type].icon;
                                            return <Icon size={32} />;
                                        })()}
                                    </div>
                                </div>

                                <div className="p-6 bg-[var(--bg-primary)]/40 rounded-3xl border border-[var(--border-color)] text-[15px] text-[var(--text-secondary)] leading-relaxed font-medium">
                                    <p className="italic opacity-80">"{selected.description}"</p>
                                </div>

                                {selected.amount && (
                                    <div className="flex items-center justify-between p-6 bg-[var(--accent)]/5 rounded-3xl border border-[var(--accent)]/10 shadow-inner">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center border border-[var(--accent)]/20">
                                                <DollarSign size={20} className="text-[var(--accent)]" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">Exposição Fiscal</span>
                                        </div>
                                        <span className="text-3xl font-black text-[var(--text-primary)] tabular-nums tracking-tighter">{fmtAOA(selected.amount)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Workflow Chain */}
                            <div className="space-y-6">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] flex items-center gap-2">
                                    <Layers size={16} className="text-[var(--accent)]" /> Cadeia de Custódia
                                </h4>
                                <div className="space-y-4">
                                    {selected.steps.map((step, i) => {
                                        const s = STATUS_CONFIG[step.status];
                                        return (
                                            <div key={step.id} className="relative pl-10">
                                                {i < selected.steps.length - 1 && <div className="absolute left-[15px] top-10 bottom-0 w-0.5 bg-[var(--border-color)]" />}
                                                <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-2 border-[var(--bg-secondary)] flex items-center justify-center text-[10px] font-black shadow-lg z-10 ${step.status === 'APPROVED' ? 'bg-emerald-500 text-white' : step.status === 'REJECTED' ? 'bg-rose-500 text-white' : 'bg-[var(--bg-primary)] text-[var(--text-muted)]'}`}>
                                                    {i + 1}
                                                </div>
                                                <div className="premium-card p-5 space-y-4 hover:border-[var(--accent)]/30 transition-all">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-[12px] font-black text-[var(--text-primary)] uppercase">{step.role}</p>
                                                            <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-60 uppercase italic">{step.approverName}</p>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${s.bg} ${s.color} border-current/20`}>{s.label}</span>
                                                    </div>
                                                    {step.comment && (
                                                        <div className="p-3 bg-[var(--bg-primary)] rounded-xl border-l-4 border-[var(--accent)] italic text-[11px] text-[var(--text-secondary)]">
                                                            "{step.comment}"
                                                        </div>
                                                    )}
                                                    {step.decidedAt && (
                                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                                                            <ShieldCheck size={12} className="text-emerald-500" /> Certificado em {format(new Date(step.decidedAt), 'HH:mm — dd.MM.yy')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Decision Actions */}
                            {selected.status === 'PENDING' && (
                                <div className="pt-8 border-t border-[var(--border-color)] space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)] pl-2">Observações da Decisão</label>
                                        <textarea 
                                            rows={3} 
                                            className="premium-input p-4 resize-none" 
                                            placeholder="Fundamente a sua decisão estratégica..." 
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {(() => {
                                            const activeStep = selected.steps.find(s => s.status === 'PENDING');
                                            if (!activeStep) return null;
                                            return (
                                                <>
                                                    <button 
                                                        onClick={() => decisionMutation.mutate({ stepId: activeStep.id, status: 'REJECTED', comment })}
                                                        disabled={decisionMutation.isPending}
                                                        className="premium-button-secondary py-4 justify-center bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border-rose-500/20"
                                                    >
                                                        <ThumbsDown size={18} /> Rejeitar
                                                    </button>
                                                    <button 
                                                        onClick={() => decisionMutation.mutate({ stepId: activeStep.id, status: 'APPROVED', comment })}
                                                        disabled={decisionMutation.isPending}
                                                        className="premium-button-primary py-4 justify-center bg-emerald-600 hover:bg-emerald-500 border-emerald-600"
                                                    >
                                                        <ThumbsUp size={18} /> Aprovar
                                                    </button>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setModal(false)} />
                    <div className="relative bg-[var(--bg-primary)] border border-[var(--border-color)] w-full max-w-xl rounded-[var(--radius-lg)] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight text-[var(--text-primary)]">Nova Solicitação</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] opacity-70">Protocolo de Governação</p>
                            </div>
                            <button onClick={() => setModal(false)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-all text-[var(--text-secondary)]"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="space-y-4">
                                <label className="premium-label">Título da Solicitação</label>
                                <input required className="premium-input" placeholder="Ex: Aquisição de Servidores Q3" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="premium-label">Tipo</label>
                                    <span className="premium-input bg-[var(--bg-primary)] relative p-0 overflow-hidden">
                                        <select className="bg-transparent w-full h-full px-4 outline-none appearance-none cursor-pointer text-xs font-bold" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as RequestType }))}>
                                            {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label.toUpperCase()}</option>)}
                                        </select>
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    <label className="premium-label">Prioridade</label>
                                    <span className="premium-input bg-[var(--bg-primary)] relative p-0 overflow-hidden">
                                        <select className="bg-transparent w-full h-full px-4 outline-none appearance-none cursor-pointer text-xs font-bold" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                                            <option value="LOW">BAIXA</option>
                                            <option value="NORMAL">NORMAL</option>
                                            <option value="HIGH">ALTA</option>
                                            <option value="URGENT">URGENTE</option>
                                        </select>
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="premium-label">Departamento</label>
                                    <input className="premium-input" placeholder="Ex: TI, RH, Financeiro" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} />
                                </div>
                                <div className="space-y-4">
                                    <label className="premium-label">Valor (AOA)</label>
                                    <input type="number" className="premium-input" placeholder="Opcional" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="premium-label">Justificação Estratégica</label>
                                <textarea rows={4} className="premium-input p-4 resize-none" placeholder="Descreva a necessidade e o impacto esperado..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                            </div>
                            
                            <div className="pt-6 flex gap-4">
                                <button type="button" onClick={() => setModal(false)} className="premium-button-secondary flex-1 py-4 uppercase tracking-widest text-[9px]">Cancelar</button>
                                <button type="submit" disabled={createMutation.isPending} className="premium-button-primary flex-[2] py-4 uppercase tracking-widest text-[9px] justify-center">
                                    {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <GitMerge size={16} />} 
                                    Submeter Protocolo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
