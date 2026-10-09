'use client';

import React from 'react';
import Link from 'next/link';
import { useActiveEmergencies } from '@/hooks/use-emergencies';
import { cn } from '@/lib/utils';
import { ShieldAlert, MapPin, Clock, ChevronRight, AlertTriangle } from 'lucide-react';

export default function EmergenciesPage() {
    const { data: emergenciesData, isLoading, refetch } = useActiveEmergencies();

    // Ensure emergencies is always an array
    const emergencies = Array.isArray(emergenciesData) ? emergenciesData : (emergenciesData as any)?.data || [];

    return (
        <div className="flex flex-col gap-8 w-full pb-20 p-8">
            {/* Tactical Header */}
            <div className="border-b border-border pb-8 flex flex-col md:flex-row justify-between items-end gap-8 relative">
                <div className="absolute top-0 right-0 opacity-[0.01] pointer-events-none font-black text-[80px] leading-none -translate-y-1/4 select-none">FILA_SOS</div>

                <div className="space-y-3 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-1 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Fila de Emergência</h1>
                    </div>
                    <div className="flex gap-6 font-tactical">
                        <div className="flex items-center gap-2">
                            <span className="text-foreground/40 text-[8px] font-black uppercase tracking-[0.3em]">Módulo_Resposta_Nacional</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground border-l border-border pl-6">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 text-red-500 animate-pulse">Monitoramento_Ativo: {emergencies?.length || 0}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => refetch()}
                    className="tactical-btn h-10 px-8 text-[9px] font-black uppercase tracking-widest bg-muted/30 border border-border hover:border-primary transition-all"
                >
                    ATUALIZAR_ESTAÇÃO
                </button>
            </div>

            {/* Tactical Grid */}
            <div className="border border-border w-full overflow-hidden bg-card/30 backdrop-blur-sm">
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-muted/40 h-10 border-b border-border text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em] font-tactical">
                    <div className="col-span-1 flex items-center px-6 border-r border-border">RID</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">PRIORIDADE</div>
                    <div className="col-span-4 flex items-center px-6 border-r border-border">LOCALIZAÇÃO_E_DADOS</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border justify-center">TEMPO_DECURSO</div>
                    <div className="col-span-1 flex items-center px-6 border-r border-border justify-center">TIPO</div>
                    <div className="col-span-2 flex items-center px-6 justify-end">CENTRO_DE_AÇÃO</div>
                </div>

                {/* Table Content */}
                <div className="divide-y divide-border/20">
                    {isLoading ? (
                        <div className="p-20 text-center flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-[8px] font-black uppercase tracking-[0.5em] font-tactical animate-pulse opacity-50">Sincronizando Malha SOS...</span>
                        </div>
                    ) : !emergencies || emergencies.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center gap-4 opacity-20">
                            <ShieldAlert className="w-12 h-12" />
                            <span className="text-[8px] font-black uppercase tracking-[0.5em] font-tactical">Nenhum Alerta Ativo na Rede</span>
                        </div>
                    ) : (
                        emergencies.map((e: any) => (
                            <Link
                                href={`/emergencies/${e.id}`}
                                key={e.id}
                                className="grid grid-cols-12 h-20 hover:bg-red-500/5 group transition-all items-center cursor-pointer border-l-2 border-l-transparent hover:border-l-red-500"
                            >
                                <div className="col-span-1 px-6 h-full flex items-center border-r border-border/10 text-[9px] font-black opacity-30 group-hover:opacity-100 font-tactical uppercase">
                                    #{e.id.substring(0, 4)}
                                </div>
                                <div className="col-span-2 px-6 h-full flex items-center border-r border-border/10 justify-center">
                                    <div className={cn(
                                        "h-7 px-4 border text-[8px] font-black uppercase tracking-widest flex items-center gap-2",
                                        e.priority === 'CRITICAL' ? "bg-red-500 text-white border-red-400 animate-pulse" :
                                            e.priority === 'HIGH' ? "border-orange-500/30 text-orange-500 bg-orange-500/5" :
                                                "border-blue-500/30 text-blue-500 bg-blue-500/5"
                                    )}>
                                        <AlertTriangle className="w-3 h-3" />
                                        {e.priority}
                                    </div>
                                </div>
                                <div className="col-span-4 px-6 h-full flex flex-col justify-center border-r border-border/10">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-[12px] font-black uppercase tracking-tight truncate group-hover:text-red-500 transition-colors">
                                            {e.address || 'LOCALIZAÇÃO_NÃO_MAPEADA'}
                                        </span>
                                    </div>
                                    <span className="text-[7px] font-bold opacity-30 uppercase font-tactical mt-1 ml-5">
                                        LAT: {e.latitude.toFixed(4)} / LNG: {e.longitude.toFixed(4)}
                                    </span>
                                </div>
                                <div className="col-span-2 px-6 h-full flex flex-col justify-center border-r border-border/10 text-center font-tactical">
                                    <div className="flex items-center justify-center gap-2 opacity-40 group-hover:opacity-100">
                                        <Clock className="w-3 h-3" />
                                        <span className="text-[10px] font-black">{new Date(e.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <span className="text-[7px] font-bold opacity-30 mt-1 uppercase">Atraso: 0.2ms</span>
                                </div>
                                <div className="col-span-1 px-6 h-full flex items-center justify-center border-r border-border/10">
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{e.type}</span>
                                </div>
                                <div className="col-span-2 px-6 h-full flex items-center justify-end gap-4">
                                    <span className="text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-all text-red-500 tracking-[0.2em]">ABRIR_DADOS</span>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
