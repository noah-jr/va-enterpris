import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Shield, ShieldCheck, Crown, Users, CheckCircle,
    X, Plus, Trash2, Edit2, Loader2, Key, Lock,
    AlertCircle, Search, Info, ChevronRight, Activity, ArrowUpRight
} from 'lucide-react';
import api from '../api';
import { toast } from 'sonner';

export default function AdminRoles() {
    const qc = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', description: '', permissionIds: [] as string[] });
    const [permSearch, setPermSearch] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<{ id: string, name: string } | null>(null);

    const { data: roles, isLoading: loadingRoles } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => (await api.get('/admin/roles')).data
    });

    const { data: permissions } = useQuery({
        queryKey: ['permissions'],
        queryFn: async () => (await api.get('/admin/permissions')).data
    });

    const roleMutation = useMutation({
        mutationFn: (payload: any) => editingRole
            ? api.put(`/admin/roles/${editingRole.id}`, payload)
            : api.post('/admin/roles', payload),
        onSuccess: () => {
            toast.success(`Perfil ${editingRole ? 'actualizado' : 'criado'} com sucesso.`);
            qc.invalidateQueries({ queryKey: ['roles'] });
            closeModal();
        },
        onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao guardar perfil.')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/admin/roles/${id}`),
        onSuccess: () => {
            toast.success('Perfil removido do ecossistema.');
            qc.invalidateQueries({ queryKey: ['roles'] });
            setConfirmDelete(null);
        },
        onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao remover perfil.')
    });

    const openModal = (role: any = null) => {
        if (role) {
            setEditingRole(role);
            setFormData({
                name: role.name,
                description: role.description || '',
                permissionIds: role.permissions.map((p: any) => p.id)
            });
        } else {
            setEditingRole(null);
            setFormData({ name: '', description: '', permissionIds: [] });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingRole(null);
        setFormData({ name: '', description: '', permissionIds: [] });
        setPermSearch('');
    };

    const togglePermission = (id: string) => {
        setFormData(prev => ({
            ...prev,
            permissionIds: prev.permissionIds.includes(id)
                ? prev.permissionIds.filter(pid => pid !== id)
                : [...prev.permissionIds, id]
        }));
    };

    const groupedPermissions = ((permissions || []) as any[])
        .filter(p => p.name.toLowerCase().includes(permSearch.toLowerCase()) || (p.description || '').toLowerCase().includes(permSearch.toLowerCase()))
        .reduce((acc: any, p: any) => {
            const cat = p.name?.includes(':') ? p.name.split(':')[0] : 'geral';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(p);
            return acc;
        }, {});

    return (
        <div className="space-y-6 pb-8">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">
                        Matriz de Acesso
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">
                        Governança de identidades e protocolos de segurança granulares do ecossistema.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => openModal()}
                        className="premium-button-primary !px-3 !py-2"
                    >
                        <Plus size={15} />
                        <span className="text-sm">Novo perfil</span>
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { title: 'Perfis ativos', value: roles?.length || 0, icon: <Shield size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { title: 'Privilégios', value: permissions?.length || 0, icon: <Key size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { title: 'Utilizadores', value: roles?.reduce((acc: number, r: any) => acc + (r._count?.users || 0), 0) || 0, icon: <Users size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                    { title: 'Score segurança', value: '98%', icon: <Activity size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                ].map((kpi, idx) => (
                    <div key={idx} className="premium-card p-4 flex items-start gap-3">
                        <div className={`kpi-icon shrink-0 ${kpi.color} ${kpi.bg}`}>
                            {kpi.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-[var(--text-muted)] mb-0.5 truncate">{kpi.title}</p>
                            <p className="text-base font-bold text-[var(--text-primary)] tabular-nums leading-tight truncate">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-700">
                {loadingRoles ? (
                    <div className="col-span-full py-40 flex flex-col items-center justify-center opacity-40">
                        <Loader2 className="animate-spin text-[var(--accent)] mb-4" size={32} />
                        <p className="text-xs font-bold uppercase tracking-widest italic">Descodificando Matriz de Acesso...</p>
                    </div>
                ) : roles?.map((role: any) => {
                    const isSystem = role.companyId === null;
                    return (
                        <div key={role.id} className="premium-card p-6 flex flex-col group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-[var(--accent)] group-hover:scale-110 transition-transform pointer-events-none"><Shield size={80} /></div>
                            
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-3 rounded-xl border ${isSystem ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-sky-50 text-sky-600 border-sky-200'} shadow-sm`}>
                                    {isSystem ? <Crown size={20} /> : <Shield size={20} />}
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest border ${isSystem ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-sky-500/10 text-sky-600 border-sky-500/20'}`}>
                                    {isSystem ? 'Sistema' : 'Personalizado'}
                                </span>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-base font-bold text-[var(--text-primary)] italic leading-tight group-hover:text-[var(--accent)] transition-colors">{role.name}</h3>
                                <p className="text-[10px] text-[var(--text-secondary)] font-medium mt-1.5 opacity-60 line-clamp-2 min-h-[30px]">
                                    {role.description || 'Configuração de acesso padrão do ecossistema OneGest.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-[var(--border-color)]/10 mb-6 bg-[var(--bg-primary)]/30 rounded-xl p-3">
                                <div className="text-center">
                                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase opacity-40">Privilégios</p>
                                    <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{role.permissions?.length || 0}</p>
                                </div>
                                <div className="text-center border-l border-[var(--border-color)]/10">
                                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase opacity-40">Utilizadores</p>
                                    <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{role._count?.users || 0}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-auto">
                                <button 
                                    onClick={() => openModal(role)}
                                    className="flex-1 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[10px] font-bold uppercase hover:bg-[var(--accent)] hover:text-white transition-all active:scale-95 shadow-sm"
                                >
                                    {isSystem ? 'Ver Privilégios' : 'Configurar'}
                                </button>
                                {!isSystem && (
                                    <button 
                                        onClick={() => setConfirmDelete({ id: role.id, name: role.name })}
                                        className="p-3 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-100 rounded-xl active:scale-90"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Side Panel Modal for Editing */}
            {showModal && createPortal(
                <div className="fixed inset-0 z-[2000] flex justify-end">
                    <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={closeModal} />
                    <div className="relative z-10 w-full max-w-2xl bg-[var(--bg-secondary)] h-[100dvh] overflow-y-auto p-8 sm:p-12 shadow-2xl animate-in slide-in-from-right duration-200 border-l border-[var(--border-color)] flex flex-col">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--accent)] mb-2">Protocolo de Identidade</h3>
                                <h2 className="text-2xl font-bold text-[var(--text-primary)] leading-tight italic">{editingRole ? editingRole.name : 'Novo Perfil de Acesso'}</h2>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-[var(--bg-primary)] rounded-[var(--radius-sm)] transition-colors"><X size={24} /></button>
                        </div>

                        <div className="flex-1 space-y-8 no-scrollbar pb-24">
                            <div className="premium-card p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest pl-1">Nome do Perfil</label>
                                    <input 
                                        className="premium-input text-base italic" 
                                        placeholder="Ex: Gestor de Projectos"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        disabled={editingRole?.companyId === null}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest pl-1">Descrição Técnica</label>
                                    <textarea 
                                        className="premium-input min-h-[80px] py-3 text-sm" 
                                        placeholder="Finalidade e escopo deste perfil..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        disabled={editingRole?.companyId === null}
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between gap-4 border-b border-[var(--border-color)]/10 pb-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-3">
                                        <Lock size={16} className="text-[var(--accent)]" /> Matriz de Privilégios
                                    </h4>
                                    <div className="relative flex-1 max-w-xs">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-40" size={14} />
                                        <input 
                                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)]/50 py-2 pl-9 pr-4 rounded-lg text-[10px] font-bold outline-none focus:border-[var(--accent)]/30 transition-all shadow-inner"
                                            placeholder="Procurar privilégios..."
                                            value={permSearch}
                                            onChange={e => setPermSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {Object.entries(groupedPermissions).map(([category, perms]: [string, any]) => (
                                        <div key={category} className="space-y-4">
                                            <h5 className="text-[10px] font-bold uppercase text-[var(--accent)] tracking-[0.2em] pl-3 border-l-4 border-[var(--accent)] flex items-center gap-2 italic">
                                                Módulo {category} <ArrowUpRight size={10} className="opacity-40" />
                                            </h5>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {perms.map((p: any) => {
                                                    const isSelected = formData.permissionIds.includes(p.id);
                                                    return (
                                                        <button
                                                            key={p.id}
                                                            onClick={() => editingRole?.companyId !== null && togglePermission(p.id)}
                                                            disabled={editingRole?.companyId === null}
                                                            className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden group/btn ${isSelected ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-xl shadow-[var(--accent)]/20' : 'bg-[var(--bg-primary)]/50 border-[var(--border-color)]/50 text-[var(--text-secondary)] hover:border-[var(--accent)]/30'}`}
                                                        >
                                                            <div className="flex items-center gap-4 relative z-10">
                                                                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-white border-white shadow-sm' : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'}`}>
                                                                    {isSelected && <CheckCircle size={12} className="text-[var(--accent)]" />}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className={`text-[10px] font-bold uppercase tracking-tight truncate ${isSelected ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                                                                        {p.name.split(':')[1] || p.name}
                                                                    </p>
                                                                    <p className={`text-[8px] truncate mt-0.5 font-medium ${isSelected ? 'text-white/70' : 'text-[var(--text-muted)] opacity-60'}`}>
                                                                        {p.description || 'Controlo operacional'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]/20 flex gap-4 backdrop-blur-md">
                            <button onClick={closeModal} className="flex-1 py-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl text-[10px] font-bold uppercase text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all">Cancelar</button>
                            {(!editingRole || editingRole.companyId !== null) && (
                                <button 
                                    onClick={() => roleMutation.mutate(formData)}
                                    disabled={roleMutation.isPending || !formData.name}
                                    className="flex-[2] py-4 bg-[var(--accent)] text-white rounded-2xl text-[10px] font-bold uppercase shadow-2xl shadow-[var(--accent)]/30 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {roleMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                    {editingRole ? 'Actualizar Arquitectura' : 'Finalizar Perfil'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Confirm Delete Dialog */}
            {confirmDelete && createPortal(
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={() => setConfirmDelete(null)} />
                    <div className="relative z-10 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[var(--radius-lg)] w-full max-w-md p-10 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 mb-8 flex items-center justify-center shadow-inner mx-auto">
                            <AlertCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-[var(--text-primary)] text-center tracking-tight mb-3 italic">Eliminar Perfil?</h3>
                        <p className="text-sm font-medium text-[var(--text-secondary)] text-center opacity-60 leading-relaxed mb-10">Deseja remover permanentemente o perfil <span className="text-[var(--text-primary)] font-bold italic">"{confirmDelete.name}"</span>? Esta acção é irreversível e afectará todos os utilizadores associados.</p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => deleteMutation.mutate(confirmDelete.id)} 
                                disabled={deleteMutation.isPending}
                                className="w-full py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-bold uppercase shadow-xl shadow-rose-600/20 flex items-center justify-center gap-2 hover:bg-rose-700 transition-all active:scale-95"
                            >
                                {deleteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                Confirmar Eliminação
                            </button>
                            <button onClick={() => setConfirmDelete(null)} className="w-full py-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl text-[10px] font-bold uppercase text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]">Cancelar</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
