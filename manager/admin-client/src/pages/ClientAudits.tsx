import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    FileCheck, Search, Eye, CheckCircle2, XCircle,
    Loader2, Download, Building, Calendar, FileText
} from 'lucide-react';
import api from '../api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    PENDING:   { label: 'Pendente',  cls: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    APPROVED:  { label: 'Aprovado',  cls: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    REJECTED:  { label: 'Rejeitado', cls: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
};

export default function ClientAudits() {
    const qc = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [reviewModal, setReviewModal] = useState<any>(null);
    const [adminNote, setAdminNote] = useState('');

    const { data: audits = [], isLoading } = useQuery({
        queryKey: ['client-audits'],
        queryFn: async () => {
            const res = await api.get('/admin/audits');
            return res.data;
        },
    });

    const approve = useMutation({
        mutationFn: async ({ id, note }: any) => {
            const res = await api.post(`/admin/audits/${id}/approve`, { note });
            return res.data;
        },
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['client-audits'] }); setReviewModal(null); toast.success('Auditoria aprovada com sucesso!'); },
        onError: () => toast.error('Erro ao aprovar auditoria.'),
    });

    const reject = useMutation({
        mutationFn: async ({ id, note }: any) => {
            const res = await api.post(`/admin/audits/${id}/reject`, { note });
            return res.data;
        },
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['client-audits'] }); setReviewModal(null); toast.success('Documento rejeitado.'); },
        onError: () => toast.error('Erro ao rejeitar documento.'),
    });

    const filtered = audits.filter((a: any) => a.company?.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-8 pb-24">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Auditoria Contabilística</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Revisão central de documentos fiscais e contabilísticos submetidos pelas empresas.</p>
                </div>
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="Pesquisar empresa..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                    />
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[var(--accent)]" size={32} /></div>
            ) : (
                <div className="space-y-3">
                    {filtered.length === 0 && (
                        <div className="fluent-card p-16 text-center">
                            <FileCheck size={40} className="mx-auto text-[var(--text-secondary)] opacity-20 mb-4" />
                            <p className="text-sm font-bold text-[var(--text-secondary)] opacity-40">Nenhum documento pendente de auditoria</p>
                        </div>
                    )}
                    {filtered.map((audit: any) => {
                        const st = STATUS_MAP[audit.status] || STATUS_MAP.PENDING;
                        return (
                            <div key={audit.id} className="fluent-card p-5 flex flex-col md:flex-row md:items-center gap-5">
                                <div className="flex-1 min-w-0 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="font-bold text-[15px] text-[var(--text-primary)] flex items-center gap-2">
                                                <Building size={14} className="text-[var(--text-muted)]" /> {audit.company?.name}
                                            </p>
                                            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-lg border ${st.cls}`}>{st.label}</span>
                                        </div>
                                        <p className="text-[11px] text-[var(--text-secondary)] font-medium flex items-center gap-2">
                                            <span className="font-bold uppercase text-[var(--accent)]">{audit.type}</span> •
                                            <Calendar size={12} className="inline opacity-70" /> {audit.period} •
                                            Submetido a {format(new Date(audit.submittedAt), 'dd MMM yyyy HH:mm', { locale: pt })}
                                        </p>
                                        {audit.adminNote && <p className="text-[11px] text-rose-500 mt-1.5 font-medium italic bg-rose-500/10 w-fit px-2 py-0.5 rounded-md border border-rose-500/20">Nota: {audit.adminNote}</p>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <a href={audit.documentUrl} target="_blank" rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all" title="Analisar Documento">
                                        <Eye size={18} />
                                    </a>
                                    {audit.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => { setReviewModal({ ...audit, action: 'approve' }); setAdminNote(''); }}
                                                className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20" title="Aprovar">
                                                <CheckCircle2 size={18} />
                                            </button>
                                            <button onClick={() => { setReviewModal({ ...audit, action: 'reject' }); setAdminNote(''); }}
                                                className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20" title="Rejeitar">
                                                <XCircle size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── REVIEW MODAL ─── */}
            {reviewModal && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReviewModal(null)} />
                    <div className="relative bg-[var(--bg-primary)] border border-[var(--border-color)]/50 rounded-3xl p-6 sm:p-8 w-full max-w-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">
                                {reviewModal.action === 'reject' ? 'Rejeitar Documento' : 'Aprovar Documento'}
                            </h2>
                            <button onClick={() => setReviewModal(null)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-xl"><XCircle size={20} className="text-[var(--text-muted)]" /></button>
                        </div>

                        <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 mb-5 space-y-2">
                            <p className="text-sm font-bold text-[var(--text-primary)]">{reviewModal.company?.name}</p>
                            <p className="text-[10px] text-[var(--text-secondary)] opacity-80 font-bold uppercase">
                                {reviewModal.type} • {reviewModal.period}
                            </p>
                            <a href={reviewModal.documentUrl} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sky-500 text-[10px] font-bold hover:underline bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20 mt-2">
                                <Download size={14} /> Fazer Download do Documento
                            </a>
                        </div>

                        <div className="flex flex-col gap-1.5 mb-5">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)]">
                                {reviewModal.action === 'reject' ? 'Motivo da Rejeição / Observações Fiscais *' : 'Notas da Auditoria (opcional)'}
                            </label>
                            <textarea rows={4} value={adminNote} onChange={e => setAdminNote(e.target.value)}
                                placeholder={reviewModal.action === 'reject' ? 'Ex: Faltam os anexos do IVA...' : 'Ex: Balancete validado conforme as normas legais...'}
                                className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none" />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setReviewModal(null)} className="flex-1 py-3 rounded-xl border border-[var(--border-color)] text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all">Cancelar</button>
                            {reviewModal.action === 'reject' ? (
                                <button onClick={() => reject.mutate({ id: reviewModal.id, note: adminNote })} disabled={!adminNote || reject.isPending}
                                    className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-bold hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                                    {reject.isPending ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Confirmar Rejeição
                                </button>
                            ) : (
                                <button onClick={() => approve.mutate({ id: reviewModal.id, note: adminNote })} disabled={approve.isPending}
                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-bold hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                                    {approve.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Aprovar Auditoria
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
