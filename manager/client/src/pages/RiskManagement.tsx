import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert, AlertTriangle, CheckCircle2, Plus, X, Activity, Target, Loader2, Clock, ShieldCheck, Search, Trash2, Printer, Shield, User, Zap, Fingerprint, AlertCircle, Download, List, Binary, Scaling, History, Globe, Database, Rocket, BadgeCheck, ShieldAlert as ShieldAlertIcon, Layers as LayersIcon } from 'lucide-react';
import api from '../api';
import { toast } from 'sonner';

type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type RiskStatus = 'OPEN' | 'MITIGATING' | 'RESOLVED' | 'ACCEPTED';

interface Risk {
    id: string;
    title: string;
    description: string;
    category: string;
    level: RiskLevel;
    status: RiskStatus;
    probability: number;
    impact: number;
    owner: string;
    dueDate: string;
    mitigation: string;
}

const LEVEL_STYLE: Record<RiskLevel, { color: string; bg: string; border: string; label: string; icon: any; accent: string }> = {
    CRITICAL: {
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-500/10',
        border: 'border-rose-100 dark:border-rose-500/20',
        label: 'Crítico',
        icon: <ShieldAlert size={14} />,
        accent: 'bg-rose-500',
    },
    HIGH: {
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-500/10',
        border: 'border-orange-100 dark:border-orange-500/20',
        label: 'Elevado',
        icon: <AlertTriangle size={14} />,
        accent: 'bg-orange-500',
    },
    MEDIUM: {
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        border: 'border-amber-100 dark:border-amber-500/20',
        label: 'Médio',
        icon: <Activity size={14} />,
        accent: 'bg-amber-500',
    },
    LOW: {
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        border: 'border-emerald-100 dark:border-emerald-500/20',
        label: 'Baixo',
        icon: <ShieldCheck size={14} />,
        accent: 'bg-emerald-500',
    },
};

const STATUS_STYLE: Record<RiskStatus, { color: string; bg: string; border: string; label: string; icon: any }> = {
    OPEN: { label: 'Em Aberto', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-100', icon: AlertCircle },
    MITIGATING: { label: 'Em Mitigação', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100', icon: Activity },
    RESOLVED: { label: 'Resolvido', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100', icon: ShieldCheck },
    ACCEPTED: { label: 'Aceite', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-100', icon: CheckCircle2 },
};

export default function RiskManagement() {
    const qc = useQueryClient();
    const [selected, setSelected] = useState<Risk | null>(null);
    const [modal, setModal] = useState(false);
    const [filter, setFilter] = useState<'ALL' | RiskLevel>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Financeiro',
        department: '',
        level: 'LOW' as RiskLevel,
        probability: 50,
        impact: 50,
        owner: '',
        mitigation: '',
        dueDate: ''
    });

    const { data: risks = [], isLoading } = useQuery({
        queryKey: ['risks'],
        queryFn: async () => (await api.get('/risks')).data as Risk[]
    });

    const createMutation = useMutation({
        mutationFn: (payload: any) => api.post('/risks', payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['risks'] });
            toast.success('Risco registado no ecossistema.');
            setModal(false);
            resetForm();
        },
        onError: () => toast.error('Falha ao registar risco.')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: RiskStatus }) => api.patch(`/risks/${id}`, { status }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['risks'] });
            toast.success('Estado de risco atualizado.');
            setSelected(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/risks/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['risks'] });
            toast.success('Risco removido.');
            setSelected(null);
        }
    });

    const resetForm = () => {
        setFormData({
            title: '', description: '', category: 'Financeiro',
            department: '', level: 'LOW', probability: 50,
            impact: 50, owner: '', mitigation: '', dueDate: ''
        });
    };

    const riskScore = (r: Risk) => Math.round((r.probability * r.impact) / 100);

    const filtered = risks.filter(r => {
        const matchesFilter = filter === 'ALL' || r.level === filter;
        const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             r.category.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Gestão de Risco & Conformidade</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Monitorização de vulnerabilidades operacionais e governança GRC.</p>
                </div>

                <div className="flex items-center gap-2">
                    <button className="premium-button-secondary !py-2.5">
                        <Download size={15} />
                        <span className="text-sm">Relatório</span>
                    </button>
                    <button
                        onClick={() => { resetForm(); setModal(true); }}
                        className="premium-button-primary !py-2.5"
                    >
                        <Plus size={15} /> 
                        <span className="text-sm">Nova Exposição</span>
                    </button>
                </div>
            </div>

            {/* Strategic KPI Matrix */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Exposições Críticas', value: risks.filter(r => r.level === 'CRITICAL').length.toString(), icon: <ShieldAlert size={15} />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                    { label: 'Índices em Aberto', value: risks.filter(r => r.status === 'OPEN').length.toString(), icon: <AlertTriangle size={15} />, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10' },
                    { label: 'Em Mitigação', value: risks.filter(r => r.status === 'MITIGATING').length.toString(), icon: <Activity size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                    { label: 'Rating GRC', value: '94.2%', icon: <ShieldCheck size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Heat Matrix Hub */}
                <div className="premium-card p-6 flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b border-[var(--border-color)]/50 pb-4">
                        <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                            <Scaling size={18} className="text-[var(--accent)]" /> Matriz de Calor
                        </h2>
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase italic">Probabilidade vs Impacto</span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 w-full aspect-square">
                        {[5, 4, 3, 2, 1].map(impact =>
                            [1, 2, 3, 4, 5].map(prob => {
                                const score = impact * prob;
                                const cell_risks = risks.filter(r =>
                                    Math.ceil(r.probability / 20) === prob &&
                                    Math.ceil(r.impact / 20) === impact
                                );
                                const cellBg = score >= 20 ? 'bg-rose-500/20' :
                                    score >= 12 ? 'bg-orange-500/20' :
                                        score >= 6 ? 'bg-amber-500/15' : 'bg-emerald-500/10';
                                
                                return (
                                    <div key={`${impact}-${prob}`} className={`rounded-lg border border-white/5 ${cellBg} flex items-center justify-center transition-all hover:scale-110 relative group/cell`}>
                                        {cell_risks.length > 0 && (
                                            <div className="w-6 h-6 rounded-md bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center text-[10px] font-bold shadow-lg">{cell_risks.length}</div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="space-y-3 pt-4">
                        {[
                            { color: 'bg-rose-500', label: 'Crítico (20-25)', action: 'Intervenção Imediata' },
                            { color: 'bg-orange-500', label: 'Elevado (12-19)', action: 'Mitigação Ativa' },
                            { color: 'bg-emerald-500', label: 'Nominal (1-5)', action: 'Monitorização' },
                        ].map((l, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-primary)]/50 rounded-xl border border-[var(--border-color)]/30 text-[10px]">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${l.color}`} />
                                    <span className="font-bold text-[var(--text-secondary)] uppercase">{l.label}</span>
                                </div>
                                <span className="font-bold text-[var(--accent)] opacity-60 italic">{l.action}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ledger & Expositions List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="premium-card p-2 flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex bg-[var(--bg-primary)] p-1 rounded-lg border border-[var(--border-color)]/50">
                            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                                >
                                    {f === 'ALL' ? 'Geral' : f}
                                </button>
                            ))}
                        </div>
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                            <input
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Pesquisar risco ou categoria..."
                                className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm font-medium text-[var(--text-primary)]"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-40">
                                <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Sincronizando Auditoria GRC...</span>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="premium-card py-32 flex flex-col items-center justify-center text-center opacity-40 border-dashed">
                                <ShieldCheck size={48} className="mb-4 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest">Nenhuma exposição indexada</p>
                            </div>
                        ) : (
                            filtered.map(risk => {
                                const l = LEVEL_STYLE[risk.level];
                                const s = STATUS_STYLE[risk.status];
                                return (
                                    <div key={risk.id} onClick={() => setSelected(risk)} className="premium-card p-5 group cursor-pointer hover:border-[var(--accent)]/50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${l.bg} ${l.color} ${l.border}`}>
                                                    {l.icon} {l.label}
                                                </span>
                                                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-l border-[var(--border-color)] pl-3">{risk.category}</span>
                                            </div>
                                            <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">{risk.title}</h3>
                                        </div>

                                        <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-[var(--border-color)]/20">
                                            <div className="text-right">
                                                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Impacto</p>
                                                <p className={`text-2xl font-bold tabular-nums italic ${riskScore(risk) >= 50 ? 'text-rose-500' : 'text-[var(--text-primary)]'}`}>{riskScore(risk)}%</p>
                                            </div>
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${s.bg} ${s.color} ${s.border}`}>
                                                <s.icon size={14} className={risk.status === 'OPEN' ? 'animate-pulse' : ''} />
                                                {s.label}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Detailed Side Panel */}
            {selected && (
                <div className="fixed inset-0 z-[3000] flex justify-end">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-500" onClick={() => setSelected(null)} />
                    <div className="relative z-10 w-full max-w-xl bg-[var(--bg-secondary)] h-full overflow-y-auto p-8 sm:p-12 shadow-2xl animate-in slide-in-from-right duration-500 border-l border-[var(--border-color)] no-scrollbar flex flex-col">
                        <div className="flex justify-between items-start mb-12 shrink-0">
                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--accent)] mb-2">Relatório de Exposição GRC</h3>
                                <h2 className="text-2xl font-bold text-[var(--text-primary)] leading-tight italic">{selected.title}</h2>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"><X size={24} /></button>
                        </div>

                        <div className="flex-1 space-y-8 no-scrollbar pb-24">
                            <div className={`p-6 rounded-3xl border ${LEVEL_STYLE[selected.level].border} ${LEVEL_STYLE[selected.level].bg} space-y-4`}>
                                <div className="flex items-center justify-between">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border ${LEVEL_STYLE[selected.level].bg} ${LEVEL_STYLE[selected.level].color} ${LEVEL_STYLE[selected.level].border}`}>
                                        Protocolo {LEVEL_STYLE[selected.level].label}
                                    </span>
                                    <div className="text-right">
                                        <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider mb-1">Score de Risco</p>
                                        <p className="text-4xl font-bold text-[var(--text-primary)] italic">{riskScore(selected)}%</p>
                                    </div>
                                </div>
                                <p className="text-sm leading-relaxed text-[var(--text-secondary)] font-medium border-l-4 border-[var(--accent)] pl-4 py-2">
                                    {selected.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Responsável', value: selected.owner, icon: <User size={18} /> },
                                    { label: 'Categoria', value: selected.category, icon: <LayersIcon size={18} /> },
                                    { label: 'Limite Resolução', value: new Date(selected.dueDate).toLocaleDateString('pt-PT'), icon: <Clock size={18} /> },
                                    { label: 'Estado', value: STATUS_STYLE[selected.status].label, icon: <Activity size={18} /> },
                                ].map((item: any, i) => (
                                    <div key={i} className="premium-card p-4 flex flex-col gap-3">
                                        <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                            {item.icon}
                                            <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
                                        </div>
                                        <p className="text-xs font-bold text-[var(--text-primary)] truncate">{item.value || 'N/D'}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="premium-card p-6 border-dashed bg-indigo-50/30 dark:bg-indigo-500/5">
                                <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Zap size={14} className="animate-pulse" /> Plano de Mitigação
                                </h4>
                                <p className="text-sm leading-loose text-[var(--text-secondary)] font-medium">
                                    {selected.mitigation || 'Nenhum protocolo de contingência registado.'}
                                </p>
                            </div>

                            <div className="space-y-4 pt-6">
                                <h4 className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
                                    <History size={16} className="text-[var(--accent)]" /> Transição de Estado
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['OPEN', 'MITIGATING', 'RESOLVED', 'ACCEPTED'] as RiskStatus[]).map(s => {
                                        const SIcon = STATUS_STYLE[s].icon;
                                        return (
                                            <button
                                                key={s}
                                                onClick={() => updateMutation.mutate({ id: selected.id, status: s })}
                                                disabled={updateMutation.isPending}
                                                className={`p-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border-2 flex flex-col items-center gap-3 active:scale-95 ${selected.status === s ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-lg' : 'bg-[var(--bg-primary)] border-[var(--border-color)]/50 text-[var(--text-secondary)] hover:border-[var(--accent)]/30'}`}
                                            >
                                                <SIcon size={20} className={selected.status === s ? 'animate-bounce' : ''} />
                                                {STATUS_STYLE[s].label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]/20 flex gap-4 backdrop-blur-md shrink-0">
                            <button className="flex-1 premium-button-secondary py-4">
                                <Printer size={18} /> Relatório
                            </button>
                            <button
                                onClick={() => { if(confirm('Remover esta exposição?')) deleteMutation.mutate(selected.id) }}
                                disabled={deleteMutation.isPending}
                                className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-bold uppercase shadow-lg shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={18} /> Remover
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Creation Modal */}
            {modal && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-500" onClick={() => setModal(false)} />
                    <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-color)] w-full max-w-2xl rounded-3xl p-8 sm:p-12 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar flex flex-col">
                        <div className="flex items-center justify-between mb-10 shrink-0">
                            <div>
                                <h2 className="text-2xl font-bold text-[var(--text-primary)] italic">Nova Exposição GRC</h2>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">Registo de vulnerabilidade corporativa</p>
                            </div>
                            <button onClick={() => setModal(false)} className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"><X size={24} /></button>
                        </div>

                        <form className="space-y-6 flex-1 pr-2 overflow-y-auto no-scrollbar pb-10" onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Título da Exposição</label>
                                    <input 
                                        className="premium-input" 
                                        placeholder="Ex: Falha Crítica no Gateway de Pagamentos" 
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Categoria</label>
                                    <select 
                                        className="premium-input"
                                        value={formData.category}
                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                    >
                                        <option value="Financeiro">Financeiro</option>
                                        <option value="Operacional">Operacional</option>
                                        <option value="Legal/Compliance">Legal/Compliance</option>
                                        <option value="Cibersegurança">Cibersegurança</option>
                                        <option value="Reputacional">Reputacional</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Nível de Risco</label>
                                    <select 
                                        className="premium-input"
                                        value={formData.level}
                                        onChange={e => setFormData({...formData, level: e.target.value as RiskLevel})}
                                    >
                                        <option value="LOW">Baixo</option>
                                        <option value="MEDIUM">Médio</option>
                                        <option value="HIGH">Elevado</option>
                                        <option value="CRITICAL">Crítico</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Probabilidade (%)</label>
                                    <input 
                                        type="number" min="0" max="100" className="premium-input" 
                                        value={formData.probability}
                                        onChange={e => setFormData({...formData, probability: Number(e.target.value)})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Impacto (%)</label>
                                    <input 
                                        type="number" min="0" max="100" className="premium-input" 
                                        value={formData.impact}
                                        onChange={e => setFormData({...formData, impact: Number(e.target.value)})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Responsável</label>
                                    <input 
                                        className="premium-input" 
                                        placeholder="Nome do Auditor/Gestor" 
                                        value={formData.owner}
                                        onChange={e => setFormData({...formData, owner: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Data Limite</label>
                                    <input 
                                        type="date" className="premium-input" 
                                        value={formData.dueDate}
                                        onChange={e => setFormData({...formData, dueDate: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Descrição Detalhada</label>
                                    <textarea 
                                        className="premium-input min-h-[100px] py-3" 
                                        placeholder="Descreva o risco e suas implicações..."
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Plano de Mitigação Inicial</label>
                                    <textarea 
                                        className="premium-input min-h-[80px] py-3" 
                                        placeholder="Ações recomendadas para mitigar o risco..."
                                        value={formData.mitigation}
                                        onChange={e => setFormData({...formData, mitigation: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={createMutation.isPending}
                                className="w-full py-4 bg-[var(--accent)] text-white rounded-2xl text-[10px] font-bold uppercase shadow-xl shadow-[var(--accent)]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                                Finalizar Registo de Risco
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
