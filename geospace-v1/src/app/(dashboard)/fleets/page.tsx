'use client';

import React, { useState } from 'react';
import { useFleets } from '@/hooks/use-fleets';
import { Fleet } from '@/lib/services/fleet.service';
import { cn } from '@/lib/utils';
import { Layers, Search, Plus, MoreVertical, CheckCircle2, XCircle } from 'lucide-react';

export default function FleetsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const { data, isLoading } = useFleets({
        page,
        limit: 10,
        search
    });

    const fleets = data?.data || [];
    const pagination = data?.pagination || { total: 0, totalPages: 1 };

    return (
        <div className="flex flex-col gap-8 w-full pb-20 p-8">
            {/* Tactical Header */}
            <div className="border-b border-border pb-8 flex flex-col md:flex-row justify-between items-end gap-8 relative">
                <div className="absolute top-0 right-0 opacity-[0.01] pointer-events-none font-black text-[80px] leading-none -translate-y-1/4 select-none uppercase">Frotas</div>

                <div className="space-y-3 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-1 bg-primary" />
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Gestão de Frotas</h1>
                    </div>
                    <div className="flex gap-6 font-tactical">
                        <div className="flex items-center gap-2">
                            <span className="text-foreground/40 text-[8px] font-black uppercase tracking-[0.3em]">Módulo_Logístico</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground border-l border-border pl-6">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30">Frotas_Ativas: {pagination.total}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="PESQUISAR_FROTA..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-muted/30 border border-border h-10 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all w-64"
                        />
                    </div>
                    <button className="tactical-btn-primary px-8 h-10 flex items-center gap-2 text-[9px]">
                        <Plus className="w-4 h-4" />
                        DEFINIR_NOVA_FROTA
                    </button>
                </div>
            </div>

            {/* Tactical Data Grid */}
            <div className="border border-border w-full overflow-hidden bg-card/30 backdrop-blur-sm">
                <div className="grid grid-cols-12 bg-muted/40 h-10 border-b border-border text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em] font-tactical">
                    <div className="col-span-1 flex items-center px-6 border-r border-border">ID_REF</div>
                    <div className="col-span-3 flex items-center px-6 border-r border-border">IDENTIFICAÇÃO_FROTA</div>
                    <div className="col-span-3 flex items-center px-6 border-r border-border">EMPRESA_MÃE</div>
                    <div className="col-span-1 flex items-center px-6 border-r border-border text-center">VEH</div>
                    <div className="col-span-1 flex items-center px-6 border-r border-border text-center">DRV</div>
                    <div className="col-span-1 flex items-center px-6 border-r border-border text-center">STATUS</div>
                    <div className="col-span-2 flex items-center px-6 justify-end">ACÇÕES</div>
                </div>

                <div className="divide-y divide-border/20">
                    {isLoading ? (
                        <div className="p-20 text-center opacity-50">
                            <div className="text-[8px] font-black uppercase tracking-[0.5em] font-tactical animate-pulse">Escanenado Matriz de Frotas...</div>
                        </div>
                    ) : fleets.length === 0 ? (
                        <div className="p-20 text-center opacity-20">
                            <Layers className="w-12 h-12 mx-auto mb-4" />
                            <span className="text-[8px] font-black uppercase tracking-[0.5em] font-tactical">Nenhuma Frota Registada</span>
                        </div>
                    ) : (
                        fleets.map((fleet: Fleet) => (
                            <div key={fleet.id} className="grid grid-cols-12 h-20 hover:bg-muted/30 group transition-all items-center">
                                <div className="col-span-1 px-6 h-full flex items-center border-r border-border/10">
                                    <span className="text-[9px] font-black opacity-30 group-hover:opacity-100 font-tactical uppercase">
                                        #{fleet.id.substring(0, 4)}
                                    </span>
                                </div>
                                <div className="col-span-3 px-6 h-full flex flex-col justify-center border-r border-border/10">
                                    <span className="text-[14px] font-black uppercase tracking-tight truncate">
                                        {fleet.name}
                                    </span>
                                    <span className="text-[8px] font-bold opacity-30 uppercase font-tactical mt-0.5 truncate">
                                        {fleet.description || 'SEM_DESCRIÇÃO_TÉCNICA'}
                                    </span>
                                </div>
                                <div className="col-span-3 px-6 h-full flex items-center border-r border-border/10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
                                        <span className="text-[10px] font-black uppercase">{fleet.company?.name || 'ENTIDADE_NÃO_VINCULADA'}</span>
                                    </div>
                                </div>
                                <div className="col-span-1 px-6 h-full flex items-center justify-center border-r border-border/10">
                                    <span className="text-[12px] font-black">{fleet._count?.vehicles || 0}</span>
                                </div>
                                <div className="col-span-1 px-6 h-full flex items-center justify-center border-r border-border/10">
                                    <span className="text-[12px] font-black">{fleet._count?.drivers || 0}</span>
                                </div>
                                <div className="col-span-1 px-6 h-full flex items-center justify-center border-r border-border/10">
                                    {fleet.status === 'ACTIVE' ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-red-500" />
                                    )}
                                </div>
                                <div className="col-span-2 px-6 h-full flex items-center justify-end gap-2">
                                    <button className="tactical-btn h-8 px-4 text-[8px] border-border/40 hover:bg-foreground hover:text-background transition-all">
                                        GERIR_FROTA
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center bg-card/20 p-4 border border-border">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Frota_Control_V1</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="h-10 px-6 border border-border text-[8px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background disabled:opacity-20 transition-all font-tactical"
                    >
                        [ANTERIOR]
                    </button>
                    <div className="w-20 h-10 border border-border flex items-center justify-center text-[10px] font-black font-tactical bg-muted/20">
                        {page}/{pagination.totalPages}
                    </div>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                        className="h-10 px-6 border border-border text-[8px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background disabled:opacity-20 transition-all font-tactical"
                    >
                        [PRÓXIMA]
                    </button>
                </div>
            </div>
        </div>
    );
}
