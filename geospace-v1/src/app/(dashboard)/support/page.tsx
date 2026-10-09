'use client';

import React, { useState } from 'react';
import { useSupportTickets, useUpdateTicketStatus } from '@/hooks/use-support';
import { SupportTicket } from '@/lib/services/support.service';
import { cn } from '@/lib/utils';
import { MessageSquare, Search, Filter, AlertCircle, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

export default function SupportPage() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');

    const { data, isLoading } = useSupportTickets({
        page,
        limit: 10,
        status: statusFilter
    });

    const tickets = data?.data || [];
    const pagination = data?.pagination || { total: 0, totalPages: 1 };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full pb-20 p-8">
            {/* Tactical Header */}
            <div className="border-b border-border pb-8 flex flex-col md:flex-row justify-between items-end gap-8 relative">
                <div className="absolute top-0 right-0 opacity-[0.01] pointer-events-none font-black text-[80px] leading-none -translate-y-1/4 select-none uppercase">Ticket</div>

                <div className="space-y-3 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-1 bg-primary" />
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Central de Suporte</h1>
                    </div>
                    <div className="flex gap-6 font-tactical">
                        <div className="flex items-center gap-2">
                            <span className="text-foreground/40 text-[8px] font-black uppercase tracking-[0.3em]">Módulo_Atendimento</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground border-l border-border pl-6">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30">Pedidos_Pendentes: {tickets.filter((t: any) => t.status === 'OPEN').length}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-muted/30 border border-border h-10 px-4 text-[9px] font-black uppercase tracking-widest focus:outline-none focus:border-primary/50"
                    >
                        <option value="">FILTRAR_STATUS</option>
                        <option value="OPEN">ABERTOS</option>
                        <option value="IN_PROGRESS">EM_ANDAMENTO</option>
                        <option value="RESOLVED">RESOLVIDOS</option>
                    </select>
                </div>
            </div>

            {/* Tactical Ticket List */}
            <div className="border border-border w-full overflow-hidden bg-card/30 backdrop-blur-sm">
                <div className="grid grid-cols-12 bg-muted/40 h-10 border-b border-border text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em] font-tactical">
                    <div className="col-span-1 flex items-center px-6 border-r border-border">RID</div>
                    <div className="col-span-1 flex items-center px-6 border-r border-border">PRIORIDADE</div>
                    <div className="col-span-4 flex items-center px-6 border-r border-border">ASSUNTO_E_DESCRIÇÃO_TÉCNICA</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">ORIGEM_USUÁRIO</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">CATEGORIA</div>
                    <div className="col-span-2 flex items-center px-6 justify-end">STATUS_OPERACIONAL</div>
                </div>

                <div className="divide-y divide-border/20">
                    {isLoading ? (
                        <div className="p-20 text-center opacity-50 font-tactical animate-pulse uppercase tracking-[0.4em] text-[8px]">
                            Estabelecendo conexão com o servidor de ajuda...
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="p-20 text-center opacity-20 font-tactical uppercase tracking-[0.4em] text-[8px]">
                            Central de atendimento sem pendências
                        </div>
                    ) : (
                        tickets.map((ticket: SupportTicket) => (
                            <div key={ticket.id} className="grid grid-cols-12 min-h-[80px] hover:bg-muted/30 group transition-all items-center cursor-pointer">
                                <div className="col-span-1 px-6 h-full flex items-center border-r border-border/10">
                                    <span className="text-[9px] font-black opacity-30 group-hover:opacity-100 font-tactical">
                                        #{ticket.id.substring(0, 4)}
                                    </span>
                                </div>
                                <div className="col-span-1 px-6 h-full flex items-center border-r border-border/10 justify-center">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        ticket.priority === 'URGENT' ? "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" :
                                            ticket.priority === 'HIGH' ? "bg-orange-500" :
                                                ticket.priority === 'MEDIUM' ? "bg-yellow-500" : "bg-blue-500"
                                    )} title={ticket.priority} />
                                </div>
                                <div className="col-span-4 px-6 h-full flex flex-col justify-center border-r border-border/10">
                                    <span className="text-[12px] font-black uppercase truncate group-hover:text-primary transition-colors">{ticket.subject}</span>
                                    <span className="text-[8px] font-bold opacity-30 uppercase truncate mt-0.5">{ticket.description}</span>
                                </div>
                                <div className="col-span-2 px-6 h-full flex flex-col justify-center border-r border-border/10">
                                    <span className="text-[10px] font-black uppercase truncate">{ticket.user.firstName} {ticket.user.lastName}</span>
                                    <span className="text-[7px] font-mono opacity-30 uppercase">{ticket.user.email}</span>
                                </div>
                                <div className="col-span-2 px-6 h-full flex items-center border-r border-border/10">
                                    <span className="text-[8px] font-black uppercase tracking-widest bg-muted px-2 py-1 border border-border/50">{ticket.category}</span>
                                </div>
                                <div className="col-span-2 px-6 h-full flex items-center justify-end">
                                    <div className={cn(
                                        "h-6 px-3 border text-[7px] font-black uppercase tracking-widest flex items-center justify-center min-w-[100px]",
                                        ticket.status === 'RESOLVED' ? "border-green-500/20 bg-green-500/10 text-green-500" :
                                            ticket.status === 'OPEN' ? "border-primary/20 bg-primary/10 text-primary" :
                                                "border-zinc-500/20 bg-zinc-500/10 text-zinc-500"
                                    )}>
                                        {ticket.status}
                                    </div>
                                    <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center bg-card/20 p-4 border border-border">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Atendimento_Rede_Escalada</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-10 px-6 border border-border text-[8px] font-black hover:bg-foreground hover:text-background transition-all font-tactical">
                        [PREV]
                    </button>
                    <div className="w-20 h-10 border border-border flex items-center justify-center text-[10px] font-black font-tactical">{page}/{pagination.totalPages}</div>
                    <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="h-10 px-6 border border-border text-[8px] font-black hover:bg-foreground hover:text-background transition-all font-tactical">
                        [NEXT]
                    </button>
                </div>
            </div>
        </div>
    );
}
