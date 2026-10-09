import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Users, UserPlus, Mail, Trash2, Edit, Building2, Wallet, PlusCircle, 
    LayoutGrid, List, Search, Filter, BadgeCheck, Fingerprint, 
    ShieldCheck, MapPin, Briefcase, Zap, Scale, ShieldAlert, 
    Clock, HeartPulse, Globe, FileText, TrendingUp, Loader2, Activity,
    Phone, Download, MoreHorizontal, ChevronRight
} from 'lucide-react';
import api, { lookupTaxpayer } from '../api';
import { toast } from 'sonner';
import { usePermissions, useMe } from '../auth/useAuth';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { SearchableSelect } from '../components/SearchableSelect';

import { formatCurrency } from '../utils/format';
const fmt = (v: number) => formatCurrency(v);

interface Employee {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    position: string | null;
    department: string | null;
    salary: number | null;
    status: string;
    hireDate: string;
    photoUrl?: string;
}

export default function Employees() {
    const { hasPermission } = usePermissions();
    const queryClient = useQueryClient();
    
    const [view, setView] = useState<'GRID' | 'TABLE'>('TABLE');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        salary: '',
        bi: '',
        contractType: 'FULL_TIME',
        hireDate: new Date().toISOString().split('T')[0],
        emergencyContact: '',
        emergencyPhone: '',
        municipality: '',
        province: 'LUANDA',
        photo: null as File | null
    });

    const [isSearching, setIsSearching] = useState(false);

    const handleTaxpayerLookup = async (nifValue: string) => {
        if (!nifValue || (nifValue.length !== 10 && nifValue.length !== 14)) return;
        setIsSearching(true);
        try {
            const data = await lookupTaxpayer(nifValue);
            if (data) {
                setFormData(prev => ({
                    ...prev,
                    name: (data.name || data.gsmc || prev.name).toUpperCase(),
                    phone: data.phone || data.lxfs || prev.phone,
                    email: data.email || prev.email,
                }));
                toast.success('Identidade validada.');
            }
        } catch (error: any) {
            console.error('NIF/BI lookup failed', error);
        } finally {
            setIsSearching(false);
        }
    };

    const itemsPerPage = 8;

    const { data: employeesData, isLoading } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => (await api.get('/hr/employees')).data as Employee[]
    });

    const employees = employeesData || [];
    const filtered = employees.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.position?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (e.department?.toLowerCase() || '').includes(search.toLowerCase())
    );

    const paginatedData = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const createMutation = useMutation({
        mutationFn: (data: FormData) => api.post('/hr/employees', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.success('Funcionário registado.');
            closeModal();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: FormData }) => api.put(`/hr/employees/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.success('Perfil actualizado.');
            closeModal();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/hr/employees/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.info('Funcionário removido.');
        }
    });

    const openModal = (emp?: any) => {
        if (emp) {
            setEditingEmployee(emp);
            setFormData({
                name: emp.name,
                email: emp.email || '',
                phone: emp.phone || '',
                position: emp.position || '',
                department: emp.department || '',
                salary: emp.salary?.toString() || '',
                bi: emp.bi || '',
                contractType: emp.contractType || 'FULL_TIME',
                hireDate: emp.hireDate?.split('T')[0] || new Date().toISOString().split('T')[0],
                emergencyContact: emp.emergencyContact || '',
                emergencyPhone: emp.emergencyPhone || '',
                municipality: emp.municipality || '',
                province: emp.province || 'LUANDA',
                photo: null
            });
        } else {
            setEditingEmployee(null);
            setFormData({ 
                name: '', email: '', phone: '', position: '', department: '', salary: '', 
                bi: '', contractType: 'FULL_TIME', 
                hireDate: new Date().toISOString().split('T')[0], 
                emergencyContact: '', emergencyPhone: '', 
                municipality: '', province: 'LUANDA',
                photo: null 
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEmployee(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'photo' && value) {
                data.append('photo', value);
            } else if (value !== null && value !== undefined) {
                data.append(key, value.toString());
            }
        });

        if (editingEmployee) updateMutation.mutate({ id: editingEmployee.id, data });
        else createMutation.mutate(data);
    };

    const columns = [
        { 
            header: 'Funcionário', 
            accessor: (emp: Employee) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-[var(--border-color)] bg-[var(--bg-primary)]">
                        <img src={emp.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="font-bold leading-none mb-1">{emp.name}</p>
                        <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">{emp.position || 'Colaborador'}</p>
                    </div>
                </div>
            )
        },
        { 
            header: 'Departamento', 
            accessor: (emp: Employee) => (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/30" />
                    <span className="text-[11px] font-bold text-[var(--text-secondary)] opacity-60 uppercase">{emp.department || 'Geral'}</span>
                </div>
            ) 
        },
        { 
            header: 'Salário', 
            accessor: (emp: Employee) => <span className="text-xs font-bold text-[var(--text-primary)] tabular-nums">{emp.salary ? fmt(emp.salary) : '—'}</span> 
        },
        { 
            header: 'Estado', 
            accessor: (emp: Employee) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${emp.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${emp.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {emp.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                </span>
            )
        },
        {
            header: '',
            accessor: (emp: Employee) => (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={(e) => { e.stopPropagation(); openModal(emp); }} className="p-2 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--accent)] border border-[var(--border-color)] transition-all">
                        <Edit size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); if (confirm('Remover?')) deleteMutation.mutate(emp.id); }} className="p-2 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-rose-500 border border-[var(--border-color)] transition-all">
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
            className: "text-right"
        }
    ];

    if (isLoading) return (
        <div className="flex items-center justify-center gap-3 py-32 text-[var(--text-muted)]">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">A carregar colaboradores...</span>
        </div>
    );

    return (
        <div className="space-y-6 pb-8">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">
                        Recursos Humanos
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">
                        Gestão de talentos e capital intelectual
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
                    {hasPermission('employees:create') && (
                        <button onClick={() => openModal()} className="premium-button-primary">
                            <UserPlus size={15} />
                            <span>Admitir colaborador</span>
                        </button>
                    )}
                </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Colaboradores', value: employees.length.toString(), icon: <Users size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Departamentos', value: Array.from(new Set(employees.map(e => e.department))).filter(Boolean).length.toString(), icon: <Building2 size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                    { label: 'Total salários', value: fmt(employees.reduce((acc, e) => acc + (e.salary || 0), 0)), icon: <Wallet size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Taxa retenção', value: '96.4%', icon: <Activity size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' }
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

            {/* Search area */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative group flex-1 w-full max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input 
                        type="text"
                        placeholder="Pesquisar colaboradores..."
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] py-2 pl-10 pr-4 rounded-lg text-sm font-medium outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="premium-button-secondary py-2">
                        <Download size={14} />
                        <span>Exportar</span>
                    </button>
                    <span className="text-[10px] font-bold text-[var(--text-muted)] bg-[var(--bg-primary)] px-3 py-1.5 rounded-lg border border-[var(--border-color)]">
                        {filtered.length} Entidades
                    </span>
                </div>
            </div>

            {/* Content Area */}
            {view === 'GRID' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {paginatedData.map((emp: any) => (
                        <div 
                            key={emp.id} 
                            className="premium-card p-5 group cursor-pointer hover:border-[var(--accent)] transition-all flex flex-col gap-4 active:scale-[0.98]" 
                            onClick={() => openModal(emp)}
                        >
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-primary)] grayscale group-hover:grayscale-0 transition-all">
                                    <img 
                                        src={emp.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`} 
                                        alt="avatar" 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[var(--text-primary)] line-clamp-1">{emp.name}</h3>
                                    <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">{emp.position || 'Colaborador'}</p>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-[var(--border-color)] space-y-2 mt-auto">
                                <div className="flex items-center justify-between text-[10px] font-bold">
                                    <span className="text-[var(--text-muted)] uppercase">Departamento</span>
                                    <span className="text-[var(--text-primary)] uppercase">{emp.department || 'Geral'}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold">
                                    <span className="text-[var(--text-muted)] uppercase">Vencimento</span>
                                    <span className="text-[var(--text-primary)] tabular-nums">{emp.salary ? fmt(emp.salary) : '—'}</span>
                                </div>
                                <div className="pt-2">
                                    <button className="w-full py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[9px] font-bold uppercase hover:bg-[var(--accent)] hover:text-white transition-colors">
                                        Ver Perfil
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

            {/* Modal: Perfil */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingEmployee ? 'Perfil do Funcionário' : 'Novo Funcionário'}
                subtitle="Gestão de dados contratuais e profissionais."
                type="CENTER"
                width="xl"
                icon={<PlusCircle size={24} className="text-[var(--accent)]" />}
            >
                <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6">
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative group/avatar cursor-pointer" onClick={() => document.getElementById('photo-upload')?.click()}>
                            <div className="w-24 h-24 rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-primary)] mb-2 shadow-sm relative transition-all group-hover/avatar:border-[var(--accent)]">
                                {formData.photo ? (
                                    <img src={URL.createObjectURL(formData.photo)} alt="Preview" className="w-full h-full object-cover" />
                                ) : editingEmployee?.photoUrl ? (
                                    <img src={editingEmployee.photoUrl} alt="Employee" className="w-full h-full object-cover" />
                                ) : (
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name || 'new'}`} alt="avatar" className="w-full h-full object-cover" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                                    <PlusCircle className="text-white" size={24} />
                                </div>
                            </div>
                            <input 
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setFormData(prev => ({ ...prev, photo: file }));
                                }}
                            />
                        </div>
                        <p className="text-[9px] font-bold text-[var(--accent)] uppercase">Carregar Fotografia</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">NIF / BI</label>
                            <div className="relative">
                                <Fingerprint size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isSearching ? 'animate-pulse text-amber-500' : 'text-[var(--accent)] opacity-40'}`} />
                                <input 
                                    required 
                                    value={formData.bi} 
                                    onChange={e => {
                                        const val = e.target.value.toUpperCase();
                                        setFormData(p => ({ ...p, bi: val }));
                                        if (val.length === 10 || val.length === 14) handleTaxpayerLookup(val);
                                    }}
                                    className="premium-input !py-4 !pl-10 font-bold" 
                                    placeholder="Nº DE IDENTIFICAÇÃO" 
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Nome Completo</label>
                            <input 
                                required 
                                value={formData.name} 
                                onChange={e => setFormData(p => ({ ...p, name: e.target.value.toUpperCase() }))} 
                                className="premium-input !py-4 font-bold uppercase" 
                                placeholder={isSearching ? "A VALIDAR..." : "NOME COMPLETO..."} 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Cargo</label>
                            <input value={formData.position} onChange={e => setFormData(p => ({ ...p, position: e.target.value.toUpperCase() }))} className="premium-input !py-4 font-bold uppercase" placeholder="FUNÇÃO..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Departamento</label>
                                <SearchableSelect 
                                    options={[
                                        { label: 'ADMINISTRAÇÃO GERAL', value: 'GERAL' },
                                        { label: 'MARKETING & VENDAS', value: 'MARKETING' },
                                        { label: 'TECNOLOGIA & PRODUTO', value: 'TECH' },
                                        { label: 'FINANÇAS & CONTABILIDADE', value: 'FINANCE' },
                                        { label: 'OPERAÇÕES & LOGÍSTICA', value: 'OPERATIONS' },
                                        { label: 'RECURSOS HUMANOS', value: 'HR' }
                                    ]}
                                    value={formData.department}
                                    onChange={val => setFormData(p => ({ ...p, department: val }))}
                                />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Data de Admissão</label>
                            <input type="date" value={formData.hireDate} onChange={e => setFormData(p => ({ ...p, hireDate: e.target.value }))} className="premium-input !py-4 font-bold" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 border-y border-[var(--border-color)]/30 py-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Salário Base (AOA)</label>
                            <input type="number" value={formData.salary} onChange={e => setFormData(p => ({ ...p, salary: e.target.value }))} className="premium-input !py-4 font-bold tabular-nums" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Tipo de Contrato</label>
                                <SearchableSelect 
                                    options={[
                                        { label: 'TEMPO INTEIRO (EFECTIVO)', value: 'FULL_TIME' },
                                        { label: 'CONTRATO DETERMINADO', value: 'CONTRACT' },
                                        { label: 'ESTAGIÁRIO', value: 'INTERN' }
                                    ]}
                                    value={formData.contractType}
                                    onChange={val => setFormData(p => ({ ...p, contractType: val }))}
                                />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Telefone</label>
                            <input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} className="premium-input !py-4 font-bold" placeholder="9XX XXX XXX" />
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={closeModal} className="premium-button-secondary flex-1 uppercase">Cancelar</button>
                        <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="premium-button-primary flex-[2] uppercase">
                            {createMutation.isPending || updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={18} />}
                            {editingEmployee ? 'Guardar Alterações' : 'Confirmar Admissão'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
