"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
    {
        id: 1,
        name: "Carlos Ferreira",
        role: "CEO",
        company: "TechSolutions",
        content: "A VA Tech transformou completamente a nossa infraestrutura de rede. A equipa é extremamente profissional e o suporte é inigualável.",
        rating: 5,
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
    },
    {
        id: 2,
        name: "Sofia Martins",
        role: "Diretora de Marketing",
        company: "InovaBrand",
        content: "Os resultados das campanhas de tráfego pago superaram todas as nossas expectativas. O ROI duplicou em apenas 3 meses.",
        rating: 5,
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
    },
    {
        id: 3,
        name: "Miguel Rodrigues",
        role: "Gestor de Operações",
        company: "Logística Global",
        content: "Implementar o sistema de CCTV da VA Tech foi a melhor decisão para a segurança dos nossos armazéns. Recomendo vivamente.",
        rating: 4,
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
    }
];

export default function TestimonialsCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    return (
        <section className="py-24 bg-background">
            <div className="tesla-container px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-medium mb-4">O Que Dizem os Clientes</h2>
                    <p className="text-muted-foreground text-lg">
                        A nossa melhor referência.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto relative">
                    <div className="absolute top-0 left-0 -translate-x-4 -translate-y-4 opacity-50">
                        <Quote className="h-20 w-20 text-muted-foreground/10 rotate-180" />
                    </div>

                    <div className="relative p-0 md:p-12">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col md:flex-row gap-12 items-center cursor-grab active:cursor-grabbing"
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.8}
                                onDragEnd={(e, { offset, velocity }) => {
                                    const swipe = offset.x;
                                    if (swipe < -50) next();
                                    else if (swipe > 50) prev();
                                }}
                            >
                                <div className="shrink-0">
                                    <div className="w-24 h-24 rounded-full overflow-hidden grayscale">
                                        <img
                                            src={testimonials[currentIndex].image}
                                            alt={testimonials[currentIndex].name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="text-center md:text-left flex-1">
                                    <p className="text-2xl md:text-3xl font-light leading-relaxed text-foreground mb-8">
                                        "{testimonials[currentIndex].content}"
                                    </p>
                                    <div>
                                        <h4 className="font-medium text-lg tracking-wide">{testimonials[currentIndex].name}</h4>
                                        <p className="text-muted-foreground text-sm uppercase tracking-wider mt-1">
                                            {testimonials[currentIndex].role}, {testimonials[currentIndex].company}
                                        </p>
                                    </div>
                                    <div className="flex justify-center md:justify-start gap-1 mt-4 text-foreground/20">
                                        {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                                            <Star key={i} className="h-4 w-4 fill-foreground/40 text-foreground/40" />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Controls */}
                        <div className="flex justify-center gap-4 mt-12 md:absolute md:bottom-8 md:right-8 md:mt-0 opacity-0 md:opacity-100 hover:opacity-100 transition-opacity">
                            <button onClick={prev} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button onClick={next} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
