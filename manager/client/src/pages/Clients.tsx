import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Users, Edit, Trash2, Mail, Phone, LayoutGrid, List, Loader2, 
    Building, HeartHandshake, UserPlus, Star, Landmark, Fingerprint, 
    ShieldCheck, BadgeCheck, PlusCircle, ShieldAlert, MapPin, 
    BarChart3, ArrowUpRight, Search, UserCheck, Briefcase, Zap, Scale
} from 'lucide-react';
import { toast } from 'sonner';
import api, { lookupTaxpayer } from '../api';
import { usePermissions } from '../auth/useAuth';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { SearchableSelect } from '../components/SearchableSelect';

import { formatCurrency } from '../utils/format';
const fmt = (v: number) => formatCurrency(v);

interface Client {
    id: string;
    name: string;
    nif: string;
    email: string | null;
    phone: string | null;
    creditLimit: number;
    balance?: number;
    category?: string;
    riskClass?: string;
    address?: string;
    municipality?: string;
    province?: string;
    contactPerson?: string;
    contactPosition?: string;
}

export default function Clients() {
    const { hasPermission } = usePermissions();
    const qc = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [page, setPage] = useState(1);

    const [form, setForm] = useState({
        name: '',
        nif: '',
        email: '',
        phone: '',
        creditLimit: '',
        category: 'PRIVATE',
        riskClass: 'LOW',
        address: '',
        municipality: '',
        province: 'LUANDA',
        contactPerson: '',
        contactPosition: ''
    });

    const itemsPerPage = 10;

    const { data: clientsData, isLoading } = useQuery({
        queryKey: ['clients'],
        queryFn: async () => (await api.get('/clients')).data
    });

    const clients = (clientsData || []) as Client[];

    const filtered = clients.filter((c: Client) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.nif.includes(searchTerm)
    );

    const paginatedData = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/clients', data),
        onSuccess: () => { 
            qc.invalidateQueries({ queryKey: ['clients'] }); 
            toast.success('Cliente registado.'); 
            closeModal(); 
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, ...data }: any) => api.put(`/clients/${id}`, data),
        onSuccess: () => { 
            qc.invalidateQueries({ queryKey: ['clients'] }); 
            toast.success('Perfil actualizado.'); 
            closeModal(); 
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/clients/${id}`),
        onSuccess: () => { 
            qc.invalidateQueries({ queryKey: ['clients'] }); 
            toast.info('Cliente removido.'); 
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

    const openModal = (c?: any) => {
        if (c) {
            setEditingClient(c);
            setForm({
                name: c.name,
                nif: c.nif,
                email: c.email || '',
                phone: c.phone || '',
                creditLimit: c.creditLimit.toString(),
                category: c.category || 'PRIVATE',
                riskClass: c.riskClass || 'LOW',
                address: c.address || '',
                municipality: c.municipality || '',
                province: c.province || 'LUANDA',
                contactPerson: c.contactPerson || '',
                contactPosition: c.contactPosition || ''
            });
        } else {
            setEditingClient(null);
            setForm({ 
                name: '', nif: '', email: '', phone: '', creditLimit: '', 
                category: 'PRIVATE', riskClass: 'LOW', address: '', 
                municipality: '', province: 'LUANDA', contactPerson: '', contactPosition: '' 
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...form, creditLimit: Number(form.creditLimit) || 0 };
        if (editingClient) updateMutation.mutate({ id: editingClient.id, ...payload });
        else createMutation.mutate(payload);
    };

    const columns = [
        {
            header: 'Cliente',
            accessor: (c: Client) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center font-bold text-[var(--accent)]">
                        {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold leading-none mb-1">{c.name}</p>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50 uppercase tracking-tight">NIF: {c.nif}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Contactos',
            accessor: (c: Client) => (
                <div className="space-y-1">
                    {c.email && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)]">
                            <Mail size={12} className="text-indigo-400 opacity-40" /> {c.email}
                        </div>
                    )}
                    {c.phone && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)]">
                            <Phone size={12} className="text-emerald-400 opacity-40" /> {c.phone}
                        </div>
                    )}
                </div>
            )
        },
        { 
            header: 'Limite de Crédito', 
            accessor: (c: Client) => <span className="text-xs font-bold tabular-nums text-[var(--text-primary)]">{fmt(c.creditLimit)}</span> 
        },
        {
            header: '',
            accessor: (c: Client) => (
                <div className="flex items-center justify-end gap-2">
                    {hasPermission('clients:update') && (
                        <button onClick={(e) => { e.stopPropagation(); openModal(c); }} className="p-2 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--accent)] border border-[var(--border-color)] transition-all">
                            <Edit size={14} />
                        </button>
                    )}
                    {hasPermission('clients:delete') && (
                        <button onClick={(e) => { e.stopPropagation(); if (confirm('Remover?')) deleteMutation.mutate(c.id); }} className="p-2 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-rose-600 border border-[var(--border-color)] transition-all">
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            ),
            className: "text-right"
        }
    ];

    if (isLoading) return (
        <div className="flex items-center justify-center gap-3 py-32 text-[var(--text-muted)]">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">A carregar clientes...</span>
        </div>
    );

    return (
        <div className="space-y-6 pb-8">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">
                        Gestão de Clientes
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">
                        Administração de carteira e relacionamento institucional
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-0.5 mr-2">
                        <button 
                            onClick={() => setViewMode('grid')} 
                            className={`p-1.5 rounded-[var(--radius-sm)] transition-colors ${viewMode === 'grid' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                        >
                            <LayoutGrid size={15} />
                        </button>
                        <button 
                            onClick={() => setViewMode('table')} 
                            className={`p-1.5 rounded-[var(--radius-sm)] transition-colors ${viewMode === 'table' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                        >
                            <List size={15} />
                        </button>
                    </div>
                    {hasPermission('clients:create') && (
                        <button onClick={() => openModal()} className="premium-button-primary">
                            <UserPlus size={15} />
                            <span>Novo cliente</span>
                        </button>
                    )}
                </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Clientes', value: clients.length.toString(), icon: <Users size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Total Créditos', value: fmt(clients.reduce((s: number, c: any) => s + (c.creditLimit || 0), 0)), icon: <Landmark size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                    { label: 'Setor Público', value: clients.filter((c: any) => c.category === 'GOVERNMENT').length.toString(), icon: <Building size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                    { label: 'Volume Faturado', value: 'AOA 142.5M', icon: <BarChart3 size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' }
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {paginatedData.map(client => (
                        <div 
                            key={client.id} 
                            className="premium-card p-5 group cursor-pointer hover:border-[var(--accent)] transition-all flex flex-col gap-4 active:scale-[0.98]" 
                            onClick={() => openModal(client)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="w-9 h-9 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--accent)] rounded-lg flex items-center justify-center font-bold text-sm">
                                    {client.name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className={`badge ${
                                    client.category === 'GOVERNMENT'
                                        ? 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400'
                                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                }`}>
                                    {client.category === 'GOVERNMENT' ? 'Público' : 'Privado'}
                                </span>
                            </div>
                            
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-[var(--text-primary)] line-clamp-1">{client.name}</h3>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">NIF: {client.nif}</p>
                            </div>
                            
                            <div className="pt-4 border-t border-[var(--border-color)] space-y-2 mt-auto">
                                {client.email && (
                                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                        <Mail size={12} className="opacity-40" />
                                        <span className="truncate">{client.email}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Limite</p>
                                        <p className="text-sm font-bold text-[var(--text-primary)] tabular-nums">{fmt(client.creditLimit)}</p>
                                    </div>
                                    <div className="p-2 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Edit size={14} />
                                    </div>
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

            {/* Modal: Perfil do Cliente */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingClient ? 'Perfil do Cliente' : 'Novo Cliente'}
                subtitle="Gestão de dados institucionais e financeiros."
                type="CENTER"
                width="xl"
                icon={<Fingerprint size={24} className="text-[var(--accent)]" />}
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
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Nome do Cliente</label>
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
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Tipo de Cliente</label>
                                <SearchableSelect 
                                    options={[
                                        { label: 'ENTIDADE PRIVADA', value: 'PRIVATE' },
                                        { label: 'EMPRESA PÚBLICA / ESTADO', value: 'GOVERNMENT' },
                                        { label: 'ASSOCIAÇÃO / ONG', value: 'NGO' }
                                    ]}
                                    value={form.category}
                                    onChange={val => setForm(p => ({ ...p, category: val }))}
                                />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Limite Crédito (AOA)</label>
                            <div className="relative">
                                <Scale size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent)] opacity-40" />
                                <input 
                                    type="number" 
                                    value={form.creditLimit} 
                                    onChange={e => setForm(p => ({ ...p, creditLimit: e.target.value }))} 
                                    className="premium-input !py-4 !pl-10 font-bold tabular-nums" 
                                    placeholder="0" 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Nível de Risco</label>
                                <SearchableSelect 
                                    options={[
                                        { label: 'RISCO BAIXO (A+)', value: 'LOW' },
                                        { label: 'RISCO MODERADO (B)', value: 'MEDIUM' },
                                        { label: 'RISCO ELEVADO (C)', value: 'HIGH' }
                                    ]}
                                    value={form.riskClass}
                                    onChange={val => setForm(p => ({ ...p, riskClass: val }))}
                                    className={form.riskClass === 'HIGH' ? '[&_button]:text-rose-500' : '[&_button]:text-emerald-500'}
                                />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-y border-[var(--border-color)]/30 py-6">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-[var(--accent)] uppercase px-1 flex items-center gap-2">
                                <MapPin size={14} /> Localização
                            </h4>
                            <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value.toUpperCase() }))} className="premium-input !py-4 text-xs font-bold uppercase" placeholder="MORADA..." />
                            <div className="grid grid-cols-2 gap-4">
                                <input value={form.municipality} onChange={e => setForm(p => ({ ...p, municipality: e.target.value.toUpperCase() }))} className="premium-input !py-4 text-xs font-bold uppercase" placeholder="MUNICÍPIO" />
                                <SearchableSelect 
                                    options={['LUANDA', 'BENGUELA', 'CABINDA', 'HUAMBO', 'HUÍLA', 'NAMIBE'].map(p => ({ label: p, value: p }))}
                                    value={form.province}
                                    onChange={val => setForm(p => ({ ...p, province: val }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-[var(--accent)] uppercase px-1 flex items-center gap-2">
                                <Briefcase size={14} /> Contacto Principal
                            </h4>
                            <input value={form.contactPerson} onChange={e => setForm(p => ({ ...p, contactPerson: e.target.value.toUpperCase() }))} className="premium-input !py-4 text-xs font-bold uppercase" placeholder="NOME DO RESPONSÁVEL..." />
                            <div className="grid grid-cols-2 gap-4">
                                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="premium-input !py-4 text-xs font-bold" placeholder="TELEFONE" />
                                <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="premium-input !py-4 text-xs font-bold" placeholder="EMAIL" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={closeModal} className="premium-button-secondary flex-1 uppercase">Cancelar</button>
                        <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="premium-button-primary flex-[2] uppercase">
                            {createMutation.isPending || updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={18} />} 
                            {editingClient ? 'Guardar Alterações' : 'Confirmar Registo'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
