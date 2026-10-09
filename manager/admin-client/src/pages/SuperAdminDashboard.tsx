import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Building2, CreditCard, Activity, Shield, ChevronRight, ChevronLeft, TrendingUp, 
    Loader2, Plus, Download, Search, Trash2, Users, Settings, Lock, 
    Unlock, Mail, Globe, Crown, X, BadgeCheck, CheckCircle2, AlertCircle, 
    Calendar, Phone, MapPin, Hash, UserPlus, FileText, PieChart, UploadCloud
} from 'lucide-react';
import api, { lookupTaxpayer } from '../api';
import { authStore } from '../auth/authStore';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/format';
import { Modal } from '../components/Modal';

const fmt = (v: number) => formatCurrency(v);

const SuperAdminDashboard = () => {
    const queryClient = useQueryClient();
    const isSuperAdmin = authStore.getUser()?.role === 'SUPER_ADMIN';
    // View & Pagination
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [page, setPage] = useState(1);
    const [usersPage, setUsersPage] = useState(1);
    const itemsPerPage = 8;
    
    // New Company Form
    const [newCompany, setNewCompany] = useState({
        name: '', nif: '', email: '', phone: '', address: '', plan: 'BASIC_DAILY', enabledModules: ['dashboard', 'invoices'], expiresAt: ''
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'entities' | 'users' | 'subscriptions' | 'support' | 'maintenance'>('entities');
    const [showCreateCompanyModal, setShowCreateCompanyModal] = useState(false);
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '12345678', role: 'USER', companyId: '' });
    const [showModuleModal, setShowModuleModal] = useState(false);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<any>(null);
    const [tempModules, setTempModules] = useState<string[]>([]);
    const [confirmDelete, setConfirmDelete] = useState<{ id: string, name: string } | null>(null);
    const [systemSettings, setSystemSettings] = useState<any>({});
    const [partnerForm, setPartnerForm] = useState({ name: '', websiteUrl: '', order: 0 });
    const [isSearchingNif, setIsSearchingNif] = useState(false);

    const handleNifLookup = async (nifValue: string) => {
        if (!nifValue || nifValue.length < 9) return;
        setIsSearchingNif(true);
        try {
            const { data } = await lookupTaxpayer(nifValue);
            if (data) {
                const companyName = data.companyName || data.name || data.gsmc || '';
                const email = (data.email || '').toLowerCase();
                const phone = data.lxfs || data.telefone || '';
                const address = data.nsrdz || data.addressDbb || '';
                
                let finalName = companyName;
                const ownerNif = data.nsrfrdb || data.nsrcwfzr;
                if (ownerNif) {
                    try {
                        const { data: ownerData } = await lookupTaxpayer(ownerNif);
                        if (ownerData) {
                            finalName = ownerData.companyName || ownerData.name || ownerData.gsmc || '';
                        }
                    } catch {}
                }

                setNewCompany(prev => ({
                    ...prev,
                    name: finalName || prev.name,
                    email: email || prev.email,
                    phone: phone || prev.phone,
                    address: address || prev.address
                }));
                toast.success('Dados carregados com sucesso da AGT.');
            }
        } catch (error) {
            toast.error('Não foi possível carregar os dados deste NIF.');
        } finally {
            setIsSearchingNif(false);
        }
    };

    // Queries
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['superadmin-stats'],
        queryFn: async () => (await api.get('/admin/stats')).data,
        enabled: isSuperAdmin
    });

    const { data: subRequests, isLoading: subsLoading } = useQuery({
        queryKey: ['superadmin-subs'],
        queryFn: async () => (await api.get('/sub/requests')).data,
        enabled: isSuperAdmin && activeTab === 'subscriptions'
    });

    const { data: tickets, isLoading: ticketsLoading } = useQuery({
        queryKey: ['superadmin-tickets'],
        queryFn: async () => (await api.get('/admin/tickets')).data,
        enabled: isSuperAdmin && activeTab === 'support'
    });

    const { data: contacts, isLoading: contactsLoading } = useQuery({
        queryKey: ['superadmin-contacts'],
        queryFn: async () => (await api.get('/admin/contacts')).data,
        enabled: isSuperAdmin && activeTab === 'support'
    });

    const { data: subscribers, isLoading: newsLoading } = useQuery({
        queryKey: ['superadmin-news'],
        queryFn: async () => (await api.get('/admin/subscribers')).data,
        enabled: isSuperAdmin && activeTab === 'support'
    });


    const { data: companies, isLoading: companiesLoading } = useQuery({
        queryKey: ['superadmin-companies'],
        queryFn: async () => (await api.get('/admin/companies')).data,
        enabled: isSuperAdmin && activeTab === 'entities'
    });

    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['superadmin-users'],
        queryFn: async () => (await api.get('/admin/users')).data,
        enabled: isSuperAdmin && activeTab === 'users'
    });

    const { data: settings, isLoading: settingsLoading } = useQuery({
        queryKey: ['superadmin-settings'],
        queryFn: async () => {
            const res = await api.get('/admin/settings');
            const map = res.data.reduce((acc: any, curr: any) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {});
            setSystemSettings(map);
            return res.data;
        },
        enabled: isSuperAdmin && activeTab === 'maintenance'
    });

    const { data: partners, isLoading: partnersLoading } = useQuery({
        queryKey: ['superadmin-partners'],
        queryFn: async () => (await api.get('/trusted-partners')).data,
        enabled: isSuperAdmin && activeTab === 'maintenance'
    });

    const { data: backups = [], isLoading: backupsLoading, refetch: refetchBackups } = useQuery({
        queryKey: ['superadmin-backups'],
        queryFn: async () => (await api.get('/admin/backups')).data,
        enabled: isSuperAdmin && activeTab === 'maintenance'
    });


    // Mutations
    const createMutation = useMutation({
        mutationFn: async (data: any) => api.post('/admin/companies', data),
        onSuccess: () => {
            toast.success('Empresa provisionada com sucesso');
            setShowCreateCompanyModal(false);
            queryClient.invalidateQueries({ queryKey: ['superadmin-companies'] });
            queryClient.invalidateQueries({ queryKey: ['superadmin-stats'] });
        },
        onError: () => toast.error('Falha ao provisionar empresa')
    });

    const createUserMutation = useMutation({
        mutationFn: async (data: any) => api.post('/admin/users', data),
        onSuccess: () => {
            toast.success('Utilizador criado com sucesso');
            setShowCreateUserModal(false);
            setNewUser({ name: '', email: '', password: '', role: 'USER', companyId: '' });
            queryClient.invalidateQueries({ queryKey: ['superadmin-users'] });
        },
        onError: (err: any) => toast.error(err.response?.data?.error || 'Falha ao criar utilizador')
    });

    const toggleStatusMutation = useMutation({
        mutationFn: async (id: string) => api.post(`/admin/companies/${id}/toggle-status`),
        onSuccess: () => {
            toast.success('Estado atualizado');
            queryClient.invalidateQueries({ queryKey: ['superadmin-companies'] });
        }
    });

    const deleteCompanyMutation = useMutation({
        mutationFn: async (id: string) => api.delete(`/admin/companies/${id}`),
        onSuccess: () => {
            toast.success('Entidade removida do ecossistema');
            setConfirmDelete(null);
            queryClient.invalidateQueries({ queryKey: ['superadmin-companies'] });
        }
    });

    const extendExpirationMutation = useMutation({
        mutationFn: async ({ id, expiresAt }: { id: string, expiresAt: string }) => api.post(`/admin/companies/${id}/extend`, { expiresAt }),
        onSuccess: () => {
            toast.success('Expiração atualizada');
            queryClient.invalidateQueries({ queryKey: ['superadmin-companies'] });
            setShowAnalysisModal(false);
        }
    });

    const createBackupMutation = useMutation({
        mutationFn: async () => (await api.post('/admin/backups')).data,
        onSuccess: () => {
            toast.success('Backup gerado com sucesso.');
            refetchBackups();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Erro ao gerar backup.');
        }
    });

    const restoreBackupMutation = useMutation({
        mutationFn: async (filename: string) => (await api.post(`/admin/backups/${filename}/restore`)).data,
        onSuccess: () => {
            toast.success('Backup restaurado com sucesso.');
            refetchBackups();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Erro ao restaurar backup.');
        }
    });

    const deleteBackupMutation = useMutation({
        mutationFn: async (filename: string) => (await api.delete(`/admin/backups/${filename}`)).data,
        onSuccess: () => {
            toast.success('Backup eliminado.');
            refetchBackups();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Erro ao eliminar backup.');
        }
    });

    const approveSubMutation = useMutation({
        mutationFn: async (id: string) => api.post(`/sub/requests/${id}/approve`),
        onSuccess: () => {
            toast.success('Subscrição aprovada');
            queryClient.invalidateQueries({ queryKey: ['superadmin-subs'] });
            queryClient.invalidateQueries({ queryKey: ['superadmin-stats'] });
        },
        onError: () => toast.error('Falha ao aprovar subscrição')
    });

    const rejectSubMutation = useMutation({
        mutationFn: async ({ id, note }: { id: string, note: string }) => api.post(`/sub/requests/${id}/reject`, { adminNote: note }),
        onSuccess: () => {
            toast.success('Subscrição rejeitada');
            queryClient.invalidateQueries({ queryKey: ['superadmin-subs'] });
        }
    });


    const updateSettingMutation = useMutation({
        mutationFn: async (payload: { key: string, value: string }) => api.post('/admin/settings', payload),
        onSuccess: () => {
            toast.success('Configuração do sistema atualizada');
            queryClient.invalidateQueries({ queryKey: ['superadmin-settings'] });
        },
        onError: () => toast.error('Falha ao atualizar configuração')
    });

    const uploadAssetMutation = useMutation({
        mutationFn: async ({ key, file }: { key: string, file: File }) => {
            const formData = new FormData();
            formData.append('key', key);
            formData.append('asset', file);
            return api.post('/admin/settings/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        onSuccess: () => {
            toast.success('Imagem carregada e atualizada');
            queryClient.invalidateQueries({ queryKey: ['superadmin-settings'] });
        },
        onError: () => toast.error('Erro no upload da imagem')
    });

    const createPartnerMutation = useMutation({
        mutationFn: async (data: any) => api.post('/trusted-partners', data),
        onSuccess: () => { toast.success('Parceiro adicionado'); queryClient.invalidateQueries({queryKey: ['superadmin-partners']}); setPartnerForm({name:'', websiteUrl:'', order:0}); }
    });
    const updatePartnerMutation = useMutation({
        mutationFn: async ({ id, data }: any) => api.patch(`/trusted-partners/${id}`, data),
        onSuccess: () => { toast.success('Parceiro atualizado'); queryClient.invalidateQueries({queryKey: ['superadmin-partners']}); }
    });
    const deletePartnerMutation = useMutation({
        mutationFn: async (id: string) => api.delete(`/trusted-partners/${id}`),
        onSuccess: () => { toast.success('Parceiro removido'); queryClient.invalidateQueries({queryKey: ['superadmin-partners']}); }
    });
    const uploadPartnerLogoMutation = useMutation({
        mutationFn: async ({ id, file }: { id: string, file: File }) => {
            const formData = new FormData();
            formData.append('key', `partner_${id}`);
            formData.append('asset', file);
            return api.post(`/trusted-partners/${id}/upload`, formData);
        },
        onSuccess: () => {
            toast.success('Logotipo atualizado');
            queryClient.invalidateQueries({ queryKey: ['superadmin-partners'] });
        }
    });



    // Handlers
    const openModuleModal = (company: any) => {
        setSelectedCompany(company);
        setTempModules(company.enabledModules || []);
        setShowModuleModal(true);
    };

    const openAnalysisModal = (company: any) => {
        setSelectedCompany(company);
        setShowAnalysisModal(true);
    };

    const updateModules = async () => {
        if (!selectedCompany) return;
        try {
            await api.patch(`/admin/companies/${selectedCompany.id}/modules`, { enabledModules: tempModules });
            toast.success('Módulos reconfigurados');
            setShowModuleModal(false);
            queryClient.invalidateQueries({ queryKey: ['superadmin-companies'] });
        } catch (error) {
            toast.error('Erro na reconfiguração');
        }
    };

    if (!isSuperAdmin) {
        return (
            <div className="py-40 flex flex-col items-center justify-center gap-6 text-rose-500 animate-fade-in">
                <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 border border-rose-100">
                    <Shield size={40} />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-600 italic">Acesso Restrito</h2>
                    <p className="text-sm font-medium opacity-60">Apenas administradores com permissões de Super Admin podem aceder a esta área.</p>
                </div>
            </div>
        );
    }

    const { stats = {} } = statsData || {};
    const filteredCompanies = companies?.filter((c: any) => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.nif.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
    const paginatedCompanies = filteredCompanies.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const filteredUsers = users?.filter((u: any) => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const userTotalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice((usersPage - 1) * itemsPerPage, usersPage * itemsPerPage);

    const kpis = [
        { title: 'Empresas', value: stats.totalCompanies || 0, icon: <Building2 />, color: 'text-sky-600', bg: 'bg-sky-50' },
        { title: 'Subscrições Ativas', value: stats.activeSubscriptions || 0, icon: <Crown />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { title: 'Transações', value: stats.totalInvoices || 0, icon: <Activity />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { title: 'Faturação Total', value: fmt(stats.totalRevenue || 0), icon: <CreditCard />, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    const [deleteType, setDeleteType] = useState<'company' | 'user' | null>(null);

    const deleteUserMutation = useMutation({
        mutationFn: async (id: string) => api.delete(`/admin/users/${id}`),
        onSuccess: () => {
            toast.success('Utilizador removido do ecossistema');
            setConfirmDelete(null);
            setDeleteType(null);
            queryClient.invalidateQueries({ queryKey: ['superadmin-users'] });
        }
    });

    const handleDeleteConfirm = () => {
        if (!confirmDelete) return;
        if (deleteType === 'company') {
            deleteCompanyMutation.mutate(confirmDelete.id);
        } else if (deleteType === 'user') {
            deleteUserMutation.mutate(confirmDelete.id);
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            <ConfirmDialog 
                isOpen={!!confirmDelete} 
                onClose={() => { setConfirmDelete(null); setDeleteType(null); }} 
                onConfirm={handleDeleteConfirm}
                title={deleteType === 'company' ? "Remover Entidade" : "Remover Utilizador"}
                message={deleteType === 'company' 
                    ? `Tem a certeza que deseja remover permanentemente a empresa ${confirmDelete?.name}? Esta ação é irreversível e comprometerá todos os dados nó.`
                    : `Tem a certeza que deseja remover o utilizador ${confirmDelete?.name}? O acesso será revogado imediatamente.`
                }
                isLoading={deleteCompanyMutation.isPending || deleteUserMutation.isPending}
            />

            {/* Dynamic Header */}
            <div className="relative p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-transparent opacity-50" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-white">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-[var(--text-primary)]">Painel de Administração</h1>
                            <p className="text-sm text-[var(--text-muted)] mt-0.5">Gestão central do ecossistema e infraestrutura.</p>
                        </div>
                    </div>
                    
                    <div className="flex bg-[var(--bg-primary)] p-1 rounded-[var(--radius-md)] border border-[var(--border-color)] gap-2">
                        <button className="flex items-center gap-2 px-4 py-1.5 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all uppercase tracking-wider">
                            <Download size={14} /> Auditoria
                        </button>
                        <button 
                            onClick={() => setShowCreateCompanyModal(true)}
                            className="premium-button-primary"
                        >
                            <Plus size={14} /> Registar Empresa
                        </button>
                    </div>
                </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className="premium-card p-4 flex items-start gap-3">
                        <div className={`kpi-icon shrink-0 ${kpi.color} ${kpi.bg}`}>
                            {kpi.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-[var(--text-muted)] mb-0.5 truncate">{kpi.title}</p>
                            <p className="text-base font-bold text-[var(--text-primary)] tabular-nums leading-tight">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-1 bg-[var(--bg-secondary)] p-1 rounded-[var(--radius-md)] border border-[var(--border-color)]">
                    {[
                        { id: 'entities', label: 'Empresas', icon: <Building2 size={14} /> },
                        { id: 'users', label: 'Utilizadores', icon: <Users size={14} /> },
                        { id: 'subscriptions', label: 'Subscrições', icon: <CreditCard size={14} /> },
                        { id: 'support', label: 'Suporte', icon: <Shield size={14} /> },
                        { id: 'maintenance', label: 'Infraestrutura', icon: <Activity size={14} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id as any); setPage(1); setUsersPage(1); }}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === tab.id ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                        >
                            {tab.icon} <span className="hidden md:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {activeTab !== 'maintenance' && (
                    <div className="flex bg-[var(--bg-secondary)] p-1 rounded-[var(--radius-md)] border border-[var(--border-color)] gap-1">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-[var(--radius-sm)] transition-all ${viewMode === 'grid' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
                            <PieChart size={15} />
                        </button>
                        <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-[var(--radius-sm)] transition-all ${viewMode === 'table' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
                            <FileText size={15} />
                        </button>
                    </div>
                )}
                {activeTab === 'users' && (
                    <button 
                        onClick={() => setShowCreateUserModal(true)}
                        className="premium-button-primary shrink-0"
                    >
                        <UserPlus size={14} /> Novo Utilizador
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                {/* Search Bar */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-[var(--radius-md)] flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input 
                        type="text"
                        placeholder="Pesquisar..."
                        className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); setUsersPage(1); }}
                    />
                </div>
            </div>

                {activeTab === 'entities' && (
                    <div className="space-y-6">
                        {companiesLoading ? (
                            <div className="py-20 flex flex-col items-center gap-4 opacity-40">
                                <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
                                <span className="text-xs font-bold">A carregar dados...</span>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-500">
                                {paginatedCompanies.map((c: any) => (
                                    <EntityCard 
                                        key={c.id} 
                                        company={c} 
                                        onToggleStatus={() => toggleStatusMutation.mutate(c.id)}
                                        onConfigModules={() => openModuleModal(c)}
                                        onDelete={() => { setConfirmDelete({ id: c.id, name: c.name }); setDeleteType('company'); }}
                                        onAnalysis={() => openAnalysisModal(c)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="premium-card !p-0 overflow-hidden animate-fade-in">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-primary)]/50 text-[10px] font-bold text-[var(--text-secondary)] opacity-60">
                                                <th className="px-8 py-6">Entidade</th>
                                                <th className="px-8 py-6">Identificador</th>
                                                <th className="px-8 py-6">Estado</th>
                                                <th className="px-8 py-6 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-color)]/10">
                                            {paginatedCompanies.map((c: any) => (
                                                <tr key={c.id} className="group hover:bg-[var(--accent)]/[0.02] transition-colors">
                                                    <td className="px-8 py-6 font-bold">{c.name}</td>
                                                    <td className="px-8 py-6 font-mono text-[10px] opacity-60">{c.nif}</td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${c.status === 'ACTIVE' ? 'text-emerald-500' : 'text-rose-500'}`}>{c.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}</span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                       <div className="flex justify-end gap-2">
                                                            <button onClick={() => openModuleModal(c)} className="p-2 hover:text-[var(--accent)]"><Settings size={14} /></button>
                                                            <button onClick={() => { setConfirmDelete({ id: c.id, name: c.name }); setDeleteType('company'); }} className="p-2 hover:text-rose-500"><Trash2 size={14} /></button>
                                                       </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {totalPages > 1 && <Pagination page={page} total={totalPages} onChange={setPage} />}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <div className="premium-card !p-0 overflow-hidden animate-fade-in">
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-[var(--border-color)] bg-[var(--bg-primary)]/50 text-[10px] font-bold text-[var(--text-secondary)] opacity-60">
                                            <th className="px-8 py-6">Utilizador</th>
                                            <th className="px-8 py-6">Privilégio</th>
                                            <th className="px-8 py-6">Empresa Associada</th>
                                            <th className="px-8 py-6 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-color)]/10 font-bold">
                                        {usersLoading ? (
                                            <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin text-[var(--accent)] inline" /></td></tr>
                                        ) : paginatedUsers.map((u: any) => (
                                            <tr key={u.id} className="group hover:bg-[var(--accent)]/[0.02] transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 group-hover:scale-110 transition-transform">
                                                            {u.name.substring(0, 1).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-[var(--text-primary)]">{u.name}</p>
                                                            <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-40">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[10px] font-bold text-[var(--accent)] max-w-fit">
                                                        <Shield size={12} />
                                                        {u.role}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-sky-600 opacity-80">
                                                        <Building2 size={12} /> {u.company?.name || 'Administração Central'}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button 
                                                        onClick={() => { setConfirmDelete({ id: u.id, name: u.name }); setDeleteType('user'); }}
                                                        className="p-3 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {userTotalPages > 1 && <Pagination page={usersPage} total={userTotalPages} onChange={setUsersPage} />}
                    </div>
                )}

                {activeTab === 'subscriptions' && (
                    <div className="space-y-6">
                        <div className="premium-card !p-0 overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500">
                             <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-[var(--border-color)]/20 bg-[var(--bg-primary)]/50 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60">
                                            <th className="px-8 py-6">Empresa</th>
                                            <th className="px-8 py-6">Plano / Ciclo</th>
                                            <th className="px-8 py-6">Estado</th>
                                            <th className="px-8 py-6">Comprovativo</th>
                                            <th className="px-8 py-6 text-right">Acção</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-color)]/10 font-bold">
                                        {subsLoading ? (
                                            <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin text-[var(--accent)] inline" /></td></tr>
                                        ) : subRequests?.map((s: any) => (
                                            <tr key={s.id} className="group hover:bg-[var(--accent)]/[0.02] transition-colors">
                                                <td className="px-8 py-6">
                                                    <p className="text-sm font-bold text-[var(--text-primary)]">{s.company?.name}</p>
                                                    <p className="text-[10px] font-medium opacity-50">{s.company?.nif}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-[var(--accent)]">{s.plan?.name}</span>
                                                        <span className="text-[8px] px-2 py-0.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full">{s.billing}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${s.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : s.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                        {s.status === 'PENDING' ? 'Pendente' : s.status === 'APPROVED' ? 'Aprovado' : 'Rejeitado'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {s.proofUrl ? (
                                                        <a href={s.proofUrl} target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline flex items-center gap-1 text-[10px] font-bold">
                                                            <Download size={12} /> Ver Ficheiro
                                                        </a>
                                                    ) : <span className="opacity-30 text-[10px]">Sem anexo</span>}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    {s.status === 'PENDING' && (
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => approveSubMutation.mutate(s.id)}
                                                                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                                                            >
                                                                <CheckCircle2 size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    const note = prompt('Razão da rejeição?');
                                                                    if (note) rejectSubMutation.mutate({ id: s.id, note });
                                                                }}
                                                                className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'support' && (
                    <div className="space-y-12">
                        {/* Tickets Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <Shield size={16} className="text-[var(--accent)]" /> Tickets de Suporte
                            </h3>
                            <div className="premium-card !p-0 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-primary)]/50 text-[10px] font-bold text-[var(--text-secondary)] opacity-60">
                                                <th className="px-8 py-6">Assunto</th>
                                                <th className="px-8 py-6">Entidade</th>
                                                <th className="px-8 py-6">Prioridade</th>
                                                <th className="px-8 py-6">Estado</th>
                                                <th className="px-8 py-6 text-right">Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-color)]/10 font-bold">
                                            {ticketsLoading ? (
                                                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin text-[var(--accent)] inline" /></td></tr>
                                            ) : tickets?.map((t: any) => (
                                                <tr key={t.id} className="group hover:bg-[var(--accent)]/[0.02] transition-colors">
                                                    <td className="px-8 py-6">
                                                        <p className="text-sm font-black text-[var(--text-primary)]">{t.subject}</p>
                                                        <p className="text-[10px] font-medium opacity-50 uppercase">{t.category}</p>
                                                    </td>
                                                    <td className="px-8 py-6 text-[10px] font-black uppercase opacity-60">
                                                        {t.company?.name}
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`text-[10px] font-black ${t.priority === 'HIGH' ? 'text-rose-500' : t.priority === 'MEDIUM' ? 'text-amber-500' : 'text-sky-500'}`}>
                                                            {t.priority}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-[10px] font-black">
                                                            {t.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button className="text-[var(--accent)] hover:underline text-[10px] font-black uppercase">Responder</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Contact Messages */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <Mail size={16} className="text-indigo-400" /> Mensagens de Contacto (Site)
                            </h3>
                            <div className="premium-card !p-0 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-primary)]/50 text-[10px] font-bold text-[var(--text-secondary)] opacity-60">
                                                <th className="px-8 py-6">Remetente</th>
                                                <th className="px-8 py-6">Assunto</th>
                                                <th className="px-8 py-6">Mensagem</th>
                                                <th className="px-8 py-6">Data</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-color)]/10 font-bold">
                                            {contactsLoading ? (
                                                <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin text-[var(--accent)] inline" /></td></tr>
                                            ) : contacts?.map((c: any) => (
                                                <tr key={c.id} className="group hover:bg-[var(--accent)]/[0.02] transition-colors">
                                                    <td className="px-8 py-6">
                                                        <p className="text-sm font-bold text-[var(--text-primary)]">{c.name}</p>
                                                        <p className="text-[10px] font-medium opacity-50">{c.email}</p>
                                                    </td>
                                                    <td className="px-8 py-6 text-[10px] font-bold opacity-80">
                                                        {c.subject || 'Sem Assunto'}
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <p className="text-[11px] font-medium max-w-md line-clamp-2">{c.message}</p>
                                                    </td>
                                                    <td className="px-8 py-6 text-[10px] font-bold opacity-40">
                                                        {new Date(c.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Newsletter and Waitlist Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <Globe size={16} className="text-emerald-400" /> Waitlist & Newsletter
                            </h3>
                            <div className="premium-card p-6 flex flex-col gap-4">
                                {newsLoading ? (
                                    <Loader2 className="animate-spin text-[var(--accent)]" />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {subscribers?.map((s: any) => (
                                            <div key={s.id} className="p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl flex flex-col gap-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.type === 'WAITLIST' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                        {s.type || 'NEWSLETTER'}
                                                    </span>
                                                    <span className="text-[10px] font-bold opacity-30">{new Date(s.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <span className="text-sm font-bold text-[var(--text-primary)]">{s.name || 'Sem nome'}</span>
                                                <span className="text-xs font-medium text-[var(--text-secondary)]">{s.email}</span>
                                                {s.company && <span className="text-[10px] font-bold opacity-60 text-sky-400 flex items-center gap-1 mt-1"><Building2 size={10} /> {s.company}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}


                {activeTab === 'maintenance' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        {/* Infrastructure Cards */}
                        {[
                            { title: 'Base de Dados Principal', status: 'SÍNCRONA', color: 'text-emerald-500', icon: <Globe size={24} />, bg: 'bg-emerald-500/5', desc: 'Cluster global operando com 22ms de latência média.' },
                            { title: 'Certificação AGT', status: 'CERTIFICADO', color: 'text-sky-500', icon: <BadgeCheck size={24} />, bg: 'bg-sky-500/5', desc: 'Motores de assinatura ativos conforme Portaria 312/18.' },
                        ].map((item, i) => (
                            <div key={i} className="premium-card p-8 flex flex-col gap-6 group hover:border-[var(--accent)]/30">
                                <div className="flex items-center justify-between">
                                    <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        {item.icon}
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl text-[10px] font-bold border-2 ${item.color} border-current opacity-30`}>
                                        {item.status}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2">{item.title}</h4>
                                    <p className="text-xs font-medium text-[var(--text-secondary)] opacity-60 leading-relaxed">{item.desc}</p>
                                </div>
                                <div className="pt-4 border-t border-[var(--border-color)]/10 flex items-center gap-2 text-[var(--text-secondary)] opacity-10 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] font-bold">Ver Logs Detalhados</span>
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        ))}

                        {/* System Backups Section */}
                        <div className="md:col-span-2 space-y-6 mt-8">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-3">
                                <Download className="text-[var(--accent)]" /> Gestão de Backups e Recuperação
                            </h3>
                            <div className="premium-card p-8">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2">Backups Totais do Sistema</h4>
                                        <p className="text-xs font-medium text-[var(--text-secondary)] opacity-60 leading-relaxed max-w-xl">
                                            Execute uma cópia de segurança completa do ecossistema, abrangendo a base de dados central, ficheiros enviados pelas empresas e definições globais.
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button 
                                            disabled={createBackupMutation.isPending}
                                            onClick={() => {
                                                if (window.confirm('Tem a certeza que deseja gerar um novo backup completo agora?')) {
                                                    createBackupMutation.mutate();
                                                }
                                            }}
                                            className="px-6 py-3 bg-[var(--accent)] text-white text-[10px] font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] disabled:opacity-50"
                                        >
                                            {createBackupMutation.isPending ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Download size={14} />
                                            )}
                                            Gerar Novo Backup
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="mt-8 space-y-3">
                                    {backupsLoading && (
                                        <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                                            Carregando backups do sistema...
                                        </div>
                                    )}
                                    {!backupsLoading && backups.length === 0 && (
                                        <div className="p-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-color)] rounded-xl">
                                            Nenhum backup encontrado no servidor.
                                        </div>
                                    )}
                                    {!backupsLoading && backups.map((b: any, i: number) => {
                                        const formatSize = (bytes: number) => {
                                            if (bytes === 0) return '0 B';
                                            const k = 1024;
                                            const sizes = ['B', 'KB', 'MB', 'GB'];
                                            const idx = Math.floor(Math.log(bytes) / Math.log(k));
                                            return parseFloat((bytes / Math.pow(k, idx)).toFixed(2)) + ' ' + sizes[idx];
                                        };

                                        return (
                                            <div key={i} className="flex items-center justify-between p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl group hover:border-[var(--accent)]/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] text-[var(--accent)] flex items-center justify-center">
                                                        <FileText size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-[var(--text-primary)]">{b.filename}</p>
                                                        <div className="flex gap-3 text-[10px] font-bold text-[var(--text-secondary)] opacity-50">
                                                            <span>{new Date(b.createdAt).toLocaleString('pt-PT')}</span>
                                                            <span>•</span>
                                                            <span>{formatSize(b.size)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => {
                                                            const token = authStore.getToken();
                                                            const url = `${api.defaults.baseURL}/admin/backups/${b.filename}/download`;
                                                            window.open(url, '_blank');
                                                        }}
                                                        className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors" 
                                                        title="Descarregar Backup"
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                    <button 
                                                        disabled={restoreBackupMutation.isPending}
                                                        onClick={() => {
                                                            if (window.confirm(`ATENÇÃO: Restaurar o backup "${b.filename}" irá substituir a base de dados atual e a pasta de uploads por completo. Deseja prosseguir?`)) {
                                                                restoreBackupMutation.mutate(b.filename);
                                                            }
                                                        }}
                                                        className="p-2 text-amber-500 hover:text-amber-600 transition-colors disabled:opacity-50" 
                                                        title="Restaurar Backup"
                                                    >
                                                        {restoreBackupMutation.isPending ? (
                                                            <Loader2 size={18} className="animate-spin" />
                                                        ) : (
                                                            <UploadCloud size={18} />
                                                        )}
                                                    </button>
                                                    <button 
                                                        disabled={deleteBackupMutation.isPending}
                                                        onClick={() => {
                                                            if (window.confirm(`Tem a certeza que deseja eliminar permanentemente o backup "${b.filename}"?`)) {
                                                                deleteBackupMutation.mutate(b.filename);
                                                            }
                                                        }}
                                                        className="p-2 text-rose-500 hover:text-rose-600 transition-colors disabled:opacity-50" 
                                                        title="Eliminar Backup"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* System Settings Section */}
                        <div className="md:col-span-2 space-y-6">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mt-8 mb-4 flex items-center gap-3">
                                <Settings className="text-[var(--accent)]" /> Configurações Globais do Portal
                            </h3>
                            
                            <div className="premium-card p-8 space-y-8">
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-bold text-[var(--text-primary)]">Imagem de Banner (Landing Page)</h4>
                                                <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50 mt-1">URL da imagem de fundo da secção principal</p>
                                            </div>
                                            <button 
                                                onClick={() => updateSettingMutation.mutate({ key: 'HERO_IMAGE_URL', value: systemSettings.HERO_IMAGE_URL })}
                                                disabled={updateSettingMutation.isPending}
                                                className="px-6 py-2 bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold rounded-xl hover:bg-[var(--accent)] hover:text-white transition-all disabled:opacity-50"
                                            >
                                                Gravar URL
                                            </button>
                                            <label className="px-6 py-2 bg-[var(--accent)] text-white text-[10px] font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-2">
                                                {uploadAssetMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                                Carregar Ficheiro
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*" 
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) uploadAssetMutation.mutate({ key: 'HERO_IMAGE_URL', file });
                                                    }}
                                                />
                                            </label>
                                        </div>

                                        <div className="relative group">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)] opacity-40" size={16} />
                                            <input 
                                                className="premium-input !pl-12 !py-4 font-mono text-xs" 
                                                placeholder="https://exemplo.com/imagem.png"
                                                value={systemSettings.HERO_IMAGE_URL || ''}
                                                onChange={e => setSystemSettings({...systemSettings, HERO_IMAGE_URL: e.target.value})}
                                            />
                                        </div>
                                        {systemSettings.HERO_IMAGE_URL && (
                                            <div className="mt-4 aspect-video w-full max-w-md rounded-2xl overflow-hidden border border-[var(--border-color)]">
                                                <img src={systemSettings.HERO_IMAGE_URL} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-8 border-t border-[var(--border-color)] space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-bold text-[var(--text-primary)]">Título do Portal</h4>
                                                <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50 mt-1">Nome exibido nos motores de busca e separador</p>
                                            </div>
                                            <button 
                                                onClick={() => updateSettingMutation.mutate({ key: 'SITE_TITLE', value: systemSettings.SITE_TITLE })}
                                                disabled={updateSettingMutation.isPending}
                                                className="px-6 py-2 bg-[var(--accent)] text-white text-[10px] font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                Gravar
                                            </button>
                                        </div>
                                        <input 
                                            className="premium-input !py-4" 
                                            placeholder="VA ONEGEST - Inteligência Operacional"
                                            value={systemSettings.SITE_TITLE || ''}
                                            onChange={e => setSystemSettings({...systemSettings, SITE_TITLE: e.target.value})}
                                        />
                                    </div>

                                    {/* Waitlist and Registration Toggles */}
                                    <div className="pt-8 border-t border-[var(--border-color)] grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl">
                                            <div>
                                                <h4 className="text-sm font-bold text-[var(--text-primary)]">Ocultar Registo</h4>
                                                <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50 mt-1">Oculta botão "Teste Gratuito"</p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const newValue = systemSettings.HIDE_REGISTRATION === 'true' ? 'false' : 'true';
                                                    setSystemSettings({...systemSettings, HIDE_REGISTRATION: newValue});
                                                    updateSettingMutation.mutate({ key: 'HIDE_REGISTRATION', value: newValue });
                                                }}
                                                disabled={updateSettingMutation.isPending}
                                                className={`w-12 h-6 rounded-full transition-colors relative ${systemSettings.HIDE_REGISTRATION === 'true' ? 'bg-[var(--accent)]' : 'bg-[var(--border-color)]'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${systemSettings.HIDE_REGISTRATION === 'true' ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl">
                                            <div>
                                                <h4 className="text-sm font-bold text-[var(--text-primary)]">Modo Waitlist</h4>
                                                <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50 mt-1">Redireciona inscrições para Waitlist</p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const newValue = systemSettings.WAITLIST_ACTIVE === 'true' ? 'false' : 'true';
                                                    setSystemSettings({...systemSettings, WAITLIST_ACTIVE: newValue});
                                                    updateSettingMutation.mutate({ key: 'WAITLIST_ACTIVE', value: newValue });
                                                }}
                                                disabled={updateSettingMutation.isPending}
                                                className={`w-12 h-6 rounded-full transition-colors relative ${systemSettings.WAITLIST_ACTIVE === 'true' ? 'bg-[var(--accent)]' : 'bg-[var(--border-color)]'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${systemSettings.WAITLIST_ACTIVE === 'true' ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Trusted Partners Management */}
                                    <div className="pt-8 border-t border-[var(--border-color)] space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-bold text-[var(--text-primary)]">Empresas que Confiam (Landing Page)</h4>
                                                <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50 mt-1">Gerir os logótipos e parceiros na página principal</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                            <div className="md:col-span-1 space-y-1">
                                                <label className="text-[10px] font-bold text-[var(--text-muted)]">Nome</label>
                                                <input className="premium-input !py-3" placeholder="Nome" value={partnerForm.name} onChange={e => setPartnerForm({...partnerForm, name: e.target.value})} />
                                            </div>
                                            <div className="md:col-span-1 space-y-1">
                                                <label className="text-[10px] font-bold text-[var(--text-muted)]">Website</label>
                                                <input className="premium-input !py-3" placeholder="https://" value={partnerForm.websiteUrl} onChange={e => setPartnerForm({...partnerForm, websiteUrl: e.target.value})} />
                                            </div>
                                            <div className="md:col-span-1 space-y-1">
                                                <label className="text-[10px] font-bold text-[var(--text-muted)]">Ordem</label>
                                                <input type="number" className="premium-input !py-3" value={partnerForm.order} onChange={e => setPartnerForm({...partnerForm, order: Number(e.target.value)})} />
                                            </div>
                                            <div className="md:col-span-1">
                                                <button 
                                                    onClick={() => createPartnerMutation.mutate(partnerForm)}
                                                    disabled={!partnerForm.name || createPartnerMutation.isPending}
                                                    className="w-full py-3 bg-[var(--accent)] text-white text-[10px] font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                                                >
                                                    Adicionar
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2 mt-4">
                                            {partnersLoading ? <Loader2 size={16} className="animate-spin text-[var(--accent)]" /> : partners?.map((p: any) => (
                                                <div key={p.id} className="flex items-center justify-between p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl group hover:border-[var(--accent)]/30 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center overflow-hidden shrink-0">
                                                            {p.logoUrl ? <img src={p.logoUrl} alt={p.name} className="w-full h-full object-contain p-1" /> : <Globe size={20} className="opacity-20" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">{p.name}</p>
                                                            <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50 truncate">{p.websiteUrl || 'Sem website'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <label className="cursor-pointer p-2 rounded-lg hover:bg-[var(--accent)]/10 text-[var(--accent)] transition-colors" title="Fazer upload do logo">
                                                            <UploadCloud size={14} />
                                                            <input type="file" className="hidden" accept="image/*" onChange={e => {
                                                                if(e.target.files?.[0]) uploadPartnerLogoMutation.mutate({ id: p.id, file: e.target.files[0] })
                                                            }} />
                                                        </label>
                                                        <button onClick={() => {
                                                            const newName = prompt('Novo nome:', p.name);
                                                            if(newName && newName !== p.name) updatePartnerMutation.mutate({ id: p.id, data: { name: newName }});
                                                        }} className="p-2 rounded-lg hover:bg-amber-500/10 text-amber-500 transition-colors" title="Editar nome">
                                                            <Settings size={14} />
                                                        </button>
                                                        <button onClick={() => deletePartnerMutation.mutate(p.id)} className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors" title="Apagar parceiro">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                )}
            </div>

            {/* Create Company Modal */}
            <Modal isOpen={showCreateCompanyModal} onClose={() => setShowCreateCompanyModal(false)} title="Registar Nova Empresa">
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400">NIF (Número de Identificação Fiscal)</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)] opacity-40" size={16} />
                                <input 
                                    className="premium-input !pl-12 !pr-10" 
                                    placeholder="000.000.000.00"
                                    value={newCompany.nif}
                                    onChange={e => setNewCompany({...newCompany, nif: e.target.value})}
                                    onBlur={e => handleNifLookup(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleNifLookup(newCompany.nif)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--accent)] transition-colors"
                                    title="Pesquisar NIF"
                                    disabled={isSearchingNif}
                                >
                                    {isSearchingNif ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400">Nome da Empresa</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)] opacity-40" size={16} />
                                <input 
                                    className="premium-input !pl-12" 
                                    placeholder="Ex: Angola Tech Lda"
                                    value={newCompany.name}
                                    onChange={e => setNewCompany({...newCompany, name: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400">Email Corporativo</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)] opacity-40" size={16} />
                                <input 
                                    className="premium-input !pl-12" 
                                    placeholder="financeiro@empresa.ao"
                                    value={newCompany.email}
                                    onChange={e => setNewCompany({...newCompany, email: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400">Telemóvel</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)] opacity-40" size={16} />
                                <input 
                                    className="premium-input !pl-12" 
                                    placeholder="+244 9..."
                                    value={newCompany.phone}
                                    onChange={e => setNewCompany({...newCompany, phone: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400">Morada</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)] opacity-40" size={16} />
                            <input 
                                className="premium-input !pl-12" 
                                placeholder="Morada completa"
                                value={newCompany.address}
                                onChange={e => setNewCompany({...newCompany, address: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400">Plano de Subscrição</label>
                            <select 
                                className="premium-input"
                                value={newCompany.plan}
                                onChange={e => {
                                    const val = e.target.value;
                                    let newModules = ['dashboard', 'invoices'];
                                    if(val === 'SAAS_CLIENT') newModules = ['dashboard', 'calendar', 'hr', 'payroll', 'accounting', 'accounting-portal', 'budget', 'crm', 'tickets', 'support', 'training', 'approvals'];
                                    setNewCompany({...newCompany, plan: val, enabledModules: newModules});
                                }}
                            >
                                <option value="BASIC_DAILY">Básico Diário</option>
                                <option value="STARTER">Starter</option>
                                <option value="PROFESSIONAL">Professional</option>
                                <option value="ENTERPRISE">Enterprise</option>
                                <option value="SAAS_CLIENT">Cliente SaaS (Restrito)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400">Data de Expiração (Opcional)</label>
                            <input 
                                type="date"
                                className="premium-input" 
                                value={newCompany.expiresAt}
                                onChange={e => setNewCompany({...newCompany, expiresAt: e.target.value})}
                            />
                        </div>

                        <div className="col-span-2 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <label className="text-[10px] font-bold text-slate-400 mb-2 block">Módulos de Acesso</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { key: 'accounting', label: 'Contabilidade' },
                                    { key: 'accounting-portal', label: 'Portal Contabilístico' },
                                    { key: 'crm', label: 'CRM Comercial' },
                                    { key: 'hr', label: 'Recursos Humanos' },
                                    { key: 'payroll', label: 'Processamento Salarial' },
                                    { key: 'fleet', label: 'Gestão de Frotas' },
                                ].map(mod => (
                                    <button
                                        key={mod.key}
                                        type="button"
                                        onClick={() => {
                                            const enabled = newCompany.enabledModules.includes(mod.key);
                                            setNewCompany({
                                                ...newCompany,
                                                enabledModules: enabled 
                                                    ? newCompany.enabledModules.filter(m => m !== mod.key)
                                                    : [...newCompany.enabledModules, mod.key]
                                            });
                                        }}
                                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all flex items-center gap-1.5 ${newCompany.enabledModules.includes(mod.key) ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]' : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-slate-500'}`}
                                    >
                                        <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${newCompany.enabledModules.includes(mod.key) ? 'border-[var(--accent)]' : 'border-slate-400'}`}>
                                            {newCompany.enabledModules.includes(mod.key) && <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />}
                                        </div>
                                        {mod.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="col-span-2 flex items-end pt-2">
                             <button 
                                onClick={() => createMutation.mutate(newCompany)}
                                disabled={createMutation.isPending}
                                className="w-full py-4 bg-[var(--accent)] text-white rounded-2xl text-[10px] font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={16} />}
                                Confirmar Registo
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Analysis Modal */}
            <Modal isOpen={showAnalysisModal} onClose={() => setShowAnalysisModal(false)} title="Detalhes da Empresa">
                <div className="p-8 space-y-8">
                    <div className="flex items-center gap-6 p-6 bg-[var(--bg-primary)] rounded-3xl border border-[var(--border-color)]">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center text-2xl font-bold">
                            {selectedCompany?.name?.[0]}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[var(--text-primary)]">{selectedCompany?.name}</h3>
                            <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-40">{selectedCompany?.nif}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Utilizadores', value: selectedCompany?._count?.users || 0, icon: <Users size={16} />, color: 'text-sky-500' },
                            { label: 'Estado', value: selectedCompany?.status === 'ACTIVE' ? 'Ativo' : 'Inativo', icon: <Activity size={16} />, color: selectedCompany?.status === 'ACTIVE' ? 'text-emerald-500' : 'text-rose-500' },
                            { label: 'Subscrição', value: selectedCompany?.plan || 'N/A', icon: <Crown size={16} />, color: 'text-amber-500' },
                        ].map((stat, i) => (
                            <div key={i} className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-center space-y-1">
                                <div className={`flex justify-center ${stat.color} mb-1`}>{stat.icon}</div>
                                <p className="text-[8px] font-bold text-[var(--text-secondary)] opacity-40">{stat.label}</p>
                                <p className="text-sm font-bold text-[var(--text-primary)]">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                         <h4 className="text-[10px] font-bold text-[var(--text-secondary)] opacity-40">Histórico de Subscrições</h4>
                         <div className="space-y-2">
                             {selectedCompany?.subscriptions?.map((s: any, idx: number) => (
                                 <div key={idx} className="flex items-center justify-between p-4 bg-[var(--bg-primary)]/50 rounded-2xl border border-[var(--border-color)]">
                                     <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)]"><Crown size={14}/></div>
                                         <div>
                                             <p className="text-xs font-bold text-[var(--text-primary)]">{s.plan}</p>
                                             <p className="text-[8px] font-bold text-[var(--text-secondary)] opacity-40">{new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}</p>
                                         </div>
                                     </div>
                                     <span className={`text-[8px] font-bold px-2 py-1 rounded-md ${s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{s.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}</span>
                                 </div>
                             ))}
                         </div>
                    </div>

                    <div className="space-y-4">
                         <h4 className="text-[10px] font-bold text-[var(--text-secondary)] opacity-40">Prorrogar Expiração</h4>
                         <div className="flex gap-4">
                             <input 
                                 type="date"
                                 className="premium-input flex-1"
                                 defaultValue={selectedCompany?.expiresAt ? new Date(selectedCompany.expiresAt).toISOString().split('T')[0] : ''}
                                 id="prorrogar-date"
                             />
                             <button 
                                 onClick={() => {
                                     const dateVal = (document.getElementById('prorrogar-date') as HTMLInputElement).value;
                                     if(dateVal && selectedCompany) {
                                         extendExpirationMutation.mutate({ id: selectedCompany.id, expiresAt: dateVal });
                                     } else {
                                         toast.error("Insira uma data válida");
                                     }
                                 }}
                                 disabled={extendExpirationMutation.isPending}
                                 className="px-6 bg-[var(--accent)] text-white text-[10px] font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                             >
                                 Prorrogar
                             </button>
                         </div>
                    </div>

                    <button onClick={() => setShowAnalysisModal(false)} className="w-full py-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--accent)] hover:text-white transition-all">Fechar Detalhes</button>
                </div>
            </Modal>

            {/* Module Management Modal */}
            <Modal isOpen={showModuleModal} onClose={() => setShowModuleModal(false)} title="Configurar Módulos do Sistema">
                <div className="p-8 space-y-8">
                    <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-lg font-bold text-[var(--accent)]">
                                {selectedCompany?.name?.[0]}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400">Configurando</p>
                                <h3 className="text-sm font-bold text-[var(--text-primary)]">{selectedCompany?.name}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[40vh] overflow-y-auto no-scrollbar pr-2">
                        {[
                            { key: 'invoices', label: 'Faturação (AGT)' },
                            { key: 'crm', label: 'CRM Comercial' },
                            { key: 'inventory', label: 'Inventário' },
                            { key: 'pos', label: 'Point of Sale' },
                            { key: 'production', label: 'Produção' },
                            { key: 'logistics', label: 'Logística' },
                            { key: 'accounting', label: 'Contabilidade' },
                            { key: 'treasury', label: 'Tesouraria' },
                            { key: 'hr', label: 'RH Pessoal' },
                            { key: 'payroll', label: 'Payroll' },
                            { key: 'fleet', label: 'Frotas' },
                            { key: 'maintenance', label: 'Manutenção' },
                            { key: 'assets', label: 'Activos' },
                            { key: 'legal', label: 'Jurídico' },
                            { key: 'strategy', label: 'Estratégia' },
                            { key: 'training', label: 'Academia' },
                        ].map(mod => (
                            <button
                                key={mod.key}
                                onClick={() => {
                                    if (tempModules.includes(mod.key)) {
                                        setTempModules(tempModules.filter(m => m !== mod.key));
                                    } else {
                                        setTempModules([...tempModules, mod.key]);
                                    }
                                }}
                                className={`p-4 rounded-2xl border text-left transition-all ${tempModules.includes(mod.key) ? 'bg-[var(--accent)]/5 border-[var(--accent)] text-[var(--accent)]' : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] opacity-60 hover:opacity-100 hover:border-[var(--border-color)]'}`}
                            >
                                <div className="flex flex-col gap-2">
                                    {tempModules.includes(mod.key) ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-current opacity-20" />}
                                    <span className="text-[10px] font-bold leading-tight">{mod.label}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => setShowModuleModal(false)} className="flex-1 py-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl text-[10px] font-bold text-[var(--text-secondary)]">Sair</button>
                        <button onClick={updateModules} className="flex-[2] py-4 bg-[var(--accent)] text-white rounded-2xl text-[10px] font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                            <BadgeCheck size={16} /> Aplicar Alterações
                        </button>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={showCreateUserModal} onClose={() => setShowCreateUserModal(false)} title="Novo Utilizador (Cross-Tenant)">
                <div className="p-8 space-y-4">
                    <p className="text-[10px] font-bold text-amber-500 bg-amber-500/10 p-3 rounded-lg flex items-start gap-2">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        Pode atribuir este utilizador a uma entidade específica ou criar um Administrador Central caso não selecione nenhuma entidade.
                    </p>
                    
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Entidade (Opcional)</label>
                        <select
                            className="premium-input !py-3"
                            value={newUser.companyId}
                            onChange={e => {
                                const selId = e.target.value;
                                const selComp = companies?.find((c: any) => c.id === selId);
                                setNewUser({ 
                                    ...newUser, 
                                    companyId: selId,
                                    name: selComp ? `Administrador - ${selComp.name}` : newUser.name,
                                    email: selComp && selComp.email ? `admin@${selComp.email.split('@')[1] || selComp.email}` : newUser.email,
                                    role: selComp ? 'ADMIN' : newUser.role
                                });
                            }}
                        >
                            <option value="">Sem Entidade (Administração Central)</option>
                            {companies?.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name} ({c.nif})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Nome Completo</label>
                        <input className="premium-input !py-3" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="Ex: João Silva" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Email Acesso</label>
                            <input className="premium-input !py-3" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="joao@empresa.com" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Senha Provisória</label>
                            <input className="premium-input !py-3" type="text" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="Senha segura" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Nível de Acesso (Role)</label>
                        <select className="premium-input !py-3" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                            <option value="USER">Operador (USER)</option>
                            <option value="MANAGER">Gestor (MANAGER)</option>
                            <option value="ADMIN">Administrador de Inquilino (ADMIN)</option>
                            <option value="SUPER_ADMIN">Administrador de Plataforma (SUPER_ADMIN)</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                        <button onClick={() => setShowCreateUserModal(false)} className="px-6 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all border border-transparent hover:border-[var(--border-color)]">
                            Cancelar
                        </button>
                        <button 
                            onClick={() => createUserMutation.mutate(newUser)}
                            disabled={createUserMutation.isPending || !newUser.name || !newUser.email || !newUser.password}
                            className="premium-button-primary"
                        >
                            {createUserMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                            Provisionar Acesso
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SuperAdminDashboard;

const EntityCard = ({ company, onToggleStatus, onConfigModules, onDelete, onAnalysis }: any) => (
    <div className="premium-card !p-0 overflow-hidden group">
        <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-xl font-bold text-[var(--accent)] group-hover:scale-110 transition-transform">
                        {company.name.substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-[var(--text-primary)] leading-tight">{company.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Hash size={12} className="text-[var(--accent)]" />
                            <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-40">{company.nif}</span>
                        </div>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-lg text-[10px] font-bold border-2 ${company.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                    {company.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--bg-primary)]/50 p-4 rounded-2xl border border-[var(--border-color)]">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)] opacity-40 mb-1">
                        <UserPlus size={12} />
                        <span className="text-[10px] font-bold">Utilizadores</span>
                    </div>
                    <span className="text-sm font-bold text-[var(--text-primary)] tabular-nums">{company._count?.users || 0}</span>
                </div>
                <div className="bg-[var(--bg-primary)]/50 p-4 rounded-2xl border border-[var(--border-color)]">
                    <div className="flex items-center gap-2 text-[var(--accent)] opacity-60 mb-1">
                        <Crown size={12} />
                        <span className="text-[10px] font-bold">Nível</span>
                    </div>
                    <span className="text-sm font-bold text-[var(--accent)]">{company.subscriptions?.[0]?.plan || 'Livre'}</span>
                </div>
            </div>
            
            <div className="flex items-center justify-between text-[10px] font-bold text-[var(--text-secondary)] opacity-40">
                <span>Expira em</span>
                <div className="flex items-center gap-2">
                    <Calendar size={12} />
                    <span>{company.subscriptions?.[0]?.endDate ? new Date(company.subscriptions[0].endDate).toLocaleDateString() : 'N/A'}</span>
                </div>
            </div>
        </div>

        <div className="p-4 bg-[var(--bg-primary)]/30 border-t border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2">
                <button 
                    onClick={onToggleStatus}
                    className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:text-[var(--accent)] transition-all active:scale-90"
                    title="Alternar Acesso"
                >
                    {company.status === 'BLOCKED' ? <Unlock size={14} /> : <Lock size={14} />}
                </button>
                <button 
                    onClick={onConfigModules}
                    className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all active:scale-90" 
                    title="Configurar Módulos"
                >
                    <Settings size={14} />
                </button>
                <button 
                    onClick={onDelete}
                    className="p-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all border border-rose-100 active:scale-90"
                    title="Remover Empresa"
                >
                    <Trash2 size={14} />
                </button>
            </div>
            <button 
                onClick={onAnalysis}
                className="flex items-center gap-2 text-xs font-bold text-[var(--accent)] hover:translate-x-1 transition-all opacity-80"
            >
                Detalhes <ChevronRight size={14} />
            </button>
        </div>
    </div>
);

const Pagination = ({ page, total, onChange }: any) => (
    <div className="flex items-center justify-between bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border-color)] animate-fade-in">
        <div className="text-[10px] font-bold text-[var(--text-secondary)] opacity-40">
            Página {page} de {total}
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => onChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all disabled:opacity-20 active:scale-90"
            >
                <ChevronLeft size={16} />
            </button>
            <button 
                onClick={() => onChange(Math.min(total, page + 1))}
                disabled={page === total}
                className="p-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all disabled:opacity-20 active:scale-90"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    </div>
);

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, isLoading }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl w-full max-w-md p-8 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 mb-6 flex items-center justify-center">
                    <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{title}</h3>
                <p className="text-sm font-medium text-[var(--text-secondary)] opacity-60 leading-relaxed mb-8">{message}</p>
                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl text-[10px] font-bold text-[var(--text-secondary)]">Cancelar</button>
                    <button 
                        onClick={onConfirm} 
                        disabled={isLoading}
                        className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-bold flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};
