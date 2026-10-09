'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { 
    HeartPulse, Activity, BedDouble, Baby, Skull,
    Plus, Search, Map as MapIcon, ChevronRight, 
    Hospital, Thermometer, ShieldCheck, Microscope
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { TacticalRadar } from '@/components/dashboard/TacticalRadar';

export default function HealthPage() {
    const [stats, setStats] = useState<any>(null);
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [schools, setSchools] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res: any = await api.get('/health');
                const d = res.data || res;
                setStats(d);
                setHospitals(d.hospitals || []);
            } catch (err) {
                toast({ title: "Erro de Malha", description: "Falha ao sincronizar sistema de saúde MTNI.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) return <div className="p-20 text-[10px] font-black font-mono animate-pulse uppercase tracking-widest text-emerald-500">Sincronizando Sistema de Saúde...</div>;

    const indicators = [
        { label: 'Unidades de Saúde', value: stats?.totalHospitals || 0, icon: Hospital, color: 'text-emerald-500', trend: 'ATIVO' },
        { label: 'Capacidade de Leitos', value: stats?.totalBeds || 0, icon: BedDouble, color: 'text-blue-400', trend: `${stats?.avgOccupancy}% OCUP` },
        { label: 'Natalidade (Total)', value: stats?.totalBirths || 0, icon: Baby, color: 'text-cyan-400', trend: '+12% Mensal' },
        { label: 'Mortalidade Crítica', value: stats?.totalDeaths || 0, icon: Skull, color: 'text-red-400', trend: '-2.4% Estável' },
    ];

    return (
        <div className="flex flex-col gap-10 w-full pb-20 p-8 pt-4">
            
            {/* Header Tactical */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border pb-8">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-12 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                    <div>
                        <span className="text-[10px] font-black font-mono uppercase tracking-[0.4em] text-emerald-500 block mb-1">MTNI :: SNS_MONITORAMENTO_ESTADUAL</span>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground leading-none">Rede Sanitária e Epidemiológica</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/health/manage')} className="tactical-btn group p-3"><Plus className="w-4 h-4 group-hover:text-emerald-500 transition-colors" /></button>
                    <button onClick={() => router.push('/map')} className="tactical-btn px-6 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border-emerald-500/20 text-emerald-500">
                        <MapIcon className="w-3.5 h-3.5" /> Laboratório Geográfico
                    </button>
                </div>
            </div>

            {/* Metrics Quick Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
                {indicators.map((ind, i) => (
                    <motion.div 
                        key={ind.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-card p-8 flex flex-col items-center justify-center text-center group hover:bg-muted/10 transition-colors"
                    >
                        <ind.icon className={cn("w-7 h-7 mb-4", ind.color)} />
                        <span className="text-4xl font-black tabular-nums tracking-tighter block mb-1 uppercase">{ind.value}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 font-mono">{ind.label}</span>
                        <div className="mt-4 flex items-center gap-1 text-[8px] font-black font-mono uppercase border border-border px-2 py-0.5 opacity-60">
                             {ind.trend}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Radar Tático e Monitoramento de Unidades */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 tactical-panel border border-emerald-500/20 bg-card p-0 overflow-hidden relative min-h-[500px] shadow-[0_0_40px_rgba(16,185,129,0.05)]">
                    <div className="absolute top-8 left-8 z-10 p-4 border border-emerald-500/30 bg-background/90 backdrop-blur-md">
                        <span className="text-[8px] font-black font-mono uppercase tracking-widest text-emerald-500 block mb-1">SNS_Sensor Regional</span>
                        <h4 className="text-lg font-black uppercase tracking-tighter font-mono leading-none">Distribuição de Unidades SNS_MTNI</h4>
                    </div>
                    <div className="w-full h-full">
                        <TacticalRadar />
                    </div>
                </div>

                {/* Lista de Unidades Destaque */}
                <div className="tactical-panel border border-border bg-card p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                             <Thermometer className="w-4 h-4 text-emerald-400" />
                             <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Ocupação de Leitos Ativa</h3>
                        </div>
                        <span className="text-[7px] font-mono opacity-30 uppercase tracking-widest">Tempo Real</span>
                    </div>
                    <div className="flex-1 space-y-4 divide-y divide-border/20 overflow-y-auto max-h-[400px] scrollbar-hide">
                        {hospitals.map((h, idx) => (
                            <div key={h.id} className="pt-4 flex items-center justify-between group cursor-pointer">
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-black uppercase tracking-tight group-hover:text-emerald-500 transition-colors uppercase">{h.name}</span>
                                    <span className="text-[8px] font-mono opacity-30 mt-1 uppercase">{h.municipality} // {h.province}</span>
                                </div>
                                <div className="text-right">
                                    <span className={cn("text-[13px] font-black tabular-nums block", h.currentPatients > h.bedCapacity * 0.9 ? 'text-red-500' : 'text-emerald-500')}>
                                        {((h.currentPatients / h.bedCapacity) * 100).toFixed(0)}%
                                    </span>
                                    <span className="text-[7px] font-mono opacity-20 uppercase">Capacidade</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="mt-8 w-full py-4 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest">
                        Activar Alerta Epidemiológico_RED
                    </button>
                </div>
            </div>

            {/* Grid Adicional: Biosenótica */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: 'Índice de Natalidade', val: '43.2', sub: 'por 1000 hab/anual', color: 'text-emerald-400', icon: Baby },
                    { title: 'Taxa de Mortalidade', val: '8.4', sub: 'Tendência descendente', color: 'text-red-400', icon: Skull },
                    { title: 'Imunização Global', val: '92.1%', sub: 'Cobertura vacinal MTNI', color: 'text-indigo-400', icon: ShieldCheck },
                ].map((item, i) => (
                    <div key={i} className="tactical-panel border border-border bg-card p-8 flex flex-col justify-between overflow-hidden relative group">
                        <item.icon className="absolute -right-8 -bottom-8 w-24 h-24 opacity-[0.03] group-hover:scale-110 transition-transform duration-700" />
                        <div>
                             <span className="text-[9px] font-black font-mono uppercase tracking-widest opacity-40 mb-2 block">{item.title}</span>
                             <div className={cn("text-4xl font-black tracking-tighter uppercase", item.color)}>{item.val}</div>
                             <p className="text-[10px] opacity-40 uppercase mt-1 font-mono">{item.sub}</p>
                        </div>
                    </div>
                ))}
             </div>
        </div>
    );
}
