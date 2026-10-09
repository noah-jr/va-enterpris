'use client';

import React, { useState } from 'react';
import { useDrivers, useApproveDriver } from '@/hooks/use-drivers';
import { Driver } from '@/lib/services/driver.service';
import { cn } from '@/lib/utils';
import { UserCheck, Search, ShieldCheck, ShieldAlert, Star, MapPin, MoreVertical } from 'lucide-react';

export default function DriversPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const { data, isLoading } = useDrivers({
        page,
        limit: 10,
        search,
        status: statusFilter
    });

    const approveMutation = useApproveDriver();

    const drivers = data?.data || [];
    const pagination = data?.pagination || { total: 0, totalPages: 1 };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'ONLINE':
                return { color: 'bg-green-500 text-white', label: 'ONLINE', pulse: true };
            case 'OFFLINE':
                return { color: 'bg-zinc-500 text-white', label: 'OFFLINE' };
            case 'ON_TRIP':
                return { color: 'bg-blue-500 text-white', label: 'EM_SERVIÇO', pulse: true };
            case 'PENDING_VERIFICATION':
                return { color: 'bg-yellow-500 text-black', label: 'PENDENTE' };
            case 'SUSPENDED':
                return { color: 'bg-red-500 text-white', label: 'SUSPENSO' };
            default:
                return { color: 'bg-muted text-muted-foreground', label: status };
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full pb-20 p-8">
            {/* Tactical Header */}
            <div className="border-b border-border pb-8 flex flex-col md:flex-row justify-between items-end gap-8 relative">
                <div className="absolute top-0 right-0 opacity-[0.01] pointer-events-none font-black text-[80px] leading-none -translate-y-1/4 select-none uppercase">Agentes</div>

                <div className="space-y-3 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-1 bg-primary" />
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Diretório de Agentes</h1>
                    </div>
                    <div className="flex gap-6 font-tactical">
                        <div className="flex items-center gap-2">
                            <span className="text-foreground/40 text-[8px] font-black uppercase tracking-[0.3em]">Unidades_Operacionais</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground border-l border-border pl-6">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30">Drivers_Ativos: {pagination.total}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="PESQUISAR_AGENTE..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-muted/30 border border-border h-10 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all w-64"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-muted/30 border border-border h-10 px-4 text-[9px] font-black uppercase tracking-widest focus:outline-none focus:border-primary/50"
                    >
                        <option value="">TODOS_STATUS</option>
                        <option value="ONLINE">ONLINE</option>
                        <option value="OFFLINE">OFFLINE</option>
                        <option value="PENDING_VERIFICATION">PENDENTES</option>
                        <option value="SUSPENDED">SUSPENSOS</option>
                    </select>
                </div>
            </div>

            {/* Tactical Driver Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="tactical-panel h-48 animate-pulse opacity-50" />
                    ))
                ) : drivers.length === 0 ? (
                    <div className="col-span-full p-20 text-center opacity-20">
                        <UserCheck className="w-12 h-12 mx-auto mb-4" />
                        <span className="text-[8px] font-black uppercase tracking-[0.5em] font-tactical">Nenhum Agente Localizado na Rede</span>
                    </div>
                ) : (
                    drivers.map((driver: Driver) => {
                        const status = getStatusConfig(driver.status);
                        return (
                            <div key={driver.id} className="tactical-panel p-6 group hover:border-primary/50 transition-all relative overflow-hidden">
                                {/* Header Info */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-muted border border-border flex items-center justify-center relative">
                                            {driver.user.avatar ? (
                                                <img src={driver.user.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserCheck className="w-6 h-6 opacity-20" />
                                            )}
                                            {status.pulse && (
                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-lg font-black uppercase tracking-tight leading-none group-hover:text-primary transition-colors">
                                                {driver.user.firstName} {driver.user.lastName}
                                            </span>
                                            <span className="text-[8px] font-bold opacity-30 uppercase font-tactical mt-1.5">
                                                ID: {driver.id.substring(0, 8).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-2 py-1 text-[7px] font-black tracking-widest border border-transparent",
                                        status.color,
                                        driver.status === 'PENDING_VERIFICATION' && "border-yellow-500/20"
                                    )}>
                                        {status.label}
                                    </div>
                                </div>

                                {/* Stats Bar */}
                                <div className="grid grid-cols-3 gap-4 border-y border-border/10 py-4 mb-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1 text-primary">
                                            <Star className="w-3 h-3 fill-current" />
                                            <span className="text-xs font-black">{driver.rating.toFixed(1)}</span>
                                        </div>
                                        <span className="text-[6px] font-black uppercase tracking-widest opacity-30">Avaliação</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-black">{driver.totalTrips}</span>
                                        <span className="text-[6px] font-black uppercase tracking-widest opacity-30">Missões</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[xs] font-black truncate">{driver.vehicle?.plate || 'SEM_VEH'}</span>
                                        <span className="text-[6px] font-black uppercase tracking-widest opacity-30">Viatura</span>
                                    </div>
                                </div>

                                {/* Footer & Actions */}
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase opacity-40">Unidade_Vínculo</span>
                                        <span className="text-[9px] font-bold uppercase truncate max-w-[120px]">
                                            {driver.company?.name || 'Nexus_Independente'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {driver.status === 'PENDING_VERIFICATION' && (
                                            <button
                                                onClick={() => approveMutation.mutate({ id: driver.id, approved: true })}
                                                className="tactical-btn h-8 px-4 text-[8px] bg-primary text-primary-foreground border-none hover:opacity-90"
                                            >
                                                VALIDAR
                                            </button>
                                        )}
                                        <button className="tactical-btn h-8 px-3 border-border/40 hover:bg-foreground hover:text-background transition-all">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Background ID Decor */}
                                <div className="absolute -bottom-4 -right-2 text-[48px] font-black opacity-[0.02] pointer-events-none select-none uppercase">
                                    {driver.status.split('_')[0]}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center bg-card/20 p-4 border border-border mt-8">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Personnel_Network_Nexus</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-10 px-6 border border-border text-[8px] font-black uppercase hover:bg-foreground hover:text-background disabled:opacity-20 transition-all font-tactical">
                        [RECUAR]
                    </button>
                    <div className="w-20 h-10 border border-border flex items-center justify-center text-[10px] font-black font-tactical">{page}/{pagination.totalPages}</div>
                    <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="h-10 px-6 border border-border text-[8px] font-black uppercase hover:bg-foreground hover:text-background disabled:opacity-20 transition-all font-tactical">
                        [AVANÇAR]
                    </button>
                </div>
            </div>
        </div>
    );
}
