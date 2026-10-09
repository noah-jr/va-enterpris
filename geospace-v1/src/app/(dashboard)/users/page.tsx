'use client';

import React, { useState } from 'react';
import { useUsers, useUserStats, useSuspendUser, useActivateUser, useBanUser } from '@/hooks/use-users';
import type { GEOSPACEUser, UserFilters } from '@/lib/services/user.service';
import { cn } from '@/lib/utils';

export default function UsersPage() {
    const [filters, setFilters] = useState<UserFilters>({});
    const [selectedUser, setSelectedUser] = useState<GEOSPACEUser | null>(null);

    const { data: usersData, isLoading } = useUsers(filters);
    const { data: stats } = useUserStats();

    // Ensure users is always an array
    const users = Array.isArray(usersData) ? usersData : (usersData as any)?.data || [];
    const suspendUser = useSuspendUser();
    const activateUser = useActivateUser();
    const banUser = useBanUser();

    const handleSuspend = (id: string) => {
        if (confirm('Tem certeza que deseja suspender este usuário?')) {
            suspendUser.mutate({ id });
        }
    };

    const handleActivate = (id: string) => {
        activateUser.mutate(id);
    };

    const handleBan = (id: string) => {
        if (confirm('Tem certeza que deseja banir este usuário? Esta ação é permanente.')) {
            banUser.mutate({ id });
        }
    };

    const getStatusColor = (status: GEOSPACEUser['status']) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-500/20 text-green-500 border-green-500';
            case 'SUSPENDED': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500';
            case 'BANNED': return 'bg-red-500/20 text-red-500 border-red-500';
            default: return 'bg-muted text-muted-foreground border-border';
        }
    };

    const getRoleLabel = (role: GEOSPACEUser['role']) => {
        switch (role) {
            case 'ADMIN': return 'Admin';
            case 'GEOSPACE_ADMIN': return 'Operador';
            case 'DRIVER': return 'Motorista';
            case 'PASSENGER': return 'Passageiro';
            default: return role;
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full pb-20">
            {/* Tactical Header */}
            <div className="border-b border-border pb-8 flex flex-col md:flex-row justify-between items-end gap-8 relative">
                <div className="absolute top-0 right-0 opacity-[0.01] pointer-events-none font-black text-[80px] leading-none -translate-y-1/4 select-none">USUÁRIOS</div>

                <div className="space-y-3 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-1 bg-foreground" />
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Gestão de Usuários</h1>
                    </div>
                    <div className="flex gap-6 font-tactical">
                        {stats && (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="text-foreground/40 text-[8px] font-black uppercase tracking-[0.3em]">Total: {stats.total}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground border-l border-border pl-6">
                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30">Ativos: {stats.active}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex gap-2 z-10">
                    <select
                        className="tactical-btn px-4 text-[9px] bg-background"
                        value={filters.role || ''}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value as any || undefined })}
                    >
                        <option value="">Todos os Perfis</option>
                        <option value="ADMIN">Admin</option>
                        <option value="GEOSPACE_ADMIN">Operador</option>
                        <option value="DRIVER">Motorista</option>
                        <option value="PASSENGER">Passageiro</option>
                    </select>
                    <select
                        className="tactical-btn px-4 text-[9px] bg-background"
                        value={filters.status || ''}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
                    >
                        <option value="">Todos os Status</option>
                        <option value="ACTIVE">Ativo</option>
                        <option value="SUSPENDED">Suspenso</option>
                        <option value="BANNED">Banido</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-border border border-border">
                    <div className="bg-card p-6">
                        <div className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2 font-tactical">Total</div>
                        <div className="text-3xl font-black">{stats.total}</div>
                    </div>
                    <div className="bg-card p-6">
                        <div className="text-[8px] font-black uppercase tracking-[0.3em] text-green-500 mb-2 font-tactical">Ativos</div>
                        <div className="text-3xl font-black text-green-500">{stats.active}</div>
                    </div>
                    <div className="bg-card p-6">
                        <div className="text-[8px] font-black uppercase tracking-[0.3em] text-yellow-500 mb-2 font-tactical">Suspensos</div>
                        <div className="text-3xl font-black text-yellow-500">{stats.suspended}</div>
                    </div>
                    <div className="bg-card p-6">
                        <div className="text-[8px] font-black uppercase tracking-[0.3em] text-red-500 mb-2 font-tactical">Banidos</div>
                        <div className="text-3xl font-black text-red-500">{stats.banned}</div>
                    </div>
                </div>
            )}

            {/* Tactical Data Grid */}
            <div className="border border-border w-full overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-muted/40 h-10 border-b border-border text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em] font-tactical">
                    <div className="col-span-3 flex items-center px-6 border-r border-border">Nome</div>
                    <div className="col-span-3 flex items-center px-6 border-r border-border">Email</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">Perfil</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">Status</div>
                    <div className="col-span-2 flex items-center px-6 justify-end">Ações</div>
                </div>

                {/* Table Content */}
                <div className="divide-y divide-border/20">
                    {isLoading ? (
                        <div className="p-20 text-center opacity-10">
                            <span className="text-[8px] font-black uppercase tracking-[0.5em] font-tactical animate-pulse">Carregando...</span>
                        </div>
                    ) : !users || users.length === 0 ? (
                        <div className="p-20 text-center text-[8px] font-black uppercase text-muted-foreground opacity-20 font-tactical">Nenhum usuário encontrado</div>
                    ) : (
                        users.map((user: any) => (
                            <div key={user.id} className="grid grid-cols-12 h-16 hover:bg-muted/30 group transition-all items-center">
                                <div className="col-span-3 px-6 h-full flex flex-col justify-center border-r border-border/10">
                                    <span className="text-[12px] font-black uppercase tracking-tight truncate">{user.name}</span>
                                    <span className="text-[7px] font-bold opacity-30 uppercase font-tactical mt-0.5">ID: {user.id.substring(0, 8)}</span>
                                </div>
                                <div className="col-span-3 px-6 h-full flex items-center border-r border-border/10">
                                    <span className="text-[10px] truncate">{user.email}</span>
                                </div>
                                <div className="col-span-2 px-6 h-full flex items-center border-r border-border/10">
                                    <div className="h-6 px-3 border border-border text-[8px] font-black uppercase tracking-widest flex items-center">
                                        {getRoleLabel(user.role)}
                                    </div>
                                </div>
                                <div className="col-span-2 px-6 h-full flex items-center border-r border-border/10">
                                    <div className={cn(
                                        "h-6 px-3 border text-[8px] font-black uppercase tracking-widest flex items-center",
                                        getStatusColor(user.status)
                                    )}>
                                        {user.status}
                                    </div>
                                </div>
                                <div className="col-span-2 px-6 h-full flex items-center justify-end gap-2">
                                    {user.status === 'ACTIVE' && (
                                        <button
                                            onClick={() => handleSuspend(user.id)}
                                            className="tactical-btn h-8 px-4 text-[8px] border-yellow-500/40 hover:bg-yellow-500/10"
                                        >
                                            SUSPENDER
                                        </button>
                                    )}
                                    {user.status === 'SUSPENDED' && (
                                        <>
                                            <button
                                                onClick={() => handleActivate(user.id)}
                                                className="tactical-btn h-8 px-4 text-[8px] border-green-500/40 hover:bg-green-500/10"
                                            >
                                                ATIVAR
                                            </button>
                                            <button
                                                onClick={() => handleBan(user.id)}
                                                className="tactical-btn h-8 px-4 text-[8px] border-red-500/40 hover:bg-red-500/10"
                                            >
                                                BANIR
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
