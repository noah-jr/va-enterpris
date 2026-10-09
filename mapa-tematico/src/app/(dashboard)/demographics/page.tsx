'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { 
    Users, Globe, TrendingUp, Map as MapIcon, 
    Activity, UserPlus, Fingerprint, Plus, Search, 
    ArrowUpRight, BarChart3, PieChart as PieIcon,
    MapPin, Navigation
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

export default function DemographicsPage() {
    const [stats, setStats] = useState<any>(null);
    const [demographics, setDemographics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res: any = await api.get('/demographics');
                const d = res.data || res;
                setStats(d);
                setDemographics(d.demographics || []);
            } catch (err) {
                toast({ title: "Erro Geo-Demográfico", description: "Falha ao sincronizar censos MTNI.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const indicators = [
        { label: 'População Nacional', value: stats?.totalPopulation?.toLocaleString() || 0, icon: Users, color: 'text-orange-500', trend: '+2.4%' },
        { label: 'Densidade Média', value: `${stats?.avgDensity || 0} hab/km²`, icon: Globe, color: 'text-blue-400', trend: 'CRÍTICO' },
        { label: 'Taxa Crescimento', value: `${stats?.avgGrowth || 0}%`, icon: TrendingUp, color: 'text-emerald-400', trend: 'POSITIVO' },
        { label: 'Zonas Mapeadas', value: demographics.length, icon: Navigation, color: 'text-indigo-400', trend: 'SINC' },
    ];

    if (loading) return <div className="p-20 text-[10px] font-black font-mono animate-pulse uppercase tracking-widest text-orange-500">Sincronizando Sistema Demográfico...</div>;

    return (
        <div className="flex flex-col gap-10 w-full pb-20 p-8 pt-4">
            
            {/* Header Tactical */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border pb-8">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-12 bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
                    <div>
                        <span className="text-[10px] font-black font-mono uppercase tracking-[0.4em] text-orange-500 block mb-1">MTNI :: ANÁLISE_DEMOGRÁFICA_NACIONAL</span>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground leading-none">Censo e Dinâmica Populacional</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/demographics/manage')} className="tactical-btn group p-3 text-orange-500 border-orange-500/20 bg-orange-500/5 shadow-inner backdrop-blur-sm relative overflow-hidden">
                         <div className="absolute inset-0 bg-orange-500/10 animate-pulse pointer-events-none" />
                         <Plus className="w-4 h-4" />
                    </button>
                    <button onClick={() => router.push('/map')} className="tactical-btn px-6 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border-orange-500/20 text-orange-500">
                        <MapIcon className="w-3.5 h-3.5" /> Ver Malha Geográfica
                    </button>
                </div>
            </div>

            {/* Metrics Quick Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
                {indicators.map((ind, i) => (
                    <motion.div 
                        key={ind.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-card p-8 flex flex-col items-center justify-center text-center group hover:bg-muted/10 transition-colors"
                    >
                        <ind.icon className={cn("w-7 h-7 mb-4", ind.color)} />
                        <span className="text-4xl font-black tabular-nums tracking-tighter block mb-1">{ind.value}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 font-mono italic">{ind.label}</span>
                        <div className="mt-4 flex items-center gap-1 text-[8px] font-black font-mono uppercase border border-orange-500/20 px-2 py-0.5 opacity-60 bg-orange-500/5 text-orange-500">
                             {ind.trend}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                
                {/* População por Província (Ranking) */}
                <div className="tactical-panel border border-border bg-card p-8 flex flex-col h-[450px]">
                    <div className="flex items-center gap-3 mb-8">
                        <Activity className="w-5 h-5 text-orange-400" />
                        <h3 className="text-[12px] font-black uppercase tracking-[0.2em]">Densidade_Regional_RANKING</h3>
                    </div>
                    <div className="flex-1 min-h-0 -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.chartData || []} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(var(--foreground-rgb),0.05)" />
                                <XAxis type="number" stroke="rgba(var(--foreground-rgb),0.3)" fontSize={9} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" stroke="rgba(var(--foreground-rgb),0.3)" fontSize={9} axisLine={false} tickLine={false} width={80} />
                                <Tooltip 
                                    contentStyle={{ background: 'rgba(var(--background-rgb),0.9)', border: '1px solid var(--border)', fontSize: '10px' }}
                                    cursor={{ fill: 'rgba(var(--foreground-rgb),0.03)' }}
                                />
                                <Bar dataKey="populacao" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pirâmide Etária Simulação */}
                <div className="tactical-panel border border-border bg-card p-8 flex flex-col h-[450px]">
                    <div className="flex items-center gap-3 mb-8">
                        <PieIcon className="w-5 h-5 text-orange-400" />
                        <h3 className="text-[12px] font-black uppercase tracking-[0.2em]">Estrutura_Etária_NACIONAL</h3>
                    </div>
                    <div className="flex-1 min-h-0">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.pyramidData || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={140}
                                    paddingAngle={5}
                                    dataKey="percentagem"
                                    nameKey="idade"
                                >
                                    {(stats?.pyramidData || []).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={[`#f97316`, `#fb923c`, `#fdba74`, `#fed7aa`, `#ffedd5`][index % 5]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ background: 'rgba(var(--background-rgb),0.9)', border: '1px solid var(--border)', fontSize: '10px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
                         {(stats?.pyramidData || []).map((p: any, i: number) => (
                             <div key={i} className="flex flex-col items-center p-2 border border-border bg-muted/20">
                                 <span className="text-[10px] font-black font-mono leading-none">{p.percentagem}%</span>
                                 <span className="text-[7px] font-mono opacity-30 mt-1 uppercase">{p.idade}</span>
                             </div>
                         ))}
                    </div>
                </div>

            </div>

            {/* Listagem Tática Demográfica */}
            <div className="tactical-panel border border-border bg-card overflow-hidden">
                <div className="px-8 py-5 border-b border-border bg-muted/20 flex items-center justify-between">
                    <span className="text-[11px] font-black font-mono uppercase tracking-[0.3em]">Censos Registados_MTNI</span>
                    <div className="flex items-center gap-4 text-[9px] font-mono opacity-40 uppercase">
                        <span>Total: {demographics.length} Regiões</span>
                        <div className="w-1 h-1 bg-border rounded-full" />
                        <span>Sincronizado: {new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
                <div className="divide-y divide-border/20">
                     {demographics.map((demo) => (
                         <div key={demo.id} className="p-8 group hover:bg-muted/10 transition-colors flex items-center justify-between">
                             <div className="flex flex-col">
                                 <span className="text-[16px] font-black uppercase tracking-tight group-hover:text-orange-500 transition-all uppercase">{demo.regionName}</span>
                                 <div className="flex items-center gap-3 mt-1.5">
                                      <span className="text-[8px] font-black border border-orange-500/20 px-2 py-0.5 bg-orange-500/5 text-orange-500 font-mono">{demo.regionType}</span>
                                      <span className="text-[8px] font-mono opacity-30 uppercase tracking-widest">{demo.municipality || 'Dístrito Central'}</span>
                                      <span className="text-[7px] font-mono opacity-20 uppercase tracking-[0.2em]">UTC+1 LUANDA</span>
                                 </div>
                             </div>
                             <div className="flex items-center gap-12 text-right">
                                 <div className="flex flex-col">
                                     <span className="text-[18px] font-black tabular-nums leading-none">{(demo.totalPopulation / 1000).toFixed(1)}k</span>
                                     <span className="text-[8px] font-mono opacity-30 uppercase tracking-[0.2em] mt-1">População</span>
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="text-[18px] font-black tabular-nums leading-none">{demo.density}</span>
                                     <span className="text-[8px] font-mono opacity-30 uppercase tracking-[0.2em] mt-1">hab/km²</span>
                                 </div>
                                 <div className="flex flex-col w-16">
                                     <span className="text-[18px] font-black tabular-nums leading-none text-emerald-500">{demo.growthRate}%</span>
                                     <span className="text-[8px] font-mono opacity-30 uppercase tracking-[0.2em] mt-1">Cresc.</span>
                                 </div>
                             </div>
                         </div>
                     ))}
                </div>
            </div>

            {/* Bottom Alert Overlay */}
            <div className="bg-orange-600/5 border border-orange-600/30 p-6 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                     <div className="h-10 w-10 flex items-center justify-center bg-orange-600/10 border border-orange-600/30">
                         <Activity className="w-5 h-5 text-orange-500 animate-pulse" />
                     </div>
                     <div>
                         <span className="text-[10px] font-black uppercase tracking-widest block mb-1">Padrão Populacional Crítico</span>
                         <p className="text-[12px] opacity-60 uppercase tracking-tight">Detectada correlação de densidade alta e défice de leitos hospitalares em {demographics[0]?.regionName || 'Benfica'}. Alerta de IA Nível 4.</p>
                     </div>
                 </div>
                 <button className="tactical-btn-primary bg-orange-600 hover:bg-orange-500 px-8 py-3 text-[9px] h-fit">Gerar Plano de Apoio Regional</button>
            </div>
        </div>
    );
}
