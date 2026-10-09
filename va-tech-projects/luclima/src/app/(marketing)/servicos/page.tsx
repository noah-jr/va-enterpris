'use client';

import Link from 'next/link';
import { ArrowRight, Snowflake, Wrench, Droplets, Building2, Zap, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const iconMap: Record<string, any> = {
    Snowflake,
    Wrench,
    Droplets,
    Building2,
    Zap,
    ShieldCheck,
};

export default function ServicesPage() {
    const services = [
        {
            title: 'Instalação Profissional',
            description: 'Execução técnica seguindo rigorosamente os padrões dos fabricantes para garantir a garantia e eficiência do equipamento.',
            icon: 'Snowflake',
            color: 'bg-black'
        },
        {
            title: 'Manutenção Preventiva',
            description: 'Check-ups periódicos para evitar avarias inesperadas e prolongar a vida útil do seu ar condicionado.',
            icon: 'Wrench',
            color: 'bg-indigo-600'
        },
        {
            title: 'Higienização Profunda',
            description: 'Remoção de fungos, poeiras e bactérias com produtos biodegradáveis, preservando a saúde respiratória.',
            icon: 'Droplets',
            color: 'bg-cyan-600'
        },
        {
            title: 'Sistemas Industriais',
            description: 'Projectos e manutenção para grandes edifícios, escritórios e complexos industriais com tecnologia VRF.',
            icon: 'Building2',
            color: 'bg-slate-700'
        },
        {
            title: 'Assistência 24/7',
            description: 'Suporte técnico de emergência para situações críticas que exigem resolução imediata.',
            icon: 'Zap',
            color: 'bg-amber-500'
        },
        {
            title: 'Contratos Corporate',
            description: 'Planos personalizados para empresas com gestão centralizada e relatórios técnicos mensais.',
            icon: 'ShieldCheck',
            color: 'bg-emerald-600'
        },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-[#050505]">
               {/* <Header /> */}

            <main className="pt-20">
                {/* Hero Section */}
                <section className="py-32 bg-gray-50 dark:bg-[#0a0a0a] overflow-hidden relative">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="flex items-center justify-center space-x-2 mb-6">
                                <div className="w-12 h-[px] bg-black" />
                                <span className="text-black font-black uppercase tracking-[0.2em] text-xs">Excelência Técnica em Angola</span>
                            </div>
                            <h1 className="font-serif text-6xl sm:text-8xl font-black text-black dark:text-white mb-8 tracking-tighter leading-[0.9]">
                                Soluções de <br />
                                <span className="text-black italic">Climatização</span>
                            </h1>
                            <p className="text-2xl text-gray-500 dark:text-gray-400 mb-12 font-medium max-w-2xl mx-auto leading-relaxed">
                                Desde a instalação doméstica à manutenção industrial complexa, garantimos o clima perfeito para o seu espaço.
                            </p>
                            <Link
                                href="/solicitar-servico"
                                className="inline-flex items-center space-x-3 px-10 py-5 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl shadow-black/20"
                            >
                                <span>Solicitar Orçamento</span>
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-black/5 blur-[120px] rounded-full -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gray-600/5 blur-[100px] rounded-full translate-y-1/2" />
                </section>

                {/* Services Grid */}
                <section className="py-32">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
                            {services.map((service, index) => {
                                const IconComponent = iconMap[service.icon];

                                return (
                                    <div
                                        key={index}
                                        className="group relative flex flex-col p-10 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 hover:border-black/30 transition-all duration-500 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-black/5"
                                    >
                                        <div className={`mb-8 p-5 rounded-2xl w-fit ${service.color} text-white transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                                            <IconComponent size={32} strokeWidth={1.5} />
                                        </div>

                                        <h3 className="font-serif text-3xl font-bold text-black dark:text-white mb-4">
                                            {service.title}
                                        </h3>

                                        <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 leading-relaxed font-medium">
                                            {service.description}
                                        </p>

                                        <Link
                                            href="/solicitar-servico"
                                            className="mt-auto flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-black group-hover:text-gray-800 transition-colors"
                                        >
                                            <span>Saber Mais</span>
                                            <ArrowRight size={14} className="ml-2 group-hover:translate-x-2 transition-transform" />
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Trust Section */}
                <section className="py-32 bg-black text-white overflow-hidden relative">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16">
                            <div className="text-center md:text-left">
                                <h2 className="font-serif text-5xl sm:text-7xl font-black mb-6 leading-tight">
                                    Conforto Sem <br />
                                    <span className="text-black italic">Interrupções</span>
                                </h2>
                                <p className="text-xl text-gray-400 font-medium max-w-lg">
                                    Subscreva o nosso plano de manutenção preventiva e esqueça as preocupações com o seu AC.
                                </p>
                            </div>
                            <Link
                                href="/solicitar-servico"
                                className="px-12 py-6 bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-gray-800 hover:scale-105 transition-all shadow-2xl shadow-black/40"
                            >
                                Manutenção Preventiva
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

             {/* <Footer /> */}
        </div>
    );
}
