'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { easeInOut, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Snowflake, ShieldCheck, Zap } from 'lucide-react';

export function Hero() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 100]);
    const y2 = useTransform(scrollY, [0, 500], [0, -50]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 20 });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener("mousedown", handleMouseMove); // Cleanup if needed, though usually not for hero
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.8, easeInOut: [0.16, 1, 0.3, 1] } }
    };

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-20 bg-gray-50 dark:bg-[#050505]">
            {/* Background Grain/Noise or Polish */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-12 gap-16 items-center">

                    {/* Main Content */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="lg:col-span-7"
                    >
                        <motion.div variants={itemVariants} className="flex items-center space-x-3 mb-8">
                            <div className="w-12 h-[px] bg-black" />
                            <span className="text-black font-black uppercase tracking-[0.3em] text-[10px]">Líder em Climatização Angola</span>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="font-serif text-6xl sm:text-8xl lg:text-9xl font-black text-black dark:text-white mb-8 leading-[0.85] tracking-tighter"
                        >
                            Puro. Fresco. <br />
                            <span className="text-black italic">Luclima.</span>
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="text-xl sm:text-2xl text-gray-500 dark:text-gray-400 mb-12 max-w-xl leading-relaxed font-medium"
                        >
                            Engenharia de precisão para garantir o clima perfeito. Instalamos conforto, mantemos confiança e higienizamos a sua saúde.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 mb-20">
                            <Link
                                href="/solicitar-servico"
                                className="group px-10 py-6 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-4 hover:bg-black dark:hover:bg-black dark:hover:text-white transition-all shadow-2xl shadow-black/10 hover:shadow-black/30 active:scale-95"
                            >
                                Iniciar Projecto <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                            </Link>
                            <Link
                                href="/servicos"
                                className="px-10 py-6 border border-gray-200 dark:border-gray-800 text-black dark:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center hover:bg-white dark:hover:bg-gray-900 transition-all active:scale-95 shadow-sm"
                            >
                                Catálogo de Serviços
                            </Link>
                        </motion.div>

                        {/* Social Proof / Stats */}
                        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-12 pt-12 border-t border-gray-200 dark:border-gray-800/50">
                            <div>
                                <p className="text-4xl font-black text-black dark:text-white tracking-tighter">15k+</p>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">Clientes Atendidos</p>
                            </div>
                            <div>
                                <p className="text-4xl font-black text-black dark:text-white tracking-tighter">24/7</p>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">Piquete Ativo</p>
                            </div>
                            <div>
                                <p className="text-4xl font-black text-black dark:text-white tracking-tighter">A++</p>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">Eficiência Energética</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Visual Element / Featured Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                        className="lg:col-span-5 relative"
                        style={{ x: mousePos.x, y: mousePos.y }}
                    >
                        <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-gray-200 dark:border-gray-800 group bg-gray-200 dark:bg-gray-900">
                            <motion.img
                                style={{ y: y1 }}
                                src="/images/hero-bg.png"
                                alt="Técnico Especializado Luclima"
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />

                            <div className="absolute bottom-10 left-10 right-10 p-8 bg-black/40 backdrop-blur-xl rounded-[2rem] border border-white/10">
                                <p className="text-white text-base font-bold leading-relaxed mb-6 italic">
                                    "A Luclima não apenas limpa o seu AC; nós garantimos que o ar que a sua família respira seja de qualidade hospitalar."
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shadow-lg shadow-black/40">
                                            <Snowflake size={14} className="text-white" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest block">Certificado Luclima</span>
                                            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Garantia Premium</span>
                                        </div>
                                    </div>
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gray-800 overflow-hidden">
                                                <img src={`/images/team-small.jpg`} alt="User" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Decorative Elements */}
                        <motion.div
                            style={{ y: y2 }}
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-12 -right-12 w-64 h-64 bg-black/20 rounded-full blur-[100px] -z-10"
                        />
                        <motion.div
                            animate={{ x: [0, 20, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -bottom-12 -left-12 w-48 h-48 bg-gray-600/20 rounded-full blur-[80px] -z-10"
                        />
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-4"
            >
                <div className="w-[1px] h-20 bg-gradient-to-b from-black to-transparent" />
                <span className="text-[8px] font-black uppercase tracking-[0.5em] text-gray-400 [writing-mode:vertical-lr]">Scroll</span>
            </motion.div>
        </section>
    );
}
