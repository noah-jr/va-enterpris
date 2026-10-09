'use client';

import React, { useState } from 'react';
import { useCompanies, useApproveCompany } from '@/hooks/use-companies';
import { Company } from '@/lib/services/company.service';
import { cn } from '@/lib/utils';
import { Building2, Search, Plus, Filter, MoreVertical, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

export default function CompaniesPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const { data, isLoading } = useCompanies({
        page,
        limit: 10,
        search,
        status: statusFilter
    });

    const approveMutation = useApproveCompany();

    const companies = data?.data || [];
    const pagination = data?.pagination || { total: 0, totalPages: 1 };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: <CheckCircle2 className="w-3 h-3" />, label: 'ATIVO' };
            case 'PENDING':
                return { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: <Clock className="w-3 h-3" />, label: 'PENDENTE' };
            case 'SUSPENDED':
                return { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: <ShieldAlert className="w-3 h-3" />, label: 'SUSPENSO' };
            default:
                return { color: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20', icon: <ShieldAlert className="w-3 h-3" />, label: status };
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full pb-20 p-8">
            {/* Tactical Header */}
            <div className="border-b border-border pb-8 flex flex-col md:flex-row justify-between items-end gap-8 relative">
                <div className="absolute top-0 right-0 opacity-[0.01] pointer-events-none font-black text-[80px] leading-none -translate-y-1/4 select-none uppercase">Empresas</div>

                <div className="space-y-3 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-1 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Gestão de Empresas</h1>
                    </div>
                    <div className="flex gap-6 font-tactical">
                        <div className="flex items-center gap-2">
                            <span className="text-foreground/40 text-[8px] font-black uppercase tracking-[0.3em]">Módulo_Comercial</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground border-l border-border pl-6">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30">Entidades_Registadas: {pagination.total}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="PESQUISAR_ENTIDADE..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-muted/30 border border-border h-10 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary/50 focus:bg-muted/50 transition-all w-64"
                        />
                    </div>
                    <button className="tactical-btn-primary px-8 h-10 flex items-center gap-2 text-[9px]">
                        <Plus className="w-4 h-4" />
                        ADICIONAR_EMPRESA
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'TOTAL_ENTIDADES', value: pagination.total, sub: 'Registadas no Nexus' },
                    { label: 'AGUARDANDO_APROV', value: companies.filter((c: Company) => c.status === 'PENDING').length, sub: 'Fila de Verificação', warning: true },
                    { label: 'ATIVAS_SISTEMA', value: companies.filter((c: Company) => c.status === 'ACTIVE').length, sub: 'Em Operação' },
                    { label: 'SUSPENSAS', value: companies.filter((c: Company) => c.status === 'SUSPENDED').length, sub: 'Restrição de Acesso' }
                ].map((stat, i) => (
                    <div key={i} className="tactical-panel p-4 flex flex-col gap-2 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -rotate-45 translate-x-12 -translate-y-12 group-hover:bg-primary/10 transition-colors" />
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                        <div className="flex items-end gap-2">
                            <span className={cn("text-2xl font-black leading-none", stat.warning && stat.value > 0 ? "text-yellow-500" : "text-foreground")}>
                                {stat.value.toString().padStart(2, '0')}
                            </span>
                            <span className="text-[8px] font-bold opacity-30 uppercase mb-1">{stat.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tactical Data Grid */}
            <div className="border border-border w-full overflow-hidden bg-card/30 backdrop-blur-sm">
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-muted/40 h-10 border-b border-border text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em] font-tactical">
                    <div className="col-span-1 flex items-center px-6 border-r border-border">ID_REF</div>
                    <div className="col-span-3 flex items-center px-6 border-r border-border">NOME_IDENTIFICAÇÃO</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">STATUS_OP</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">UNIDADES</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">CONTACTO</div>
                    <div className="col-span-2 flex items-center px-6 justify-end">ACÇÕES_SISTEMA</div>
                </div>

                {/* Table Content */}
                <div className="divide-y divide-border/20">
                    {isLoading ? (
                        <div className="p-20 text-center">
                            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                            <div className="text-[8px] font-black uppercase tracking-[0.5em] font-tactical animate-pulse opacity-50">Sincronizando Banco de Dados...</div>
                        </div>
                    ) : companies.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center gap-4 opacity-20">
                            <Building2 className="w-12 h-12" />
                            <span className="text-[8px] font-black uppercase tracking-[0.5em] font-tactical">Nenhuma Entidade Localizada</span>
                        </div>
                    ) : (
                        companies.map((company: Company) => {
                            const status = getStatusConfig(company.status);
                            return (
                                <div key={company.id} className="grid grid-cols-12 h-20 hover:bg-muted/30 group transition-all items-center">
                                    <div className="col-span-1 px-6 h-full flex items-center border-r border-border/10">
                                        <span className="text-[9px] font-black opacity-30 group-hover:opacity-100 font-tactical uppercase">
                                            #{company.id.substring(0, 4)}
                                        </span>
                                    </div>
                                    <div className="col-span-3 px-6 h-full flex flex-col justify-center border-r border-border/10">
                                        <span className="text-[14px] font-black uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                                            {company.name}
                                        </span>
                                        <span className="text-[8px] font-bold opacity-30 uppercase font-tactical mt-0.5">
                                            NIF: {company.nif}
                                        </span>
                                    </div>
                                    <div className="col-span-2 px-6 h-full flex items-center border-r border-border/10">
                                        <div className={cn(
                                            "h-7 px-3 border flex items-center gap-2 text-[8px] font-black uppercase tracking-widest",
                                            status.color
                                        )}>
                                            {status.icon}
                                            {status.label}
                                        </div>
                                    </div>
                                    <div className="col-span-2 px-6 h-full flex flex-col justify-center border-r border-border/10">
                                        <div className="flex gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black">{company._count?.fleets || 0}</span>
                                                <span className="text-[6px] font-bold opacity-30 uppercase">Frotas</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black">{company._count?.vehicles || 0}</span>
                                                <span className="text-[6px] font-bold opacity-30 uppercase">Veh</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black">{company._count?.drivers || 0}</span>
                                                <span className="text-[6px] font-bold opacity-30 uppercase">Drv</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-2 px-6 h-full flex flex-col justify-center border-r border-border/10">
                                        <span className="text-[10px] font-bold truncate opacity-80">{company.email}</span>
                                        <span className="text-[8px] font-mono opacity-40">{company.phone}</span>
                                    </div>
                                    <div className="col-span-2 px-6 h-full flex items-center justify-end gap-2">
                                        {company.status === 'PENDING' && (
                                            <button
                                                onClick={() => approveMutation.mutate(company.id)}
                                                disabled={approveMutation.isPending}
                                                className="tactical-btn h-8 px-4 text-[8px] border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all"
                                            >
                                                APROVAR_REF
                                            </button>
                                        )}
                                        <button className="tactical-btn h-8 px-3 border-border/40 hover:bg-foreground hover:text-background transition-all">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center bg-card/20 p-4 border border-border">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Nexus_Data_Sync</span>
                    <span className="text-[7px] font-mono opacity-30 capitalize">Mostrando registros {((page - 1) * 10) + 1} - {Math.min(page * 10, pagination.total)} de {pagination.total}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="h-10 px-6 border border-border text-[8px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                    >
                        PÁG_ANTERIOR
                    </button>
                    <div className="w-20 h-10 border border-border flex items-center justify-center text-[10px] font-black">
                        {page.toString().padStart(2, '0')}/{pagination.totalPages.toString().padStart(2, '0')}
                    </div>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                        className="h-10 px-6 border border-border text-[8px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                    >
                        PRÓXIMA_PÁG
                    </button>
                </div>
            </div>
        </div>
    );
}
