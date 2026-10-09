'use client';

import React, { useEffect, useState, useRef } from 'react';

import dynamic from 'next/dynamic';
import { useSocket, useDriverLocationSocket, useEmergencySocket } from '@/hooks/use-socket';
import { useAuthUser } from '@/hooks/use-auth';
import { getActivityFeed, getOnlineDrivers, ActivityFeedItem, DriverLocation } from '@/lib/api/monitoring';
import { getEmergencies } from '@/lib/api/emergencies';
import { cn } from '@/lib/utils';
import { Crosshair, ShieldIcon, Signal, Compass, Move, Radio, Activity as ActivityIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { TacticalRadar } from '@/components/dashboard/TacticalRadar';
import { useUnits } from '@/hooks/use-units';
import { useIncidents } from '@/hooks/use-incidents';
import { useTraffic } from '@/hooks/use-traffic';
import { useToast } from '@/hooks/use-toast';

const MapComponent = dynamic(() => import('@/components/map/TacticalMap'), {
    ssr: false,
    loading: () => (
        <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center font-mono text-[10px] font-black uppercase tracking-[0.5em] text-foreground opacity-30">
            <span className="animate-pulse">Inicializando OKUSANGA_MALHA...</span>
        </div>
    )
});

export default function MonitoringPage() {
    const [drivers, setDrivers] = useState<DriverLocation[]>([]);
    const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
    const [emergencies, setEmergencies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [mounted, setMounted] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>([-8.8383, 13.2344]);
    const [mapZoom, setMapZoom] = useState(13);
    const [opsSearch, setOpsSearch] = useState('');
    const [personnelSearch, setPersonnelSearch] = useState('');
    const [styleChangeCount, setStyleChangeCount] = useState(0);
    const [showUnexpected, setShowUnexpected] = useState(false);
    const [unexpectedData, setUnexpectedData] = useState<any>(null);
    const triggeredRef = useRef(false);
    const constraintsRef = useRef(null);

    const user = useAuthUser();

    const { isConnected } = useSocket();
    const { data: unitsData } = useUnits();
    const { data: incidentsData } = useIncidents();
    const { data: trafficData } = useTraffic();
    const { toast } = useToast();

    const units = Array.isArray(unitsData) ? unitsData : (unitsData as any)?.object || (unitsData as any)?.data || [];
    const incidents = Array.isArray(incidentsData) ? incidentsData : (incidentsData as any)?.object || (incidentsData as any)?.data || [];
    const traffic = Array.isArray(trafficData) ? trafficData : (trafficData as any)?.object || (trafficData as any)?.data || [];
    // Initial fetch
    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        const fetchData = async () => {
            try {
                const [driversData, activityData, emergenciesResponse] = await Promise.all([
                    getOnlineDrivers(),
                    getActivityFeed(),
                    getEmergencies(),
                ]);
                setDrivers(Array.isArray(driversData) ? driversData : []);
                setActivityFeed(Array.isArray(activityData) ? activityData : []);
                const emergenciesDataRaw = Array.isArray(emergenciesResponse)
                    ? emergenciesResponse
                    : (emergenciesResponse as any)?.object || (emergenciesResponse as any)?.data || [];

                const mappedEmergencies = (emergenciesDataRaw as any[]).map(em => ({
                    ...em,
                    latitude: em.latitude || em.lat,
                    longitude: em.longitude || em.lng
                })).filter(em => em.latitude && em.longitude);

                setEmergencies(mappedEmergencies);
            } catch (error) {
                console.error('Monitoring Failure:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => clearInterval(timer);
    }, []);

    // Real-time Driver Location
    useDriverLocationSocket((data: { driverId: string, location: { latitude: number, longitude: number }, tripId?: string }) => {
        setDrivers(prev => {
            const index = prev.findIndex(d => d.id === data.driverId);
            if (index >= 0) {
                const newDrivers = [...prev];
                newDrivers[index] = {
                    ...newDrivers[index],
                    latitude: data.location.latitude,
                    longitude: data.location.longitude,
                    tripId: data.tripId
                };
                return newDrivers;
            } else {
                // If new driver, we might need more info to display properly.
                // For now, if we don't have name etc, we skip or add placeholder.
                // Assuming we can't create full driver object from just ID and lat/long easily without fetching.
                // We'll ignore new drivers for now until full refresh or better event data.
                return prev;
            }
        });
    });

    // Real-time Emergencies
    useEmergencySocket({
        onAlert: (data) => {
            setEmergencies(prev => [data, ...prev]);
            setActivityFeed(prev => [{
                id: data.id,
                type: 'EMERGENCY',
                message: `NOVA EMERGÊNCIA: ${data.type}`,
                timestamp: new Date().toISOString(),
                severity: 'error'
            }, ...prev]);
        },
        onStatusUpdated: (data) => {
            setEmergencies(prev => prev.map(e => e.id === data.emergencyId ? { ...e, status: data.status } : e));
        },
        onAcknowledged: (data) => {
            setEmergencies(prev => prev.map(e => e.id === data.emergencyId ? { ...e, status: 'RESOLVED' } : e));
        }
    });

    const handleStyleChange = (style: string) => {
        setStyleChangeCount(prev => {
            const next = prev + 1;
            if (next >= 5 || style === 'quantum') {
                triggerUnexpectedEvent();
            }
            return next;
        });
    };

    const triggerUnexpectedEvent = () => {
        if (triggeredRef.current || showUnexpected) return;
        triggeredRef.current = true;

        // Simular a recepção de informações inesperadas
        const uniqueId = `unexpected-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setActivityFeed(prev => [{
            id: uniqueId,
            type: 'EMERGENCY',
            message: '⚠️ ALERTA DE SISTEMA: PACOTES DE DADOS NÃO IDENTIFICADOS DETECTADOS NA MALHA',
            timestamp: new Date().toISOString(),
            severity: 'error'
        }, ...prev]);

        setTimeout(() => {
            setUnexpectedData({
                title: 'RELATÓRIO DE INTELIGÊNCIA // CLASSIFICADO',
                code: 'DELTA-9-GHOST',
                coordinates: [-8.8450, 13.2512],
                message: 'Detectamos uma anomalia na frequência de rádio local. Sinais criptografados sugerem a presença de unidades não registradas operando no setor central. Proceda com cautela.',
                timestamp: new Date().toISOString()
            });
            setShowUnexpected(true);
        }, 1500);
    };

    return (
        <div ref={constraintsRef} className="fixed inset-0 w-screen h-screen overflow-hidden bg-background bg-tactical-grid">

            {/* BACKGROUND TACTICAL MAP */}
            <div className="absolute inset-0 z-0">
                <MapComponent
                    emergencies={emergencies}
                    drivers={drivers}
                    units={units}
                    incidents={incidents}
                    traffic={traffic}
                    center={mapCenter}
                    zoom={mapZoom}
                    onStyleChange={handleStyleChange}
                />
                <div className="absolute inset-0 pointer-events-none z-10 opacity-30">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-primary/20" />
                    <div className="absolute left-1/2 top-0 w-px h-full bg-primary/20" />
                </div>
            </div>

            {/* UNEXPECTED INFORMATION OVERLAY */}
            {showUnexpected && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-10">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="max-w-2xl w-full tactical-panel bg-background border-2 border-magenta-500 shadow-[0_0_50px_rgba(255,0,255,0.3)] overflow-hidden"
                    >
                        <div className="p-1 bg-magenta-500 flex justify-between items-center px-4">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Acesso_Nao_Autorizado // Bypass_Protocol</span>
                            <button onClick={() => setShowUnexpected(false)} className="text-white hover:bg-white/20 px-2 transition-colors">✕</button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="flex items-start gap-6">
                                <div className="p-4 border border-magenta-500/50 bg-magenta-500/10">
                                    <Signal className="w-12 h-12 text-magenta-500 animate-pulse" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-3xl font-black text-magenta-500 uppercase tracking-tighter leading-none mb-1">
                                        {unexpectedData?.title}
                                    </h3>
                                    <div className="flex gap-4 opacity-50 text-[10px] font-bold uppercase tracking-widest text-foreground">
                                        <span>Cód: {unexpectedData?.code}</span>
                                        <span>Status: Descriptografado</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-muted/30 p-6 border-l-4 border-magenta-500 font-tactical">
                                <p className="text-lg font-bold text-foreground leading-relaxed italic">
                                    "{unexpectedData?.message}"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border border-border bg-muted/20">
                                    <span className="block text-[8px] font-black text-muted-foreground uppercase mb-2">Coordenadas_Anomalia</span>
                                    <span className="text-xl font-black text-foreground">{unexpectedData?.coordinates[0].toFixed(4)} , {unexpectedData?.coordinates[1].toFixed(4)}</span>
                                </div>
                                <div className="p-4 border border-border bg-muted/20">
                                    <span className="block text-[8px] font-black text-muted-foreground uppercase mb-2">Marcação_Temporal</span>
                                    <span className="text-xl font-black text-foreground">{new Date(unexpectedData?.timestamp).toLocaleTimeString()}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase text-magenta-500/50">GEOSPACE_INTELLIGENCE_DIVISION // EYES_ONLY</span>
                                <button
                                    onClick={() => {
                                        setMapCenter(unexpectedData?.coordinates);
                                        setMapZoom(18);
                                        setShowUnexpected(false);
                                    }}
                                    className="px-6 py-2 bg-magenta-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-magenta-600 transition-all shadow-[0_0_15px_rgba(255,0,255,0.4)]"
                                >
                                    INVESTIGAR LOCAL
                                </button>
                            </div>
                        </div>

                        {/* Glitch Overlay Effect */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://media.giphy.com/media/oEI9uWUicS3Ze/giphy.gif')] mix-blend-screen" />
                    </motion.div>
                </div>
            )}


            {/* TACTICAL RADAR INDICATOR */}
            <div className="absolute top-24 left-10 z-30 w-[220px] bg-background/80 backdrop-blur-md border border-border p-4 tactical-panel shadow-2xl skew-x-[-1deg]">
                <div className="flex items-center justify-between mb-4 border-b border-border/20 pb-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-primary font-mono flex items-center gap-2">
                        <Radio className="w-3 h-3 animate-pulse" /> SCN_RADAR_AUTO
                    </span>
                    <span className="text-[7px] font-mono opacity-40">ANGOLA_MALHA</span>
                </div>
                <div className="flex items-center justify-center p-2">
                    <TacticalRadar />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="bg-muted/30 p-2 border border-border/20">
                        <span className="text-[6px] font-mono opacity-40 block uppercase">Unidades</span>
                        <span className="text-[10px] font-black">{units.length}</span>
                    </div>
                    <div className="bg-muted/30 p-2 border border-border/20">
                        <span className="text-[6px] font-mono opacity-40 block uppercase">Vetores</span>
                        <span className="text-[10px] font-black text-blue-500">{drivers.length}</span>
                    </div>
                </div>
            </div>

            {/* QUICK INCIDENT REGISTER */}
            <div className="absolute bottom-28 right-10 z-30">
                <button 
                    onClick={() => {
                        toast({ title: "Modo de Reporte", description: "Clique no mapa para marcar um incidente ou use o painel lateral." });
                    }}
                    className="p-4 bg-red-600 text-white rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:scale-110 active:scale-95 transition-all group"
                >
                    <ActivityIcon className="w-6 h-6 group-hover:animate-spin" />
                </button>
            </div>

            {/* DRAGGABLE TACTICAL CONSOLE */}
            <motion.div
                drag
                dragConstraints={constraintsRef}
                dragElastic={0}
                dragMomentum={false}
                initial={false}
                animate={{ x: isSidebarVisible ? 0 : 400, opacity: isSidebarVisible ? 1 : 0 }}
                className={cn(
                    "absolute top-24 right-10 z-30 w-[380px] h-[70vh] cursor-grab active:cursor-grabbing",
                    !isSidebarVisible && "pointer-events-none"
                )}
            >
                <div className="h-full bg-background/90 backdrop-blur-xl border border-border flex flex-col overflow-hidden tactical-panel shadow-2xl">

                    {/* ... existing header ... */}
                    <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
                        {/* ... header content ... */}
                        <div className="flex flex-col flex-1">
                            {/* ... */}
                            <span className="text-lg font-black uppercase tracking-widest leading-none mt-1 text-foreground">OKUSANGA_Operações</span>
                            {/* ... */}
                        </div>
                        {/* ... close button ... */}
                        <div className="flex items-center gap-2 ml-4">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsSidebarVisible(false); }}
                                className="tactical-btn h-10 px-4 text-[9px] text-foreground border-border hover:border-foreground"
                            >
                                FECHAR
                            </button>
                            <Move className="w-3 h-3 opacity-20 text-foreground" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-10 opacity-10">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] font-tactical text-foreground">Sinc_Malha</span>
                            </div>
                        ) : activityFeed
                            .filter(item => item.message.toLowerCase().includes(opsSearch.toLowerCase()))
                            .map((item, idx) => (
                                <div
                                    key={item.id}
                                    className="cursor-pointer hover:opacity-80 transition-all border-l-2 border-border pl-4 space-y-1.5 group"
                                    onClick={() => {
                                        if (item.type === 'EMERGENCY') {
                                            const emergency = emergencies.find(e => e.id === item.id || item.message.includes(e.id));
                                            if (emergency) {
                                                setMapCenter([emergency.latitude, emergency.longitude]);
                                                setMapZoom(16);
                                            }
                                        }
                                    }}
                                >
                                    <div className="flex justify-between items-center opacity-40">
                                        <span className="text-[9px] font-tactical font-black uppercase tracking-[0.1em] text-primary">
                                            TX_{idx.toString().padStart(3, '0')}
                                        </span>
                                        <span className="text-[9px] font-black opacity-60 text-foreground">
                                            [{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}]
                                        </span>
                                    </div>
                                    <p className="text-[12px] font-black uppercase tracking-normal leading-tight text-foreground group-hover:text-primary transition-colors">
                                        {item.message}
                                    </p>


                                    <span className="inline-block text-[9px] font-black tracking-[0.1em] font-tactical px-2 py-0.5 border border-border text-foreground bg-muted mt-1">
                                        {item.severity === 'info' ? 'INFORMAÇÃO' :
                                            item.severity === 'warning' ? 'AVISO' :
                                                item.severity === 'error' ? 'ERRO' : 'SUCESSO'}
                                    </span>
                                </div>
                            ))}
                    </div>

                    <div className="p-6 bg-muted/20 border-t border-border flex flex-col gap-4 max-h-[40%]">
                        {/* ... Drivers Header ... */}
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.1em] font-tactical flex items-center gap-2 text-foreground">
                                <Crosshair className="w-3.5 h-3.5" />
                                Pessoal_Rastreado ({drivers.length})
                            </span>
                            {/* ... Search ... */}
                            <div className="relative w-40 focus-within:w-56 transition-all">
                                <input
                                    type="text"
                                    placeholder="BUSCAR_ID..."
                                    value={personnelSearch}
                                    onChange={(e) => setPersonnelSearch(e.target.value)}
                                    className="w-full bg-background/50 border border-border/50 px-2 py-1.5 text-[10px] font-black uppercase tracking-wider focus:outline-none focus:border-primary transition-colors placeholder:opacity-40 text-foreground"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 scrollbar-hide">
                            {drivers
                                .filter(d => d.name.toLowerCase().includes(personnelSearch.toLowerCase()) || d.id.toLowerCase().includes(personnelSearch.toLowerCase()))
                                .map(driver => (
                                    <div
                                        key={driver.id}
                                        onClick={() => {
                                            setMapCenter([driver.latitude, driver.longitude]);
                                            setMapZoom(17);
                                        }}
                                        className="bg-background border border-border/40 p-3 flex flex-col gap-0.5 hover:border-primary hover:bg-muted/10 transition-all cursor-pointer relative group"
                                    >
                                        <span className="text-[11px] font-black uppercase truncate tracking-tight leading-none text-foreground group-hover:text-primary transition-colors">{driver.name}</span>
                                        <span className="text-[9px] font-black opacity-40 uppercase font-tactical mt-0.5 text-foreground">UNIT_{driver.id.substring(0, 4)}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ... HUD + System Banner ... */}
            <div className="absolute bottom-10 right-10 z-40 flex items-center gap-6">
                <div className="flex flex-col items-end opacity-80">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary leading-none">Relógio_Ativo</span>
                    <span className="font-tactical text-2xl font-black text-foreground mt-1">{mounted ? currentTime.toLocaleTimeString([], { hour12: false }) : '--:--:--'}</span>
                </div>
                {!isSidebarVisible && (
                    <button
                        onClick={() => setIsSidebarVisible(true)}
                        className="tactical-btn-primary px-8 h-12 text-[10px]"
                    >
                        RESTAURAR CONSOLE
                    </button>
                )}
            </div>

            <div className="absolute bottom-10 left-10 z-40 pointer-events-none">
                {/* ... System Banner Content ... */}
                <div className="tactical-panel bg-background/90 backdrop-blur-xl p-6 flex flex-col gap-3 border-l-8 border-l-foreground shadow-xl">
                    <div className="flex flex-col -gap-1 leading-none">
                        <span className="text-[10px] font-black font-tactical opacity-40 uppercase tracking-[0.4em]">Integridade_Sistema</span>
                        <h2 className="text-2xl font-black uppercase tracking-tighter mt-1 leading-none">OKUSANGA_v2.0</h2>
                    </div>
                    <div className="flex items-center gap-6 border-t border-border pt-4 mt-1">
                        <div className="flex items-center gap-2">
                            <div className="status-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.1em] font-tactical text-primary">Estado::Nominal</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground opacity-80 border-l border-border pl-6">
                            <ShieldIcon className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.1em] font-tactical">COFRE_SEGURO</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );

}
