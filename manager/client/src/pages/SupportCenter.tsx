import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    LifeBuoy, MessageSquare, Ticket, BookOpen, Star,
    Search, Plus, Clock,
    AlertCircle,
    Mail, Phone, Activity, Zap, MoreVertical,
    ArrowUpRight, ShieldCheck, Loader2, Binary, Headphones,
    Users, BarChart3, Fingerprint, Calendar, HelpCircle
} from 'lucide-react';
import api from '../api';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function SupportCenter() {
    const [view, setView] = useState<'TICKETS' | 'KNOWLEDGE' | 'SLA'>('TICKETS');

    // Use invoices as tickets proxy (open = PENDING/DRAFT, solved = PAID/FINAL)
    const { data: invoicesRaw, isLoading } = useQuery({
        queryKey: ['support-invoices'],
        queryFn: async () => (await api.get('/invoices')).data
    });

    if (isLoading) {
        return (
            <div className="py-40 flex flex-col items-center justify-center gap-4 sm:gap-8 text-[var(--text-secondary)] text-center">
                <div className="relative">
                    <Loader2 size={48} className="animate-spin text-[var(--accent)]" />
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-[var(--accent)]/20 blur-2xl rounded-full" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.5em] opacity-40 animate-pulse">Estabelecendo Ligação com Matriz de Suporte VA...</span>
            </div>
        );
    }

    const invoices: any[] = invoicesRaw || [];
    const tickets = invoices.slice(0, 10).map((inv: any) => ({
        id: inv.number || inv.id.slice(0, 8),
        title: `Protocolo de Assistência #${inv.number || inv.id.slice(0, 8)}`,
        customer: inv.client?.name || 'ENTIDADE EXTERNA',
        type: inv.status === 'DRAFT' ? 'SUPPORT' : inv.status === 'OVERDUE' ? 'BUG' : 'FEATURE',
        priority: inv.totalAmount > 1000000 ? 'HIGH' : 'MEDIUM',
        status: inv.status === 'PAID' || inv.status === 'FINAL' ? 'SOLVED' : inv.status === 'CANCELLED' ? 'CLOSED' : 'OPEN',
        date: inv.createdAt || inv.issueDate,
        owner: 'CENTRAL_HUB'
    }));

    const stats = {
        open: tickets.filter((t: any) => t.status === 'OPEN').length,
        avgResponse: '12m 45s',
        satisfaction: '4.8/5',
        resolutionRate: '94.2%'
    };

    return (
        <div className="space-y-8 pb-24">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] flex items-center gap-3 uppercase tracking-tight shadow-text underline decoration-[var(--accent)] decoration-4 underline-offset-8">
                        <LifeBuoy size={28} className="text-[var(--accent)]" /> Suporte & Customer Success Hub
                    </h1>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-6 font-black uppercase tracking-[0.2em] opacity-60">Gestão de Tickets, Monitorização de SLA e Matriz de Experiência do Provedor.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3.5 bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all shadow-sm">
                        <BookOpen size={16} /> Knowledge Base
                    </button>
                    <button className="bg-[var(--accent)] hover:opacity-90 active:scale-95 text-white px-4 sm:px-8 py-3.5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-[var(--accent)]/30 transition-all border border-[var(--accent)]/30 group">
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Abertura de Ticket
                    </button>
                </div>
            </div>

            {/* KPI Matrix Swiper */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Protocolos Activos', value: stats.open, sub: 'Vectores Pendentes', icon: <Ticket size={20} />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                    { label: 'Tempo Médio Matriz', value: stats.avgResponse, sub: 'Response SLA / 24h', icon: <Clock size={20} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                    { label: 'Índice de Satisfação', value: stats.satisfaction, sub: 'Score VA-Insights', icon: <Star size={20} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                    { label: 'Eficiência de Resolução', value: stats.resolutionRate, sub: 'First Flight Finish', icon: <Zap size={20} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                ].map((kpi, i) => (
                    <div key={i} className="fluent-card p-6 flex flex-col gap-6 group hover:shadow-2xl transition-all border-b-4 border-b-transparent hover:border-b-[var(--accent)]/20 shadow-xl shadow-black/5">
                        <div className="flex items-center justify-between">
                            <div className={`w-12 h-12 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>{kpi.icon}</div>
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-20 italic">HUB_SEC_{i+1}</span>
                        </div>
                        <div>
                            <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-[0.2em] mb-1.5 opacity-50">{kpi.label}</p>
                            <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tabular-nums tracking-tighter shadow-text italic leading-none">{kpi.value}</p>
                            <p className="text-[8px] font-bold text-[var(--accent)] uppercase tracking-tight mt-2 opacity-60 font-mono tracking-[0.2em]">{kpi.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-8">
                {/* Main Operations Block */}
                <div className="xl:col-span-3 space-y-8">
                    <div className="fluent-card overflow-hidden bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)]/30 shadow-2xl relative group">
                        <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-5 pointer-events-none"><Headphones size={120} /></div>
                        
                        <div className="p-4 sm:p-8 border-b border-[var(--border-color)]/30 bg-[var(--bg-primary)]/50 flex flex-col md:flex-row items-center justify-between gap-6 z-10 relative">
                            <div className="flex items-center gap-3 p-1.5 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)]/50 shadow-inner">
                                <button className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all ${view === 'TICKETS' ? 'bg-[var(--accent)] text-white shadow-xl translate-y-[-1px]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`} onClick={() => setView('TICKETS')}>Todos os Protocolos</button>
                                <button className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all ${view === 'SLA' ? 'bg-[var(--accent)] text-white shadow-xl translate-y-[-1px]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`} onClick={() => setView('SLA')}>Monitorização SLA</button>
                            </div>
                            <div className="relative flex-1 max-w-sm w-full">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40" />
                                <input type="text" placeholder="LOCALIZAR PROTOCOLO OU ENTIDADE..." className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)]/50 py-3.5 pl-12 pr-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] outline-none focus:ring-1 focus:ring-[var(--accent)] shadow-inner placeholder:opacity-40" />
                            </div>
                        </div>

                        <div className="overflow-x-auto min-h-[500px]">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[var(--bg-primary)]/30 border-b border-[var(--border-color)]">
                                    <tr>
                                        {['Ticket / Identidade', 'Entidade / Cliente', 'Prioridade', 'Supervisor', 'Estado de Matriz'].map(h => (
                                            <th key={h} className="px-4 sm:px-8 py-6 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]/20">
                                    {tickets.map((t, i) => (
                                        <tr key={i} className="hover:bg-[var(--bg-primary)] transition-all group/row cursor-default">
                                            <td className="px-4 sm:px-8 py-8 border-l-4 border-l-transparent hover:border-l-[var(--accent)] transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-12 h-12 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] group-hover/row:text-[var(--accent)] group-hover/row:scale-110 transition-all shadow-inner`}>
                                                        {t.type === 'BUG' ? <AlertCircle size={20} className="text-rose-500" /> : t.type === 'FEATURE' ? <Zap size={20} className="text-amber-500" /> : <HelpCircle size={20} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight leading-none mb-1.5 shadow-sm">{t.title}</p>
                                                        <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-40 italic font-mono">NODE: {t.id} · {t.type}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-8 py-8">
                                                <p className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">{t.customer}</p>
                                            </td>
                                            <td className="px-4 sm:px-8 py-8">
                                                <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border ${t.priority === 'URGENT' || t.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20 shadow-rose-500/10' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-color)]'} shadow-sm`}>
                                                    {t.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-8 py-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[10px] font-black text-[var(--accent)] shadow-inner">{t.owner[0]}</div>
                                                    <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-80">{t.owner}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-8 py-8">
                                                <div className="flex items-center gap-4">
                                                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] border shadow-sm ${t.status === 'SOLVED' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : t.status === 'IN_PROGRESS' ? 'text-sky-500 bg-sky-500/10 border-sky-500/20' : 'text-rose-500 bg-rose-500/10 border-rose-500/20'}`}>
                                                        {t.status.replace('_', ' ')}
                                                    </span>
                                                    <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all opacity-0 group-hover/row:opacity-100"><MoreVertical size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                        <div className="fluent-card p-5 sm:p-10 bg-indigo-600/[0.03] border-l-4 border-l-indigo-600 group hover:shadow-2xl transition-all relative overflow-hidden shadow-xl rounded-[3rem]">
                            <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                            <div className="flex items-center gap-6 mb-8 relative z-10">
                                <div className="p-4 bg-indigo-600/10 text-indigo-600 rounded-[1.5rem] shadow-inner border border-indigo-600/20 group-hover:rotate-12 transition-transform"><MessageSquare size={32} /></div>
                                <div>
                                    <h4 className="text-base font-black text-[var(--text-primary)] uppercase tracking-tight leading-none mb-1.5 shadow-sm">Canais de Interação Digital</h4>
                                    <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-[0.3em] opacity-40 italic">Monitorização VA-CHAT em Tempo Real</p>
                                </div>
                            </div>
                            <div className="p-6 bg-[var(--bg-primary)]/60 rounded-[1.5rem] border border-[var(--border-color)]/30 backdrop-blur-sm relative z-10 flex items-center justify-between group/live cursor-crosshair">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Users size={24} className="text-emerald-500 opacity-60" />
                                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] leading-none mb-1 shadow-sm">Live Agents: <span className="text-emerald-500">Activo</span></p>
                                        <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase opacity-40">3 Interações em curso na rede</p>
                                    </div>
                                </div>
                                <ArrowUpRight size={20} className="text-[var(--text-secondary)] opacity-20 group-hover/live:translate-x-1 group-hover/live:-translate-y-1 group-hover/live:opacity-100 transition-all" />
                            </div>
                        </div>

                        <div className="fluent-card p-5 sm:p-10 bg-amber-600/[0.03] border-l-4 border-l-amber-600 group relative overflow-hidden shadow-xl rounded-[3rem]">
                            <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                            <h4 className="text-base font-black text-[var(--text-primary)] mb-8 uppercase tracking-[0.3em] relative z-10 opacity-80 flex items-center gap-4 border-b border-[var(--border-color)]/20 pb-4 leading-none"><Star size={20} className="text-amber-500" /> Matriz de Feedback</h4>
                            <div className="flex flex-col gap-6 relative z-10">
                                <div className="flex items-center gap-3">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} className={i <= 4 ? 'text-amber-500 fill-amber-500 drop-shadow-md group-hover:scale-110 transition-transform' : 'text-[var(--border-color)]'} style={{ transitionDelay: `${i * 100}ms` }} />)}
                                </div>
                                <div>
                                    <span className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tighter italic shadow-text">4.8 <span className="text-[10px] text-[var(--text-secondary)] not-italic uppercase tracking-[0.4em] ml-2 opacity-40">Net Promoter Score</span></span>
                                    <div className="h-1.5 bg-[var(--bg-primary)] rounded-full mt-4 overflow-hidden border border-[var(--border-color)]/20">
                                        <div className="h-full bg-amber-500 opacity-60" style={{ width: '96%' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cyber Sidebar - Intelligence Panel */}
                <div className="space-y-8">
                    <div className="fluent-card p-4 sm:p-8 bg-[var(--bg-secondary)] border border-[var(--border-color)]/30 rounded-[2.5rem] shadow-2xl relative group/side">
                        <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-5 group-hover/side:opacity-10 transition-opacity"><Fingerprint size={80} /></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent)] mb-10 pb-4 border-b border-[var(--border-color)]/40 italic flex items-center gap-4 relative z-10"><BarChart3 size={18} /> Atalhos de Matriz</h3>
                        <div className="space-y-4 relative z-10">
                            {[
                                { icon: <Mail size={18} />, label: 'Relatórios de Ciclo', desc: 'support@vaonegest.com', color: 'text-sky-500' },
                                { icon: <Phone size={18} />, label: 'Protocolo de Emergência', desc: 'Linha Directa Hub', color: 'text-rose-500' },
                                { icon: <LifeBuoy size={18} />, label: 'Dossiê do Cliente', desc: 'Acesso Portal Externo', color: 'text-indigo-500' },
                            ].map((s, i) => (
                                <button key={i} className="w-full p-5 bg-[var(--bg-primary)]/40 border border-[var(--border-color)]/40 rounded-[1.5rem] flex items-center gap-5 hover:border-[var(--accent)] hover:bg-[var(--bg-secondary)] transition-all text-left shadow-sm group/btn hover:shadow-xl">
                                    <div className={`${s.color} opacity-60 group-hover/btn:opacity-100 group-hover/btn:scale-110 group-hover/btn:rotate-6 transition-all`}>{s.icon}</div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-tight leading-none mb-2 select-none group-hover/btn:text-[var(--accent)] transition-colors">{s.label}</p>
                                        <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-[0.1em] opacity-40 truncate italic">{s.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="fluent-card p-5 sm:p-10 bg-emerald-600/[0.04] border border-emerald-500/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden group/sla">
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover/sla:scale-150 transition-transform duration-1000" />
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] opacity-80 leading-none italic shadow-sm">Cumprimento SLA Matriz</h4>
                            <ShieldCheck size={24} className="text-emerald-500 opacity-60 group-hover/sla:scale-110 transition-transform" />
                        </div>
                        <div className="flex items-baseline gap-3 relative z-10">
                            <span className="text-4xl sm:text-5xl font-black text-emerald-600 tracking-tighter tabular-nums italic drop-shadow-sm group-hover/sla:scale-105 transition-transform">99<span className="text-xl sm:text-2xl ml-1 opacity-40">.2%</span></span>
                        </div>
                        <div className="space-y-6 mt-10 relative z-10">
                            <div className="h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden shadow-inner border border-emerald-500/10 p-0.5">
                                <div className="h-full bg-emerald-500 shadow-xl shadow-emerald-500/50 opacity-80 transition-all duration-2000" style={{ width: '99%' }} />
                            </div>
                            <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-widest leading-relaxed opacity-50 italic border-l border-emerald-500/30 pl-4 bg-emerald-500/[0.02] py-4 rounded-r-xl">
                                Protocolos em conformidade absoluta com o SLA VA-TRUST para o ciclo corrente sem deflexões críticas.
                            </p>
                        </div>
                    </div>

                    <div className="fluent-card p-5 sm:p-10 bg-[var(--accent)] rounded-[2.5rem] text-white shadow-2xl shadow-[var(--accent)]/30 group overflow-hidden relative border border-white/20">
                        <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000 scale-150"><Zap size={64} /></div>
                        <div className="relative z-10">
                            <div className="kpi-icon bg-white/20 flex items-center justify-center border border-white/20 mb-10 shadow-2xl backdrop-blur-md group-hover:rotate-12 transition-transform">
                                <Activity size={32} />
                            </div>
                            <h4 className="text-xl font-black uppercase tracking-tight mb-4 shadow-text">Sessão Remota Hub</h4>
                            <p className="text-[13px] leading-relaxed font-black italic mb-10 opacity-90 border-l-4 border-white/30 pl-8 uppercase tracking-tight">
                                Protocolo <span className="underline decoration-white decoration-4 underline-offset-4">VA-ACCESS</span>: Inicie assistência remota encriptada via túnel SCM Hub.
                            </p>
                            <button className="w-full py-5 bg-white text-[var(--accent)] text-[11px] font-black uppercase rounded-2xl shadow-xl active:scale-95 transition-all tracking-[0.3em] flex items-center justify-center gap-3 group/btn">
                                Gerar Token de Matriz <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sovereign Matrix Footer */}
            <div className="fluent-card p-6 sm:p-12 bg-[var(--bg-primary)]/30 border border-dashed border-[var(--border-color)] flex flex-col items-center gap-6 text-center shadow-inner group/sync rounded-[3rem]">
                <Binary size={64} className="text-[var(--text-secondary)] opacity-10 rotate-12 group-hover/sync:rotate-0 transition-all duration-[2000ms] shadow-sm" />
                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] leading-relaxed opacity-40 font-mono italic">
                    va-support-matrix.service // encryption-node: HUB_LUANDA_SEC_04 // status: sovereign_synced
                </p>
                <div className="flex items-center gap-6 sm:gap-12 text-[9px] font-black uppercase tracking-[0.4em] opacity-30 mt-8">
                    <span className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" /> Protocolos em Compliance</span>
                    <span className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-lg shadow-sky-500/50 animate-pulse delay-700" /> Rede Sincronizada Hub</span>
                    <span className="flex items-center gap-3 border-l border-[var(--border-color)]/30 pl-12"><Calendar size={12} /> {format(new Date(), "dd MMMM yyyy '::' HH:mm", { locale: pt }).toUpperCase()}</span>
                </div>
            </div>
        </div>
    );
}
