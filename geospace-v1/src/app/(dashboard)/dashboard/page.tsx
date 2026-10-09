'use client';

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import { useDashboardStats, useEmergenciesChart } from '@/hooks/use-dashboard';
import { useEmergencies } from '@/hooks/use-emergencies';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { OverviewChart } from '@/components/dashboard/OverviewChart';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
    Activity, AlertTriangle, Brain, Building2, MapPin,
    Route, Thermometer, TrendingUp, Users, Zap, Shield, Clock,
    Globe, ChevronRight, Search, Target, Crosshair
} from 'lucide-react';
import { TacticalRadar } from '@/components/dashboard/TacticalRadar';
import Link from 'next/link';
import authService from '@/lib/services/auth.service';
import api from '@/lib/axios';

const MapComponent = dynamic(() => import('@/components/map/TacticalMap'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-muted/20 flex flex-col items-center justify-center border border-border">
            <Globe className="w-8 h-8 text-primary/30 animate-pulse mb-3" />
            <span className="font-mono text-[8px] font-black uppercase tracking-[0.4em] opacity-30 animate-pulse text-foreground">Inicializando OKUSANGA...</span>
        </div>
    )
});



const LAYER_MODULES = [
    { href: '/units', label: 'Gestão de Unidades', icon: MapPin, desc: 'Hubs, Agências, Postos', color: 'border-l-emerald-500', roles: ['SUPER_ADMIN', 'ADMIN_REGIONAL'] },
    { href: '/routes', label: 'Vias de Acesso', icon: Route, desc: 'Malha rodoviária e estado', color: 'border-l-blue-500', roles: ['SUPER_ADMIN', 'ADMIN_REGIONAL', 'OPERADOR_GEOSPACE', 'COORDENADOR_EMPRESA'] },
    { href: '/density', label: 'Densidade Geográfica', icon: Thermometer, desc: 'Concentração e zonas de risco', color: 'border-l-orange-500', roles: ['SUPER_ADMIN', 'ADMIN_REGIONAL'] },
    { href: '/traffic', label: 'Fluxo em Tempo Real', icon: Activity, desc: 'Mobilidade urbana e bloqueios', color: 'border-l-red-500', roles: ['SUPER_ADMIN', 'ADMIN_REGIONAL', 'OPERADOR_GEOSPACE'] },
    { href: '/incidents', label: 'Centro de Incidentes', icon: AlertTriangle, desc: 'Ocorrências e logs táticos', color: 'border-l-yellow-500', roles: ['SUPER_ADMIN', 'ADMIN_REGIONAL', 'OPERADOR_GEOSPACE', 'COORDENADOR_EMPRESA', 'AGENTE_CAMPO'] },
    { href: '/ai-intelligence', label: 'Análise Preditiva (IA)', icon: Brain, desc: 'Inteligência Geográfica Avançada', color: 'border-l-purple-500', roles: ['SUPER_ADMIN', 'ADMIN_REGIONAL'] },
];

import { useUnits } from '@/hooks/use-units';
import { useIncidents } from '@/hooks/use-incidents';
import { useRoads } from '@/hooks/use-roads';
import { useDensity } from '@/hooks/use-density';

export default function DashboardPage() {
    const { data: statsData, isLoading: isLoadingStats } = useDashboardStats();
    const { data: unitsData, isLoading: isLoadingUnits } = useUnits();
    const { data: incidentsData, isLoading: isLoadingIncidents } = useIncidents();
    const { data: roadsData } = useRoads();
    const { data: densityData } = useDensity();
    const { data: chartData, isLoading: isLoadingChart } = useEmergenciesChart('day');
    
    const units = (unitsData as any[]) || [];
    const incidents = (incidentsData as any[]) || [];
    const roads = (roadsData as any[]) || [];
    const densityZones = (densityData as any[]) || [];
    
    const [mounted, setMounted] = React.useState(false);
    const [aiInsights, setAiInsights] = React.useState<any[]>([]);
    const mapConstraintsRef = useRef(null);
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        setMounted(true);
        const fetchAi = async () => {
            try {
                const data: any = await api.get('/ai/intelligence');
                const insights = (data.alerts || []).map((a: any) => ({
                    icon: a.severity === 'CRÍTICO' ? AlertTriangle : Shield,
                    color: a.severity === 'CRÍTICO' ? 'text-red-500' : 'text-purple-500',
                    bg: a.severity === 'CRÍTICO' ? 'bg-red-500/10' : 'bg-purple-500/10',
                    label: a.title,
                    desc: a.desc,
                    area: a.type,
                    time: a.time
                }));
                setAiInsights(insights);
            } catch (err) {
                console.error('Erro ao carregar insights IA:', err);
            }
        };
        fetchAi();
    }, []);

    const totalPopulation = densityZones.reduce((acc, curr) => acc + (curr.populationCount || 0), 0);

    const stats = [
        { label: 'Unidades Ativas', value: units.length, sub: 'Hubs Estratégicos', icon: Shield, color: 'text-emerald-400', trend: '+0' },
        { label: 'Incidentes Críticos', value: incidents.filter((i: any) => i.status === 'ATIVO').length, sub: 'Em resposta', icon: AlertTriangle, color: 'text-red-400', trend: '+0' },
        { label: 'Vias Monitorizadas', value: roads.length, sub: 'Km de rede geospace', icon: Route, color: 'text-blue-400', trend: '=0' },
        { label: 'Alertas IA', value: aiInsights.length, sub: 'Análise de risco', icon: Brain, color: 'text-purple-400', trend: '+0' },
        { label: 'População Coberta', value: totalPopulation > 1000000 ? `${(totalPopulation / 1000000).toFixed(1)}M` : totalPopulation.toLocaleString(), sub: 'Hubs Angola', icon: Users, color: 'text-amber-400', trend: '+0' },
        { label: 'Integridade da Malha', value: '100%', sub: 'Sincronização Total', icon: Globe, color: 'text-cyan-400', trend: '+0%' },
    ];

    const user = mounted ? authService.getUser() : null;

    const filteredModules = user ? LAYER_MODULES.filter(m => {
        return m.roles.some((role: string) => role === user.role);
    }) : [];

    const isPrivate = user?.role === 'COORDENADOR_EMPRESA';

    React.useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    if (!mounted) return null; // Avoid hydration mismatch by waiting for client mount

    return (
        <div className="flex flex-col gap-8 w-full pb-20">

            {/* === OPERATIONAL HEADER === */}
            <div className="border-b border-border pb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-[0.015] pointer-events-none font-black text-[80px] leading-none -translate-y-1/4 select-none uppercase tracking-[-4px]">
                    GEOSPACE
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 z-10 relative">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-1.5 bg-primary" />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black font-mono uppercase tracking-[0.4em] text-primary/70">Strategic Geographic Intelligence Hub</span>
                                <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Command Center</h1>
                            </div>
                        </div>
                        <div className="flex gap-6 font-mono pl-4.5">
                            <div className="flex items-center gap-2">
                                <span className="text-emerald-400 font-black animate-pulse text-[10px]">●</span>
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground">Sistema_Nominal</span>
                            </div>
                            <div className="flex items-center gap-2 text-foreground border-l border-border pl-6">
                                <Clock className="w-3 h-3 opacity-40" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">
                                    {currentTime.toLocaleDateString('pt-AO', { weekday: 'short', day: '2-digit', month: 'short' })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-foreground border-l border-border pl-6">
                                <Zap className="w-3 h-3 text-amber-400" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">IA_Motor_Ativo</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 z-10">
                        <Link href="/monitoring" className="tactical-btn-primary px-8 text-[9px] inline-flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5" />
                            Mapa Tático
                        </Link>
                        <Link href="/ai-intelligence" className="tactical-btn px-8 text-[9px] inline-flex items-center gap-2">
                            <Brain className="w-3.5 h-3.5" />
                            Painel IA
                        </Link>
                    </div>
                </div>
            </div>

            {/* === QUICK STATS GRID === */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-px bg-border border border-border">
                {/* Stats Grid */}
                <div className="xl:col-span-9 grid grid-cols-2 md:grid-cols-3 gap-px bg-border">
                    {stats.map(stat => (
                        <div key={stat.label} className="bg-card p-6 md:p-8 hover:bg-muted/10 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all border-b border-l border-primary/20">
                                <stat.icon className="w-8 h-8" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-3 bg-primary/40" />
                                    <span className="text-[8px] font-black font-mono uppercase tracking-[0.4em] text-primary/60">{stat.sub}</span>
                                </div>
                                <div className={cn("text-4xl font-black tracking-tighter mt-1", stat.color)}>{stat.value}</div>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40 font-mono">{stat.label}</span>
                                    <span className="text-[8px] font-black font-mono text-emerald-400 bg-emerald-400/5 px-1.5 py-0.5 border border-emerald-400/20">{stat.trend}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Radar Segment */}
                <div className="xl:col-span-3 bg-muted/5 flex flex-col p-8 items-center justify-center border-l border-border relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full px-4 py-2 border-b border-border bg-background/50 z-10 flex justify-between items-center font-mono">
                      <span className="text-[7px] font-black text-primary uppercase">Detecção_Ativa: Angola</span>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
                        <div className="w-1.5 h-1.5 bg-primary/40" />
                      </div>
                    </div>
                    <div className="w-full max-w-[240px]">
                      <TacticalRadar />
                    </div>
                    <div className="mt-6 w-full space-y-2">
                        <div className="flex items-center justify-between text-[8px] font-mono opacity-50 uppercase">
                          <span>Força Amiga (G.F.)</span>
                          <span className="text-emerald-400">{(statsData as any)?.object?.drivers?.online || '0'} Ativas</span>
                        </div>
                        <div className="w-full h-px bg-border" />
                        <div className="flex items-center justify-between text-[8px] font-mono opacity-50 uppercase">
                          <span>Anomalias Detetadas</span>
                          <span className="text-amber-400">{aiInsights.length || '0'} Pendentes</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* === MAIN DISPLAY HUB === */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-px bg-border border border-border">

                {/* Tactical Map */}
                <div ref={mapConstraintsRef} className="xl:col-span-8 bg-card relative overflow-hidden">
                    <div className="h-[520px] relative">
                        <motion.div
                            drag
                            dragConstraints={mapConstraintsRef}
                            dragElastic={0}
                            dragMomentum={false}
                            className="absolute top-4 left-4 z-10 cursor-grab active:cursor-grabbing"
                        >
                            <div className="bg-background/90 backdrop-blur-xl p-4 border border-border flex flex-col gap-3 shadow-2xl tactical-panel">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-[8px] font-black text-primary uppercase tracking-[0.5em] font-mono opacity-70">Angola_Território</span>
                                </div>
                                <span className="text-[13px] font-black uppercase tracking-widest leading-none text-foreground">GEOSPACE_MALHA</span>
                                <div className="flex gap-2">
                                    <div className="px-2 py-0.5 bg-muted border border-border text-[7px] font-black uppercase font-mono">LAT: -8.8383</div>
                                    <div className="px-2 py-0.5 bg-muted border border-border text-[7px] font-black uppercase font-mono">LNG: 13.2344</div>
                                </div>
                            </div>
                        </motion.div>
                        <MapComponent units={units} incidents={incidents} />
                    </div>
                </div>

                {/* Right Panel */}
                <div className="xl:col-span-4 flex flex-col bg-border gap-px">

                    {/* AI Insights */}
                    <div className="bg-card flex flex-col flex-1 min-h-[260px]">
                        <div className="bg-muted px-6 py-4 flex items-center justify-between border-b border-border">
                            <div className="flex items-center gap-2">
                                <Brain className="w-3.5 h-3.5 text-purple-400" />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] font-mono">IA_Alertas_Ativos</span>
                            </div>
                            <Link href="/ai-intelligence" className="text-[7px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-opacity flex items-center gap-1">
                                Ver Todos <ChevronRight className="w-2.5 h-2.5" />
                            </Link>
                        </div>
                        <div className="overflow-y-auto divide-y divide-border/20 flex-1 scrollbar-hide">
                            {aiInsights.map((insight, idx) => (
                                <div key={idx} className="p-4 hover:bg-muted/30 transition-all group flex gap-3 items-start">
                                    <div className={cn("p-2 shrink-0 mt-0.5", insight.bg)}>
                                        <insight.icon className={cn("w-3 h-3", insight.color)} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-tight leading-tight">{insight.label}</span>
                                            <span className="text-[7px] font-mono opacity-30 shrink-0">{insight.time}</span>
                                        </div>
                                        <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{insight.desc}</p>
                                        <span className="text-[8px] font-black text-primary/70 font-mono mt-1 block">{insight.area}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Incident trend */}
                    <div className="bg-card p-6 flex flex-col h-[260px]">
                        <div className="flex items-center justify-between border-b border-border/20 pb-4 mb-4">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] font-mono opacity-40">Tendência de Incidentes</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Análise_24H</span>
                            </div>
                            <div className="px-1.5 py-0.5 bg-muted text-[7px] font-black uppercase border border-border font-mono">CICLO_24H</div>
                        </div>
                        <div className="flex-1 w-full overflow-hidden">
                            <OverviewChart data={chartData?.mapped} isLoading={isLoadingChart} />
                        </div>
                    </div>
                </div>
            </div>

            {/* === LAYER MODULES GRID === */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-4 w-1 bg-foreground/30" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono opacity-60">
                        {isPrivate ? 'Acesso Externo / Ativos de Empresa' : 'Módulos de Camadas / Layers'}
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-border border border-border">
                    {filteredModules.map((module, i) => (
                        <motion.div
                            key={module.href}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.07 }}
                        >
                            <Link
                                href={module.href}
                                className={cn(
                                    "bg-card p-8 flex items-start gap-4 hover:bg-muted/20 transition-all group border-l-4",
                                    module.color
                                )}
                            >
                                <div className="p-3 border border-border bg-muted/30 group-hover:bg-primary group-hover:border-primary transition-all">
                                    <module.icon className="w-5 h-5 group-hover:text-primary-foreground transition-colors" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[13px] font-black uppercase tracking-tight">{module.label}</span>
                                        <ChevronRight className="w-3.5 h-3.5 opacity-20 group-hover:opacity-60 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <span className="text-[9px] text-muted-foreground font-mono mt-1 block opacity-60">{module.desc}</span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
