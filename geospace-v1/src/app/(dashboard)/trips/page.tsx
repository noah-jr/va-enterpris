'use client';

import React, { useState } from 'react';
import { useTrips } from '@/hooks/use-trips';
import { Trip } from '@/lib/services/trip.service';
import { cn } from '@/lib/utils';
import { MapPin, Navigation, Clock, CreditCard, ChevronRight, Search } from 'lucide-react';

export default function TripsPage() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');

    const { data, isLoading } = useTrips({
        page,
        limit: 10,
        status: statusFilter
    });

    const trips = data?.data || [];
    const pagination = data?.pagination || { total: 0, totalPages: 1 };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return { color: 'text-green-500 bg-green-500/10 border-green-500/20', label: 'CONCLUÍDA' };
            case 'CANCELLED_BY_PASSENGER':
            case 'CANCELLED_BY_DRIVER':
            case 'CANCELLED_BY_SYSTEM':
                return { color: 'text-red-500 bg-red-500/10 border-red-500/20', label: 'CANCELADA' };
            case 'IN_PROGRESS':
                return { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', label: 'EM_CURSO', pulse: true };
            case 'REQUESTED':
                return { color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', label: 'AGUARDANDO', pulse: true };
            default:
                return { color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20', label: status };
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full pb-20 p-8">
            {/* Tactical Header */}
            <div className="border-b border-border pb-8 flex flex-col md:flex-row justify-between items-end gap-8 relative">
                <div className="absolute top-0 right-0 opacity-[0.01] pointer-events-none font-black text-[80px] leading-none -translate-y-1/4 select-none uppercase">Histórico</div>

                <div className="space-y-3 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-1 bg-primary" />
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Operações de Corrida</h1>
                    </div>
                    <div className="flex gap-6 font-tactical">
                        <div className="flex items-center gap-2">
                            <span className="text-foreground/40 text-[8px] font-black uppercase tracking-[0.3em]">Log_Movimentação</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground border-l border-border pl-6">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30">Missões_Totais: {pagination.total}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-muted/30 border border-border h-10 px-4 text-[9px] font-black uppercase tracking-widest focus:outline-none focus:border-primary/50"
                    >
                        <option value="">TODOS_STATUS</option>
                        <option value="COMPLETED">CONCLUÍDAS</option>
                        <option value="CANCELLED">CANCELADAS</option>
                        <option value="IN_PROGRESS">ATIVAS</option>
                    </select>
                </div>
            </div>

            {/* Tactical Data Grid */}
            <div className="border border-border w-full overflow-hidden bg-card/30 backdrop-blur-sm">
                <div className="grid grid-cols-12 bg-muted/40 h-10 border-b border-border text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em] font-tactical">
                    <div className="col-span-1 flex items-center px-6 border-r border-border">RID</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">AGENTES_ENVOLVIDOS</div>
                    <div className="col-span-4 flex items-center px-6 border-r border-border">PERCURSO_VETORIAL</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">MÉTRICAS</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">STATUS</div>
                    <div className="col-span-1 flex items-center px-6 justify-end">INFO</div>
                </div>

                <div className="divide-y divide-border/20">
                    {isLoading ? (
                        <div className="p-20 text-center opacity-50 font-tactical animate-pulse uppercase tracking-[0.4em] text-[8px]">
                            Capturando sinal de geolocalização...
                        </div>
                    ) : trips.length === 0 ? (
                        <div className="p-20 text-center opacity-20 font-tactical uppercase tracking-[0.4em] text-[8px]">
                            Sem missões registradas no período
                        </div>
                    ) : (
                        trips.map((trip: Trip) => {
                            const status = getStatusConfig(trip.status);
                            return (
                                <div key={trip.id} className="grid grid-cols-12 min-h-[90px] hover:bg-muted/30 group transition-all items-center">
                                    <div className="col-span-1 px-6 h-full flex items-center border-r border-border/10">
                                        <span className="text-[9px] font-black opacity-30 group-hover:opacity-100 font-tactical">
                                            #{trip.id.substring(0, 4)}
                                        </span>
                                    </div>
                                    <div className="col-span-2 px-6 h-full flex flex-col justify-center border-r border-border/10 gap-1.5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase truncate">{trip.passenger.firstName} {trip.passenger.lastName}</span>
                                            <span className="text-[6px] font-black uppercase tracking-widest opacity-30">Passageiro</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase truncate">{trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : 'NÃO_ATRIBUÍDO'}</span>
                                            <span className="text-[6px] font-black uppercase tracking-widest opacity-30">Agente</span>
                                        </div>
                                    </div>
                                    <div className="col-span-4 px-6 h-full flex flex-col justify-center border-r border-border/10 gap-2 py-4">
                                        <div className="flex items-center gap-3">
                                            <Navigation className="w-3 h-3 text-primary shrink-0 rotate-45" />
                                            <span className="text-[10px] font-black uppercase truncate opacity-80">{trip.pickupAddress}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                                            <span className="text-[10px] font-black uppercase truncate opacity-80">{trip.destinationAddress}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-2 px-6 h-full flex items-center border-r border-border/10">
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                            <span className="text-[10px] font-black">{trip.fare} KZ</span>
                                            <span className="text-[10px] font-black">{(trip.distance / 1000).toFixed(1)} KM</span>
                                            <span className="text-[6px] font-black uppercase tracking-widest opacity-30">Tarifa</span>
                                            <span className="text-[6px] font-black uppercase tracking-widest opacity-30">Distância</span>
                                        </div>
                                    </div>
                                    <div className="col-span-2 px-6 h-full flex items-center border-r border-border/10">
                                        <div className={cn(
                                            "h-7 px-3 border flex items-center justify-center text-[8px] font-black uppercase tracking-widest w-full",
                                            status.color
                                        )}>
                                            {status.pulse && <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse mr-2" />}
                                            {status.label}
                                        </div>
                                    </div>
                                    <div className="col-span-1 px-6 h-full flex items-center justify-end">
                                        <button className="tactical-btn w-8 h-8 p-0 flex items-center justify-center border-border/40 hover:bg-foreground hover:text-background transition-all">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center bg-card/20 p-4 border border-border">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Operational_Tactical_Log</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-10 px-6 border border-border text-[8px] font-black hover:bg-foreground hover:text-background disabled:opacity-20 transition-all font-tactical">
                        [RECUAR]
                    </button>
                    <div className="w-20 h-10 border border-border flex items-center justify-center text-[10px] font-black font-tactical">{page}/{pagination.totalPages}</div>
                    <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="h-10 px-6 border border-border text-[8px] font-black hover:bg-foreground hover:text-background disabled:opacity-20 transition-all font-tactical">
                        [AVANÇAR]
                    </button>
                </div>
            </div>
        </div>
    );
}
