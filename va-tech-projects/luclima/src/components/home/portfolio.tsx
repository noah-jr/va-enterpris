'use client';

import { ArrowRight, MessageSquare, Share2 } from 'lucide-react';
import Link from 'next/link';

export function Portfolio() {
    const projects = [
        {
            title: 'Sistema Central Edifício Atlântico',
            category: 'Industrial',
            image: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=800',
            client: 'Grupo Sonangol',
            date: 'Jan 2026'
        },
        {
            title: 'Higienização de Ar Hospitalar',
            category: 'Saúde',
            image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
            client: 'Clínica Girassol',
            date: 'Dez 2025'
        },
        {
            title: 'Climatização Residência Premium',
            category: 'Residencial',
            image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
            client: 'Condomínio Talatona',
            date: 'Nov 2025'
        },
        {
            title: 'Manutenção Preventiva Comercial',
            category: 'Comercial',
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
            client: 'Shopping Fortaleza',
            date: 'Out 2025'
        },
    ];

    return (
        <section id="portfolio" className="py-32 bg-white dark:bg-[#0a0a0a]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                    <div className="max-w-xl">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-12 h-[2px] bg-black" />
                            <span className="text-black font-black uppercase tracking-[0.2em] text-xs">Excelência Técnica</span>
                        </div>
                        <h2 className="font-serif text-5xl font-black text-black dark:text-white leading-[1.1]">
                            Projectos <br />
                            <span className="text-gray-400 dark:text-gray-600 italic">Recentes em Destaque</span>
                        </h2>
                    </div>
                    <Link
                        href="/portfolio"
                        className="flex items-center space-x-2 font-black uppercase tracking-widest text-sm hover:text-black transition-colors border-b-2 border-transparent hover:border-black pb-2"
                    >
                        <span>Ver Todos os Projectos</span>
                        <ArrowRight size={18} />
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {projects.map((item, index) => (
                        <div
                            key={index}
                            className="group flex flex-col items-start"
                        >
                            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-900 w-full mb-6 rounded-2xl">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="px-2 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest leading-none">
                                        {item.category}
                                    </span>
                                </div>
                            </div>

                            <h3 className="font-serif text-2xl font-bold text-black dark:text-white mb-4 line-clamp-3 leading-[1.2] group-hover:text-black transition-colors">
                                {item.title}
                            </h3>

                            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 w-full flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                    {item.client}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                    {item.date}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
