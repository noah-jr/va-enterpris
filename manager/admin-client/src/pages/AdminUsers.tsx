import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Users, Search, Shield, Building2, Trash2, UserPlus, Loader2,
    X, ShieldAlert, BadgeCheck
} from 'lucide-react';
import api from '../api';
import { toast } from 'sonner';

export default function AdminUsers() {
    const qc = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '12345678', role: 'USER', companyId: '' });

    const { data: users = [], isLoading: usersLoading } = useQuery({
        queryKey: ['superadmin-users'],
        queryFn: async () => (await api.get('/admin/users')).data,
    });

    const { data: companies = [] } = useQuery({
        queryKey: ['superadmin-companies'],
        queryFn: async () => (await api.get('/admin/companies')).data,
    });

    const createUserMutation = useMutation({
        mutationFn: async (data: any) => api.post('/admin/users', data),
        onSuccess: () => {
            toast.success('Utilizador criado com sucesso');
            setShowCreateUserModal(false);
            setNewUser({ name: '', email: '', password: '12345678', role: 'USER', companyId: '' });
            qc.invalidateQueries({ queryKey: ['superadmin-users'] });
        },
        onError: (err: any) => toast.error(err.response?.data?.error || 'Falha ao criar utilizador')
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (id: string) => api.delete(`/admin/users/${id}`),
        onSuccess: () => {
            toast.success('Utilizador removido do ecossistema');
            qc.invalidateQueries({ queryKey: ['superadmin-users'] });
        }
    });

    const filteredUsers = users.filter((u: any) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Gestão de Utilizadores</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Gestão central de todos os utilizadores da plataforma SaaS.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm outline-none focus:border-[var(--accent)] text-[var(--text-primary)] w-64"
                        />
                    </div>
                    <button onClick={() => setShowCreateUserModal(true)} className="premium-button-primary !py-2.5">
                        <UserPlus size={16} /> Novo Utilizador
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="premium-card !p-0 overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-primary)]/50 text-[10px] font-bold text-[var(--text-secondary)] opacity-60 uppercase tracking-widest">
                                <th className="px-8 py-6">Utilizador</th>
                                <th className="px-8 py-6">Privilégio</th>
                                <th className="px-8 py-6">Empresa Associada</th>
                                <th className="px-8 py-6 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]/10">
                            {usersLoading ? (
                                <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin text-[var(--accent)] inline" size={32} /></td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={4} className="p-20 text-center text-[var(--text-muted)] font-medium text-sm">Nenhum utilizador encontrado.</td></tr>
                            ) : filteredUsers.map((u: any) => (
                                <tr key={u.id} className="group hover:bg-[var(--accent)]/[0.02] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 group-hover:scale-110 transition-transform">
                                                {u.name.substring(0, 1).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                                                    {u.name} {u.role === 'SUPER_ADMIN' && <BadgeCheck size={14} className="text-[var(--accent)]" />}
                                                </p>
                                                <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold max-w-fit ${
                                            u.role === 'SUPER_ADMIN' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' :
                                            u.role === 'ADMIN' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                                            'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--accent)]'
                                        }`}>
                                            {u.role === 'SUPER_ADMIN' ? <ShieldAlert size={12} /> : <Shield size={12} />}
                                            {u.role}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] opacity-80">
                                            <Building2 size={12} className="text-[var(--text-muted)]" /> {u.company?.name || 'Administração Central (SaaS)'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Tem a certeza que deseja remover ${u.name}?`)) {
                                                    deleteUserMutation.mutate(u.id);
                                                }
                                            }}
                                            className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95 border border-transparent hover:border-rose-100"
                                            title="Eliminar Utilizador"
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

            {/* Create Modal */}
            {showCreateUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateUserModal(false)} />
                    <div className="relative bg-[var(--bg-primary)] w-full max-w-md rounded-2xl p-6 border border-[var(--border-color)]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold">Novo Utilizador</h2>
                            <button onClick={() => setShowCreateUserModal(false)} className="text-[var(--text-muted)] hover:text-rose-500 transition-colors"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Nome Completo</label>
                                <input type="text" value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm focus:border-[var(--accent)] outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">E-mail</label>
                                <input type="email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm focus:border-[var(--accent)] outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Password Provisória</label>
                                <input type="text" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm focus:border-[var(--accent)] outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Nível de Acesso (Cargo)</label>
                                <select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm focus:border-[var(--accent)] outline-none">
                                    <option value="USER">Utilizador Base (USER)</option>
                                    <option value="MANAGER">Gestor de Módulos (MANAGER)</option>
                                    <option value="ADMIN">Administrador de Empresa (ADMIN)</option>
                                    <option value="SUPER_ADMIN">Dono do SaaS (SUPER_ADMIN)</option>
                                </select>
                            </div>
                            {newUser.role !== 'SUPER_ADMIN' && (
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Vincular a Empresa</label>
                                    <select value={newUser.companyId} onChange={e => setNewUser(p => ({ ...p, companyId: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm focus:border-[var(--accent)] outline-none">
                                        <option value="">Seleccione uma entidade...</option>
                                        {companies.map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button
                                onClick={() => createUserMutation.mutate(newUser)}
                                disabled={!newUser.name || !newUser.email || (!newUser.companyId && newUser.role !== 'SUPER_ADMIN') || createUserMutation.isPending}
                                className="w-full mt-2 bg-[var(--accent)] text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {createUserMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                                Criar Conta de Acesso
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
