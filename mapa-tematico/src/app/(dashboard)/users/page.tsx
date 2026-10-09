'use client';

import React, { useState } from 'react';
import { useUsers, useUserStats, useSuspendUser, useActivateUser, useBanUser, useCreateUser, useDeleteUser, useUserHistory, useUser } from '@/hooks/use-users';
import type { MTNIUser, UserFilters } from '@/lib/services/user.service';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { User, ShieldCheck, Mail, MapPin, Clock, Fingerprint, RefreshCcw, UserMinus, ShieldAlert, History, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UsersPage() {
    const [filters, setFilters] = useState<UserFilters>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newUserData, setNewUserData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'OPERADOR_CENTRAL',
        lat: -8.8390,
        lng: 13.2894
    });

    const { data: usersData, isLoading } = useUsers({ ...filters, search: searchQuery });
    const { data: stats } = useUserStats();
    const { data: userHistory } = useUserHistory(selectedUser?.id);

    const users = Array.isArray(usersData) ? usersData : (usersData as any)?.data || [];
    const suspendUser = useSuspendUser();
    const activateUser = useActivateUser();
    const banUser = useBanUser();
    const createUser = useCreateUser();
    const deleteUser = useDeleteUser();

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        createUser.mutate(newUserData, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setNewUserData({ 
                    name: '', 
                    email: '', 
                    password: '', 
                    role: 'OPERADOR_CENTRAL',
                    lat: -8.8390,
                    lng: 13.2894
                });
            }
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5';
            case 'SUSPENDED': return 'text-amber-500 border-amber-500/30 bg-amber-500/5';
            case 'BANNED': return 'text-red-500 border-red-500/30 bg-red-500/5';
            default: return 'text-muted-foreground border-border bg-muted/10';
        }
    };

    return (
        <>
            <div className="flex gap-px bg-border border border-border min-h-[calc(100vh-12rem)] relative overflow-hidden">
            {/* Main List Area */}
            <div className={cn("bg-background flex flex-col transition-all duration-500", selectedUser ? "w-full lg:w-3/5" : "w-full")}>
                
                {/* Tactical Header */}
                <div className="p-8 border-b border-border bg-muted/10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">OKUSANGA_SECURE_AUTH</span>
                            </div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter">Matriz de Operadores</h1>
                        </div>
                        
                        <div className="flex gap-4">
                            <div className="relative group">
                                <input 
                                    type="text"
                                    placeholder="FILTRAR_IDENTIDADE_Z..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-muted/30 border border-border px-4 py-2 text-[9px] font-mono outline-none focus:border-primary/50 transition-all w-64 group-hover:bg-muted/50"
                                />
                                <Fingerprint className="absolute right-3 top-2.5 w-3 h-3 opacity-20 pointer-events-none group-focus-within:opacity-100 group-focus-within:text-primary transition-all" />
                            </div>

                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="tactical-btn bg-primary text-primary-foreground px-6 py-2 text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                            >
                                <User className="w-3 h-3" /> NOVO_OPERADOR_Z
                            </button>
                            
                            <div className="flex border border-border bg-background p-1">
                                {['Todos', 'ACTIVE', 'SUSPENDED'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setFilters({ ...filters, status: s === 'Todos' ? undefined : s as any })}
                                        className={cn("px-4 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all", 
                                        (filters.status === s || (s === 'Todos' && !filters.status)) ? "bg-foreground text-background" : "hover:bg-muted opacity-40")}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Grid/List */}
                <div className="flex-1 overflow-y-auto scrollbar-hide divide-y divide-border/30">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center py-20">
                            <Activity className="w-8 h-8 text-primary animate-spin opacity-20" />
                        </div>
                    ) : (
                        users.map((user: any) => (
                            <motion.div 
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className={cn("p-6 cursor-pointer transition-all border-l-4", 
                                selectedUser?.id === user.id ? "bg-primary/5 border-primary" : "border-transparent hover:bg-muted/30 hover:border-border")}
                            >
                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-none border border-border bg-muted flex items-center justify-center group-hover:bg-primary transition-colors">
                                            <User className={cn("w-5 h-5", selectedUser?.id === user.id ? "text-primary" : "opacity-30")} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[14px] font-black uppercase tracking-tight">{user.name}</span>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[8px] font-mono opacity-40">{user.email}</span>
                                                <div className="w-1 h-1 rounded-full bg-border" />
                                                <span className="text-[8px] font-black uppercase tracking-widest text-primary/60">{user.role}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={cn("px-3 py-1 border text-[7px] font-black uppercase tracking-[0.2em] h-fit", getStatusColor(user.status))}>
                                        {user.status}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Tactical Detail Sidebar */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 30, stiffness: 200 }}
                        className="hidden lg:flex flex-col w-2/5 bg-muted/30 border-l border-border backdrop-blur-xl z-20"
                    >
                        {/* User Profile Header */}
                        <div className="p-8 border-b border-border bg-background/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                            
                            <button 
                                onClick={() => setSelectedUser(null)}
                                className="absolute top-6 right-6 p-2 hover:bg-muted transition-colors"
                            >
                                <RefreshCcw className="w-4 h-4 opacity-40 rotate-45" />
                            </button>

                            <div className="flex flex-col items-center text-center space-y-4 pt-4">
                                <div className="w-24 h-24 rounded-none border-2 border-primary/50 p-1">
                                    <div className="w-full h-full bg-muted flex items-center justify-center relative overflow-hidden">
                                        <User className="w-12 h-12 opacity-20" />
                                        <div className="absolute inset-0 bg-tactical-grid opacity-10" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">{selectedUser.name}</h2>
                                    <div className="flex items-center justify-center gap-2 mt-2">
                                        <Fingerprint className="w-3 h-3 text-primary/40" />
                                        <span className="text-[9px] font-mono opacity-40 uppercase tracking-widest">UID_{selectedUser.id.substring(0, 12)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tactical Stats Matrix */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                            
                            {/* Operational Status */}
                            <div className="space-y-4">
                                <span className="text-[8px] font-black uppercase tracking-[0.5em] opacity-30 flex items-center gap-2">
                                    <Activity className="w-3 h-3" /> Estado_Operacional
                                </span>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 border border-border bg-background flex flex-col gap-2">
                                        <span className="text-[7px] font-black uppercase opacity-40">Último_Acesso</span>
                                        <span className="text-[11px] font-black font-mono">2026-03-29 22:14:02_Z</span>
                                    </div>
                                    <div className="p-4 border border-border bg-background flex flex-col gap-2">
                                        <span className="text-[7px] font-black uppercase opacity-40">IP_Vector</span>
                                        <span className="text-[11px] font-black font-mono">197.231.14.22</span>
                                    </div>
                                </div>
                            </div>

                            {/* Location Proxy Map */}
                            <div className="space-y-4">
                                <span className="text-[8px] font-black uppercase tracking-[0.5em] opacity-30 flex items-center gap-2">
                                    <MapPin className="w-3 h-3" /> Localização_Dispositivo
                                </span>
                                <div className="h-32 bg-muted relative border border-border flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 bg-tactical-grid opacity-20" />
                                    <div className="relative">
                                        <div className="absolute -inset-8 border border-primary/30 rounded-full animate-ping" />
                                        <MapPin className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="absolute bottom-2 left-3 flex flex-col">
                                        <span className="text-[6px] font-black uppercase text-primary">Sector: REGIONAL_SYNC</span>
                                        <span className="text-[10px] font-mono font-black italic opacity-40">{selectedUser.lat?.toFixed(4) || '-8.8390'}, {selectedUser.lng?.toFixed(4) || '13.2894'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Security Controls */}
                            <div className="space-y-4">
                                <span className="text-[8px] font-black uppercase tracking-[0.5em] opacity-30 flex items-center gap-2">
                                    <ShieldAlert className="w-3 h-3" /> Protocolos_de_Segurança
                                </span>
                                <div className="flex flex-col gap-2">
                                    {selectedUser.status === 'ACTIVE' && (
                                        <button 
                                            onClick={() => {
                                                if(confirm(`AUTORIZAR SUSPENSÃO DO OPERADOR ${selectedUser.name}?`)) {
                                                    suspendUser.mutate({ id: selectedUser.id });
                                                    setSelectedUser({...selectedUser, status: 'SUSPENDED'});
                                                }
                                            }}
                                            className="w-full py-4 bg-amber-500 text-background text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center justify-center gap-3"
                                        >
                                            <UserMinus className="w-4 h-4" /> Revogar Acesso Temporário
                                        </button>
                                    )}
                                    {selectedUser.status === 'SUSPENDED' && (
                                        <button 
                                            onClick={() => {
                                                activateUser.mutate(selectedUser.id);
                                                setSelectedUser({...selectedUser, status: 'ACTIVE'});
                                            }}
                                            className="w-full py-4 bg-emerald-500 text-background text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
                                        >
                                            <ShieldCheck className="w-4 h-4" /> Restaurar Acesso Operacional
                                        </button>
                                    )}
                                    <button className="w-full py-4 border border-border hover:bg-muted text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                                        <RefreshCcw className="w-4 h-4" /> Gerar Nova Credencial
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if(confirm(`!!! ALERTA CRÍTICO !!!\nREMOVER PERMANENTEMENTE O OPERADOR ${selectedUser.name}?\nESTA AÇÃO NÃO PODE SER DESFEITA.`)) {
                                                deleteUser.mutate(selectedUser.id, {
                                                    onSuccess: () => setSelectedUser(null)
                                                });
                                            }
                                        }}
                                        className="w-full py-4 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3"
                                    >
                                        <ShieldAlert className="w-4 h-4" /> ELIMINAR_REGISTO_Z
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* System Logs Preview */}
                        <div className="p-8 border-t border-border space-y-4">
                            <span className="text-[8px] font-black uppercase tracking-[0.5em] opacity-30 flex items-center gap-2">
                                <History className="w-3 h-3" /> Histórico_Atividade
                            </span>
                            <div className="space-y-3">
                                {userHistory && userHistory.length > 0 ? (
                                    userHistory.map((log: any) => (
                                        <div key={log.id} className="flex gap-4 p-3 border-l border-primary/20 bg-muted/5 group hover:bg-muted/10 transition-colors">
                                            <Activity className="w-3 h-3 opacity-30 mt-1 group-hover:text-primary group-hover:opacity-100 transition-all" />
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold uppercase tracking-tight">{log.action}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[7px] font-mono opacity-40 uppercase">{new Date(log.createdAt).toLocaleString()}</span>
                                                    <span className="text-[7px] font-mono text-primary/60 uppercase">[{log.resource}]</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-[8px] font-mono opacity-40 italic py-4">NENHUMA ATIVIDADE REGISTRADA_</div>
                                )}
                            </div>
                        </div>

                        {/* Footer Log */}
                        <div className="p-6 bg-background border-t border-border flex justify-between items-center opacity-40 text-[7px] font-black uppercase tracking-widest leading-none">
                            <span className="flex items-center gap-2">
                                <History className="w-2.5 h-2.5" /> Log de Auditoria: L06_AUTH_SYNC
                            </span>
                            <span>VERIFICADO</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Create User Modal Overlay */}
        <AnimatePresence>
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCreateModalOpen(false)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-background border border-border shadow-2xl p-8 space-y-8"
                    >
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-primary" />
                                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-primary/60">SISTEMA_IDENTIDADE</span>
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Registrar Operador</h2>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[7px] font-black uppercase tracking-widest opacity-40">Identificação_Nome</label>
                                <input 
                                    required
                                    className="w-full bg-muted/30 border border-border p-3 text-xs outline-none focus:border-primary transition-all font-mono"
                                    placeholder="NOME_COMPLETO..."
                                    value={newUserData.name}
                                    onChange={e => setNewUserData({...newUserData, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[7px] font-black uppercase tracking-widest opacity-40">Endereço_Comunicacao</label>
                                <input 
                                    required
                                    type="email"
                                    className="w-full bg-muted/30 border border-border p-3 text-xs outline-none focus:border-primary transition-all font-mono"
                                    placeholder="operador@okusanga.ao"
                                    value={newUserData.email}
                                    onChange={e => setNewUserData({...newUserData, email: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[7px] font-black uppercase tracking-widest opacity-40">Chave_Acesso</label>
                                    <input 
                                        required
                                        type="password"
                                        className="w-full bg-muted/30 border border-border p-3 text-xs outline-none focus:border-primary transition-all font-mono"
                                        placeholder="********"
                                        value={newUserData.password}
                                        onChange={e => setNewUserData({...newUserData, password: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[7px] font-black uppercase tracking-widest opacity-40">Hierarquia_Acesso</label>
                                    <select 
                                        className="w-full bg-muted/30 border border-border p-3 text-xs outline-none focus:border-primary transition-all font-mono"
                                        value={newUserData.role}
                                        onChange={e => setNewUserData({...newUserData, role: e.target.value as any})}
                                    >
                                        <option value="OPERADOR_CENTRAL">OPERADOR_C1</option>
                                        <option value="ADMIN_REGIONAL">PROVINCIAL</option>
                                        <option value="AGENTE_CAMPO">CAMPO_ALPHA</option>
                                        <option value="SUPER_ADMIN">SUPER_ZULU</option>
                                    </select>
                                </div>
                            </div>

                            {/* Geolocalização de Registo */}
                            <div className="space-y-4 p-5 border border-primary/20 bg-primary/5">
                                <span className="text-[7px] font-black uppercase tracking-[0.4em] opacity-60 flex items-center gap-2 text-primary">
                                    <MapPin className="w-3.5 h-3.5" /> Vetores_Geolocalização_Z
                                </span>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[6px] font-mono font-black opacity-40 uppercase">Latitude</label>
                                        <input 
                                            type="number"
                                            step="any"
                                            className="w-full bg-background border border-border p-2 text-[10px] font-mono font-black outline-none focus:border-primary transition-all text-primary"
                                            value={newUserData.lat}
                                            onChange={e => setNewUserData({...newUserData, lat: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[6px] font-mono font-black opacity-40 uppercase">Longitude</label>
                                        <input 
                                            type="number"
                                            step="any"
                                            className="w-full bg-background border border-border p-2 text-[10px] font-mono font-black outline-none focus:border-primary transition-all text-primary"
                                            value={newUserData.lng}
                                            onChange={e => setNewUserData({...newUserData, lng: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="button"
                                    onClick={() => {
                                        // Ponto central simulado para Luanda
                                        setNewUserData({...newUserData, lat: -8.8390, lng: 13.2894});
                                        toast({
                                            title: 'GPS_SYNC_OK',
                                            description: 'Coordenadas redefinidas para o comando central.',
                                        });
                                    }}
                                    className="w-full py-2 border border-primary/30 text-[7px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Activity className="w-3 h-3 text-primary animate-pulse" /> SINCRONIZAR_GPS_ATUAL
                                </button>
                            </div>

                            <div className="pt-6 grid grid-cols-2 gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="w-full py-4 border border-border text-[9px] font-black uppercase tracking-widest hover:bg-muted transition-all"
                                >
                                    ABORTAR
                                </button>
                                <button 
                                    disabled={createUser.isPending}
                                    className="w-full py-4 bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50"
                                >
                                    {createUser.isPending ? 'PROCESSANDO...' : 'CONFIRMAR_REGISTO'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
        </>
    );
}
