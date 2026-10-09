'use client';

import { ArrowRight, Facebook, Linkedin, Mail } from 'lucide-react';

const team = [
    {
        name: 'Carlos Oliveira',
        role: 'Director Técnico',
        image: '/images/leader.jpg',
        description: 'Especialista em sistemas VRF e climatização industrial com mais de 15 anos de experiência no sector.'
    },
    {
        name: 'Ana Paula Santos',
        role: 'Gestora de Qualidade',
        image: '/images/id-card-model.jpg',
        description: 'Responsável por garantir que todos os procedimentos de higienização cumpram as normas internacionais de saúde.'
    },
    {
        name: 'Ricardo Sousa',
        role: 'Chefe de Equipa - Campo',
        image: '/images/team-small.jpg',
        description: 'Lidera as equipas de intervenção rápida, assegurando manutenção preventiva de alta qualidade.'
    }
];

export function Team() {
    return (
        <section id="equipa" className="py-32 bg-white dark:bg-[#0a0a0a]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Section Header */}
                    <div className="flex flex-col md:flex-row items-baseline justify-between mb-24 gap-8 pb-8 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="font-serif text-5xl sm:text-6xl font-black text-black dark:text-white">
                            Nossa <span className="text-black italic">Equipa</span>
                        </h2>
                        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-xl font-medium">
                            Conheça os profissionais dedicados a garantir a excelência técnica e o seu conforto térmico.
                        </p>
                    </div>

                    {/* Main Technical Highlight */}
                    <div className="mb-32">
                        <div className="grid lg:grid-cols-12 gap-12 items-center">
                            <div className="lg:col-span-12 relative group overflow-hidden bg-gray-100 dark:bg-gray-900 aspect-[21/9] rounded-3xl">
                                <img
                                    src="/images/team.jpg"
                                    alt="Technical Workshop"
                                    className="w-full h-full object-cover grayscale brightness-50 group-hover:scale-105 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-16">
                                    <div className="flex items-center space-x-2 mb-6">
                                        <div className="w-12 h-[2px] bg-black" />
                                        <span className="text-black font-black uppercase tracking-[0.2em] text-xs">Formação Contínua</span>
                                    </div>
                                    <h3 className="font-serif text-4xl sm:text-6xl font-black text-white mb-6 max-w-3xl leading-tight">
                                        Tecnologia e rigor <br />
                                        em cada <span className="italic">detalhe.</span>
                                    </h3>
                                    <p className="text-xl text-gray-300 max-w-2xl leading-relaxed font-medium">
                                        As nossas equipas passam por formações periódicas com fabricantes líderes mundiais,
                                        garantindo o domínio das tecnologias mais eficientes do mercado.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team Grid */}
                    <div className="grid md:grid-cols-3 gap-16">
                        {team.map((member, index) => (
                            <div
                                key={index}
                                className="group"
                            >
                                <div className="aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-900 mb-8 grayscale group-hover:grayscale-0 transition-all duration-700 relative rounded-2xl">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 border border-black/5 dark:border-white/5" />
                                </div>

                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black block mb-3">
                                    {member.role}
                                </span>

                                <h4 className="font-serif text-3xl font-bold text-black dark:text-white mb-4 group-hover:text-black transition-colors">
                                    {member.name}
                                </h4>

                                <p className="text-gray-500 dark:text-gray-500 leading-relaxed font-medium mb-8">
                                    {member.description}
                                </p>

                                <div className="flex gap-6">
                                    <a href="#" className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                        <Facebook size={20} />
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                        <Linkedin size={20} />
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                        <Mail size={20} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quality Standards CTA */}
                    <div className="mt-32 p-12 bg-black dark:bg-[#111] border border-white/5 text-center relative overflow-hidden rounded-3xl">
                        <div className="relative z-10">
                            <h3 className="font-serif text-3xl font-bold text-white mb-6 italic">Comprometidos com as normas internacionais de segurança e higiene.</h3>
                            <a
                                href="/servicos"
                                className="inline-flex items-center gap-3 text-black font-black uppercase tracking-widest text-xs hover:gap-6 transition-all"
                            >
                                Conheça os nossos Procedimentos <ArrowRight size={18} />
                            </a>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-[15vw] opacity-[0.03] text-white whitespace-nowrap pointer-events-none italic select-none uppercase">
                            Luclima Pro
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
