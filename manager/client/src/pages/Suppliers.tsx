import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Truck, Plus, Edit, Trash2, X, Building2, Mail, Phone, MapPin, 
    ShieldCheck, Loader2, Globe, Star, BadgeCheck, PlusCircle, 
    LayoutGrid, List, Search, CreditCard, Layers, TrendingUp, 
    ShieldAlert, Target, Zap, Scale, Building, ChevronRight, Fingerprint
} from 'lucide-react';
import { toast } from 'sonner';
import api, { lookupTaxpayer } from '../api';
import { usePermissions, useMe } from '../auth/useAuth';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { SearchableSelect } from '../components/SearchableSelect';

import { formatCurrency } from '../utils/format';
const fmt = (v: number) => formatCurrency(v);

interface Supplier {
    id: string; 
    name: string; 
    nif: string;
    email: string | null; 
    phone: string | null; 
    address: string | null;
}

export default function Suppliers() {
    const qc = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [page, setPage] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    
    const { hasPermission } = usePermissions();
    const { data: me } = useMe();
    const isModuleEnabled = me?.company?.enabledModules?.includes('inventory') || me?.role === 'SUPER_ADMIN';

    const [form, setForm] = useState({
        name: '',
        nif: '',
        email: '',
        phone: '',
        address: '',
        category: 'GOODS',
        paymentTerms: '30_DAYS',
        accountAssignment: '2111-FORNECEDORES-GERAIS',
        rating: 5,
        isActive: true
    });

    const itemsPerPage = 8;

    const { data: suppliersData, isLoading } = useQuery({
        queryKey: ['suppliers'],
        queryFn: async () => (await api.get('/suppliers')).data as Supplier[]
    });

    const suppliers = suppliersData || [];
    const filtered = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.nif.includes(searchTerm)
    );

    const paginatedData = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/suppliers', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['suppliers'] });
            toast.success('Fornecedor registado.');
            closeModal();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, ...data }: any) => api.put(`/suppliers/${id}`, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['suppliers'] });
            toast.success('Perfil actualizado.');
            closeModal();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/suppliers/${id}`),
        onSuccess: () => { 
            qc.invalidateQueries({ queryKey: ['suppliers'] }); 
            toast.info('Fornecedor removido.'); 
        }
    });

    const handleTaxpayerLookup = async (nifValue: string) => {
        if (!nifValue || nifValue.length < 9) return;
        setIsSearching(true);
        try {
            const { data } = await lookupTaxpayer(nifValue);
            if (data) {
                setForm(prev => ({
                    ...prev,
                    name: (data.name || data.gsmc || prev.name).toUpperCase(),
                    email: data.email || prev.email,
                    phone: data.phone || data.lxfs || prev.phone,
                    address: data.address || data.nsrdz || prev.address
                }));
                toast.success('Identidade institucional validada.');
            }
        } catch (error) {
            console.error('Taxpayer lookup failed', error);
        } finally {
            setIsSearching(false);
        }
    };

    const openModal = (s?: any) => {
        if (s) {
            setEditingSupplier(s);
            setForm({
                name: s.name,
                nif: s.nif,
                email: s.email || '',
                phone: s.phone || '',
                address: s.address || '',
                category: s.category || 'GOODS',
                paymentTerms: s.paymentTerms || '30_DAYS',
                accountAssignment: s.accountAssignment || '2111-FORNECEDORES-GERAIS',
                rating: s.rating || 5,
                isActive: s.isActive ?? true
            });
        } else {
            setEditingSupplier(null);
            setForm({ 
                name: '', nif: '', email: '', phone: '', address: '', 
                category: 'GOODS', paymentTerms: '30_DAYS', 
                accountAssignment: '2111-FORNECEDORES-GERAIS', rating: 5, isActive: true 
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSupplier(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSupplier) updateMutation.mutate({ id: editingSupplier.id, ...form });
        else createMutation.mutate(form);
    };

    const columns = [
        {
            header: 'Fornecedor',
            accessor: (s: Supplier) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center font-bold text-[var(--accent)]">
                        <Truck size={18} />
                    </div>
                    <div>
                        <p className="font-bold leading-none mb-1">{s.name}</p>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-tight opacity-50">NIF: {s.nif}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Contactos',
            accessor: (s: Supplier) => (
                <div className="space-y-1">
                    {s.email && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)]">
                            <Mail size={12} className="text-sky-400 opacity-40" /> {s.email}
                        </div>
                    )}
                    {s.phone && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)]">
                            <Phone size={12} className="text-emerald-400 opacity-40" /> {s.phone}
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Morada',
            accessor: (s: Supplier) => <span className="text-[11px] font-bold text-[var(--text-secondary)] opacity-60 truncate max-w-[150px] inline-block uppercase">{s.address || 'ANGOLA'}</span>
        },
        {
            header: '',
            accessor: (s: Supplier) => (
                <div className="flex items-center justify-end gap-2">
                    {hasPermission('suppliers:update') && (
                        <button onClick={(e) => { e.stopPropagation(); openModal(s); }} className="p-2 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--accent)] border border-[var(--border-color)] transition-all">
                            <Edit size={14} />
                        </button>
                    )}
                    {hasPermission('suppliers:delete') && (
                        <button onClick={(e) => { e.stopPropagation(); if (confirm('Remover?')) deleteMutation.mutate(s.id); }} className="p-2 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-rose-600 border border-[var(--border-color)] transition-all">
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            ),
            className: "text-right"
        }
    ];

    if (isLoading) return (
        <div className="py-40 flex flex-col items-center justify-center gap-6 opacity-30">
            <Loader2 size={48} className="animate-spin text-[var(--accent)]" />
            <p className="text-xs font-bold uppercase tracking-widest">A carregar fornecedores...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Gestão de Fornecedores</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Gestão da cadeia de suprimentos e parcerias estratégicas.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1 rounded-[var(--radius-md)] shadow-sm">
                        <button onClick={() => setViewMode('grid')} className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}><LayoutGrid size={16} /></button>
                        <button onClick={() => setViewMode('table')} className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${viewMode === 'table' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}><List size={16} /></button>
                    </div>
                    {hasPermission('suppliers:create') && isModuleEnabled && (
                        <button onClick={() => openModal()} className="premium-button-primary">
                            <Plus size={18} /> Novo Fornecedor
                        </button>
                    )}
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Fornecedores', value: suppliers.length.toString(), icon: <Truck size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Total Compras', value: 'AOA 84.2M', icon: <Scale size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                    { label: 'Nível de Serviço', value: '4.9/5.0', icon: <Target size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Prazo Pagamento', value: '32 Dias', icon: <CreditCard size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
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

            {/* Search */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-[var(--radius-md)] flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input 
                        type="text"
                        placeholder="Pesquisar por nome ou NIF..."
                        className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedData.map(s => (
                        <div key={s.id} className="premium-card p-6 border border-[var(--border-color)] group hover:border-[var(--accent)] transition-all cursor-pointer" onClick={() => openModal(s)}>
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-10 h-10 bg-[var(--bg-primary)] text-[var(--accent)] rounded-lg flex items-center justify-center border border-[var(--border-color)] group-hover:scale-105 transition-transform">
                                    <Building2 size={20} />
                                </div>
                                <div className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase border border-emerald-100">
                                    Ativo
                                </div>
                            </div>
                            <div className="mb-6">
                                <h3 className="font-bold text-[var(--text-primary)] leading-tight mb-1 line-clamp-2">{s.name}</h3>
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-40 uppercase tracking-widest">NIF: {s.nif}</p>
                            </div>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 p-3 bg-[var(--bg-primary)]/40 rounded-xl border border-[var(--border-color)]">
                                    <Mail size={14} className="text-sky-400 opacity-40" />
                                    <span className="text-[11px] font-medium text-[var(--text-secondary)] truncate">{s.email || 'N/D'}</span>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-[var(--bg-primary)]/40 rounded-xl border border-[var(--border-color)]">
                                    <MapPin size={14} className="text-rose-400 opacity-40 mt-0.5 shrink-0" />
                                    <span className="text-[11px] font-medium text-[var(--text-secondary)] line-clamp-1 uppercase">{s.address || 'ANGOLA'}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                                <div className="flex -space-x-1">
                                    {[1, 2].map(i => (
                                        <div key={i} className="w-6 h-6 rounded-full border border-white bg-[var(--bg-primary)] text-[8px] font-bold flex items-center justify-center text-[var(--accent)] shadow-sm">VA</div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); openModal(s); }} className="p-2 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--accent)] border border-[var(--border-color)] transition-all">
                                        <Edit size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
                    <DataTable 
                        data={paginatedData}
                        columns={columns}
                        isLoading={isLoading}
                        currentPage={page}
                        totalPages={totalPages}
                        totalItems={filtered.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setPage}
                        onRowClick={openModal}
                        showSearch={false}
                    />
                </div>
            )}

            {/* Modal: Perfil do Fornecedor */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingSupplier ? 'Perfil do Parceiro' : 'Novo Fornecedor'}
                subtitle="Gestão de fornecedores e condições contratuais."
                type="CENTER"
                width="xl"
                icon={<PlusCircle size={24} className="text-[var(--accent)]" />}
            >
                <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">NIF Institucional</label>
                            <div className="relative">
                                <Fingerprint size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isSearching ? 'animate-pulse text-amber-500' : 'text-[var(--accent)] opacity-40'}`} />
                                <input 
                                    required 
                                    value={form.nif} 
                                    onChange={e => {
                                        const val = e.target.value.toUpperCase();
                                        setForm(p => ({ ...p, nif: val }));
                                        if (val.length === 10 || val.length === 14) handleTaxpayerLookup(val);
                                    }}
                                    className="premium-input !py-4 !pl-10 font-bold tracking-widest" 
                                    placeholder="NIF..." 
                                />
                                {isSearching && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--accent)]" />}
                            </div>
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Nome do Fornecedor</label>
                            <input 
                                required 
                                value={form.name} 
                                onChange={e => setForm(p => ({ ...p, name: e.target.value.toUpperCase() }))} 
                                className="premium-input !py-4 font-bold uppercase" 
                                placeholder={isSearching ? "A VALIDAR..." : "RAZÃO SOCIAL..."} 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Categoria</label>
                                <SearchableSelect 
                                    options={[
                                        { label: 'FORNECIMENTO DE BENS', value: 'GOODS' },
                                        { label: 'PRESTAÇÃO DE SERVIÇOS', value: 'SERVICES' },
                                        { label: 'UTILITÁRIOS (ÁGUA/LUZ)', value: 'UTILITIES' },
                                        { label: 'TELECOMUNICAÇÕES & TI', value: 'TELECOM' },
                                        { label: 'ARRENDAMENTO & RENDAS', value: 'RENT' }
                                    ]}
                                    value={form.category}
                                    onChange={val => setForm(p => ({ ...p, category: val }))}
                                />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Condições de Pagamento</label>
                                <SearchableSelect 
                                    options={[
                                        { label: 'PRONTO PAGAMENTO', value: 'IMMEDIATE' },
                                        { label: 'CRÉDITO 15 DIAS', value: '15_DAYS' },
                                        { label: 'CRÉDITO 30 DIAS (PADRÃO)', value: '30_DAYS' },
                                        { label: 'CRÉDITO 60 DIAS', value: '60_DAYS' }
                                    ]}
                                    value={form.paymentTerms}
                                    onChange={val => setForm(p => ({ ...p, paymentTerms: val }))}
                                />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Conta Contabilística</label>
                                <SearchableSelect 
                                    options={[
                                        { label: '2.1.1.1 - GERAIS', value: '2111-FORNECEDORES-GERAIS' },
                                        { label: '2.1.1.2 - SERVIÇOS', value: '2112-FORNECEDORES-SERVICOS' },
                                        { label: '2.1.1.3 - ESTRANGEIRO', value: '2113-FORNECEDORES-ESTRANGEIRO' }
                                    ]}
                                    value={form.accountAssignment}
                                    onChange={val => setForm(p => ({ ...p, accountAssignment: val }))}
                                />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-y border-[var(--border-color)]/30 py-6">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-[var(--accent)] uppercase px-1 flex items-center gap-2">
                                <MapPin size={14} /> Localização
                            </h4>
                            <textarea 
                                value={form.address} 
                                onChange={e => setForm(p => ({ ...p, address: e.target.value.toUpperCase() }))} 
                                rows={2} 
                                className="premium-input resize-none py-4 text-xs font-bold uppercase" 
                                placeholder="MORADA COMPLETA..." 
                            />
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-[var(--accent)] uppercase px-1 flex items-center gap-2">
                                <Mail size={14} /> Contactos
                            </h4>
                            <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="premium-input !py-4 text-xs font-bold" placeholder="EMAIL CORPORATIVO" />
                            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="premium-input !py-4 text-xs font-bold" placeholder="TELEFONE" />
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={closeModal} className="premium-button-secondary flex-1 uppercase">Cancelar</button>
                        <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="premium-button-primary flex-[2] uppercase">
                            {createMutation.isPending || updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={18} />} 
                            {editingSupplier ? 'Guardar Alterações' : 'Confirmar Admissão'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
