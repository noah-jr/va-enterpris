import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus, Settings, Trash2, Edit3, CheckCircle2, X,
    Loader2, DollarSign, Users, Star, ToggleLeft, ToggleRight,
    FileCheck, Clock, XCircle, Eye, Download, Bell, Ban
} from 'lucide-react';
import api from '../api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { formatCurrency } from '../utils/format';

const BILLING_LABELS: Record<string, string> = {
    HOURLY: 'Por Hora', DAILY: 'Diário', WEEKLY: 'Semanal',
    BIWEEKLY: 'Quinzenal', MONTHLY: 'Mensal', QUARTERLY: 'Trimestral',
    SEMIANNUAL: 'Semestral', ANNUAL: 'Anual',
};

const BILLING_FIELDS = [
    { key: 'priceMonthly', label: 'Mensal' },
    { key: 'priceAnnual', label: 'Anual' },
];

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    PENDING:   { label: 'Pendente',  cls: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    APPROVED:  { label: 'Aprovado',  cls: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    REJECTED:  { label: 'Rejeitado', cls: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
    CANCELLED: { label: 'Cancelado', cls: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' },
};

const emptyPlan = {
    name: '', subtitle: '', maxUsers: 10, color: '#6366f1', popular: false,
    priceHourly: 0, priceDaily: 0, priceWeekly: 0, priceBiweekly: 0,
    priceMonthly: 0, priceQuarterly: 0, priceSemiannual: 0, priceAnnual: 0,
    features: '', modules: '',
};

export default function SubscriptionManagement() {
    const qc = useQueryClient();
    const [tab, setTab] = useState<'plans' | 'requests'>('plans');
    const [planModal, setPlanModal] = useState<'new' | 'edit' | null>(null);
    const [editPlan, setEditPlan] = useState<any>(null);
    const [form, setForm] = useState<any>(emptyPlan);
    const [reviewModal, setReviewModal] = useState<any>(null);
    const [adminNote, setAdminNote] = useState('');
    const [cancelModal, setCancelModal] = useState<any>(null);
    const [cancelReason, setCancelReason] = useState('');

    // ── Queries ─────────────────────────────────────────────────────────────
    const { data: plans = [], isLoading: plansLoading } = useQuery({
        queryKey: ['admin-plans'],
        queryFn: async () => (await api.get('/sub/plans/all')).data,
    });

    const { data: requests = [], isLoading: reqLoading } = useQuery({
        queryKey: ['sub-requests'],
        queryFn: async () => (await api.get('/sub/requests')).data,
    });

    // ── Mutations ────────────────────────────────────────────────────────────
    const createPlan = useMutation({
        mutationFn: (data: any) => api.post('/sub/plans', data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-plans'] }); setPlanModal(null); toast.success('Plano criado!'); },
        onError: () => toast.error('Erro ao criar plano.'),
    });

    const updatePlan = useMutation({
        mutationFn: ({ id, data }: any) => api.put(`/sub/plans/${id}`, data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-plans'] }); setPlanModal(null); toast.success('Plano actualizado!'); },
        onError: () => toast.error('Erro ao actualizar plano.'),
    });

    const deletePlan = useMutation({
        mutationFn: (id: string) => api.delete(`/sub/plans/${id}`),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-plans'] }); toast.success('Plano desactivado.'); },
    });

    const approve = useMutation({
        mutationFn: ({ id, note }: any) => api.post(`/sub/requests/${id}/approve`, { adminNote: note }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['sub-requests'] }); setReviewModal(null); toast.success('Subscrição aprovada e activada!'); },
        onError: () => toast.error('Erro ao aprovar.'),
    });

    const reject = useMutation({
        mutationFn: ({ id, note }: any) => api.post(`/sub/requests/${id}/reject`, { adminNote: note }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['sub-requests'] }); setReviewModal(null); toast.success('Pedido rejeitado.'); },
        onError: () => toast.error('Erro ao rejeitar.'),
    });

    const adminCancel = useMutation({
        mutationFn: ({ companyId, reason }: any) => api.post(`/sub/companies/${companyId}/cancel`, { reason }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['sub-requests'] }); setCancelModal(null); toast.success('Subscrição cancelada.'); },
        onError: () => toast.error('Erro ao cancelar.'),
    });

    // ── Helpers ──────────────────────────────────────────────────────────────
    const openNew = () => { setForm(emptyPlan); setPlanModal('new'); };
    const openEdit = (plan: any) => {
        setEditPlan(plan);
        setForm({
            ...plan,
            features: Array.isArray(plan.features) ? plan.features.join('\n') : plan.features || '',
            modules:  Array.isArray(plan.modules)  ? plan.modules.join('\n')  : plan.modules  || '',
        });
        setPlanModal('edit');
    };

    const submitPlan = () => {
        const data = {
            ...form,
            features: form.features.split('\n').map((s: string) => s.trim()).filter(Boolean),
            modules:  form.modules.split('\n').map((s: string) => s.trim()).filter(Boolean),
        };
        if (planModal === 'edit') updatePlan.mutate({ id: editPlan.id, data });
        else createPlan.mutate(data);
    };

    const pending = requests.filter((r: any) => r.status === 'PENDING');

    return (
        <div className="space-y-8 pb-24">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Gestão de Subscrições</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Controlo de planos, pedidos de adesão e licenciamento institucional.</p>
                </div>
                <div className="flex gap-3 items-center">
                    {pending.length > 0 && (
                        <span className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-2 rounded-lg text-[10px] font-bold">
                            <Bell size={14} /> {pending.length} pendente{pending.length > 1 ? 's' : ''}
                        </span>
                    )}
                    <button onClick={openNew} className="premium-button-primary">
                        <Plus size={18} /> Novo Plano
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1 rounded-[var(--radius-md)] gap-1 w-fit">
                {(['plans', 'requests'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-6 py-2 rounded-[var(--radius-sm)] text-xs font-bold transition-all ${tab === t ? 'bg-[var(--bg-primary)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                        {t === 'plans' ? 'Planos' : `Pedidos ${pending.length > 0 ? `(${pending.length})` : ''}`}
                    </button>
                ))}
            </div>

            {/* ── PLANS TAB ─── */}
            {tab === 'plans' && (
                plansLoading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[var(--accent)]" size={32} /></div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {plans.map((plan: any) => (
                            <div key={plan.id} className={`fluent-card p-6 flex flex-col gap-4 transition-all ${!plan.isActive ? 'opacity-50' : ''}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: (plan.color || '#6366f1') + '20' }}>
                                            <Star size={18} style={{ color: plan.color || '#6366f1' }} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-[var(--text-primary)]">{plan.name}</p>
                                            <p className="text-[9px] text-[var(--text-secondary)] opacity-50 font-bold">{plan.subtitle}</p>
                                        </div>
                                    </div>
                                    {plan.popular && <span className="text-[8px] font-bold bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 px-2 py-1 rounded-lg">Popular</span>}
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-[var(--bg-secondary)] rounded-lg p-2.5">
                                        <p className="text-[9px] font-bold text-[var(--text-secondary)] opacity-50 mb-1">Mensal</p>
                                        <p className="text-sm font-bold text-[var(--text-primary)]">{formatCurrency(plan.priceMonthly)}</p>
                                    </div>
                                    <div className="bg-[var(--bg-secondary)] rounded-lg p-2.5">
                                        <p className="text-[9px] font-bold text-[var(--text-secondary)] opacity-50 mb-1">Anual</p>
                                        <p className="text-sm font-bold text-[var(--text-primary)]">{formatCurrency(plan.priceAnnual)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)] opacity-60">
                                    <Users size={12} /> {plan.maxUsers === 0 ? 'Ilimitado' : `Até ${plan.maxUsers} utilizadores`}
                                </div>

                                <div className="flex gap-2 pt-2 border-t border-[var(--border-color)]/30">
                                    <button onClick={() => openEdit(plan)} className="flex-1 py-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--accent)]/10 text-[var(--text-secondary)] hover:text-[var(--accent)] text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all">
                                        <Edit3 size={12} /> Editar
                                    </button>
                                    <button onClick={() => deletePlan.mutate(plan.id)} className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all" title="Desactivar">
                                        <Trash2 size={14} />
                                    </button>
                                    <button onClick={() => updatePlan.mutate({ id: plan.id, data: { isActive: !plan.isActive } })} className="w-9 h-9 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--accent)] flex items-center justify-center transition-all" title={plan.isActive ? 'Desactivar' : 'Activar'}>
                                        {plan.isActive ? <ToggleRight size={18} className="text-emerald-500" /> : <ToggleLeft size={18} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {plans.length === 0 && (
                            <div className="fluent-card p-16 text-center">
                                <DollarSign size={40} className="mx-auto text-[var(--text-secondary)] opacity-20 mb-4" />
                                <p className="text-sm font-bold text-[var(--text-secondary)] opacity-40">Nenhum plano criado</p>
                            </div>
                        )}
                    </div>
                )
            )}

            {/* ── REQUESTS TAB ─── */}
            {tab === 'requests' && (
                reqLoading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[var(--accent)]" size={32} /></div> : (
                    <div className="space-y-3">
                        {requests.length === 0 && (
                            <div className="fluent-card p-16 text-center">
                                <FileCheck size={40} className="mx-auto text-[var(--text-secondary)] opacity-20 mb-4" />
                                <p className="text-sm font-bold text-[var(--text-secondary)] opacity-40">Nenhum pedido</p>
                            </div>
                        )}
                        {requests.map((req: any) => {
                            const st = STATUS_MAP[req.status] || STATUS_MAP.PENDING;
                            return (
                                <div key={req.id} className="fluent-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="font-bold text-sm text-[var(--text-primary)]">{req.company?.name}</p>
                                            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-lg border ${st.cls}`}>{st.label}</span>
                                        </div>
                                        <p className="text-[10px] text-[var(--text-secondary)] opacity-60 font-bold">
                                            {req.plan?.name} · {BILLING_LABELS[req.billing] || req.billing} · <span className="opacity-80">{format(new Date(req.requestedAt), 'dd MMM yyyy HH:mm', { locale: pt })}</span>
                                        </p>
                                        {req.adminNote && <p className="text-[10px] text-amber-500 mt-1 font-medium italic">Nota: {req.adminNote}</p>}
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {req.proofUrl && (
                                            <a href={req.proofUrl} target="_blank" rel="noopener noreferrer"
                                               className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all" title="Ver comprovativo">
                                                <Eye size={16} />
                                            </a>
                                        )}
                                        {req.status === 'PENDING' && (
                                            <>
                                                <button onClick={() => { setReviewModal(req); setAdminNote(''); }}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-xl hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20">
                                                    <CheckCircle2 size={14} /> Aprovar
                                                </button>
                                                <button onClick={() => { setReviewModal({ ...req, action: 'reject' }); setAdminNote(''); }}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 text-rose-500 text-[10px] font-bold rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20">
                                                    <XCircle size={14} /> Rejeitar
                                                </button>
                                            </>
                                        )}
                                        {req.status === 'APPROVED' && (
                                            <button onClick={() => { setCancelModal(req.company); setCancelReason(''); }}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 text-rose-500 text-[10px] font-bold rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20">
                                                <Ban size={14} /> Cancelar Subscrição
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            )}

            {/* ── PLAN MODAL ─── */}
            {planModal && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPlanModal(null)} />
                    <div className="relative bg-[var(--bg-primary)] border border-[var(--border-color)]/50 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">
                                {planModal === 'edit' ? 'Editar Plano' : 'Novo Plano'}
                            </h2>
                            <button onClick={() => setPlanModal(null)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-xl"><X size={20} /></button>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)]">Nome *</label>
                                    <input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))}
                                        placeholder="Ex: Profissional" className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)]" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)]">Subtítulo</label>
                                    <input value={form.subtitle} onChange={e => setForm((f: any) => ({ ...f, subtitle: e.target.value }))}
                                        placeholder="Ex: Para PMEs em crescimento" className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)]" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)]">Máx. Utilizadores (0 = ∞)</label>
                                    <input type="number" value={form.maxUsers} onChange={e => setForm((f: any) => ({ ...f, maxUsers: e.target.value }))}
                                        className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)]" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)]">Cor</label>
                                    <div className="flex gap-3 items-center">
                                        <input type="color" value={form.color} onChange={e => setForm((f: any) => ({ ...f, color: e.target.value }))}
                                            className="w-12 h-10 rounded-xl border border-[var(--border-color)]/50 cursor-pointer bg-transparent" />
                                        <input value={form.color} onChange={e => setForm((f: any) => ({ ...f, color: e.target.value }))}
                                            className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)]" />
                                    </div>
                                </div>
                            </div>

                            {/* Prices grid */}
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] mb-3 block">Preços por Ciclo</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {BILLING_FIELDS.map(({ key, label }) => (
                                        <div key={key} className="flex flex-col gap-1">
                                            <label className="text-[9px] font-bold text-[var(--text-secondary)] opacity-60">{label}</label>
                                            <input type="number" value={form[key]} onChange={e => setForm((f: any) => ({ ...f, [key]: e.target.value }))}
                                                placeholder="0" className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)]" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)]">Funcionalidades (uma por linha)</label>
                                    <textarea rows={5} value={form.features} onChange={e => setForm((f: any) => ({ ...f, features: e.target.value }))}
                                        placeholder="Facturação electrónica&#10;Gestão de RH&#10;Relatórios avançados"
                                        className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)]">Módulos (um por linha)</label>
                                    <textarea rows={5} value={form.modules} onChange={e => setForm((f: any) => ({ ...f, modules: e.target.value }))}
                                        placeholder="invoices&#10;hr&#10;finance"
                                        className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none" />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={form.popular} onChange={e => setForm((f: any) => ({ ...f, popular: e.target.checked }))} className="w-4 h-4 rounded accent-[var(--accent)]" />
                                    <span className="text-[10px] font-bold text-[var(--text-secondary)]">Marcar como Popular</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setPlanModal(null)} className="flex-1 py-3 rounded-xl border border-[var(--border-color)]/50 text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all">Cancelar</button>
                                <button onClick={submitPlan} disabled={!form.name || createPlan.isPending || updatePlan.isPending}
                                    className="flex-1 py-3 bg-[var(--accent)] text-white rounded-xl text-[10px] font-bold hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                                    {(createPlan.isPending || updatePlan.isPending) ? <Loader2 size={14} className="animate-spin" /> : null}
                                    {planModal === 'edit' ? 'Guardar Alterações' : 'Criar Plano'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── REVIEW MODAL ─── */}
            {reviewModal && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReviewModal(null)} />
                    <div className="relative bg-[var(--bg-primary)] border border-[var(--border-color)]/50 rounded-3xl p-6 sm:p-8 w-full max-w-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">
                                {reviewModal.action === 'reject' ? 'Rejeitar Pedido' : 'Aprovar Subscrição'}
                            </h2>
                            <button onClick={() => setReviewModal(null)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-xl"><X size={20} /></button>
                        </div>

                        <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 mb-5 space-y-2">
                            <p className="text-sm font-bold text-[var(--text-primary)]">{reviewModal.company?.name}</p>
                            <p className="text-[10px] text-[var(--text-secondary)] opacity-60 font-bold">
                                {reviewModal.plan?.name} · {BILLING_LABELS[reviewModal.billing] || reviewModal.billing}
                            </p>
                            {reviewModal.proofUrl && (
                                <a href={reviewModal.proofUrl} target="_blank" rel="noopener noreferrer"
                                   className="flex items-center gap-2 text-sky-500 text-[10px] font-bold hover:underline">
                                    <Download size={12} /> Ver Comprovativo
                                </a>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5 mb-5">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)]">
                                {reviewModal.action === 'reject' ? 'Motivo da Rejeição *' : 'Nota Admin (opcional)'}
                            </label>
                            <textarea rows={3} value={adminNote} onChange={e => setAdminNote(e.target.value)}
                                placeholder={reviewModal.action === 'reject' ? 'Ex: Comprovativo ilegível...' : 'Ex: Subscrição iniciada conforme acordado...'}
                                className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none" />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setReviewModal(null)} className="flex-1 py-3 rounded-xl border border-[var(--border-color)] text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all">Cancelar</button>
                            {reviewModal.action === 'reject' ? (
                                <button onClick={() => reject.mutate({ id: reviewModal.id, note: adminNote })} disabled={!adminNote || reject.isPending}
                                    className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-bold hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                                    {reject.isPending ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Rejeitar
                                </button>
                            ) : (
                                <button onClick={() => approve.mutate({ id: reviewModal.id, note: adminNote })} disabled={approve.isPending}
                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-bold hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                                    {approve.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Aprovar & Activar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── CANCEL MODAL ─── */}
            {cancelModal && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCancelModal(null)} />
                    <div className="relative bg-[var(--bg-primary)] border border-rose-500/30 rounded-3xl p-6 sm:p-8 w-full max-w-md">
                        <h2 className="text-lg font-bold text-rose-500 mb-4">Cancelar Subscrição</h2>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">Esta acção cancela imediatamente a subscrição activa da empresa <strong className="text-[var(--text-primary)]">{cancelModal.name}</strong>.</p>
                        <div className="flex flex-col gap-1.5 mb-5">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)]">Motivo (opcional)</label>
                            <textarea rows={2} value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                                className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-rose-500 resize-none" />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setCancelModal(null)} className="flex-1 py-3 rounded-xl border border-[var(--border-color)]/50 text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all">Voltar</button>
                            <button onClick={() => adminCancel.mutate({ companyId: cancelModal.id, reason: cancelReason })} disabled={adminCancel.isPending}
                                className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-bold hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                                {adminCancel.isPending ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />} Confirmar Cancelamento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
