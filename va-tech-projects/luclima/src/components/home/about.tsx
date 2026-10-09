'use client';

import { ShieldCheck, Zap, Thermometer, Droplets } from 'lucide-react';

const pillars = [
    {
        icon: ShieldCheck,
        title: 'Confiança',
        description: 'Compromisso com a transparência e ética em cada intervenção técnica.',
    },
    {
        icon: Droplets,
        title: 'Higienização',
        description: 'Eliminação rigorosa de fungos e bactérias para garantir a sua saúde.',
    },
    {
        icon: Zap,
        title: 'Agilidade',
        description: 'Resposta rápida para emergências em sistemas de climatização central.',
    },
    {
        icon: Thermometer,
        title: 'Precisão',
        description: 'Diagnósticos técnicos precisos para evitar gastos desnecessários.',
    },
];

export function About() {
    return (
        <section id="sobre" className="py-32 bg-white dark:bg-[#0a0a0a]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Main Content */}
                    <div className="grid lg:grid-cols-2 gap-20 items-center mb-24">
                        <div className="relative order-2 lg:order-1">
                            <div className="aspect-square bg-gray-100 dark:bg-gray-900 overflow-hidden rounded-3xl">
                                <img
                                    src="/images/about.jpg"
                                    alt="Escritório Luclima"
                                    className="w-full h-full object-cover grayscale brightness-75"
                                />
                            </div>
                            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-black/10 rounded-full blur-3xl -z-10" />

                            {/* Floating Quote */}
                            <div className="absolute top-1/2 -right-10 transform -translate-y-1/2 bg-black dark:bg-white p-10 max-w-xs shadow-2xl hidden xl:block rounded-xl">
                                <p className="font-serif text-2xl italic text-white dark:text-black leading-tight">
                                    "A qualidade do ar que respira é a nossa maior prioridade."
                                </p>
                                <span className="block mt-4 text-[10px] font-black uppercase tracking-widest text-black">Fundação Luclima</span>
                            </div>
                        </div>

                        <div className="space-y-10 order-1 lg:order-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-12 h-[2px] bg-black" />
                                <span className="text-black font-black uppercase tracking-[0.2em] text-xs">A Nossa Missão</span>
                            </div>

                            <h2 className="font-serif text-5xl sm:text-7xl font-black text-black dark:text-white leading-[1.1]">
                                Excelência em <br />
                                <span className="text-gray-400 dark:text-gray-600 italic">Climatização para</span> <br />
                                o seu Espaço
                            </h2>

                            <div className="space-y-6 text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                <p>
                                    Na Luclima, acreditamos que um ambiente bem climatizado e higienizado é fundamental para a produtividade e saúde. A nossa missão é oferecer soluções técnicas de alta qualidade, aliadas a um atendimento personalizado.
                                </p>
                                <p>
                                    Com anos de experiência no mercado angolano, estabelecemos padrões de rigor na manutenção preventiva e corretiva, garantindo que o seu sistema funcione sempre na máxima eficiência.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pillars Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 pt-20 border-t border-gray-100 dark:border-gray-800">
                        {pillars.map((pillar, index) => {
                            const Icon = pillar.icon;
                            return (
                                <div
                                    key={index}
                                    className="group"
                                >
                                    <div className="mb-6 text-black dark:text-white group-hover:text-black transition-colors">
                                        <Icon size={32} strokeWidth={1.5} />
                                    </div>
                                    <h4 className="font-serif text-2xl font-bold text-black dark:text-white mb-3">{pillar.title}</h4>
                                    <p className="text-gray-500 dark:text-gray-500 leading-relaxed">{pillar.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
