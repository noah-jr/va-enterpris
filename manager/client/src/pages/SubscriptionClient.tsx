import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Zap, Clock, CheckCircle2, XCircle, Upload, Loader2,
    Bell, FileText, RefreshCw, Crown, ShieldCheck,
    AlertTriangle, X, Info
} from 'lucide-react';
import api from '../api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { formatCurrency } from '../utils/format';
import { io as socketIO } from 'socket.io-client';
import { authStore } from '../auth/authStore';

const BILLING_OPTS = [
    { key: 'HOURLY',     label: 'Por Hora',   field: 'priceHourly'    },
    { key: 'DAILY',      label: 'Diário',      field: 'priceDaily'     },
    { key: 'WEEKLY',     label: 'Semanal',     field: 'priceWeekly'    },
    { key: 'BIWEEKLY',   label: 'Quinzenal',   field: 'priceBiweekly'  },
    { key: 'MONTHLY',    label: 'Mensal',      field: 'priceMonthly'   },
    { key: 'QUARTERLY',  label: 'Trimestral',  field: 'priceQuarterly' },
    { key: 'SEMIANNUAL', label: 'Semestral',   field: 'priceSemiannual'},
    { key: 'ANNUAL',     label: 'Anual',       field: 'priceAnnual'    },
];

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
    PENDING:   { label: 'Em análise', color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10',    icon: Clock         },
    APPROVED:  { label: 'Aprovada',   color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10', icon: CheckCircle2  },
    REJECTED:  { label: 'Rejeitada',  color: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10',       icon: XCircle       },
    CANCELLED: { label: 'Cancelada',  color: 'text-[var(--text-muted)] bg-[var(--bg-primary)]',    icon: X             },
};

export default function SubscriptionClient() {
    const qc = useQueryClient();
    const user = authStore.getUser();
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [billing, setBilling] = useState('MONTHLY');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const { data: plans = [] } = useQuery({
        queryKey: ['client-sub-plans'],
        queryFn: async () => (await api.get('/sub/plans')).data,
    });

    const { data: requests = [], refetch: refetchRequests } = useQuery({
        queryKey: ['my-sub-requests'],
        queryFn: async () => (await api.get('/sub/requests/mine')).data,
    });

    const { data: notifications = [], refetch: refetchNotifs } = useQuery({
        queryKey: ['my-notifs'],
        queryFn: async () => (await api.get('/sub/requests/notifications')).data,
    });

    const markRead = useMutation({
        mutationFn: () => api.patch('/sub/requests/notifications/read', {}),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['my-notifs'] }),
    });

    useEffect(() => {
        const socket = socketIO(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            query: { companyId: user?.companyId, role: user?.role },
            transports: ['websocket'],
        });
        socket.on('sub:approved', (data: any) => {
            toast.success(`Subscrição "${data.planName}" aprovada!`, { duration: 8000 });
            refetchRequests(); refetchNotifs();
            qc.invalidateQueries({ queryKey: ['subscription-info'] });
        });
        socket.on('sub:rejected', () => {
            toast.error('Pedido de subscrição rejeitado.', { duration: 8000 });
            refetchRequests(); refetchNotifs();
        });
        socket.on('sub:cancelled', (data: any) => {
            toast.warning(`Subscrição cancelada. ${data.reason || ''}`, { duration: 8000 });
            refetchRequests(); refetchNotifs();
            qc.invalidateQueries({ queryKey: ['subscription-info'] });
        });
        return () => { socket.disconnect(); };
    }, []);

    const submit = async () => {
        if (!selectedPlan || !proofFile) {
            toast.error('O comprovativo de pagamento é obrigatório.');
            return;
        }
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('planId', selectedPlan.id);
            fd.append('billing', billing);
            if (proofFile) fd.append('proof', proofFile);
            await api.post('/sub/requests', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Pedido submetido! Aguarda aprovação.');
            setShowModal(false);
            setSelectedPlan(null);
            setProofFile(null);
            refetchRequests();
        } catch (e: any) {
            toast.error(e.response?.data?.error || 'Erro ao submeter pedido.');
        } finally {
            setSubmitting(false);
        }
    };

    const unread       = notifications.filter((n: any) => !n.read).length;
    const pending      = requests.find((r: any) => r.status === 'PENDING');
    const billingField = BILLING_OPTS.find(o => o.key === billing)?.field;
    const priceFor     = (plan: any) => (billingField ? plan[billingField] : plan.priceMonthly) ?? 0;

    return (
        <div className="space-y-6 pb-12 max-w-5xl mx-auto">

            {/* Cabeçalho */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-600 text-[var(--text-primary)] flex items-center gap-2">
                        <Crown size={18} className="text-[var(--accent)]" />
                        Minha subscrição
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">
                        Selecione um plano e envie o comprovativo de pagamento.
                    </p>
                </div>

                {/* Notificações */}
                <div className="relative">
                    <button
                        onClick={() => { setNotifOpen(v => !v); if (!notifOpen) markRead.mutate(); }}
                        className="relative w-9 h-9 rounded-[var(--radius-md)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
                    >
                        <Bell size={16} />
                        {unread > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--accent)] text-white text-[9px] font-600 rounded-full flex items-center justify-center">
                                {unread}
                            </span>
                        )}
                    </button>

                    {notifOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-80 premium-card overflow-hidden z-50 animate-fade-in">
                            <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
                                <p className="text-xs font-600 text-[var(--text-primary)]">Notificações</p>
                                <button onClick={() => setNotifOpen(false)}>
                                    <X size={14} className="text-[var(--text-muted)]" />
                                </button>
                            </div>
                            {notifications.length === 0 ? (
                                <p className="p-6 text-center text-sm text-[var(--text-muted)]">Sem notificações.</p>
                            ) : notifications.slice(0, 10).map((n: any) => (
                                <div key={n.id} className={`px-4 py-3 flex gap-3 border-b border-[var(--border-color)] last:border-0 ${!n.read ? 'bg-[var(--accent-soft)]' : ''}`}>
                                    <Info size={14} className="text-[var(--accent)] mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-500 text-[var(--text-primary)] truncate">{n.title}</p>
                                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{n.body}</p>
                                        <p className="text-[10px] text-[var(--text-muted)] mt-1">
                                            {format(new Date(n.createdAt), 'dd MMM HH:mm', { locale: pt })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Pedido pendente */}
            {pending && (
                <div className="premium-card border-l-2 border-l-amber-500 px-4 py-3 flex items-center gap-3">
                    <Clock size={16} className="text-amber-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-500 text-[var(--text-primary)]">Pedido em análise</p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            <strong>{pending.plan?.name}</strong> · {pending.billing} · enviado em{' '}
                            {format(new Date(pending.requestedAt), 'dd MMM yyyy HH:mm', { locale: pt })}
                        </p>
                    </div>
                    <button onClick={() => refetchRequests()} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                        <RefreshCw size={14} />
                    </button>
                </div>
            )}

            {/* Ciclo de faturação */}
            <div className="flex flex-wrap gap-1.5">
                {BILLING_OPTS.map(opt => (
                    <button
                        key={opt.key}
                        onClick={() => setBilling(opt.key)}
                        className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-500 transition-colors border ${
                            billing === opt.key
                                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                                : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Planos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {plans.map((plan: any) => {
                    const price    = priceFor(plan);
                    const selected = selectedPlan?.id === plan.id;
                    return (
                        <div
                            key={plan.id}
                            onClick={() => setSelectedPlan(selected ? null : plan)}
                            className={`premium-card p-5 flex flex-col gap-4 cursor-pointer transition-all relative ${
                                selected
                                    ? 'border-[var(--accent)]'
                                    : 'hover:border-[var(--border-strong)]'
                            }`}
                        >
                            {plan.popular && (
                                <span className="absolute top-3 right-3 badge bg-[var(--accent-soft)] text-[var(--accent)] text-[10px]">
                                    Mais popular
                                </span>
                            )}

                            {/* Detalhes do plano */}
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
                                    style={{ background: (plan.color || '#3b82f6') + '18' }}
                                >
                                    <Zap size={16} style={{ color: plan.color || '#3b82f6' }} />
                                </div>
                                <div>
                                    <p className="text-sm font-600 text-[var(--text-primary)]">{plan.name}</p>
                                    {plan.subtitle && (
                                        <p className="text-xs text-[var(--text-muted)]">{plan.subtitle}</p>
                                    )}
                                </div>
                            </div>

                            {/* Preço */}
                            <div>
                                {price > 0 ? (
                                    <p className="text-2xl font-600 text-[var(--text-primary)] tabular-nums">
                                        {formatCurrency(price)}
                                        <span className="text-xs font-400 text-[var(--text-muted)] ml-1">
                                            / {BILLING_OPTS.find(o => o.key === billing)?.label}
                                        </span>
                                    </p>
                                ) : (
                                    <p className="text-sm text-[var(--text-muted)]">Indisponível neste ciclo</p>
                                )}
                            </div>

                            {/* Funcionalidades */}
                            <ul className="space-y-1.5 flex-1">
                                {(plan.features || []).slice(0, 4).map((f: string, i: number) => (
                                    <li key={i} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                        <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            {/* Indicador de seleção */}
                            <div className={`flex items-center justify-center gap-2 py-2 rounded-[var(--radius-md)] text-xs font-500 border transition-colors ${
                                selected
                                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                                    : 'border-[var(--border-color)] text-[var(--text-muted)]'
                            }`}>
                                {selected ? <><ShieldCheck size={13} /> Selecionado</> : <><Zap size={13} /> Selecionar</>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Barra de ação */}
            {selectedPlan && (
                <div className="premium-card border-[var(--accent)] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
                    <div>
                        <p className="text-sm font-600 text-[var(--text-primary)]">
                            {selectedPlan.name} · {BILLING_OPTS.find(o => o.key === billing)?.label}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            {formatCurrency(priceFor(selectedPlan))} · Envie o comprovativo para ativação
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        disabled={!!pending}
                        className="premium-button-primary shrink-0"
                    >
                        <Upload size={14} /> Enviar pedido
                    </button>
                </div>
            )}

            {/* Histórico */}
            {requests.length > 0 && (
                <div className="premium-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-[var(--border-color)]">
                        <p className="section-title">Histórico de pedidos</p>
                    </div>
                    <div className="divide-y divide-[var(--border-color)]">
                        {requests.map((req: any) => {
                            const st   = STATUS_MAP[req.status] || STATUS_MAP.PENDING;
                            const Icon = st.icon;
                            return (
                                <div key={req.id} className="px-4 py-3 flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ${st.color}`}>
                                        <Icon size={14} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-500 text-[var(--text-primary)] truncate">{req.plan?.name}</p>
                                        <p className="text-xs text-[var(--text-muted)]">
                                            {req.billing} · {format(new Date(req.requestedAt), 'dd MMM yyyy', { locale: pt })}
                                        </p>
                                        {req.adminNote && (
                                            <p className="text-xs text-amber-500 mt-0.5 italic">"{req.adminNote}"</p>
                                        )}
                                    </div>
                                    <span className={`badge text-[10px] shrink-0 ${st.color}`}>{st.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Modal de envio */}
            {showModal && selectedPlan && (
                <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setShowModal(false)} />
                    <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)] w-full max-w-md animate-fade-in">

                        {/* Cabeçalho */}
                        <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
                            <h2 className="text-base font-600 text-[var(--text-primary)]">Enviar pedido</h2>
                            <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors">
                                <X size={15} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Resumo */}
                            <div className="bg-[var(--bg-primary)] rounded-[var(--radius-md)] px-4 py-3 border border-[var(--border-color)]">
                                <p className="text-sm font-500 text-[var(--text-primary)]">{selectedPlan.name}</p>
                                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                    {BILLING_OPTS.find(o => o.key === billing)?.label} · {formatCurrency(priceFor(selectedPlan))}
                                </p>
                            </div>

                            {/* Envio de ficheiro */}
                            <div className="space-y-1.5">
                                <label className="premium-label">Comprovativo de pagamento</label>
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

                            {/* Aviso */}
                            <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-3 py-2.5 rounded-[var(--radius-md)]">
                                <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                                A subscrição é ativada após validação do comprovativo.
                            </div>

                            {/* Ações */}
                            <div className="flex gap-2 pt-1">
                                <button onClick={() => setShowModal(false)} className="premium-button-secondary flex-1">
                                    Cancelar
                                </button>
                                <button onClick={submit} disabled={submitting || !proofFile} className="premium-button-primary flex-1">
                                    {submitting
                                        ? <><Loader2 size={14} className="animate-spin" /> A enviar...</>
                                        : <><Upload size={14} /> Enviar</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
