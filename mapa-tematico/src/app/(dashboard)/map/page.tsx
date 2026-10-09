'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { ShieldIcon, Radio, Activity as ActivityIcon, GraduationCap, HeartPulse, AlertTriangle, Users, Eye } from 'lucide-react';
import { TacticalRadar } from '@/components/dashboard/TacticalRadar';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const MapComponent = dynamic(() => import('@/components/map/TacticalMap'), {
    ssr: false,
    loading: () => (
        <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center font-mono text-[10px] font-black uppercase tracking-[0.5em] text-foreground opacity-30">
            <span className="animate-pulse">Sincronizando Malha MTNI...</span>
        </div>
    )
});

export default function MonitoringPage() {
    const [schools, setSchools] = useState<any[]>([]);
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [demographics, setDemographics] = useState<any[]>([]);
    const [incidents, setIncidents] = useState<any[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [mounted, setMounted] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>([-12.1642, 17.5691]);
    const [mapZoom, setMapZoom] = useState(6);
    const [satLinkId, setSatLinkId] = useState<number | null>(null);
    const [showRadar, setShowRadar] = useState(true);
    
    const { toast } = useToast();

    // Initial fetch
    useEffect(() => {
        setMounted(true);
        setSatLinkId(Math.floor(Math.random() * 899) + 100);
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        
        const fetchData = async () => {
            try {
                const res = await api.get('/map-data');
                const d = (res as any).data || (res as any);
                setSchools(d.schools || []);
                setHospitals(d.hospitals || []);
                setDemographics(d.demographics || []);
                setIncidents(d.incidents || []);
            } catch (error) {
                console.error('Monitoring Failure:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => clearInterval(timer);
    }, []);

    const handleStyleChange = (style: string) => {
        // Log style change if needed
    };

    return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-background bg-tactical-grid mt-16">

            {/* BACKGROUND TACTICAL MAP */}
            <div className="absolute inset-0 z-0">
                <MapComponent
                    schools={schools}
                    hospitals={hospitals}
                    demographics={demographics}
                    incidents={incidents}
                    center={mapCenter}
                    zoom={mapZoom}
                    onStyleChange={handleStyleChange}
                />
                <div className="absolute inset-0 pointer-events-none z-10 opacity-10">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-primary" />
                    <div className="absolute left-1/2 top-0 w-px h-full bg-primary" />
                </div>
            </div>

            {/* RADAR TOGGLE BUTTON (MOBILE FRIENDLY) */}
            <button 
                onClick={() => setShowRadar(!showRadar)}
                className="absolute top-20 left-6 z-[100] w-10 h-10 bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-xl"
            >
                <Eye className={cn("w-4 h-4", showRadar ? "text-primary" : "opacity-30")} />
            </button>

            {/* TOP LEFT: RADAR PANEL */}
            <AnimatePresence>
                {showRadar && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="absolute top-20 left-20 z-[90] w-[240px] bg-background/80 backdrop-blur-xl border-l-4 border-l-primary border border-border p-4 tactical-panel shadow-2xl skew-x-[-1deg] hidden md:block"
                    >
                        <div className="flex items-center justify-between mb-4 border-b border-border/20 pb-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary font-mono flex items-center gap-2">
                                <Radio className="w-3 h-3 animate-pulse" /> VARREDURA_OKUSANGA
                            </span>
                            <span className="text-[7px] font-mono opacity-40">ZULU-TIME</span>
                        </div>
                        
                        <div className="flex items-center justify-center p-2 bg-muted/20 rounded-sm mb-4">
                            <TacticalRadar />
                        </div>

                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-blue-600/10 p-2 border border-blue-600/20 rounded-sm">
                                    <div className="flex items-center gap-1 mb-1">
                                        <GraduationCap className="w-2.5 h-2.5 text-blue-500" />
                                        <span className="text-[6px] font-black uppercase text-blue-500/60">EDUCAÇÃO</span>
                                    </div>
                                    <span className="text-sm font-black text-blue-500">{schools.length}</span>
                                </div>
                                <div className="bg-emerald-600/10 p-2 border border-emerald-600/20 rounded-sm">
                                    <div className="flex items-center gap-1 mb-1">
                                        <HeartPulse className="w-2.5 h-2.5 text-emerald-500" />
                                        <span className="text-[6px] font-black uppercase text-emerald-500/60">SAÚDE</span>
                                    </div>
                                    <span className="text-sm font-black text-emerald-500">{hospitals.length}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-red-600/10 p-2 border border-red-600/20 rounded-sm">
                                    <div className="flex items-center gap-1 mb-1">
                                        <AlertTriangle className="w-2.5 h-2.5 text-red-500" />
                                        <span className="text-[6px] font-black uppercase text-red-500/60">SINISTROS</span>
                                    </div>
                                    <span className="text-sm font-black text-red-500">{incidents.length}</span>
                                </div>
                                <div className="bg-orange-600/10 p-2 border border-orange-600/20 rounded-sm">
                                    <div className="flex items-center gap-1 mb-1">
                                        <Users className="w-2.5 h-2.5 text-orange-500" />
                                        <span className="text-[6px] font-black uppercase text-orange-500/60">DENSIDADE</span>
                                    </div>
                                    <span className="text-sm font-black text-orange-500">{demographics.length}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* BOTTOM LEFT: SYSTEM INTEGRITY */}
            <div className="absolute bottom-10 left-10 z-40 pointer-events-none">
                <div className="tactical-panel bg-background/90 backdrop-blur-2xl p-6 flex flex-col gap-3 border-l-8 border-l-foreground shadow-2xl border border-border">
                    <div className="flex flex-col -gap-1 leading-none">
                        <span className="text-[10px] font-black font-mono opacity-40 uppercase tracking-[0.4em]">SISTEMA_REGIONAL_INTEGRADO</span>
                        <h2 className="text-2xl font-black uppercase tracking-tighter mt-1 leading-none">OKUSANGA_GOV_AO</h2>
                    </div>
                    <div className="flex items-center gap-6 border-t border-border pt-4 mt-1">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_currentColor]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.1em] font-mono text-primary">SCAN_NOMINAL</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground opacity-80 border-l border-border pl-6">
                            <ShieldIcon className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.1em] font-mono">ENCRYPTED_AES</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM RIGHT: ZULU CLOCK */}
            <div className="absolute bottom-10 right-10 z-40 pointer-events-none bg-background/80 backdrop-blur-xl border border-border p-4 tactical-panel shadow-2xl skew-x-[1deg]">
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary leading-none mb-1">MTNI_CLOCK_ZULU</span>
                    <span className="font-mono text-3xl font-black text-foreground">{mounted ? currentTime.toLocaleTimeString([], { hour12: false }) : '--:--:--'}</span>
                    <div className="w-full h-px bg-primary/20 mt-2" />
                    <span className="text-[7px] font-mono opacity-30 mt-1 uppercase">Sincronização Ativa // Sat_Link_{mounted ? satLinkId : '---'}</span>
                </div>
            </div>

            {/* IA TOOL: RIGHT SIDE */}
            <div className="absolute top-1/2 -translate-y-1/2 right-10 z-30 flex flex-col gap-4">
                <button 
                    onClick={() => {
                        toast({ title: "Motor IA Cognitivo", description: "Iniciando análise preditiva de densidade..." });
                    }}
                    className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center rounded-sm shadow-2xl hover:scale-110 active:scale-95 transition-all border border-foreground/20 group"
                >
                    <ActivityIcon className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                </button>
                <div className="w-12 h-px bg-border group-hover:w-20 transition-all" />
                <button 
                    className="w-12 h-12 bg-background/80 backdrop-blur-md text-foreground flex items-center justify-center rounded-sm border border-border shadow-2xl hover:bg-primary hover:text-primary-foreground transition-all"
                >
                    <ShieldIcon className="w-6 h-6" />
                </button>
            </div>

        </div>
    );
}
