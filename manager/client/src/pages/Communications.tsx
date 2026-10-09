import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Info, 
    Megaphone, 
    Star, 
    AlertTriangle, 
    Plus, 
    Globe, 
    Search, 
    Activity, 
    Layers, 
    History, 
    Loader2, 
    Radio, 
    ChevronRight, 
    User, 
    Building2,
    ShieldCheck
} from 'lucide-react';
import api from '../api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Modal } from '../components/Modal';

interface Message {
    id: string;
    title: string;
    content: string;
    isGlobal: boolean;
    createdAt: string;
    department?: string;
    author?: string;
    priority?: 'NORMAL' | 'URGENTE' | 'GLOBAL';
}

export default function Communications() {
    const qc = useQueryClient();
    const [selected, setSelected] = useState<Message | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'GLOBAL' | 'URGENT'>('ALL');
    const [form, setForm] = useState({ title: '', content: '', priority: 'LOW', channel: 'INTERNAL' });

    const { data: messages = [], isLoading } = useQuery({
        queryKey: ['messages'],
        queryFn: async () => {
            const { data } = await api.get('/messages');
            return data as Message[];
        }
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/messages', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['messages'] });
            toast.success('Comunicado enviado com sucesso.');
            setIsCreateModalOpen(false);
            setForm({ title: '', content: '', priority: 'LOW', channel: 'INTERNAL' });
        }
    });

    const getIcon = (title: string, priority?: string) => {
        const t = title.toLowerCase();
        if (priority === 'URGENTE' || t.includes('aviso')) return <AlertTriangle className="text-rose-500" size={18} />;
        if (t.includes('atualização')) return <Star className="text-amber-500" size={18} />;
        if (t.includes('novo')) return <Megaphone className="text-emerald-500" size={18} />;
        return <Info className="text-[var(--accent)]" size={18} />;
    };

    const filtered = messages.filter(m =>
        (m.title.toLowerCase().includes(searchTerm.toLowerCase()) || m.content.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filter === 'ALL' || (filter === 'GLOBAL' && m.isGlobal) || (filter === 'URGENT' && m.priority === 'URGENTE'))
    );

    const globalCount = messages.filter(m => m.isGlobal).length;
    const urgentCount = messages.filter(m => m.priority === 'URGENTE').length;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Comunicados Institucionais</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Canais oficiais de informação e orientações institucionais.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => setIsCreateModalOpen(true)} className="premium-button-primary">
                        <Plus size={18} /> Novo Comunicado
                    </button>
                </div>
            </div>

            {/* Metric            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total de Avisos', value: messages.length.toString(), info: 'Registos validados', icon: <Layers size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Alcance Global', value: globalCount.toString(), info: 'Diretivas centrais', icon: <Globe size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                    { label: 'Urgências Ativas', value: urgentCount.toString(), info: 'Prioridade máxima', icon: <AlertTriangle size={15} />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                    { label: 'Status da Rede', value: 'Estável', info: 'Sincronização ativa', icon: <Activity size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
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
            </div>     </div>

            {/* Filter Hub */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1 rounded-[var(--radius-md)] flex items-center gap-2 w-fit shadow-sm">
                {(['ALL', 'GLOBAL', 'URGENT'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-5 py-2 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filter === f ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                    >
                        {f === 'ALL' ? 'Todos os Canais' : f === 'GLOBAL' ? 'Institucional' : 'Urgências'}
                    </button>
                ))}
            </div>

            {/* Broadcast Feed */}
            <div className="grid gap-4">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Sincronizando feed...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center px-5 sm:px-10 border-2 border-dashed border-[var(--border-color)] rounded-2xl">
                        <Radio size={48} className="mb-4 text-[var(--text-muted)] opacity-20" />
                        <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Nenhuma comunicação encontrada</p>
                    </div>
                ) : (
                    filtered.map(msg => (
                        <div key={msg.id} onClick={() => setSelected(msg)} className="premium-card p-6 flex flex-col md:flex-row gap-6 group cursor-pointer">
                            <div className="flex flex-col items-center shrink-0 md:border-r border-[var(--border-color)] md:pr-6">
                                <div className="w-12 h-12 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm mb-2">
                                    {getIcon(msg.title, msg.priority)}
                                </div>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase">{format(new Date(msg.createdAt), 'dd MMM')}</p>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="text-base font-black text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors uppercase tracking-tight">{msg.title}</h2>
                                        {msg.isGlobal && (
                                            <span className="bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-sky-500/20 shadow-sm">
                                                Institucional
                                            </span>
                                        )}
                                        {msg.priority === 'URGENTE' && (
                                            <span className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-rose-500/20 shadow-sm">
                                                Crítico
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase">{msg.department || 'Administração'}</p>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed opacity-70 line-clamp-2 italic">
                                    "{msg.content}"
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Painel Lateral de Detalhes do Comunicado */}
            <Modal
                isOpen={!!selected}
                onClose={() => setSelected(null)}
                title={selected ? selected.title : ''}
                subtitle="Dossiê de Comunicação"
                type="SIDE"
                width="lg"
                icon={selected ? getIcon(selected.title, selected.priority) : <Megaphone size={24} className="text-[var(--accent)]" />}
            >
                {selected && (
                    <div className="p-4 sm:p-8 space-y-8 flex-1 overflow-y-auto no-scrollbar">
                        <div className="p-6 rounded-xl border border-[var(--accent)]/10 bg-[var(--bg-primary)]/40 relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-8 text-left">
                                <div className="w-12 h-12 bg-white dark:bg-black/20 border border-[var(--border-color)] rounded-xl flex items-center justify-center text-[var(--accent)] shadow-sm">
                                    {getIcon(selected.title, selected.priority)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        {selected.isGlobal && (
                                            <span className="bg-sky-500/10 text-sky-500 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-sky-500/20">
                                                Institucional
                                            </span>
                                        )}
                                        <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-50">{format(new Date(selected.createdAt), 'EEEE, dd MMMM yyyy')}</span>
                                    </div>
                                    <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight leading-tight">{selected.department || 'Direção Geral'}</h2>
                                </div>
                            </div>

                            <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-color)]/10 shadow-inner mb-6">
                                <p className="text-sm leading-relaxed text-[var(--text-primary)] opacity-80 whitespace-pre-wrap italic">
                                    "{selected.content}"
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="premium-card p-4 flex flex-col gap-3">
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase opacity-50 mb-1 flex items-center gap-2"><User size={12} /> Autoridade</p>
                                    <p className="text-xs font-black text-[var(--text-primary)] uppercase truncate">{selected.author || 'Administrativo VA'}</p>
                                </div>
                                <div className="premium-card p-4 flex flex-col gap-3">
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase opacity-50 mb-1 flex items-center gap-2"><Building2 size={12} /> Setor Origem</p>
                                    <p className="text-xs font-black text-[var(--text-primary)] uppercase truncate">{selected.department || 'Geral'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-[var(--border-color)]/20 flex gap-4">
                            <button className="premium-button-secondary flex-1">
                                <History size={16} /> Arquivar
                            </button>
                            <button className="premium-button-primary flex-1">
                                <ShieldCheck size={16} /> Validar
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal de Nova Comunicação */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Novo Comunicado"
                subtitle="Canais de Transmissão"
                type="CENTER"
                width="xl"
                icon={<Megaphone size={24} className="text-[var(--accent)]" />}
            >
                <form onSubmit={e => { e.preventDefault(); createMutation.mutate(form); }} className="p-4 sm:p-8 space-y-6">
                    <div>
                        <label className="premium-label">Título da Mensagem</label>
                        <input required placeholder="Ex: Manutenção do Sistema ou Campanha..." className="premium-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="premium-label">Prioridade</label>
                            <select className="premium-input cursor-pointer" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                                <option value="LOW">Baixa</option>
                                <option value="MEDIUM">Média</option>
                                <option value="HIGH">Alta</option>
                                <option value="CRITICAL">Crítica</option>
                            </select>
                        </div>
                        <div>
                            <label className="premium-label">Canal</label>
                            <select className="premium-input cursor-pointer" value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value }))}>
                                <option value="INTERNAL">Interno (App)</option>
                                <option value="EMAIL">E-mail Corporativo</option>
                                <option value="SMS">SMS Gateway</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="premium-label">Corpo da Mensagem</label>
                        <textarea required placeholder="Escreva o conteúdo da comunicação aqui..." className="premium-input min-h-[150px] py-4 resize-none" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="premium-button-secondary flex-1">Descartar</button>
                        <button type="submit" disabled={createMutation.isPending} className="premium-button-primary flex-[2]">
                            {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Megaphone size={18} />}
                            Disparar Comunicação
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
