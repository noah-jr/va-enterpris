import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { useMe } from '../auth/useAuth';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/format';
import {
    FolderOpen, Upload, FileText, CheckCircle2, Clock, AlertCircle,
    XCircle, Plus, ChevronRight, Eye, MessageSquare, Loader2,
    Files, BookOpen, TrendingUp, ShieldAlert, Paperclip,
    Send, LayoutDashboard, History, Zap, Calendar, Search,
    Target, Download
} from 'lucide-react';
import { Modal } from '../components/Modal';

const fmt = (v: number) => formatCurrency(v);

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    PENDING_SUBMISSION: { label: 'Pendente', color: 'text-slate-500', bg: 'bg-slate-50' },
    SUBMITTED: { label: 'Submetido', color: 'text-blue-600', bg: 'bg-blue-50' },
    UNDER_REVIEW: { label: 'Análise', color: 'text-amber-600', bg: 'bg-amber-50' },
    PENDING_INFO: { label: 'Informação', color: 'text-orange-600', bg: 'bg-orange-50' },
    REVIEWED: { label: 'Revisto', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    CLOSED: { label: 'Encerrado', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    REJECTED: { label: 'Rejeitado', color: 'text-rose-600', bg: 'bg-rose-50' },
};

const getFileUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;

    // Normalize slashes
    const normalized = '/' + url.replace(/\\/g, '/').replace(/^\/+/, '');

    // In production, prepend the base API URL without '/api'
    const baseUrl = api.defaults.baseURL || '';
    if (baseUrl && baseUrl.startsWith('http')) {
        return baseUrl.replace(/\/api\/?$/, '') + normalized;
    }
    return normalized;
};

export default function AccountingPortal() {
    const { data: me } = useMe();
    const isAdmin = me?.role === 'ADMIN' || me?.role === 'SUPER_ADMIN';
    const isModuleEnabled = me?.company?.enabledModules?.includes('accounting') || me?.company?.enabledModules?.includes('finance') || me?.role === 'SUPER_ADMIN';
    const qc = useQueryClient();

    const { data: configData, isLoading: configLoading } = useQuery({
        queryKey: ['acc-config-docs'],
        queryFn: async () => {
            const res = await api.get('/accounting-cases/config/required-documents');
            return res.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2
    });

    // All document types and banks come exclusively from the server
    const REQUIRED_DOCUMENTS: any[] = configData?.requiredDocuments ?? [];
    const BANKS_LIST: string[] = configData?.banksList ?? [];

    const [selectedCase, setSelectedCase] = useState<any>(null);
    const [showNewCase, setShowNewCase] = useState(false);
    const [showDocConfigModal, setShowDocConfigModal] = useState(false);
    const [customDocTypes, setCustomDocTypes] = useState<any[]>([]);
    const [newDocType, setNewDocType] = useState({ key: '', label: '', description: '', workflow: 'DIRECT' as 'DIRECT' | 'BANK' });
    const [showReview, setShowReview] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showNewAccount, setShowNewAccount] = useState(false);
    const [showNewJournal, setShowNewJournal] = useState(false);
    const [activeTab, setActiveTab] = useState<'dossiers' | 'chart' | 'journal' | 'statements'>('dossiers');
    const [statementSubTab, setStatementSubTab] = useState<'trial' | 'balance' | 'income'>('trial');
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [filterMonth, setFilterMonth] = useState<number | undefined>(undefined);
    const [chartSearch, setChartSearch] = useState('');
    const [expandedJournalEntry, setExpandedJournalEntry] = useState<string | null>(null);

    useEffect(() => {
        if (configData?.requiredDocuments) {
            setCustomDocTypes(configData.requiredDocuments);
        }
    }, [configData]);

    // Form de Lançamento
    const [journalLines, setJournalLines] = useState<Array<{ accountId: string; debit: number; credit: number; description: string }>>([
        { accountId: '', debit: 0, credit: 0, description: '' },
        { accountId: '', debit: 0, credit: 0, description: '' }
    ]);
    const fileRef = useRef<HTMLInputElement>(null);
    const chatFileRef = useRef<HTMLInputElement>(null);

    const [activeReq, setActiveReq] = useState<any>(null);
    const [showBankModal, setShowBankModal] = useState(false);
    const [showJustifyModal, setShowJustifyModal] = useState(false);
    const [selectedBank, setSelectedBank] = useState('BAI (Banco Angolano de Investimentos)');
    const [justification, setJustification] = useState('');

    const handleAIAnalyze = async () => {
        if (!showReview?.case?.id) return;
        setIsAnalyzing(true);
        toast.info('O Agente IA está a analisar os documentos... Isto pode demorar alguns segundos.', { duration: 4000 });
        try {
            const res = await api.post(`/accounting-cases/${showReview.case.id}/ai-analyze`);
            const data = res.data;

            const form = document.getElementById('review-form') as HTMLFormElement;
            if (form) {
                const adminNoteEl = form.elements.namedItem('adminNote') as HTMLInputElement;
                if (adminNoteEl) adminNoteEl.value = data.adminNote;

                if (showReview.status === 'REVIEWED') {
                    const fields = ['totalRevenue', 'totalExpense', 'ivaLiquidado', 'irtAmount', 'netResult'];
                    fields.forEach(f => {
                        const el = form.elements.namedItem(f) as HTMLInputElement;
                        if (el) el.value = data[f];
                    });
                }
            }
            toast.success('Análise do Agente IA concluída com sucesso!');
        } catch (error) {
            toast.error('Erro na análise de Inteligência Artificial.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // ── Queries ──────────────────────────────────────────────────────────────
    const { data: summary } = useQuery({
        queryKey: ['acc-cases-summary'],
        queryFn: () => api.get('/accounting-cases/summary').then(r => r.data)
    });

    const { data: cases = [], isLoading } = useQuery({
        queryKey: ['acc-cases'],
        queryFn: () => api.get('/accounting-cases').then(r => r.data)
    });

    const { data: clientsData = [] } = useQuery({
        queryKey: ['clients-list'],
        queryFn: () => api.get('/clients').then(r => r.data),
        enabled: isModuleEnabled
    });

    const { data: caseDetail, isLoading: loadingDetail } = useQuery({
        queryKey: ['acc-case', selectedCase?.id],
        queryFn: () => api.get(`/accounting-cases/${selectedCase.id}`).then(r => r.data),
        enabled: !!selectedCase?.id
    });

    const { data: chartData = [] } = useQuery({
        queryKey: ['acc-chart'],
        queryFn: () => api.get('/accounting-cases/chart').then(r => r.data),
        enabled: isModuleEnabled
    });

    const { data: journalData = [] } = useQuery({
        queryKey: ['acc-journal', selectedCase?.id],
        queryFn: () => api.get('/accounting-cases/journal', {
            params: selectedCase ? { caseId: selectedCase.id } : {}
        }).then(r => r.data),
        enabled: isModuleEnabled
    });

    const { data: balanceSheetData } = useQuery({
        queryKey: ['acc-balance-sheet', filterYear],
        queryFn: () => api.get('/accounting-cases/balance-sheet', { params: { year: filterYear } }).then(r => r.data),
        enabled: isModuleEnabled && activeTab === 'statements'
    });

    const { data: incomeStatementData } = useQuery({
        queryKey: ['acc-income-statement', filterYear, filterMonth],
        queryFn: () => api.get('/accounting-cases/income-statement', {
            params: { year: filterYear, month: filterMonth }
        }).then(r => r.data),
        enabled: isModuleEnabled && activeTab === 'statements'
    });

    const { data: trialBalanceData } = useQuery({
        queryKey: ['acc-trial-balance', filterYear, filterMonth],
        queryFn: () => api.get('/accounting-cases/trial-balance', {
            params: { year: filterYear, month: filterMonth }
        }).then(r => r.data),
        enabled: isModuleEnabled && activeTab === 'statements'
    });

    // ── Mutations ────────────────────────────────────────────────────────────
    const updateRequiredDocsConfig = useMutation({
        mutationFn: (d: any) => api.put('/accounting-cases/config/required-documents', d),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['acc-config-docs'] });
            setShowDocConfigModal(false);
            toast.success('Configurações de documentos actualizadas com sucesso.');
        },
        onError: () => toast.error('Erro ao actualizar configurações de documentos.')
    });

    const createCase = useMutation({
        mutationFn: (d: any) => api.post('/accounting-cases', d),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['acc-cases'] }); setShowNewCase(false); toast.success('Dossier criado com sucesso.'); }
    });

    const updateStatus = useMutation({
        mutationFn: ({ id, ...d }: any) => api.patch(`/accounting-cases/${id}/status`, d),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['acc-cases'] }); qc.invalidateQueries({ queryKey: ['acc-case', selectedCase?.id] }); toast.success('Estado atualizado.'); setShowReview(null); }
    });

    const reviewDoc = useMutation({
        mutationFn: ({ id, ...d }: any) => api.patch(`/accounting-cases/documents/${id}/review`, d),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['acc-case', selectedCase?.id] }); toast.success('Documento validado.'); }
    });

    const sendMessage = useMutation({
        mutationFn: (d: any) => api.post(`/accounting-cases/${selectedCase.id}/messages`, d),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['acc-case', selectedCase?.id] }); setMessageText(''); }
    });

    const createAccount = useMutation({
        mutationFn: (d: any) => api.post('/accounting-cases/chart', d),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['acc-chart'] });
            setShowNewAccount(false);
            toast.success('Conta criada com sucesso.');
        },
        onError: () => toast.error('Erro ao criar conta de lançamento.')
    });

    const createJournalEntry = useMutation({
        mutationFn: (d: any) => api.post('/accounting-cases/journal', d),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['acc-journal'] });
            setShowNewJournal(false);
            setJournalLines([
                { accountId: '', debit: 0, credit: 0, description: '' },
                { accountId: '', debit: 0, credit: 0, description: '' }
            ]);
            toast.success('Lançamento registado com sucesso.');
        },
        onError: () => toast.error('Erro ao registar lançamento.')
    });

    const postJournalEntry = useMutation({
        mutationFn: (id: string) => api.patch(`/accounting-cases/journal/${id}/post`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['acc-journal'] });
            toast.success('Lançamento publicado no diário definitivo.');
        },
        onError: () => toast.error('Erro ao publicar lançamento.')
    });

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim()) return;
        sendMessage.mutate({ content: messageText, senderRole: isAdmin ? 'CONSULTANT' : 'CLIENT' });
    };

    const deleteDoc = useMutation({
        mutationFn: (docId: string) => api.delete(`/accounting-cases/documents/${docId}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['acc-case', selectedCase?.id] });
            qc.invalidateQueries({ queryKey: ['acc-cases'] });
            toast.success('Documento removido.');
        },
        onError: () => toast.error('Erro ao remover documento.')
    });

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedCase || !activeReq) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('name', `${activeReq.label} - ${file.name}`);
            fd.append('type', activeReq.key);
            await api.post(`/accounting-cases/${selectedCase.id}/documents`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            qc.invalidateQueries({ queryKey: ['acc-case', selectedCase.id] });
            qc.invalidateQueries({ queryKey: ['acc-cases'] });
            toast.success('Documento submetido.');
        } catch {
            toast.error('Erro no envio do ficheiro.');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const handleBankUpload = async (file: File) => {
        if (!file || !selectedCase || !activeReq) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('name', `${activeReq.label} (${selectedBank}) - ${file.name}`);
            fd.append('type', activeReq.key);
            fd.append('description', `Banco: ${selectedBank}`);
            await api.post(`/accounting-cases/${selectedCase.id}/documents`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            qc.invalidateQueries({ queryKey: ['acc-case', selectedCase.id] });
            qc.invalidateQueries({ queryKey: ['acc-cases'] });
            toast.success('Documento bancário submetido.');
            setShowBankModal(false);
        } catch {
            toast.error('Erro no envio do documento bancário.');
        } finally {
            setUploading(false);
        }
    };

    const handleMarkNotApplicable = async () => {
        if (!activeReq || !selectedCase) return;
        setUploading(true);
        try {
            await api.post(`/accounting-cases/${selectedCase.id}/documents`, {
                name: `${activeReq.label} - Não Aplicável`,
                type: activeReq.key,
                status: 'NOT_APPLICABLE',
                description: justification || 'Não aplicável para este exercício'
            });
            qc.invalidateQueries({ queryKey: ['acc-case', selectedCase.id] });
            qc.invalidateQueries({ queryKey: ['acc-cases'] });
            toast.success('Requisito marcado como Não se Aplica.');
            setShowJustifyModal(false);
            setJustification('');
        } catch {
            toast.error('Erro ao registar justificação.');
        } finally {
            setUploading(false);
        }
    };

    const handleChatUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedCase) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('name', file.name);
            fd.append('type', 'OTHER');
            const res = await api.post(`/accounting-cases/${selectedCase.id}/documents`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const doc = res.data;
            sendMessage.mutate({
                content: `FILE|${doc.fileUrl}|${doc.name}`,
                senderRole: isAdmin ? 'CONSULTANT' : 'CLIENT'
            });
            toast.success('Documento enviado.');
        } catch { toast.error('Erro no envio do documento.'); }
        finally { setUploading(false); if (chatFileRef.current) chatFileRef.current.value = ''; }
    };

    if (!isModuleEnabled) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <ShieldAlert size={48} className="text-rose-500 mb-4 opacity-20" />
                <h2 className="text-lg font-bold">Módulo Restrito</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Acesso exclusivo à Contabilidade Profissional.</p>
            </div>
        );
    }

    const StatusBadge = ({ status }: { status: string }) => {
        const s = STATUS_LABELS[status] || { label: status, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-900/50' };
        const darkColors: Record<string, string> = {
            'text-blue-600': 'dark:text-blue-400',
            'text-amber-600': 'dark:text-amber-400',
            'text-orange-600': 'dark:text-orange-400',
            'text-indigo-600': 'dark:text-indigo-400',
            'text-emerald-600': 'dark:text-emerald-400',
            'text-rose-600': 'dark:text-rose-400',
        };
        const darkBgs: Record<string, string> = {
            'bg-blue-50': 'dark:bg-blue-500/10',
            'bg-amber-50': 'dark:bg-amber-500/10',
            'bg-orange-50': 'dark:bg-orange-500/10',
            'bg-indigo-50': 'dark:bg-indigo-500/10',
            'bg-emerald-50': 'dark:bg-emerald-500/10',
            'bg-rose-50': 'dark:bg-rose-500/10',
        };
        return (
            <span className={`badge text-[10px] ${s.bg} ${darkBgs[s.bg] || ''} ${s.color} ${darkColors[s.color] || ''} border border-current/10`}>
                {s.label}
            </span>
        );
    };

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Cabeçalho - Dashboard Style */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Portal Contabilístico</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Gestão centralizada de dossiers e conformidade fiscal.</p>
                </div>
                {activeTab === 'dossiers' && (
                    <div className="flex gap-2">
                        {isAdmin && (
                            <button onClick={() => setShowDocConfigModal(true)} className="premium-button-secondary !py-2.5">
                                <Files size={16} />
                                <span>Tipos de Documento</span>
                            </button>
                        )}
                        <button onClick={() => setShowNewCase(true)} className="premium-button-primary !py-2.5">
                            <Plus size={16} />
                            <span>Novo dossier</span>
                        </button>
                    </div>
                )}
                {activeTab === 'chart' && (
                    <button onClick={() => setShowNewAccount(true)} className="premium-button-primary !py-2.5">
                        <Plus size={16} />
                        <span>Nova conta</span>
                    </button>
                )}
                {activeTab === 'journal' && (
                    <button onClick={() => setShowNewJournal(true)} className="premium-button-primary !py-2.5">
                        <Plus size={16} />
                        <span>Novo lançamento</span>
                    </button>
                )}
            </div>

            {/* Tabs de Navegação Contabilística */}
            <div className="flex border-b border-[var(--border-color)] overflow-x-auto no-scrollbar">
                {[
                    { id: 'dossiers', label: 'Dossiers Fiscais', icon: <FolderOpen size={14} /> },
                    { id: 'chart', label: 'Plano de Contas', icon: <BookOpen size={14} /> },
                    { id: 'journal', label: 'Diário & Lançamentos', icon: <History size={14} /> },
                    { id: 'statements', label: 'Relatórios & Mapas', icon: <Files size={14} /> }
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all -mb-px shrink-0 ${activeTab === t.id ? 'border-[var(--accent)] text-[var(--accent)] font-extrabold' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                    >
                        {t.icon}
                        <span>{t.label}</span>
                    </button>
                ))}
            </div>

            {activeTab === 'dossiers' && (
                <>
                    {/* HUD - Dashboard Style */}
                    {summary && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { label: 'Dossiers ativos', value: summary.totalCases, icon: <LayoutDashboard size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                        { label: 'Aguardam análise', value: summary.pendingReview, icon: <Eye size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                        { label: 'Documentação', value: summary.totalDocuments, icon: <Files size={15} />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                        { label: 'Resultado acum.', value: fmt(summary.netResult), icon: <TrendingUp size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    ].map((k, i) => (
                        <div key={i} className="premium-card p-4 flex items-start gap-3">
                            <div className={`kpi-icon shrink-0 ${k.color} ${k.bg}`}>{k.icon}</div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-[var(--text-muted)] mb-0.5 truncate">{k.label}</p>
                                <p className="text-base font-bold text-[var(--text-primary)] tabular-nums leading-tight">{k.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* List - Dashboard Table Style Weight */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-sm font-bold text-[var(--text-primary)]">Dossiers do Exercício</h2>
                        <History size={15} className="text-[var(--text-muted)] opacity-30" />
                    </div>

                    <div className="space-y-2 max-h-[600px] overflow-y-auto no-scrollbar pr-1">
                        {isLoading && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[var(--accent)]" /></div>}
                        {cases.map((c: any) => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedCase(c)}
                                className={`w-full text-left p-4 rounded-[var(--radius-lg)] transition-all border ${selectedCase?.id === c.id ? 'bg-[var(--bg-secondary)] border-[var(--accent)] shadow-sm' : 'bg-[var(--bg-secondary)]/50 border-[var(--border-color)]/30 hover:bg-[var(--bg-secondary)] hover:border-[var(--border-color)]'}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0 space-y-1">
                                        <p className="text-sm font-bold text-[var(--text-primary)] truncate">{c.title}</p>
                                        <p className="text-[11px] text-[var(--text-muted)]">{c.period} · {c.client?.name || 'Interno'}</p>
                                    </div>
                                    <ChevronRight size={14} className={`shrink-0 mt-1 transition-transform ${selectedCase?.id === c.id ? 'text-[var(--accent)] rotate-90' : 'text-[var(--text-muted)] opacity-30'}`} />
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <StatusBadge status={c.status} />
                                    <span className="text-[10px] font-medium text-[var(--text-muted)]">{c._count?.documents || 0} docs</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detail - Dashboard Card Style */}
                <div className="lg:col-span-8">
                    {!selectedCase ? (
                        <div className="premium-card h-full flex flex-col items-center justify-center py-20 text-center opacity-40">
                            <LayoutDashboard size={48} className="mb-4" />
                            <p className="text-sm font-medium">Seleccione um dossier para visualizar os detalhes</p>
                        </div>
                    ) : (
                        <div className="premium-card flex flex-col animate-fade-in overflow-hidden">
                            <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-secondary)]/30">
                                <div>
                                    <h2 className="text-base font-bold text-[var(--text-primary)]">{caseDetail?.title || selectedCase.title}</h2>
                                    <p className="text-xs text-[var(--text-muted)]">Referência: {selectedCase.period}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={async () => {
                                            try {
                                                toast.info('A preparar pacote de auditoria... Por favor, aguarde.', { duration: 3000 });
                                                const response = await api.get(`/accounting-cases/${selectedCase.id}/export`, {
                                                    responseType: 'blob'
                                                });
                                                const blob = new Blob([response.data], { type: 'application/gzip' });
                                                const url = window.URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.setAttribute('download', `dossier-contabilistico-${selectedCase.period}.tar.gz`);
                                                document.body.appendChild(link);
                                                link.click();
                                                link.remove();
                                                toast.success('Dossier de auditoria exportado com sucesso!');
                                            } catch (err) {
                                                toast.error('Erro ao exportar dossier de auditoria.');
                                            }
                                        }}
                                        className="py-1.5 px-3 text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-primary)] rounded-lg transition-all border border-[var(--border-color)] flex items-center gap-1.5 uppercase tracking-wider bg-[var(--bg-primary)]/10"
                                        title="Exportar Arquivo de Auditoria"
                                    >
                                        <Download size={12} />
                                        <span>Exportar Auditoria</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateStatus.mutate({ id: selectedCase.id, status: 'SUBMITTED' });
                                            toast.success('Dossier submetido à Auditoria Central com sucesso!');
                                        }}
                                        className="py-1.5 px-3 text-[10px] font-bold text-emerald-600 hover:text-white bg-emerald-500/10 hover:bg-emerald-500 rounded-lg transition-all border border-emerald-500/20 flex items-center gap-1.5 uppercase tracking-wider"
                                        title="Enviar este dossier para a Auditoria Contabilística Central (SaaS Admin)"
                                    >
                                        <Send size={12} />
                                        <span>Submeter Auditoria</span>
                                    </button>
                                    <StatusBadge status={selectedCase.status} />
                                </div>
                            </div>

                            <div className="p-6 space-y-8">
                                {/* Admin Note - Dashboard Banner Style */}
                                {caseDetail?.adminNote && (
                                    <div className="flex gap-4 p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-[var(--radius-lg)] border border-indigo-100 dark:border-indigo-500/20 shadow-inner">
                                        <Zap size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">Nota de Auditoria</p>
                                            <p className="text-sm text-indigo-900 dark:text-indigo-100 leading-relaxed">{caseDetail.adminNote}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Financial Info Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {[
                                        { label: 'Proveitos', value: caseDetail?.totalRevenue, color: 'text-indigo-600' },
                                        { label: 'Gastos', value: caseDetail?.totalExpense, color: 'text-rose-600' },
                                        { label: 'IVA Período', value: caseDetail?.ivaLiquidado, color: 'text-amber-600' },
                                        { label: 'Retenções', value: caseDetail?.irtAmount, color: 'text-slate-600' },
                                        { label: 'Base Fiscal', value: caseDetail?.taxableBase, color: 'text-blue-600' },
                                        { label: 'Res. Líquido', value: caseDetail?.netResult, color: 'text-emerald-600', bold: true },
                                    ].map((n, i) => (
                                        <div key={i} className="p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[var(--radius-md)]">
                                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">{n.label}</p>
                                            <p className={`text-sm tabular-nums font-bold ${n.color}`}>{fmt(n.value || 0)}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Documents Checklist (Libera Style) */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-[var(--border-color)]/10 pb-2">
                                        <h3 className="text-sm font-bold text-[var(--text-primary)]">Lista de Documentos Obrigatórios</h3>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] opacity-60">
                                            {caseDetail?.documents?.filter((d: any) => d.status !== 'NOT_APPLICABLE').length || 0} de {REQUIRED_DOCUMENTS.length} Enviados
                                        </span>
                                    </div>
                                    <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />

                                    <div className="space-y-3">
                                        {configLoading ? (
                                            <div className="py-8 flex items-center justify-center gap-2 text-[var(--text-muted)] text-xs">
                                                <Loader2 size={16} className="animate-spin" />
                                                <span>A carregar tipos de documento do servidor...</span>
                                            </div>
                                        ) : REQUIRED_DOCUMENTS.length === 0 ? (
                                            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                                                <Files size={24} className="mx-auto mb-2 opacity-30" />
                                                <p>Nenhum tipo de documento configurado.</p>
                                                {isAdmin && <p className="mt-1 opacity-60">Use "Tipos de Documento" para definir os documentos exigidos.</p>}
                                            </div>
                                        ) : REQUIRED_DOCUMENTS.map((req) => {
                                            const reqDocs = caseDetail?.documents?.filter((doc: any) => doc.type === req.key) || [];
                                            const naDoc = reqDocs.find((doc: any) => doc.status === 'NOT_APPLICABLE');
                                            const activeDocs = reqDocs.filter((doc: any) => doc.status !== 'NOT_APPLICABLE');
                                            
                                            let statusText = 'PENDING';
                                            if (naDoc) statusText = 'NOT_APPLICABLE';
                                            else if (activeDocs.length > 0) statusText = 'ENVIADO';

                                            return (
                                                <div key={req.key} className="p-4 bg-[var(--bg-primary)]/20 border border-[var(--border-color)] rounded-[var(--radius-lg)] space-y-3 hover:border-[var(--accent)]/30 transition-all">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-bold text-[var(--text-primary)]">{req.label}</p>
                                                            <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">{req.description}</p>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            {statusText === 'PENDING' && (
                                                                <span className="badge text-[9px] font-bold bg-slate-50 dark:bg-slate-900/50 text-slate-500 border border-slate-200/50 flex items-center gap-1.5 py-1 px-2.5">
                                                                    <Clock size={10} /> Pendente
                                                                </span>
                                                            )}
                                                            {statusText === 'ENVIADO' && (
                                                                <span className="badge text-[9px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 flex items-center gap-1.5 py-1 px-2.5">
                                                                    <CheckCircle2 size={10} /> Enviado
                                                                </span>
                                                            )}
                                                            {statusText === 'NOT_APPLICABLE' && (
                                                                <span className="badge text-[9px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 flex items-center gap-1.5 py-1 px-2.5" title={naDoc.description || ''}>
                                                                    <XCircle size={10} /> Não se Aplica
                                                                </span>
                                                            )}

                                                            {!isAdmin && statusText === 'PENDING' && (
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setActiveReq(req);
                                                                            if (req.workflow === 'BANK') {
                                                                                setShowBankModal(true);
                                                                            } else {
                                                                                setActiveReq(req);
                                                                                setTimeout(() => {
                                                                                    fileRef.current?.click();
                                                                                }, 50);
                                                                            }
                                                                        }}
                                                                        className="premium-button-primary !py-1 px-3 !text-[10px] flex items-center gap-1"
                                                                    >
                                                                        <Upload size={10} /> Fazer Upload
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setActiveReq(req);
                                                                            setShowJustifyModal(true);
                                                                        }}
                                                                        className="p-1.5 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all border border-[var(--border-color)]"
                                                                        title="Não se aplica"
                                                                    >
                                                                        <XCircle size={14} />
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {statusText === 'NOT_APPLICABLE' && !isAdmin && (
                                                                <button
                                                                    onClick={() => deleteDoc.mutate(naDoc.id)}
                                                                    className="text-[9px] text-rose-500 hover:underline flex items-center gap-1 font-bold uppercase tracking-wider"
                                                                    title="Reverter estado"
                                                                >
                                                                    Reverter
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Justification details for NOT_APPLICABLE */}
                                                    {statusText === 'NOT_APPLICABLE' && (
                                                        <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-950/30 rounded-xl flex gap-2.5 text-xs text-blue-900 dark:text-blue-200">
                                                            <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                                            <div className="space-y-0.5">
                                                                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Justificação de Ausência:</span>
                                                                <p className="italic">{naDoc.description}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Active files uploaded for this category */}
                                                    {activeDocs.length > 0 && (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-[var(--border-color)]/5">
                                                            {activeDocs.map((doc: any) => (
                                                                <div key={doc.id} className="flex items-center gap-2.5 p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)]/55 rounded-xl hover:border-[var(--accent)]/20 transition-all group">
                                                                    <FileText size={12} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                                                                    <div className="min-w-0 flex-1">
                                                                        <button onClick={() => setPreviewUrl(getFileUrl(doc.fileUrl))} className="text-[11px] font-semibold text-[var(--text-primary)] hover:underline truncate block text-left w-full">
                                                                            {doc.name}
                                                                        </button>
                                                                        {doc.description && (
                                                                            <p className="text-[8px] text-[var(--text-muted)] truncate">{doc.description}</p>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-[8px] font-bold uppercase py-0.5 px-1.5 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-muted)]">
                                                                            {doc.status === 'PENDING' ? 'Em análise' : doc.status === 'ACCEPTED' ? 'Aceite' : 'Rejeitado'}
                                                                        </span>
                                                                        {isAdmin && doc.status === 'PENDING' && (
                                                                            <div className="flex gap-0.5">
                                                                                <button onClick={() => reviewDoc.mutate({ id: doc.id, status: 'ACCEPTED' })} className="p-1 text-emerald-600 hover:bg-emerald-500/10 rounded-md transition-all" title="Aceitar"><CheckCircle2 size={12} /></button>
                                                                                <button onClick={() => reviewDoc.mutate({ id: doc.id, status: 'REJECTED' })} className="p-1 text-rose-600 hover:bg-rose-500/10 rounded-md transition-all" title="Rejeitar"><XCircle size={12} /></button>
                                                                            </div>
                                                                        )}
                                                                        {(!isAdmin || doc.uploadedBy === me?.id) && (
                                                                            <button onClick={() => deleteDoc.mutate(doc.id)} className="p-1 text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-500/10 rounded-md transition-all" title="Remover"><XCircle size={12} /></button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Extra Documents / Loose Uploads */}
                                    {caseDetail?.documents?.filter((doc: any) => !REQUIRED_DOCUMENTS.some(r => r.key === doc.type)).length > 0 && (
                                        <div className="mt-8 space-y-3 pt-6 border-t border-[var(--border-color)]/20">
                                            <h4 className="text-xs font-bold text-[var(--text-primary)]">Documentos Adicionais</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {caseDetail?.documents?.filter((doc: any) => !REQUIRED_DOCUMENTS.some(r => r.key === doc.type)).map((doc: any) => (
                                                    <div key={doc.id} className="flex items-center gap-3 p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[var(--radius-md)] group hover:border-[var(--accent)] transition-all">
                                                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-all">
                                                            <FileText size={14} />
                                                        </div>
                                                        <button onClick={() => setPreviewUrl(getFileUrl(doc.fileUrl))} className="min-w-0 flex-1 hover:underline text-left">
                                                            <p className="text-xs font-bold truncate text-[var(--text-primary)]">{doc.name}</p>
                                                            <p className="text-[10px] text-[var(--text-muted)] uppercase">{doc.type}</p>
                                                        </button>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] font-bold uppercase opacity-40 text-[var(--text-secondary)]">{doc.status}</span>
                                                            {isAdmin && doc.status === 'PENDING' && (
                                                                <div className="flex gap-1">
                                                                    <button onClick={() => reviewDoc.mutate({ id: doc.id, status: 'ACCEPTED' })} className="p-1 text-emerald-600 hover:bg-emerald-500/10 rounded-md transition-all"><CheckCircle2 size={14} /></button>
                                                                    <button onClick={() => reviewDoc.mutate({ id: doc.id, status: 'REJECTED' })} className="p-1 text-rose-600 hover:bg-rose-500/10 rounded-md transition-all"><XCircle size={14} /></button>
                                                                </div>
                                                            )}
                                                            {(!isAdmin || doc.uploadedBy === me?.id) && (
                                                                <button onClick={() => deleteDoc.mutate(doc.id)} className="p-1 text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-500/10 rounded-md transition-all"><XCircle size={14} /></button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Chat Section */}
                                <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                                    <h3 className="text-sm font-bold text-[var(--text-primary)]">Mensagens e Esclarecimentos</h3>
                                    <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-4 flex flex-col h-[400px]">
                                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar">
                                            {caseDetail?.messages?.map((msg: any) => {
                                                const isMe = (isAdmin && msg.senderRole === 'CONSULTANT') || (!isAdmin && msg.senderRole === 'CLIENT');
                                                const isFile = msg.content.startsWith('FILE|');
                                                let renderedContent = msg.content;
                                                if (isFile) {
                                                    const parts = msg.content.split('|');
                                                    const url = parts[1];
                                                    const name = parts.slice(2).join('|');
                                                    renderedContent = (
                                                        <button onClick={() => setPreviewUrl(getFileUrl(url))} className="flex items-center gap-2 hover:underline text-left">
                                                            <FileText size={14} className="shrink-0" /> <span className="truncate">{name}</span>
                                                        </button>
                                                    );
                                                }

                                                return (
                                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${isMe ? 'ml-auto' : 'mr-auto'}`}>
                                                        <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase mb-1">{msg.user?.name} · {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        <div className={`px-4 py-2 rounded-[var(--radius-md)] text-sm shadow-sm ${isMe ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]'}`}>
                                                            {renderedContent}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 items-center">
                                            <button
                                                type="button"
                                                onClick={() => chatFileRef.current?.click()}
                                                className="p-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors rounded-full hover:bg-[var(--bg-secondary)] shrink-0"
                                                disabled={uploading}
                                                title="Anexar documento"
                                            >
                                                <Paperclip size={18} />
                                            </button>
                                            <input ref={chatFileRef} type="file" className="hidden" onChange={handleChatUpload} />
                                            <input
                                                value={messageText}
                                                onChange={e => setMessageText(e.target.value)}
                                                placeholder="Mensagem..."
                                                className="flex-1 min-w-0 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[var(--radius-md)] px-4 py-2 text-sm outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                                            />
                                            <button disabled={(!messageText.trim() && !uploading) || uploading} type="submit" className="premium-button-primary !p-2 shrink-0">
                                                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Admin Actions */}
                                {isAdmin && (
                                    <div className="pt-6 flex flex-wrap gap-2">
                                        {selectedCase.status === 'SUBMITTED' && (
                                            <button onClick={() => updateStatus.mutate({ id: selectedCase.id, status: 'UNDER_REVIEW' })} className="premium-button-primary !py-2 text-xs">Analisar</button>
                                        )}
                                        {['SUBMITTED', 'UNDER_REVIEW', 'PENDING_INFO'].includes(selectedCase.status) && (
                                            <>
                                                <button onClick={() => setShowReview({ status: 'REVIEWED', case: selectedCase })} className="premium-button-primary !py-2 text-xs">Validar</button>
                                                <button onClick={() => setShowReview({ status: 'PENDING_INFO', case: selectedCase })} className="premium-button-secondary !py-2 text-xs">Pedir info</button>
                                            </>
                                        )}
                                        {selectedCase.status === 'REVIEWED' && (
                                            <button onClick={() => updateStatus.mutate({ id: selectedCase.id, status: 'CLOSED' })} className="premium-button-primary !bg-emerald-600 !py-2 text-xs w-full">Encerrar Dossier</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
                </>
            )}

            {/* Plano de Contas */}
            {activeTab === 'chart' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[var(--bg-secondary)]/50 p-4 rounded-[var(--radius-lg)] border border-[var(--border-color)]/30">
                        <div className="relative flex-1 max-w-md">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                placeholder="Procurar conta por código ou nome..."
                                value={chartSearch}
                                onChange={e => setChartSearch(e.target.value)}
                                className="premium-input !py-2 !pl-10 text-sm"
                            />
                        </div>
                        <button onClick={() => setShowNewAccount(true)} className="premium-button-primary !py-2 flex items-center gap-2 text-xs">
                            <Plus size={14} />
                            <span>Nova Conta</span>
                        </button>
                    </div>

                    <div className="premium-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                        <th className="px-6 py-3.5">Código</th>
                                        <th className="px-6 py-3.5">Nome da Conta</th>
                                        <th className="px-6 py-3.5">Natureza</th>
                                        <th className="px-6 py-3.5">Classe / Nível</th>
                                        <th className="px-6 py-3.5">Origem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]/50 text-sm text-[var(--text-primary)]">
                                    {chartData
                                        .filter((acc: any) =>
                                            acc.code.toLowerCase().includes(chartSearch.toLowerCase()) ||
                                            acc.name.toLowerCase().includes(chartSearch.toLowerCase())
                                        )
                                        .map((acc: any) => (
                                            <tr key={acc.id} className="hover:bg-[var(--bg-secondary)]/20 transition-colors">
                                                <td className="px-6 py-3.5 font-mono font-bold text-[var(--accent)]">{acc.code}</td>
                                                <td className="px-6 py-3.5 font-medium">{acc.name}</td>
                                                <td className="px-6 py-3.5">
                                                    <span className={`badge text-[10px] ${acc.nature === 'DEBIT' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                                                        {acc.nature === 'DEBIT' ? 'Devedora' : 'Credora'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5 text-xs text-[var(--text-muted)]">
                                                    Classe {acc.class} · Grau {acc.level}
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <span className="text-xs">{acc.companyId ? 'Personalizada' : 'Padrão (SNC)'}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    {chartData.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center py-10 text-[var(--text-muted)]">Nenhuma conta registada.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Diários & Lançamentos */}
            {activeTab === 'journal' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[var(--bg-secondary)]/50 p-4 rounded-[var(--radius-lg)] border border-[var(--border-color)]/30">
                        <div>
                            <h2 className="text-sm font-bold">Livro Diário</h2>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">Registo cronológico de transações contábeis.</p>
                        </div>
                        <button onClick={() => setShowNewJournal(true)} className="premium-button-primary !py-2 flex items-center gap-2 text-xs">
                            <Plus size={14} />
                            <span>Novo Lançamento</span>
                        </button>
                    </div>

                    <div className="space-y-3">
                        {journalData.map((entry: any) => {
                            const isExpanded = expandedJournalEntry === entry.id;
                            return (
                                <div key={entry.id} className="premium-card overflow-hidden transition-all border border-[var(--border-color)]/30">
                                    <div
                                        onClick={() => setExpandedJournalEntry(isExpanded ? null : entry.id)}
                                        className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 hover:bg-[var(--bg-secondary)]/20 cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-sm text-[var(--text-primary)]">Lançamento #{entry.number}</span>
                                                    <span className={`badge text-[9px] ${entry.status === 'POSTED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-slate-50 text-slate-600 dark:bg-slate-500/10'}`}>
                                                        {entry.status === 'POSTED' ? 'Definitivo' : 'Rascunho'}
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded uppercase tracking-wider">{entry.type}</span>
                                                </div>
                                                <p className="text-xs text-[var(--text-muted)]">{new Date(entry.date).toLocaleDateString()} · Ref: {entry.reference || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-[var(--text-primary)] truncate max-w-xs">{entry.description}</p>
                                                <p className="text-xs text-[var(--text-muted)] tabular-nums">Débito/Crédito: {fmt(entry.totalDebit)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {entry.status === 'DRAFT' && isAdmin && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            postJournalEntry.mutate(entry.id);
                                                        }}
                                                        className="premium-button-primary !py-1 !px-3 text-[10px] uppercase font-bold"
                                                    >
                                                        Publicar
                                                    </button>
                                                )}
                                                <ChevronRight size={16} className={`text-[var(--text-muted)] transition-transform duration-200 ${isExpanded ? 'rotate-90 text-[var(--accent)]' : ''}`} />
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t border-[var(--border-color)]/30 bg-[var(--bg-secondary)]/10 px-6 py-4">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs border-collapse">
                                                    <thead>
                                                        <tr className="text-[10px] font-bold text-[var(--text-muted)] uppercase border-b border-[var(--border-color)]/30 pb-2">
                                                            <th className="py-2">Conta</th>
                                                            <th className="py-2">Descrição da Linha</th>
                                                            <th className="py-2 text-right">Débito</th>
                                                            <th className="py-2 text-right">Crédito</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[var(--border-color)]/20">
                                                        {entry.lines.map((line: any) => (
                                                            <tr key={line.id}>
                                                                <td className="py-3 font-mono font-bold text-[var(--text-primary)]">
                                                                    {line.account?.code} - {line.account?.name}
                                                                </td>
                                                                <td className="py-3 text-[var(--text-muted)]">
                                                                    {line.description || entry.description}
                                                                </td>
                                                                <td className="py-3 text-right font-mono text-emerald-600 font-bold tabular-nums">
                                                                    {line.debit > 0 ? fmt(line.debit) : '-'}
                                                                </td>
                                                                <td className="py-3 text-right font-mono text-rose-600 font-bold tabular-nums">
                                                                    {line.credit > 0 ? fmt(line.credit) : '-'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {journalData.length === 0 && (
                            <div className="text-center py-12 premium-card opacity-50 flex flex-col items-center justify-center">
                                <History size={36} className="mb-2 text-[var(--text-muted)]" />
                                <p className="text-sm font-medium">Nenhum lançamento no diário para o período seleccionado.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Relatórios & Mapas */}
            {activeTab === 'statements' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Filtros de Exercício */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-secondary)]/50 p-4 rounded-[var(--radius-lg)] border border-[var(--border-color)]/30">
                        {/* Sub-tabs */}
                        <div className="flex gap-2">
                            {[
                                { id: 'trial', label: 'Balancete de Verificação' },
                                { id: 'balance', label: 'Balanço Patrimonial' },
                                { id: 'income', label: 'Demonstração de Resultados' }
                            ].map(st => (
                                <button
                                    key={st.id}
                                    type="button"
                                    onClick={() => setStatementSubTab(st.id as any)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${statementSubTab === st.id ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-primary)] border border-[var(--border-color)]/50 text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                                >
                                    {st.label}
                                </button>
                            ))}
                        </div>
                        {/* Year/Month filters */}
                        <div className="flex items-center gap-2">
                            <select
                                value={filterYear}
                                onChange={e => setFilterYear(Number(e.target.value))}
                                className="premium-input !py-1.5 !px-3 text-xs w-24"
                            >
                                {[2024, 2025, 2026, 2027].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            {statementSubTab !== 'balance' && (
                                <select
                                    value={filterMonth || ''}
                                    onChange={e => setFilterMonth(e.target.value ? Number(e.target.value) : undefined)}
                                    className="premium-input !py-1.5 !px-3 text-xs w-28"
                                >
                                    <option value="">Todo o Ano</option>
                                    {Array.from({ length: 12 }, (_, idx) => (
                                        <option key={idx+1} value={idx+1}>
                                            {new Date(2026, idx, 1).toLocaleString('pt', { month: 'long' })}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Sub-tab 1: Trial Balance */}
                    {statementSubTab === 'trial' && trialBalanceData && (
                        <div className="premium-card overflow-hidden">
                            <div className="p-4 border-b border-[var(--border-color)]/50 flex items-center justify-between">
                                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Balancete Geral de Contas</h3>
                                <span className="text-[10px] font-bold text-indigo-500 uppercase">Valores em Kwanza (AOA)</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-[var(--bg-secondary)]/30 border-b border-[var(--border-color)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                            <th className="px-6 py-3">Código</th>
                                            <th className="px-6 py-3">Descrição da Conta</th>
                                            <th className="px-6 py-3 text-right">Saldo Inicial</th>
                                            <th className="px-6 py-3 text-right">Débitos Período</th>
                                            <th className="px-6 py-3 text-right">Créditos Período</th>
                                            <th className="px-6 py-3 text-right">Saldo Final</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-color)]/50 font-mono">
                                        {trialBalanceData.rows?.map((row: any) => (
                                            <tr key={row.id} className="hover:bg-[var(--bg-secondary)]/10 text-xs">
                                                <td className="px-6 py-2.5 font-bold text-[var(--text-primary)]">{row.code}</td>
                                                <td className="px-6 py-2.5 font-sans font-medium text-[var(--text-primary)]">{row.name}</td>
                                                <td className={`px-6 py-2.5 text-right tabular-nums ${row.openingBalance < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                                                    {fmt(row.openingBalance)}
                                                </td>
                                                <td className="px-6 py-2.5 text-right tabular-nums text-emerald-600">{fmt(row.debit)}</td>
                                                <td className="px-6 py-2.5 text-right tabular-nums text-rose-600">{fmt(row.credit)}</td>
                                                <td className={`px-6 py-2.5 text-right tabular-nums font-bold ${row.endingBalance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                    {fmt(row.endingBalance)}
                                                </td>
                                            </tr>
                                        ))}
                                        {/* Totals row */}
                                        <tr className="bg-[var(--bg-secondary)]/40 font-bold border-t border-[var(--border-color)] text-[11px]">
                                            <td colSpan={2} className="px-6 py-4 font-sans text-right">TOTAIS DE VERIFICAÇÃO</td>
                                            <td className="px-6 py-4 text-right tabular-nums">{fmt(trialBalanceData.totals?.opening || 0)}</td>
                                            <td className="px-6 py-4 text-right tabular-nums text-emerald-600">{fmt(trialBalanceData.totals?.debit || 0)}</td>
                                            <td className="px-6 py-4 text-right tabular-nums text-rose-600">{fmt(trialBalanceData.totals?.credit || 0)}</td>
                                            <td className="px-6 py-4 text-right tabular-nums text-emerald-600">{fmt(trialBalanceData.totals?.ending || 0)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Sub-tab 2: Balance Sheet */}
                    {statementSubTab === 'balance' && balanceSheetData && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* ATIVO */}
                            <div className="premium-card overflow-hidden">
                                <div className="p-4 border-b border-[var(--border-color)] bg-indigo-50/50 dark:bg-indigo-950/20">
                                    <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">ATIVO</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Ativo Circulante</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between border-b border-[var(--border-color)]/20 py-1">
                                                <span>Caixa e Equivalentes</span>
                                                <span className="font-mono tabular-nums">{fmt(balanceSheetData.ativo?.circulante?.caixa || 0)}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-[var(--border-color)]/20 py-1">
                                                <span>Clientes e Contas a Receber</span>
                                                <span className="font-mono tabular-nums">{fmt(balanceSheetData.ativo?.circulante?.clientesContaCorrente || 0)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold py-1 bg-[var(--bg-secondary)]/20 px-2 rounded mt-1">
                                                <span>Total Ativo Circulante</span>
                                                <span className="font-mono tabular-nums">{fmt(balanceSheetData.ativo?.circulante?.total || 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Ativo Não Circulante</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between border-b border-[var(--border-color)]/20 py-1">
                                                <span>Imobilizações Corpóreas (Ativos)</span>
                                                <span className="font-mono tabular-nums">{fmt(balanceSheetData.ativo?.naoCirculante?.imobilizado || 0)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold py-1 bg-[var(--bg-secondary)]/20 px-2 rounded mt-1">
                                                <span>Total Ativo Não Circulante</span>
                                                <span className="font-mono tabular-nums">{fmt(balanceSheetData.ativo?.naoCirculante?.total || 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-[var(--border-color)] flex justify-between text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                                        <span>TOTAL DO ATIVO</span>
                                        <span className="font-mono tabular-nums">{fmt(balanceSheetData.ativo?.total || 0)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* PASSIVO E CAPITAL PRÓPRIO */}
                            <div className="space-y-6">
                                <div className="premium-card overflow-hidden">
                                    <div className="p-4 border-b border-[var(--border-color)] bg-rose-50/50 dark:bg-rose-950/20">
                                        <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">PASSIVO</h3>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Passivo Circulante (Curto Prazo)</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between border-b border-[var(--border-color)]/20 py-1">
                                                    <span>Fornecedores</span>
                                                    <span className="font-mono tabular-nums">{fmt(balanceSheetData.passivo?.circulante?.fornecedores || 0)}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-[var(--border-color)]/20 py-1">
                                                    <span>IVA Liquidado</span>
                                                    <span className="font-mono tabular-nums">{fmt(balanceSheetData.passivo?.circulante?.ivaLiquidado || 0)}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-[var(--border-color)]/20 py-1">
                                                    <span>(-) IVA Dedutível</span>
                                                    <span className="font-mono tabular-nums text-rose-500">({fmt(balanceSheetData.passivo?.circulante?.ivaDedutivel || 0)})</span>
                                                </div>
                                                <div className="flex justify-between border-b border-[var(--border-color)]/20 py-1">
                                                    <span>Retenções de Imposto (IRT)</span>
                                                    <span className="font-mono tabular-nums">{fmt(balanceSheetData.passivo?.circulante?.irtRetencoes || 0)}</span>
                                                </div>
                                                <div className="flex justify-between font-bold py-1 bg-[var(--bg-secondary)]/20 px-2 rounded mt-1">
                                                    <span>Total do Passivo</span>
                                                    <span className="font-mono tabular-nums">{fmt(balanceSheetData.passivo?.total || 0)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="premium-card overflow-hidden">
                                    <div className="p-4 border-b border-[var(--border-color)] bg-emerald-50/50 dark:bg-emerald-950/20">
                                        <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">CAPITAL PRÓPRIO</h3>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between border-b border-[var(--border-color)]/20 py-1">
                                                <span>Resultado Líquido do Período</span>
                                                <span className={`font-mono tabular-nums font-bold ${balanceSheetData.capitalProprio?.resultadoExercicio < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                    {fmt(balanceSheetData.capitalProprio?.resultadoExercicio || 0)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between font-bold py-1 bg-[var(--bg-secondary)]/20 px-2 rounded mt-1">
                                                <span>Total do Capital Próprio</span>
                                                <span className="font-mono tabular-nums">{fmt(balanceSheetData.capitalProprio?.total || 0)}</span>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-[var(--border-color)] flex justify-between text-base font-extrabold text-[var(--text-primary)]">
                                            <span>PASSIVO + CAPITAL PRÓPRIO</span>
                                            <span className="font-mono tabular-nums">
                                                {fmt((balanceSheetData.passivo?.total || 0) + (balanceSheetData.capitalProprio?.total || 0))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sub-tab 3: Income Statement */}
                    {statementSubTab === 'income' && incomeStatementData && (
                        <div className="premium-card overflow-hidden">
                            <div className="p-4 border-b border-[var(--border-color)]/50 flex items-center justify-between">
                                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Demonstração de Resultados (P&L)</h3>
                                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded">Margem Líquida: {incomeStatementData.derived?.netMargin}%</span>
                            </div>
                            <div className="p-6 max-w-2xl mx-auto space-y-6">
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]/30 font-bold text-base">
                                        <span>(+) Proveitos Operacionais (Vendas/Serviços)</span>
                                        <span className="font-mono tabular-nums text-emerald-600">{fmt(incomeStatementData.totals?.revenue || 0)}</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]/30">
                                        <span>(-) Gastos de Exploração (Custos de Vendas/Serviços)</span>
                                        <span className="font-mono tabular-nums text-rose-500">({fmt(incomeStatementData.totals?.expense || 0)})</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 bg-[var(--bg-secondary)]/30 px-3 rounded font-bold">
                                        <span>(=) Resultado Bruto (Margem Industrial)</span>
                                        <span className="font-mono tabular-nums">{fmt(incomeStatementData.derived?.grossProfit || 0)}</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]/30">
                                        <span>(-) IVA Liquidado</span>
                                        <span className="font-mono tabular-nums text-rose-500">({fmt(incomeStatementData.totals?.ivaLiquidado || 0)})</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]/30">
                                        <span>(+) IVA Dedutível</span>
                                        <span className="font-mono tabular-nums text-emerald-600">{fmt(incomeStatementData.totals?.ivaDedutivel || 0)}</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 bg-[var(--bg-secondary)]/30 px-3 rounded font-bold">
                                        <span>(=) Resultado Antes de Impostos (EBIT)</span>
                                        <span className="font-mono tabular-nums">{fmt(incomeStatementData.derived?.ebit || 0)}</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]/30">
                                        <span>(-) Imposto sobre o Rendimento de Trabalho (IRT)</span>
                                        <span className="font-mono tabular-nums text-rose-500">({fmt(incomeStatementData.totals?.irtAmount || 0)})</span>
                                    </div>
                                    <div className="flex justify-between py-2.5 bg-indigo-50 dark:bg-indigo-950/20 px-4 rounded font-extrabold text-lg text-indigo-600 dark:text-indigo-400">
                                        <span>(=) RESULTADO LÍQUIDO DO EXERCÍCIO</span>
                                        <span className="font-mono tabular-nums">{fmt(incomeStatementData.totals?.netResult || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modal: New Case */}
            <Modal isOpen={showNewCase} onClose={() => setShowNewCase(false)} title="Novo Dossier" subtitle="Abertura de período fiscal" width="lg">
                <form onSubmit={e => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget as HTMLFormElement);
                    createCase.mutate(Object.fromEntries(fd));
                }} className="p-6 space-y-6">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Título</label>
                        <input name="title" required placeholder="Ex: Contabilidade Maio 2025" className="premium-input !py-3" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Cliente (Entidade Final)</label>
                        <select name="clientId" className="premium-input !py-3">
                            <option value="">Interno (Própria Empresa)</option>
                            {clientsData.map((client: any) => (
                                <option key={client.id} value={client.id}>{client.name} ({client.nif || 'S/NIF'})</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Mês/Referência</label>
                            <input name="period" required placeholder="YYYY-MM" className="premium-input !py-3" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Tipo</label>
                            <select name="periodType" className="premium-input !py-3">
                                <option value="MONTHLY">Mensal</option>
                                <option value="QUARTERLY">Trimestral</option>
                                <option value="ANNUAL">Anual</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button type="button" onClick={() => setShowNewCase(false)} className="premium-button-secondary flex-1 py-3">Cancelar</button>
                        <button type="submit" className="premium-button-primary flex-1 py-3">Criar</button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Review */}
            <Modal isOpen={!!showReview} onClose={() => setShowReview(null)} title="Análise Técnica" subtitle="Feedback e resultados" width="xl">
                <form id="review-form" onSubmit={e => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget as HTMLFormElement);
                    updateStatus.mutate({
                        id: showReview.case.id,
                        status: showReview.status,
                        adminNote: fd.get('adminNote'),
                        totalRevenue: fd.get('totalRevenue') || undefined,
                        totalExpense: fd.get('totalExpense') || undefined,
                        ivaLiquidado: fd.get('ivaLiquidado') || undefined,
                        irtAmount: fd.get('irtAmount') || undefined,
                        netResult: fd.get('netResult') || undefined,
                    });
                }} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">
                    <div className="space-y-1">
                        <div className="flex justify-between items-end mb-2">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Parecer Técnico</label>
                            <button type="button" onClick={handleAIAnalyze} disabled={isAnalyzing} className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-200/50 hover:bg-indigo-100 transition-all flex items-center gap-1.5">
                                {isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <Target size={12} />}
                                Auto Analisar (Agente IA)
                            </button>
                        </div>
                        <textarea name="adminNote" rows={3} required className="premium-input !py-3 resize-none" placeholder="Fundamentação da análise..." />
                    </div>
                    {showReview?.status === 'REVIEWED' && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border-color)]">
                            {[
                                { name: 'totalRevenue', label: 'Proveitos' },
                                { name: 'totalExpense', label: 'Gastos' },
                                { name: 'ivaLiquidado', label: 'IVA' },
                                { name: 'irtAmount', label: 'IRT' },
                                { name: 'netResult', label: 'Res. Líquido' },
                            ].map(f => (
                                <div key={f.name} className="space-y-1">
                                    <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase">{f.label}</label>
                                    <input name={f.name} type="number" step="0.01" className="premium-input !py-2.5 tabular-nums" />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-2 pt-4">
                        <button type="button" onClick={() => setShowReview(null)} className="premium-button-secondary flex-1 py-3">Voltar</button>
                        <button type="submit" className="premium-button-primary flex-1 py-3">Confirmar</button>
                    </div>
                </form>
            </Modal>
            {/* Modal: Document Preview */}
            <Modal isOpen={!!previewUrl} onClose={() => setPreviewUrl(null)} title="Visualizador de Documentos" type="CENTER" width="full">
                <div className="bg-[var(--bg-primary)] flex flex-col items-center justify-center h-[80vh]">
                    {previewUrl && (
                        <iframe
                            src={previewUrl}
                            className="w-full h-full border-none rounded-[var(--radius-lg)] bg-white"
                            title="Document Viewer"
                        />
                    )}
                </div>
            </Modal>

            {/* Modal: Bank Upload */}
            <Modal isOpen={showBankModal} onClose={() => setShowBankModal(false)} title={`Upload por Banco: ${activeReq?.label}`} subtitle="Selecione o banco de origem e anexe o documento correspondente" width="lg">
                <form onSubmit={e => {
                    e.preventDefault();
                    const file = (e.currentTarget.elements.namedItem('bankFile') as HTMLInputElement)?.files?.[0];
                    if (file) {
                        handleBankUpload(file);
                    } else {
                        toast.error('Selecione um ficheiro.');
                    }
                }} className="p-6 space-y-6">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Banco de Origem</label>
                        <select
                            value={selectedBank}
                            onChange={e => setSelectedBank(e.target.value)}
                            className="premium-input !py-3"
                        >
                            {BANKS_LIST.map((bank) => (
                                <option key={bank} value={bank}>{bank}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase block">Documento / Ficheiro</label>
                        <div className="border-2 border-dashed border-[var(--border-color)] rounded-[var(--radius-lg)] p-6 text-center hover:border-[var(--accent)] transition-all cursor-pointer relative bg-[var(--bg-secondary)]/10">
                            <input
                                type="file"
                                name="bankFile"
                                required
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center justify-center gap-2">
                                <Upload className="text-[var(--text-muted)]" size={24} />
                                <span className="text-xs font-bold text-[var(--text-primary)]">Arraste ou clique para selecionar ficheiro</span>
                                <span className="text-[9px] text-[var(--text-muted)]">PDF, PNG, JPG, EXCEL ou ZIP (Máx. 20MB)</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button type="button" onClick={() => setShowBankModal(false)} className="premium-button-secondary flex-1 py-3">Cancelar</button>
                        <button type="submit" disabled={uploading} className="premium-button-primary flex-1 py-3 flex items-center justify-center gap-2">
                            {uploading ? <Loader2 size={16} className="animate-spin" /> : 'Confirmar e Enviar'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Justificação de Ausência */}
            <Modal isOpen={showJustifyModal} onClose={() => setShowJustifyModal(false)} title={`Justificação de Ausência: ${activeReq?.label}`} subtitle="Indique o motivo pelo qual este documento não se aplica à empresa" width="lg">
                <div className="p-6 space-y-6">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Justificação / Motivo</label>
                        <textarea
                            value={justification}
                            onChange={e => setJustification(e.target.value)}
                            placeholder="Descreva detalhadamente o motivo (ex: A empresa não possui trabalhadores por conta de outrem no momento, logo não gera folha de salários)..."
                            rows={4}
                            required
                            className="premium-input !py-3 resize-none"
                        />
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button type="button" onClick={() => setShowJustifyModal(false)} className="premium-button-secondary flex-1 py-3">Cancelar</button>
                        <button onClick={handleMarkNotApplicable} disabled={uploading || !justification.trim()} className="premium-button-primary flex-1 py-3 flex items-center justify-center gap-2">
                            {uploading ? <Loader2 size={16} className="animate-spin" /> : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal: Nova Conta */}
            <Modal isOpen={showNewAccount} onClose={() => setShowNewAccount(false)} title="Nova Conta Contabilística" subtitle="Adicione uma conta ao Plano de Contas da empresa" width="lg">
                <form onSubmit={e => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget as HTMLFormElement);
                    const payload = {
                        code: fd.get('code'),
                        name: fd.get('name'),
                        description: fd.get('description') || undefined,
                        nature: fd.get('nature'),
                        class: fd.get('class'),           // String enum: ATIVO | PASSIVO | CAPITAL | RENDIMENTO | GASTO | ORDEM
                        level: Number(fd.get('level')),   // Int: 1-4
                        parentCode: fd.get('parentCode') || undefined
                    };
                    createAccount.mutate(payload);
                }} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Código da Conta</label>
                            <input name="code" required placeholder="Ex: 31.1" className="premium-input !py-2.5 font-mono" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Nome da Conta</label>
                            <input name="name" required placeholder="Ex: Mercadorias" className="premium-input !py-2.5" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Natureza</label>
                            <select name="nature" className="premium-input !py-2.5">
                                <option value="DEBIT">Devedora (Débito)</option>
                                <option value="CREDIT">Credora (Crédito)</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Classe / Grupo</label>
                            <select name="class" required className="premium-input !py-2.5">
                                <option value="ATIVO">Activo</option>
                                <option value="PASSIVO">Passivo</option>
                                <option value="CAPITAL">Capital Próprio</option>
                                <option value="RENDIMENTO">Rendimento / Receita</option>
                                <option value="GASTO">Gasto / Despesa</option>
                                <option value="ORDEM">Contas de Ordem</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Grau / Nível</label>
                            <select name="level" className="premium-input !py-2.5">
                                <option value="1">1 – Classe</option>
                                <option value="2">2 – Conta</option>
                                <option value="3">3 – Subconta</option>
                                <option value="4">4 – Analítica</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Código Mãe (Opcional)</label>
                            <input name="parentCode" placeholder="Ex: 31" className="premium-input !py-2.5 font-mono" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Descrição / Notas</label>
                        <textarea name="description" placeholder="Notas explicativas sobre a utilização desta conta..." rows={2} className="premium-input !py-2.5 resize-none" />
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button type="button" onClick={() => setShowNewAccount(false)} className="premium-button-secondary flex-1 py-3">Cancelar</button>
                        <button type="submit" disabled={createAccount.isPending} className="premium-button-primary flex-1 py-3">
                            {createAccount.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Criar Conta'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Novo Lançamento */}
            <Modal isOpen={showNewJournal} onClose={() => setShowNewJournal(false)} title="Novo Lançamento Diário" subtitle="Construa um lançamento de dupla entrada equilibrado" width="xl">
                <form onSubmit={e => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget as HTMLFormElement);
                    
                    // Validate balance
                    const totalD = journalLines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
                    const totalC = journalLines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);
                    if (Math.abs(totalD - totalC) > 0.01) {
                        toast.error('Erro de Balanço: O total de débitos deve ser exatamente igual ao total de créditos!');
                        return;
                    }

                    if (journalLines.some(l => !l.accountId)) {
                        toast.error('Selecione uma conta para todas as linhas.');
                        return;
                    }

                    const payload = {
                        description: fd.get('description'),
                        reference: fd.get('reference') || undefined,
                        date: fd.get('date') ? new Date(fd.get('date') as string) : undefined,
                        caseId: selectedCase?.id || undefined,
                        lines: journalLines.map(l => ({
                            accountId: l.accountId,
                            debit: Number(l.debit) || 0,
                            credit: Number(l.credit) || 0,
                            description: l.description || undefined
                        }))
                    };
                    createJournalEntry.mutate(payload);
                }} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto no-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Descrição Geral</label>
                            <input name="description" required placeholder="Ex: Pagamento Factura F-120" className="premium-input !py-2.5" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Referência / Doc. Externo</label>
                            <input name="reference" placeholder="Ex: FT2025/12" className="premium-input !py-2.5" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Data do Lançamento</label>
                            <input name="date" type="date" required defaultValue={new Date().toISOString().substring(0, 10)} className="premium-input !py-2.5" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Dossier / Exercício</label>
                            <input disabled value={`${selectedCase?.title || 'Sem Dossier'} (${selectedCase?.period || 'N/A'})`} className="premium-input !py-2.5 opacity-60" />
                        </div>
                    </div>

                    {/* Voucher Lines Builder */}
                    <div className="space-y-3 pt-4 border-t border-[var(--border-color)]/20">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Linhas de Lançamento (Crédito/Débito)</h4>
                            <button
                                type="button"
                                onClick={() => setJournalLines([...journalLines, { accountId: '', debit: 0, credit: 0, description: '' }])}
                                className="text-[10px] font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
                            >
                                <Plus size={12} /> Adicionar Linha
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                            {journalLines.map((line, idx) => (
                                <div key={idx} className="flex flex-wrap items-center gap-3 p-3 bg-[var(--bg-secondary)]/30 border border-[var(--border-color)]/40 rounded-xl relative group">
                                    <div className="flex-1 min-w-[200px] space-y-1">
                                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Conta Contabilística</label>
                                        <select
                                            value={line.accountId}
                                            required
                                            onChange={e => {
                                                const copy = [...journalLines];
                                                copy[idx].accountId = e.target.value;
                                                setJournalLines(copy);
                                            }}
                                            className="premium-input !py-2 text-xs"
                                        >
                                            <option value="">-- Seleccione --</option>
                                            {chartData.map((acc: any) => (
                                                <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-28 space-y-1">
                                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Débito</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={line.debit || ''}
                                            placeholder="0.00"
                                            onChange={e => {
                                                const copy = [...journalLines];
                                                copy[idx].debit = Number(e.target.value);
                                                if (copy[idx].debit > 0) copy[idx].credit = 0; // cannot have both
                                                setJournalLines(copy);
                                            }}
                                            className="premium-input !py-2 text-xs text-right tabular-nums text-emerald-600 font-bold"
                                        />
                                    </div>
                                    <div className="w-28 space-y-1">
                                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Crédito</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={line.credit || ''}
                                            placeholder="0.00"
                                            onChange={e => {
                                                const copy = [...journalLines];
                                                copy[idx].credit = Number(e.target.value);
                                                if (copy[idx].credit > 0) copy[idx].debit = 0; // cannot have both
                                                setJournalLines(copy);
                                            }}
                                            className="premium-input !py-2 text-xs text-right tabular-nums text-rose-600 font-bold"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-[150px] space-y-1">
                                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Histórico/Descrição (Opcional)</label>
                                        <input
                                            value={line.description}
                                            placeholder="Ex: Regularização"
                                            onChange={e => {
                                                const copy = [...journalLines];
                                                copy[idx].description = e.target.value;
                                                setJournalLines(copy);
                                            }}
                                            className="premium-input !py-2 text-xs"
                                        />
                                    </div>
                                    {journalLines.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => setJournalLines(journalLines.filter((_, i) => i !== idx))}
                                            className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all self-end mb-0.5"
                                        >
                                            <XCircle size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Balance Checker Banner */}
                        {(() => {
                            const totalD = journalLines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
                            const totalC = journalLines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);
                            const diff = Math.abs(totalD - totalC);
                            const isBalanced = diff < 0.01;
                            return (
                                <div className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-bold ${isBalanced ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200/50 text-amber-700 dark:text-amber-400'}`}>
                                    <div className="flex items-center gap-2">
                                        <AlertCircle size={15} />
                                        <span>
                                            {isBalanced
                                                ? 'Lançamento Balanceado!'
                                                : `Diferença de Balanço: ${fmt(diff)} (Débito: ${fmt(totalD)} / Crédito: ${fmt(totalC)})`}
                                        </span>
                                    </div>
                                    <div className="flex gap-4 font-mono">
                                        <span>D: {fmt(totalD)}</span>
                                        <span>C: {fmt(totalC)}</span>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button type="button" onClick={() => setShowNewJournal(false)} className="premium-button-secondary flex-1 py-3">Cancelar</button>
                        <button type="submit" disabled={createJournalEntry.isPending} className="premium-button-primary flex-1 py-3">
                            {createJournalEntry.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Registar Lançamento'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Document Types Configuration */}
            <Modal isOpen={showDocConfigModal} onClose={() => setShowDocConfigModal(false)} title="Configuração de Documentos Obrigatórios" subtitle="Defina quais os documentos exigidos aos clientes nos dossiers de contabilidade" width="xl">
                <div className="p-6 space-y-6">
                    {/* Add New Document Type Form */}
                    <div className="premium-card p-4 space-y-4 bg-[var(--bg-secondary)]/30 border-[var(--border-color)]/40">
                        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                            <Plus size={14} className="text-[var(--accent)]" /> Adicionar Novo Tipo
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Identificador (KEY)</label>
                                <input 
                                    value={newDocType.key} 
                                    onChange={e => setNewDocType({ ...newDocType, key: e.target.value.toUpperCase().replace(/\s+/g, '_') })} 
                                    placeholder="Ex: CONTRATOS_TRABALHO" 
                                    className="premium-input !py-2 text-xs" 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Nome do Documento</label>
                                <input 
                                    value={newDocType.label} 
                                    onChange={e => setNewDocType({ ...newDocType, label: e.target.value })} 
                                    placeholder="Ex: Contratos de Trabalho" 
                                    className="premium-input !py-2 text-xs" 
                                />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Descrição / Instruções</label>
                                <input 
                                    value={newDocType.description} 
                                    onChange={e => setNewDocType({ ...newDocType, description: e.target.value })} 
                                    placeholder="Instruções para o cliente sobre como obter e submeter este documento..." 
                                    className="premium-input !py-2 text-xs" 
                                />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Fluxo de Upload (Workflow)</label>
                                <select 
                                    value={newDocType.workflow} 
                                    onChange={e => setNewDocType({ ...newDocType, workflow: e.target.value as 'DIRECT' | 'BANK' })} 
                                    className="premium-input !py-2 text-xs"
                                >
                                    <option value="DIRECT">Directo (Ficheiro único ou simples)</option>
                                    <option value="BANK">Bancário/Transacional (Associado a contas/extratos)</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button 
                                type="button" 
                                onClick={() => {
                                    if (!newDocType.key || !newDocType.label) {
                                        toast.error('Preencha pelo menos o Identificador (KEY) e o Nome.');
                                        return;
                                    }
                                    if (customDocTypes.some(d => d.key === newDocType.key)) {
                                        toast.error('Já existe um documento com este Identificador.');
                                        return;
                                    }
                                    setCustomDocTypes([...customDocTypes, newDocType]);
                                    setNewDocType({ key: '', label: '', description: '', workflow: 'DIRECT' });
                                    toast.success('Tipo adicionado à lista temporária.');
                                }} 
                                className="premium-button-primary !py-2 text-xs !px-4"
                            >
                                Adicionar à Lista
                            </button>
                        </div>
                    </div>

                    {/* Document Types List */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Tipos Configurados ({customDocTypes.length})</label>
                        <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2 no-scrollbar">
                            {customDocTypes.map((doc, idx) => (
                                <div key={doc.key} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]/45 rounded-xl hover:border-[var(--accent)]/30 transition-all">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-bold text-[var(--text-primary)]">{doc.label}</span>
                                            <span className="text-[9px] font-mono font-bold bg-[var(--bg-primary)] px-1.5 py-0.5 rounded text-[var(--text-muted)]">{doc.key}</span>
                                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${doc.workflow === 'BANK' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>{doc.workflow}</span>
                                        </div>
                                        <p className="text-[10px] text-[var(--text-muted)] mt-1 truncate">{doc.description || 'Sem descrição.'}</p>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setCustomDocTypes(customDocTypes.filter(d => d.key !== doc.key));
                                            toast.info('Tipo removido da lista temporária.');
                                        }} 
                                        className="p-1.5 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                    >
                                        <XCircle size={15} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]/20">
                        <button 
                            type="button" 
                            onClick={() => {
                                if (configData?.requiredDocuments) {
                                    setCustomDocTypes(configData.requiredDocuments);
                                }
                                setShowDocConfigModal(false);
                            }} 
                            className="premium-button-secondary flex-1 py-3"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="button" 
                            disabled={updateRequiredDocsConfig.isPending}
                            onClick={() => {
                                updateRequiredDocsConfig.mutate({ requiredDocuments: customDocTypes });
                            }} 
                            className="premium-button-primary flex-1 py-3"
                        >
                            {updateRequiredDocsConfig.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Guardar Configurações'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
