'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative h-screen flex flex-col justify-center px-6 md:px-24 overflow-hidden bg-white">
            {/* Background Video */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute min-w-full min-h-full object-cover opacity-40 scale-105"
                >
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-orchestra-performing-in-a-theatre-41131-large.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
            </div>

            <div className="relative z-20 max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-6xl md:text-8xl font-black leading-[0.9] text-dark mb-8 tracking-tighter">
                        OS EVENTOS <br />
                        <span className="text-primary italic">CLÁSSICOS</span> <br />
                        DE ANGOLA.
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-xl md:text-2xl text-dark/70 mb-12 max-w-2xl font-medium leading-relaxed"
                >
                    Descubra a sofisticação e a cultura em ambientes exclusivos.
                    A sua porta de entrada para os espetáculos mais prestigiados do país.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-6 items-start"
                >
                    <Link href="/eventos" className="group relative px-10 py-5 bg-primary text-white rounded-full font-bold text-lg overflow-hidden transition-all hover:pr-14">
                        <span className="relative z-10 flex items-center gap-2">
                            Explorar Eventos <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-dark translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </Link>

                    <button className="flex items-center gap-4 text-dark font-bold text-lg group">
                        <div className="w-14 h-14 rounded-full border-2 border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                            <Play className="w-5 h-5 fill-current" />
                        </div>
                        Ver Teaser
                    </button>
                </motion.div>
            </div>

            {/* Side Stats - Adveris Style */}
            <div className="absolute bottom-12 right-12 hidden lg:block z-20">
                <div className="flex flex-col gap-12 text-right">
                    <div>
                        <span className="block text-5xl font-black text-primary">50+</span>
                        <span className="text-sm font-bold uppercase tracking-widest text-dark/40">Galas Anuais</span>
                    </div>
                    <div>
                        <span className="block text-5xl font-black text-primary">10k+</span>
                        <span className="text-sm font-bold uppercase tracking-widest text-dark/40">Membros VIP</span>
                    </div>
                </div>
            </div>

            {/* Vertical Line Deco */}
            <div className="absolute left-10 top-0 bottom-0 w-[1px] bg-dark/5 hidden md:block" />
        </section>
    );
}

