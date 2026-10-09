'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Thermometer, Users, AlertTriangle, Activity, TrendingUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const MapComponent = dynamic(() => import('@/components/map/TacticalMap'), { ssr: false, loading: () => <div className="h-full w-full bg-muted/20 animate-pulse" /> });



const DENSITY_LEVELS = {
    'CRÍTICA': { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', heat: 'bg-red-600' },
    'MUITO_ALTA': { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', heat: 'bg-orange-500' },
    'ALTA': { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', heat: 'bg-amber-500' },
    'MODERADA': { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', heat: 'bg-yellow-500' },
    'BAIXA': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', heat: 'bg-emerald-500' },
};

import api from '@/lib/axios';

import { useDensity } from '@/hooks/use-density';

export default function DensityPage() {
    const { data: rawDensities, isLoading } = useDensity();
    const densityZones = (rawDensities as any[])?.map((z: any) => ({
        ...z,
        density: z.densityValue,
        population: z.populationCount?.toLocaleString() || 'N/A',
        classification: z.classification,
        area: z.area || 'TBC',
        risk: z.riskScore > 70 ? 'ALTO' : z.riskScore > 40 ? 'MÉDIO' : 'BAIXO'
    })) || [];

    const [selectedZone, setSelectedZone] = useState<any | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([-8.8383, 13.2344]);
    const [mapZoom, setMapZoom] = useState(11);

    const sortedZones = [...densityZones].sort((a, b) => b.density - a.density);
    const criticalZones = densityZones.filter(z => z.density >= 80).length;
    const avgDensity = densityZones.length > 0 ? 
        Math.round(densityZones.reduce((s, z) => s + z.density, 0) / densityZones.length) : 0;
    const totalPopCount = densityZones.reduce((s, z) => s + (z.populationCount || 0), 0);
    const totalPop = totalPopCount.toLocaleString() + '+';

    if (isLoading) return <div className="p-20 text-center font-mono animate-pulse">MAPEANDO DENSIDADE ESTRATÉGICA...</div>;


    return (
        <div className="flex flex-col gap-8 w-full pb-20">

            {/* Header */}
            <div className="border-b border-border pb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="h-6 w-1.5 bg-orange-500" />
                    <div>
                        <span className="text-[8px] font-black font-mono uppercase tracking-[0.4em] text-orange-500/70 block">Layer 03 — Densidade Populacional</span>
                        <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Mapa de Calor Poblacional</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-card border border-border p-4">
                    <Info className="w-4 h-4 text-primary opacity-60" />
                    <span className="text-[9px] font-mono opacity-50 uppercase tracking-wider">Dados actualizados com base em censos e GPS anónimo</span>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
                {[
                    { label: 'Pop. Total Monitorizada', value: totalPop, color: 'text-foreground', icon: Users },
                    { label: 'Zonas Críticas', value: criticalZones, color: 'text-red-400', icon: AlertTriangle },
                    { label: 'Densidade Média', value: `${avgDensity}%`, color: 'text-amber-400', icon: Thermometer },
                    { label: 'Zonas de Risco', value: densityZones.filter(z => z.risk === 'ALTO').length, color: 'text-orange-400', icon: TrendingUp },
                ].map(s => (
                    <div key={s.label} className="bg-card p-6 flex flex-col gap-2">
                        <s.icon className={cn("w-4 h-4", s.color)} />
                        <div className={cn("text-3xl font-black tracking-tighter", s.color)}>{s.value}</div>
                        <div className="text-[8px] font-black uppercase tracking-widest opacity-40 font-mono">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Heatmap scale legend */}
            <div className="tactical-panel bg-card border border-border p-5">
                <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-[8px] font-black font-mono uppercase tracking-widest opacity-50">Escala de Densidade:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {(['BAIXA', 'MODERADA', 'ALTA', 'MUITO_ALTA', 'CRÍTICA'] as const).map(level => (
                            <div key={level} className="flex items-center gap-1.5">
                                <div className={cn("w-6 h-3", DENSITY_LEVELS[level].heat)} />
                                <span className={cn("text-[7px] font-black font-mono", DENSITY_LEVELS[level].color)}>{level}</span>
                            </div>
                        ))}
                    </div>
                    <div className="ml-auto">
                        <div className="w-48 h-3 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-600" />
                        <div className="flex justify-between">
                            <span className="text-[6px] font-mono opacity-40">0%</span>
                            <span className="text-[6px] font-mono opacity-40">50%</span>
                            <span className="text-[6px] font-mono opacity-40">100%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-px bg-border border border-border min-h-[600px]">

                {/* Zone List */}
                <div className="xl:col-span-4 bg-card flex flex-col">
                    <div className="px-4 py-3 border-b border-border bg-muted/20">
                        <span className="text-[9px] font-black font-mono uppercase tracking-widest">Zonas Ordenadas por Densidade</span>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-border/30 scrollbar-hide">
                        {sortedZones.map((zone, idx) => {
                            const level = zone.classification as keyof typeof DENSITY_LEVELS;
                            const style = DENSITY_LEVELS[level] || DENSITY_LEVELS['MODERADA'];
                            const isSelected = selectedZone?.id === zone.id;
                            return (
                                <motion.div
                                    key={zone.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => {
                                        setSelectedZone(zone);
                                        setMapCenter([zone.lat, zone.lng]);
                                        setMapZoom(14);
                                    }}
                                    className={cn(
                                        "p-4 cursor-pointer transition-all group",
                                        isSelected ? "bg-foreground text-background" : "hover:bg-muted/30"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Rank */}
                                        <span className={cn("text-[11px] font-black font-mono w-6 shrink-0", isSelected ? "text-background/50" : "text-muted-foreground/30")}>
                                            {(idx + 1).toString().padStart(2, '0')}
                                        </span>

                                        {/* Density Bar */}
                                        <div className="w-1 h-10 bg-border/30 relative shrink-0">
                                            <div
                                                className={cn("absolute bottom-0 left-0 w-full transition-all", style.heat)}
                                                style={{ height: `${zone.density}%`, opacity: isSelected ? 0.6 : 0.8 }}
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="text-[11px] font-black uppercase leading-tight truncate">{zone.name}</span>
                                                <span className={cn("text-[12px] font-black tabular-nums shrink-0", isSelected ? "text-background" : style.color)}>
                                                    {zone.density}%
                                                </span>
                                            </div>
                                            <div className="flex gap-3 mt-1">
                                                <span className={cn("text-[7px] font-mono", isSelected ? "opacity-50 text-background" : "opacity-40")}>{zone.population} pessoas</span>
                                                <span className={cn("text-[7px] font-mono", isSelected ? "opacity-50 text-background" : "opacity-40")}>{zone.area}</span>
                                            </div>
                                            {/* Mini progress bar */}
                                            <div className={cn("h-0.5 mt-2 w-full", isSelected ? "bg-background/20" : "bg-border/30")}>
                                                <div
                                                    className={cn("h-full", isSelected ? "bg-background" : style.heat)}
                                                    style={{ width: `${zone.density}%`, opacity: 0.8 }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Map + details */}
                <div className="xl:col-span-8 relative min-h-[400px] flex flex-col">
                    <div className="flex-1 relative">
                        <MapComponent center={mapCenter} zoom={mapZoom} zones={densityZones} />

                        {/* Heatmap overlay disclaimer */}
                        <div className="absolute top-4 right-4 z-10 bg-background/90 backdrop-blur-md border border-border p-3 max-w-[200px]">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-3 h-3 text-orange-400 animate-pulse" />
                                <span className="text-[7px] font-black font-mono uppercase tracking-widest">Heatmap Ativo</span>
                            </div>
                            <span className="text-[7px] font-mono opacity-40 leading-relaxed">
                                Visualização de calor baseada em densidade relativa por zona
                            </span>
                        </div>

                        {/* Selected Zone Card */}
                        {selectedZone && (() => {
                            const level = selectedZone.classification as keyof typeof DENSITY_LEVELS;
                            const style = DENSITY_LEVELS[level] || DENSITY_LEVELS['MODERADA'];
                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-4 left-4 z-10 bg-background/95 backdrop-blur-md border border-border p-5 shadow-2xl tactical-panel min-w-[260px]"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="text-[7px] font-mono font-black uppercase tracking-[0.4em] opacity-50 block">{selectedZone.id}</span>
                                            <span className="text-[12px] font-black uppercase leading-tight block mt-0.5">{selectedZone.name}</span>
                                        </div>
                                        <button onClick={() => setSelectedZone(null)} className="text-foreground/30 hover:text-foreground ml-2 text-sm">✕</button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: 'Densidade', value: `${selectedZone.density}%` },
                                            { label: 'População', value: selectedZone.population },
                                            { label: 'Área', value: selectedZone.area },
                                            { label: 'Risco', value: selectedZone.risk },
                                        ].map(d => (
                                            <div key={d.label} className="bg-muted/30 p-2">
                                                <span className="text-[7px] font-mono opacity-40 block">{d.label}</span>
                                                <span className="text-[10px] font-black">{d.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={cn("mt-3 px-3 py-1.5 text-center text-[8px] font-black font-mono border", style.color, style.border, style.bg)}>
                                        {selectedZone.classification.replace('_', ' ')}
                                    </div>
                                </motion.div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}
