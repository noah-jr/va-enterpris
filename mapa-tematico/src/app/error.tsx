"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, ShieldAlert, Terminal } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('System Critical Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans bg-tactical-grid">
            {/* TACTICAL OVERLAY ELEMENTS */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Corner Accents */}
                <div className="absolute top-12 left-12 w-16 h-16 border-t-2 border-l-2 border-orange-500/20" />
                <div className="absolute bottom-12 right-12 w-16 h-16 border-b-2 border-r-2 border-orange-500/20" />
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-[500px] w-full text-center">
                {/* Error Icon Hub */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative mb-12"
                >
                    <div className="w-24 h-24 border border-orange-500/30 flex items-center justify-center relative bg-orange-500/5">
                        <ShieldAlert className="w-10 h-10 text-orange-500" />

                        {/* Error Pulse */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-orange-500 rounded-none"
                        />
                    </div>

                    {/* Error Code Decal */}
                    <div className="absolute -bottom-4 -right-4 bg-orange-500 text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
                        SYS_FAULT
                    </div>
                </motion.div>

                {/* Main Message */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2">
                        Falha Crítica <span className="text-orange-500">Detetada</span>
                    </h1>

                    <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 bg-orange-500" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                                Interrupção na integridade do módulo
                            </p>
                            <span className="h-1.5 w-1.5 bg-orange-500" />
                        </div>

                        <p className="text-sm text-muted-foreground/60 leading-relaxed font-medium">
                            Ocorreu um erro inesperado durante a execução do protocolo. O núcleo de segurança isolou a falha para prevenir corrupção de dados.
                        </p>
                    </div>
                </motion.div>

                {/* Reset Action */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="w-full mt-12"
                >
                    <button
                        onClick={() => reset()}
                        className="w-full tactical-btn-primary h-14 flex items-center justify-center gap-3 group border-orange-500 bg-orange-500 hover:bg-orange-600 text-black"
                    >
                        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] relative z-10">Reiniciar Módulo Operacional</span>
                    </button>

                    <p className="mt-6 text-[8px] font-black uppercase tracking-widest opacity-30">
                        {error.digest && `ID_ERRO: ${error.digest}`}
                    </p>
                </motion.div>

                {/* Diagnostic Feed */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 w-full p-6 border border-orange-500/20 bg-orange-500/5 font-tactical text-left"
                >
                    <div className="flex items-center justify-between mb-4 border-b border-orange-500/20 pb-2">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-3 h-3 text-orange-500" />
                            <span className="text-[8px] font-black uppercase text-orange-500">Dump_Segurança</span>
                        </div>
                        <span className="text-[7px] font-bold opacity-50">STK_TRACE_01</span>
                    </div>
                    <div className="text-[7px] space-y-1 opacity-80 break-all font-mono">
                        <p className="text-orange-500/70">{error.name}: {error.message}</p>
                        <p className="opacity-40">{'>'} TENTANDO_RECUPERAÇÃO_QUENTE...</p>
                        <p className="opacity-40">{'>'} ANALISANDO_MEMÓRIA_VIRTUAL...</p>
                        <p className="opacity-40">{'>'} AGUARDANDO_COMANDO_MANUAL</p>
                    </div>
                </motion.div>
            </div>

            {/* Scanning Line Effect */}
            <motion.div
                initial={{ top: '-10%' }}
                animate={{ top: '110%' }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-px bg-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.3)] pointer-events-none"
            />
        </div>
    );
}
