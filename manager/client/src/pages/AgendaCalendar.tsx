import { useState } from 'react';
import { 
    Calendar, Plus, X, Clock, Users, MapPin, Video, 
    ChevronLeft, ChevronRight, Trash2, Bell, Loader2,
    LayoutGrid, List, PlusCircle, BadgeCheck 
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Modal } from '../components/Modal';

type EventType = 'MEETING' | 'CALL' | 'DEADLINE' | 'TRAINING' | 'HOLIDAY' | 'EVENT';
type EventStatus = 'SCHEDULED' | 'CONFIRMED' | 'DONE' | 'CANCELLED';

interface CalendarEvent {
    id: string;
    title: string;
    type: EventType;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    isVirtual: boolean;
    attendees: string;
    status: EventStatus;
    description: string;
    department: string;
    reminder: number;
}

const TYPE_STYLE: Record<EventType, { label: string; color: string; bg: string; dot: string }> = {
    MEETING: { label: 'Reunião', color: 'text-indigo-400', bg: 'bg-indigo-500/20', dot: 'bg-indigo-500' },
    CALL: { label: 'Chamada', color: 'text-sky-400', bg: 'bg-sky-500/20', dot: 'bg-sky-500' },
    DEADLINE: { label: 'Prazo', color: 'text-red-400', bg: 'bg-red-500/20', dot: 'bg-red-500' },
    TRAINING: { label: 'Formação', color: 'text-emerald-400', bg: 'bg-emerald-500/20', dot: 'bg-emerald-500' },
    HOLIDAY: { label: 'Feriado', color: 'text-amber-400', bg: 'bg-amber-500/20', dot: 'bg-amber-500' },
    EVENT: { label: 'Evento', color: 'text-purple-400', bg: 'bg-purple-500/20', dot: 'bg-purple-500' },
};

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function AgendaCalendar() {
    const queryClient = useQueryClient();
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selected, setSelected] = useState<CalendarEvent | null>(null);
    const [modal, setModal] = useState(false);
    const [view, setView] = useState<'MONTH' | 'LIST'>('MONTH');
    const [filterType, setFilterType] = useState<'ALL' | EventType>('ALL');
    const [form, setForm] = useState({ title: '', type: 'MEETING' as EventType, date: '', startTime: '09:00', endTime: '10:00', location: '', isVirtual: false, description: '', department: 'Direcção' });

    const { data: events = [], isLoading } = useQuery({
        queryKey: ['calendar-events', currentMonth, currentYear],
        queryFn: async () => {
            const start = new Date(currentYear, currentMonth, 1).toISOString();
            const end = new Date(currentYear, currentMonth + 1, 0).toISOString();
            const res = await api.get(`/calendar?start=${start}&end=${end}`);
            return res.data as CalendarEvent[];
        }
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/calendar', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
            setModal(false);
            setForm({ title: '', type: 'MEETING', date: '', startTime: '09:00', endTime: '10:00', location: '', isVirtual: false, description: '', department: 'Direcção' });
            toast.success('Evento adicionado à agenda.');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/calendar/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
            setSelected(null);
            toast.info('Evento removido.');
        }
    });

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const getEventsForDay = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(e => {
            const evDate = e.date.split('T')[0];
            return evDate === dateStr;
        });
    };

    const filteredEvents = filterType === 'ALL'
        ? [...events].sort((a, b) => a.date.localeCompare(b.date))
        : events.filter(e => e.type === filterType).sort((a, b) => a.date.localeCompare(b.date));

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(form);
    };

    const DEPTS = ['Direcção', 'Comercial', 'TI', 'RH', 'Financeiro', 'Marketing', 'Operações'];

    return (
        <div className="space-y-8 pb-32 animate-fade-in">
            {/* Command Center Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-10">
                <div className="relative group">
                    <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-4">
                        <Calendar size={36} className="text-[var(--accent)]" />
                        Agenda Corporativa
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] font-medium opacity-60 mt-1">Sincronização estratégica de eventos e timings institucionais.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1.5 rounded-2xl shadow-inner">
                        <button onClick={() => setView('MONTH')} className={`p-2.5 rounded-xl transition-all ${view === 'MONTH' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                            <LayoutGrid size={20} />
                        </button>
                        <button onClick={() => setView('LIST')} className={`p-2.5 rounded-xl transition-all ${view === 'LIST' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                            <List size={20} />
                        </button>
                    </div>
                    <button onClick={() => setModal(true)} className="premium-button-primary py-4 px-8">
                        <Plus size={20} /> <span className="hidden sm:inline">Projectar Evento</span>
                    </button>
                </div>
            </div>

            {/* Event Type Filter Matriz */}
            <div className="flex items-center gap-3 flex-wrap bg-[var(--bg-secondary)] p-3 rounded-2xl border border-[var(--border-color)] shadow-sm">
                {(['ALL', ...Object.keys(TYPE_STYLE)] as ('ALL' | EventType)[]).map(t => {
                    const isAll = t === 'ALL';
                    const style = !isAll ? TYPE_STYLE[t as EventType] : null;
                    const isActive = filterType === t;
                    return (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm ${isActive ? 'bg-[var(--accent)] border-[var(--accent)] text-white scale-105 shadow-xl' : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent)]/30 hover:text-[var(--accent)]'}`}
                        >
                            {style && <div className={`w-2 h-2 rounded-full ${style.dot} ${isActive ? 'bg-white' : ''}`} />}
                            {isAll ? 'Fluxo Global' : style?.label}
                        </button>
                    );
                })}
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-6 opacity-40">
                    <Loader2 size={48} className="animate-spin text-[var(--accent)]" />
                    <p className="text-[11px] uppercase font-black tracking-[0.4em] italic">Descodificando Matriz Temporal...</p>
                </div>
            ) : (
                <div className="animate-in slide-in-from-bottom duration-700">
                    {view === 'MONTH' && (
                        <div className="premium-card overflow-hidden !p-0 border-2">
                            {/* Calendar Navigation Layer */}
                            <div className="flex items-center justify-between px-10 py-8 bg-gradient-to-r from-[var(--bg-secondary)] to-transparent border-b border-[var(--border-color)]">
                                <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else setCurrentMonth(m => m - 1); }} className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all shadow-sm active:scale-90">
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="text-center">
                                    <h2 className="text-xl font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">{MONTHS[currentMonth]}</h2>
                                    <p className="text-[10px] font-serif italic text-[var(--accent)] font-bold tracking-[0.5em] mt-1">{currentYear}</p>
                                </div>
                                <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else setCurrentMonth(m => m + 1); }} className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all shadow-sm active:scale-90">
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Weekday Grid */}
                            <div className="grid grid-cols-7 bg-[var(--bg-secondary)]/50 border-b border-[var(--border-color)]">
                                {WEEKDAYS.map(d => (
                                    <div key={d} className="py-4 text-center text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">{d}</div>
                                ))}
                            </div>

                            {/* Chronos Grid */}
                            <div className="grid grid-cols-7">
                                {Array.from({ length: firstDay }, (_, i) => (
                                    <div key={`empty-${i}`} className="min-h-[140px] border-r border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/10" />
                                ))}
                                {Array.from({ length: daysInMonth }, (_, i) => {
                                    const day = i + 1;
                                    const dayEvents = getEventsForDay(day);
                                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                    const today = new Date().toISOString().split('T')[0];
                                    const isToday = dateStr === today;
                                    return (
                                        <div key={day} className={`min-h-[140px] border-r border-b border-[var(--border-color)] p-4 hover:bg-[var(--accent)]/[0.02] transition-all group relative ${isToday ? 'bg-[var(--accent)]/[0.04]' : ''}`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <p className={`text-xs font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all border ${isToday ? 'bg-[var(--accent)] text-white shadow-lg border-[var(--accent)] scale-110' : 'text-[var(--text-muted)] border-transparent group-hover:border-[var(--border-color)]'}`}>{day}</p>
                                                {dayEvents.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />}
                                            </div>
                                            <div className="space-y-1.5 relative z-10">
                                                {dayEvents.slice(0, 3).map(ev => {
                                                    const T = TYPE_STYLE[ev.type];
                                                    return (
                                                        <div key={ev.id} onClick={() => setSelected(ev)} className={`text-[9px] font-black px-3 py-1.5 rounded-lg truncate cursor-pointer hover:scale-105 transition-all shadow-sm border border-transparent hover:border-white/20 active:scale-95 ${T.bg} ${T.color} uppercase tracking-tighter`}>
                                                            {ev.title}
                                                        </div>
                                                    );
                                                })}
                                                {dayEvents.length > 3 && (
                                                    <div className="text-[8px] font-black text-[var(--accent)] pl-1 uppercase tracking-widest italic opacity-60">
                                                        +{dayEvents.length - 3} Ocorrências
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {view === 'LIST' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredEvents.length === 0 ? (
                                <div className="lg:col-span-2 premium-card py-32 text-center group border-2 border-dashed flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-3xl flex items-center justify-center text-[var(--text-muted)] mb-8 opacity-20 group-hover:scale-110 transition-transform">
                                        <Calendar size={40} />
                                    </div>
                                    <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-widest mb-2 opacity-60">Vazio Temporal</h3>
                                    <p className="text-sm text-[var(--text-secondary)] font-medium opacity-40">Nenhum evento projectado para este escopo.</p>
                                </div>
                            ) : (
                                filteredEvents.map(ev => {
                                    const T = TYPE_STYLE[ev.type];
                                    const evDate = new Date(ev.date);
                                    return (
                                        <div key={ev.id} onClick={() => setSelected(ev)} className="premium-card p-8 cursor-pointer group hover:border-[var(--accent)]/30 transition-all flex items-center gap-8 border-2 border-transparent">
                                            <div className="text-center shrink-0 w-16 group-hover:scale-110 transition-transform">
                                                <p className="text-[11px] text-[var(--accent)] font-black uppercase tracking-[0.2em] mb-1">{MONTHS[evDate.getMonth()].substring(0, 3)}</p>
                                                <p className="text-3xl font-black tabular-nums tracking-tighter text-[var(--text-primary)]">{evDate.getDate()}</p>
                                            </div>
                                            <div className="w-px h-16 bg-[var(--border-color)] shrink-0 opacity-40" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-xl border-2 shadow-sm ${T.bg} ${T.color} border-current/10 flex items-center gap-2`}>
                                                        {T.label}
                                                    </span>
                                                    <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest bg-[var(--bg-secondary)] px-3 py-1 rounded-lg border border-[var(--border-color)]">{ev.department}</span>
                                                </div>
                                                <p className="text-lg font-black tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-tight mb-4">{ev.title}</p>
                                                <div className="flex flex-wrap items-center gap-6">
                                                    <span className="text-[10px] font-bold text-[var(--text-secondary)] flex items-center gap-2 tracking-tight opacity-70"><Clock size={16} className="text-[var(--accent)]" />{ev.startTime} — {ev.endTime}</span>
                                                    <span className="text-[10px] font-bold text-[var(--text-secondary)] flex items-center gap-2 tracking-tight opacity-70">
                                                        {ev.isVirtual ? <Video size={16} className="text-sky-500" /> : <MapPin size={16} className="text-rose-500" />}{ev.location || 'Local Indefinido'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <ChevronRight size={24} className="text-[var(--accent)]" />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Event Profile Overlay */}
            {selected && (
                <div className="fixed inset-0 z-[100] flex items-center justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setSelected(null)} />
                    <div className="relative w-full max-w-md bg-[var(--bg-secondary)] border-l-2 border-[var(--border-color)] h-full overflow-y-auto no-scrollbar p-10 shadow-premium animate-in slide-in-from-right duration-500">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="font-black text-[11px] uppercase tracking-[.3em] text-[var(--accent)]">Protocolo de Evento</h3>
                                <p className="text-[10px] font-medium text-[var(--text-muted)] italic mt-1">Sincronização ID: {selected.id.substring(0,8).toUpperCase()}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl hover:text-rose-500 transition-all hover:border-rose-200 active:scale-90"><X size={20} /></button>
                        </div>

                        <div className="space-y-10">
                            <div className={`p-8 rounded-[2rem] border-2 shadow-2xl relative overflow-hidden group ${TYPE_STYLE[selected.type].bg.replace('bg-', 'bg-')}`}>
                                <div className="absolute top-[-20px] right-[-20px] p-8 opacity-[0.05] scale-[2] rotate-12">{TYPE_STYLE[selected.type].dot && <Calendar size={60} />}</div>
                                <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg border-2 ${TYPE_STYLE[selected.type].bg} ${TYPE_STYLE[selected.type].color} border-current/20`}>{TYPE_STYLE[selected.type].label}</span>
                                <p className="font-black text-2xl mt-6 tracking-tighter text-[var(--text-primary)] leading-tight">{selected.title}</p>
                                <p className="text-sm text-[var(--text-secondary)] mt-4 leading-relaxed font-medium opacity-80">{selected.description || 'Não existem descrições técnicas projectadas para esta ocorrência.'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Timeline', value: new Date(selected.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' }), icon: <Calendar size={16} /> },
                                    { label: 'Horário', value: `${selected.startTime} — ${selected.endTime}`, icon: <Clock size={16} /> },
                                    { label: 'Espaço', value: selected.location || 'Hibrido', icon: selected.isVirtual ? <Video size={16} className="text-sky-500" /> : <MapPin size={16} className="text-rose-500" /> },
                                    { label: 'Squad', value: selected.department, icon: <Users size={16} /> },
                                ].map((item, i) => (
                                    <div key={i} className="premium-card !p-5 border bg-[var(--bg-primary)]/40 flex flex-col gap-3 group/item hover:border-[var(--accent)]/30 transition-all">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{item.label}</p>
                                            <div className="opacity-40 group-hover/item:opacity-100 transition-opacity">{item.icon}</div>
                                        </div>
                                        <p className="font-black text-xs tracking-tight text-[var(--text-primary)]">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="premium-card p-6 bg-gradient-to-br from-[var(--bg-primary)] to-transparent border-dashed">
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Users size={14} className="text-[var(--accent)]" /> 
                                    Painel de Presenças ({(selected.attendees?.split(',').filter(Boolean).length || 0)})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {(selected.attendees?.split(',').filter(Boolean).length || 0) > 0 ? (
                                        selected.attendees?.split(',').filter(Boolean).map((a, i) => (
                                            <span key={i} className="bg-[var(--accent)]/5 border-2 border-[var(--accent)]/10 px-4 py-2 rounded-xl text-[10px] font-black text-[var(--accent)] shadow-sm hover:scale-105 transition-transform">{a}</span>
                                        ))
                                    ) : (
                                        <span className="text-[10px] text-[var(--text-muted)] font-medium italic opacity-60">Diretório de participantes vazio.</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-10">
                                <button onClick={() => { toast.info('Sincronização Mobile em curso...'); }} className="flex-1 py-5 bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:border-[var(--accent)]/30 hover:text-[var(--accent)] transition-all active:scale-95">
                                    <Bell size={18} /> Alerta
                                </button>
                                <button
                                    onClick={() => { if(confirm('Remover evento da linha temporal?')) deleteMutation.mutate(selected.id); }}
                                    disabled={deleteMutation.isPending}
                                    className="flex-1 py-5 border-2 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {deleteMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />} Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Creation Workspace Modal */}
            <Modal
                isOpen={modal}
                onClose={() => setModal(false)}
                title="Projectar Novo Evento"
                subtitle="Sincronização de Calendário Organizacional"
                type="CENTER"
                width="xl"
                icon={<PlusCircle size={24} className="text-[var(--accent)]" />}
            >
                <form onSubmit={handleCreate} className="p-8 sm:p-12 space-y-10">
                    <div className="space-y-8">
                        <div>
                            <label className="premium-label pl-4">Identificação do Evento</label>
                            <input required className="premium-input !py-5" placeholder="Ex: Cimeira Estratégica Q4..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="premium-label pl-4">Protocolo</label>
                                <select className="premium-input bg-transparent appearance-none cursor-pointer" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as EventType }))}>
                                    {Object.entries(TYPE_STYLE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="premium-label pl-4">Timeline (Data)</label>
                                <input required type="date" className="premium-input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="premium-label pl-4">Início Operacional</label>
                                <input type="time" className="premium-input" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} />
                            </div>
                            <div>
                                <label className="premium-label pl-4">Conclusão Prevista</label>
                                <input type="time" className="premium-input" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="premium-label pl-4">Espaço / Link Dinâmico</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--accent)] opacity-40" />
                                    <input className="premium-input !pl-14" placeholder="Ex: Sala de Inovação..." value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <label className="premium-label pl-4">Unidade de Negócio</label>
                                <select className="premium-input bg-transparent appearance-none cursor-pointer" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}>
                                    {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="p-6 bg-[var(--bg-primary)]/50 rounded-2xl border-2 border-dashed border-[var(--border-color)]/30 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${form.isVirtual ? 'bg-sky-500 border-sky-400 text-white shadow-lg' : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)]'}`}>
                                    <Video size={20} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)]">Evento Virtual</p>
                                    <p className="text-[9px] font-medium text-[var(--text-muted)] opacity-60 italic">Habilitar protocolo de videoconferência.</p>
                                </div>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="v-toggle" className="sr-only peer" checked={form.isVirtual} onChange={e => setForm(p => ({ ...p, isVirtual: e.target.checked }))} />
                                <div className="w-14 h-8 bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] shadow-inner"></div>
                            </div>
                        </div>
                        <div>
                            <label className="premium-label pl-4">Notas & Pauta Estratégica</label>
                            <textarea rows={4} className="premium-input !rounded-[2rem] resize-none" placeholder="Detalhes adicionais para os participantes..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={() => setModal(false)} className="premium-button-secondary flex-1 py-5">Descartar</button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="premium-button-primary flex-[2] py-5 shadow-indigo-600/20 active:scale-[0.98]"
                        >
                            {createMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <BadgeCheck size={20} />} Confirmar Agendamento
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
