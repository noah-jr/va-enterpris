import { useState } from 'react';
import { Activity, ShieldAlert, Wind, Search, Zap, HardHat, Thermometer, Droplets, Flame, History, ChevronRight, Users, FileWarning, X, Loader2, ShieldCheck, BarChart3, AlertOctagon, Microscope, Layers, Printer, ArrowUpRight, MapPin, AlertTriangle, Calendar, User, Filter, MoreHorizontal, Download, Database } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import { SearchableSelect } from '../components/SearchableSelect';

interface Incident {
    id: string; title: string; type: string; location: string;
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    date: string; reporter: string; description?: string;
    status: string;
}

const LEVEL_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any; accent: string }> = {
    LOW: { label: 'Baixo', color: 'text-sky-700 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10', border: 'border-sky-200 dark:border-sky-500/20', icon: ShieldCheck, accent: 'bg-sky-500' },
    MEDIUM: { label: 'Médio', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', icon: Activity, accent: 'bg-amber-500' },
    HIGH: { label: 'Alto', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/20', icon: AlertTriangle, accent: 'bg-orange-500' },
    CRITICAL: { label: 'Crítico', color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20', icon: ShieldAlert, accent: 'bg-rose-500' },
};

export default function HSEModule() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState<Incident | null>(null);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({ title: '', type: 'Acidente Operacional', location: '', level: 'MEDIUM', date: new Date().toISOString().slice(0, 16), reporter: '', description: '' });

    const { data: incidentsData, isLoading } = useQuery({
        queryKey: ['hse-incidents'],
        queryFn: async () => (await api.get('/compliance-hse/incidents')).data as Incident[]
    });

    const { data: stats } = useQuery({
        queryKey: ['hse-stats'],
        queryFn: async () => (await api.get('/compliance-hse/stats')).data
    });

    const incidents = incidentsData || [];

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/compliance-hse/incidents', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hse-incidents'] });
            queryClient.invalidateQueries({ queryKey: ['hse-stats'] });
            setModal(false);
            setForm({ title: '', type: 'Acidente Operacional', location: '', level: 'MEDIUM', date: new Date().toISOString().slice(0, 16), reporter: '', description: '' });
            toast.success('Incidente registado com sucesso.');
        }
    });

    const filtered = incidents.filter(inc =>
        inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.reporter.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(form);
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">Segurança, Saúde e Ambiente (HSE)</h1>
                    <p className="text-sm text-[var(--text-secondary)] font-medium opacity-60">Gestão de riscos ocupacionais e conformidade ambiental.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all shadow-sm">
                        <History size={18} />
                    </button>
                    <button
                        onClick={() => setModal(true)}
                        className="premium-button-primary !bg-rose-600 shadow-rose-600/20"
                    >
                        <FileWarning size={18} /> Registar Incidente
                    </button>
                    <button className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all shadow-sm"><Download size={18} /></button>
                </div>
            </div>

            {/* Matrix KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                    { label: 'Dias Sem Acidentes', value: stats?.daysWithoutIncidents || '0', sub: 'Desde o Último Evento', icon: <ShieldCheck size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                    { label: 'Taxa TRIF', value: stats?.trifRate || '0.00', sub: 'Frequência de Incidentes', icon: <Activity size={20} />, color: 'text-sky-600', bg: 'bg-sky-50/50' },
                    { label: 'Formação HSE', value: '92%', sub: 'Prontidão da Equipa', icon: <Users size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
                    { label: 'Qualidade do Ar', value: stats?.airQuality || 'Nominal', sub: 'Estado de Monitorização', icon: <Wind size={20} />, color: 'text-amber-600', bg: 'bg-amber-50/50' },
                ].map((kpi, i) => (
                    <div key={i} className="premium-card p-6 flex flex-col gap-4 group">
                        <div className={`w-12 h-12 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-[var(--border-color)]`}>
                            {kpi.icon}
                        </div>
                        <div>
                            <p className="premium-label !mb-1">{kpi.label}</p>
                            <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tighter tabular-nums">{kpi.value}</p>
                            <span className="text-[10px] font-bold text-[var(--accent)] opacity-70 mt-2 block">{kpi.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Workplace Control - Search Bar */}
                    <div className="bg-[var(--bg-secondary)] p-2 rounded-2xl border border-[var(--border-color)] shadow-sm flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                            <input
                                placeholder="Pesquisar por localização, relator ou natureza..."
                                className="w-full bg-transparent border-none outline-none pl-12 pr-4 py-3 text-sm font-medium"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 pr-2">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs font-black uppercase text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all">
                                <Filter size={16} /> Filtros
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-3 py-32 text-[var(--text-muted)]">
                                <Loader2 size={18} className="animate-spin" />
                                <span className="text-sm">A carregar sistema HSE...</span>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="premium-card py-32 flex flex-col items-center justify-center text-center opacity-30 border-2 border-dashed border-[var(--border-color)]">
                                <ShieldCheck size={48} className="mb-4 opacity-40" />
                                <p className="text-xs font-black uppercase tracking-widest">Nenhum incidente registado</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {filtered.map((inc, i) => {
                                    const cfg = LEVEL_CONFIG[inc.level] || LEVEL_CONFIG.MEDIUM;
                                    const Icon = cfg.icon;
                                    return (
                                        <div key={i} onClick={() => setSelected(inc)} className="premium-card p-6 cursor-pointer group hover:border-[var(--accent)] transition-all relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-[var(--accent)] transition-transform group-hover:scale-110 pointer-events-none">
                                                <FileWarning size={120} />
                                            </div>

                                            <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8 relative z-10">
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                                            <Icon size={14} className={`${inc.level === 'CRITICAL' ? 'animate-pulse' : ''}`} />
                                                            {cfg.label}
                                                        </span>
                                                        <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest border-l border-[var(--border-color)] pl-3">TIPO: {inc.type}</span>
                                                    </div>
                                                    <h3 className="text-xl font-black text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-all tracking-tight leading-tight">{inc.title}</h3>
                                                    <div className="flex flex-wrap items-center gap-6">
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)]">
                                                            <MapPin size={14} className="text-sky-500" /> {inc.location}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)]">
                                                            <User size={14} className="text-[var(--accent)]" /> {inc.reporter}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Data do Evento</p>
                                                    <p className="text-sm font-black text-[var(--text-primary)] tabular-nums">{format(new Date(inc.date), 'dd MMM yyyy', { locale: pt })}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-5 border-t border-[var(--border-color)] mt-2 relative z-10">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase">
                                                    <ShieldCheck size={16} /> Protocolo Ativo
                                                </div>
                                                <button className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] hover:opacity-80 transition-all flex items-center gap-2 group/btn">
                                                    Analisar <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="premium-card p-6 group">
                        <h3 className="text-[10px] font-black text-[var(--text-primary)] flex items-center gap-3 uppercase tracking-widest mb-8 border-b border-[var(--border-color)] pb-4">
                            <Activity size={18} className="text-[var(--accent)]" /> Telemetria Ambiental
                        </h3>

                        <div className="space-y-4">
                            {[
                                { label: 'Temperatura', value: `${stats?.environmentalSensors?.temp?.toFixed(1) || '24.2'}°C`, icon: <Thermometer size={18} />, color: 'text-rose-600', bg: 'bg-rose-50/50' },
                                { label: 'Humidade', value: `${stats?.environmentalSensors?.humidity?.toFixed(0) || '65'}%`, icon: <Droplets size={18} />, color: 'text-sky-600', bg: 'bg-sky-50/50' },
                                { label: 'CO2', value: `${stats?.environmentalSensors?.co2?.toFixed(0) || '400'} ppm`, icon: <Flame size={18} />, color: 'text-amber-600', bg: 'bg-amber-50/50' },
                            ].map((sensor, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-[var(--bg-primary)]/40 border border-[var(--border-color)]/20 rounded-2xl hover:border-[var(--accent)]/30 transition-all group/item shadow-inner">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl ${sensor.bg} ${sensor.color} flex items-center justify-center group-hover/item:rotate-6 transition-transform shadow-sm`}>
                                            {sensor.icon}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">{sensor.label}</p>
                                            <p className="text-sm font-black text-[var(--text-primary)] tabular-nums">{sensor.value}</p>
                                        </div>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="premium-card p-8 bg-[var(--accent)]/5 border-l-4 border-l-[var(--accent)] flex flex-col items-center text-center group">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                            <ShieldCheck size={32} />
                        </div>
                        <h4 className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest mb-4">Conformidade EPIs</h4>
                        <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed opacity-70 border-t border-[var(--border-color)] pt-4">
                            A auditoria concluiu com {stats?.ppeCompliance || 100}% de adesão em todos os sectores operativos.
                        </p>
                    </div>

                    <div className="premium-card p-8 bg-rose-600 text-white shadow-xl shadow-rose-600/20 group relative overflow-hidden border-none translate-y-0 hover:-translate-y-1 transition-all">
                        <div className="absolute top-[-20px] right-[-20px] p-6 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                            <Zap size={100} />
                        </div>
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 shadow-lg group-hover:rotate-12 transition-transform">
                                <AlertOctagon size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-black uppercase tracking-tight">Simulacro Crítico</h4>
                                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Plano de Emergência</p>
                            </div>
                        </div>
                        <p className="text-xs font-medium leading-relaxed mb-8 opacity-90 relative z-10 italic">
                            Próximo simulacro agendado para 28 de Março às 10:00h. Siga os protocolos de evacuação.
                        </p>
                        <button className="w-full py-4 bg-white text-rose-600 text-[10px] font-black uppercase rounded-xl shadow-xl active:scale-95 transition-all tracking-widest relative z-10">
                            Configurar Alerta
                        </button>
                    </div>
                </div>
            </div>

            {/* Incident Detailed Panel */}
            {selected && (
                <div className="fixed inset-0 z-[3000] flex justify-end">
                    <div className="absolute inset-0 z-0 bg-[var(--text-primary)]/10 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelected(null)} />
                    <div className="relative z-10 w-full max-w-xl bg-[var(--bg-secondary)] h-full overflow-y-auto p-8 sm:p-12 shadow-premium animate-in slide-in-from-right duration-500 flex flex-col no-scrollbar">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2 border-l-4 border-rose-600 pl-4">Incidente #{selected.id.slice(0, 8)}</p>
                                <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">Relatório Técnico HSE</h3>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-3 rounded-2xl bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-all border border-[var(--border-color)]">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-8 flex-1">
                            <div className={`p-8 rounded-3xl border-2 border-dashed transition-all ${LEVEL_CONFIG[selected.level].border} bg-[var(--bg-primary)]/30`}>
                                <div className="flex justify-between items-center mb-10">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border-2 ${LEVEL_CONFIG[selected.level].bg} ${LEVEL_CONFIG[selected.level].color} ${LEVEL_CONFIG[selected.level].border}`}>
                                        {LEVEL_CONFIG[selected.level].label}
                                    </span>
                                    <div className="text-right">
                                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase opacity-60 mb-1">Impacto Estimado</p>
                                        <p className="text-4xl font-black text-[var(--text-primary)] tabular-nums tracking-tighter">
                                            {selected.level === 'CRITICAL' ? '100' : selected.level === 'HIGH' ? '75' : '25'}
                                            <span className="text-xl opacity-20 ml-1">%</span>
                                        </p>
                                    </div>
                                </div>
                                <h4 className="font-black text-xl text-[var(--text-primary)] leading-tight mb-8 border-b border-[var(--border-color)] pb-6">{selected.title}</h4>
                                <div className="space-y-3">
                                    <p className="text-[10px] uppercase font-black text-[var(--text-muted)] flex items-center gap-2">Narrativa de Investigação</p>
                                    <div className="text-sm text-[var(--text-secondary)] leading-relaxed italic opacity-80 bg-[var(--bg-primary)]/60 p-6 rounded-2xl border-l-4 border-rose-500/50">
                                        "{selected.description || 'Nenhum detalhe técnico registado.'}"
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'Localização', value: selected.location, icon: <MapPin size={18} className="text-sky-500" /> },
                                    { label: 'Natureza', value: selected.type, icon: <Layers size={18} className="text-amber-500" /> },
                                    { label: 'Relatado por', value: selected.reporter, icon: <User size={18} className="text-rose-500" /> },
                                    { label: 'Sincronização', value: format(new Date(selected.date), 'dd/MM/yyyy HH:mm'), icon: <Calendar size={18} className="text-indigo-500" /> },
                                ].map((item: any, i) => (
                                    <div key={i} className="premium-card p-5 flex flex-col gap-4 group">
                                        <p className="text-[9px] text-[var(--text-muted)] uppercase font-black tracking-widest flex items-center gap-2">{item.icon} {item.label}</p>
                                        <p className="font-black text-xs text-[var(--text-primary)] truncate">{item.value || '---'}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 border border-rose-500/20 bg-rose-500/10 rounded-2xl flex items-center gap-6 shadow-inner">
                                <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-lg"><AlertOctagon size={24} /></div>
                                <div>
                                    <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Acções Correctivas</h4>
                                    <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-tight">Investigação conforme normas <span className="font-black text-[var(--text-primary)]">ISO 45001</span> em curso.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 flex gap-4 border-t border-[var(--border-color)] mt-auto">
                            <button className="premium-button-secondary flex-1">
                                <Printer size={18} /> Exportar PDF
                            </button>
                            <button
                                onClick={() => setSelected(null)}
                                className="premium-button-primary flex-[1.5] !bg-rose-600 shadow-rose-600/20"
                            >
                                <ShieldAlert size={18} /> Escalar Risco
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Novo Incidente */}
            {modal && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 z-0 bg-[var(--text-primary)]/10 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setModal(false)} />
                    <div className="relative z-[1] bg-[var(--bg-secondary)] border border-[var(--border-color)] w-full max-w-2xl rounded-[2.5rem] p-8 shadow-premium animate-in zoom-in-95 duration-300 overflow-hidden">
                        <div className="flex items-center justify-between mb-10 pb-6 border-b border-[var(--border-color)]">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Registar Evento HSE</h2>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">Sincronização de Segurança e Saúde</p>
                            </div>
                            <button onClick={() => setModal(false)} className="p-3 rounded-2xl hover:bg-[var(--bg-primary)] text-[var(--text-muted)] transition-all border border-[var(--border-color)]"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar pr-2">
                            <div className="space-y-2">
                                <label className="premium-label">Título do Incidente</label>
                                <input
                                    required
                                    placeholder="Ex: Queda parcial de carga em armazém..."
                                    className="premium-input"
                                    value={form.title}
                                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2 text-left">
                                    <label className="premium-label">Natureza</label>
                                    <SearchableSelect 
                                        options={[
                                            { label: 'ACIDENTE OPERACIONAL', value: 'Acidente Operacional' },
                                            { label: 'AMBIENTAL', value: 'Ambiental' },
                                            { label: 'SAÚDE OCUPACIONAL', value: 'Saúde Ocupacional' }
                                        ]}
                                        value={form.type}
                                        onChange={val => setForm(p => ({ ...p, type: val }))}
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="premium-label">Severidade</label>
                                    <SearchableSelect 
                                        options={[
                                            { label: 'BAIXO', value: 'LOW' },
                                            { label: 'MÉDIO', value: 'MEDIUM' },
                                            { label: 'ALTO', value: 'HIGH' },
                                            { label: 'CRÍTICO', value: 'CRITICAL' }
                                        ]}
                                        value={form.level}
                                        onChange={val => setForm(p => ({ ...p, level: val as any }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="premium-label">Localização</label>
                                    <input required placeholder="Sector / Terminal" className="premium-input" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <label className="premium-label">Relator</label>
                                    <input required placeholder="Nome do Agente" className="premium-input" value={form.reporter} onChange={e => setForm(p => ({ ...p, reporter: e.target.value }))} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="premium-label">Data e Hora</label>
                                <input type="datetime-local" required className="premium-input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                            </div>

                            <div className="space-y-2">
                                <label className="premium-label">Narrativa Técnica</label>
                                <textarea rows={4} placeholder="Descrição técnica e testemunhas..." className="premium-input resize-none" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                            </div>

                            <div className="pt-8 flex gap-4">
                                <button type="button" onClick={() => setModal(false)} className="premium-button-secondary flex-1">Cancelar</button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="premium-button-primary flex-[2] !bg-rose-600 shadow-rose-600/20"
                                >
                                    {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <FileWarning size={18} />}
                                    Publicar Relatório
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Matrix Footer */}
            <div className="premium-card p-12 bg-[var(--bg-primary)]/30 border border-dashed border-[var(--border-color)] flex flex-col items-center gap-6 text-center mt-20 group shadow-inner">
                <Database size={40} className="text-[var(--text-muted)] opacity-20" />
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.5em] opacity-60">
                        OneGest HSE Performance Matrix
                    </p>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-40">
                        Institutional Governance Engine v5.0
                    </p>
                </div>
                <div className="flex items-center gap-12 text-[9px] font-black uppercase tracking-widest opacity-30">
                    <span className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" /> Audit Certified</span>
                    <span className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-rose-500 shadow-sm" /> High-Risk Ready</span>
                </div>
            </div>
        </div>
    );
}
