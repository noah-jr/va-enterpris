'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Map, MapMarker, MarkerContent, MarkerPopup, MapControls } from "@/components/ui/map";
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import MapLibreGL from 'maplibre-gl';
import { Map as MapIcon, GraduationCap, HeartPulse, AlertTriangle, Users } from 'lucide-react';
import { useEmergencySocket } from '@/hooks/use-socket';
import { useToast } from '@/hooks/use-toast';
import { ProvinceBorders } from './ProvinceBorders';
import { RadarSweepLayer } from './RadarSweepLayer';

type MapStyleMode = 'tatico' | 'satelite' | 'hibrido' | 'ruas';

interface MapProps {
    center?: [number, number];
    zoom?: number;
    schools?: any[];
    hospitals?: any[];
    demographics?: any[];
    incidents?: any[];
    onCenterChange?: (center: [number, number]) => void;
    onStyleChange?: (style: MapStyleMode) => void;
}

const TacticalMap: React.FC<MapProps> = ({
    center = [-12.1642, 17.5691],
    zoom = 6,
    schools = [],
    hospitals = [],
    demographics = [],
    incidents = [],
    onStyleChange
}) => {
    const { theme } = useTheme();
    const mapRef = useRef<MapLibreGL.Map>(null);
    const [styleMode, setStyleMode] = React.useState<MapStyleMode>('tatico');
    const [liveSignals, setLiveSignals] = useState<any[]>([]);
    const { toast } = useToast();

    // Live Socket Connection for Tactical Map
    useEmergencySocket({
        onAlert: (data) => {
            if (data?.lat && data?.lng) {
                setLiveSignals((prev: any[]) => [...prev, { ...data, timestamp: Date.now() }]);
                toast({
                    title: "SINALIZAÇÃO DE MAPA",
                    description: `Unidade crĺtica detetada nas coordenadas: ${data.lat}, ${data.lng}`,
                    variant: "destructive"
                });
                
                // Remove signal after 15s to simulate tactical dissipating recon
                setTimeout(() => {
                    setLiveSignals((prev: any[]) => prev.filter((s: any) => s.timestamp !== data.timestamp));
                }, 15000);
            }
        }
    });

    const mapStyles = React.useMemo(() => {
        const isDark = theme === 'dark';
        const satelliteSource = {
            type: "raster" as const,
            tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
            tileSize: 256,
            attribution: "Esri"
        };
        const labelsSource = {
            type: "raster" as const,
            tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"],
            tileSize: 256
        };
        const streetsSource = {
            type: "raster" as const,
            tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"],
            tileSize: 256,
            attribution: "Esri"
        };

        return {
            tatico: isDark
                ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
            satelite: {
                version: 8,
                sources: { "satellite": satelliteSource },
                layers: [{ id: "satellite", type: "raster", source: "satellite" }]
            } as any,
            hibrido: {
                version: 8,
                sources: { "satellite": satelliteSource, "labels": labelsSource },
                layers: [{ id: "satellite", type: "raster", source: "satellite" }, { id: "labels", type: "raster", source: "labels" }]
            } as any,
            ruas: {
                version: 8,
                sources: { "streets": streetsSource },
                layers: [{ id: "streets", type: "raster", source: "streets" }]
            } as any
        } as Record<MapStyleMode, any>;
    }, [theme]);

    useEffect(() => {
        if (mapRef.current) {
            const currentCenter = mapRef.current.getCenter();
            const latDiff = Math.abs(currentCenter.lat - center[0]);
            const lngDiff = Math.abs(currentCenter.lng - center[1]);
            if (latDiff > 0.0001 || lngDiff > 0.0001) {
                mapRef.current.flyTo({ center: [center[1], center[0]], zoom, essential: true });
            }
        }
    }, [center, zoom]);

    // Handle Demographics Heatmap
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const addLayers = () => {
            if (map.getLayer('demographics-heatmap')) map.removeLayer('demographics-heatmap');
            if (map.getSource('demographics-source')) map.removeSource('demographics-source');

            if (demographics.length > 0) {
                map.addSource('demographics-source', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: demographics.map(d => ({
                            type: 'Feature',
                            properties: { density: d.density || (d.population / 1000) },
                            geometry: { type: 'Point', coordinates: [d.lng, d.lat] }
                        }))
                    }
                });

                map.addLayer({
                    id: 'demographics-heatmap',
                    type: 'heatmap',
                    source: 'demographics-source',
                    paint: {
                        'heatmap-weight': ['get', 'density'],
                        'heatmap-intensity': 1.5,
                        'heatmap-color': [
                            'interpolate', ['linear'], ['heatmap-density'],
                            0, 'rgba(0, 0, 255, 0)',
                            0.2, 'rgba(0, 0, 255, 0.2)',
                            0.4, 'rgba(0, 255, 255, 0.5)',
                            0.6, 'rgba(0, 255, 0, 0.7)',
                            0.8, 'rgba(255, 255, 0, 0.8)',
                            1, 'rgba(255, 0, 0, 0.9)'
                        ],
                        'heatmap-radius': 40,
                        'heatmap-opacity': 0.6
                    }
                });
            }
        };

        if (map.isStyleLoaded()) {
            addLayers();
        } else {
            map.on('style.load', addLayers);
        }
    }, [demographics, styleMode]);

    return (
        <div className="h-full w-full relative z-0 group overflow-hidden border border-border">
            <RadarSweepLayer active={styleMode === 'tatico'} />
            <Map
                ref={mapRef}
                center={[center[1], center[0]]}
                zoom={zoom}
                maxZoom={16}
                minZoom={2}
                viewport={{ pitch: 55, bearing: -15 }}
                className="w-full h-full"
                styles={{ dark: mapStyles[styleMode], light: mapStyles[styleMode] }}
            >
                <ProvinceBorders />
                {/* Style Controls */}
                <div className="absolute top-4 right-4 z-[100] flex flex-col gap-2">
                    <div className="bg-background/95 backdrop-blur-md border border-border p-1.5 flex flex-col gap-1 shadow-2xl skew-x-[-2deg]">
                        {(Object.keys(mapStyles) as MapStyleMode[]).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => { setStyleMode(mode); onStyleChange?.(mode); }}
                                className={cn(
                                    "px-4 py-2 flex items-center gap-3 transition-all hover:bg-primary/20 min-w-[140px] relative group",
                                    styleMode === mode ? "bg-primary text-primary-foreground" : "text-foreground opacity-70"
                                )}
                            >
                                <MapIcon className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-[0.1em]">{mode}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Schools Markers */}
                {schools.filter(u => u.lat && u.lng).map((school, idx) => (
                    <MapMarker key={`edu-${idx}`} latitude={school.lat} longitude={school.lng}>
                        <MarkerContent>
                            <div className="relative flex items-center justify-center cursor-pointer group">
                                <div className="absolute w-16 h-16 bg-blue-500/10 rounded-full border border-blue-500/30 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                                <div className="relative z-10 p-2 bg-blue-600 rounded-full border border-white shadow-2xl group-hover:scale-110 transition-transform">
                                    <GraduationCap className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </MarkerContent>
                        <MarkerPopup>
                            <div className="p-3 min-w-[150px]">
                                <span className="text-[10px] font-black uppercase block border-b border-border pb-1 mb-1">{school.name}</span>
                                <div className="flex flex-col gap-1 mt-2">
                                    <span className="text-[9px] opacity-80">Alunos: {school.studentsCount}</span>
                                    <span className="text-[9px] opacity-80">Aprovação: {school.passRate}%</span>
                                </div>
                            </div>
                        </MarkerPopup>
                    </MapMarker>
                ))}

                {/* Hospitals Markers */}
                {hospitals.filter(h => h.lat && h.lng).map((hospital, idx) => (
                    <MapMarker key={`health-${idx}`} latitude={hospital.lat} longitude={hospital.lng}>
                        <MarkerContent>
                            <div className="relative flex items-center justify-center cursor-pointer group">
                                <div className="absolute w-24 h-24 bg-emerald-500/10 rounded-full border border-emerald-500/40 animate-[spin_4s_linear_infinite] border-dashed pointer-events-none" />
                                <div className="relative z-10 p-2 bg-emerald-600 rounded-lg border border-white shadow-2xl group-hover:scale-110 transition-transform">
                                    <HeartPulse className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </MarkerContent>
                        <MarkerPopup>
                            <div className="p-3 min-w-[150px]">
                                <span className="text-[10px] font-black uppercase block border-b border-border pb-1 mb-1">{hospital.name}</span>
                                <div className="flex flex-col gap-1 mt-2">
                                    <span className="text-[9px] opacity-80">Pacientes: {hospital.currentPatients}</span>
                                    <span className="text-[9px] opacity-80">Capacidade: {hospital.bedCapacity}</span>
                                </div>
                            </div>
                        </MarkerPopup>
                    </MapMarker>
                ))}

                {/* Demographic Points (fallback if heatmap is off) */}
                {demographics.filter(d => d.lat && d.lng).map((d, idx) => (
                    <MapMarker key={`demo-${idx}`} latitude={d.lat} longitude={d.lng}>
                        <MarkerContent>
                            <div className="w-6 h-6 rounded-full bg-orange-500/50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                <Users className="w-3 h-3 text-white" />
                            </div>
                        </MarkerContent>
                        <MarkerPopup>
                            <div className="p-3 min-w-[150px]">
                                <span className="text-[10px] font-black uppercase block border-b border-border pb-1 mb-1">{d.regionName}</span>
                                <div className="flex flex-col gap-1 mt-2">
                                    <span className="text-[9px] opacity-80">População: {d.totalPopulation?.toLocaleString()}</span>
                                    <span className="text-[9px] opacity-80">Densidade: {d.density} pop/km²</span>
                                </div>
                            </div>
                        </MarkerPopup>
                    </MapMarker>
                ))}

                {/* Incidents (Sinistralidade) */}
                {incidents.filter(i => i.lat && i.lng).map((inc, idx) => (
                    <MapMarker key={`inc-${idx}`} latitude={inc.lat} longitude={inc.lng}>
                        <MarkerContent>
                            <div className="relative flex items-center justify-center">
                                {/* Overlay element: Tactical Radius (Impact Zone) */}
                                <div className="absolute w-40 h-40 bg-red-500/10 rounded-full border border-red-500/30 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none" />
                                {/* Core marker */}
                                <div className="relative z-10 w-6 h-6 rounded-full bg-red-600 border border-white flex items-center justify-center animate-pulse shadow-lg scale-110">
                                    <AlertTriangle className="w-3 h-3 text-white" />
                                </div>
                            </div>
                        </MarkerContent>
                        <MarkerPopup>
                            <div className="p-3 min-w-[200px]">
                                <span className="text-[10px] font-black uppercase block border-b border-border pb-1 mb-1">{inc.title}</span>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-[8px] font-mono opacity-60">P_{inc.priority}</span>
                                    <span className="text-[8px] font-mono opacity-60 uppercase">{inc.status}</span>
                                </div>
                            </div>
                        </MarkerPopup>
                    </MapMarker>
                ))}

                {/* Sinais em Tempo Real (Socket.IO) */}
                {liveSignals.map((sig: any, idx: number) => (
                    <MapMarker key={`live-sig-${sig.timestamp}-${idx}`} latitude={sig.lat} longitude={sig.lng}>
                        <MarkerContent>
                            <div className="relative flex items-center justify-center">
                                {/* Ping Intenso */}
                                <div className="absolute w-64 h-64 border-2 border-rose-500 bg-rose-500/10 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none" />
                                {/* Crosshair Marker */}
                                <div className="relative z-10 w-8 h-8 rounded-full border-2 border-rose-500 bg-rose-600/50 flex flex-col items-center justify-center animate-pulse shadow-[0_0_20px_rgba(225,29,72,0.8)] backdrop-blur-sm">
                                    <div className="w-1 h-1 bg-white rounded-full" />
                                </div>
                            </div>
                        </MarkerContent>
                        <MarkerPopup>
                            <div className="p-3 min-w-[200px]">
                                <span className="text-[12px] font-black uppercase text-rose-500 block border-b border-border pb-1 mb-1">INTERCEÇÃO SINAL</span>
                                <div className="flex flex-col gap-1 mt-2">
                                    <span className="text-[9px] font-mono opacity-80 uppercase">{sig.title || 'ALERTA DETETADO'}</span>
                                    <span className="text-[8px] font-mono opacity-60">ZULU: {new Date(sig.timestamp).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </MarkerPopup>
                    </MapMarker>
                ))}

                <MapControls position="bottom-right" className="mb-12 mr-2" showLocate showCompass />
            </Map>
        </div>
    );
};

export default TacticalMap;
