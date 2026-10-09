'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Route, AlertTriangle, CheckCircle, Clock, Search, TrendingUp, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

const MapComponent = dynamic(() => import('@/components/map/TacticalMap'), { ssr: false, loading: () => <div className="h-full w-full bg-muted/20 animate-pulse" /> });

const ROUTE_STATUS = {
    BOA: { label: 'Boa', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5' },
    DEGRADADA: { label: 'Degradada', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/5' },
    BLOQUEADA: { label: 'Bloqueada', color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/5' },
};



const ROUTE_TYPES = ['Todas', 'Principal', 'Secundária', 'Alternativa'] as const;
const ROUTE_STATUSES = ['Todos', 'BOA', 'DEGRADADA', 'BLOQUEADA'] as const;

import { useRoads } from '@/hooks/use-roads';

export default function RoutesPage() {
    const { data, isLoading } = useRoads();
    const roads = (data as any[]) || [];
    const [selectedType, setSelectedType] = useState('Todas');
    const [selectedStatus, setSelectedStatus] = useState('Todos');
    const [search, setSearch] = useState('');

    const filtered = roads.filter((r: any) => {
        const matchType = selectedType === 'Todas' || r.type === selectedType;
        const matchStatus = selectedStatus === 'Todos' || r.status === selectedStatus;
        const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
        return matchType && matchStatus && matchSearch;
    });

    const stats = {
        total: roads.length,
        boa: roads.filter((r: any) => r.status === 'BOA').length,
        degradada: roads.filter((r: any) => r.status === 'DEGRADADA').length,
        bloqueada: roads.filter((r: any) => r.status === 'BLOQUEADA').length,
        totalIncidents: 0, // Implementar se houver relação
    };

    if (isLoading) return <div className="p-20 text-center font-mono animate-pulse">SINCRONIZANDO MALHA VIÁRIA...</div>;

    return (
        <div className="flex flex-col gap-8 w-full pb-20">

            {/* Header */}
            <div className="border-b border-border pb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-1.5 bg-blue-500" />
                        <div>
                            <span className="text-[8px] font-black font-mono uppercase tracking-[0.4em] text-blue-500/70 block">Layer 02 — Vias de Acesso</span>
                            <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Rede Viária</h1>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="tactical-btn px-6 text-[9px] inline-flex items-center gap-2">
                        <Navigation className="w-3.5 h-3.5" /> Calcular Rota
                    </button>
                    <button className="tactical-btn-primary px-6 text-[9px] inline-flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5" /> Reportar Bloqueio
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-border border border-border">
                {[
                    { label: 'Total de Vias', value: stats.total, color: 'text-foreground' },
                    { label: 'Em Bom Estado', value: stats.boa, color: 'text-emerald-400' },
                    { label: 'Degradadas', value: stats.degradada, color: 'text-amber-400' },
                    { label: 'Bloqueadas', value: stats.bloqueada, color: 'text-red-400' },
                    { label: 'Incidentes Ativos', value: stats.totalIncidents, color: 'text-orange-400' },
                ].map(s => (
                    <div key={s.label} className="bg-card p-6">
                        <div className={cn("text-3xl font-black tracking-tighter", s.color)}>{s.value}</div>
                        <div className="text-[8px] font-black uppercase tracking-widest opacity-40 font-mono mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Main */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-px bg-border border border-border min-h-[600px]">

                {/* Route List */}
                <div className="xl:col-span-5 bg-card flex flex-col">
                    {/* Filters */}
                    <div className="p-4 border-b border-border space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-30" />
                            <input
                                type="text"
                                placeholder="PESQUISAR VIA..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-muted/30 border border-border pl-8 pr-4 py-2 text-[10px] font-black uppercase tracking-wider focus:outline-none focus:border-primary font-mono placeholder:opacity-30 transition-colors"
                            />
                        </div>
                        <div className="flex gap-1 flex-wrap">
                            {ROUTE_STATUSES.map(s => (
                                <button key={s} onClick={() => setSelectedStatus(s)}
                                    className={cn("px-2 py-1 text-[7px] font-black uppercase tracking-wider border transition-all font-mono",
                                        selectedStatus === s ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/50"
                                    )}>{s}</button>
                            ))}
                        </div>
                        <div className="flex gap-1">
                            {ROUTE_TYPES.map(t => (
                                <button key={t} onClick={() => setSelectedType(t)}
                                    className={cn("px-2 py-1 text-[7px] font-black uppercase tracking-wider border transition-all font-mono",
                                        selectedType === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"
                                    )}>{t}</button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-border/30 scrollbar-hide">
                        {filtered.map((route: any, idx: number) => {
                            const statusStyle = ROUTE_STATUS[route.status as keyof typeof ROUTE_STATUS] || ROUTE_STATUS.BOA;
                            return (
                                <motion.div key={route.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="p-4 hover:bg-muted/30 transition-all group cursor-pointer"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={cn("p-2 border shrink-0 bg-muted/20", statusStyle.border)}>
                                            <Route className={cn("w-3.5 h-3.5", statusStyle.color)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="text-[11px] font-black uppercase tracking-tight leading-tight">{route.name}</span>
                                                <span className={cn("text-[7px] font-black font-mono px-1.5 py-0.5 border shrink-0", statusStyle.color, statusStyle.border, statusStyle.bg)}>
                                                    {statusStyle.label}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-1.5">
                                                <span className="text-[8px] font-mono opacity-40">{route.id.slice(0, 8)}</span>
                                                <span className="text-[8px] font-mono opacity-40">{route.type}</span>
                                                <span className="text-[8px] font-mono opacity-60 text-primary">{route.speedLimit} km/h</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                    <div className="p-3 border-t border-border bg-muted/10">
                        <span className="text-[7px] font-black font-mono uppercase tracking-widest opacity-30">{filtered.length} de {roads.length} vias registradas</span>
                    </div>
                </div>

                {/* Map */}
                <div className="xl:col-span-7 relative min-h-[400px]">
                    <MapComponent center={[-8.8383, 13.2344]} zoom={12} routes={filtered} />

                    {/* Legend */}
                    <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-md border border-border p-4 tactical-panel">
                        <span className="text-[7px] font-black font-mono uppercase tracking-[0.3em] opacity-50 block mb-3">Legenda de Estado</span>
                        <div className="space-y-2">
                            {Object.entries(ROUTE_STATUS).map(([key, val]) => (
                                <div key={key} className="flex items-center gap-2">
                                    <div className={cn("w-4 h-1", key === 'BOA' ? 'bg-emerald-400' : key === 'DEGRADADA' ? 'bg-amber-400' : 'bg-red-400')} />
                                    <span className={cn("text-[8px] font-black font-mono", val.color)}>{val.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
