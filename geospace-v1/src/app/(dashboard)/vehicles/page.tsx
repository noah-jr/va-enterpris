'use client';

import React, { useState } from 'react';
import { useVehicles, useVerifyVehicle } from '@/hooks/use-vehicles';
import { Vehicle } from '@/lib/services/vehicle.service';
import { cn } from '@/lib/utils';
import { Car, Search, Filter, MoreVertical, BadgeCheck, Clock, ShieldAlert } from 'lucide-react';

export default function VehiclesPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const { data, isLoading } = useVehicles({
        page,
        limit: 10,
        search,
        status: statusFilter
    });

    const verifyMutation = useVerifyVehicle();

    const vehicles = data?.data || [];
    const pagination = data?.pagination || { total: 0, totalPages: 1 };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'ACTIVE':
            case 'VERIFIED':
                return { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: <BadgeCheck className="w-3 h-3" />, label: 'VERIFICADO' };
            case 'PENDING':
                return { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: <Clock className="w-3 h-3" />, label: 'PENDENTE' };
            case 'BANNED':
                return { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: <ShieldAlert className="w-3 h-3" />, label: 'BANIDO' };
            default:
                return { color: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20', icon: <Car className="w-3 h-3" />, label: status };
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full pb-20 p-8">
            {/* Tactical Header */}
            <div className="border-b border-border pb-8 flex flex-col md:flex-row justify-between items-end gap-8 relative">
                <div className="absolute top-0 right-0 opacity-[0.01] pointer-events-none font-black text-[80px] leading-none -translate-y-1/4 select-none uppercase">Veículos</div>

                <div className="space-y-3 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-1 bg-primary" />
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Unidades Veiculares</h1>
                    </div>
                    <div className="flex gap-6 font-tactical">
                        <div className="flex items-center gap-2">
                            <span className="text-foreground/40 text-[8px] font-black uppercase tracking-[0.3em]">Registro_Nexus</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground border-l border-border pl-6">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30">Total_Unidades: {pagination.total}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="PESQUISAR_PLACA_OU_MODELO..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-muted/30 border border-border h-10 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Tactical Data Grid */}
            <div className="border border-border w-full overflow-hidden bg-card/30 backdrop-blur-sm">
                <div className="grid grid-cols-12 bg-muted/40 h-10 border-b border-border text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em] font-tactical">
                    <div className="col-span-1 flex items-center px-6 border-r border-border">RID</div>
                    <div className="col-span-3 flex items-center px-6 border-r border-border">MODELO_ESPECIFICAÇÃO</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">IDENTIFICAÇÃO</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">VINCULO</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">STATUS</div>
                    <div className="col-span-2 flex items-center px-6 justify-end">ACÇÕES</div>
                </div>

                <div className="divide-y divide-border/20">
                    {isLoading ? (
                        <div className="p-20 text-center opacity-50">
                            <div className="text-[8px] font-black uppercase tracking-[0.5em] font-tactical animate-pulse">Indexando Unidades de Transporte...</div>
                        </div>
                    ) : vehicles.length === 0 ? (
                        <div className="p-20 text-center opacity-20">
                            <Car className="w-12 h-12 mx-auto mb-4" />
                            <span className="text-[8px] font-black uppercase tracking-[0.5em] font-tactical">Nenhuma Unidade Localizada</span>
                        </div>
                    ) : (
                        vehicles.map((vehicle: Vehicle) => {
                            const status = getStatusConfig(vehicle.status);
                            return (
                                <div key={vehicle.id} className="grid grid-cols-12 h-20 hover:bg-muted/30 group transition-all items-center">
                                    <div className="col-span-1 px-6 h-full flex items-center border-r border-border/10">
                                        <span className="text-[9px] font-black opacity-30 group-hover:opacity-100 font-tactical uppercase">
                                            #{vehicle.id.substring(0, 4)}
                                        </span>
                                    </div>
                                    <div className="col-span-3 px-6 h-full flex flex-col justify-center border-r border-border/10">
                                        <span className="text-[14px] font-black uppercase tracking-tight">
                                            {vehicle.make} {vehicle.model}
                                        </span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className="w-2 h-2 rounded-full border border-border" style={{ backgroundColor: vehicle.color.toLowerCase() }} />
                                            <span className="text-[8px] font-bold opacity-30 uppercase font-tactical">
                                                {vehicle.color} • {vehicle.year} • {vehicle.type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-span-2 px-6 h-full flex items-center border-r border-border/10">
                                        <div className="bg-foreground text-background px-3 py-1 font-mono text-[11px] font-black tracking-widest rounded-sm">
                                            {vehicle.plate}
                                        </div>
                                    </div>
                                    <div className="col-span-2 px-6 h-full flex flex-col justify-center border-r border-border/10">
                                        <span className="text-[10px] font-black uppercase truncate">{vehicle.company?.name || 'PRIVATE_OWNER'}</span>
                                        <span className="text-[7px] font-bold opacity-30 uppercase font-tactical">{vehicle.fleet?.name || 'FROTA_N/A'}</span>
                                    </div>
                                    <div className="col-span-2 px-6 h-full flex items-center border-r border-border/10">
                                        <div className={cn(
                                            "h-7 px-3 border flex items-center gap-2 text-[8px] font-black uppercase tracking-widest",
                                            status.color
                                        )}>
                                            {status.icon}
                                            {status.label}
                                        </div>
                                    </div>
                                    <div className="col-span-2 px-6 h-full flex items-center justify-end gap-2">
                                        {vehicle.status === 'PENDING' && (
                                            <button
                                                onClick={() => verifyMutation.mutate(vehicle.id)}
                                                className="tactical-btn h-8 px-4 text-[8px] border-primary/20 text-primary hover:bg-primary hover:text-white transition-all"
                                            >
                                                VALIDAR_DOCS
                                            </button>
                                        )}
                                        <button className="tactical-btn h-8 px-3 border-border/40 hover:bg-foreground hover:text-background transition-all">
                                            <MoreVertical className="w-4 h-4" />
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
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Logistics_Nexus_Feed</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-10 px-6 border border-border text-[8px] font-black hover:bg-foreground hover:text-background disabled:opacity-20 transition-all font-tactical">
                        [PREV]
                    </button>
                    <div className="w-20 h-10 border border-border flex items-center justify-center text-[10px] font-black font-tactical">{page}/{pagination.totalPages}</div>
                    <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="h-10 px-6 border border-border text-[8px] font-black hover:bg-foreground hover:text-background disabled:opacity-20 transition-all font-tactical">
                        [NEXT]
                    </button>
                </div>
            </div>
        </div>
    );
}
