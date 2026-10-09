'use client';

import React, { useEffect, useRef } from 'react';
import { Map, MapMarker, MarkerContent, MarkerPopup, MapControls } from "@/components/ui/map";
import { type Emergency } from '@/lib/services/emergency.service';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import MapLibreGL from 'maplibre-gl';
import { Car, Map as MapIcon, Layers, Radio, Shield, Building2, Zap, AlertTriangle, Activity } from 'lucide-react';

type MapStyleMode = 'tatico' | 'satelite' | 'hibrido' | 'ruas' | 'terreno' | 'operacoes' | 'quantum';

interface MapProps {
    emergencies?: Emergency[];
    center?: [number, number];
    zoom?: number;
    units?: any[];
    routes?: any[];
    zones?: any[];
    incidents?: any[];
    drivers?: any[];
    traffic?: any[];
    onCenterChange?: (center: [number, number]) => void;
    onStyleChange?: (style: MapStyleMode) => void;
}

const TacticalMap: React.FC<MapProps> = ({
    emergencies = [],
    center = [-8.83833, 13.23444],
    zoom = 13,
    units = [],
    incidents = [],
    routes = [],
    zones = [],
    drivers = [],
    traffic = [],
    onStyleChange
}) => {
    const { theme } = useTheme();
    const mapRef = useRef<MapLibreGL.Map>(null);
    const [styleMode, setStyleMode] = React.useState<MapStyleMode>('tatico');
    const [showRadars, setShowRadars] = React.useState(true);

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
        const terrainSource = {
            type: "raster" as const,
            tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"],
            tileSize: 256,
            attribution: "Esri"
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
            terreno: {
                version: 8,
                sources: { "terrain": terrainSource },
                layers: [{ id: "terrain", type: "raster", source: "terrain" }]
            } as any,
            ruas: {
                version: 8,
                sources: { "streets": streetsSource },
                layers: [{ id: "streets", type: "raster", source: "streets" }]
            } as any,
            operacoes: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
            quantum: {
                version: 8,
                sources: { "quantum-base": isDark ? satelliteSource : streetsSource },
                layers: [{ id: "quantum-base", type: "raster", source: "quantum-base", paint: { "raster-opacity": 0.3, "raster-hue-rotate": 180 } }]
            } as any
        } as Record<MapStyleMode, any>;
    }, [theme]);

    // Update center/zoom
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

    // Handle Layers (Routes/Zones) via GeoJSON
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const addLayers = () => {
            // Cleanup existing
            ['routes-layer', 'zones-heatmap', 'zones-border'].forEach(layer => {
                if (map.getLayer(layer)) map.removeLayer(layer);
            });
            ['routes-source', 'zones-source'].forEach(source => {
                if (map.getSource(source)) map.removeSource(source);
            });

            // ADD ROUTES
            if (routes.length > 0) {
                map.addSource('routes-source', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: routes.map(r => ({
                            type: 'Feature',
                            properties: { status: r.status },
                            geometry: r.geometry // Assumes geometry is available
                        }))
                    }
                });

                map.addLayer({
                    id: 'routes-layer',
                    type: 'line',
                    source: 'routes-source',
                    paint: {
                        'line-width': 4,
                        'line-color': [
                            'match', ['get', 'status'],
                            'BOA', '#10b981',
                            'DEGRADADA', '#f59e0b',
                            'BLOQUEADA', '#ef4444',
                            '#3b82f6'
                        ]
                    }
                });
            }

            // ADD ZONES (Heatmap)
            if (zones.length > 0) {
                map.addSource('zones-source', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: zones.map(z => ({
                            type: 'Feature',
                            properties: { density: z.density },
                            geometry: { type: 'Point', coordinates: [z.lng, z.lat] }
                        }))
                    }
                });

                map.addLayer({
                    id: 'zones-heatmap',
                    type: 'heatmap',
                    source: 'zones-source',
                    paint: {
                        'heatmap-weight': ['get', 'density'],
                        'heatmap-intensity': 2,
                        'heatmap-color': [
                            'interpolate', ['linear'], ['heatmap-density'],
                            0, 'rgba(0, 255, 0, 0)',
                            0.2, 'rgba(0, 255, 0, 0.2)',
                            0.4, 'rgba(255, 255, 0, 0.5)',
                            0.6, 'rgba(255, 165, 0, 0.7)',
                            1, 'rgba(255, 0, 0, 0.8)'
                        ],
                        'heatmap-radius': 50,
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
    }, [routes, zones, styleMode]);

    const [userLocation, setUserLocation] = React.useState<[number, number] | null>(null);

    return (
        <div className="h-full w-full relative z-0 group overflow-hidden border border-border">
            <Map
                ref={mapRef}
                center={[center[1], center[0]]}
                zoom={zoom}
                maxZoom={22}
                minZoom={2}
                className="w-full h-full"
                styles={{ dark: mapStyles[styleMode], light: mapStyles[styleMode] }}
            >
                {/* User Location Marker */}
                {userLocation && (
                    <MapMarker latitude={userLocation[0]} longitude={userLocation[1]}>
                        <MarkerContent>
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-50" />
                                <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white relative z-10" />
                            </div>
                        </MarkerContent>
                        <MarkerPopup>
                            <span className="text-[10px] font-black uppercase p-2 block">Minha Localização</span>
                        </MarkerPopup>
                    </MapMarker>
                )}

                {/* Style Controls */}
                <div className="absolute top-32 right-4 z-[100] flex flex-col gap-2">
                    <div className="bg-background/95 backdrop-blur-md border border-border p-1.5 flex flex-col gap-1 shadow-2xl skew-x-[-2deg]">
                        {(Object.keys(mapStyles) as MapStyleMode[]).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => { setStyleMode(mode); onStyleChange?.(mode); }}
                                className={cn(
                                    "px-4 py-2 flex items-center gap-3 transition-all hover:bg-primary/20 min-w-[140px] relative group",
                                    styleMode === mode ? "bg-primary text-primary-foreground" : "text-foreground opacity-70",
                                    mode === 'quantum' && "border border-magenta-500/50 text-magenta-500"
                                )}
                            >
                                <MapIcon className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-[0.1em]">{mode}</span>
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowRadars(!showRadars)}
                        className={cn("bg-background/95 backdrop-blur-md border border-border p-3 flex items-center justify-between shadow-2xl skew-x-[-2deg]", showRadars ? "text-emerald-500 border-emerald-500/50" : "opacity-40")}
                    >
                        <Radio className={cn("w-4 h-4", showRadars && "animate-pulse")} />
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] ml-2 text-foreground">RADAR</span>
                    </button>
                </div>

                {/* Radar Vis */}
                {showRadars && (
                    <MapMarker longitude={13.2344} latitude={-8.8383}>
                        <MarkerContent>
                            <div className="w-[400px] h-[400px] -ml-[200px] -mt-[200px] relative pointer-events-none">
                                <div className="absolute inset-0 rounded-full border border-emerald-500/20 bg-emerald-500/5 animate-pulse" />
                                <div className="absolute inset-0 animate-[spin_4s_linear_infinite]">
                                    <div className="absolute top-0 left-1/2 w-px h-1/2 bg-emerald-500 origin-bottom blur-[1px]" />
                                </div>
                            </div>
                        </MarkerContent>
                    </MapMarker>
                )}

                {/* Units Markers */}
                {units.filter(u => u.lat && u.lng).map((unit) => (
                    <MapMarker key={unit.id} latitude={unit.lat} longitude={unit.lng}>
                        <MarkerContent>
                            <div className="p-2 bg-background border border-border shadow-2xl cursor-pointer hover:scale-110 transition-transform">
                                {unit.type === 'Posto Fronteira' ? <Shield className="w-4 h-4 text-emerald-500" /> : <Building2 className="w-4 h-4 text-blue-500" />}
                            </div>
                        </MarkerContent>
                        <MarkerPopup>
                            <div className="p-3 min-w-[150px]">
                                <span className="text-[10px] font-black uppercase block">{unit.name}</span>
                                <span className="text-[8px] opacity-60 font-mono">{unit.status}</span>
                            </div>
                        </MarkerPopup>
                    </MapMarker>
                ))}

                {/* Incidents */}
                {incidents.filter(i => i.lat && i.lng).map((inc) => (
                    <MapMarker key={inc.id} latitude={inc.lat} longitude={inc.lng}>
                        <MarkerContent>
                            <div className="w-6 h-6 rounded-full bg-red-600 border border-white flex items-center justify-center animate-pulse shadow-lg scale-110">
                                <AlertTriangle className="w-3 h-3 text-white" />
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

                {/* 6. Zonas de Densidade Populacional */}
                {zones.map((zone: any) => {
                    const color = zone.densityValue > 85 ? '#ef4444' : 
                                 zone.densityValue > 65 ? '#f59e0b' : 
                                 zone.densityValue > 40 ? '#fbbf24' : '#10b981';
                    return (
                        <MapMarker
                            key={`zone-${zone.id}`}
                            latitude={zone.lat}
                            longitude={zone.lng}
                        >
                            <MarkerContent>
                                <div 
                                    className="rounded-full border border-white/20 animate-pulse"
                                    style={{ 
                                        width: `${Math.max(20, zone.densityValue / 2)}px`, 
                                        height: `${Math.max(20, zone.densityValue / 2)}px`,
                                        backgroundColor: color,
                                        opacity: Math.max(0.1, zone.densityValue / 200)
                                    }}
                                />
                            </MarkerContent>
                            <MarkerPopup>
                                <div className="p-3 tactical-panel bg-background border border-border min-w-[140px]">
                                    <span className="text-[7px] font-mono opacity-50 block uppercase tracking-widest">{zone.id}</span>
                                    <span className="text-[11px] font-black uppercase block border-b border-border pb-1.5 mb-1.5">{zone.name}</span>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[8px] font-mono opacity-60">Densidade</span>
                                        <span className="text-[10px] font-black text-primary">{zone.densityValue}%</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[8px] font-mono opacity-60">População</span>
                                        <span className="text-[10px] font-black">{zone.populationCount?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </MarkerPopup>
                        </MapMarker>
                    );
                })}

                {/* Emergencies */}
                {emergencies.filter(em => em.latitude && em.longitude).map((em) => (
                    <MapMarker key={em.id} latitude={em.latitude} longitude={em.longitude}>
                        <MarkerContent>
                            <div className="w-8 h-8 rounded-full bg-red-600 border-2 border-white animate-bounce flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 text-white" />
                            </div>
                        </MarkerContent>
                    </MapMarker>
                ))}

                {/* Drivers / Units in Motion */}
                {drivers.filter(d => d.latitude && d.longitude).map((driver) => (
                    <MapMarker key={driver.id} latitude={driver.latitude} longitude={driver.longitude}>
                        <MarkerContent>
                            <div className="p-2 bg-blue-600 border border-white rounded shadow-lg">
                                <Car className="w-3.5 h-3.5 text-white" />
                            </div>
                        </MarkerContent>
                        <MarkerPopup>
                            <div className="p-2 min-w-[120px]">
                                <span className="text-[10px] font-black uppercase block">{driver.name || 'Agente'}</span>
                                <span className="text-[8px] font-mono opacity-60">V_ID: {driver.id.slice(0, 8)}</span>
                            </div>
                        </MarkerPopup>
                    </MapMarker>
                ))}

                {/* Traffic Constraints */}
                {Array.isArray(traffic) && traffic.filter(t => t.lat && t.lng).map((t) => (
                    <MapMarker key={t.id} latitude={t.lat} longitude={t.lng}>
                        <MarkerContent>
                            <div className={cn(
                                "p-1.5 border-2 rounded-full flex items-center justify-center animate-pulse",
                                t.level === 'ALTO' ? "bg-red-500/20 border-red-500" : "bg-amber-500/20 border-amber-500"
                            )}>
                                <Activity className="w-3 h-3 text-foreground" />
                            </div>
                        </MarkerContent>
                        <MarkerPopup>
                            <div className="p-2 min-w-[140px]">
                                <span className="text-[10px] font-black uppercase block">{t.road?.name || 'Vetor Viário'}</span>
                                <span className="text-[8px] font-mono opacity-60 block uppercase">Nível: {t.level}</span>
                                <span className="text-[7px] font-mono opacity-40 block mt-1 italic">"{t.description}"</span>
                            </div>
                        </MarkerPopup>
                    </MapMarker>
                ))}

                <MapControls 
                    position="bottom-right" 
                    className="mb-12 mr-2" 
                    showLocate 
                    onLocate={(coords) => {
                        setUserLocation([coords.latitude, coords.longitude]);
                        if (mapRef.current) {
                            mapRef.current.flyTo({
                                center: [coords.longitude, coords.latitude],
                                zoom: 16,
                                essential: true
                            });
                        }
                    }}
                />
            </Map>
        </div>
    );
};

export default TacticalMap;
