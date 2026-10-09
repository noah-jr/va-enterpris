import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    UserPlus, Power, Shield, ShieldCheck,
    Search, X, Users, Filter,
    CheckCircle, Trash2, Loader2, Crown,
    MoreHorizontal, List, LayoutGrid, Key, ShieldAlert,
    ChevronLeft, ChevronRight, AlertCircle, Edit2, Mail, Lock,
    RotateCcw, BadgeCheck
} from 'lucide-react';
import api from '../api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    ADMIN: {
        label: 'Administrador',
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        icon: <Crown size={14} />,
    },
    MANAGER: {
        label: 'Gestor',
        color: 'text-sky-600',
        bg: 'bg-sky-50',
        icon: <ShieldCheck size={14} />,
    },
    USER: {
        label: 'Operador',
        color: 'text-[var(--text-secondary)]',
        bg: 'bg-[var(--bg-primary)]',
        icon: <Users size={14} />,
    },
};

export default function AdminUsers() {
    const qc = useQueryClient();
    const [showAddModal, setShowAddModal] = useState(false);
    const [view, setView] = useState<'TABLE' | 'GRID'>('TABLE');
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
    const [editingUser, setEditingUser] = useState<any>(null);
    const [page, setPage] = useState(1);
    const itemsPerPage = 8;

    const [confirmAction, setConfirmAction] = useState<{ id: string, name: string, active: boolean } | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ id: string, name: string } | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const { data: usersData, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => (await api.get('/company-admin/users')).data
    });

    const { data: rolesData } = useQuery({
        queryKey: ['admin-roles'],
        queryFn: async () => (await api.get('/company-admin/roles')).data
    });

    const users = (usersData || []) as any[];
    const rolesList = (rolesData || []) as any[];

    const createMutation = useMutation({
        mutationFn: (payload: any) => editingUser 
            ? api.put(`/company-admin/users/${editingUser.id}`, payload)
            : api.post('/company-admin/users', payload),
        onSuccess: () => {
            toast.success(`Utilizador ${editingUser ? 'actualizado' : 'registado'} com sucesso.`);
            qc.invalidateQueries({ queryKey: ['admin-users'] });
            closeModal();
        },
        onError: (err: any) => toast.error(err.response?.data?.error || 'Erro na operação.')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/company-admin/users/${id}`),
        onSuccess: () => {
            toast.success('Utilizador removido.');
            qc.invalidateQueries({ queryKey: ['admin-users'] });
            setConfirmDelete(null);
        }
    });

    const toggleStatusMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/company-admin/users/${id}/toggle`, {}),
        onSuccess: (res: any) => { 
            toast.success(res.data.message); 
            qc.invalidateQueries({ queryKey: ['admin-users'] }); 
            setConfirmAction(null);
        }
    });

    const openEditModal = (user: any) => {
        setEditingUser(user);
        setFormData({ name: user.name, email: user.email, password: '', role: user.role });
        setShowAddModal(true);
        setActiveMenu(null);
    };

    const closeModal = () => {
        setShowAddModal(false);
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', role: rolesList.length > 0 ? rolesList[0].name : 'USER' });
    };

    const filteredUsers = users.filter((u: any) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ROLE_CONFIG[u.role]?.label || u.role).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const columns = [
        {
            header: 'Utilizador',
            accessor: (u: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-xs font-bold text-[var(--accent)]">
                        {u.name.substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold leading-none mb-1">{u.name}</p>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50">{u.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Nível de Acesso',
            accessor: (u: any) => {
                const role = ROLE_CONFIG[u.role] || {
                    label: u.role,
                    color: 'text-[var(--text-secondary)]',
                    bg: 'bg-[var(--bg-primary)]',
                    icon: <Users size={14} />
                };
                return (
                    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[10px] font-bold ${role.bg} ${role.color} border-current/10`}>
                        {role.icon}
                        {role.label}
                    </div>
                );
            }
        },
        {
            header: 'Estado',
            accessor: (u: any) => (
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${u.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {u.isActive ? 'Ativo' : 'Suspenso'}
                </span>
            )
        },
        {
            header: 'Último Acesso',
            accessor: (u: any) => (
                <span className="text-[11px] font-medium text-[var(--text-secondary)] opacity-60">
                    {u.lastLogin ? format(new Date(u.lastLogin), 'dd MMM yyyy', { locale: pt }) : 'N/A'}
                </span>
            )
        },
        {
            header: '',
            accessor: (u: any) => (
                <div className="flex justify-end gap-2">
                    <button 
                        onClick={() => setConfirmAction({ id: u.id, name: u.name, active: u.isActive })}
                        className={`p-2 rounded-lg border transition-all ${u.isActive ? 'text-rose-600 hover:bg-rose-50 border-rose-100' : 'text-emerald-600 hover:bg-emerald-50 border-emerald-100'}`}
                    >
                        <Power size={14} />
                    </button>
                    <button 
                        onClick={() => openEditModal(u)}
                        className="p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button 
                        onClick={() => setConfirmDelete({ id: u.id, name: u.name })}
                        className="p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-rose-600 transition-all"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
            className: "text-right"
        }
    ];

    return (
        <div className="space-y-6 pb-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Utilizadores e Acessos</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1.5">Gestão corporativa de identidades e matriz de privilégios institucionais.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Link
                        to="/roles"
                        className="premium-button-secondary"
                    >
                        <ShieldAlert size={18} /> Perfis
                    </Link>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="premium-button-primary shadow-indigo-500/20 shadow-lg"
                    >
                        <UserPlus size={18} /> Novo Operador
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Utilizadores', value: users.length.toString(), icon: <Users size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Contas Ativas', value: users.filter((u: any) => u.isActive).length.toString(), icon: <CheckCircle size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Contas Suspensas', value: users.filter((u: any) => !u.isActive).length.toString(), icon: <Power size={15} />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                    { label: 'Administradores', value: users.filter((u: any) => u.role === 'ADMIN').length.toString(), icon: <Crown size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="premium-card p-4 flex items-start gap-3">
                        <div className={`kpi-icon shrink-0 ${stat.color} ${stat.bg}`}>
                            {stat.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-[var(--text-muted)] mb-0.5 truncate">{stat.label}</p>
                            <p className="text-base font-bold text-[var(--text-primary)] tabular-nums leading-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-[var(--radius-md)] flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setPage(page); }}
                        placeholder="Pesquisar por nome, email ou função..."
                        className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm font-medium"
                    />
                </div>

                <div className="flex bg-[var(--bg-primary)] p-1 rounded-[var(--radius-md)] border border-[var(--border-color)] shadow-sm">
                    <button onClick={() => setView('GRID')} className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${view === 'GRID' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
                        <LayoutGrid size={14} />
                    </button>
                    <button onClick={() => setView('TABLE')} className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${view === 'TABLE' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
                        <List size={14} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="flex items-center justify-center gap-3 py-32 text-[var(--text-muted)]">
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-sm">A carregar utilizadores...</span>
                </div>
            ) : view === 'TABLE' ? (
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
                    <DataTable 
                        data={paginatedUsers}
                        columns={columns}
                        isLoading={isLoading}
                        currentPage={page}
                        totalPages={totalPages}
                        totalItems={filteredUsers.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setPage}
                        showSearch={false}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-fade-in">
                    {paginatedUsers.map((u: any) => {
                        const role = ROLE_CONFIG[u.role] || {
                            label: u.role,
                            color: 'text-[var(--text-secondary)]',
                            bg: 'bg-[var(--bg-primary)]',
                            icon: <Users size={14} />
                        };
                        return (
                            <div key={u.id} className="premium-card p-6 border border-[var(--border-color)] group hover:border-[var(--accent)] transition-all">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-sm font-bold text-[var(--accent)] transition-transform group-hover:scale-105">
                                            {u.name.substring(0, 1).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[var(--text-primary)] leading-tight">{u.name}</h3>
                                            <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-40 truncate max-w-[120px]">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${u.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                        {u.isActive ? 'Ativo' : 'Suspenso'}
                                    </div>
                                </div>

                                <div className={`p-4 rounded-xl border border-current/10 flex items-center gap-3 ${role.bg} ${role.color} mb-6`}>
                                     <div className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center">
                                         {role.icon}
                                     </div>
                                     <span className="text-[10px] font-bold uppercase tracking-tight">{role.label}</span>
                                </div>

                                <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[var(--text-secondary)] opacity-40 mb-6">
                                    <span>Último Acesso</span>
                                    <span>{u.lastLogin ? format(new Date(u.lastLogin), 'dd/MM/yyyy') : 'N/A'}</span>
                                </div>

                                <div className="pt-4 border-t border-[var(--border-color)] flex gap-2">
                                    <button 
                                        onClick={() => setConfirmAction({ id: u.id, name: u.name, active: u.isActive })}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-all text-[10px] font-bold uppercase ${u.isActive ? 'border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white' : 'border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                                    >
                                        <Power size={14} /> {u.isActive ? 'Suspender' : 'Ativar'}
                                    </button>
                                    <button 
                                        onClick={() => openEditModal(u)}
                                        className="p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal isOpen={showAddModal} onClose={closeModal} title={editingUser ? "Editar Operador" : "Novo Operador"} subtitle="Gestão de acesso institucional">
                <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="p-4 sm:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Nome Completo</label>
                            <input 
                                className="premium-input !py-4 font-bold uppercase" 
                                placeholder="NOME DO COLABORADOR"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Email Profissional</label>
                            <input 
                                className="premium-input !py-4 font-bold" 
                                type="email"
                                placeholder="email@empresa.ao"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">{editingUser ? "Nova Senha (Opcional)" : "Senha de Acesso"}</label>
                            <input 
                                className="premium-input !py-4 font-bold" 
                                type="password"
                                placeholder="******"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required={!editingUser}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Perfil de Acesso</label>
                            <select 
                                className="premium-input !py-4 font-bold h-[52px] cursor-pointer"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                            >
                                {rolesList.length === 0 && <option value="USER">Operador Base</option>}
                                {rolesList.map((r: any) => (
                                    <option key={r.id} value={r.name}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={closeModal} className="premium-button-secondary flex-1 uppercase">Cancelar</button>
                        <button 
                            type="submit"
                            disabled={createMutation.isPending}
                            className="premium-button-primary flex-[2] uppercase"
                        >
                            {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={18} />}
                            {editingUser ? "Salvar Alterações" : "Confirmar Registo"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Confirm Actions */}
            <Modal isOpen={!!confirmAction} onClose={() => setConfirmAction(null)} title={confirmAction?.active ? "Suspender Acesso" : "Reativar Acesso"} width="md">
                <div className="p-8 text-center space-y-6">
                    <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${confirmAction?.active ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        <AlertCircle size={32} />
                    </div>
                    <p className="text-sm font-medium text-[var(--text-secondary)] opacity-70 leading-relaxed">
                        {confirmAction?.active 
                            ? `Deseja suspender o acesso de ${confirmAction?.name}? O utilizador não poderá entrar no sistema até ser reativado.`
                            : `Deseja reativar o acesso de ${confirmAction?.name}? As permissões anteriores serão mantidas.`
                        }
                    </p>
                    <div className="flex gap-4 pt-4">
                        <button onClick={() => setConfirmAction(null)} className="premium-button-secondary flex-1">Cancelar</button>
                        <button 
                            onClick={() => toggleStatusMutation.mutate(confirmAction!.id)} 
                            disabled={toggleStatusMutation.isPending}
                            className={`premium-button-primary flex-1 ${confirmAction?.active ? '!bg-rose-600' : '!bg-emerald-600'}`}
                        >
                            {toggleStatusMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                            Confirmar
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Eliminar Utilizador" width="md">
                <div className="p-8 text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl mx-auto bg-rose-50 text-rose-600 flex items-center justify-center">
                        <Trash2 size={32} />
                    </div>
                    <p className="text-sm font-medium text-[var(--text-secondary)] opacity-70 leading-relaxed">
                        Deseja eliminar permanentemente <span className="font-bold text-[var(--text-primary)]">{confirmDelete?.name}</span>? Esta ação não pode ser desfeita.
                    </p>
                    <div className="flex gap-4 pt-4">
                        <button onClick={() => setConfirmDelete(null)} className="premium-button-secondary flex-1">Cancelar</button>
                        <button 
                            onClick={() => deleteMutation.mutate(confirmDelete!.id)} 
                            disabled={deleteMutation.isPending}
                            className="premium-button-primary flex-1 !bg-rose-600"
                        >
                            {deleteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            Eliminar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
