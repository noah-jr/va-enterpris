'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Settings, Check, Globe, Bell, Shield, User } from 'lucide-react';
import { useExportReport } from '@/hooks/use-reports';
import { useProfile, useUpdateProfile } from '@/hooks/use-auth';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { data: profile } = useProfile();
    const updateProfile = useUpdateProfile();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [accentColor, setAccentColor] = useState('blue');
    const [notifications, setNotifications] = useState(true);
    const [mounted, setMounted] = useState(false);
    const exportReport = useExportReport();

    useEffect(() => {
        setMounted(true);
        if (profile) {
            setName(profile.name || '');
            setEmail(profile.email || '');
            setPhone(profile.phone || '');
        }

        // Recuperar e aplicar acento
        const savedAccent = localStorage.getItem('mtni-accent-color') || 'blue';
        setAccentColor(savedAccent);
        document.documentElement.setAttribute('data-accent', savedAccent);
    }, [profile]);

    const handleAccentChange = (color: string) => {
        setAccentColor(color);
        localStorage.setItem('mtni-accent-color', color);
        document.documentElement.setAttribute('data-accent', color);
    };

    const handleSaveProfile = () => {
        updateProfile.mutate({ name, email, phone });
    };

    return (
        <div className="flex flex-col gap-8 w-full pb-20 p-8">
            {/* Header Hub */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b-2 border-border pb-8 relative">
                <div className="absolute top-0 right-0 opacity-[0.01] pointer-events-none font-black text-[80px] leading-none -translate-y-1/4 select-none">CONFIGURAÇÃO_MTNI</div>

                <div className="space-y-3 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-1 bg-foreground" />
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Configurações do Sistema</h1>
                    </div>
                    <div className="flex gap-6 font-tactical">
                        <div className="flex items-center gap-2">
                            <span className="text-foreground/40 text-[8px] font-black uppercase tracking-[0.3em]">MTNI_ADMIN_NACIONAL</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground border-l border-border pl-6">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30">SEGURANÇA_ESTATAL_AN</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* General Settings */}
                <div className="bg-card border border-border flex flex-col">
                    <div className="p-6 border-b border-border bg-muted/20 flex items-center gap-3">
                        <Settings className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Configurações Gerais</span>
                    </div>
                    <div className="p-8 space-y-8">
                        {/* Theme Toggle */}
                        <div className="flex flex-col gap-4">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Tema do Sistema</span>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={cn(
                                        "flex-1 p-4 border flex items-center justify-center gap-2 transition-all font-tactical uppercase text-[9px] font-black tracking-widest",
                                        (mounted && theme === 'light') ? "bg-foreground text-background border-foreground" : "bg-transparent border-border hover:bg-muted"
                                    )}
                                >
                                    MODO_CLARO
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={cn(
                                        "flex-1 p-4 border flex items-center justify-center gap-2 transition-all font-tactical uppercase text-[9px] font-black tracking-widest",
                                        (mounted && theme === 'dark') ? "bg-foreground text-background border-foreground" : "bg-transparent border-border hover:bg-muted"
                                    )}
                                >
                                    MODO_ESCURO
                                </button>
                            </div>
                        </div>

                        {/* Accent Color Selection */}
                        <div className="flex flex-col gap-4">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Paleta de Destaque (Vetor de Operações)</span>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { name: 'AZUL_GEOSPACE', value: 'blue', color: 'bg-blue-500' },
                                    { name: 'ESMERALDA_Z', value: 'emerald', color: 'bg-emerald-500' },
                                    { name: 'AMBAR_ALERTA', value: 'amber', color: 'bg-amber-500' },
                                    { name: 'VIOLETA_CYBER', value: 'violet', color: 'bg-violet-500' },
                                    { name: 'ROSA_CRITICO', value: 'rose', color: 'bg-rose-500' },
                                    { name: 'SLATE_TACTICAL', value: 'slate', color: 'bg-slate-500' }
                                ].map((accent) => (
                                    <button
                                        key={accent.value}
                                        className="flex flex-col gap-2 group"
                                        onClick={() => handleAccentChange(accent.value)}
                                    >
                                        <div className={cn(
                                            "w-full h-12 border border-border transition-all flex items-center justify-center relative",
                                            accentColor === accent.value ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'
                                        )}>
                                            <div className={cn("w-3 h-3 rounded-full", accent.color)} />
                                            {accentColor === accent.value && (
                                                <div className="absolute top-1 right-1">
                                                    <Check className="w-2 h-2 text-primary" />
                                                </div>
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-[6px] font-black uppercase tracking-widest transition-opacity",
                                            accentColor === accent.value ? "opacity-100 text-primary" : "opacity-40 group-hover:opacity-100"
                                        )}>{accent.name}</span>
                                    </button>
                                ))}
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
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-50">Notificar novos alertas de risco</span>
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
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Relatórios & Exportação</span>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex flex-col gap-2">
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Dados Estratégicos</span>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => exportReport.mutate({ type: 'database', format: 'csv' })}
                                        disabled={exportReport.isPending}
                                        className="tactical-btn hover:border-primary transition-all disabled:opacity-50"
                                    >
                                        EXPORTAR_CSV
                                    </button>
                                    <button
                                        onClick={() => exportReport.mutate({ type: 'database', format: 'xlsx' })}
                                        disabled={exportReport.isPending}
                                        className="tactical-btn hover:border-primary transition-all disabled:opacity-50"
                                    >
                                        EXPORTAR_XLSX
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Dados Sociais (Educação/Saúde)</span>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => exportReport.mutate({ type: 'financial', format: 'csv' })}
                                        disabled={exportReport.isPending}
                                        className="tactical-btn hover:border-primary transition-all disabled:opacity-50"
                                    >
                                        DADOS_SOCIAIS_CSV
                                    </button>
                                    <button
                                        onClick={() => exportReport.mutate({ type: 'financial', format: 'xlsx' })}
                                        disabled={exportReport.isPending}
                                        className="tactical-btn hover:border-primary transition-all disabled:opacity-50"
                                    >
                                        DADOS_SOCIAIS_XLSX
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border flex flex-col opacity-60">
                        <div className="p-6 border-b border-border bg-muted/20 flex items-center gap-3">
                            <Shield className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Segurança (MTNI_SISTEM_GOV)</span>
                        </div>
                        <div className="p-8 flex flex-col gap-4">
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest border-b border-border/50 pb-2">
                                <span>Patamar de Acesso</span>
                                <span>Administrador Nacional</span>
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest border-b border-border/50 pb-2">
                                <span>Criptografia_Base</span>
                                <span>AES-256_SHA512</span>
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                <span>Sincronização_ZULU</span>
                                <span>{mounted ? new Date().toLocaleString('pt-AO') : '--/--/----'}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
