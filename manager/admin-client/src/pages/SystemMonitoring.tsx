import { useState, useEffect } from 'react';
import { 
    Zap, Activity, AlertTriangle, Server, Clock, TrendingUp, 
    RefreshCw, Bell, ShieldCheck, Terminal, Microscope, 
    Layers, ChevronRight, ShieldAlert, Filter, Search, 
    Database, Cpu, Gavel, Globe, Cpu as CpuIcon
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ServiceStatus {
    name: string;
    status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
    uptime: number;
    latency: number;
    lastChecked: string;
    description: string;
    icon: string;
}

const ICON_MAP: Record<string, any> = {
    Server: <Server size={20} />,
    Cpu: <Cpu size={20} />,
    Database: <Database size={20} />,
    Gavel: <Gavel size={20} />,
    Globe: <Globe size={20} />,
    Activity: <Activity size={20} />
};

const STATUS_STYLE: Record<string, any> = {
    ONLINE: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', dot: 'bg-emerald-500', label: 'Operacional' },
    DEGRADED: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', dot: 'bg-amber-500', label: 'Lento' },
    OFFLINE: { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20', dot: 'bg-rose-500', label: 'Offline' },
};

export default function SystemMonitoring() {
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const { data, isLoading } = useQuery({
        queryKey: ['monitoring'],
        queryFn: async () => (await api.get('/monitoring')).data,
        refetchInterval: autoRefresh ? 30000 : false
    });

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 opacity-50">
                <RefreshCw size={32} className="animate-spin text-[var(--accent)]" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">Sincronizando Estado Global...</p>
            </div>
        );
    }

    const services: ServiceStatus[] = data?.services || [];
    const incidents: any[] = data?.incidents || [];
    const apiCallsData: any[] = data?.apiCallsData || [];
    const latencyData: any[] = data?.latencyData || [];

    const online = services.filter(s => s.status === 'ONLINE').length;
    const degraded = services.filter(s => s.status === 'DEGRADED').length;
    const offline = services.filter(s => s.status === 'OFFLINE').length;
    const avgUptime = services.length ? Math.round(services.reduce((s, sv) => s + sv.uptime, 0) / services.length * 100) / 100 : 0;

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Monitorização de Infraestrutura</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Estado vital dos serviços e telemetria de rede em tempo-real.</p>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => setAutoRefresh(!autoRefresh)} className={`flex items-center gap-2 px-4 py-2.5 border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${autoRefresh ? 'bg-[var(--accent)] text-white border-transparent' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'}`}>
                        <RefreshCw size={14} className={autoRefresh ? 'animate-spin' : ''} />
                        {autoRefresh ? 'SYNC_AUTO_ON' : 'SYNC_MANUAL'}
                    </button>
                    <div className="hidden lg:flex items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2.5 rounded-xl shadow-sm">
                        <Clock size={14} className="text-[var(--accent)]" />
                        <span className="text-[11px] font-mono font-black text-[var(--text-secondary)] tabular-nums">{time.toLocaleTimeString()} STATION_UP</span>
                    </div>
                </div>
            </div>

            {/* Global Status Banner */}
            <div className="animate-in slide-in-from-top-4 duration-500">
                {offline > 0 ? (
                    <div className="bg-rose-600 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 border border-rose-500/50 shadow-xl shadow-rose-500/20">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                            <AlertTriangle size={28} className="text-white animate-pulse" />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <p className="text-lg font-black text-white leading-tight uppercase tracking-tight">ALERTA CRÍTICO: {offline} SERVIÇO(S) OFFLINE</p>
                            <p className="text-sm text-white/80 font-medium mt-1">Interrupção detectada em nodos vitais. A equipa de operações foi escalada automaticamente.</p>
                        </div>
                        <button className="bg-white text-rose-600 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all">Protocolo de Emergência</button>
                    </div>
                ) : degraded > 0 ? (
                    <div className="bg-amber-500 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 border border-amber-400 shadow-xl shadow-amber-500/20">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                            <Zap size={28} className="text-white animate-bounce" />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <p className="text-lg font-black text-white leading-tight uppercase tracking-tight">PERFORMANCE DEGRADADA: {degraded} SERVIÇO(S)</p>
                            <p className="text-sm text-white/80 font-medium mt-1">Latência elevada detectada. O processamento de transacções pode sofrer atrasos nominais.</p>
                        </div>
                        <button className="bg-white text-amber-500 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all">Optimizar Recursos</button>
                    </div>
                ) : (
                    <div className="bg-emerald-600 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 border border-emerald-500 shadow-xl shadow-emerald-500/20">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                            <ShieldCheck size={28} className="text-white" />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <p className="text-lg font-black text-white leading-tight uppercase tracking-tight">SISTEMA NOMINAL & OPERACIONAL</p>
                            <p className="text-sm text-white/80 font-medium mt-1">Todos os sistemas operando em alta-disponibilidade. Uptime consolidado de {avgUptime}%.</p>
                        </div>
                        <button className="bg-white text-emerald-600 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all">Relatório de Saúde</button>
                    </div>
                )}
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Uptime Global', value: `${avgUptime}%`, trend: 'OK', icon: <TrendingUp size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Serviços Activos', value: `${online}/${services.length}`, trend: 'SYNC', icon: <Server size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Latência Média', value: `${data?.latencyData?.[data.latencyData.length - 1]?.value || 0}ms`, trend: 'LAT', icon: <Zap size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                    { label: 'Incidentes 24h', value: incidents.length.toString(), trend: 'ALRT', icon: <Bell size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                ].map((kpi, i) => (
                    <div key={i} className="premium-card p-4 flex items-start gap-3">
                        <div className={`kpi-icon shrink-0 ${kpi.color} ${kpi.bg}`}>
                            {kpi.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-1 truncate tracking-widest">{kpi.label}</p>
                            <p className="text-base font-black text-[var(--text-primary)] tabular-nums leading-tight">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Performance Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="premium-card p-6 group">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] flex items-center gap-2">
                                <Terminal size={16} className="text-[var(--accent)]" /> Carga Transaccional (API)
                            </h2>
                            <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-widest mt-2 opacity-60">Volume de requisições p/ hora</p>
                        </div>
                        <div className="p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]/30 text-[var(--accent)] shadow-sm group-hover:scale-110 transition-transform">
                            <Activity size={18} />
                        </div>
                    </div>
                    <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%" minHeight={1}>
                            <AreaChart data={apiCallsData}>
                                <defs>
                                    <linearGradient id="apiGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', color: 'var(--text-primary)' }}
                                    cursor={{ stroke: 'var(--accent)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="var(--accent)" fill="url(#apiGrad)" strokeWidth={3} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: 'var(--accent)' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="premium-card p-6 group">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] flex items-center gap-2">
                                <Activity size={16} className="text-emerald-500" /> Latência de Rede (ms)
                            </h2>
                            <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-widest mt-2 opacity-60">Velocidade de resposta institucional</p>
                        </div>
                        <div className="p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]/30 text-emerald-500 shadow-sm group-hover:scale-110 transition-transform">
                            <Microscope size={18} />
                        </div>
                    </div>
                    <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%" minHeight={1}>
                            <LineChart data={latencyData}>
                                <XAxis dataKey="time" hide />
                                <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                                />
                                <Line type="stepAfter" dataKey="value" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Services List */}
            <div className="premium-card overflow-hidden flex flex-col group border-b-4 border-b-[var(--accent)]/10">
                <div className="p-5 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--accent)]/10 rounded-lg text-[var(--accent)]">
                            <Layers size={18} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">Estado Consolidado dos Serviços</h2>
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5">Infraestrutura Distribuída</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input placeholder="Filtrar serviço..." className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] pl-9 pr-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-[var(--accent)]/50 transition-colors" />
                        </div>
                        <button className="p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-all shadow-sm"><Filter size={14} /></button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-x divide-y divide-[var(--border-color)]/30">
                    {services.map(service => {
                        const s = STATUS_STYLE[service.status] || STATUS_STYLE.OFFLINE;
                        return (
                            <div key={service.name} className="p-8 transition-all group/item hover:bg-[var(--bg-primary)]/40 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/item:opacity-10 transition-opacity">
                                    {ICON_MAP[service.icon]}
                                </div>
                                <div className="flex items-start justify-between mb-8 relative z-10">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[var(--text-secondary)] bg-[var(--bg-primary)] border border-[var(--border-color)] group-hover/item:scale-110 group-hover/item:text-[var(--accent)] group-hover/item:border-[var(--accent)]/50 transition-all shadow-sm`}>
                                        {ICON_MAP[service.icon] || <Server size={20} />}
                                    </div>
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${s.bg} ${s.color} ${s.border}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${service.status === 'ONLINE' ? 'animate-pulse' : 'animate-ping'}`} />
                                        {s.label}
                                    </div>
                                </div>
                                <div className="mb-8">
                                    <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight truncate mb-2">{service.name}</p>
                                    <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider leading-relaxed h-[30px] overflow-hidden opacity-60 italic">
                                        {service.description}
                                    </p>
                                </div>
                                <div className="space-y-4 pt-6 border-t border-[var(--border-color)]/30">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-[var(--text-secondary)] opacity-50">Disponibilidade</span>
                                        <span className={service.uptime >= 99 ? 'text-emerald-500' : 'text-amber-500'}>{service.uptime}%</span>
                                    </div>
                                    <div className="h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-color)]/20 p-0.5">
                                        <div className={`h-full rounded-full transition-all duration-1000 ${service.uptime >= 99 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'}`} style={{ width: `${service.uptime}%` }} />
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-tight">
                                        <span className="text-[var(--text-secondary)] opacity-40 uppercase">LATENCY_CORE</span>
                                        <span className="text-[var(--text-primary)]">{service.latency}ms</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Incidents Table */}
            <div className="premium-card overflow-hidden group border-l-4 border-l-rose-500/50 shadow-rose-500/5">
                <div className="px-6 py-5 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/50 flex items-center justify-between text-rose-600 dark:text-rose-400">
                    <div className="flex items-center gap-3">
                        <ShieldAlert size={18} />
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-tight">Dossier de Incidentes GRC</h2>
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5">Histórico de Falhas & Diagnóstico</p>
                        </div>
                    </div>
                    <span className="text-[10px] font-black border border-rose-500/20 px-3 py-1.5 rounded-lg bg-rose-500/10 uppercase tracking-widest shadow-sm">Audit_Log_INFRA</span>
                </div>
                <div className="divide-y divide-[var(--border-color)]/30">
                    {incidents.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center opacity-40">
                            <ShieldCheck size={48} className="text-emerald-500 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Nenhum incidente registado neste ciclo</p>
                        </div>
                    ) : (
                        incidents.map(inc => (
                            <div key={inc.id} className="p-6 hover:bg-[var(--bg-primary)]/30 transition-all flex flex-col sm:flex-row items-center justify-between group/row cursor-pointer border-l-4 border-transparent hover:border-rose-500 gap-6">
                                <div className="flex items-center gap-6 w-full">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm transition-all group-hover/row:scale-110 ${inc.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                        {inc.severity === 'HIGH' ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight truncate">{inc.service}</p>
                                            <span className="text-[9px] font-mono font-black text-[var(--text-secondary)] bg-[var(--bg-primary)] px-2.5 py-1 rounded-md border border-[var(--border-color)] shadow-inner uppercase">{inc.date}</span>
                                        </div>
                                        <p className="text-xs text-[var(--text-secondary)] font-bold italic opacity-70 border-l-2 border-[var(--border-color)] pl-3 py-1 truncate">
                                            "{inc.description}"
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-[var(--border-color)]/20">
                                    <div className="hidden sm:block">
                                        <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40 mb-1">Duração_ST</p>
                                        <p className="text-xs font-black text-[var(--text-primary)] tabular-nums">{inc.duration}</p>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border shadow-sm bg-emerald-500/10 text-emerald-500 border-emerald-500/20`}>{inc.status}</span>
                                    <ChevronRight size={18} className="text-[var(--text-secondary)] group-hover/row:text-[var(--accent)] group-hover/row:translate-x-1 transition-all" />
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
}
