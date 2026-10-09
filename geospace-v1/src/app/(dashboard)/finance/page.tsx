'use client';

import React, { useState } from 'react';
import { usePaymentHistory, useWalletBalance } from '@/hooks/use-payments';
import { useDashboardStats } from '@/hooks/use-dashboard';
import { Payment } from '@/lib/services/payment.service';
import { cn } from '@/lib/utils';
import { CreditCard, TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft, Clock, Search, MoreVertical } from 'lucide-react';

export default function FinancePage() {
    const [page, setPage] = useState(1);
    const { data: historyData, isLoading: historyLoading } = usePaymentHistory(page);
    const { data: balanceData } = useWalletBalance();
    const { data: statsData } = useDashboardStats();

    const payments = historyData?.data || [];
    const pagination = historyData?.pagination || { total: 0, totalPages: 1 };

    return (
        <div className="flex flex-col gap-8 w-full pb-20 p-8">
            {/* Tactical Header */}
            <div className="border-b border-border pb-8 flex flex-col md:flex-row justify-between items-end gap-8 relative">
                <div className="absolute top-0 right-0 opacity-[0.01] pointer-events-none font-black text-[80px] leading-none -translate-y-1/4 select-none uppercase">Finanças</div>

                <div className="space-y-3 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-1 bg-primary" />
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Fluxos Financeiros</h1>
                    </div>
                    <div className="flex gap-6 font-tactical">
                        <div className="flex items-center gap-2">
                            <span className="text-foreground/40 text-[8px] font-black uppercase tracking-[0.3em]">Módulo_Tesouraria</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground border-l border-border pl-6">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30">Balancete_Ativo: {balanceData?.balance?.toLocaleString() || '0'} KZ</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button className="tactical-btn h-10 px-8 text-[9px] font-black uppercase tracking-widest bg-primary text-primary-foreground border-none">
                        EXPORTAR_RELATÓRIO_TX
                    </button>
                </div>
            </div>

            {/* Financial Overview Tags */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="tactical-panel p-6 border-l-4 border-l-primary flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Volume_Mês_Transações</span>
                        <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-black tracking-tighter">
                            {(statsData?.finance?.totalRevenue || 0).toLocaleString()} KZ
                        </span>
                        <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest mt-1">Acumulado_Global</span>
                    </div>
                </div>

                <div className="tactical-panel p-6 border-l-4 border-l-green-500 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Receita_Últimas_24H</span>
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-black tracking-tighter">
                            {(statsData?.finance?.revenueLast24h || 0).toLocaleString()} KZ
                        </span>
                        <span className="text-[8px] font-bold opacity-30 uppercase tracking-widest mt-1">TX_Fluxo_Diário</span>
                    </div>
                </div>

                <div className="tactical-panel p-6 border-l-4 border-l-yellow-500 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Atividade_Sistema</span>
                        <Clock className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-black tracking-tighter">{statsData?.trips?.total || 0}</span>
                        <span className="text-[8px] font-bold opacity-30 uppercase tracking-widest mt-1">Total_Corridas_Processadas</span>
                    </div>
                </div>
            </div>

            {/* Tactical Ledger Grid */}
            <div className="border border-border w-full overflow-hidden bg-card/30 backdrop-blur-sm">
                <div className="grid grid-cols-12 bg-muted/40 h-10 border-b border-border text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em] font-tactical">
                    <div className="col-span-1 flex items-center px-6 border-r border-border">TX_ID</div>
                    <div className="col-span-3 flex items-center px-6 border-r border-border">DESCRIÇÃO_OPERACIONAL</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">MÉTODO</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">DATA_HORA</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border text-right">VALOR</div>
                    <div className="col-span-2 flex items-center px-6 justify-end">STATUS</div>
                </div>

                <div className="divide-y divide-border/20">
                    {historyLoading ? (
                        <div className="p-20 text-center font-tactical text-[8px] animate-pulse whitespace-pre-wrap uppercase tracking-[0.5em]">
                            Sincronizando livro razão operacional...
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="p-20 text-center opacity-20 font-tactical text-[8px] uppercase tracking-[0.5em]">
                            Nenhum registro de fluxo localizado na rede
                        </div>
                    ) : (
                        payments.map((payment: Payment) => (
                            <div key={payment.id} className="grid grid-cols-12 h-16 hover:bg-muted/30 group transition-all items-center">
                                <div className="col-span-1 px-6 h-full flex items-center border-r border-border/10">
                                    <span className="text-[9px] font-black opacity-30 group-hover:opacity-100 font-tactical">
                                        #{payment.id.substring(0, 4)}
                                    </span>
                                </div>
                                <div className="col-span-3 px-6 h-full flex flex-col justify-center border-r border-border/10">
                                    <span className="text-[11px] font-black uppercase truncate group-hover:text-primary transition-colors">Corrida #{payment.tripId.substring(0, 6)}</span>
                                    <span className="text-[7px] font-bold opacity-30 uppercase font-tactical">Ref_Nexus_Transaction</span>
                                </div>
                                <div className="col-span-2 px-6 h-full flex items-center border-r border-border/10 gap-2">
                                    <div className="p-1 bg-muted rounded">
                                        {payment.method === 'CASH' ? <ArrowDownLeft className="w-3 h-3 text-yellow-500" /> : <CreditCard className="w-3 h-3 text-primary" />}
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest">{payment.method}</span>
                                </div>
                                <div className="col-span-2 px-6 h-full flex flex-col justify-center border-r border-border/10 font-mono">
                                    <span className="text-[9px] text-foreground/60">{new Date(payment.createdAt).toLocaleDateString()}</span>
                                    <span className="text-[8px] text-foreground/40">{new Date(payment.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <div className="col-span-2 px-6 h-full flex items-center justify-end border-r border-border/10">
                                    <span className="text-sm font-black tracking-tight">{payment.amount.toLocaleString()} KZ</span>
                                </div>
                                <div className="col-span-2 px-6 h-full flex items-center justify-end">
                                    <div className={cn(
                                        "h-6 px-3 border text-[7px] font-black uppercase tracking-widest flex items-center justify-center min-w-[80px]",
                                        payment.status === 'COMPLETED' ? "border-green-500/20 bg-green-500/10 text-green-500" :
                                            payment.status === 'PENDING' ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-500" :
                                                "border-red-500/20 bg-red-500/10 text-red-500"
                                    )}>
                                        {payment.status}
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
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Auditoria_Financeira_Nexus_7</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-10 px-6 border border-border text-[8px] font-black hover:bg-foreground hover:text-background transition-all font-tactical">
                        [RECUAR]
                    </button>
                    <div className="w-20 h-10 border border-border flex items-center justify-center text-[10px] font-black font-tactical bg-muted/20">{page}/{pagination.totalPages}</div>
                    <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="h-10 px-6 border border-border text-[8px] font-black hover:bg-foreground hover:text-background transition-all font-tactical">
                        [AVANÇAR]
                    </button>
                </div>
            </div>
        </div>
    );
}
