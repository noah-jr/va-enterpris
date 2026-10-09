'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Users,
    Ticket,
    TrendingUp,
    BarChart3,
    Calendar as CalendarIcon,
    ChevronRight,
    Search
} from 'lucide-react';

export default function AdminDashboard() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && (!user || (user.role !== 'ADMIN' && user.role !== 'ORGANIZADOR'))) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) return <div className="min-h-screen bg-white" />;

    const stats = [
        { label: 'Eventos Ativos', value: '12', icon: CalendarIcon, color: 'text-primary' },
        { label: 'Bilhetes Vendidos', value: '1,240', icon: Ticket, color: 'text-indigo-500' },
        { label: 'Receita (Kz)', value: '5.2M', icon: TrendingUp, color: 'text-emerald-500' },
        { label: 'Utilizadores', value: '856', icon: Users, color: 'text-orange-500' },
    ];

    return (
        <div className="min-h-screen bg-[#F8F8F8] text-dark pt-32 px-6 md:px-12 pb-20">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-5xl font-black tracking-tighter mb-2 uppercase">
                            PAINEL DE <span className="text-primary italic">GESTÃO.</span>
                        </h1>
                        <p className="text-dark/40 font-bold uppercase tracking-widest text-xs">
                            Bem-vindo, {user.nome} • Status: Operacional
                        </p>
                    </motion.div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/20" />
                            <input
                                type="text"
                                placeholder="Procurar evento..."
                                className="w-full pl-12 pr-6 py-4 bg-white border border-dark/5 rounded-2xl outline-none focus:border-primary transition-colors font-medium"
                            />
                        </div>
                        <Link href="/admin/eventos/novo" className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black transition-all hover:bg-dark shadow-xl shadow-primary/20">
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">Novo Evento</span>
                        </Link>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-10 rounded-[2.5rem] border border-dark/5 shadow-sm hover:shadow-xl transition-all group"
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-dark/5 flex items-center justify-center ${stat.color} mb-8 group-hover:bg-primary group-hover:text-white transition-all`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <h4 className="text-dark/30 font-black uppercase text-[10px] tracking-[0.3em] mb-2">{stat.label}</h4>
                            <div className="text-4xl font-black text-dark tracking-tighter">{stat.value}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Areas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 bg-white rounded-[3rem] p-12 border border-dark/5 shadow-sm">
                        <div className="flex justify-between items-center mb-12">
                            <h3 className="text-3xl font-black tracking-tighter uppercase">PRÓXIMOS <span className="text-primary italic">EVENTOS.</span></h3>
                            <button className="text-primary font-bold hover:underline">Ver Todos</button>
                        </div>

                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between p-8 bg-[#FDFDFD] rounded-[2rem] border border-dark/5 hover:border-primary/20 transition-all group">
                                    <div className="flex items-center gap-8">
                                        <div className="w-20 h-20 bg-dark text-white rounded-[1.5rem] flex flex-col items-center justify-center font-black">
                                            <span className="text-2xl leading-none">25</span>
                                            <span className="text-[10px] uppercase text-white/40">DEZ</span>
                                        </div>
                                        <div>
                                            <h5 className="text-2xl font-black tracking-tighter text-dark mb-1 group-hover:text-primary transition-colors">Mega Concerto Luanda 2024</h5>
                                            <p className="text-dark/40 font-bold uppercase text-[10px] tracking-widest">Organizado por: VA Entertainment</p>
                                        </div>
                                    </div>
                                    <button className="w-12 h-12 rounded-full border border-dark/5 flex items-center justify-center hover:bg-dark hover:text-white transition-all">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-1 bg-white rounded-[3rem] p-12 border border-dark/5 shadow-sm">
                        <div className="flex justify-between items-center mb-12">
                            <h3 className="text-3xl font-black tracking-tighter uppercase">ATIVIDADE.</h3>
                            <BarChart3 className="w-6 h-6 text-dark/20" />
                        </div>
                        <div className="space-y-10">
                            {[
                                { t: "Novo utilizador registrado", h: "há 5m", c: "bg-primary" },
                                { t: "Bilhete VIP vendido - Show Bonga", h: "há 12m", c: "bg-indigo-500" },
                                { t: "Evento 'Sunset' aprovado", h: "há 1h", c: "bg-emerald-500" },
                                { t: "Log de auditoria gerado", h: "há 3h", c: "bg-orange-500" }
                            ].map((activity, i) => (
                                <div key={i} className="flex gap-6 items-start">
                                    <span className={`w-3 h-3 rounded-full ${activity.c} mt-2.5 shadow-lg shadow-current`} />
                                    <div>
                                        <p className="text-dark font-black tracking-tight leading-tight mb-1">{activity.t}</p>
                                        <p className="text-dark/30 font-bold uppercase text-[10px] tracking-widest">{activity.h}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-12 py-5 border-2 border-dark/5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-dark hover:text-white transition-all">
                            Ver Relatório Completo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

