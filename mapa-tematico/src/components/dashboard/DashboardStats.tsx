'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    code: string;
    label: string;
    value: string | number;
    sub: string;
    isLoading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ code, label, value, sub, isLoading }) => (
    <div className="tactical-panel bg-card p-10 flex flex-col justify-between h-full group transition-all hover:bg-muted/10 border border-border">
        {/* Header Indicator */}
        <div className="flex justify-between items-start mb-8 pb-4 border-b border-border/40">
            <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-primary font-tactical uppercase tracking-[0.4em] opacity-80 leading-none">
                    {code}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground mt-1">
                    {label}
                </span>
            </div>
            <div className="flex items-center gap-1.5 border border-border px-2 py-0.5 bg-muted/20">
                <div className="w-1.5 h-1.5 bg-foreground" />
                <span className="text-[8px] font-black uppercase font-tactical tracking-widest text-foreground">SINC</span>
            </div>
        </div>

        {/* Hero Value */}
        <div className="flex items-baseline gap-4 relative">
            <span className="text-6xl font-black tracking-tighter leading-none block text-foreground">
                {isLoading ? '---' : value}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-10 font-tactical text-foreground">TX_DADOS</span>
        </div>

        {/* Tactical Footer */}
        <p className="mt-8 text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40 group-hover:text-foreground transition-colors font-tactical flex items-center gap-2">
            <span className="w-4 h-px bg-border group-hover:bg-primary transition-all" />
            {sub}
        </p>
    </div>
);

export const DashboardStats: React.FC<{ data?: any, isLoading?: boolean }> = ({ data, isLoading }) => {
    const stats = [
        {
            code: 'SOS_0',
            label: 'Alertas Ativos',
            value: data?.data?.emergencies?.active || 0,
            sub: 'Prioridade da Grade Operacional',
        },
        {
            code: 'MBL_A',
            label: 'Total Emergências',
            value: data?.data?.emergencies?.total || 0,
            sub: 'Contagem Acumulada de Eventos',
        },
        {
            code: 'TIM_D',
            label: 'Delta Resposta',
            value: `${data?.data?.emergencies?.avgResolutionTime || 0}M`,
            sub: 'Hub de Análise Temporal',
        },
        {
            code: 'SYS_S',
            label: 'Resolvidos Hoje',
            value: data?.data?.emergencies?.last24h || 0,
            sub: 'Métrica de Resolução Diária',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border overflow-hidden">
            {stats.map((stat) => (
                <StatCard
                    key={stat.code}
                    {...stat}
                    isLoading={isLoading}
                />
            ))}
        </div>
    );
};
