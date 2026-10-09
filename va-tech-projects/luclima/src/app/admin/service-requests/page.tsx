'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Search, Eye, Clock, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react';

const statusLabels: Record<string, string> = {
    NEW: 'Novo',
    IN_ANALYSIS: 'Em Análise',
    IN_EXECUTION: 'Em Execução',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
};

const statusColors: Record<string, string> = {
    NEW: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
    IN_ANALYSIS: 'bg-gray-100 dark:bg-gray-900/20 text-blue-800 dark:text-blue-300',
    IN_EXECUTION: 'bg-gray-100 dark:bg-gray-900/20 text-blue-800 dark:text-blue-300',
    COMPLETED: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
    CANCELLED: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300',
};

const statusIcons: Record<string, typeof Clock> = {
    NEW: Clock,
    IN_ANALYSIS: AlertCircle,
    IN_EXECUTION: AlertCircle,
    COMPLETED: CheckCircle,
    CANCELLED: XCircle,
};

export default function ServiceRequestsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [detailId, setDetailId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['admin-service-requests', filterStatus],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filterStatus) params.set('status', filterStatus);
            const response = await fetch(`/api/service-requests?${params.toString()}`);
            if (!response.ok) throw new Error('Erro ao carregar solicitações');
            return response.json();
        },
    });

    const requests = data?.requests ?? [];

    const filteredRequests = requests.filter((request: { name: string; email: string; service?: { name: string } }) => {
        const matchesSearch =
            request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (request.service?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const stats = {
        total: requests.length,
        pending: requests.filter((r: { status: string }) => r.status === 'NEW').length,
        inProgress: requests.filter((r: { status: string }) => r.status === 'IN_ANALYSIS' || r.status === 'IN_EXECUTION').length,
        completed: requests.filter((r: { status: string }) => r.status === 'COMPLETED').length,
    };

    const { data: detailData } = useQuery({
        queryKey: ['admin-service-request-detail', detailId],
        queryFn: async () => {
            if (!detailId) return null;
            const res = await fetch(`/api/service-requests/${detailId}`);
            if (!res.ok) throw new Error('Erro ao carregar');
            return res.json();
        },
        enabled: !!detailId,
    });

    const { data: usersData } = useQuery({
        queryKey: ['admin-users-list'],
        queryFn: async () => {
            const res = await fetch('/api/users?isActive=true');
            if (!res.ok) throw new Error('Erro ao carregar utilizadores');
            const data = await res.json();
            return data.users ?? [];
        },
    });
    const users = usersData ?? [];

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const res = await fetch(`/api/service-requests/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error('Erro ao atualizar');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-service-requests'] });
            queryClient.invalidateQueries({ queryKey: ['admin-service-request-detail', detailId] });
        },
    });

    const updateAssigneeMutation = useMutation({
        mutationFn: async ({ id, assignedToId }: { id: string; assignedToId: string | null }) => {
            const res = await fetch(`/api/service-requests/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignedToId: assignedToId || null }),
            });
            if (!res.ok) throw new Error('Erro ao atualizar responsável');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-service-requests'] });
            queryClient.invalidateQueries({ queryKey: ['admin-service-request-detail', detailId] });
        },
    });

    const deleteRequestMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/service-requests/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erro ao eliminar');
        },
        onSuccess: () => {
            setDetailId(null);
            queryClient.invalidateQueries({ queryKey: ['admin-service-requests'] });
        },
    });

    const detailRequest = detailData;

    return (
        <div className="p-4 lg:p-8 space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                    Solicitações de Serviço
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Gerir pedidos de serviço dos clientes
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
                            <p className="text-3xl font-bold text-black dark:text-white">{stats.total}</p>
                        </div>
                        <FileText className="text-gray-400" size={32} />
                    </div>
                </div>

                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Novos</p>
                            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
                        </div>
                        <Clock className="text-yellow-400" size={32} />
                    </div>
                </div>

                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Em Progresso</p>
                            <p className="text-3xl font-bold text-black dark:text-gray-600">{stats.inProgress}</p>
                        </div>
                        <AlertCircle className="text-gray-600" size={32} />
                    </div>
                </div>

                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Concluídos</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
                        </div>
                        <CheckCircle className="text-green-400" size={32} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, email ou serviço..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    />
                </div>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                >
                    <option value="">Todos os Status</option>
                    <option value="NEW">Novo</option>
                    <option value="IN_ANALYSIS">Em Análise</option>
                    <option value="IN_EXECUTION">Em Execução</option>
                    <option value="COMPLETED">Concluído</option>
                    <option value="CANCELLED">Cancelado</option>
                </select>
            </div>

            {isLoading && (
                <div className="text-center py-12">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-black dark:border-white border-r-transparent" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">A carregar solicitações...</p>
                </div>
            )}

            {!isLoading && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Serviço
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Sector
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Responsável
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Data
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {filteredRequests.map((request: { id: string; name: string; email: string; phone: string; service?: { name: string }; sector?: { name: string }; assignedTo?: { name: string } | null; status: string; createdAt: string }) => {
                                    const StatusIcon = statusIcons[request.status] ?? Clock;
                                    return (
                                        <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-black dark:text-white">
                                                        {request.name}
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        {request.email}
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        {request.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-black dark:text-white">
                                                    {request.service?.name ?? '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                                                    {request.sector?.name ?? '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {request.assignedTo?.name ?? '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex items-center space-x-1 text-xs leading-5 font-semibold rounded-full ${statusColors[request.status] ?? 'bg-gray-100 dark:bg-gray-800'}`}>
                                                    <StatusIcon size={14} />
                                                    <span>{statusLabels[request.status] ?? request.status}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(request.createdAt).toLocaleDateString('pt-PT')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => setDetailId(request.id)}
                                                    className="text-black dark:text-gray-600 hover:underline"
                                                    title="Ver Detalhes"
                                                >
                                                    <Eye size={18} className="inline" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filteredRequests.length === 0 && (
                        <div className="text-center py-12">
                            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-600 dark:text-gray-400">
                                Nenhuma solicitação encontrada
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal detalhes + mudar status */}
            {detailId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDetailId(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold text-black dark:text-white">Detalhe da Solicitação</h2>
                                <button type="button" onClick={() => setDetailId(null)} className="text-gray-500 hover:text-black dark:hover:text-white">✕</button>
                            </div>
                            {detailRequest ? (
                                <>
                                    <div className="space-y-3 text-sm mb-6">
                                        <p><strong className="text-black dark:text-white">Nome:</strong> <span className="text-gray-600 dark:text-gray-400">{detailRequest.name}</span></p>
                                        <p><strong className="text-black dark:text-white">Email:</strong> <span className="text-gray-600 dark:text-gray-400">{detailRequest.email}</span></p>
                                        <p><strong className="text-black dark:text-white">Telefone:</strong> <span className="text-gray-600 dark:text-gray-400">{detailRequest.phone}</span></p>
                                        <p><strong className="text-black dark:text-white">Serviço:</strong> <span className="text-gray-600 dark:text-gray-400">{detailRequest.service?.name ?? '-'}</span></p>
                                        <p><strong className="text-black dark:text-white">Sector:</strong> <span className="text-gray-600 dark:text-gray-400">{detailRequest.sector?.name ?? '-'}</span></p>
                                        <p><strong className="text-black dark:text-white">Responsável:</strong>{' '}
                                            <span className="text-gray-600 dark:text-gray-400">{(detailRequest as { assignedTo?: { name: string } }).assignedTo?.name ?? 'Não atribuído'}</span>
                                        </p>
                                        <p><strong className="text-black dark:text-white">Descrição:</strong></p>
                                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap pl-0">{detailRequest.description}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                                        <div className="w-full sm:w-auto">
                                            <span className="block text-sm font-medium text-black dark:text-white mb-1">Status:</span>
                                            <select
                                                value={detailRequest.status}
                                                onChange={(e) => updateStatusMutation.mutate({ id: detailId, status: e.target.value })}
                                                disabled={updateStatusMutation.isPending}
                                                className="w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white text-sm focus:ring-2 focus:ring-black dark:focus:ring-white"
                                            >
                                                <option value="NEW">Novo</option>
                                                <option value="IN_ANALYSIS">Em Análise</option>
                                                <option value="IN_EXECUTION">Em Execução</option>
                                                <option value="COMPLETED">Concluído</option>
                                                <option value="CANCELLED">Cancelado</option>
                                            </select>
                                        </div>

                                        <div className="w-full sm:w-auto">
                                            <span className="block text-sm font-medium text-black dark:text-white mb-1">Responsável:</span>
                                            <select
                                                value={(detailRequest as { assignedToId?: string | null }).assignedToId ?? ''}
                                                onChange={(e) => updateAssigneeMutation.mutate({ id: detailId, assignedToId: e.target.value || null })}
                                                disabled={updateAssigneeMutation.isPending}
                                                className="w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white text-sm focus:ring-2 focus:ring-black dark:focus:ring-white"
                                            >
                                                <option value="">Nenhum</option>
                                                {users.map((u: { id: string; name: string }) => (
                                                    <option key={u.id} value={u.id}>{u.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => confirm('Eliminar esta solicitação?') && deleteRequestMutation.mutate(detailId)}
                                            disabled={deleteRequestMutation.isPending}
                                            className="ml-auto flex items-center gap-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mt-4 sm:mt-0"
                                        >
                                            <Trash2 size={16} />
                                            Eliminar
                                        </button>
                                    </div>
                                    <div className="mt-2 text-right">
                                        {(updateStatusMutation.isPending || updateAssigneeMutation.isPending) && (
                                            <span className="text-sm text-gray-500">A guardar...</span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="py-8 text-center">
                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-black dark:border-white border-r-transparent" />
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">A carregar...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
