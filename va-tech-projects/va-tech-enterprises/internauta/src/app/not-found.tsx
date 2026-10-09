"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Search, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-6">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse delay-700" />
            </div>

            <div className="relative z-10 w-full max-w-2xl text-center space-y-12">
                {/* Animated 404 Header */}
                <div className="relative inline-block">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-[12rem] md:text-[18rem] font-bold leading-none tracking-tighter text-foreground/5 select-none"
                    >
                        404
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-accent/10 backdrop-blur-3xl border border-accent/20 flex items-center justify-center shadow-2xl shadow-accent/20">
                            <Compass className="w-12 h-12 md:w-16 md:h-16 text-accent animate-[spin_10s_linear_infinite]" />
                        </div>
                    </motion.div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Caminho Desconhecido</h2>
                        <p className="mt-4 text-lg text-muted-foreground mx-auto max-w-lg leading-relaxed">
                            A página que procura não existe ou foi movida para uma nova dimensão digital.
                            Não se preocupe, estamos aqui para o ajudar a encontrar o caminho de volta.
                        </p>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10"
                    >
                        <Button asChild size="lg" className="h-14 px-8 rounded-full bg-foreground text-background hover:opacity-90 transition-all font-semibold gap-2 min-w-[200px] shadow-xl">
                            <Link href="/">
                                <Home className="w-5 h-5" />
                                Voltar ao Início
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full border-border/50 hover:bg-muted/50 transition-all font-semibold gap-2 min-w-[200px]">
                            <Link href="/blog">
                                <Search className="w-5 h-5" />
                                Explorar o Blog
                            </Link>
                        </Button>
                    </motion.div>
                </div>

                {/* Footer Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="pt-16"
                >
                    <div className="h-px w-24 bg-border/50 mx-auto mb-8" />
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                        VA Tech Enterprises &bull; Error Management System
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
