'use client';

import { Quote } from 'lucide-react';

const testimonials = [
    {
        name: 'Sara J. Mendes',
        role: 'Cliente Residencial',
        content: 'A Luclima é a única empresa em que confio para a manutenção do AC em minha casa. O técnico foi muito profissional e deixou tudo impecável.',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        name: 'David Silva',
        role: 'Gestor de Escritório',
        content: 'Excelente serviço de higienização. Notámos uma melhoria imediata na qualidade do ar no escritório. Recomendo vivamente o plano de manutenção mensal.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        name: 'Isabel Rossi',
        role: 'Arquitecta',
        content: 'Trabalhei com a Luclima em vários projectos e a consultoria técnica deles é excepcional. São meticulosos e cumprem sempre os prazos.',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150',
    },
];

export function Testimonials() {
    return (
        <section className="py-32 bg-gray-50 dark:bg-[#050505]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-baseline justify-between mb-20 gap-8 pb-8 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="font-serif text-5xl sm:text-6xl font-black text-black dark:text-white">
                            Voz do <span className="text-black italic">Cliente</span>
                        </h2>
                        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-xl font-medium">
                            Junte-se a centenas de clientes satisfeitos que confiam na nossa expertise técnica diariamente.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-16">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="relative group"
                            >
                                <div className="absolute -top-6 -left-6 text-black/10 group-hover:text-black/20 transition-colors">
                                    <Quote size={80} fill="currentColor" />
                                </div>

                                <blockquote className="relative z-10">
                                    <p className="font-serif text-2xl text-black dark:text-white mb-10 leading-snug italic">
                                        &quot;{testimonial.content}&quot;
                                    </p>

                                    <footer className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500 border border-gray-200 dark:border-gray-800">
                                            <img
                                                src={testimonial.image}
                                                alt={testimonial.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <cite className="not-italic font-black uppercase tracking-tighter text-black dark:text-white block">
                                                {testimonial.name}
                                            </cite>
                                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                {testimonial.role}
                                            </span>
                                        </div>
                                    </footer>
                                </blockquote>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
