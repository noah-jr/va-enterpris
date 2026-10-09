'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLogout } from '@/hooks/use-auth';
import authService from '@/lib/services/auth.service';
import { LogOut, Settings } from 'lucide-react';

const menuItems = [
    { label: 'Centro de Operações', href: '/dashboard', id: 'OPS', status: 'SINCRONIZADO', sector: 'ALPHA', roles: ['SUPER_ADMIN', 'ADMIN_REGIONAL', 'OPERADOR_GEOSPACE'] },
    { label: 'Mapa Tático', href: '/monitoring', id: 'MAP', status: 'AO_VIVO', sector: 'ALPHA', roles: ['SUPER_ADMIN', 'ADMIN_REGIONAL', 'OPERADOR_GEOSPACE', 'COORDENADOR_EMPRESA', 'AGENTE_CAMPO'] },
    { label: 'Gestão de Unidades', href: '/units', id: 'UNT', status: 'ATIVO', sector: 'BRAVO', roles: ['SUPER_ADMIN', 'ADMIN_REGIONAL'] },
    { label: 'Vias de Acesso', href: '/routes', id: 'VIA', status: 'MONITORADO', sector: 'BRAVO', roles: ['SUPER_ADMIN', 'ADMIN_REGIONAL', 'OPERADOR_GEOSPACE', 'COORDENADOR_EMPRESA'] },
    { label: 'Densidade Populacional', href: '/density', id: 'DEN', status: 'HEATMAP', sector: 'CHARLIE', roles: ['SUPER_ADMIN', 'ADMIN_REGIONAL'] },
    { label: 'Tráfego em Tempo Real', href: '/traffic', id: 'TRF', status: 'REAL_TIME', sector: 'CHARLIE', roles: ['SUPER_ADMIN', 'ADMIN_REGIONAL', 'OPERADOR_GEOSPACE'] },
    { label: 'Incidentes', href: '/incidents', id: 'INC', status: 'ALERTAS', sector: 'DELTA', roles: ['SUPER_ADMIN', 'ADMIN_REGIONAL', 'OPERADOR_GEOSPACE', 'COORDENADOR_EMPRESA', 'AGENTE_CAMPO'] },
    { label: 'Inteligência Artificial', href: '/ai-intelligence', id: 'A.I.', status: 'PREDITIVO', sector: 'DELTA', roles: ['SUPER_ADMIN', 'ADMIN_REGIONAL'] },
    { label: 'Gestão de Entidades', href: '/companies', id: 'ENT', status: 'GERIDO', sector: 'ECHO', roles: ['SUPER_ADMIN', 'ADMIN_REGIONAL'] },
    { label: 'Utilizadores & RBAC', href: '/users', id: 'USRS', status: 'SEGURO', sector: 'ECHO', roles: ['SUPER_ADMIN'] },
    { label: 'Relatórios Estratégicos', href: '/reports', id: 'RPT', status: 'DISPONÍVEL', sector: 'FOXTROT', roles: ['SUPER_ADMIN', 'ADMIN_REGIONAL'] },
    { label: 'Audit Logs', href: '/audit-logs', id: 'AUDT', status: 'SEGURO', sector: 'FOXTROT', roles: ['SUPER_ADMIN'] },
    { label: 'Definições do Sistema', href: '/settings', id: 'CFG', status: 'OPERACIONAL', sector: 'GOLF', roles: ['SUPER_ADMIN'] },
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
        if (confirm('Encerrar sessão GEOSPACE e desconectar do sistema?')) {
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
            <div className="flex-1">
                {sectors.map(sector => (
                    <div key={sector}>
                        <div className="px-8 py-3 bg-muted/30 border-b border-border/50">
                            <span className="text-[7px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60 font-mono">
                                SETOR_{sector}
                            </span>
                        </div>
                        {filteredMenuItems.filter(i => i.sector === sector).map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onItemClick}
                                    className={cn(
                                        "flex flex-col gap-0.5 px-8 py-6 border-b border-border group transition-all relative overflow-hidden",
                                        isActive ? "bg-foreground text-background" : "hover:bg-muted/50"
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
                                            isActive && "bg-background"
                                        )} />
                                        <span className={cn(
                                            "text-[7px] font-black font-mono uppercase tracking-[0.3em] opacity-40",
                                            isActive && "opacity-60"
                                        )}>
                                            MDL_{item.id}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between z-10">
                                        <div className="flex flex-col">
                                            <span className="text-[17px] font-black uppercase tracking-tight leading-none">{item.label}</span>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className={cn(
                                                    "text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 border border-border",
                                                    isActive ? "border-background/20 text-background" : "text-muted-foreground"
                                                )}>
                                                    {item.status}
                                                </span>
                                                <div className={cn(
                                                    "w-6 h-px bg-border group-hover:w-12 transition-all duration-300",
                                                    isActive && "bg-background w-20"
                                                )} />
                                            </div>
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
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleLogout}
                            className="text-[8px] font-black uppercase tracking-[0.4em] text-red-500 hover:opacity-100 opacity-60 transition-opacity inline-flex items-center gap-2 group"
                        >
                            <LogOut className="w-3 h-3" />
                            <span>TERMINAR_SESSÃO</span>
                        </button>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[7px] font-black uppercase tracking-widest text-muted-foreground opacity-30">
                            <span>OKUSANGA_v2.0</span>
                            <span>AO_VIVO</span>
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
