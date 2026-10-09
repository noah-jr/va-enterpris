import { useState } from 'react';
import { createPortal } from 'react-dom';
import { UserPlus, Mail, Phone, Star, Calendar, ChevronRight, Target, Plus, X, Search, Loader2, Users, Briefcase, MessageSquare, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

interface Candidate {
    id: string;
    name: string;
    position: string;
    department: string;
    stage: 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'ASSESSMENT' | 'OFFER' | 'HIRED' | 'REJECTED';
    rating: number;
    appliedAt: string;
    email: string;
    phone: string;
    source: string;
    notes: string;
}

const STAGES = [
    { key: 'APPLIED', label: 'Candidatura', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-500/10' },
    { key: 'SCREENING', label: 'Triagem', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
    { key: 'INTERVIEW', label: 'Entrevista', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { key: 'ASSESSMENT', label: 'Avaliação', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
    { key: 'OFFER', label: 'Proposta', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { key: 'HIRED', label: 'Contratado', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
    { key: 'REJECTED', label: 'Rejeitado', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
] as const;

export default function Recruitment() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Candidate | null>(null);
    const [modal, setModal] = useState(false);
    const [viewMode, setViewMode] = useState<'BOARD' | 'LIST'>('BOARD');
    const [form, setForm] = useState({ name: '', position: '', department: 'TI', email: '', phone: '', source: 'LinkedIn', notes: '' });

    const { data: candidates = [], isLoading } = useQuery({
        queryKey: ['candidates'],
        queryFn: async () => {
            const res = await api.get('/recruitment');
            return res.data as Candidate[];
        }
    });

    const { data: kpiData } = useQuery({
        queryKey: ['recruitment-kpis'],
        queryFn: async () => (await api.get('/recruitment/kpis')).data
    });

    const { data: optionsData } = useQuery({
        queryKey: ['recruitment-options'],
        queryFn: async () => (await api.get('/recruitment/options')).data
    });

    const SOURCES = optionsData?.sources || [];
    const DEPARTMENTS_LIST = optionsData?.departments || [];

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/recruitment', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
            queryClient.invalidateQueries({ queryKey: ['recruitment-kpis'] });
            queryClient.invalidateQueries({ queryKey: ['recruitment-options'] });
            setModal(false);
            setForm({ name: '', position: '', department: DEPARTMENTS_LIST[0] || '', email: '', phone: '', source: SOURCES[0] || '', notes: '' });
            toast.success('Candidato registado no sistema.');
        }
    });

    const updateStageMutation = useMutation({
        mutationFn: ({ id, stage }: { id: string, stage: string }) => api.patch(`/recruitment/${id}`, { stage }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
            queryClient.invalidateQueries({ queryKey: ['recruitment-kpis'] });
            toast.success('Etapa do candidato actualizada.');
        }
    });

    const filtered = candidates.filter((c: Candidate) => {
        const matchSearch = (c.name || '').toLowerCase().includes(search.toLowerCase()) || (c.position || '').toLowerCase().includes(search.toLowerCase());
        return matchSearch;
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(form);
    };

    const advanceStage = (cand: Candidate) => {
        const keys = STAGES.map(s => s.key);
        const idx = keys.indexOf(cand.stage);
        if (idx < keys.length - 2) {
            updateStageMutation.mutate({ id: cand.id, stage: keys[idx + 1] });
        }
    };

    const kpis = [
        {
            title: 'Total Candidatos',
            value: kpiData?.total || 0,
            icon: <Users size={15} />,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50 dark:bg-indigo-500/10'
        },
        {
            title: 'Em Triagem',
            value: kpiData?.screening || 0,
            icon: <Target size={15} />,
            color: 'text-sky-600 dark:text-sky-400',
            bg: 'bg-sky-50 dark:bg-sky-500/10'
        },
        {
            title: 'Em Entrevista',
            value: kpiData?.interview || 0,
            icon: <MessageSquare size={15} />,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-500/10'
        },
        {
            title: 'Propostas',
            value: kpiData?.offer || 0,
            icon: <Briefcase size={15} />,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-500/10'
        }
    ];

    return (
        <>
            <div className="space-y-6 pb-8">
                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-[var(--text-primary)]">Recrutamento</h1>
                        <p className="text-sm text-[var(--text-muted)] mt-0.5">Gestão do pipeline de aquisição de talentos.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-1">
                            <button onClick={() => setViewMode('BOARD')} className={`p-1.5 rounded-[var(--radius-sm)] transition-colors ${viewMode === 'BOARD' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
                                <LayoutGrid size={15} />
                            </button>
                            <button onClick={() => setViewMode('LIST')} className={`p-1.5 rounded-[var(--radius-sm)] transition-colors ${viewMode === 'LIST' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
                                <List size={15} />
                            </button>
                        </div>
                        <button onClick={() => setModal(true)} className="premium-button-primary !px-3 !py-2">
                            <Plus size={15} />
                            <span className="text-sm">Novo candidato</span>
                        </button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {kpis.map((kpi, idx) => (
                        <div key={idx} className="premium-card p-4 flex items-start gap-3">
                            <div className={`kpi-icon shrink-0 ${kpi.color} ${kpi.bg}`}>
                                {kpi.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-[var(--text-muted)] mb-0.5 truncate">{kpi.title}</p>
                                <p className="text-base font-bold text-[var(--text-primary)] tabular-nums leading-tight truncate">{kpi.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pesquisa */}
                <div className="premium-card p-2 flex items-center gap-2">
                    <Search size={16} className="text-[var(--text-muted)] ml-2" />
                    <input
                        type="text"
                        placeholder="Pesquisar candidato, cargo ou departamento..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] py-1"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center gap-3 py-32 text-[var(--text-muted)]">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-sm">A carregar pipeline...</span>
                    </div>
                ) : viewMode === 'BOARD' ? (
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {STAGES.filter(s => s.key !== 'REJECTED' && s.key !== 'HIRED').map(stage => {
                            const stageCandidates = filtered.filter(c => c.stage === stage.key);
                            return (
                                <div key={stage.key} className="flex-shrink-0 w-[280px] flex flex-col">
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <h3 className="text-sm font-bold text-[var(--text-primary)]">{stage.label}</h3>
                                        <span className="text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--border-color)]">
                                            {stageCandidates.length}
                                        </span>
                                    </div>

                                    <div className="flex-1 bg-[var(--bg-secondary)] rounded-[var(--radius-md)] p-2 min-h-[200px] flex flex-col gap-2 border border-[var(--border-color)]">
                                        {stageCandidates.length === 0 ? (
                                            <div className="flex-1 flex items-center justify-center opacity-40">
                                                <p className="text-xs text-center text-[var(--text-muted)]">Nenhum registo</p>
                                            </div>
                                        ) : (
                                            stageCandidates.map(cand => (
                                                <div 
                                                    key={cand.id} 
                                                    onClick={() => setSelected(cand)}
                                                    className="premium-card p-3 cursor-pointer hover:border-[var(--accent)] transition-colors"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">{cand.name}</p>
                                                            <p className="text-[11px] text-[var(--text-muted)] truncate">{cand.position}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-color)]">
                                                        <div className="flex items-center gap-1">
                                                            <Briefcase size={12} className="text-[var(--text-muted)]" />
                                                            <span className="text-[11px] text-[var(--text-muted)] truncate max-w-[100px]">{cand.department}</span>
                                                        </div>
                                                        <div className="flex items-center gap-0.5">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star key={i} size={10} className={i < cand.rating ? 'text-amber-500 fill-amber-500' : 'text-[var(--border-strong)]'} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="premium-card overflow-hidden !p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-[var(--text-muted)]">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Candidato</th>
                                        <th className="px-4 py-3 font-medium">Cargo</th>
                                        <th className="px-4 py-3 font-medium">Departamento</th>
                                        <th className="px-4 py-3 font-medium">Avaliação</th>
                                        <th className="px-4 py-3 font-medium">Etapa Atual</th>
                                        <th className="px-4 py-3 text-right font-medium">Acção</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]">
                                    {filtered.map(cand => {
                                        const stageInfo = STAGES.find(s => s.key === cand.stage)!;
                                        return (
                                            <tr key={cand.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-[var(--text-primary)]">{cand.name}</p>
                                                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{cand.email}</p>
                                                </td>
                                                <td className="px-4 py-3 text-[var(--text-primary)]">{cand.position}</td>
                                                <td className="px-4 py-3 text-[var(--text-muted)]">{cand.department}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-0.5">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star key={i} size={12} className={i < cand.rating ? 'text-amber-500 fill-amber-500' : 'text-[var(--border-strong)]'} />
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-[var(--radius-sm)] text-[11px] font-medium inline-flex items-center gap-1 ${stageInfo.bg} ${stageInfo.color}`}>
                                                        {stageInfo.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => setSelected(cand)} className="text-sm text-[var(--accent)] hover:underline font-medium">
                                                        Detalhes
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-muted)]">
                                                Nenhum candidato encontrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Dossier do Candidato (Side Panel) */}
            {selected && createPortal(
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={() => setSelected(null)} />
                    <div className="relative z-10 w-full max-w-md bg-[var(--bg-primary)] shadow-2xl flex flex-col h-[100dvh] animate-in slide-in-from-right duration-200">
                        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)] bg-[var(--bg-primary)] shrink-0">
                            <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
                                <Users size={18} className="text-[var(--accent)]" /> Detalhes do Candidato
                            </h3>
                            <button onClick={() => setSelected(null)} className="p-2 text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] rounded-full transition-colors"><X size={18} /></button>
                        </div>

                        <div className="p-6 space-y-8 overflow-y-auto flex-1">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selected.name}`} alt="avatar" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-xl font-black text-[var(--text-primary)] truncate">{selected.name}</h2>
                                    <p className="text-sm font-medium text-[var(--text-muted)] mt-0.5 truncate">{selected.position}</p>
                                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                                        {selected.department}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-color)] pb-2">Informações de Contacto</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                                        <Mail size={16} className="text-[var(--text-muted)] shrink-0" />
                                        <span className="text-sm font-medium text-[var(--text-primary)] truncate">{selected.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                                        <Phone size={16} className="text-[var(--text-muted)] shrink-0" />
                                        <span className="text-sm font-medium text-[var(--text-primary)] truncate">{selected.phone || 'Sem telefone registado'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                                        <LayoutGrid size={16} className="text-[var(--text-muted)] shrink-0" />
                                        <span className="text-sm font-medium text-[var(--text-primary)] truncate">Origem: {selected.source || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-color)] pb-2">Avaliação e Notas</h4>
                                <div className="flex items-center gap-2 p-3 rounded-[var(--radius-md)] border border-[var(--border-color)] bg-[var(--bg-primary)]">
                                    <span className="text-sm font-bold text-[var(--text-secondary)] mr-2">Classificação:</span>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} size={16} className={i < selected.rating ? 'text-amber-500 fill-amber-500' : 'text-[var(--border-color)]'} />
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                                    <p className="text-sm text-[var(--text-primary)] min-h-[60px] leading-relaxed">
                                        {selected.notes || <span className="text-[var(--text-muted)] italic">Nenhuma observação registada.</span>}
                                    </p>
                                </div>
                            </div>

                            {(() => {
                                const st = STAGES.find(s => s.key === selected.stage)!;
                                return (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-color)] pb-2">Estado Atual</h4>
                                        <div className={`flex items-center justify-between p-4 rounded-[var(--radius-md)] border ${st.bg} border-l-4 border-l-[var(--accent)]`}>
                                            <span className="text-sm font-bold text-[var(--text-primary)]">Fase do Pipeline</span>
                                            <span className={`px-3 py-1 rounded-[var(--radius-sm)] text-xs font-bold uppercase tracking-widest ${st.color} bg-[var(--bg-primary)] shadow-sm border border-[var(--border-color)]`}>
                                                {st.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="p-5 border-t border-[var(--border-color)] bg-[var(--bg-primary)] shrink-0 space-y-3">
                            {selected.stage !== 'HIRED' && selected.stage !== 'REJECTED' && (
                                <button
                                    onClick={() => advanceStage(selected)}
                                    disabled={updateStageMutation.isPending}
                                    className="premium-button-primary w-full justify-center py-3"
                                >
                                    {updateStageMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Avançar Candidato de Etapa'}
                                </button>
                            )}
                            {selected.stage !== 'REJECTED' && selected.stage !== 'HIRED' && (
                                <button
                                    onClick={() => {
                                        updateStageMutation.mutate({ id: selected.id, stage: 'REJECTED' });
                                        setSelected(null);
                                    }}
                                    disabled={updateStageMutation.isPending}
                                    className="w-full py-3 rounded-[var(--radius-md)] border border-rose-500/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold text-sm transition-colors"
                                >
                                    Rejeitar Candidatura
                                </button>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal de Registo */}
            {modal && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={() => setModal(false)} />
                    <div className="relative z-10 bg-[var(--bg-primary)] border border-[var(--border-color)] w-full max-w-2xl rounded-[var(--radius-lg)] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border-color)] bg-[var(--bg-primary)] z-10 shrink-0">
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">Adicionar Candidato</h2>
                            <button onClick={() => setModal(false)} className="p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] rounded-[var(--radius-sm)] transition-colors"><X size={18} /></button>
                        </div>

                        <div className="p-4 overflow-y-auto">
                            <form id="new-candidate-form" onSubmit={handleCreate} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="premium-label">Nome Completo *</label>
                                        <input required className="premium-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className="premium-label">Cargo *</label>
                                        <input required className="premium-input" value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className="premium-label">Departamento</label>
                                        <select className="premium-input" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}>
                                            {DEPARTMENTS_LIST.map((d: string) => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="premium-label">E-mail *</label>
                                        <input type="email" required className="premium-input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className="premium-label">Telefone</label>
                                        <input className="premium-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="premium-label">Notas</label>
                                        <textarea rows={3} className="premium-input resize-none" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex justify-end gap-2 rounded-b-[var(--radius-lg)]">
                            <button type="button" onClick={() => setModal(false)} className="premium-button-secondary !px-4 !py-2 text-sm">
                                Cancelar
                            </button>
                            <button type="submit" form="new-candidate-form" disabled={createMutation.isPending} className="premium-button-primary !px-4 !py-2 text-sm">
                                {createMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
