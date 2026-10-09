'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLogout } from '@/hooks/use-auth';
import authService from '@/lib/services/auth.service';
import { LogOut, Settings, LayoutDashboard, Globe, GraduationCap, HeartPulse, Users, AlertTriangle, Brain, Shield, FileText } from 'lucide-react';

const menuItems = [
    { label: 'Visão Geral (OKUSANGA)', href: '/dashboard', id: 'OKS', sector: 'VISÃO GERAL', roles: ['SUPER_ADMIN', 'ADMIN_NACIONAL', 'ADMIN_PROVINCIAL', 'ADMIN_MUNICIPAL', 'ADMIN_DISTRITAL', 'ADMIN_COMUNA', 'OPERADOR'] },
    { label: 'Mapa Regional', href: '/map', id: 'MAPA', sector: 'VISÃO GERAL', roles: ['SUPER_ADMIN', 'ADMIN_NACIONAL', 'ADMIN_PROVINCIAL', 'ADMIN_MUNICIPAL', 'ADMIN_DISTRITAL', 'ADMIN_COMUNA', 'OPERADOR'] },
    
    // Módulos com CRUD
    { label: 'Educação / Escolas', href: '/education', id: 'EDUC', sector: 'MÓDULOS TEMÁTICOS', roles: ['SUPER_ADMIN', 'ADMIN_NACIONAL', 'ADMIN_PROVINCIAL', 'ADMIN_MUNICIPAL', 'ADMIN_DISTRITAL', 'ADMIN_COMUNA'] },
    { label: 'Gestão Escolar', href: '/education/manage', id: 'G.ED', sector: 'MÓDULOS TEMÁTICOS', roles: ['SUPER_ADMIN', 'ADMIN_NACIONAL', 'ADMIN_PROVINCIAL'] },
    
    { label: 'Saúde / Hospitais', href: '/health', id: 'SAUD', sector: 'MÓDULOS TEMÁTICOS', roles: ['SUPER_ADMIN', 'ADMIN_NACIONAL', 'ADMIN_PROVINCIAL', 'ADMIN_MUNICIPAL', 'ADMIN_DISTRITAL', 'ADMIN_COMUNA'] },
    { label: 'Gestão Hospitalar', href: '/health/manage', id: 'G.SA', sector: 'MÓDULOS TEMÁTICOS', roles: ['SUPER_ADMIN', 'ADMIN_NACIONAL', 'ADMIN_PROVINCIAL'] },
    
    { label: 'Demografia', href: '/demographics', id: 'DEMO', sector: 'MÓDULOS TEMÁTICOS', roles: ['SUPER_ADMIN', 'ADMIN_NACIONAL', 'ADMIN_PROVINCIAL', 'ADMIN_MUNICIPAL', 'ADMIN_DISTRITAL', 'ADMIN_COMUNA'] },
    { label: 'Gestão Demográfica', href: '/demographics/manage', id: 'G.DE', sector: 'MÓDULOS TEMÁTICOS', roles: ['SUPER_ADMIN', 'ADMIN_NACIONAL', 'ADMIN_PROVINCIAL'] },
    
    { label: 'Sinistralidade', href: '/incidents', id: 'SINI', sector: 'MÓDULOS TEMÁTICOS', roles: ['SUPER_ADMIN', 'ADMIN_NACIONAL', 'ADMIN_PROVINCIAL', 'ADMIN_MUNICIPAL', 'ADMIN_DISTRITAL', 'ADMIN_COMUNA', 'OPERADOR'] },
    
    { label: 'Inteligência Cognitiva', href: '/ai-intelligence', id: 'IA', sector: 'FERRAMENTAS IA', roles: ['SUPER_ADMIN', 'ADMIN_NACIONAL', 'ADMIN_PROVINCIAL'] },
    
    { label: 'Gestão de Acessos', href: '/users', id: 'ACES', sector: 'SISTEMA', roles: ['SUPER_ADMIN', 'ADMIN_NACIONAL'] },
    { label: 'Relatórios do Sistema', href: '/reports', id: 'RELO', sector: 'SISTEMA', roles: ['SUPER_ADMIN', 'ADMIN_NACIONAL', 'ADMIN_PROVINCIAL'] },
    { label: 'Definições', href: '/settings', id: 'CFG', sector: 'SISTEMA', roles: ['SUPER_ADMIN', 'ADMIN_NACIONAL'] },
];

interface SidebarProps {
    className?: string;
    isMobile?: boolean;
    onItemClick?: () => void;
}

export const Sidebar = ({ className, onItemClick }: SidebarProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const logout = useLogout();
    const user = authService.getUser();

    const handleLogout = async () => {
        if (confirm('Encerrar sessão MTNI e desconectar do sistema?')) {
            try {
                await logout.mutateAsync();
                router.push('/login');
            } catch (error) {
                console.error('Logout failed:', error);
                window.location.href = '/login';
            }
        }
    };

    const filteredMenuItems = menuItems.filter(item => {
        if (!user) return false;
        return item.roles.includes(user.role);
    });

    const sectors = [...new Set(filteredMenuItems.map(i => i.sector))];

    return (
        <div className={cn("w-full flex flex-col h-full", className)}>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {sectors.map(sector => (
                    <div key={sector}>
                        <div className="px-8 py-3 bg-muted/30 border-b border-border/50">
                            <span className="text-[7px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60 font-mono">
                                SETOR_{sector.replace(' ', '_')}
                            </span>
                        </div>
                        {filteredMenuItems.filter(i => i.sector === sector).map((item) => {
                            const isActive = pathname === item.href;
                            const isParentActive = item.href !== '/dashboard' && pathname?.startsWith(item.href);
                            
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onItemClick}
                                    className={cn(
                                        "flex flex-col gap-0.5 px-8 py-5 border-b border-border group transition-all relative overflow-hidden",
                                        isActive || (isParentActive && !item.href.includes('manage')) ? "bg-foreground text-background" : "hover:bg-muted/50"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute top-2 right-4 font-mono text-[24px] font-black opacity-[0.03] select-none pointer-events-none transition-all",
                                        isActive && "opacity-[0.1]"
                                    )}>
                                        {item.id}
                                    </div>

                                    <div className="flex items-center gap-2 mb-0.5">
                                        <div className={cn(
                                            "w-1 h-1 bg-border rounded-none",
                                            (isActive || isParentActive) && "bg-background"
                                        )} />
                                        <span className={cn(
                                            "text-[7px] font-black font-mono uppercase tracking-[0.3em] opacity-40",
                                            (isActive || isParentActive) && "opacity-60 text-background"
                                        )}>
                                            MDL_{item.id}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between z-10">
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "text-[14px] font-black uppercase tracking-tight leading-none",
                                                item.href.includes('manage') && "opacity-60 text-[12px]"
                                            )}>{item.label}</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="p-8 border-t border-border bg-muted/5 mt-auto">
                <div className="flex flex-col gap-6">
                    <button
                        onClick={handleLogout}
                        className="text-[8px] font-black uppercase tracking-[0.4em] text-red-500 hover:opacity-100 opacity-60 transition-opacity inline-flex items-center gap-2 group"
                    >
                        <LogOut className="w-3 h-3" />
                        <span>TERMINAR_SESSÃO</span>
                    </button>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[7px] font-black uppercase tracking-widest text-muted-foreground opacity-30">
                            <span>MTNI_v1.0.42</span>
                            <span>SINC_ZULU Ativo</span>
                        </div>
                        <div className="w-full h-[1px] bg-border/20">
                            <div className="h-full bg-foreground w-full opacity-40 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
