"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { projects } from "@/data/projects";

// Use first 4 projects for preview
const portfolioItems = projects.slice(0, 4);

export default function PortfolioSection() {
    return (
        <section className="py-24 bg-background border-t border-border/10">
            <div className="tesla-container px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">Portfólio Recente</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            Transformamos ideias em resultados tangíveis.
                        </p>
                    </div>
                    <Link href="/portfolio" className="hidden md:flex items-center text-sm font-medium hover:underline underline-offset-4 mt-6 md:mt-0">
                        Ver Todos os Projetos <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {portfolioItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative overflow-hidden rounded-sm bg-secondary/20"
                        >
                            {/* Image Container with Aspect Ratio */}
                            <div className="aspect-video md:aspect-[16/9] overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            {/* Content Overlay (Visible on Hover or always visible below?) 
                                Standard Tesla style: clean text below or overlay. 
                                Let's put text BELOW for clarity as requested "com breve descrição".
                            */}
                            <div className="p-6">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
                                    {item.category}
                                </p>
                                <h3 className="text-xl font-medium mb-3 group-hover:text-muted-foreground transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed text-sm">
                                    {item.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 text-center md:hidden">
                    <Link href="/portfolio" className="inline-flex items-center text-sm font-medium hover:underline underline-offset-4">
                        Ver Todos os Projetos <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
