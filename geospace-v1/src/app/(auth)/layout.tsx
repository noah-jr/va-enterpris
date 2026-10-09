'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [systemTime, setSystemTime] = useState('');
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const updateTime = () => {
            const now = new Date();
            setSystemTime(now.toLocaleTimeString('pt-PT', { hour12: false }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans bg-tactical-grid selection:bg-foreground selection:text-background relative overflow-hidden">
            {/* TACTICAL OVERLAY ELEMENTS */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Scanner Line Effect */}
                <motion.div
                    initial={{ top: '-10%' }}
                    animate={{ top: '110%' }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-px bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                />

                {/* Corner Markers */}
                <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-primary/20" />
                <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-primary/20" />
                <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-primary/20" />
                <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-primary/20" />

                {/* Theme Toggle Button */}
                <div className="absolute top-8 right-8 z-50 pointer-events-auto">
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="flex items-center gap-2 px-3 py-1.5 border border-primary/20 bg-background/50 backdrop-blur-md hover:bg-primary hover:text-background transition-all font-tactical text-[8px] font-black uppercase tracking-widest"
                    >
                        {mounted && (
                            <>
                                {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                                <span>{theme === 'dark' ? 'MODO_CLARO' : 'MODO_ESCURO'}</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Top Center Status */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-primary">Acesso.Restrito</span>
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-primary animate-pulse" />
                        <span className="font-tactical text-[10px] font-black">{systemTime}</span>
                    </div>
                </div>

                {/* Bottom Center Brand */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-20">
                    <span className="text-[7px] font-black uppercase tracking-widest">GEOSPACE GEOSPACE Admin — Segurança Integrada</span>
                </div>

                {/* Side Data Decals */}
                <div className="absolute left-8 top-1/2 -translate-y-1/2 flex-col gap-12 hidden md:flex opacity-20">
                    <div className="flex flex-col gap-1">
                        <span className="text-[6px] font-black uppercase">Protocolo</span>
                        <span className="text-[9px] font-tactical uppercase">SSL_AES_256</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[6px] font-black uppercase">Status</span>
                        <span className="text-[9px] font-tactical uppercase">Aguardando_Link</span>
                    </div>
                </div>

                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-12 hidden md:flex items-end opacity-20">
                    <div className="flex flex-col gap-1 items-end">
                        <span className="text-[6px] font-black uppercase">Local</span>
                        <span className="text-[9px] font-tactical uppercase">Luanda_AO</span>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                        <span className="text-[6px] font-black uppercase">Terminal</span>
                        <span className="text-[9px] font-tactical uppercase">TX_001_A</span>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex items-center justify-center p-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
