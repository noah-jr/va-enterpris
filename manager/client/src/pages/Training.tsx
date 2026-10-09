import { 
    GraduationCap, BookOpen, Award, Users, Star, Search, Plus, Filter, 
    BarChart3, Zap, ShieldCheck, ChevronRight, Laptop, Loader2, X, 
    Settings, Play, Clock, ArrowUpRight, Sparkles, CheckCircle2, 
    Save, Trash2, Pencil, Calendar, LayoutGrid, List
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';
import api from '../api';
import { authStore } from '../auth/authStore';

interface Course {
    id: string;
    title: string;
    category: 'IT' | 'MANAGEMENT' | 'SOFT_SKILLS' | 'COMPLIANCE';
    enrolled: number;
    rating: number;
    status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
    instructor: string;
    duration: string;
    description?: string;
    image?: string;
}

const CATEGORY_STYLE: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
    IT: { label: 'Tecnologia & Dev', color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/20', icon: Laptop },
    MANAGEMENT: { label: 'Gestão & Liderança', color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: BarChart3 },
    SOFT_SKILLS: { label: 'Soft Skills', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: BookOpen },
    COMPLIANCE: { label: 'Legal & Compliance', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: ShieldCheck },
};

export default function Training() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [modal, setModal] = useState(false);
    const [lessonModal, setLessonModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [editingLesson, setEditingLesson] = useState<any | null>(null);
    const [form, setForm] = useState({ 
        title: '', 
        category: 'MANAGEMENT', 
        instructor: '', 
        duration: '2h',
        description: '' 
    });
    const [lessonForm, setLessonForm] = useState({
        title: '',
        content: '',
        duration: '15m',
        order: 1
    });

    const user = authStore.getUser();
    const canManage = user?.role === 'SUPER_ADMIN' || user?.permissions?.includes('training:manage');

    const { data: courses = [], isLoading } = useQuery({
        queryKey: ['training-courses'],
        queryFn: async () => (await api.get('/training/courses')).data as Course[]
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/training/courses', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-courses'] });
            setModal(false);
            resetForm();
            toast.success('Novo módulo de formação instanciado na academia.');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => api.put(`/training/courses/${data.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-courses'] });
            setModal(false);
            resetForm();
            toast.success('Módulo actualizado com sucesso.');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/training/courses/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-courses'] });
            toast.success('Módulo removido da biblioteca.');
        }
    });

    const { data: lessons = [], isLoading: isLoadingLessons } = useQuery({
        queryKey: ['lessons', selectedCourse?.id],
        queryFn: async () => {
            if (!selectedCourse) return [];
            return (await api.get(`/training/courses/${selectedCourse.id}/lessons`)).data;
        },
        enabled: !!selectedCourse
    });

    const createLessonMutation = useMutation({
        mutationFn: (data: any) => api.post('/training/lessons', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lessons', selectedCourse?.id] });
            setEditingLesson(null);
            setLessonForm({ title: '', content: '', duration: '15m', order: lessons.length + 1 });
            toast.success('Aula autenticada e injectada no curso.');
        }
    });

    const deleteLessonMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/training/lessons/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lessons', selectedCourse?.id] });
            toast.success('Aula removida do nó.');
        }
    });

    const resetForm = () => {
        setForm({ title: '', category: 'MANAGEMENT', instructor: '', duration: '2h', description: '' });
        setEditingCourse(null);
    };

    const handleEdit = (course: Course) => {
        setEditingCourse(course);
        setForm({
            title: course.title,
            category: course.category,
            instructor: course.instructor,
            duration: course.duration,
            description: course.description || ''
        });
        setModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCourse) {
            updateMutation.mutate({ ...editingCourse, ...form });
        } else {
            createMutation.mutate({ ...form, status: 'ACTIVE', enrolled: 0, rating: 5.0 });
        }
    };

    const filtered = courses.filter(c => 
        c.title.toLowerCase().includes(search.toLowerCase()) || 
        c.instructor.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-8 text-left">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight italic flex items-center gap-3">
                        <GraduationCap className="text-[var(--accent)]" size={32} />
                        VA OneGest Academia
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] font-medium opacity-60">Centro de Excelência & Desenvolvimento de Capital Intelectual.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="premium-button-secondary flex-1 md:flex-none justify-center">
                        <Award size={18} /> Certificações
                    </button>
                    {canManage && (
                        <button
                            onClick={() => { resetForm(); setModal(true); }}
                            className="premium-button-primary flex-1 md:flex-none justify-center"
                        >
                            <Plus size={20} /> Novo Curso
                        </button>
                    )}
                </div>
            </div>

            {/* Matrix KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Cursos Ativos', value: courses.filter(c => c.status === 'ACTIVE').length, sub: 'Na academia', icon: <GraduationCap size={18} />, color: 'text-sky-500', bg: 'bg-sky-500/10' },
                    { title: 'Total Inscritos', value: courses.reduce((acc, c) => acc + c.enrolled, 0), sub: 'Talentos On-track', icon: <Users size={18} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { title: 'Certificações', value: courses.length > 0 ? (courses.reduce((acc, c) => acc + c.enrolled, 0) * 0.8).toFixed(0) : 0, sub: 'Estimadas', icon: <Award size={18} />, color: 'text-[var(--accent)]', bg: 'bg-[var(--accent)]/10' },
                    { title: 'Avaliação Média', value: (courses.reduce((acc, c) => acc + c.rating, 0) / (courses.length || 1)).toFixed(1), sub: 'NPS Global', icon: <Star size={18} />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                ].map((kpi, i) => (
                    <div key={i} className="premium-card p-6 flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                            <h3 className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest opacity-60">{kpi.title}</h3>
                            <div className={`p-2 rounded-xl ${kpi.bg} ${kpi.color}`}>
                                {kpi.icon}
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-black tracking-tight text-[var(--text-primary)]">{kpi.value}</p>
                            <p className={`text-[10px] font-bold uppercase tracking-tight mt-1 flex items-center gap-2 ${kpi.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${kpi.bg.replace('/10', '')} animate-pulse`} />
                                {kpi.sub}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Content Library */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="premium-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative flex-1 w-full">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Pesquisar por título, instrutor ou categoria..."
                                className="premium-input pl-11 py-2 w-full"
                            />
                        </div>
                        <div className="flex bg-[var(--bg-primary)] p-1 rounded-[var(--radius-sm)] border border-[var(--border-color)]">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-[var(--radius-sm)] transition-all ${viewMode === 'grid' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}><LayoutGrid size={18} /></button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-[var(--radius-sm)] transition-all ${viewMode === 'list' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}><List size={18} /></button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center gap-3 py-32 text-[var(--text-muted)]">
                            <Loader2 size={18} className="animate-spin" />
                            <span className="text-sm">A carregar academia...</span>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
                            {filtered.map(c => {
                                const s = CATEGORY_STYLE[c.category] || CATEGORY_STYLE.MANAGEMENT;
                                const Icon = s.icon;
                                return (
                                    <div key={c.id} className="premium-card group hover:border-[var(--accent)] transition-all flex flex-col overflow-hidden">
                                        <div className="h-32 bg-[var(--bg-primary)]/50 border-b border-[var(--border-color)] flex items-center justify-center relative overflow-hidden">
                                            <Icon size={80} className={`${s.color} opacity-5 group-hover:scale-110 transition-transform duration-700`} />
                                            <div className="absolute top-4 right-4">
                                                <span className={`px-3 py-1 border ${s.border} ${s.bg} rounded-full text-[9px] font-black ${s.color} uppercase tracking-widest backdrop-blur-sm`}>{s.label}</span>
                                            </div>
                                            <div className="absolute bottom-4 left-6 flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)]">
                                                    <Icon size={16} />
                                                </div>
                                                <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">{c.duration}</span>
                                            </div>
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col gap-6">
                                            <div>
                                                <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight group-hover:text-[var(--accent)] transition-colors mb-2">{c.title}</h3>
                                                <p className="text-[11px] text-[var(--text-secondary)] font-medium line-clamp-2 opacity-60 leading-relaxed italic">{c.description || 'Nenhuma descrição técnica providenciada.'}</p>
                                            </div>

                                            <div className="flex items-center justify-between py-4 border-y border-[var(--border-color)]">
                                                <div className="flex items-center gap-2">
                                                    <Users size={14} className="text-[var(--text-muted)]" />
                                                    <span className="text-[10px] font-black text-[var(--text-primary)] uppercase">{c.enrolled} Inscritos</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                                                    <Star size={12} className="text-amber-500 fill-amber-500" />
                                                    <span className="text-[11px] font-black text-amber-500">{c.rating.toFixed(1)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)] font-black text-[10px]">{c.instructor?.charAt(0)}</div>
                                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase truncate max-w-[100px]">{c.instructor}</p>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    {canManage && (
                                                        <>
                                                            <button onClick={() => { setSelectedCourse(c); setLessonModal(true); }} className="p-2 hover:bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] active:scale-95 transition-all"><List size={16} /></button>
                                                            <button onClick={() => handleEdit(c)} className="p-2 hover:bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] active:scale-95 transition-all"><Pencil size={16} /></button>
                                                            <button onClick={() => confirm('Remover curso?') && deleteMutation.mutate(c.id)} className="p-2 hover:bg-rose-500/10 rounded-lg border border-[var(--border-color)] text-rose-500 active:scale-95 transition-all"><Trash2 size={16} /></button>
                                                        </>
                                                    )}
                                                    <button className="premium-button-primary px-4 py-2 text-[9px] uppercase tracking-widest">Aceder</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Performance Sidebar */}
                <div className="space-y-6">
                    <div className="premium-card p-6 gap-6 flex flex-col">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)] flex items-center gap-2">
                            <Zap size={16} /> Skillset Analytics
                        </h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Tecnologia & Dev', p: Math.round((courses.filter(c => c.category === 'IT').length / (courses.length || 1)) * 100), color: 'bg-sky-500' },
                                { label: 'Gestão & Liderança', p: Math.round((courses.filter(c => c.category === 'MANAGEMENT').length / (courses.length || 1)) * 100), color: 'bg-indigo-500' },
                                { label: 'Soft Skills', p: Math.round((courses.filter(c => c.category === 'SOFT_SKILLS').length / (courses.length || 1)) * 100), color: 'bg-emerald-500' },
                                { label: 'Compliance', p: Math.round((courses.filter(c => c.category === 'COMPLIANCE').length / (courses.length || 1)) * 100), color: 'bg-amber-500' },
                            ].map((p, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                        <span className="text-[var(--text-secondary)] opacity-60">{p.label}</span>
                                        <span className="text-[var(--text-primary)]">{p.p}%</span>
                                    </div>
                                    <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-color)]">
                                        <div className={`h-full ${p.color} transition-all duration-1000`} style={{ width: `${p.p}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="premium-card p-8 text-center flex flex-col items-center gap-6 bg-[var(--accent)]/5 border-[var(--accent)]/10">
                        <div className="w-20 h-20 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)] shadow-xl relative">
                            <Award size={32} />
                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-[var(--bg-primary)]" />
                        </div>
                        <div>
                            <h4 className="text-[11px] font-black uppercase text-[var(--text-primary)] tracking-widest mb-1">Compliance Gold</h4>
                            <p className="text-[9px] font-bold text-[var(--text-secondary)] opacity-60 uppercase">Estado: Verificado</p>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] italic leading-relaxed font-medium">
                            "Protocolos de auditoria e conformidade regulamentar validados com sucesso."
                        </p>
                        <button className="premium-button-primary w-full py-3 text-[9px] uppercase tracking-widest">Ver Certificado</button>
                    </div>
                </div>
            </div>

            {/* Strategic Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal(false)} />
                    <div className="relative bg-[var(--bg-primary)] border border-[var(--border-color)] w-full max-w-xl rounded-[var(--radius-lg)] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight text-[var(--text-primary)]">{editingCourse ? 'Editar Módulo' : 'Novo Curso'}</h2>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] opacity-70">Estruturação de Conhecimento</p>
                            </div>
                            <button onClick={() => setModal(false)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-all text-[var(--text-secondary)]"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="premium-label">Título do Curso</label>
                                    <input required className="premium-input" placeholder="Ex: Gestão Estratégica" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="premium-label">Categoria</label>
                                    <span className="premium-input bg-[var(--bg-primary)] relative p-0 overflow-hidden">
                                        <select className="bg-transparent w-full h-full px-4 outline-none appearance-none cursor-pointer text-xs font-bold" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as any }))}>
                                            {Object.entries(CATEGORY_STYLE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                        </select>
                                    </span>
                                </div>
                                <div>
                                    <label className="premium-label">Duração</label>
                                    <input className="premium-input" placeholder="Ex: 4h 30m" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
                                </div>
                                <div className="col-span-2">
                                    <label className="premium-label">Instrutor Responsável</label>
                                    <input required className="premium-input" placeholder="Nome do formador" value={form.instructor} onChange={e => setForm(p => ({ ...p, instructor: e.target.value }))} />
                                </div>
                                <div className="col-span-2">
                                    <label className="premium-label">Descrição / Objectivos</label>
                                    <textarea rows={4} className="premium-input p-4 resize-none" placeholder="Detalhes do conteúdo programático..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                                </div>
                            </div>
                            
                            <div className="pt-6 flex gap-4">
                                <button type="button" onClick={() => setModal(false)} className="premium-button-secondary flex-1 py-4 uppercase tracking-widest text-[9px]">Cancelar</button>
                                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="premium-button-primary flex-[2] py-4 uppercase tracking-widest text-[9px] justify-center">
                                    {(createMutation.isPending || updateMutation.isPending) ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                                    {editingCourse ? 'Guardar Alterações' : 'Publicar Curso'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lesson Manager Modal */}
            {lessonModal && selectedCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setLessonModal(false)} />
                    <div className="relative bg-[var(--bg-primary)] border border-[var(--border-color)] w-full max-w-4xl rounded-[var(--radius-lg)] p-8 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight text-[var(--text-primary)]">Gerir Aulas: {selectedCourse.title}</h2>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] opacity-70">Estrutura Pedagógica</p>
                            </div>
                            <button onClick={() => setLessonModal(false)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-all text-[var(--text-secondary)]"><X size={20} /></button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 overflow-y-auto pr-4 no-scrollbar">
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Plano de Aulas</h3>
                                {isLoadingLessons ? (
                                    <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-[var(--accent)]" /></div>
                                ) : lessons.length === 0 ? (
                                    <div className="p-10 border border-dashed border-[var(--border-color)] rounded-[var(--radius-md)] text-center opacity-40 italic text-xs">Vazio.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {lessons.map((l: any) => (
                                            <div key={l.id} className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[var(--radius-sm)] flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center text-[10px] font-black text-[var(--accent)] border border-[var(--border-color)]">{l.order}</div>
                                                    <div>
                                                        <p className="text-[11px] font-black text-[var(--text-primary)] uppercase">{l.title}</p>
                                                        <p className="text-[9px] font-bold text-[var(--text-secondary)] opacity-60 uppercase">{l.duration}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => deleteLessonMutation.mutate(l.id)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Adicionar Aula</h3>
                                <div className="premium-card p-6 space-y-4">
                                    <input placeholder="Título da Aula" className="premium-input w-full" value={lessonForm.title} onChange={e => setLessonForm(p => ({ ...p, title: e.target.value }))} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input placeholder="Duração (ex: 15m)" className="premium-input w-full" value={lessonForm.duration} onChange={e => setLessonForm(p => ({ ...p, duration: e.target.value }))} />
                                        <input type="number" placeholder="Ordem" className="premium-input w-full" value={lessonForm.order} onChange={e => setLessonForm(p => ({ ...p, order: parseInt(e.target.value) }))} />
                                    </div>
                                    <textarea rows={3} placeholder="Conteúdo / Resumo" className="premium-input w-full p-4 resize-none" value={lessonForm.content} onChange={e => setLessonForm(p => ({ ...p, content: e.target.value }))} />
                                    <button 
                                        onClick={() => createLessonMutation.mutate({ ...lessonForm, courseId: selectedCourse.id })} 
                                        className="premium-button-primary w-full py-4 uppercase tracking-widest text-[9px] justify-center"
                                        disabled={createLessonMutation.isPending}
                                    >
                                        {createLessonMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Adicionar Aula
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
