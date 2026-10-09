"use client";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface Product {
    id: string;
    title: string;
    description: string;
    image: string;
    link: string;
}

interface ProductCarouselProps {
    title?: string;
    items?: Product[];
}

const defaultProducts: Product[] = [
    {
        id: "1",
        title: "Infraestrutura Pro",
        description: "Soluções de rede escaláveis para empresas de alto desempenho.",
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2070&q=80",
        link: "/services/infrastructure"
    },
    {
        id: "2",
        title: "Marketing Strategy",
        description: "Campanhas orientadas por dados para maximizar o seu ROI.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2070&q=80",
        link: "/services/digital-marketing"
    },
    {
        id: "3",
        title: "Security Shield",
        description: "Proteção total contra ameaças cibernéticas modernas.",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2070&q=80",
        link: "/services/cybersecurity"
    }
];



export default function ProductCarousel({ title, items = defaultProducts }: ProductCarouselProps) {
    return (
        <section className="py-24 bg-background overflow-hidden relative group/section">
            <div className="tesla-container px-6 mb-12 flex justify-between items-end">
                <h2 className="text-4xl font-medium tracking-tight">{title || "Nossas Soluções"}</h2>
                <div className="flex gap-2">
                    {/* Dots or controls could go here if managed manually */}
                </div>
            </div>

            <div className="px-0 relative group/section">
                <Carousel
                    opts={{
                        align: "center",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-0">
                        {items.map((product) => (
                            <CarouselItem key={product.id} className="pl-0 basis-full">
                                <div className="relative aspect-[4/5] md:aspect-[21/9] bg-muted group cursor-pointer overflow-hidden transition-all duration-700">
                                    <Image
                                        src={product.image}
                                        alt={product.title}
                                        fill
                                        className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                                        priority
                                    />
                                    {/* Ultra Premium Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                                    <div className="absolute inset-x-0 bottom-0 p-12 md:p-24 lg:p-32 flex flex-col md:flex-row items-center md:items-end justify-between gap-12">
                                        <div className="max-w-4xl text-center md:text-left">
                                            <motion.h3
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.8 }}
                                                className="text-4xl md:text-7xl lg:text-8xl font-bold text-white mb-6 drop-shadow-2xl tracking-tighter leading-[0.9]"
                                            >
                                                {product.title}
                                            </motion.h3>
                                            <motion.p
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.8, delay: 0.1 }}
                                                className="text-xl md:text-2xl lg:text-3xl text-white/80 max-w-2xl line-clamp-3 md:line-clamp-none drop-shadow-lg font-light leading-relaxed"
                                            >
                                                {product.description}
                                            </motion.p>
                                        </div>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.5, delay: 0.2 }}
                                            className="flex flex-col sm:flex-row gap-6 shrink-0 w-full sm:w-auto"
                                        >
                                            <Link href={product.link} className="px-16 py-5 bg-white text-black font-bold rounded-sm hover:bg-white/90 shadow-2xl transition-all text-center uppercase tracking-[0.2em] text-sm">
                                                Pedir Orçamento
                                            </Link>
                                            <Link href="/contact" className="px-16 py-5 bg-black/40 backdrop-blur-xl text-white font-bold rounded-sm border border-white/20 hover:bg-white/10 shadow-2xl transition-all text-center uppercase tracking-[0.2em] text-sm">
                                                Explorar Detalhes
                                            </Link>
                                        </motion.div>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    {/* Floating Premium Side Controllers */}
                    <CarouselPrevious className="hidden md:flex left-12 h-20 w-20 bg-white/5 hover:bg-white/10 backdrop-blur-2xl border border-white/10 text-white translate-y-0 top-1/2 -translate-y-1/2 z-30 transition-all opacity-0 group-hover/section:opacity-100 scale-150" />
                    <CarouselNext className="hidden md:flex right-12 h-20 w-20 bg-white/5 hover:bg-white/10 backdrop-blur-2xl border border-white/10 text-white translate-y-0 top-1/2 -translate-y-1/2 z-30 transition-all opacity-0 group-hover/section:opacity-100 scale-150" />
                </Carousel>
            </div>
        </section>
    );
}
