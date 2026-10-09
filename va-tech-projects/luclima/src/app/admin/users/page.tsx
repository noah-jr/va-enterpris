'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/modal';
import { UserForm } from '@/components/admin/forms/user-form';
import {
    Users,
    Plus,
    Search,
    Edit,
    Trash2,
    QrCode,
    CheckCircle,
    XCircle,
} from 'lucide-react';

const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Administrador',
    SECTOR_MANAGER: 'Gestor de Sector',
    EDITOR: 'Editor',
    EMPLOYEE: 'Funcionário',
};

const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300',
    ADMIN: 'bg-gray-100 dark:bg-gray-900/20 text-blue-800 dark:text-blue-300',
    SECTOR_MANAGER: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300',
    EDITOR: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-300',
    EMPLOYEE: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
};

export default function UsersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<{
        id: string;
        name: string;
        email: string;
        role: string;
        sectorId?: string;
        isActive: boolean;
    } | null>(null);
    const [qrUserId, setQrUserId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const response = await fetch('/api/users');
            if (!response.ok) throw new Error('Erro ao carregar utilizadores');
            return response.json();
        },
    });

    const { data: qrData, refetch: refetchQr } = useQuery({
        queryKey: ['user-qrcode', qrUserId],
        queryFn: async () => {
            if (!qrUserId) return null;
            const res = await fetch(`/api/users/${qrUserId}/qrcode`);
            if (!res.ok) throw new Error('Erro ao carregar QR Code');
            return res.json();
        },
        enabled: !!qrUserId,
    });

    const regenerateQrMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/users/${id}/regenerate-qrcode`, { method: 'POST' });
            if (!res.ok) throw new Error('Erro ao regenerar');
            return res.json();
        },
        onSuccess: () => {
            refetchQr();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Erro ao eliminar');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
    });

    const users = data?.users ?? [];

    const filteredUsers = users.filter(
        (user: { name?: string; email?: string }) =>
            (user.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setEditingUser(null);
        setIsFormOpen(true);
    };

    const handleEdit = (user: { id: string; name: string; email: string; role: string; sectorId?: string; isActive: boolean }) => {
        setEditingUser(user);
        setIsFormOpen(true);
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setEditingUser(null);
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    };

    const handleDelete = (user: { id: string; name: string }) => {
        if (!confirm(`Eliminar o utilizador "${user.name}"? Esta ação não pode ser desfeita.`)) return;
        deleteMutation.mutate(user.id);
    };

    return (
        <div className="p-4 lg:p-8 space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                        Utilizadores
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gerir utilizadores do sistema
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center space-x-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-black/90 dark:hover:bg-white/90 transition-all"
                >
                    <Plus size={20} />
                    <span>Novo Utilizador</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
                            <p className="text-3xl font-bold text-black dark:text-white">{users.length}</p>
                        </div>
                        <Users className="text-gray-400" size={32} />
                    </div>
                </div>

                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Activos</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {users.filter((u: { isActive?: boolean }) => u.isActive).length}
                            </p>
                        </div>
                        <CheckCircle className="text-green-400" size={32} />
                    </div>
                </div>

                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Inactivos</p>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                {users.filter((u: { isActive?: boolean }) => !u.isActive).length}
                            </p>
                        </div>
                        <XCircle className="text-red-400" size={32} />
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    />
                </div>
            </div>

            {isLoading && (
                <div className="text-center py-12">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-black dark:border-white border-r-transparent" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">A carregar utilizadores...</p>
                </div>
            )}

            {!isLoading && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Utilizador</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data de Criação</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {filteredUsers.map((user: { id: string; name: string; email: string; role: string; sectorId?: string; isActive: boolean; createdAt: string }) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{(user.name ?? '').charAt(0)}</span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-black dark:text-white">{user.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.role] ?? 'bg-gray-100 dark:bg-gray-800'}`}>
                                                {roleLabels[user.role] ?? user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'}`}>
                                                {user.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(user.createdAt).toLocaleDateString('pt-PT')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setQrUserId(user.id)}
                                                    className="text-black dark:text-gray-600 hover:text-blue-800 dark:hover:text-blue-300"
                                                    title="Ver QR Code"
                                                >
                                                    <QrCode size={18} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(user)}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                                                    title="Editar"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(user)}
                                                    disabled={deleteMutation.isPending}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-600 dark:text-gray-400">Nenhum utilizador encontrado</p>
                        </div>
                    )}
                </div>
            )}

            <Modal
                isOpen={isFormOpen}
                onClose={() => { setIsFormOpen(false); setEditingUser(null); }}
                title={editingUser ? 'Editar Utilizador' : 'Novo Utilizador'}
                size="2xl"
            >
                <UserForm
                    onSuccess={handleFormSuccess}
                    onCancel={() => { setIsFormOpen(false); setEditingUser(null); }}
                    initialData={editingUser ?? undefined}
                />
            </Modal>

            <Modal
                isOpen={!!qrUserId}
                onClose={() => setQrUserId(null)}
                title="QR Code"
                size="sm"
            >
                <div className="flex flex-col items-center">
                    {qrData?.qrCode ? (
                        <img src={qrData.qrCode} alt="QR Code" className="w-48 h-48 mx-auto object-contain" />
                    ) : (
                        <div className="w-48 h-48 flex items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-black dark:border-white border-r-transparent" />
                        </div>
                    )}
                    <div className="mt-6 w-full flex justify-center">
                        <button
                            type="button"
                            onClick={() => qrUserId && regenerateQrMutation.mutate(qrUserId)}
                            disabled={regenerateQrMutation.isPending}
                            className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                        >
                            {regenerateQrMutation.isPending ? 'A regenerar...' : 'Regenerar QR Code'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
