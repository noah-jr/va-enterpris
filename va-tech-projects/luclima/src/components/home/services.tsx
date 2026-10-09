'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Snowflake, ShieldCheck, Thermometer, Droplets, Wrench, Building2, ArrowRight } from 'lucide-react';

const categories = [
    {
        icon: Snowflake,
        title: 'Instalação de AC',
        description: 'Instalação profissional de sistemas Split, Multi-Split e VRF para residências e empresas.',
        topics: ['Design de Fluxo', 'Eficiência A++', 'Garantia 2 Anos'],
    },
    {
        icon: Wrench,
        title: 'Manutenção',
        description: 'Manutenção preventiva e corretiva para garantir o desempenho ideal do seu equipamento.',
        topics: ['Carga de Gás', 'Teste de Fugas', 'Electrónica'],
    },
    {
        icon: Droplets,
        title: 'Higienização',
        description: 'Limpeza profunda de filtros e serpentinas para um ar livre de impurezas e odores.',
        topics: ['Anti-Bacteriano', 'Controle Ácaros', 'Filtros HEPA'],
    },
    {
        icon: Building2,
        title: 'Sistemas Centrais',
        description: 'Soluções completas para edifícios, hotéis e grandes superfícies comerciais.',
        topics: ['Chillers', 'VRV / VRF', 'Dutos'],
    },
    {
        icon: ShieldCheck,
        title: 'Dedetização',
        description: 'Controle de pragas e desinfecção de ambientes com produtos certificados.',
        topics: ['Desinfestação', 'Desratização', 'Escritórios'],
    },
    {
        icon: Thermometer,
        title: 'Consultoria',
        description: 'Estudos de carga térmica e optimização de consumo energético para novos projectos.',
        topics: ['Eficiência Energética', 'Auditoria', 'Projectos'],
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1]
        }
    }
};

export function Services() {
    return (
        <section id="servicos" className="py-32 bg-gray-50 dark:bg-[#050505]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col md:flex-row items-baseline justify-between mb-24 gap-8 pb-12 border-b border-gray-200 dark:border-gray-800"
                    >
                        <h2 className="font-serif text-5xl sm:text-7xl font-black text-black dark:text-white tracking-tighter">
                            Nossos <br className="hidden lg:block" />
                            <span className="text-black italic">Serviços</span>
                        </h2>
                        <p className="text-xl text-gray-400 dark:text-gray-500 max-w-xl font-medium leading-relaxed">
                            Soluções de engenharia térmica e ambiental desenhadas para elevar o padrão do seu espaço. Tecnologia, precisão e compromisso Luclima.
                        </p>
                    </motion.div>

                    {/* Categories Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-10"
                    >
                        {categories.map((cat, index) => {
                            const Icon = cat.icon;
                            return (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="group flex flex-col p-10 bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800/50 rounded-[2.5rem] hover:border-black/30 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-500"
                                >
                                    <div className="mb-10 flex items-center justify-between">
                                        <div className="p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm group-hover:bg-black group-hover:text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                            <Icon size={32} strokeWidth={1.5} />
                                        </div>
                                        <div className="flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Premium</span>
                                            <div className="w-10 h-[2px] bg-black mt-1" />
                                        </div>
                                    </div>

                                    <h3 className="font-serif text-3xl font-bold text-black dark:text-white mb-5 group-hover:text-black transition-colors tracking-tight">
                                        {cat.title}
                                    </h3>

                                    <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed font-medium">
                                        {cat.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-12">
                                        {cat.topics.map((topic, idx) => (
                                            <span key={idx} className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-5 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-full border border-gray-100 dark:border-gray-800 group-hover:border-black/10 group-hover:text-black transition-colors">
                                                {topic}
                                            </span>
                                        ))}
                                    </div>

                                    <Link
                                        href="/servicos"
                                        className="mt-auto group/link flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-black dark:text-white hover:text-black transition-all"
                                    >
                                        <span className="mr-4">Mais Detalhes</span>
                                        <div className="h-[1px] flex-1 bg-gray-200 dark:bg-gray-800 group-hover/link:bg-black transition-colors" />
                                        <ArrowRight size={16} className="ml-4 group-hover/link:translate-x-2 transition-transform" />
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
