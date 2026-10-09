"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function InfrastructureSection() {
    return (
        <section className="py-24 bg-background overflow-hidden">
            <div className="tesla-container px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-xl overflow-hidden bg-secondary/30 aspect-[16/9] md:aspect-[21/9] mb-12 shadow-2xl"
                >
                    <Image
                        src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=2070&q=80"
                        alt="Network Map"
                        fill
                        className="object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                    {/* Stats Overlay */}
                    <div className="absolute bottom-12 right-12 flex gap-12 text-foreground">
                        <div className="text-center">
                            <span className="block text-4xl md:text-5xl font-bold tracking-tight">45.000+</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2 block">Pontos de Rede</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-4xl md:text-5xl font-bold tracking-tight">24/7</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2 block">Monitorização</span>
                        </div>
                    </div>
                </motion.div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <h2 className="text-4xl font-medium tracking-tight mb-4">Infraestrutura Sem Limites</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl">
                            A nossa rede de suporte e infraestrutura tecnológica estende-se para garantir que o seu negócio nunca pare, com segurança e velocidade em qualquer ponto.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/contact">
                            <button className="px-10 py-3 bg-foreground text-background rounded-sm font-medium hover:bg-foreground/90 transition-colors">
                                Contactar
                            </button>
                        </Link>
                        <Link href="/about">
                            <button className="px-10 py-3 bg-secondary text-foreground rounded-sm font-medium hover:bg-secondary/70 transition-colors">
                                Saber Mais
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
