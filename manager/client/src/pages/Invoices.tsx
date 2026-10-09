import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    FileText, 
    Plus, 
    Search, 
    Download,
    Clock, 
    Loader2, 
    Eye, 
    LayoutGrid, 
    List, 
    ShieldCheck, 
    Zap, 
    FileWarning, 
    Receipt, 
    BadgeCheck, 
    ShieldHalf, 
    FileSignature, 
    Printer, 
    PlusCircle, 
    Trash2, 
    Edit,
    FileIcon,
    History,
    DollarSign
} from 'lucide-react';

import api from '../api';
import { toast } from 'sonner';
import { usePermissions, useMe } from '../auth/useAuth';
import QRCode from 'qrcode';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { SearchableSelect } from '../components/SearchableSelect';
import { formatCurrency, formatCurrencyCompact, formatDate, formatDateTime } from '../utils/format';

const fmt = (v: number) => formatCurrency(v);
const fmtCompact = (v: number) => formatCurrencyCompact(v);

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
    PAID: {
        label: 'Liquidado',
        color: 'text-emerald-700 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        border: 'border-emerald-200/50 dark:border-emerald-500/20',
        icon: <BadgeCheck size={14} />
    },
    PENDING: {
        label: 'Pendente',
        color: 'text-amber-700 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        border: 'border-amber-200/50 dark:border-amber-500/20',
        icon: <Clock size={14} />
    },
    OVERDUE: {
        label: 'Vencido',
        color: 'text-rose-700 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-500/10',
        border: 'border-rose-200/50 dark:border-rose-500/20',
        icon: <FileWarning size={14} />
    },
    DRAFT: {
        label: 'Rascunho',
        color: 'text-slate-600 dark:text-slate-400',
        bg: 'bg-slate-50 dark:bg-slate-500/10',
        border: 'border-slate-200/50 dark:border-slate-500/20',
        icon: <FileText size={14} />
    },
};

export default function Invoices() {
    const qc = useQueryClient();
    const [view, setView] = useState<'TABLE' | 'GRID'>('TABLE');
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [page, setPage] = useState(1);

    const [clientId, setClientId] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerNif, setCustomerNif] = useState('');
    const [isAdHocClient, setIsAdHocClient] = useState(false);
    
    const [type, setType] = useState('FT');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState<{ productId?: string; quantity: number; price: number; name: string; vatRate: number }[]>([]);
    
    const [manualItemName, setManualItemName] = useState('');
    const [manualItemPrice, setManualItemPrice] = useState(0);
    const [manualItemQty, setManualItemQty] = useState(1);

    const { hasPermission } = usePermissions();
    const { data: me } = useMe();
    const isModuleEnabled = me?.company?.enabledModules?.includes('invoices') || me?.company?.enabledModules?.includes('finance') || me?.role === 'SUPER_ADMIN';
    
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('create') === 'true') {
            setIsCreateModalOpen(true);
            // Clean up URL without reload
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const itemsPerPage = 8;

    const { data: clients = [] } = useQuery({
        queryKey: ['clients'],
        queryFn: async () => (await api.get('/clients')).data
    });

    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: async () => (await api.get('/products')).data
    });

    const { data: invoicesData, isLoading } = useQuery({
        queryKey: ['invoices'],
        queryFn: async () => (await api.get('/invoices')).data
    });

    const { data: auditLogsData, isLoading: isLoadingAudit } = useQuery({
        queryKey: ['audit-logs-invoices'],
        queryFn: async () => (await api.get('/company-admin/audit-logs?limit=20')).data,
        enabled: isAuditModalOpen
    });
    const auditLogs = auditLogsData?.logs || [];

    const invoices = (invoicesData || []) as any[];
    const filtered = invoices.filter((i: any) => {
        const num = i.number || '';
        const clientName = i.client?.name || i.customerName || '';
        const searchLower = search.toLowerCase();
        return num.toLowerCase().includes(searchLower) || clientName.toLowerCase().includes(searchLower);
    });

    const paginatedData = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const resetForm = () => {
        setItems([]);
        setClientId('');
        setCustomerName('');
        setCustomerNif('');
        setIsAdHocClient(false);
        setType('FT');
        setEditingInvoiceId(null);
    };

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/invoices', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['invoices'] });
            toast.success('Fatura emitida com sucesso.');
            setIsCreateModalOpen(false);
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => api.put(`/invoices/${editingInvoiceId}`, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['invoices'] });
            toast.success('Fatura editada com sucesso.');
            setIsCreateModalOpen(false);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/invoices/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['invoices'] });
            toast.success('Documento removido.');
        }
    });

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        const payload: any = { type, issueDate, items };

        if (isAdHocClient) {
            if (!customerName) return toast.warning('Nome do cliente é obrigatório para fatura ad-hoc.');
            payload.customerName = customerName;
            payload.customerNif = customerNif || '999999999';
        } else {
            if (!clientId) return toast.warning('Selecione um cliente registado.');
            payload.clientId = clientId;
        }

        if (items.length === 0) return toast.warning('Adicione itens ao documento.');
        
        if (editingInvoiceId) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleEdit = (inv: any) => {
        setEditingInvoiceId(inv.id);
        setType(inv.type);
        setIssueDate(inv.issueDate ? new Date(inv.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
        
        if (inv.clientId) {
            setIsAdHocClient(false);
            setClientId(inv.clientId);
        } else {
            setIsAdHocClient(true);
            setCustomerName(inv.customerName || '');
            setCustomerNif(inv.customerNif || '');
        }

        const invItems = inv.items || inv.InvoiceItem || [];
        setItems(invItems.map((it: any) => ({
            productId: it.productId,
            name: it.description || it.product?.name || 'Artigo',
            quantity: it.quantity,
            price: it.unitPrice || it.price,
            vatRate: it.taxRate || 14
        })));
        
        setIsCreateModalOpen(true);
    };

    const downloadPDF = async (inv: any) => {
        try {
            const response = await api.get(`/invoices/${inv.id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${inv.number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Erro ao baixar PDF');
        }
    };

    const columns = [
        {
            header: 'N.º Documento',
            accessor: (inv: any) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--accent)]">
                        <FileIcon size={18} />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-[var(--text-primary)]">{inv.number}</p>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] opacity-50">ID: {inv.id.slice(-6).toUpperCase()}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Entidade / Cliente',
            accessor: (inv: any) => (
                <div className="text-left">
                    <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">{inv.client?.name || inv.customerName || 'Consumidor Geral'}</p>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] opacity-50 mt-1">NIF: {inv.client?.nif || inv.customerNif || '999999999'}</p>
                </div>
            )
        },
        {
            header: 'Valor Bruto',
            accessor: (inv: any) => <span className="font-bold tabular-nums text-[var(--text-primary)] block max-w-[150px] truncate" title={fmt(inv.totalAmount)}>{fmt(inv.totalAmount)}</span>
        },
        {
            header: 'Data Emissão',
            hideOnMobile: true,
            accessor: (inv: any) => <span className="text-[11px] font-bold tabular-nums opacity-60">{formatDate(inv.issueDate)}</span>
        },
        {
            header: 'Estado',
            accessor: (inv: any) => {
                const cfg = STATUS_CFG[inv.status] || STATUS_CFG.PENDING;
                return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        {cfg.icon} {cfg.label}
                    </span>
                );
            }
        },
        {
            header: '',
            accessor: (inv: any) => (
                <div className="flex gap-2 justify-end items-center">
                    <button onClick={(e) => { e.stopPropagation(); handlePreview(inv); }} className="p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all" title="Ver Detalhes"><Eye size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(inv); }} className="p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg transition-all" title="Editar Fatura"><Edit size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); downloadPDF(inv); }} className="p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-lg transition-all" title="Baixar PDF"><Download size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); if (confirm('Pretende anular/remover este documento?')) deleteMutation.mutate(inv.id); }} className="p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all" title="Eliminar"><Trash2 size={16} /></button>
                </div>
            )
        }
    ];

    const handleAddItem = (productId: string) => {
        const product = products.find((p: any) => p.id === productId);
        if (!product) return;
        setItems([...items, { 
            productId: product.id, 
            name: product.name, 
            quantity: 1, 
            price: product.price,
            vatRate: product.vatRate || 14 
        }]);
    };

    const handleAddManualItem = () => {
        if (!manualItemName || manualItemPrice <= 0) return toast.warning('Nome e preço são obrigatórios.');
        setItems([...items, { 
            name: manualItemName, 
            quantity: manualItemQty, 
            price: manualItemPrice, 
            vatRate: 14 
        }]);
        setManualItemName('');
        setManualItemPrice(0);
        setManualItemQty(1);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handlePreview = async (inv: any) => {
        if (window.innerWidth < 640) {
            toast.info('Modo Compacto: Processando transferência direta do documento...');
            return downloadPDF(inv);
        }
        setSelectedInvoice(inv);
        try {
            // Gerar um link público para visualização da factura (Web Proof)
            const publicUrl = `${window.location.origin}/info/invoice-${inv.id}`;
            const url = await QRCode.toDataURL(publicUrl, { 
                margin: 1, 
                width: 300, 
                color: { dark: '#000000', light: '#ffffff' } 
            });
            setQrCodeUrl(url);
        } catch (err) {}

        setIsPreviewOpen(true);
    };

    const stats = {
        total: invoices.reduce((acc: number, i: any) => acc + i.totalAmount, 0),
        pending: invoices.filter((i: any) => i.status === 'PENDING').reduce((acc: number, i: any) => acc + i.totalAmount, 0),
        count: invoices.length,
        conversion: invoices.length > 0 ? Number(((invoices.filter((i: any) => i.status === 'PAID').length / invoices.length) * 100).toFixed(1)) : 0
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">
                        Faturação e Receitas
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">
                        Software Certificado n.º 232/AGT/2026 · Gestão Fiscal
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-0.5 mr-2">
                        <button 
                            onClick={() => setView('GRID')} 
                            className={`p-1.5 rounded-[var(--radius-sm)] transition-colors ${view === 'GRID' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                        >
                            <LayoutGrid size={15} />
                        </button>
                        <button 
                            onClick={() => setView('TABLE')} 
                            className={`p-1.5 rounded-[var(--radius-sm)] transition-colors ${view === 'TABLE' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                        >
                            <List size={15} />
                        </button>
                    </div>
                    {hasPermission('invoices:create') && isModuleEnabled && (
                        <button onClick={() => setIsCreateModalOpen(true)} className="premium-button-primary">
                            <Plus size={15} />
                            <span>Emitir documento</span>
                        </button>
                    )}
                </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Volume total', value: fmtCompact(stats.total), icon: <DollarSign size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Em aberto', value: fmtCompact(stats.pending), icon: <Clock size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                    { label: 'Documentos', value: stats.count.toString(), icon: <FileText size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Conversão', value: `${stats.conversion}%`, icon: <Zap size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                ].map((kpi, i) => (
                    <div key={i} className="premium-card p-4 flex items-start gap-3">
                        <div className={`kpi-icon shrink-0 ${kpi.color} ${kpi.bg}`}>
                            {kpi.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-[var(--text-muted)] mb-0.5 truncate">{kpi.label}</p>
                            <p className="text-base font-bold text-[var(--text-primary)] tabular-nums leading-tight">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Logic */}
            {isLoading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm">A carregar dados...</span>
                </div>
            ) : view === 'GRID' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {paginatedData.map(inv => (
                        <div 
                            key={inv.id} 
                            onClick={() => handlePreview(inv)} 
                            className="premium-card p-5 group cursor-pointer hover:border-[var(--accent)] transition-all flex flex-col gap-4 active:scale-[0.98]"
                        >
                            <div className="flex justify-between items-start">
                                <div className="p-2.5 bg-[var(--bg-primary)] rounded-lg text-[var(--accent)] border border-[var(--border-color)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                                    <FileText size={18} />
                                </div>
                                <span className={`badge ${
                                    inv.status === 'PAID' 
                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
                                        : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                                }`}>
                                    {inv.status === 'PAID' ? 'Pago' : 'Pendente'}
                                </span>
                            </div>
                            
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-[var(--text-primary)]">{inv.number}</h3>
                                <p className="text-xs text-[var(--text-secondary)] truncate">
                                    {inv.client?.name || inv.customerName || 'Cliente Geral'}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-[var(--border-color)] flex justify-between items-end mt-auto">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Montante</p>
                                    <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{fmt(inv.totalAmount)}</p>
                                </div>
                                <div className="p-2 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(inv); }} className="hover:text-amber-500 transition-colors"><Edit size={16} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handlePreview(inv); }} className="hover:text-[var(--accent)] transition-colors"><Eye size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="premium-card p-1 overflow-visible shadow-2xl">
                    <DataTable 
                        data={paginatedData}
                        columns={columns}
                        isLoading={isLoading}
                        currentPage={page}
                        totalPages={totalPages}
                        totalItems={filtered.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setPage}
                        onSearchChange={setSearch}
                        searchValue={search}
                        onRowClick={handlePreview}
                        searchPlaceholder="Pesquisar por N.º, Cliente ou NIF..."
                    />
                </div>
            )}

            {/* Certification Footer */}
            <div className="premium-card p-6 sm:p-12 mt-12 bg-[var(--accent)]/[0.02] flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-12 group">
                <div className="flex items-center gap-4 sm:gap-8 relative z-10 text-left flex-col lg:flex-row">
                    <div className="p-6 bg-[var(--accent)]/10 text-[var(--accent)] rounded-[var(--radius-sm)] border border-[var(--accent)]/20 group-hover:rotate-6 transition-transform">
                        <ShieldHalf size={48} />
                    </div>
                    <div>
                         <h4 className="text-[12px] font-bold text-[var(--accent)] mb-3 leading-none">Segurança Fiscal</h4>
                        <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4 leading-none">Software Certificado n.º 232/AGT/2026</p>
                        <p className="text-sm text-[var(--text-secondary)] font-medium max-w-2xl leading-relaxed opacity-60">
                            A integridade dos registos fiscais é garantida por sistemas de segurança e cópias de segurança em tempo real.
                        </p>
                    </div>
                </div>
                <button onClick={() => setIsAuditModalOpen(true)} className="premium-button-secondary !px-6 sm:px-12 !py-5 font-bold !border-[var(--border-color)]">
                    Canais de Auditoria
                </button>
            </div>

            {/* Modal: Emissão/Edição de Fatura */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => { setIsCreateModalOpen(false); resetForm(); }}
                title={editingInvoiceId ? "Editar Documento Fiscal" : "Configurar Emissão Fiscal"}
                subtitle="Gestão e Conformidade Fiscal"
                type="CENTER"
                width="xl"
                icon={<FileSignature size={24} className="text-[var(--accent)]" />}
            >
                <form onSubmit={(e)=>{e.preventDefault(); handleSubmit(e);}} className="p-5 sm:p-10 space-y-10 text-left bg-[var(--bg-secondary)]">
                    <div className="space-y-6 flex flex-col">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)]">Beneficiário Legal</label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <span className={`text-[9px] font-bold transition-colors ${isAdHocClient ? 'text-[var(--accent)]' : 'text-slate-400 opacity-60'}`}>Factura Avulsa (Ad-hoc)</span>
                                <input type="checkbox" checked={isAdHocClient} onChange={v => setIsAdHocClient(v.target.checked)} className="hidden" />
                                <div className={`w-8 h-4 rounded-full relative transition-all ${isAdHocClient ? 'bg-[var(--accent)]' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isAdHocClient ? 'left-4.5' : 'left-0.5'}`} />
                                </div>
                            </label>
                        </div>
                        
                        {!isAdHocClient ? (
                            <SearchableSelect 
                                options={clients.map((c: any) => ({ label: `${c.name} (NIF: ${c.nif})`, value: c.id }))}
                                value={clientId}
                                onChange={val => setClientId(val)}
                                placeholder="Buscar no diretório de entidades..."
                            />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input required placeholder="Nome do Cliente Final" value={customerName} onChange={e => setCustomerName(e.target.value)} className="premium-input font-bold text-sm !py-6" />
                                <input placeholder="NIF (999999999 se omitido)" value={customerNif} onChange={e => setCustomerNif(e.target.value)} className="premium-input font-bold text-sm !py-6" />
                            </div>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                        <div className="space-y-4 flex flex-col">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)]">Tipo de Documento</label>
                            <SearchableSelect 
                                options={[
                                    { label: 'Fatura (FT)', value: 'FT' },
                                    { label: 'Fatura Recibo (FR)', value: 'FR' },
                                    { label: 'Próforma (PP)', value: 'PP' },
                                    { label: 'Recibo (RC)', value: 'RC' }
                                ]}
                                value={type}
                                onChange={val => setType(val)}
                            />
                        </div>
                        <div className="space-y-4 flex flex-col">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)]">Data de Emissão</label>
                            <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="premium-input font-bold text-sm !py-6" />
                        </div>
                    </div>

                    <div className="space-y-6 flex flex-col">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)]">Itens / Serviços</label>
                        <div className="flex flex-col gap-4">
                            <SearchableSelect 
                                options={products.map((p: any) => ({ label: `${p.name.toUpperCase()} — ${fmt(p.price)}`, value: p.id }))}
                                value=""
                                onChange={val => { if (val) handleAddItem(val); }}
                                placeholder="Seleccionar do catálogo registado..."
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 bg-[var(--bg-primary)]/40 rounded-2xl border border-dashed border-[var(--border-color)]">
                                <div className="md:col-span-6">
                                    <input placeholder="Descrição do item ou serviço..." value={manualItemName} onChange={e => setManualItemName(e.target.value)} className="premium-input w-full text-sm font-bold !py-5" />
                                </div>
                                <div className="md:col-span-3">
                                    <input type="number" placeholder="Preço" value={manualItemPrice || ''} onChange={e => setManualItemPrice(Number(e.target.value))} className="premium-input w-full text-sm font-bold !py-5" />
                                </div>
                                <div className="md:col-span-2">
                                    <input type="number" placeholder="Qt" value={manualItemQty || ''} onChange={e => setManualItemQty(Number(e.target.value))} className="premium-input w-full text-sm font-bold !py-5 text-center" />
                                </div>
                                <div className="md:col-span-1 flex items-center justify-center">
                                    <button type="button" onClick={handleAddManualItem} className="w-full h-full min-h-[50px] bg-[var(--accent)] text-white rounded-xl hover:opacity-80 transition-all flex items-center justify-center">
                                        <Plus size={20}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="max-h-52 overflow-y-auto space-y-2 pr-2 no-scrollbar">
                            {items.map((item, idx) => (
                                <div key={idx} className="premium-card p-5 flex items-center justify-between border-dashed bg-[var(--bg-primary)]/40 hover:border-[var(--accent)] group transition-all">
                                    <div className="text-left py-2">
                                        <p className="text-sm font-bold text-[var(--text-primary)]">{item.name}</p>
                                        <p className="text-[11px] font-bold text-[var(--accent)] opacity-60 mt-2">{fmt(item.price)} × {item.quantity}</p>
                                    </div>
                                    <button type="button" onClick={()=>handleRemoveItem(idx)} className="p-3 bg-rose-50 text-rose-500 rounded-xl border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-10 border-t border-[var(--border-color)] flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-[var(--text-muted)] opacity-60 mb-2">Total do Documento</p>
                            <p className="text-5xl font-bold text-[var(--text-primary)]">{fmt(items.reduce((acc, it) => acc + (it.price * it.quantity * 1.14), 0))}</p>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                        <button type="button" onClick={() => { setIsCreateModalOpen(false); resetForm(); }} className="premium-button-secondary flex-1 py-5">Abortar</button>
                        <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="premium-button-primary flex-[2] py-5">
                            {(createMutation.isPending || updateMutation.isPending) ? <Loader2 size={24} className="animate-spin" /> : <ShieldCheck size={24} />}
                            {editingInvoiceId ? "Salvar Alterações" : "Emitir e Publicar"}
                        </button>
                    </div>
                </div>
            </form>
            </Modal>

            {/* Modal: Preview Fatura - ALTA FIDELIDADE & THEME-AWARE */}
            <Modal
                isOpen={isPreviewOpen && !!selectedInvoice}
                onClose={() => setIsPreviewOpen(false)}
                title={`Terminal de Visualização: ${selectedInvoice?.number}`}
                type="CENTER"
                width="full"
                icon={<Printer size={24} className="text-[var(--text-primary)]" />}
            >
                {selectedInvoice && (
                    <div className="flex flex-col h-full bg-[var(--bg-primary)] overflow-hidden text-left">
                        {/* Control Bar */}
                        <div className="bg-[var(--bg-secondary)] p-6 border-b border-[var(--border-color)] flex justify-between items-center print:hidden shadow-md relative z-20">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl shadow-inner border border-emerald-500/10"><BadgeCheck size={24} /></div>
                                <div>
                                    <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-[0.3em] leading-none">Documento Fiscal Autêntico</span>
                                    <p className="text-[9px] font-bold text-emerald-500 mt-1 uppercase tracking-widest leading-none">Certificado pela AGT em tempo-real</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => downloadPDF(selectedInvoice)} className="premium-button-secondary !px-6 sm:px-12 !py-4 !border-[var(--border-color)] !text-[var(--text-primary)] active:scale-95 transition-all !bg-[var(--bg-secondary)] font-bold text-[10px]">
                                    <Download size={20} /> Baixar Cópia Digital Certificada
                                </button>
                            </div>
                        </div>

                        {/* Invoice Canvas: Clean Paper Style, No backgrounds */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-10 flex justify-center bg-slate-100 dark:bg-slate-900/50">
                             {/* Paper Simulation: Pure White, No gradients or blurs */}
                            <div className="bg-white text-slate-900 w-full max-w-[850px] min-h-[1050px] p-8 sm:p-12 md:p-16 font-sans print:p-0 border border-slate-200">
                                
                                {/* Top Branding: Professional Layout */}
                                <div className="flex justify-between items-start mb-10 border-b-2 border-slate-900 pb-8">
                                    <div className="space-y-6 flex flex-col items-start text-left">
                                        <div className="flex items-center gap-6">
                                            {/* Logo Fallback: Using VA-ONE-GEST logo if company logo is missing */}
                                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                <img 
                                                    src={me?.company?.logo || "/logo_full.png"} 
                                                    alt="Logo" 
                                                    className="h-16 w-auto object-contain mix-blend-multiply" 
                                                    onError={(e) => { (e.target as any).src = '/logo_full.png'; }}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-xl font-black text-slate-950 leading-none">{me?.company?.name || 'DOMÍNIO INSTITUCIONAL'}</p>
                                                <p className="text-[9px] font-bold text-slate-500 mt-1.5 uppercase tracking-wider">Software Certificado nº 232/AGT/2026</p>
                                            </div>
                                        </div>
                                        <div className="text-[10px] space-y-0.5 text-left font-medium text-slate-700 leading-tight max-w-sm">
                                            <p className="font-bold text-slate-950">{me?.company?.name?.toUpperCase()}</p>
                                            <p>{me?.company?.address || 'LUANDA, ANGOLA CORPORATE CENTER'}</p>
                                            <p className="pt-1.5 font-bold text-slate-950">NIF: {me?.company?.nif || '5417382910'}</p>
                                            <p>Tel: {me?.company?.phone || 'N/A'} | Email: {me?.company?.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Original</div>
                                        <h2 className="text-3xl font-black text-slate-950 mb-4 leading-none uppercase tracking-tighter">
                                            {selectedInvoice.type === 'FR' ? 'Fatura-Recibo' : 
                                             selectedInvoice.type === 'FT' ? 'Fatura' : 
                                             selectedInvoice.type === 'PP' ? 'Fatura Pró-forma' : 'Documento'}
                                        </h2>
                                        <div className="bg-slate-950 text-white px-6 py-3 min-w-[220px]">
                                            <p className="text-xl font-black tabular-nums text-center tracking-tight">{selectedInvoice.number}</p>
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] font-bold text-slate-500">
                                            <span className="text-right uppercase opacity-60">Data de Emissão:</span>
                                            <span className="text-slate-950">{formatDate(selectedInvoice.issueDate)}</span>
                                            <span className="text-right uppercase opacity-60">Data de Vencimento:</span>
                                            <span className="text-slate-950">{formatDate(selectedInvoice.dueDate || selectedInvoice.issueDate)}</span>
                                            <span className="text-right uppercase opacity-60">Página:</span>
                                            <span className="text-slate-950">1 de 1</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Body Information */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-12 font-sans text-left">
                                    <div className="space-y-4">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border-l-4 border-slate-950 pl-4 mb-4">Dados do Cliente</p>
                                        <div className="text-2xl font-bold text-slate-950 leading-none">
                                            {selectedInvoice.client?.name || selectedInvoice.customerName || 'Consumidor Final'}
                                        </div>
                                        <div className="text-[11px] text-slate-600 font-medium space-y-1 pt-4 leading-relaxed">
                                            <p>{selectedInvoice.client?.address || 'LUANDA, ANGOLA'}</p>
                                            <p className="pt-2 font-bold text-slate-950 text-xs">
                                                NIF: {selectedInvoice.client?.nif || selectedInvoice.customerNif || 'Consumidor Final'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border-l-4 border-slate-200 pl-4 mb-4">Verificação Digital</p>
                                        <div className="flex justify-center md:justify-start">
                                            <div className="p-1 bg-white rounded border border-slate-200 shadow-sm">
                                                {qrCodeUrl ? <img src={qrCodeUrl} alt="QR Verification" className="h-28 w-28 grayscale" /> : <div className="h-28 w-28 bg-slate-50 border border-dashed border-slate-200" />}
                                            </div>
                                        </div>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-normal">
                                            Digital Signature Hash: <br/> 
                                            <span className="break-all font-mono opacity-60 text-[7px]">{selectedInvoice.hash?.substring(0, 100)}...</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Items Table: High Contrast, Clean Design */}
                                <div className="mb-8 overflow-hidden border-x border-slate-200">
                                    <table className="w-full text-left border-collapse font-sans bg-white">
                                        <thead className="bg-slate-50 border-y-2 border-slate-900">
                                            <tr className="text-[9px] font-black uppercase text-slate-900">
                                                <th className="py-3 px-6">Descrição dos Serviços / Bens</th>
                                                <th className="py-3 text-center w-16">Cód</th>
                                                <th className="py-3 text-right w-24">Preço Uni</th>
                                                <th className="py-3 text-center w-12">Unid</th>
                                                <th className="py-3 text-center w-12">Qtd</th>
                                                <th className="py-3 text-center w-12">Taxa %</th>
                                                <th className="py-3 text-right w-32 pr-6">Total Líquido</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-[10px] font-medium text-slate-800">
                                            {(selectedInvoice.items || selectedInvoice.InvoiceItem || []).map((item: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                    <td className="py-4 px-6 font-bold text-slate-950 uppercase">{item.description || item.product?.name || item.name || 'Operação'}</td>
                                                    <td className="py-4 text-center tabular-nums text-slate-400 text-[8px]">{item.productCode || '0000'}</td>
                                                    <td className="py-4 text-right tabular-nums text-slate-600">{fmt(item.unitPrice || item.price).replace(' Kz', '')}</td>
                                                    <td className="py-4 text-center tabular-nums text-slate-400 text-[8px] uppercase">{item.product?.unit || 'UN'}</td>
                                                    <td className="py-4 text-center tabular-nums text-slate-600 font-bold">{item.quantity}</td>
                                                    <td className="py-4 text-center tabular-nums text-slate-600">{item.vatRate || 14},00</td>
                                                    <td className="py-4 text-right pr-6 tabular-nums text-slate-950 font-bold">{fmt(item.totalAmount || (item.quantity * item.price)).replace(' Kz', '')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Summary & Tax Grid: Identical to Backend */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                    <div className="space-y-4">
                                        <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Quadro Resumo de Imposto</p>
                                        <table className="w-full text-[9px] border border-slate-100">
                                            <thead className="bg-slate-50 text-slate-400 font-bold">
                                                <tr>
                                                    <th className="p-2 text-left">DESCRIÇÃO</th>
                                                    <th className="p-2 text-right">INCIDÊNCIA</th>
                                                    <th className="p-2 text-right">IMPOSTO</th>
                                                </tr>
                                            </thead>
                                            <tbody className="font-bold text-slate-700">
                                                <tr className="border-t border-slate-50">
                                                    <td className="p-2">IVA 14,00%</td>
                                                    <td className="p-2 text-right">{fmt(selectedInvoice.totalAmount - (selectedInvoice.totalVat || 0)).replace(' Kz', '')}</td>
                                                    <td className="p-2 text-right">{fmt(selectedInvoice.totalVat || 0).replace(' Kz', '')}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div className="pt-4 text-[10px] font-bold text-slate-950">
                                            TOTAL POR EXTENSO: <span className="opacity-60">{(selectedInvoice.totalAmount > 0 ? 'VALOR TOTAL EM KWANZAS' : '')}</span>
                                        </div>
                                        {(me?.company?.bankAccounts?.length ?? 0) > 0 && (
                                            <div className="pt-4 border-t border-slate-100">
                                                <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Coordenadas Bancárias</p>
                                                {me?.company?.bankAccounts?.map((ba: any, idx: number) => (
                                                    <p key={idx} className="text-[9px] font-bold text-slate-700">{ba.bank}: {ba.iban}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="bg-slate-50 p-6 space-y-3 rounded-lg border border-slate-100">
                                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                            <span>Total Ilíquido</span>
                                            <span className="text-slate-950 tabular-nums">{fmt(selectedInvoice.totalAmount - (selectedInvoice.totalVat || 0))}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                            <span>Total Imposto</span>
                                            <span className="text-slate-950 tabular-nums">{fmt(selectedInvoice.totalVat || 0)}</span>
                                        </div>
                                        <div className="pt-4 border-t-2 border-slate-950 flex justify-between items-baseline">
                                            <span className="text-sm font-black text-slate-950 uppercase">Total a Pagar (Kz)</span>
                                            <span className="text-3xl font-black text-slate-950 tabular-nums tracking-tighter">{fmt(selectedInvoice.totalAmount).replace(' Kz', '')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Legal Footer: Pure Identity & AGT Icon */}
                                <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-end font-sans">
                                    <div className="space-y-2 text-left max-w-md">
                                        <p className="text-[9px] font-black text-slate-950 uppercase">
                                            {(selectedInvoice.hash || '').substring(0,4)} - Processado por Programa Validado nº 232/AGT/2026
                                        </p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">
                                            Software VA OneGest Sovereign v2.1 // Módulo: COMERCIAL // Regime: Geral
                                        </p>
                                        <p className="text-[7px] font-bold text-slate-300 break-all leading-tight">
                                            HASH: {selectedInvoice.hash || 'DRAFT-MODE-SYSTEM-NOT-SIGNED-YET'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Certificação Digital</p>
                                            <p className="text-[9px] font-black text-slate-950 uppercase leading-none">AGT ANGOLA</p>
                                        </div>
                                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                                             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Logo_AGT.png/600px-Logo_AGT.png" alt="AGT" className="w-10 h-10 object-contain grayscale opacity-80" onError={(e) => { (e.target as any).src = 'https://www.agt.minfin.gov.ao/PortalAGT/img/logo-agt.png'; }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </Modal>
            
            {/* Modal: Audit Channels */}
            <Modal
                isOpen={isAuditModalOpen}
                onClose={() => setIsAuditModalOpen(false)}
                title="Canais de Auditoria"
                subtitle="Histórico de Operações"
                type="SIDE"
                width="xl"
                icon={<ShieldCheck size={24} className="text-emerald-500" />}
            >
                <div className="flex flex-col h-full bg-[var(--bg-primary)] p-0">
                    <div className="p-5 sm:p-10 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] relative overflow-hidden text-left">
                        <div className="absolute top-0 right-0 p-5 sm:p-10 opacity-5 -rotate-12 scale-150"><ShieldCheck size={120} /></div>
                        <h4 className="text-sm font-bold text-[var(--accent)] mb-2 relative z-10">Estado do Canal</h4>
                        <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] relative z-10">Sistema de Alta Fidelidade</p>
                        <p className="text-[10px] text-[var(--text-muted)] font-bold mt-4 relative z-10 opacity-60">Sincronização Ativa</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 sm:p-10 space-y-6">
                        {isLoadingAudit ? (
                            <div className="py-20 flex flex-col items-center gap-4 opacity-40">
                                <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Acedendo ao Ledger...</span>
                            </div>
                        ) : auditLogs.length === 0 ? (
                            <div className="py-20 text-center opacity-40">
                                <p className="text-[10px] font-black uppercase tracking-widest">Nenhum evento detectado no canal.</p>
                            </div>
                        ) : (
                            auditLogs.slice(0, 20).map((log: any) => (
                                <div key={log.id} className="premium-card p-6 flex flex-col gap-4 border-l-4 border-l-[var(--accent)] hover:bg-[var(--bg-secondary)] transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-[var(--bg-primary)] rounded-lg text-[var(--text-primary)]"><History size={14} /></div>
                                            <p className="text-[11px] font-bold">{log.action || 'OPERAÇÃO'}</p>
                                        </div>
                                        <span className="text-[9px] font-bold tabular-nums opacity-40">{formatDateTime(log.createdAt)}</span>
                                    </div>
                                    <p className="text-[11px] text-[var(--text-muted)] font-medium leading-relaxed uppercase tracking-tight">
                                        {log.details || `Evento assinado digitalmente pelo utilizador ID #${log.userId?.slice(-6)}`}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
