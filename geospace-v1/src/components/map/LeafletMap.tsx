'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Emergency } from '@/lib/api/emergencies';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface MapProps {
    emergencies?: Emergency[];
    center?: [number, number];
    zoom?: number;
}

const createPulseIcon = (type: string) => {
    // Monochromatic - strictly black in light mode, white in dark mode (handled by bg-foreground)
    return L.divIcon({
        className: 'bg-transparent border-none',
        html: `
            <div class="relative flex items-center justify-center w-8 h-8 -ml-2 -mt-2">
                <span class="absolute inline-flex h-full w-full bg-foreground opacity-20 animate-ping"></span>
                <span class="relative inline-flex h-3 w-3 bg-foreground border border-background shadow-none"></span>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -10]
    });
};

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

const LeafletMap: React.FC<MapProps> = ({
    emergencies = [],
    center = [-8.83833, 13.23444],
    zoom = 13
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="h-full w-full relative z-0 group overflow-hidden border border-border">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                zoomControl={true}
                style={{ height: '100%', width: '100%', background: isDark ? '#000000' : '#ffffff' }}
                attributionControl={false}
            >
                <ChangeView center={center} zoom={zoom} />

                <TileLayer
                    url={isDark
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    }
                />

                {emergencies.map((emergency) => (
                    <Marker
                        key={emergency.id}
                        position={[emergency.latitude, emergency.longitude]}
                        icon={createPulseIcon(emergency.type)}
                    >
                        <Popup className="custom-popup" closeButton={false}>
                            <div className="p-4 min-w-[240px] font-sans bg-background text-foreground border border-border shadow-none rounded-none">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between border-b border-border pb-2">
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-foreground bg-foreground text-background">
                                            {emergency.type}
                                        </span>
                                        <span className="text-[8px] font-black opacity-30 uppercase tracking-widest font-tactical">
                                            {new Date(emergency.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="font-black text-[12px] uppercase tracking-tighter leading-tight">
                                            {emergency.address || 'Coord_Pos_Malha'}
                                        </h3>
                                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest font-tactical opacity-40">
                                            Relator: {emergency.user?.name || 'CENTRAL'}
                                        </p>
                                    </div>

                                    <div className="pt-2 border-t border-border mt-1">
                                        <span className="block w-full py-1.5 text-[8px] font-black uppercase tracking-[0.3em] text-center border border-border/40 font-tactical">
                                            ESTADO::{emergency.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Corner Markers */}
            <div className="absolute top-4 left-4 z-[400] opacity-10 pointer-events-none space-y-2">
                <div className="w-12 h-px bg-foreground" />
                <div className="w-px h-12 bg-foreground" />
            </div>

            <div className="absolute bottom-4 right-4 z-[400] opacity-10 pointer-events-none flex flex-col items-end space-y-2">
                <div className="w-px h-12 bg-foreground" />
                <div className="w-12 h-px bg-foreground" />
            </div>

            {/* Matrix Data Id */}
            <div className="absolute bottom-6 left-10 z-[400] text-[7px] font-black text-muted-foreground uppercase tracking-[0.5em] opacity-30 font-tactical">
                Malha_Sinc_Ativa // Unidade_01
            </div>
        </div>
    );
};

export default LeafletMap;
