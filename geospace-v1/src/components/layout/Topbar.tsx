'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Menu, ShieldCheck, Wifi, LogOut, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLogout } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

interface TopbarProps {
    onMenuClick?: () => void;
    isFloating?: boolean;
}

export const Topbar = ({ onMenuClick, isFloating }: TopbarProps) => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(new Date());
    const logout = useLogout();
    const router = useRouter();

    React.useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = async () => {
        if (confirm('Encerrar sessão GEOSPACE?')) {
            try {
                await logout.mutateAsync();
                router.push('/login');
            } catch (error) {
                console.error('Logout failed:', error);
                window.location.href = '/login';
            }
        }
    };

    return (
        <header className={cn(
            "z-40 transition-all duration-300",
            isFloating
                ? "fixed top-0 left-0 right-0 h-16 bg-background/60 backdrop-blur-xl flex items-center justify-between px-6 border-b border-border/10"
                : "fixed top-0 right-0 left-0 bg-background border-b border-border h-16 md:h-20 flex items-center justify-between px-6 md:px-10"
        )}>
            {/* Left: Menu & Brand */}
            <div className="flex items-center gap-8 h-full">
                <button
                    onClick={onMenuClick}
                    className="flex items-center gap-3 h-10 px-4 border border-border bg-muted/5 font-mono text-[8px] font-black uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-all"
                >
                    <Menu className="w-4 h-4" />
                    <span className="hidden sm:inline">Menu_Sistema</span>
                </button>

                {!isFloating && (
                    <div className="hidden lg:flex items-center gap-4 border-l border-border pl-8">
                        {/* GEOSPACE Logo Mark */}
                        <div className="relative w-8 h-8 flex items-center justify-center">
                            <div className="absolute inset-0 border border-primary/40 rotate-45 scale-75" />
                            <Globe className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-[15px] uppercase tracking-[0.15em] leading-none text-foreground">GEOSPACE</span>
                            <span className="text-[7px] font-bold text-muted-foreground uppercase opacity-40 mt-0.5 tracking-[0.15em] font-mono">Strategic Geographic Intelligence Hub</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Telemetry, Theme, Profile */}
            <div className="flex items-center gap-3 h-full">
                {/* Live Clock */}
                <div className="hidden xl:flex items-center gap-4 px-4 h-10 border border-border bg-muted/5 font-mono">
                    <div className="flex flex-col items-end opacity-50">
                        <span className="text-[6px] font-black uppercase tracking-widest leading-none text-foreground">Hora_Local</span>
                        <span className="text-[10px] font-black text-primary mt-0.5">
                            {mounted ? currentTime.toLocaleTimeString([], { hour12: false }) : '--:--:--'}
                        </span>
                    </div>
                    <div className="w-px h-5 bg-border" />
                    <div className="flex flex-col items-end opacity-80">
                        <span className="text-[6px] font-black uppercase tracking-widest leading-none text-cyan-400">Security_Score</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <ShieldCheck className="w-2.5 h-2.5 text-cyan-400" />
                            <span className="text-[9px] font-black text-cyan-400 font-mono">100% SECURE</span>
                        </div>
                    </div>
                    <div className="w-px h-5 bg-border/30" />
                    <div className="flex flex-col items-end opacity-80">
                        <span className="text-[6px] font-black uppercase tracking-widest leading-none text-foreground">Out_Nodes</span>
                        <div className="flex gap-1 mt-0.5">
                            <span className="text-[8px] font-mono text-emerald-500">VPN</span>
                            <span className="text-[8px] font-mono text-cyan-500">TOR</span>
                            <span className="text-[8px] font-mono text-amber-500">DNS</span>
                        </div>
                    </div>
                    <div className="w-px h-5 bg-border/30" />
                    <div className="flex flex-col items-end opacity-30">
                        <span className="text-[6px] font-black uppercase tracking-widest leading-none text-foreground">Rede</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Wifi className="w-2.5 h-2.5 text-foreground" />
                            <span className="text-[8px] font-black text-foreground">ESTÁVEL</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 h-10">
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="tactical-btn h-full px-4 border-border bg-muted/20 text-[8px] text-foreground"
                    >
                        {mounted && theme === 'dark' ? 'MODO_CLARO' : 'MODO_ESCURO'}
                    </button>

                    <button className="flex items-center gap-3 h-full px-4 bg-foreground text-background hover:opacity-90 transition-all">
                        <div className="flex flex-col items-end leading-none">
                            <span className="text-[8px] font-black uppercase tracking-widest hidden lg:inline">Admin</span>
                            <span className="text-[6px] font-bold uppercase tracking-[0.1em] hidden lg:inline opacity-50 font-mono">OKS-ADMIN</span>
                        </div>
                        <div className="w-7 h-7 rounded-none overflow-hidden bg-background/10 flex items-center justify-center text-[9px] font-black border border-background/20">
                            AO
                        </div>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="tactical-btn h-full px-4 border-l border-border bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                        title="Encerrar Sessão"
                    >
                        <LogOut className="w-3 h-3" />
                        <span className="text-[8px] font-black uppercase tracking-widest hidden lg:inline">Sair</span>
                    </button>
                </div>
            </div>
        </header>
    );
};
