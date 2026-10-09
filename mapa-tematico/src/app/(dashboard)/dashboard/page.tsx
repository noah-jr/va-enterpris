'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { 
    Users, GraduationCap, HeartPulse, AlertTriangle, 
    TrendingUp, Map as MapIcon, Activity, Zap, 
    ArrowUpRight, School, Hospital, Baby, Skull,
    Globe, Search, Bell, Clock, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area, PieChart, Pie, Cell,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import dynamic from 'next/dynamic';
import { TacticalRadar } from '@/components/dashboard/TacticalRadar';
import { TacticalDropdown } from '@/components/ui/TacticalDropdown';
import { Radio, Compass, Target, Settings, Download, RefreshCw, FileText, Share2, Layers } from 'lucide-react';
import { useSchools, useHospitals, useDemographics } from '@/hooks/use-mtni-data';
import { useIncidents } from '@/hooks/use-incidents';

const MapComponent = dynamic(() => import('@/components/map/TacticalMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-muted animate-pulse" />
});

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [mounted, setMounted] = useState(false);

    const { data: schools } = useSchools();
    const { data: hospitals } = useHospitals();
    const { data: demographics } = useDemographics();
    const { data: incidents } = useIncidents();

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        async function fetchStats() {
            try {
                const res: any = await api.get('/reports/dashboard');
                setStats(res);
            } catch (err) {
                console.error("Erro dashboard:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
        return () => clearInterval(timer);
    }, []);

    if (loading) return <div className="p-20 text-[10px] font-black font-mono animate-pulse uppercase tracking-widest text-primary">Sincronizando Malha MTNI...</div>;

    const cards = [
        { label: 'Indivíduos Monitorizados', value: stats?.population?.total?.toLocaleString() || '0', sub: 'Rede Demográfica', icon: Users, color: 'text-blue-500', trend: '+2.1%' },
        { label: 'População Escolar', value: stats?.education?.totalStudents?.toLocaleString() || '0', sub: 'Matrículas Ativas', icon: GraduationCap, color: 'text-indigo-400', trend: '+1.4%' },
        { label: 'Taxa de Natalidade', value: stats?.health?.totalBirths?.toLocaleString() || '0', sub: 'Registos SNS', icon: Baby, color: 'text-emerald-400', trend: '+0.8%' },
        { label: 'Mortabilidade Reg.', value: stats?.health?.totalDeaths?.toLocaleString() || '0', sub: 'Óbitos Reportados', icon: Skull, color: 'text-red-400', trend: '-0.3%' },
    ];

    return (
        <div className="flex flex-col gap-8 w-full pb-20 p-8 pt-4">
            {/* Header Tactical */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border pb-8">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-12 bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
                    <div>
                        <span className="text-[10px] font-black font-mono uppercase tracking-[0.4em] text-primary block mb-1">MTNI :: DASHBOARD_DE_COMANDO_NACIONAL</span>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground leading-none">Métricas de Soberania Digital</h1>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <span className="text-[9px] font-black font-mono opacity-40 block uppercase tracking-widest">Sincronização Zulu</span>
                        <span className="text-xl font-black font-mono tracking-tighter uppercase tabular-nums">{mounted ? currentTime.toLocaleTimeString([], { hour12: false }) : '--:--:--'} <span className="text-primary text-xs ml-1">Z</span></span>
                    </div>
                    <div className="h-10 w-px bg-border sm:block hidden" />
                    <div className="flex gap-2">
                        <TacticalDropdown 
                            trigger={<button className="tactical-btn group p-3"><Layers className="w-4 h-4 group-hover:text-primary transition-colors" /></button>}
                            items={[
                                { label: 'Camada: Demográfica', action: () => {}, icon: Users },
                                { label: 'Camada: Educação', action: () => {}, icon: GraduationCap },
                                { label: 'Camada: Saúde', action: () => {}, icon: HeartPulse },
                                { label: 'Camada: Sinistros', action: () => {}, icon: AlertTriangle },
                            ]}
                        />
                        <TacticalDropdown 
                            trigger={<button className="tactical-btn group p-3"><Settings className="w-4 h-4 group-hover:text-primary transition-colors" /></button>}
                            items={[
                                { label: 'Configurações Globais', action: () => {}, icon: Settings },
                                { label: 'Exportar Relatório Geral', action: () => {}, icon: Download },
                                { label: 'Recalibrar Frequência Z', action: () => {}, icon: RefreshCw },
                                { label: 'Log de Auditoria', action: () => {}, icon: FileText, variant: 'warning' },
                            ]}
                        />
                        <button className="tactical-btn group p-3"><Search className="w-4 h-4 group-hover:text-primary transition-colors" /></button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
                {cards.map((card, i) => (
                    <motion.div 
                        key={card.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-card p-6 flex flex-col justify-between group hover:bg-muted/10 transition-colors relative h-40"
                    >
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-muted/50 border border-border rounded-none group-hover:border-primary transition-colors">
                                <card.icon className={cn("w-5 h-5", card.color)} />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={cn("text-[9px] font-black font-mono", card.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500')}>{card.trend}</span>
                                <TacticalDropdown 
                                    items={[
                                        { label: 'Analítica_Detalhada', action: () => {}, icon: TrendingUp },
                                        { label: 'Exportar_Vetor', action: () => {}, icon: Share2 },
                                    ]}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-3xl font-black tabular-nums tracking-tighter leading-none">{card.value}</span>
                            <div className="flex flex-col mt-1">
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40 font-mono">{card.label}</span>
                                <span className="text-[7px] font-mono opacity-20 uppercase tracking-widest">{card.sub}</span>
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <card.icon className="w-full h-full" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* 1. Visão_Global_de_Soberania (Map & Radar Interface) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-12 tactical-panel border border-border bg-background h-[550px] relative overflow-hidden group shadow-2xl">
                    {/* Background Map Component */}
                    <div className="absolute inset-0 z-0 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000">
                        <MapComponent
                            center={[-12.1642, 17.5691]}
                            zoom={6}
                            schools={schools || []}
                            hospitals={hospitals || []}
                            demographics={demographics || []}
                            incidents={Array.isArray(incidents) ? incidents : []}
                        />
                    </div>

                    {/* Integrated Tactical Telemetry Overlay */}
                    <div className="absolute top-6 left-6 z-10 flex flex-col gap-4 pointer-events-none">
                        <div className="tactical-panel bg-background/80 backdrop-blur-xl p-6 border-l-4 border-l-primary flex flex-col gap-4 w-[280px]">
                            <div className="flex items-center justify-between border-b border-border/20 pb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary font-mono flex items-center gap-2">
                                    <Radio className="w-3.5 h-3.5 animate-pulse" /> VARREDURA_Z_CORE
                                </span>
                                <span className="text-[8px] font-mono opacity-40">SAT_LINK: 842</span>
                            </div>
                            
                            {/* Dashboard Tactical Radar Component */}
                            <div className="aspect-square w-full pointer-events-auto">
                                <TacticalRadar />
                            </div>

                            <div className="grid grid-cols-2 gap-2 pointer-events-auto mt-2">
                                <div className="bg-primary/5 border border-primary/20 p-3 flex flex-col">
                                    <span className="text-[7px] font-black uppercase opacity-40 mb-1 tracking-widest">Sincronização</span>
                                    <span className="text-xs font-black font-mono text-primary">LIVE_MTNI</span>
                                </div>
                                <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 flex flex-col">
                                    <span className="text-[7px] font-black uppercase opacity-40 mb-1 tracking-widest">Integridade</span>
                                    <span className="text-xs font-black font-mono text-emerald-500">98.4%_OK</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side HUD Info */}
                    <div className="absolute top-6 right-6 z-10 pointer-events-none text-right">
                        <div className="tactical-panel bg-background/60 backdrop-blur-md p-4 border-r-4 border-r-foreground flex flex-col gap-1 shadow-xl">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">Coordenadas_Pivot</span>
                            <span className="text-[14px] font-black font-mono tabular-nums leading-none">-12.1642, 17.5691</span>
                            <div className="flex items-center justify-end gap-2 mt-2">
                                <Target className="w-3 h-3 text-red-500" />
                                <span className="text-[7px] font-black uppercase tracking-widest text-red-500">Lock_Confirmed</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom HUD Legend */}
                    <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-end pointer-events-none">
                        <div className="flex gap-4">
                            {[
                                { label: 'EDUCAÇÃO', color: 'bg-blue-500' },
                                { label: 'SAÚDE', color: 'bg-emerald-500' },
                                { label: 'SINISTROS', color: 'bg-red-500' }
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-2 bg-background/80 backdrop-blur-md border border-border px-3 py-1.5 grayscale group-hover:grayscale-0 transition-all">
                                    <div className={cn("w-1.5 h-1.5 rounded-full", item.color)} />
                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60 font-mono">{item.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 bg-background/80 backdrop-blur-md border border-border px-4 py-2">
                            <Compass className="w-4 h-4 text-primary animate-spin-[20s]" />
                            <div className="flex flex-col leading-none">
                                <span className="text-[7px] font-black uppercase opacity-40">Orientação_Grid</span>
                                <span className="text-[9px] font-black font-mono tracking-tighter">NORTE_MAGNÉTICO_AO</span>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Overlay GRID */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-tactical-grid z-[1]" />
                </div>
            </div>

            {/* Analytics & Tactical Intelligence Matrix */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* 1. Radar de Escaneamento Provincial (4 cols) */}
                <div className="xl:col-span-4 tactical-panel border border-border bg-card p-8 flex flex-col min-h-[450px] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-px bg-primary/20 animate-scan" />
                    <div className="flex items-center justify-between mb-8 relative z-10 w-full">
                        <div className="flex items-center gap-3">
                            <MapIcon className="w-5 h-5 text-primary" />
                            <h3 className="text-[12px] font-black uppercase tracking-[0.2em]">Radar_Vetor_Provincial</h3>
                        </div>
                        <TacticalDropdown 
                            items={[
                                { label: 'Recalibrar_Sonar', action: () => {}, icon: RefreshCw },
                                { label: 'Zoom_Geográfico', action: () => {}, icon: Search },
                                { label: 'Alternar_Sombra_Radar', action: () => {}, icon: Layers },
                            ]}
                        />
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center relative">
                        {/* Radar Background Decor */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                            <div className="w-[80%] aspect-square border-2 border-primary rounded-full animate-pulse" />
                            <div className="w-[60%] aspect-square border border-primary rounded-full absolute" />
                            <div className="w-[40%] aspect-square border border-primary rounded-full absolute" />
                        </div>

                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                                { subject: 'Luanda', A: 120, fullMark: 150 },
                                { subject: 'Benguela', A: 98, fullMark: 150 },
                                { subject: 'Huambo', A: 86, fullMark: 150 },
                                { subject: 'Huíla', A: 99, fullMark: 150 },
                                { subject: 'Cabinda', A: 85, fullMark: 150 },
                                { subject: 'Lunda Sul', A: 65, fullMark: 150 },
                            ]}>
                                <PolarGrid stroke="rgba(var(--primary-rgb), 0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(var(--foreground-rgb), 0.4)', fontSize: 8, fontWeight: 'bold' }} stroke="rgba(var(--primary-rgb), 0.2)" />
                                <Radar
                                    name="Densidade"
                                    dataKey="A"
                                    stroke="var(--primary)"
                                    fill="var(--primary)"
                                    fillOpacity={0.4}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-6 relative z-10">
                        <div className="flex flex-col gap-1">
                            <span className="text-[7px] font-black uppercase tracking-widest opacity-40">Setor_Crítico</span>
                            <span className="text-[10px] font-black text-red-500 uppercase">LUANDA_PRIME</span>
                        </div>
                        <div className="flex flex-col gap-1 text-right">
                            <span className="text-[7px] font-black uppercase tracking-widest opacity-40">Status_Var</span>
                            <span className="text-[10px] font-black text-emerald-500 font-mono">+12.42_SYNC</span>
                        </div>
                    </div>
                </div>

                {/* 2. Monitoramento de Saturação de Serviços (4 cols) */}
                <div className="xl:col-span-4 tactical-panel border border-border bg-card p-8 flex flex-col min-h-[450px]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-[12px] font-black uppercase tracking-[0.2em]">Monitorização_Capacidade</h3>
                        </div>
                        <TacticalDropdown 
                            items={[
                                { label: 'Sincronizar_Manual', action: () => {}, icon: RefreshCw },
                                { label: 'Definir_Alertas', action: () => {}, icon: Bell },
                                { label: 'Ver_Relatório_Full', action: () => {}, icon: FileText },
                            ]}
                        />
                    </div>

                    <div className="flex-1 space-y-10">
                        {/* Hospital Capacity */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <div className="flex items-center gap-2">
                                    <Hospital className="w-4 h-4 text-emerald-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Capacidade_Hospitalar</span>
                                </div>
                                <span className="text-sm font-black font-mono">{stats?.health?.currentPatients}/{stats?.health?.totalBeds} BEDS</span>
                            </div>
                            <div className="w-full h-2 bg-muted relative">
                                <div 
                                    className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                                    style={{ width: `${Math.min(100, (stats?.health?.currentPatients / stats?.health?.totalBeds) * 100 || 0)}%` }} 
                                />
                                <div className="absolute inset-0 bg-tactical-grid opacity-20 pointer-events-none" />
                            </div>
                            <div className="flex justify-between text-[7px] font-black uppercase tracking-[0.2em] opacity-30">
                                <span>Status_Ocupação</span>
                                <span>{((stats?.health?.currentPatients / stats?.health?.totalBeds) * 100 || 0).toFixed(1)}%</span>
                            </div>
                        </div>

                        {/* School Capacity */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <div className="flex items-center gap-2">
                                    <School className="w-4 h-4 text-blue-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Lotação_Unidades_Escolares</span>
                                </div>
                                <span className="text-sm font-black font-mono">92.4%</span>
                            </div>
                            <div className="w-full h-2 bg-muted relative">
                                <div 
                                    className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
                                    style={{ width: '92.4%' }} 
                                />
                                <div className="absolute inset-0 bg-tactical-grid opacity-20 pointer-events-none" />
                            </div>
                            <div className="flex justify-between text-[7px] font-black uppercase tracking-[0.2em] opacity-30">
                                <span>Vagas_Disponíveis</span>
                                <span>7.6% (12.4k)</span>
                            </div>
                        </div>

                        {/* Incident Saturation */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Alerta_Sinistralidade</span>
                                </div>
                                <span className="text-sm font-black font-mono">{stats?.emergencies?.active} ATIVOS</span>
                            </div>
                            <div className="w-full h-2 bg-muted relative">
                                <div 
                                    className="h-full bg-red-500 animate-pulse" 
                                    style={{ width: `${Math.min(100, (stats?.emergencies?.active / 50) * 100)}%` }} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border mt-auto flex items-center gap-4">
                        <Clock className="w-3 h-3 opacity-20" />
                        <span className="text-[7px] font-black uppercase tracking-widest opacity-20 italic font-mono">Processado por KODACHI_AI // Última_Var: 12ms</span>
                    </div>
                </div>

                {/* 3. Evolução Demográfica (4 cols) */}
                <div className="xl:col-span-4 tactical-panel border border-border bg-card p-8 flex flex-col min-h-[450px]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-amber-500" />
                            <h3 className="text-[12px] font-black uppercase tracking-[0.2em]">Crescimento_Vetor</h3>
                        </div>
                        <TacticalDropdown 
                            items={[
                                { label: 'Predição_IA_Z', action: () => {}, icon: Zap },
                                { label: 'Alternar_Escala', action: () => {}, icon: Activity },
                                { label: 'Comparativo_Anual', action: () => {}, icon: TrendingUp },
                            ]}
                        />
                    </div>
                    <div className="flex-1 min-h-0 -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.evolution || []}>
                                <defs>
                                    <linearGradient id="colorPop" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--foreground-rgb),0.05)" />
                                <XAxis dataKey="month" stroke="rgba(var(--foreground-rgb),0.3)" fontSize={8} axisLine={false} tickLine={false} />
                                <YAxis stroke="rgba(var(--foreground-rgb),0.3)" fontSize={8} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ background: 'rgba(var(--background-rgb),0.9)', border: '1px solid var(--border)', fontSize: '9px', textTransform: 'uppercase' }}
                                />
                                <Area type="monotone" dataKey="populacao" stroke="var(--primary)" fillOpacity={1} fill="url(#colorPop)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-primary/5 p-4 border-l-2 border-primary mt-6">
                        <h4 className="text-[9px] font-black uppercase mb-1">Nota_Analítica_IA</h4>
                        <p className="text-[8px] opacity-60 uppercase font-mono tracking-tighter leading-relaxed">Projeção indica estabilização do vetor de crescimento em 1.4% para o Q3. Recomendado reforço em Luanda_Setor_Sul.</p>
                    </div>
                </div>

            </div>

            {/* Secondary Intelligence Layer (Status & Feed) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* 1. Distribuição de Operadores (4 cols) */}
                <div className="xl:col-span-4 tactical-panel border border-border bg-card p-8 flex flex-col min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-primary" />
                            <h3 className="text-[12px] font-black uppercase tracking-[0.2em]">Vetores_de_Acesso_Status</h3>
                        </div>
                        <TacticalDropdown 
                            items={[
                                { label: 'Gestão_de_Crises', action: () => {}, icon: Target, variant: 'danger' },
                                { label: 'Exportar_Lista_Alpha', action: () => {}, icon: Download },
                            ]}
                        />
                    </div>
                    
                    <div className="flex-1 min-h-0 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'ATIVOS', value: 75 },
                                        { name: 'SUSPENSOS', value: 15 },
                                        { name: 'MODO_ALPHA', value: 10 },
                                    ]}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell fill="var(--primary)" />
                                    <Cell fill="rgba(var(--foreground-rgb), 0.1)" />
                                    <Cell fill="#ef4444" />
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ background: 'rgba(var(--background-rgb),0.9)', border: '1px solid var(--border)', fontSize: '9px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-3 mt-6">
                        <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-primary" /> OPERACIONAL_ZULU</span>
                            <span className="opacity-60">75%</span>
                        </div>
                        <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-500" /> ALERTA_CRÍTICO</span>
                            <span className="text-red-500">10%</span>
                        </div>
                    </div>
                </div>

                {/* 2. Feed de Incidentes Recentes (8 cols) */}
                <div className="xl:col-span-8 tactical-panel border border-border bg-card p-8 flex flex-col min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-amber-500" />
                            <h3 className="text-[12px] font-black uppercase tracking-[0.2em]">Log_Emergência_Tempo_Real</h3>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[8px] font-black font-mono opacity-30 animate-pulse hidden md:block">Sincronizando via Satélite...</span>
                            <TacticalDropdown 
                                items={[
                                    { label: 'Limpar_Feed_Z', action: () => {}, icon: RefreshCw },
                                    { label: 'Exportar_Logs', action: () => {}, icon: FileText },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="space-y-px bg-border border border-border overflow-hidden">
                        {[
                            { time: '09:42:12', msg: 'Anomalia demográfica detectada em LUANDA_CENTRO // Variação > 12%', type: 'WARN' },
                            { time: '09:40:05', msg: 'Unidade Escolar #842 Reportou saturação de matrículas', type: 'INFO' },
                            { time: '09:35:44', msg: 'CRÍTICO: Queda de link em Unidade de Saúde Regional BENGUELA', type: 'ERROR' },
                            { time: '09:28:19', msg: 'Novo registro de natalidade sincronizado via API_GEOSPACE', type: 'SUCCESS' },
                            { time: '09:22:01', msg: 'Ajuste de coordenadas em Vetor de Segurança HUAMBO_Z', type: 'INFO' },
                        ].map((log, i) => (
                            <div key={i} className="bg-card p-4 flex items-center gap-6 hover:bg-muted/30 transition-colors">
                                <span className="text-[9px] font-black font-mono text-primary opacity-60 tabular-nums">{log.time}</span>
                                <div className={cn(
                                    "w-1 h-3 shrink-0",
                                    log.type === 'ERROR' ? 'bg-red-500' : 
                                    log.type === 'WARN' ? 'bg-amber-500' :
                                    log.type === 'SUCCESS' ? 'bg-emerald-500' : 'bg-blue-500'
                                )} />
                                <span className="text-[10px] font-black uppercase tracking-tight opacity-80 flex-1 truncate">{log.msg}</span>
                                <ArrowUpRight className="w-3 h-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto pt-6 flex justify-end">
                        <button className="text-[8px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-primary transition-all flex items-center gap-2">
                             Ver Histórico Completo_Z <Activity className="w-3 h-3" />
                        </button>
                    </div>
                </div>

            </div>

            {/* AI Insights Ticker */}
            <div className="bg-primary/5 border border-primary/20 p-4 px-8 flex items-center gap-6 overflow-hidden">
                <div className="flex items-center gap-3 shrink-0">
                    <Zap className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-[10px] font-black font-mono uppercase tracking-widest text-primary">IA_INSIGHT:</span>
                </div>
                <div className="flex-1 whitespace-nowrap overflow-hidden">
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: '-100%' }}
                        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                        className="text-[11px] font-black uppercase tracking-tight opacity-80"
                    >
                        Padrão de natalidade em {stats?.health?.topProvince || 'Luanda'} acima da média nacional (+12%) // Alerta de saturação em unidades escolares primárias em 48 meses // Detectada anomalia demográfica na zona sul // Sincronizando rede neural...
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
