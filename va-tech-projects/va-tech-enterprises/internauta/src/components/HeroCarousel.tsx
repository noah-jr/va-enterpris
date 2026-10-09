"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Shield,
    Globe,
    Cpu,
    Lock,
    Server,
    Zap,
    ArrowRight,
    ChevronRight,
    ChevronLeft
} from "lucide-react";

export default function HeroCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            id: 1,
            title: "VA TECH",
            subtitle: "ENTERPRISES",
            description: "Liderança visionária transformando o futuro da tecnologia, segurança e marketing digital.",
            theme: "black"
        },
        {
            id: 2,
            title: "Inovação",
            subtitle: "Sem Limites",
            description: "Desenvolvemos soluções tecnológicas de ponta que impulsionam o seu negócio para a próxima era digital.",
            theme: "black"
        },
        {
            id: 3,
            title: "Segurança",
            subtitle: "Blindada",
            description: "Proteção total para os seus dados e infraestrutura com as mais avançadas tecnologias de cibersegurança.",
            theme: "black"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black text-white">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    {/* Background Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

                    {/* Animated Particles/Stars Background */}
                    <div className="absolute inset-0 opacity-30">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    x: Math.random() * 1000,
                                    y: Math.random() * 1000,
                                    opacity: Math.random()
                                }}
                                animate={{
                                    y: [null, Math.random() * 1000],
                                    opacity: [0.2, 0.8, 0.2]
                                }}
                                transition={{
                                    duration: Math.random() * 10 + 10,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="absolute w-1 h-1 bg-white rounded-full"
                            />
                        ))}
                    </div>

                    <div className="relative h-full tesla-container px-4 flex items-center">
                        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">

                            {/* Text Content */}
                            <div className="z-10">
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                >
                                    <h2 className="text-6xl md:text-8xl font-black mb-2 tracking-tighter">
                                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                                            {slides[currentSlide].title}
                                        </span>
                                    </h2>
                                    <h3 className="text-4xl md:text-6xl font-bold mb-6 text-gray-400">
                                        {slides[currentSlide].subtitle}
                                    </h3>
                                    <p className="text-xl text-gray-400 max-w-lg mb-8 leading-relaxed">
                                        {slides[currentSlide].description}
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Button size="lg" className="bg-white text-black hover:bg-gray-200 h-14 px-8 rounded-full font-bold text-base" asChild>
                                            <Link href="/contact">
                                                Começar Agora
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </Link>
                                        </Button>
                                        <Button size="lg" variant="outline" className="border-gray-700 text-white hover:bg-white/10 h-14 px-8 rounded-full font-bold text-base" asChild>
                                            <Link href="/services">
                                                Nossos Serviços
                                            </Link>
                                        </Button>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Right Side - Orbital Animation (Only on Slide 1) or other visuals */}
                            <div className="relative flex justify-center items-center h-[600px]">
                                {currentSlide === 0 ? (
                                    <OrbitalSystem />
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.8 }}
                                        className="relative"
                                    >
                                        <div className="w-96 h-96 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                        {currentSlide === 1 ? (
                                            <Globe className="w-64 h-64 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" />
                                        ) : (
                                            <Shield className="w-64 h-64 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" />
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Carousel Controls */}
            <div className="absolute bottom-10 right-10 flex gap-4 z-20">
                <button onClick={prevSlide} className="p-3 rounded-full border border-gray-700 hover:bg-white/10 text-white transition-colors">
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <div className="flex gap-2 items-center">
                    {slides.map((_, idx) => (
                        <div
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-gray-600'}`}
                        />
                    ))}
                </div>
                <button onClick={nextSlide} className="p-3 rounded-full border border-gray-700 hover:bg-white/10 text-white transition-colors">
                    <ChevronRight className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
}

function OrbitalSystem() {
    return (
        <div className="relative w-[700px] h-[700px] flex items-center justify-center">
            {/* Sun/Core (CEO Image Placeholder) */}
            <motion.div
                className="relative z-20 w-72 h-72 rounded-full p-1 bg-gradient-to-br from-gray-200 to-gray-600 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
            >
                <div className="w-full h-full rounded-full bg-gray-900 overflow-hidden relative flex items-center justify-center">
                    {/* Placeholder for CEO Image */}
                    <img
                        src="/images/va-hero.png" // CEO image
                        alt="CEO"
                        className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-700"
                    />
                </div>
            </motion.div>

            {/* Orbit 1 */}
            <Orbit radius={240} duration={20} reverse>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                        <Globe className="text-white w-6 h-6" />
                    </div>
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                        <Cpu className="text-white w-6 h-6" />
                    </div>
                </div>
            </Orbit>

            {/* Orbit 2 */}
            <Orbit radius={340} duration={35}>
                <div className="absolute top-1/4 left-1/4">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                        <Shield className="text-white w-6 h-6" />
                    </div>
                </div>
                <div className="absolute bottom-1/4 right-1/4">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                        <Zap className="text-white w-6 h-6" />
                    </div>
                </div>
                <div className="absolute top-1/4 right-1/4">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                        <Lock className="text-white w-6 h-6" />
                    </div>
                </div>
            </Orbit>

            {/* Orbit Lines */}
            <div className="absolute inset-0 border border-gray-800 rounded-full w-[480px] h-[480px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
            <div className="absolute inset-0 border border-gray-800 rounded-full w-[680px] h-[680px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
        </div>
    );
}

function Orbit({ radius, duration, children, reverse = false }: { radius: number, duration: number, children: React.ReactNode, reverse?: boolean }) {
    return (
        <motion.div
            animate={{ rotate: reverse ? -360 : 360 }}
            transition={{ duration: duration, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ width: radius * 2, height: radius * 2 }}
        >
            {/* We need to counter-rotate children so they stay upright, or let them rotate if desired. 
                For icons, usually we want them upright. */}
            {children}
        </motion.div>
    );
}
