import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Plus, CheckCircle2, Clock, AlertTriangle, ChevronRight, Briefcase, 
    X, List, LayoutGrid, MoreHorizontal, Search, PieChart, CheckCircle, 
    Flag, Loader2, Calendar, Target, Layers, PlusCircle, BadgeCheck, TrendingUp
} from 'lucide-react';
import api from '../api';
import { SearchableSelect } from '../components/SearchableSelect';
import { Modal } from '../components/Modal';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/format';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
    PLANNING: { label: 'Planeamento', color: 'text-zinc-600', bg: 'bg-zinc-50', border: 'border-zinc-200' },
    IN_PROGRESS: { label: 'Em Execução', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
    ON_HOLD: { label: 'Em Suspenso', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    COMPLETED: { label: 'Concluído', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

const fmt = (v: number) => formatCurrency(v);

export default function Projects() {
    const qc = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskModal, setTaskModal] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [form, setForm] = useState({ name: '', description: '', budget: '', startDate: '', endDate: '' });
    const [taskForm, setTaskForm] = useState({ title: '', priority: 'MEDIUM', dueDate: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const { data: response, isLoading } = useQuery({
        queryKey: ['projects', searchTerm],
        queryFn: async () => (await api.get(`/projects?search=${searchTerm}`)).data
    });

    const projects = response?.data || [];
    const meta = response?.meta || { kpis: { activeProjects: 0, totalBudget: 0 } };

    const createProject = useMutation({
        mutationFn: (d: any) => api.post('/projects', d),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Projecto registado.');
            setIsModalOpen(false);
            setForm({ name: '', description: '', budget: '', startDate: '', endDate: '' });
        }
    });

    const updateProject = useMutation({
        mutationFn: ({ id, status }: any) => api.put(`/projects/${id}`, { status }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] })
    });

    const addTask = useMutation({
        mutationFn: ({ id, ...data }: any) => api.post(`/projects/${id}/tasks`, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Tarefa adicionada.');
            setTaskModal(null);
            setTaskForm({ title: '', priority: 'MEDIUM', dueDate: '' });
        }
    });

    const updateTask = useMutation({
        mutationFn: ({ projectId, taskId, status }: any) => api.patch(`/projects/${projectId}/tasks/${taskId}`, { status }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] })
    });

    if (isLoading && !projects.length) return (
        <div className="py-40 flex flex-col items-center justify-center gap-6 opacity-30">
            <Loader2 size={48} className="animate-spin text-[var(--accent)]" />
            <p className="text-xs font-bold uppercase tracking-widest">A carregar projectos...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Gestão de Projectos</h1>
                    <p className="text-sm text-[var(--text-secondary)] font-medium opacity-60 mt-1">Controlo de iniciativas, cronogramas e execução.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1 rounded-xl shadow-sm">
                        <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                            <LayoutGrid size={18} />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                            <List size={18} />
                        </button>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="premium-button-primary">
                        <Plus size={18} /> Novo Projecto
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Projectos Activos', value: meta.kpis.activeProjects, icon: <Clock size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Metas Concluídas', value: projects.filter((p: any) => p.status === 'COMPLETED').length, icon: <CheckCircle2 size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Volume Orçamentado', value: fmt(meta.kpis.totalBudget), icon: <PieChart size={20} />, color: 'text-sky-600', bg: 'bg-sky-50' },
                    { label: 'Projectos em Espera', value: projects.filter((p: any) => p.status === 'ON_HOLD').length, icon: <AlertTriangle size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((kpi, i) => (
                    <div key={i} className="premium-card p-6 flex flex-col gap-6 group border border-[var(--border-color)]">
                        <div className="flex items-center justify-between">
                            <div className={`w-12 h-12 rounded-2xl ${kpi.bg} ${kpi.color} border border-[var(--border-color)]/20 flex items-center justify-center transition-all group-hover:scale-110 shadow-sm`}>{kpi.icon}</div>
                            <span className="text-[9px] font-bold text-[var(--text-secondary)] opacity-10 uppercase">KPI-0{i + 1}</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-[var(--text-secondary)] mb-1 opacity-60 uppercase">{kpi.label}</p>
                            <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tabular-nums leading-none">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative group flex-1 w-full max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input 
                        type="text"
                        placeholder="Procurar projecto..."
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] py-2 pl-10 pr-4 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all uppercase"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-60 bg-[var(--bg-primary)] px-3 py-1.5 rounded-lg border border-[var(--border-color)]">{projects.length} Registos</span>
            </div>

            {/* Kanban Board */}
            <div className={`grid gap-6 ${viewMode === 'kanban' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
                {(Object.entries(STATUS_MAP) as [string, any][]).map(([key, status]) => (
                    <div key={key} className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${status.bg} border border-[var(--border-color)]`} />
                                <h2 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-primary)]">{status.label}</h2>
                            </div>
                            <span className="text-[10px] font-bold opacity-40 tabular-nums">
                                {projects.filter((p: any) => p.status === key).length}
                            </span>
                        </div>

                        <div className="flex flex-col gap-6 min-h-[200px]">
                            {projects.filter((p: any) => p.status === key).map((p: any) => (
                                <div key={p.id} className="premium-card p-6 border border-[var(--border-color)] group hover:border-[var(--accent)] transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-6">
                                        <h3 className="font-bold text-[var(--text-primary)] leading-tight uppercase group-hover:text-[var(--accent)] transition-colors">{p.name}</h3>
                                        <div className="p-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"><MoreHorizontal size={14} /></div>
                                    </div>

                                    <p className="text-[11px] text-[var(--text-secondary)] font-medium mb-6 line-clamp-2 opacity-60 leading-relaxed border-l-2 border-[var(--border-color)] pl-3">
                                        {p.description || 'Sem descrição definida.'}
                                    </p>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between items-center text-[9px] font-bold uppercase text-[var(--text-secondary)] opacity-60">
                                            <span>Progresso</span>
                                            <span className="text-[var(--accent)]">70%</span>
                                        </div>
                                        <div className="h-1 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-color)]/30">
                                            <div className="h-full bg-[var(--accent)] rounded-full w-[70%]" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-[var(--bg-primary)]/40 p-3 rounded-xl border border-[var(--border-color)]">
                                            <p className="text-[8px] font-bold uppercase text-[var(--text-secondary)] opacity-40 mb-1">Orçamento</p>
                                            <p className="text-[10px] font-bold text-[var(--text-primary)] tabular-nums">{p.budget ? fmt(Number(p.budget)) : '---'}</p>
                                        </div>
                                        <div className="bg-[var(--bg-primary)]/40 p-3 rounded-xl border border-[var(--border-color)]">
                                            <p className="text-[8px] font-bold uppercase text-[var(--text-secondary)] opacity-40 mb-1">Início</p>
                                            <p className="text-[10px] font-bold text-[var(--text-primary)]">{format(new Date(p.startDate), 'dd/MM/yy')}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6 border-t border-[var(--border-color)] pt-6">
                                        <p className="text-[9px] font-bold uppercase text-[var(--text-secondary)] opacity-40 mb-3">Próximas Tarefas</p>
                                        {(p.tasks || []).length === 0 ? (
                                            <p className="text-[10px] text-[var(--text-secondary)] opacity-30 italic">Sem tarefas agendadas.</p>
                                        ) : (p.tasks || []).slice(0, 2).map((t: any) => (
                                            <div key={t.id} className="flex items-center gap-3 p-3 bg-[var(--bg-primary)]/30 border border-[var(--border-color)] rounded-xl group/task">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); updateTask.mutate({ projectId: p.id, taskId: t.id, status: t.status === 'DONE' ? 'TODO' : 'DONE' }); }}
                                                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${t.status === 'DONE' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-[var(--border-color)]'}`}
                                                >
                                                    {t.status === 'DONE' && <CheckCircle size={10} />}
                                                </button>
                                                <span className={`text-[10px] font-bold truncate flex-1 uppercase tracking-tight ${t.status === 'DONE' ? 'line-through opacity-20' : 'text-[var(--text-primary)]'}`}>{t.title}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-[var(--border-color)]">
                                        <div className="flex -space-x-1">
                                            {[1, 2].map(i => (
                                                <div key={i} className="w-7 h-7 rounded-full border border-white bg-[var(--bg-primary)] text-[8px] font-bold flex items-center justify-center text-[var(--accent)] shadow-sm">VA</div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); setTaskModal(p); }} className="p-2 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--accent)] border border-[var(--border-color)] transition-all">
                                                <PlusCircle size={14} />
                                            </button>
                                            {key !== 'COMPLETED' && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const next: any = { 'PLANNING': 'IN_PROGRESS', 'IN_PROGRESS': 'COMPLETED', 'ON_HOLD': 'IN_PROGRESS' };
                                                        updateProject.mutate({ id: p.id, status: next[key] || 'COMPLETED' });
                                                    }}
                                                    className="p-2 rounded-lg bg-[var(--accent)] text-white shadow-sm transition-all"
                                                >
                                                    <ChevronRight size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal: Projecto */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Novo Projecto"
                subtitle="Gestão de iniciativas estratégicas."
                type="CENTER"
                width="xl"
                icon={<Briefcase size={24} className="text-[var(--accent)]" />}
            >
                <form onSubmit={e => { e.preventDefault(); createProject.mutate(form); }} className="p-4 sm:p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Nome do Projecto</label>
                        <input required className="premium-input !py-4 font-bold uppercase" placeholder="DESIGNAÇÃO..." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value.toUpperCase() }))} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Objectivos</label>
                        <textarea rows={3} className="premium-input resize-none italic py-4" placeholder="DESCRIÇÃO TÉCNICA..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Data Início</label>
                            <input required type="date" className="premium-input !py-4" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Orçamento (AOA)</label>
                            <input required type="number" className="premium-input !py-4 font-bold tabular-nums" placeholder="0" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} />
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="premium-button-secondary flex-1 uppercase">Cancelar</button>
                        <button type="submit" disabled={createProject.isPending} className="premium-button-primary flex-[2] uppercase">
                            {createProject.isPending ? <Loader2 size={18} className="animate-spin" /> : <BadgeCheck size={18} />} 
                            Criar Projecto
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Tarefa */}
            <Modal
                isOpen={!!taskModal}
                onClose={() => setTaskModal(null)}
                title="Nova Tarefa"
                subtitle={`Projecto: ${taskModal?.name}`}
                type="CENTER"
                width="lg"
                icon={<Target size={24} className="text-[var(--accent)]" />}
            >
                <form onSubmit={e => { e.preventDefault(); addTask.mutate({ id: taskModal.id, ...taskForm }); }} className="p-4 sm:p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">O que deve ser feito?</label>
                        <input required className="premium-input !py-4 font-bold uppercase" placeholder="DESIGNAÇÃO DA TAREFA..." value={taskForm.title} onChange={e => setTaskForm(p => ({ ...p, title: e.target.value.toUpperCase() }))} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Prioridade</label>
                                <SearchableSelect 
                                    options={[
                                        { label: 'BAIXA', value: 'LOW' },
                                        { label: 'NORMAL', value: 'MEDIUM' },
                                        { label: 'CRÍTICA', value: 'HIGH' }
                                    ]}
                                    value={taskForm.priority}
                                    onChange={val => setTaskForm(p => ({ ...p, priority: val }))}
                                />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Prazo</label>
                            <input required type="date" className="premium-input !py-4" value={taskForm.dueDate} onChange={e => setTaskForm(p => ({ ...p, dueDate: e.target.value }))} />
                        </div>
                    </div>
                    <button type="submit" disabled={addTask.isPending} className="premium-button-primary w-full !py-4 uppercase">
                        {addTask.isPending ? <Loader2 size={18} className="animate-spin" /> : <Target size={18} />} 
                        Adicionar Tarefa
                    </button>
                </form>
            </Modal>
        </div>
    );
}
