'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Settings, Check, Globe, Bell, Shield, User } from 'lucide-react';
import { useExportReport } from '@/hooks/use-reports';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [language, setLanguage] = useState('pt');
    const [notifications, setNotifications] = useState(true);
    const [mounted, setMounted] = useState(false);
    const exportReport = useExportReport();

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="flex flex-col gap-8 w-full pb-20 p-8">
            {/* Header Hub */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b-2 border-border pb-8 relative">
                <div className="absolute top-0 right-0 opacity-[0.01] pointer-events-none font-black text-[80px] leading-none -translate-y-1/4 select-none">CONFIGURAÇÃO</div>

                <div className="space-y-3 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-1 bg-foreground" />
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Configurações do Sistema</h1>
                    </div>
                    <div className="flex gap-6 font-tactical">
                        <div className="flex items-center gap-2">
                            <span className="text-foreground/40 text-[8px] font-black uppercase tracking-[0.3em]">GEOSPACE_ADMIN</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground border-l border-border pl-6">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30">PNA_SECURE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Interface Settings */}
                <div className="bg-card border border-border flex flex-col">
                    <div className="p-6 border-b border-border bg-muted/20 flex items-center gap-3">
                        <Globe className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Interface & Idioma</span>
                    </div>
                    <div className="p-8 space-y-8">
                        <div className="flex flex-col gap-4">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Tema do Sistema</span>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={cn(
                                        "flex-1 p-4 border flex items-center justify-center gap-2 transition-all font-tactical uppercase text-[9px] font-black tracking-widest",
                                        theme === 'light' ? "bg-foreground text-background border-foreground" : "bg-transparent border-border hover:bg-muted"
                                    )}
                                >
                                    CLARO
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={cn(
                                        "flex-1 p-4 border flex items-center justify-center gap-2 transition-all font-tactical uppercase text-[9px] font-black tracking-widest",
                                        theme === 'dark' ? "bg-foreground text-background border-foreground" : "bg-transparent border-border hover:bg-muted"
                                    )}
                                >
                                    ESCURO
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Idioma</span>
                            <div className="grid grid-cols-2 gap-px bg-border border border-border">
                                <button
                                    onClick={() => setLanguage('pt')}
                                    className={cn(
                                        "p-4 bg-background flex items-center justify-between hover:bg-muted/50 transition-all",
                                        language === 'pt' && "bg-muted/20"
                                    )}
                                >
                                    <span className="text-[10px] font-bold uppercase">Português (AO)</span>
                                    {language === 'pt' && <Check className="w-3 h-3" />}
                                </button>
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={cn(
                                        "p-4 bg-background flex items-center justify-between hover:bg-muted/50 transition-all opacity-50",
                                        language === 'en' && "bg-muted/20 opacity-100"
                                    )}
                                >
                                    <span className="text-[10px] font-bold uppercase">English (US)</span>
                                    {language === 'en' && <Check className="w-3 h-3" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications & Security */}
                <div className="space-y-8">
                    <div className="bg-card border border-border flex flex-col">
                        <div className="p-6 border-b border-border bg-muted/20 flex items-center gap-3">
                            <Bell className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Notificações</span>
                        </div>
                        <div className="p-8">
                            <div className="flex items-center justify-between p-4 border border-border bg-background">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase">Alertas em Tempo Real</span>
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-50">Notificar novas emergências</span>
                                </div>
                                <button
                                    onClick={() => setNotifications(!notifications)}
                                    className={cn(
                                        "w-10 h-5 relative transition-colors border border-border",
                                        notifications ? "bg-foreground" : "bg-muted"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute top-0.5 w-3.5 h-3.5 bg-background transition-transform",
                                        notifications ? "left-[calc(100%-1.1rem)]" : "left-0.5"
                                    )} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border flex flex-col">
                        <div className="p-6 border-b border-border bg-muted/20 flex items-center gap-3">
                            <Shield className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Relatórios & Backup</span>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex flex-col gap-2">
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Base de Dados Completa</span>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => exportReport.mutate({ type: 'database', format: 'csv' })}
                                        disabled={exportReport.isPending}
                                        className="tactical-btn hover:border-primary transition-all disabled:opacity-50"
                                    >
                                        EXPORTAR CSV
                                    </button>
                                    <button
                                        onClick={() => exportReport.mutate({ type: 'database', format: 'xlsx' })}
                                        disabled={exportReport.isPending}
                                        className="tactical-btn hover:border-primary transition-all disabled:opacity-50"
                                    >
                                        EXPORTAR EXCEL
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Relatórios Financeiros</span>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => exportReport.mutate({ type: 'financial', format: 'csv' })}
                                        disabled={exportReport.isPending}
                                        className="tactical-btn hover:border-primary transition-all disabled:opacity-50"
                                    >
                                        FINANCEIRO CSV
                                    </button>
                                    <button
                                        onClick={() => exportReport.mutate({ type: 'financial', format: 'xlsx' })}
                                        disabled={exportReport.isPending}
                                        className="tactical-btn hover:border-primary transition-all disabled:opacity-50"
                                    >
                                        FINANCEIRO EXCEL
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border flex flex-col opacity-60">
                        <div className="p-6 border-b border-border bg-muted/20 flex items-center gap-3">
                            <Shield className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Segurança (GEOSPACE/PNA)</span>
                        </div>
                        <div className="p-8 flex flex-col gap-4">
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest border-b border-border/50 pb-2">
                                <span>Nível de Acesso</span>
                                <span>Administrador</span>
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest border-b border-border/50 pb-2">
                                <span>Criptografia</span>
                                <span>AES-256</span>
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                <span>Último Login</span>
                                <span>{mounted ? new Date().toLocaleString('pt-AO') : '--/--/----'}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
