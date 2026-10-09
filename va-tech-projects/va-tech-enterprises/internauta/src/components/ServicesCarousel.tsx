"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Network, Shield, Camera, Megaphone, Target, Share2, Monitor, Globe, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const services = [
    {
        id: "infrastructure",
        icon: Network,
        title: "Infraestrutura de Redes",
        description: "Planeamento, instalação e manutenção de redes de computadores para garantir estabilidade, velocidade e desempenho máximo da sua empresa.",
        detailed: "As nossas soluções de infraestrutura garantem conectividade robusta, escalável e segura para suportar todas as operações do seu negócio."
    },
    {
        id: "cybersecurity",
        icon: Shield,
        title: "Cibersegurança",
        description: "Proteção de dados, sistemas e redes contra ataques, vírus e acessos não autorizados.",
    },
    {
        id: "cctv",
        icon: Camera,
        title: "CCTV",
        description: "Videovigilância para monitoramento 24H, aumentando a segurança.",
    },
    {
        id: "digital-marketing",
        icon: Megaphone,
        title: "Marketing Digital",
        description: "Estratégias digitais para aumentar a visibilidade e atrair clientes.",
    },
    {
        id: "paid-traffic",
        icon: Target,
        title: "Tráfego Pago",
        description: "Anúncios pagos para gerar resultados rápidos e leads.",
    },
    {
        id: "social-media",
        icon: Share2,
        title: "Redes Sociais",
        description: "Gestão profissional para melhorar o relacionamento com clientes.",
    },
    {
        id: "web-development",
        icon: Globe,
        title: "Websites",
        description: "Sites modernos e responsivos para fortalecer a presença digital.",
    },
];

export default function ServicesCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const gap = 24;
    const firstItemWidth = 600;
    const itemWidth = 350;

    const calculateOffset = (index: number) => {
        if (index === 0) return 0;
        return firstItemWidth + gap + (index - 1) * (itemWidth + gap);
    };

    const handleNext = () => {
        setCurrentIndex(prev => (prev + 1) % services.length);
    };

    const handlePrev = () => {
        setCurrentIndex(prev => (prev - 1 + services.length) % services.length);
    };

    return (
        <section className="py-24 bg-background overflow-hidden">
            <div className="tesla-container px-6 mb-12 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">Soluções Integradas</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Tecnologia estrategicamente desenhada.
                    </p>
                </div>

                <div className="hidden md:flex gap-2">
                    <button
                        onClick={handlePrev}
                        className="p-3 border border-border/50 rounded-full hover:bg-secondary transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="p-3 border border-border/50 rounded-full hover:bg-secondary transition-colors"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="px-6 md:px-0 tesla-container">
                <motion.div
                    className="flex gap-6 cursor-grab active:cursor-grabbing"
                    animate={{ x: -calculateOffset(currentIndex) }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.1}
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipe = offset.x;
                        if (swipe < -50) {
                            handleNext();
                        } else if (swipe > 50) {
                            handlePrev();
                        }
                    }}
                >
                    {services.map((service, index) => {
                        const isFirst = index === 0;
                        return (
                            <Link
                                key={service.id}
                                href={`/services/${service.id}`}
                                className={`shrink-0 group relative overflow-hidden rounded-sm bg-secondary/50 hover:bg-secondary transition-colors duration-300 p-8 flex flex-col justify-between border-none
                                    ${isFirst ? 'w-[85vw] md:w-[600px]' : 'w-[80vw] md:w-[350px]'}
                                `}
                            >
                                <div>
                                    <div className="mb-8">
                                        <service.icon className="h-10 w-10 text-foreground/80 group-hover:text-foreground transition-colors" />
                                    </div>
                                    <h3 className={`font-medium mb-3 group-hover:underline decoration-1 underline-offset-4
                                        ${isFirst ? 'text-3xl' : 'text-xl'}
                                    `}>
                                        {service.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {isFirst && service.detailed ? service.detailed : service.description}
                                    </p>
                                </div>

                                <div className="mt-8 flex items-center text-sm font-medium text-foreground opacity-60 group-hover:opacity-100 transition-opacity">
                                    <span>Explorar</span>
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
