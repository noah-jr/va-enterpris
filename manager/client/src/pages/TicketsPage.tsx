import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Ticket, Plus, MessageSquare, Clock, CheckCircle2,
    AlertCircle, ChevronDown, ChevronUp, Send, Loader2,
    X, LifeBuoy, Tag, ArrowUpRight
} from 'lucide-react';
import api from '../api';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const CATEGORIES = ['GENERAL', 'BILLING', 'TECHNICAL', 'ACCOUNT', 'FEATURE'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    OPEN:        { label: 'Aberto',       color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
    IN_PROGRESS: { label: 'Em Progresso', color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
    RESOLVED:    { label: 'Resolvido',    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    CLOSED:      { label: 'Fechado',      color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' },
};

const PRIORITY_MAP: Record<string, string> = {
    LOW:    'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
    MEDIUM: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    HIGH:   'text-orange-500 bg-orange-500/10 border-orange-500/20',
    URGENT: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
};

export default function TicketsPage() {
    const qc = useQueryClient();
    const [openNewModal, setOpenNewModal] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [form, setForm] = useState({ subject: '', category: 'GENERAL', priority: 'MEDIUM', message: '' });

    const { data: tickets = [], isLoading } = useQuery({
        queryKey: ['my-tickets'],
        queryFn: async () => (await api.get('/tickets')).data,
    });

    const createTicket = useMutation({
        mutationFn: (data: typeof form) => api.post('/tickets', data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-tickets'] }); setOpenNewModal(false); setForm({ subject: '', category: 'GENERAL', priority: 'MEDIUM', message: '' }); },
    });

    const sendReply = useMutation({
        mutationFn: ({ id, message }: { id: string; message: string }) => api.post(`/tickets/${id}/reply`, { message }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-tickets'] }); setReplyText(''); },
    });

    return (
        <div className="space-y-8 pb-24">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Suporte & Tickets</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Comunicação directa com a equipa de suporte institucional.</p>
                </div>
                <button
                    onClick={() => setOpenNewModal(true)}
                    className="premium-button-primary"
                >
                    <Plus size={18} /> Novo Ticket
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total',       value: tickets.length,                                        icon: <Ticket size={15} />, color: 'text-zinc-400' },
                    { label: 'Abertos',     value: tickets.filter((t: any) => t.status === 'OPEN').length,        icon: <Clock size={15} />, color: 'text-rose-500' },
                    { label: 'Em Curso',    value: tickets.filter((t: any) => t.status === 'IN_PROGRESS').length, icon: <MessageSquare size={15} />, color: 'text-sky-500' },
                    { label: 'Resolvidos',  value: tickets.filter((t: any) => t.status === 'RESOLVED').length,    icon: <CheckCircle2 size={15} />, color: 'text-emerald-500' },
                ].map((s) => (
                    <div key={s.label} className="premium-card p-4 flex items-start gap-3">
                        <div className={`kpi-icon shrink-0 ${s.color} bg-zinc-50 dark:bg-zinc-500/10`}>
                            {s.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-[var(--text-muted)] mb-0.5 truncate">{s.label}</p>
                            <p className="text-base font-bold text-[var(--text-primary)] tabular-nums leading-tight">{s.value.toString().padStart(2, '0')}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Ticket list */}
            {isLoading ? (
                <div className="py-20 flex items-center justify-center"><Loader2 size={36} className="animate-spin text-[var(--accent)]" /></div>
            ) : tickets.length === 0 ? (
                <div className="fluent-card p-16 text-center">
                    <Ticket size={48} className="mx-auto text-[var(--text-secondary)] opacity-20 mb-6" />
                    <p className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40">Nenhum ticket ainda</p>
                    <button onClick={() => setOpenNewModal(true)} className="mt-6 bg-[var(--accent)] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all">
                        Criar Primeiro Ticket
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets.map((ticket: any) => {
                        const st = STATUS_MAP[ticket.status] || STATUS_MAP.OPEN;
                        const expanded = expandedId === ticket.id;
                        return (
                            <div key={ticket.id} className="fluent-card overflow-hidden transition-all">
                                {/* Ticket header row */}
                                <button
                                    className="w-full p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 text-left hover:bg-[var(--bg-secondary)]/50 transition-colors"
                                    onClick={() => setExpandedId(expanded ? null : ticket.id)}
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                                            <Ticket size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black text-sm text-[var(--text-primary)] truncate">{ticket.subject}</p>
                                            <p className="text-[10px] text-[var(--text-secondary)] opacity-50 font-bold uppercase tracking-widest mt-0.5">
                                                #{ticket.id.slice(0, 8)} · {ticket.category} · {format(new Date(ticket.createdAt), 'dd MMM yyyy', { locale: pt })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${PRIORITY_MAP[ticket.priority]}`}>
                                            {ticket.priority}
                                        </span>
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${st.color}`}>
                                            {st.label}
                                        </span>
                                        <span className="text-[var(--text-secondary)] opacity-40">
                                            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </span>
                                    </div>
                                </button>

                                {/* Expanded thread */}
                                {expanded && (
                                    <div className="border-t border-[var(--border-color)]/30 p-5 sm:p-6 space-y-4 bg-[var(--bg-primary)]/30">
                                        {(ticket.messages || []).map((msg: any) => {
                                            const isAdmin = msg.senderRole === 'ADMIN';
                                            return (
                                                <div key={msg.id} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${isAdmin ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}>
                                                        {isAdmin ? 'VA' : 'U'}
                                                    </div>
                                                    <div className={`max-w-[75%] p-3 rounded-2xl text-sm font-medium ${isAdmin ? 'bg-[var(--accent)]/10 text-[var(--text-primary)] rounded-tr-sm' : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-tl-sm'}`}>
                                                        <p>{msg.content}</p>
                                                        <p className="text-[9px] opacity-40 mt-1 font-bold uppercase tracking-widest">
                                                            {format(new Date(msg.createdAt), 'dd MMM HH:mm', { locale: pt })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Reply box */}
                                        {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
                                            <div className="flex gap-3 pt-2">
                                                <textarea
                                                    value={replyText}
                                                    onChange={e => setReplyText(e.target.value)}
                                                    placeholder="Escreva a sua resposta..."
                                                    rows={2}
                                                    className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-xl p-3 text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-40 resize-none outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                                />
                                                <button
                                                    disabled={!replyText.trim() || sendReply.isPending}
                                                    onClick={() => sendReply.mutate({ id: ticket.id, message: replyText })}
                                                    className="self-end w-10 h-10 bg-[var(--accent)] text-white rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-all active:scale-95"
                                                >
                                                    {sendReply.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* New Ticket Modal */}
            {openNewModal && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpenNewModal(false)} />
                    <div className="relative bg-[var(--bg-primary)] border border-[var(--border-color)]/50 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Novo Ticket de Suporte</h2>
                            <button onClick={() => setOpenNewModal(false)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-xl transition-colors">
                                <X size={20} className="text-[var(--text-secondary)]" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Assunto *"
                                value={form.subject}
                                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-xl px-4 py-3 text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-40 outline-none focus:ring-1 focus:ring-[var(--accent)]"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    value={form.category}
                                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                    className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <select
                                    value={form.priority}
                                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                                    className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                >
                                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <textarea
                                rows={5}
                                placeholder="Descreva o seu problema em detalhe... *"
                                value={form.message}
                                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-xl px-4 py-3 text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-40 resize-none outline-none focus:ring-1 focus:ring-[var(--accent)]"
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setOpenNewModal(false)} className="flex-1 py-3 rounded-xl border border-[var(--border-color)]/50 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all">
                                Cancelar
                            </button>
                            <button
                                disabled={!form.subject || !form.message || createTicket.isPending}
                                onClick={() => createTicket.mutate(form)}
                                className="flex-1 py-3 bg-[var(--accent)] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                            >
                                {createTicket.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                Enviar Ticket
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
