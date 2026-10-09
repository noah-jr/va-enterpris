'use client';

import React, { useState } from 'react';
import { usePromos } from '@/hooks/use-promos';
import { PromoCode } from '@/lib/services/promo.service';
import { cn } from '@/lib/utils';
import { Ticket, Search, Plus, Calendar, Users, Percent, Gift } from 'lucide-react';

export default function PromosPage() {
    const [page, setPage] = useState(1);
    const [activeOnly, setActiveOnly] = useState(false);

    const { data: promos, isLoading } = usePromos({
        page,
        limit: 10,
        activeOnly: activeOnly || undefined
    });

    return (
        <div className="flex flex-col gap-8 w-full pb-20 p-8">
            {/* Tactical Header */}
            <div className="border-b border-border pb-8 flex flex-col md:flex-row justify-between items-end gap-8 relative">
                <div className="absolute top-0 right-0 opacity-[0.01] pointer-events-none font-black text-[80px] leading-none -translate-y-1/4 select-none uppercase">Promos</div>

                <div className="space-y-3 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-1 bg-primary" />
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Promoções & Ofertas</h1>
                    </div>
                    <div className="flex gap-6 font-tactical">
                        <div className="flex items-center gap-2">
                            <span className="text-foreground/40 text-[8px] font-black uppercase tracking-[0.3em]">Módulo_Campanha</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground border-l border-border pl-6">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30">Códigos_Ativos: {promos?.length || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button className="tactical-btn-primary px-8 h-10 flex items-center gap-2 text-[9px]">
                        <Plus className="w-4 h-4" />
                        GERAR_NOVO_CÓDIGO
                    </button>
                </div>
            </div>

            {/* Tactical Promo Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="tactical-panel h-64 animate-pulse opacity-50" />
                    ))
                ) : promos?.length === 0 ? (
                    <div className="col-span-full p-20 text-center opacity-20 font-tactical text-[8px] uppercase tracking-[0.5em]">
                        Nenhuma campanha ativa na malha Nexus
                    </div>
                ) : (
                    promos?.map((promo: PromoCode) => (
                        <div key={promo.id} className="tactical-panel p-6 group hover:border-primary/50 transition-all relative overflow-hidden flex flex-col justify-between h-full bg-muted/5 min-h-[250px]">
                            {/* Promo Content */}
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-primary">
                                            {promo.type === 'PERCENTAGE' ? <Percent className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                                            <span className="text-[10px] font-black uppercase tracking-widest">{promo.type}</span>
                                        </div>
                                        <div className="text-4xl font-black tracking-tighter mt-2 group-hover:text-primary transition-colors">
                                            {promo.type === 'PERCENTAGE' ? `${promo.value}%` : `${promo.value} KZ`}
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-2 py-1 text-[8px] font-black tracking-widest border",
                                        promo.status === 'ACTIVE' ? "border-green-500/20 text-green-500" : "border-red-500/20 text-red-500"
                                    )}>
                                        {promo.status}
                                    </div>
                                </div>

                                <div className="bg-background border border-border p-3 flex flex-col gap-1 mb-6">
                                    <span className="text-[7px] font-black uppercase opacity-40">Código_Ativação</span>
                                    <span className="text-xl font-black tracking-[0.2em] font-mono">{promo.code}</span>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="space-y-3 pt-4 border-t border-border/10">
                                <div className="flex justify-between text-[10px]">
                                    <div className="flex items-center gap-2 opacity-50">
                                        <Users className="w-3 h-3" />
                                        <span className="font-bold uppercase font-tactical">Utilização</span>
                                    </div>
                                    <span className="font-black font-tactical">{promo.usedCount} / {promo.maxUses || '∞'}</span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                    <div className="flex items-center gap-2 opacity-50">
                                        <Calendar className="w-3 h-3" />
                                        <span className="font-bold uppercase font-tactical">Expira</span>
                                    </div>
                                    <span className="font-black font-tactical">{new Date(promo.validUntil).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Background Label */}
                            <div className="absolute -top-6 -right-4 text-[60px] font-black opacity-[0.02] pointer-events-none select-none uppercase -rotate-12 group-hover:opacity-[0.05] transition-all">
                                {promo.code}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
