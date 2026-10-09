'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Move, X, MapPin } from 'lucide-react';

interface Emergency {
    id: string;
    type: 'SOS' | 'ACCIDENT' | 'MEDICAL' | 'FIRE' | 'OTHER';
    status: 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED';
    latitude: number;
    longitude: number;
    address?: string;
    user: {
        firstName: string;
        lastName: string;
    };
    createdAt: string;
}

interface EmergencyMapProps {
    emergencies: Emergency[];
}

export const EmergencyMap: React.FC<EmergencyMapProps> = ({ emergencies }) => {
    const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);

    return (
        <div className="tactical-panel bg-background flex flex-col h-full border border-border overflow-hidden">
            {/* Tactical Header */}
            <div className="px-6 py-4 border-b border-border bg-muted/20 flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black font-tactical uppercase tracking-[0.4em] opacity-40 leading-none">Global_Mesh</span>
                    <h3 className="font-black text-sm uppercase tracking-widest mt-1">Spatial_Analysis</h3>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 border border-border bg-background">
                        <div className="status-pulse">
                            <div className="ping" />
                            <div className="dot" />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest">Active_SOS: {emergencies.filter(e => e.status === 'PENDING').length}</span>
                    </div>
                </div>
            </div>

            {/* Map Simulation Area */}
            <div className="relative flex-grow min-h-[500px] bg-background bg-tactical-grid overflow-hidden group">
                {/* HUD Overlay Lines */}
                <div className="absolute inset-0 pointer-events-none opacity-5">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-foreground" />
                    <div className="absolute left-1/2 top-0 w-px h-full bg-foreground" />
                </div>

                {/* Simulated Markers */}
                {emergencies.slice(0, 8).map((emergency, index) => (
                    <div
                        key={emergency.id}
                        className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:z-20 group/marker"
                        style={{
                            left: `${20 + index * 12 + (index % 2) * 5}%`,
                            top: `${30 + index * 8 + (index % 3) * 5}%`,
                        }}
                        onClick={() => setSelectedEmergency(emergency)}
                    >
                        <div className="relative flex items-center justify-center w-8 h-8">
                            <span className="absolute inline-flex h-full w-full bg-foreground opacity-10 animate-ping group-hover/marker:opacity-30"></span>
                            <div className={cn(
                                "relative w-2 h-2 border border-background shadow-none transition-all duration-200 group-hover/marker:scale-150",
                                emergency.status === 'PENDING' ? "bg-foreground" : "bg-muted-foreground opacity-40"
                            )} />
                        </div>
                    </div>
                ))}

                {/* Selected Detail Panel */}
                {selectedEmergency && (
                    <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:top-6 lg:bottom-auto lg:w-80 bg-background/95 backdrop-blur-xl border border-border p-6 shadow-2xl z-30 tactical-panel animate-in slide-in-from-right-4 duration-300">
                        <div className="flex justify-between items-start mb-6 border-b border-border/20 pb-4">
                            <div className="flex flex-col">
                                <span className="text-[7px] font-black font-tactical uppercase tracking-[0.4em] opacity-40">Detail_RX</span>
                                <h4 className="text-lg font-black uppercase tracking-tighter mt-1">
                                    {selectedEmergency.user.firstName} {selectedEmergency.user.lastName}
                                </h4>
                            </div>
                            <button
                                onClick={() => setSelectedEmergency(null)}
                                className="tactical-btn h-8 w-8 p-0"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 bg-muted/20 border border-border/40">
                                    <span className="text-[6px] font-black uppercase tracking-widest opacity-30 block mb-1">Type</span>
                                    <span className="text-[9px] font-black uppercase">{selectedEmergency.type}</span>
                                </div>
                                <div className="p-3 bg-muted/20 border border-border/40">
                                    <span className="text-[6px] font-black uppercase tracking-widest opacity-30 block mb-1">Status</span>
                                    <span className="text-[9px] font-black uppercase">{selectedEmergency.status}</span>
                                </div>
                            </div>

                            <div className="p-4 bg-muted/10 border-l-4 border-foreground">
                                <span className="text-[7px] font-black uppercase tracking-widest opacity-30 block mb-1">Position_Data</span>
                                <p className="text-[10px] font-black uppercase leading-tight">
                                    {selectedEmergency.address || "Coord_SFC_Vector"}
                                </p>
                                <div className="flex gap-4 mt-2 font-tactical text-[7px] font-bold opacity-30">
                                    <span>LAT:{selectedEmergency.latitude.toFixed(4)}</span>
                                    <span>LON:{selectedEmergency.longitude.toFixed(4)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <button className="tactical-btn-primary h-10 text-[8px]">PROCEED_TX</button>
                                <button className="tactical-btn h-10 text-[8px]">RESOLVE_OK</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tactical Legend */}
            <div className="px-6 py-3 border-t border-border bg-muted/10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 opacity-40 group hover:opacity-100 transition-opacity">
                        <div className="w-1.5 h-1.5 bg-foreground" />
                        <span className="text-[7px] font-black uppercase tracking-[0.2em] font-tactical">SOS_Active</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-20">
                        <div className="w-1.5 h-1.5 border border-foreground" />
                        <span className="text-[7px] font-black uppercase tracking-[0.2em] font-tactical">Node_Idle</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 opacity-10">
                    <Move className="w-3 h-3" />
                    <span className="text-[7px] font-black uppercase tracking-[0.5em] font-tactical">Secure_Encryption_Active</span>
                </div>
            </div>
        </div>
    );
};
