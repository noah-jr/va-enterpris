"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Maximize2, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnits } from '@/hooks/use-units';
import { useIncidents } from '@/hooks/use-incidents';

interface RadarPoint {
    id: number;
    x: number;
    y: number;
    type: 'FRIENDLY' | 'HOSTILE' | 'NEUTRAL';
    pulse: boolean;
}

export const TacticalRadar = () => {
    const { data: unitsData } = useUnits();
    const { data: incidentsData } = useIncidents();
    const [points, setPoints] = useState<RadarPoint[]>([]);
    const [zoom, setZoom] = useState(500);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const units = (unitsData || []) as any[];
        const incidents = (incidentsData || []) as any[];

        const mappedUnits = units.map((u, i) => ({
            id: i,
            x: 50 + (u.lng - 13.2344) * zoom, 
            y: 50 - (u.lat + 8.8383) * zoom,
            type: 'FRIENDLY' as const,
            pulse: u.status === 'OPERACIONAL'
        }));

        const mappedIncidents = incidents.map((inc, i) => ({
            id: i + 1000,
            x: 50 + (inc.lng - 13.2344) * zoom,
            y: 50 - (inc.lat + 8.8383) * zoom,
            type: inc.priority === 'ALTA' ? 'HOSTILE' as const : 'NEUTRAL' as const,
            pulse: inc.status === 'ATIVO'
        }));

        const allPoints = [...mappedUnits, ...mappedIncidents].filter(p => 
            p.x >= 2 && p.x <= 98 && p.y >= 2 && p.y <= 98
        );

        setPoints(allPoints);
    }, [unitsData, incidentsData, zoom]);

    const RadarContent = () => (
        <>
            {/* Background Grid */}
            <div className="absolute inset-0 rounded-full border border-primary/10">
                <div className="absolute top-1/2 left-0 w-full h-px bg-primary/20" />
                <div className="absolute left-1/2 top-0 w-px h-full bg-primary/20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] rounded-full border border-primary/10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 rounded-full border border-primary/10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 rounded-full border border-primary/10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4 rounded-full border border-primary/10" />
            </div>

            {/* Sweep Animation */}
            <div className="radar-sweep" />

            {/* Points */}
            {points.map(point => (
                <motion.div
                    key={point.id}
                    className="absolute w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 z-10"
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                >
                    <div className={cn(
                        "w-full h-full rounded-full shadow-[0_0_15px_currentColor]",
                        point.type === 'FRIENDLY' ? "bg-emerald-500 text-emerald-500" :
                        point.type === 'HOSTILE' ? "bg-red-500 text-red-500" : "bg-amber-500 text-amber-500"
                    )} />
                    {point.pulse && (
                        <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-75" />
                    )}
                </motion.div>
            ))}
        </>
    );

    return (
        <>
            <div className="radar-container rounded-full border-2 border-primary/20 p-2 shadow-[0_0_50px_rgba(75,83,32,0.2)] group cursor-crosshair">
                <RadarContent />

                {/* Zoom Controls Overlay */}
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                        onClick={() => setZoom(prev => Math.min(prev * 1.5, 5000))}
                        className="p-1.5 bg-background border border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all rounded-md shadow-xl"
                    >
                        <Plus size={10} strokeWidth={3} />
                    </button>
                    <button 
                        onClick={() => setIsExpanded(true)}
                        className="p-1.5 bg-background border border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all rounded-md shadow-xl"
                    >
                        <Maximize2 size={10} strokeWidth={3} />
                    </button>
                    <button 
                        onClick={() => setZoom(prev => Math.max(prev / 1.5, 50))}
                        className="p-1.5 bg-background border border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all rounded-md shadow-xl"
                    >
                        <Minus size={10} strokeWidth={3} />
                    </button>
                </div>

                {/* Overlay Info */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[7px] font-black font-mono text-primary/60 uppercase tracking-widest bg-background/80 px-2 py-0.5 border border-primary/20">
                    SCN: 12.4GHz
                </div>
            </div>

            {/* EXPANDED VIEW MODAL */}
            {isExpanded && (
                <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-2xl flex items-center justify-center p-12 overflow-hidden border-4 border-primary/20 m-4">
                    {/* Tactical Frame Decor */}
                    <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden font-mono text-[10px] p-8 uppercase tracking-[0.5em] leading-[4] text-primary select-none break-all">
                        {Array.from({ length: 40 }).map((_, i) => (
                            <div key={i}>GEOSPACE_RADAR_SCAN_ACTIVE_LAT_-8.8383_LNG_13.2344_IDENT_OKUSANGA_SECURE_MODE_ON</div>
                        ))}
                    </div>

                    <div className="relative w-full max-w-4xl aspect-square radar-container border-4 border-primary/10 p-4 shadow-[0_0_100px_rgba(75,83,32,0.3)]">
                        <RadarContent />
                        
                        {/* Expanded Controls */}
                        <div className="absolute top-8 right-8 flex flex-col gap-4">
                            <button 
                                onClick={() => setIsExpanded(false)}
                                className="bg-primary text-primary-foreground px-8 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-primary/80 transition-all rounded-sm"
                            >
                                <span>FECHAR_SISTEMA</span>
                                <Target size={14} />
                            </button>
                             <div className="flex gap-2">
                                <button onClick={() => setZoom(prev => prev * 1.5)} className="p-3 bg-background border border-primary/20 hover:bg-primary/10 rounded-sm"><Plus size={14} /></button>
                                <button onClick={() => setZoom(prev => prev / 1.5)} className="p-3 bg-background border border-primary/20 hover:bg-primary/10 rounded-sm"><Minus size={14} /></button>
                             </div>
                        </div>

                        {/* Meta Info */}
                        <div className="absolute top-8 left-8 flex flex-col gap-2 font-mono">
                             <div className="flex items-center gap-2">
                                 <div className="w-2 h-2 bg-emerald-500 animate-pulse" />
                                 <span className="text-[10px] font-black text-emerald-500 uppercase">Varredura_Ativa</span>
                             </div>
                             <div className="text-[8px] text-primary/60">SECTOR: LUANDA_CORE</div>
                             <div className="text-[8px] text-primary/60">ALVOS_DETETADOS: {points.length}</div>
                        </div>

                        {/* Bottom Status Bar */}
                        <div className="absolute -bottom-8 left-0 right-0 flex justify-between items-center text-[9px] font-mono px-4 opacity-50">
                            <span>GEOSPACE_V_1.0.42_ESTÁVEL</span>
                            <span>DETERMINAÇÃO_RADIAL_PRECISA</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
