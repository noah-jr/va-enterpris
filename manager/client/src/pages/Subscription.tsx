import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Check, Zap, Shield, Crown, CreditCard,
    ArrowRight, Loader2, Info, Package,
    HelpCircle, X, ShieldCheck, BadgeCheck,
    CheckCircle2,
    CreditCard as CardIcon, Building2, Globe,
    Clock, AlertTriangle, Phone, Mail, Upload, FileText
} from 'lucide-react';
import api from '../api';
import { toast } from 'sonner';

interface Feature {
    text: string;
    included: boolean;
}

interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
    annualPrice: number;
    maxUsers: number;
    color: string;
    highlight?: boolean;
    features: Feature[];
    modules: string[];
}

import { formatCurrency } from '../utils/format';

const fmt = (v: number) => formatCurrency(v);

function getDaysRemaining(endDate: string | Date): number {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
}

export default function Subscription() {
    const qc = useQueryClient();
    const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [checkoutStep, setCheckoutStep] = useState<'CONFIRM' | 'PAYING' | 'SUCCESS'>('CONFIRM');
    const [contactModal, setContactModal] = useState(false);
    const [trialContactModal, setTrialContactModal] = useState(false);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    // Fetch subscription info and plans
    const { data: subData, isLoading } = useQuery({
        queryKey: ['subscription-info'],
        queryFn: async () => {
            const res = await api.get('/company-admin/subscription');
            const plans = res.data.plans;
            Object.values(plans).forEach((p: any) => {
                if (typeof p.features[0] === 'string') {
                    p.features = p.features.map((f: string) => ({ text: f, included: true }));
                }
                p.description = p.subtitle || p.description || 'Solução integrada de gestão empresarial.';
                p.highlight = p.popular;
            });
            return res.data;
        }
    });

    const plans: Record<string, Plan> = subData?.plans || {};
    const currentSub = subData?.subscription;

    const isTrialActive = currentSub?.plan === 'TRIAL' && new Date(currentSub.endDate) >= new Date();
    const isTrialExpired = currentSub?.plan === 'TRIAL' && new Date(currentSub.endDate) < new Date();
    const daysRemaining = currentSub?.endDate ? getDaysRemaining(currentSub.endDate) : 0;

    const handleUpgradeClick = (id: string) => {
        const plan = plans[id];
        if (!plan) return;
        if (currentSub?.plan === plan.id) {
            toast.info('Já possui este plano activo.');
            return;
        }
        setSelectedPlan(plan);
        setCheckoutStep('CONFIRM');
    };


    const cancelSubscription = async () => {
        if (!window.confirm('Tem a certeza que deseja cancelar a sua subscrição activa? O acesso aos módulos será revogado imediatamente.')) return;
        
        try {
            await api.post('/company-admin/cancel-subscription');
            toast.success('Subscrição cancelada com sucesso.');
            window.location.reload(); // Hard reload to clear all states and trigger restrictions
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Erro ao cancelar subscrição');
        }
    };


    useEffect(() => {
        const preSelected = sessionStorage.getItem('selectedPlan');

        const cycle = sessionStorage.getItem('billingCycle') as 'MONTHLY' | 'ANNUAL' | null;
        
        if (cycle) setBillingCycle(cycle);
        
        if (!isLoading && preSelected && plans[preSelected]) {
            handleUpgradeClick(preSelected);
            sessionStorage.removeItem('selectedPlan');
            sessionStorage.removeItem('billingCycle');
        }
    }, [isLoading, plans, isTrialActive]);

    const upgradeMutation = useMutation({
        mutationFn: async ({ planId, billing }: { planId: string, billing: string }) => {
            const fd = new FormData();
            fd.append('planId', planId);
            fd.append('billing', billing);
            if (proofFile) fd.append('proof', proofFile);
            return (await api.post('/sub/requests', fd, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
        },
        onSuccess: (data) => {
            setCheckoutStep('SUCCESS');
            toast.success('Pedido submetido com sucesso! Aguarda aprovação.');
            qc.invalidateQueries({ queryKey: ['subscription-info'] });
            qc.invalidateQueries({ queryKey: ['auth', 'me'] });
        },
        onError: (err: any) => {
            setCheckoutStep('CONFIRM');
            const code = err.response?.data?.code;
            if (code === 'TRIAL_ACTIVE') {
                setSelectedPlan(null);
                setTrialContactModal(true);
            } else {
                toast.error(err.response?.data?.error || 'Erro ao processar subscrição');
            }
        }
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-6 text-[var(--text-secondary)]">
                <div className="relative">
                    <Loader2 size={40} className="animate-spin text-[var(--accent)]" />
                    <div className="absolute inset-0 bg-[var(--accent)]/20 blur-2xl rounded-full" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Mapeando Matriz de Planos & Subscrição...</p>
            </div>
        );
    }
    
    const userCount = subData?.userCount || 0;

    const confirmPayment = () => {
        if (!selectedPlan || !proofFile) {
            toast.error('O comprovativo de pagamento é obrigatório.');
            return;
        }
        setCheckoutStep('PAYING');
        setTimeout(() => {
            upgradeMutation.mutate({ planId: selectedPlan.id, billing: billingCycle });
        }, 1500);
    };

    const maxDiscount = Object.values(plans).reduce((max: number, p: any) => {
        if (!p.price || !p.annualPrice || p.price === 0) return max;
        const d = Math.round((1 - (p.annualPrice / (p.price * 12))) * 100);
        return d > max ? d : max;
    }, 0) || 15;

    return (
        <div className="space-y-12 pb-32 max-w-7xl mx-auto">
            {/* Trial Active Banner */}
            {isTrialActive && (
                <div className="fluent-card border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8 rounded-[var(--radius-lg)] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative z-10 text-center sm:text-left">
                        <div className="w-16 h-16 bg-amber-500/10 rounded-[var(--radius-sm)] border border-amber-500/30 flex items-center justify-center shrink-0">
                            <Clock size={32} className="text-amber-500" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-amber-500/60 mb-1 uppercase tracking-[0.4em]">Período de Trial Activo</p>
                            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tighter uppercase">
                                {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
                            </h2>
                            <p className="text-[11px] text-[var(--text-secondary)] mt-1 font-medium opacity-60">
                                O seu trial termina em <span className="font-black text-[var(--text-primary)]">{new Date(currentSub.endDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setTrialContactModal(true)}
                        className="relative z-10 w-full sm:w-auto px-6 sm:px-10 py-4 bg-amber-500 text-white rounded-[var(--radius-sm)] font-black text-[11px] uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center justify-center gap-3 shrink-0"
                    >
                        <Phone size={16} /> Activar Plano Pago
                    </button>
                </div>
            )}

            {/* Trial Expired Banner */}
            {isTrialExpired && (
                <div className="fluent-card border border-rose-500/30 bg-rose-500/5 p-6 sm:p-8 rounded-[var(--radius-lg)] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                        <div className="w-16 h-16 bg-rose-500/10 rounded-[var(--radius-sm)] border border-rose-500/30 flex items-center justify-center shrink-0">
                            <AlertTriangle size={32} className="text-rose-500" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-rose-500/60 mb-1 uppercase tracking-[0.4em]">Trial Expirado</p>
                            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tighter uppercase">Período de Teste Encerrado</h2>
                            <p className="text-[11px] text-[var(--text-secondary)] mt-1 font-medium opacity-60">
                                Seleccione um plano abaixo para continuar a usar a plataforma.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="text-center space-y-6 pt-10 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[var(--accent)]/5 blur-[100px] pointer-events-none rounded-full" />
                <h1 className="text-4xl font-bold text-[var(--text-primary)]">
                    Cluster de <span className="text-[var(--accent)]">Módulos</span>
                </h1>
                <p className="text-sm text-[var(--text-muted)] max-w-2xl mx-auto mt-2">
                    {isTrialActive
                        ? 'O seu trial dá-lhe acesso completo. Contacte-nos para activar um plano pago.'
                        : 'Sincronize a sua infraestrutura com o plano adequado à escala operacional do seu negócio.'}
                </p>

                {!isTrialActive && (
                    <div className="flex items-center justify-center gap-4 pt-10">
                        <div className="flex flex-col sm:flex-row bg-[var(--bg-secondary)] border border-[var(--border-color)]/30 p-1.5 rounded-[var(--radius-md)] shadow-inner w-full sm:w-auto">
                            <button
                                onClick={() => setBillingCycle('MONTHLY')}
                                className={`px-4 sm:px-10 py-3 sm:py-4 rounded-[var(--radius-sm)] text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all ${billingCycle === 'MONTHLY' ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                                Bilhete Mensal
                            </button>
                            <button
                                onClick={() => setBillingCycle('ANNUAL')}
                                className={`px-4 sm:px-10 py-3 sm:py-4 rounded-[var(--radius-sm)] text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all ${billingCycle === 'ANNUAL' ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                                Licença Anual <span className="ml-2 text-[8px] border border-white/20 px-2 py-0.5 rounded-full">-{maxDiscount}%</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Current Status Banner (non-trial) */}
            {currentSub && !isTrialActive && !isTrialExpired && (
                <div className="fluent-card border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 sm:p-8 rounded-[var(--radius-lg)] flex flex-col lg:flex-row items-center justify-between gap-8 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-10 opacity-5 pointer-events-none transition-transform duration-700 group-hover:scale-110 hidden xl:block"><Crown size={120} className="text-[var(--text-primary)]" /></div>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative z-10 text-center sm:text-left">
                        <div className="kpi-icon rounded-[var(--radius-sm)] bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--accent)] flex items-center justify-center shadow-sm w-14 h-14 sm:w-16 sm:h-16 shrink-0">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-[var(--text-secondary)] mb-1 uppercase tracking-[0.4em] opacity-40 italic">Subscrição Activa</p>
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                                <h2 className="text-lg sm:text-2xl font-black text-[var(--text-primary)] tracking-tighter uppercase">
                                    {plans[currentSub.plan]?.name || currentSub.plan}
                                </h2>
                                <span className={`text-[8px] sm:text-[9px] px-3 py-1 rounded-[var(--radius-sm)] font-black uppercase tracking-widest border ${currentSub.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-500/10' : 'bg-rose-50 text-rose-600 border-rose-500/10'}`}>
                                    {currentSub.status === 'ACTIVE' ? 'Operacional' : 'Suspenso'}
                                </span>
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-[var(--text-secondary)] mt-2 font-medium flex items-center justify-center sm:justify-start gap-2 opacity-60 uppercase italic tracking-widest">
                                Próxima sincronização: <span className="font-black text-[var(--text-primary)]">{new Date(currentSub.endDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between lg:justify-end gap-6 sm:gap-10 relative z-10 w-full lg:w-auto border-t lg:border-t-0 border-[var(--border-color)]/10 pt-6 lg:pt-0">
                        <div className="text-left sm:text-right">
                            <p className="text-[9px] font-black text-[var(--text-secondary)] mb-1 uppercase tracking-widest opacity-40">Nós Ativos</p>
                            <p className="text-lg sm:text-2xl font-black text-[var(--text-primary)] tabular-nums tracking-tighter">{userCount} <span className="text-sm text-[var(--text-secondary)] font-normal opacity-20">/ {plans[currentSub.plan]?.maxUsers === 0 ? '∞' : plans[currentSub.plan]?.maxUsers || '∞'}</span></p>
                        </div>
                        {/* Cancellation Action */}
                        {!isTrialActive && (
                            <button
                                onClick={cancelSubscription}
                                title="Cancelar Subscrição"
                                className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-[var(--radius-sm)] flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {Object.values(plans)
                    .filter(p => p.id !== 'TRIAL')
                    .map((plan) => {
                        const isCurrent = currentSub?.plan === plan.id;
                        const currentPrice = billingCycle === 'MONTHLY' ? plan.price : plan.annualPrice;
                        const id = plan.id;

                        return (
                            <div
                                key={id}
                                className={`fluent-card relative bg-[var(--bg-secondary)] border ${plan.highlight ? 'border-[var(--accent)]/50 lg:scale-[1.02] z-10' : 'border-[var(--border-color)]/30'} p-6 sm:p-8 rounded-[var(--radius-lg)] flex flex-col group transition-all hover:scale-[1.01] sm:hover:scale-[1.03] shadow-xl overflow-hidden min-w-0`}
                            >
                                {plan.highlight && (
                                    <div className="absolute top-0 right-0 bg-[var(--accent)] text-white text-[8px] sm:text-[9px] font-black px-4 py-2 uppercase tracking-widest rounded-bl-[var(--radius-sm)] shadow-md">
                                        Recomendado
                                    </div>
                                )}

                                <div className="mb-6 sm:mb-8">
                                    <h3 className="text-[10px] sm:text-[11px] font-black text-[var(--accent)] uppercase tracking-[0.2em] mb-3 sm:mb-4">{plan.name}</h3>
                                    <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
                                        <span className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-[var(--text-primary)] leading-none">{fmt(currentPrice)}</span>
                                        <span className="text-[9px] sm:text-[10px] font-black text-[var(--text-secondary)] uppercase opacity-30">/ {billingCycle === 'MONTHLY' ? 'mês' : 'ano'}</span>
                                    </div>
                                    <p className="text-[9px] sm:text-[10px] text-[var(--text-secondary)] mt-4 sm:mt-6 font-black leading-relaxed italic opacity-40 border-t border-[var(--border-color)]/10 pt-4 sm:pt-6 uppercase tracking-wider">
                                        {plan.description}
                                    </p>
                                </div>

                                <ul className="space-y-4 mb-10 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 group/item">
                                            <div className={`w-6 h-6 rounded-[var(--radius-sm)] border border-[var(--border-color)] group-hover/item:border-[var(--accent)]/50 flex items-center justify-center transition-all flex-shrink-0 ${feature.included ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50/30 text-rose-300 opacity-20'}`}>
                                                {feature.included ? <CheckCircle2 size={13} /> : <X size={13} />}
                                            </div>
                                            <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-tight leading-tight pt-1 ${feature.included ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] line-through opacity-20'}`}>
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleUpgradeClick(id)}
                                    disabled={isCurrent || upgradeMutation.isPending}
                                    className={`w-full py-4 sm:py-5 rounded-[var(--radius-sm)] font-black text-[9px] sm:text-[10px] uppercase tracking-wider transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 sm:gap-3 ${
                                        isCurrent 
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default' 
                                            : isTrialActive
                                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-white'
                                                : plan.highlight 
                                                    ? 'bg-[var(--accent)] text-white shadow-[var(--accent)]/30 hover:shadow-[var(--accent)]/40' 
                                                    : 'bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent)]'
                                    }`}
                                >
                                    {isCurrent ? (
                                        <><ShieldCheck size={18} /> Nodo Actual</>
                                    ) : isTrialActive ? (
                                        <><Phone size={18} /> Contactar</>
                                    ) : (
                                        <><Zap size={18} /> Provisionar</>
                                    )}
                                </button>
                            </div>
                        );
                    })}
            </div>

            {/* Custom Support Banner */}
            <div className="bg-[#0f172a] text-white p-8 sm:p-16 rounded-[var(--radius-lg)] flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden border border-white/10 mt-24 group text-center lg:text-left">
                <div className="absolute right-[-10%] top-[-50%] opacity-20 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[150px] pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 w-full">
                    <div className="max-w-xl space-y-4 sm:space-y-6">
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 text-indigo-400 rounded-[var(--radius-sm)] text-[10px] font-black tracking-[0.4em] border border-white/10 uppercase italic">
                            <Building2 size={16} /> Cluster Enterprise
                        </div>
                        <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase italic">Infraestrutura Exclusiva?</h3>
                        <p className="text-slate-400 text-[11px] sm:text-[12px] font-bold leading-relaxed uppercase tracking-widest opacity-60">
                            Apoio dedicado para operações de alta densidade. Sincronização de múltiplos nós e infraestrutura isolada.
                        </p>
                    </div>
                    <button 
                        onClick={() => setContactModal(true)}
                        className="w-full lg:w-auto bg-white text-slate-900 hover:bg-slate-50 hover:scale-[1.05] px-10 sm:px-14 py-5 sm:py-6 rounded-[var(--radius-sm)] font-black text-xs uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95"
                    >
                        Solicitar Nó <ArrowRight size={20} />
                    </button>
                </div>
            </div>

            {/* Checkout Modal (non-trial) */}
            {selectedPlan && createPortal(
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    <div className="absolute inset-0 z-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => checkoutStep !== 'PAYING' && setSelectedPlan(null)} />
                    <div className="relative z-[1] bg-[var(--bg-secondary)] border border-[var(--border-color)] w-full max-w-xl rounded-[var(--radius-lg)] p-6 sm:p-12 shadow-2xl">
                         <div className="flex items-center justify-between mb-10 pb-6 border-b border-[var(--border-color)]">
                             <div>
                                 <h2 className="text-xl font-black tracking-tighter uppercase italic">{checkoutStep === 'SUCCESS' ? 'Fase de Sincronização Concluída' : 'Confirmar Provisão'}</h2>
                                 <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Nó de Activação Central</p>
                             </div>
                             {checkoutStep !== 'PAYING' && <button onClick={() => { setSelectedPlan(null); setProofFile(null); }} className="p-2 hover:opacity-50 transition-all"><X size={24}/></button>}
                         </div>

                         {checkoutStep === 'CONFIRM' && (
                             <div className="space-y-10">
                                 <div className="p-4 sm:p-8 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[var(--radius-sm)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
                                     <div className="flex justify-between items-start mb-8">
                                         <div>
                                             <p className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest mb-2 opacity-50">Configuração</p>
                                             <h4 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">{selectedPlan.name}</h4>
                                         </div>
                                         <div className="kpi-icon bg-[var(--bg-secondary)] rounded-[var(--radius-sm)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)]"><Zap size={24}/></div>
                                     </div>
                                     <div className="flex justify-between items-end pt-8 border-t border-[var(--border-color)]/20">
                                         <div className="text-right w-full">
                                             <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] mb-2 opacity-30">Valor Total Estimado</p>
                                             <p className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tabular-nums tracking-tighter">
                                                 {fmt(billingCycle === 'ANNUAL' ? selectedPlan.annualPrice : selectedPlan.price)}
                                             </p>
                                         </div>
                                     </div>
                                 </div>

                                 <div className="space-y-1.5 pt-4">
                                     <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50">Comprovativo de pagamento</label>
                                     <div
                                         onClick={() => fileRef.current?.click()}
                                         className={`border-2 border-dashed rounded-[var(--radius-md)] p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors ${
                                             proofFile
                                                 ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/5'
                                                 : 'border-[var(--border-color)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]'
                                         }`}
                                     >
                                         {proofFile ? (
                                             <>
                                                 <FileText size={22} className="text-emerald-500" />
                                                 <p className="text-sm font-500 text-[var(--text-primary)]">{proofFile.name}</p>
                                                 <p className="text-xs text-emerald-500">Ficheiro selecionado</p>
                                             </>
                                         ) : (
                                             <>
                                                 <Upload size={22} className="text-[var(--text-muted)]" />
                                                 <p className="text-sm text-[var(--text-muted)] text-center">
                                                     Clique para selecionar
                                                     <span className="block text-xs mt-0.5">JPG, PNG ou PDF · Máx 10 MB</span>
                                                 </p>
                                             </>
                                         )}
                                         <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
                                             onChange={e => setProofFile(e.target.files?.[0] || null)} />
                                     </div>
                                 </div>

                                 <button onClick={confirmPayment} disabled={!proofFile} className="w-full py-6 bg-[var(--accent)] text-white rounded-[var(--radius-sm)] font-black text-[12px] uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none">
                                     Enviar Pedido <Upload size={20}/>
                                 </button>
                             </div>
                         )}

                         {checkoutStep === 'PAYING' && (
                             <div className="py-20 flex flex-col items-center justify-center gap-4 sm:gap-8 opacity-40">
                                 <Loader2 size={64} className="animate-spin text-[var(--accent)]" />
                                 <p className="text-[11px] font-black uppercase tracking-[0.6em] animate-pulse">Estabelecendo Ligação Segura...</p>
                             </div>
                         )}

                         {checkoutStep === 'SUCCESS' && (
                             <div className="py-12 flex flex-col items-center justify-center text-center gap-5 sm:gap-10">
                                 <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100 shadow-inner">
                                     <Check size={64} className="text-emerald-500" />
                                 </div>
                                 <div className="space-y-4">
                                     <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Pedido Submetido</h3>
                                     <p className="text-[11px] font-bold text-[var(--text-secondary)] tracking-widest uppercase opacity-40 max-w-sm">O seu pedido para o plano {selectedPlan.name} foi enviado com sucesso. Aguarde pela aprovação da nossa equipa. A factura será emitida automaticamente após aprovação.</p>
                                 </div>
                                 <button onClick={() => { setSelectedPlan(null); setProofFile(null); }} className="w-full py-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[var(--radius-sm)] font-black text-[11px] uppercase tracking-widest hover:bg-[var(--text-primary)] hover:text-white transition-all">Regressar ao Dashboard</button>
                             </div>
                         )}
                    </div>
                </div>,
                document.body
            )}

            {/* Trial Contact Modal */}
            {trialContactModal && createPortal(
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    <div className="absolute inset-0 z-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setTrialContactModal(false)} />
                    <div className="relative z-[1] bg-[var(--bg-secondary)] border border-amber-500/30 w-full max-w-lg rounded-[var(--radius-lg)] p-6 sm:p-8 shadow-2xl my-auto">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border-color)]">
                            <div>
                                <h2 className="text-xl font-black tracking-tighter uppercase italic text-amber-500">Activar Plano Pago</h2>
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Trial em progresso</p>
                            </div>
                            <button onClick={() => setTrialContactModal(false)} className="p-2 hover:opacity-50 transition-all"><X size={24}/></button>
                        </div>
                        <div className="space-y-6">
                            <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-[var(--radius-sm)]">
                                <div className="flex items-start gap-4">
                                    <Clock size={24} className="text-amber-500 shrink-0 mt-1" />
                                    <div>
                                        <p className="font-black text-[var(--text-primary)] uppercase tracking-tight text-sm mb-2">O seu trial ainda está activo</p>
                                        <p className="text-[var(--text-secondary)] text-[11px] font-medium leading-relaxed opacity-70">
                                            Tem <span className="font-black text-amber-500">{daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}</span> restantes de trial gratuito. Para activar um plano pago agora ou quando o trial terminar, entre em contacto com a nossa equipa comercial.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50">Contacte-nos</p>
                                <a href="mailto:comercial@va-onegest.co.ao" className="flex items-center gap-4 p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[var(--radius-sm)] hover:border-[var(--accent)] transition-all group">
                                    <div className="w-10 h-10 bg-[var(--accent)]/10 rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--accent)]">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <p className="font-black text-[var(--text-primary)] text-sm">comercial@va-onegest.co.ao</p>
                                        <p className="text-[10px] text-[var(--text-secondary)] opacity-50 uppercase tracking-widest">Email Comercial</p>
                                    </div>
                                    <ArrowRight size={16} className="ml-auto text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" />
                                </a>
                                <a href="tel:+244923000000" className="flex items-center gap-4 p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[var(--radius-sm)] hover:border-[var(--accent)] transition-all group">
                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-[var(--radius-sm)] flex items-center justify-center text-emerald-500">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className="font-black text-[var(--text-primary)] text-sm">+244 923 000 000</p>
                                        <p className="text-[10px] text-[var(--text-secondary)] opacity-50 uppercase tracking-widest">Linha Comercial</p>
                                    </div>
                                    <ArrowRight size={16} className="ml-auto text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Enterprise Contact Modal (Solicitar Nó) */}
            {contactModal && createPortal(
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="absolute inset-0 z-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setContactModal(false)} />
                    <div className="relative z-[1] bg-[#0f172a] border border-white/10 w-full max-w-xl rounded-[var(--radius-lg)] p-6 sm:p-12 shadow-2xl text-white my-auto">
                        <div className="flex items-center justify-between mb-12 pb-6 border-b border-white/10">
                            <div>
                                <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white flex items-center gap-3">
                                    <Building2 className="text-indigo-400" /> Solicitar Nó Exclusivo
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">Arquitetura Enterprise Isolada</p>
                            </div>
                            <button onClick={() => setContactModal(false)} className="p-2 hover:opacity-50 transition-all"><X size={28}/></button>
                        </div>
                        
                        <div className="space-y-10">
                            <div className="p-8 bg-white/5 border border-white/10 rounded-[var(--radius-sm)] space-y-4">
                                <p className="text-slate-300 text-[13px] font-medium leading-relaxed">
                                    Para organizações que requerem soberania total sobre os seus dados, oferecemos a possibilidade de provisionar um <span className="text-indigo-400 font-bold italic">Cluster de Infraestrutura Isolada</span>.
                                </p>
                                <ul className="space-y-3">
                                    {['Base de Dados Dedicada', 'Endereço IP Exclusivo', 'Sincronização AGT Prioritária', 'Suporte de Arquitetura 24/7'].map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-[11px] font-black uppercase text-indigo-300">
                                            <BadgeCheck size={16} /> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <a href="mailto:enterprise@va-onegest.co.ao" className="flex flex-col gap-4 p-6 bg-white/5 border border-white/10 rounded-[var(--radius-sm)] hover:bg-white hover:text-slate-900 transition-all group">
                                    <Mail size={24} className="text-indigo-400 group-hover:text-slate-900" />
                                    <div>
                                        <p className="font-black text-sm uppercase tracking-tighter">Via Digital</p>
                                        <p className="text-[10px] opacity-60 font-medium">enterprise@va-onegest.co.ao</p>
                                    </div>
                                </a>
                                <a href="tel:+244923000000" className="flex flex-col gap-4 p-6 bg-white/5 border border-white/10 rounded-[var(--radius-sm)] hover:bg-indigo-500 hover:text-white transition-all group">
                                    <Phone size={24} className="text-emerald-400 group-hover:text-white" />
                                    <div>
                                        <p className="font-black text-sm uppercase tracking-tighter">Linha Directa</p>
                                        <p className="text-[10px] opacity-60 font-medium">+244 923 000 000</p>
                                    </div>
                                </a>
                            </div>

                            <button onClick={() => setContactModal(false)} className="w-full py-5 bg-white/5 border border-white/5 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                                Voltar para a Matriz Social
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
