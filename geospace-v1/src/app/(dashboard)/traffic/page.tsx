'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Clock, RefreshCw, Gauge, Navigation, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const MapComponent = dynamic(() => import('@/components/map/TacticalMap'), { ssr: false, loading: () => <div className="h-full w-full bg-muted/20 animate-pulse" /> });

const TRAFFIC_LEVELS = {
    FLUIDO: { label: 'Fluido', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    LENTO: { label: 'Lento', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    CONGESTIONADO: { label: 'Congestionado', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    PARADO: { label: 'Parado', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

import { useTraffic } from '@/hooks/use-traffic';

export default function TrafficPage() {
    const { data, isLoading } = useTraffic();
    const trafficData = Array.isArray(data) ? data : (data as any)?.object || (data as any)?.data || [];
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [selectedLevel, setSelectedLevel] = useState<string>('Todos');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const filtered = trafficData.filter((t: any) =>
        selectedLevel === 'Todos' || t.status === selectedLevel
    );

    const stats = {
        fluido: trafficData.filter(t => t.status === 'FLUIDO').length,
        lento: trafficData.filter(t => t.status === 'LENTO').length,
        congestionado: trafficData.filter(t => t.status === 'CONGESTIONADO').length,
        parado: trafficData.filter(t => t.status === 'PARADO').length,
    };

    const totalVehicles = trafficData.reduce((s, t) => s + (t.vehicles || 0), 0).toLocaleString();
    const avgSpeed = trafficData.length > 0 ? Math.round(trafficData.reduce((s, t) => s + (t.speed || 0), 0) / trafficData.length) : 0;

    return (
        <div className="flex flex-col gap-8 w-full pb-20">

            {/* Header */}
            <div className="border-b border-border pb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="h-6 w-1.5 bg-red-500" />
                    <div>
                        <span className="text-[8px] font-black font-mono uppercase tracking-[0.4em] text-red-500/70 block">Layer 04 — Tráfego em Tempo Real</span>
                        <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Congestionamento & Fluxo</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-[8px] font-mono opacity-40">
                        <Activity className="w-3 h-3 animate-pulse text-emerald-400" />
                        Actualizado às {mounted ? lastRefresh.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
                    </div>
                    <button
                        onClick={() => setLastRefresh(new Date())}
                        className="tactical-btn px-4 text-[9px] inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-3 h-3" /> Actualizar
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-px bg-border border border-border">
                {[
                    { label: 'Veículos Rastreados', value: totalVehicles, color: 'text-foreground' },
                    { label: 'Velocidade Média', value: `${avgSpeed} km/h`, color: 'text-primary' },
                    { label: 'Fluido', value: stats.fluido, color: 'text-emerald-400' },
                    { label: 'Lento', value: stats.lento, color: 'text-amber-400' },
                    { label: 'Congestionado', value: stats.congestionado, color: 'text-orange-400' },
                    { label: 'Parado', value: stats.parado, color: 'text-red-500' },
                ].map(s => (
                    <div key={s.label} className="bg-card p-5">
                        <div className={cn("text-2xl font-black tracking-tighter", s.color)}>{s.value}</div>
                        <div className="text-[7px] font-black uppercase tracking-widest opacity-40 font-mono mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {['Todos', ...Object.keys(TRAFFIC_LEVELS)].map(level => {
                    const style = TRAFFIC_LEVELS[level as keyof typeof TRAFFIC_LEVELS];
                    const isActive = selectedLevel === level;
                    return (
                        <button
                            key={level}
                            onClick={() => setSelectedLevel(level)}
                            className={cn(
                                "px-4 py-2 text-[8px] font-black uppercase tracking-widest border transition-all font-mono",
                                isActive
                                    ? "bg-foreground text-background border-foreground"
                                    : style ? `${style.color} ${style.border} ${style.bg} hover:opacity-80` : "border-border hover:bg-muted/30"
                            )}
                        >
                            {style?.label || level}
                        </button>
                    );
                })}
            </div>

            {/* Main: Traffic List + Map */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-px bg-border border border-border min-h-[600px]">

                {/* Traffic List */}
                <div className="xl:col-span-5 bg-card flex flex-col overflow-y-auto scrollbar-hide">
                    <div className="divide-y divide-border/30">
                        {filtered.map((item, idx) => {
                            const style = TRAFFIC_LEVELS[item.status as keyof typeof TRAFFIC_LEVELS];
                            const speedPct = Math.min(100, (item.speed / item.maxSpeed) * 100);
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="p-5 hover:bg-muted/30 transition-all"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={cn("p-2 border shrink-0 mt-0.5", style.bg, style.border)}>
                                            <Gauge className={cn("w-3.5 h-3.5", style.color)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="text-[11px] font-black uppercase tracking-tight leading-tight">{item.route}</span>
                                                <span className={cn("text-[7px] font-black font-mono px-1.5 py-0.5 border shrink-0", style.color, style.border, style.bg)}>
                                                    {style.label}
                                                </span>
                                            </div>

                                            {/* Speed bar */}
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex-1 h-1.5 bg-border/30">
                                                    <div
                                                        className={cn("h-full transition-all", item.status === 'FLUIDO' ? 'bg-emerald-400' : item.status === 'LENTO' ? 'bg-amber-400' : item.status === 'CONGESTIONADO' ? 'bg-orange-400' : 'bg-red-500')}
                                                        style={{ width: `${speedPct}%` }}
                                                    />
                                                </div>
                                                <span className={cn("text-[10px] font-black font-mono shrink-0", style.color)}>{item.speed} km/h</span>
                                            </div>

                                            <div className="flex gap-4 mt-2">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-2.5 h-2.5 opacity-30" />
                                                    <span className="text-[8px] font-mono opacity-50">+{item.delay}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Navigation className="w-2.5 h-2.5 opacity-30" />
                                                    <span className="text-[8px] font-mono opacity-50">{item.vehicles.toLocaleString()} veíc.</span>
                                                </div>
                                                {item.cause !== '—' && (
                                                    <span className="text-[8px] font-mono opacity-50 text-amber-400">{item.cause}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Map */}
                <div className="xl:col-span-7 relative min-h-[400px]">
                    <MapComponent center={[-8.8383, 13.2344]} zoom={12} traffic={filtered} />

                    {/* Live indicator */}
                    <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-md border border-border p-3 tactical-panel">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping absolute" />
                            <div className="w-2 h-2 bg-red-500 rounded-full relative" />
                            <span className="text-[8px] font-black font-mono uppercase tracking-widest text-red-400 ml-4">LIVE — Tráfego Real</span>
                        </div>
                    </div>

                    {/* Traffic Stats Overlay */}
                    <div className="absolute bottom-4 right-4 z-10 bg-background/90 backdrop-blur-md border border-border p-4 tactical-panel space-y-2">
                        <span className="text-[7px] font-mono font-black uppercase tracking-widest opacity-40 block">Distribuição do Tráfego</span>
                        {Object.entries(TRAFFIC_LEVELS).map(([key, val]) => {
                            const count = trafficData.filter(t => t.status === key).length;
                            const pct = trafficData.length > 0 ? Math.round((count / trafficData.length) * 100) : 0;
                            return (
                                <div key={key} className="flex items-center gap-2">
                                    <div className={cn("w-2 h-2", key === 'FLUIDO' ? 'bg-emerald-400' : key === 'LENTO' ? 'bg-amber-400' : key === 'CONGESTIONADO' ? 'bg-orange-400' : 'bg-red-500')} />
                                    <span className="text-[8px] font-mono w-24 opacity-60">{val.label}</span>
                                    <div className="flex-1 h-1 bg-border/30">
                                        <div className={cn("h-full", key === 'FLUIDO' ? 'bg-emerald-400' : key === 'LENTO' ? 'bg-amber-400' : key === 'CONGESTIONADO' ? 'bg-orange-400' : 'bg-red-500')} style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className={cn("text-[8px] font-black font-mono", val.color)}>{pct}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
