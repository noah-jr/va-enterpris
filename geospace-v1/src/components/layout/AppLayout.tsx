'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { KodachiStatsSidebar } from './KodachiStatsSidebar';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function AppLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [systemUptime, setSystemUptime] = useState('00:00:00');
    const pathname = usePathname();
    const isMonitoringPage = pathname === '/monitoring';

    useEffect(() => {
        const start = Date.now();
        const interval = setInterval(() => {
            const diff = Date.now() - start;
            const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            setSystemUptime(`${h}:${m}:${s}`);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative min-h-screen bg-background text-foreground flex flex-col font-sans bg-tactical-grid selection:bg-foreground selection:text-background">

            {/* TACTICAL NAVIGATION CONSOLE (Drawer Overlay) */}
            <AnimatePresence mode="wait">
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-[101] w-full md:w-[380px] bg-card border-r border-border flex flex-col"
                        >
                            {/* Console Header */}
                            <div className="h-16 px-6 flex items-center justify-between border-b border-border bg-muted/20 relative">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-1 bg-primary" />
                                        <span className="font-tactical text-[8px] font-black uppercase tracking-[0.3em] text-primary">Sistema.Console</span>
                                    </div>
                                    <span className="text-[14px] font-black uppercase tracking-widest mt-0.5 text-foreground">OKUSANGA_Sistema</span>
                                </div>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="tactical-btn h-8 px-3 text-[8px]"
                                >
                                    FECHAR [ESC]
                                </button>
                            </div>

                            {/* Console Navigation */}
                            <div className="flex-1 overflow-y-auto">
                                <Sidebar
                                    isMobile
                                    onItemClick={() => setIsSidebarOpen(false)}
                                    className="bg-transparent border-none"
                                />
                            </div>

                            {/* Console Footer */}
                            <div className="p-6 border-t border-border bg-muted/10 grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[7px] font-black uppercase tracking-widest text-foreground opacity-30">Sessão_Ativa</span>
                                    <span className="font-tactical text-[10px] font-black text-foreground">{systemUptime}</span>
                                </div>
                                <div className="flex flex-col gap-0.5 items-end">
                                    <span className="text-[7px] font-black uppercase tracking-widest text-foreground opacity-30">Nvl.Auth</span>
                                    <span className="font-tactical text-[10px] font-black text-foreground">7_ADMIN</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <Topbar
                onMenuClick={() => setIsSidebarOpen(true)}
                isFloating={isMonitoringPage}
            />

            <div className={cn(
                "flex-1 w-full flex", // Changed to flex to accommodate main and KodachiStatsSidebar side-by-side
                isMonitoringPage ? "h-screen overflow-hidden" : "mt-20 md:mt-24"
            )}>
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-background/50 relative scrollbar-hide">
                    <div className="p-6 md:p-8 pt-24 md:pt-28 max-w-[1600px] mx-auto min-h-screen">
                        {children}
                    </div>
                </main>

                {/* Right: Kodachi Stats */}
                <div className="hidden 2xl:block sticky top-0 h-screen">
                    <KodachiStatsSidebar />
                </div>
            </div>

            {/* Floating System Trigger */}
            {isMonitoringPage && !isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="fixed top-6 left-6 z-[60] group"
                >
                    <div className="relative w-12 h-12 bg-background border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-all">
                        <Menu className="w-4 h-4" />
                    </div>
                </button>
            )}

            {/* Corner Data Indicators */}
            {!isMonitoringPage && (
                <div className="fixed bottom-3 right-4 z-50 pointer-events-none flex items-center gap-4 opacity-30">
                    <div className="flex flex-col items-end">
                        <span className="text-[7px] font-black uppercase tracking-widest text-foreground">Link Global</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1 h-1 bg-primary" />
                            <span className="font-tactical text-[8px] uppercase font-bold text-foreground">TX_SEGURO</span>
                        </div>
                    </div>
                    <div className="w-px h-6 bg-border" />
                    <div className="font-tactical text-[8px] uppercase font-bold text-foreground/40">L: 08.83S / O: 13.23E</div>
                </div>
            )}
        </div>
    );
}
