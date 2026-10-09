"use client";

import { Service } from "@/core/domain/entities/Service";
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
import { Icon } from "@/components/ui/icon";
import { ChevronRight } from "lucide-react";

interface CategorizedServicesProps {
    services: Service[];
}

export default function CategorizedServices({ services }: CategorizedServicesProps) {
    // Group services by category
    const groupedServices = services.reduce((acc, service) => {
        const category = service.category || "Outros";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(service);
        return acc;
    }, {} as Record<string, Service[]>);

    const categories = Object.keys(groupedServices);

    return (
        <div className="space-y-24 py-12">
            {categories.map((category, catIdx) => (
                <motion.section
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: catIdx * 0.1 }}
                    className="relative"
                >
                    <div className="tesla-container mb-8 flex items-end justify-between">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-2 text-foreground dark:text-white">
                                {category}
                            </h2>
                            <div className="h-1.5 w-12 bg-primary dark:bg-white/20 rounded-full" />
                        </div>
                        <Link
                            href={`/services?category=${encodeURIComponent(category)}`}
                            className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
                        >
                            Ver todos
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="tesla-container relative group px-4 md:px-12">
                        <Carousel
                            opts={{
                                align: "start",
                                loop: false,
                            }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-4">
                                {groupedServices[category].map((service) => (
                                    <CarouselItem key={service.id} className="pl-4 basis-[85%] md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                        <Link href={`/services/${service.slug}`}>
                                            <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted border border-border/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
                                                {/* Background Image */}
                                                {service.image ? (
                                                    <Image
                                                        src={service.image}
                                                        alt={service.title}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                                                        <Icon name={service.icon} className="h-20 w-20 opacity-10" />
                                                    </div>
                                                )}

                                                {/* Overlay - Base Gradient */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                                                {/* Overlay - Hover Highlight */}
                                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                {/* Content */}
                                                <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end h-1/2 transform transition-transform duration-500 group-hover:translate-y-[-8px]">
                                                    <div className="flex items-center gap-3 mb-4 transform transition-all duration-500 group-hover:translate-y-[-4px]">
                                                        <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 group-hover:bg-primary group-hover:border-primary transition-colors duration-500">
                                                            <Icon name={service.icon} className="h-5 w-5 text-white" />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 group-hover:text-white/80 transition-colors">
                                                            {service.category}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-2xl font-semibold text-white leading-tight mb-3">
                                                        {service.title}
                                                    </h3>

                                                    <p className="text-sm text-white/60 line-clamp-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 leading-relaxed">
                                                        {service.description}
                                                    </p>

                                                    <div className="mt-6 flex items-center gap-2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                                        <span>Mais detalhes</span>
                                                        <div className="h-px w-8 bg-white/40 group-hover:w-12 transition-all duration-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>

                            {/* Navigation Buttons - Only visible on hover and desktop */}
                            <div className="hidden md:block">
                                <CarouselPrevious className="absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/80 hover:bg-white dark:hover:bg-black border-none shadow-xl opacity-0 group-hover:opacity-100 transition-opacity disabled:hidden w-12 h-12" />
                                <CarouselNext className="absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/80 hover:bg-white dark:hover:bg-black border-none shadow-xl opacity-0 group-hover:opacity-100 transition-opacity disabled:hidden w-12 h-12" />
                            </div>
                        </Carousel>
                    </div>
                </motion.section>
            ))}
        </div>
    );
}
