'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { 
    GraduationCap, Book, Users, Clipboard, Plus, Search, 
    ArrowRight, Map as MapIcon, MoreHorizontal, CheckCircle, 
    TrendingUp, Award, School, MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { TacticalRadar } from '@/components/dashboard/TacticalRadar';

export default function EducationPage() {
    const [stats, setStats] = useState<any>(null);
    const [schools, setSchools] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res: any = await api.get('/education');
                const data = res.data || res;
                setStats(data);
                setSchools(data?.schools || []);
            } catch (err) {
                toast({ title: "Erro de Sincronização", description: "Falha ao consultar malha educacional MTNI.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const indicators = [
        { label: 'Unidades Escolares', value: stats?.totalSchools || 0, icon: School, color: 'text-blue-500', trend: '+12' },
        { label: 'Indivíduos Matriculados', value: stats?.totalStudents?.toLocaleString() || 0, icon: Users, color: 'text-indigo-400', trend: '+3.4%' },
        { label: 'Corpo Docente', value: stats?.totalTeachers?.toLocaleString() || 0, icon: Award, color: 'text-emerald-400', trend: '+124' },
        { label: 'Nível de Aproveitamento', value: `${stats?.avgPassRate || 0}%`, icon: CheckCircle, color: 'text-amber-400', trend: '+1.5%' },
    ];

    if (loading) return <div className="p-20 text-[10px] font-black font-mono animate-pulse uppercase tracking-widest text-primary">Carregando Sector Educação...</div>;

    return (
        <div className="flex flex-col gap-10 w-full pb-20 p-8 pt-4">
            
            {/* Header Tactical */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border pb-8">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-12 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                    <div>
                        <span className="text-[10px] font-black font-mono uppercase tracking-[0.4em] text-indigo-500 block mb-1">MTNI :: GESTÃO_INFRAESTRUTURA_ESCOLAR</span>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground leading-none">Educação e Formação Nacional</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/education/manage')} className="tactical-btn group p-3"><Plus className="w-4 h-4 group-hover:text-indigo-500 transition-colors" /></button>
                    <button onClick={() => router.push('/map')} className="tactical-btn px-6 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                        <MapIcon className="w-3.5 h-3.5" /> Ver Malha Geográfica
                    </button>
                </div>
            </div>

            {/* Metrics Quick Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
                {indicators.map((ind, i) => (
                    <motion.div 
                        key={ind.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-card p-6 flex flex-col items-center justify-center text-center group hover:bg-muted/10 transition-colors"
                    >
                        <ind.icon className={cn("w-6 h-6 mb-4", ind.color)} />
                        <span className="text-3xl font-black tabular-nums tracking-tighter block mb-1">{ind.value}</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 font-mono">{ind.label}</span>
                        <div className="mt-3 flex items-center gap-1 text-[8px] font-black text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 bg-emerald-500/5">
                            <TrendingUp className="w-2.5 h-2.5" /> {ind.trend}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Radar Tático Integrado */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 tactical-panel border border-border bg-card p-0 overflow-hidden relative min-h-[500px]">
                    <div className="absolute top-8 left-8 z-10 p-4 border border-border bg-background/80 backdrop-blur-md">
                        <span className="text-[8px] font-black font-mono uppercase tracking-widest text-indigo-500 block mb-1">Geo_Visão Ativa</span>
                        <h4 className="text-lg font-black uppercase tracking-tighter font-mono leading-none">Malha Escolar Estratégica</h4>
                    </div>
                    <div className="w-full h-full">
                        <TacticalRadar />
                    </div>
                </div>

                {/* Lista de Unidades Destaque */}
                <div className="tactical-panel border border-border bg-card p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <Book className="w-4 h-4 text-indigo-400" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Fluxo de Matrículas</h3>
                        </div>
                        <span className="text-[7px] font-mono opacity-30 uppercase tracking-widest">Destaque Regional</span>
                    </div>
                    <div className="flex-1 space-y-4 divide-y divide-border/20 overflow-y-auto max-h-[400px] scrollbar-hide">
                        {schools.slice(0, 8).map((school, idx) => (
                            <div key={school.id} className={cn("pt-4 flex items-center justify-between group cursor-pointer")}>
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-black uppercase tracking-tight group-hover:text-indigo-400 transition-colors uppercase">{school.name}</span>
                                    <div className="flex items-center gap-2 mt-1">
                                         <MapPin className="w-2.5 h-2.5 opacity-30 text-indigo-400" />
                                         <span className="text-[8px] font-mono opacity-30 uppercase">{school.province}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[12px] font-black tabular-nums block">{school.studentsCount}</span>
                                    <span className="text-[7px] font-mono opacity-20 uppercase">Alunos</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="mt-8 w-full py-4 border border-border hover:bg-indigo-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest">
                        Gerar Report Territorial Completo
                    </button>
                </div>
            </div>

            {/* Grid Adicional: Infra vs Passagens */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border">
                 {[
                     { label: 'Média Aprovação_MTNI', val: `${stats?.avgPassRate || 0}%`, sub: 'Ensino Geral Secundário', detail: `Consistente em ${stats?.totalProvincies || 0} Províncias`, color: 'text-indigo-400' },
                     { label: 'Escolas_CONSTRUÇÃO', val: `${stats?.totalUnderConstruction || 0}`, sub: 'Projecto Sinais Ativos', detail: '80% em execução térmica', color: 'text-emerald-400' },
                     { label: 'Índice_LITERACIA', val: `${stats?.literacyIndex || 0}%`, sub: 'Previsão PFM_2026', detail: 'Dinamicamente Calculado', color: 'text-amber-400' },
                 ].map((m, i) => (
                    <div key={i} className="bg-card p-8 group hover:bg-muted/10 transition-colors">
                        <span className="text-[9px] font-black font-mono uppercase tracking-[0.3em] opacity-40 mb-2 block">{m.label}</span>
                        <div className={cn("text-4xl font-black tabular-nums tracking-tighter leading-none mb-1", m.color)}>{m.val}</div>
                        <p className="text-[10px] font-black uppercase mb-1">{m.sub}</p>
                        <p className="text-[8px] opacity-40 font-mono uppercase">{m.detail}</p>
                    </div>
                 ))}
            </div>
        </div>
    );
}
