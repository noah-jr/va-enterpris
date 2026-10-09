"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronLeft, Home, Radio, Terminal } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans bg-tactical-grid">
            {/* TACTICAL OVERLAY ELEMENTS */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Random Data Noise */}
                <div className="absolute top-10 left-10 opacity-10 flex flex-col gap-1 font-tactical text-[8px]">
                    <span>ERR_NODE_DISCONNECT</span>
                    <span>PKT_LOSS: 100%</span>
                    <span>SIG_STRENGTH: 0.0</span>
                </div>

                <div className="absolute bottom-10 right-10 opacity-10 flex flex-col gap-1 font-tactical text-[8px] text-right">
                    <span>SECTOR_04_UNREACHABLE</span>
                    <span>TX_ID: 0x404_NULL</span>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-12 left-12 w-16 h-16 border-t-2 border-l-2 border-red-500/20" />
                <div className="absolute bottom-12 right-12 w-16 h-16 border-b-2 border-r-2 border-red-500/20" />
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-[500px] w-full text-center">
                {/* Error Icon Hub */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative mb-12"
                >
                    <div className="w-24 h-24 border border-red-500/30 flex items-center justify-center relative">
                        <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />

                        {/* Orbiting Elements */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-4 border border-dashed border-red-500/10 rounded-full"
                        />
                    </div>

                    {/* Error Code Decal */}
                    <div className="absolute -bottom-4 -right-4 bg-red-500 text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest skew-x-[-10deg]">
                        Error_404
                    </div>
                </motion.div>

                {/* Main Message */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-2">
                        Ligação <span className="text-red-500">Romperda</span>
                    </h1>

                    <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="h-1 w-1 bg-red-500 animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                                Nó de rede não encontrado no grid operacional
                            </p>
                            <span className="h-1 w-1 bg-red-500 animate-pulse" />
                        </div>

                        <p className="text-sm text-muted-foreground/60 leading-relaxed font-medium">
                            O recurso solicitado não existe ou foi movido para uma zona de acesso restrito fora da sua malha de comando.
                        </p>
                    </div>
                </motion.div>

                {/* Action Grid */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-12"
                >
                    <Link href="/dashboard" className="tactical-btn-primary h-14 flex items-center justify-center gap-3 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                        <Home className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest relative z-10">Retornar ao Hub</span>
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="tactical-btn h-14 flex items-center justify-center gap-3 group border-red-500/20 hover:border-red-500/40"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Protocolo Anterior</span>
                    </button>
                </motion.div>

                {/* Diagnostic Feed */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 w-full p-4 border border-border/20 bg-muted/5 font-tactical text-left"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Terminal className="w-3 h-3" />
                        <span className="text-[8px] font-black uppercase">Relatório_Diagnóstico</span>
                    </div>
                    <div className="text-[7px] space-y-1 opacity-60">
                        <p>{'>'} BUSCANDO_COORDENADAS... [FALHOU]</p>
                        <p>{'>'} VERIFICANDO_AUTORIZAÇÃO_SETOR... [OK]</p>
                        <p>{'>'} ESTADO_LINK: DESCONECTADO</p>
                        <p>{'>'} SISTEMA_OPERACIONAL: ATIVO_EM_MODO_SEGURANÇA</p>
                    </div>
                </motion.div>
            </div>

            {/* Scanning Line Effect */}
            <motion.div
                initial={{ top: '-10%' }}
                animate={{ top: '110%' }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-px bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)] pointer-events-none"
            />
        </div>
    );
}
