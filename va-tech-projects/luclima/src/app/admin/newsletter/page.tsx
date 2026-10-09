'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Search, Download, Trash2, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';

export default function NewsletterPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [campaignData, setCampaignData] = useState({ subject: '', content: '' });
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['admin-newsletter', filterStatus],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filterStatus === 'active') params.set('isActive', 'true');
            if (filterStatus === 'inactive') params.set('isActive', 'false');
            const response = await fetch(`/api/newsletter/subscribers?${params.toString()}`);
            if (!response.ok) throw new Error('Erro ao carregar subscritores');
            return response.json();
        },
    });

    const sendCampaignMutation = useMutation({
        mutationFn: async (data: { subject: string; content: string }) => {
            const res = await fetch('/api/newsletter/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Erro ao enviar campanha');
            return res.json();
        },
        onSuccess: (data) => {
            alert(data.message);
            setIsCampaignModalOpen(false);
            setCampaignData({ subject: '', content: '' });
        },
        onError: (error: any) => {
            alert(error.message);
        }
    });

    const deleteSubscriberMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/newsletter/subscribers?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erro ao remover subscritor');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-newsletter'] });
        },
    });

    const subscribers = data?.subscribers ?? [];

    const filteredSubscribers = subscribers.filter((sub: { email: string; isActive: boolean }) => {
        const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            !filterStatus ||
            (filterStatus === 'active' && sub.isActive) ||
            (filterStatus === 'inactive' && !sub.isActive);
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: subscribers.length,
        active: subscribers.filter((s: { isActive: boolean }) => s.isActive).length,
        inactive: subscribers.filter((s: { isActive: boolean }) => !s.isActive).length,
    };

    const handleExport = () => {
        const csv = ['Email,Status,Data de Subscrição'];
        filteredSubscribers.forEach((sub: { email: string; isActive: boolean; subscribedAt: string }) => {
            csv.push(`${sub.email},${sub.isActive ? 'Activo' : 'Inactivo'},${new Date(sub.subscribedAt).toLocaleDateString('pt-PT')}`);
        });

        const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newsletter-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="p-4 lg:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                        Newsletter
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gerir subscritores e enviar campanhas
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
                    >
                        <Download size={18} />
                        <span>Exportar</span>
                    </button>
                    <button
                        onClick={() => setIsCampaignModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-all shadow-lg"
                    >
                        <Send size={18} />
                        <span>Enviar Campanha</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Subscritores</p>
                            <p className="text-3xl font-bold text-black dark:text-white">{stats.total}</p>
                        </div>
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <Mail className="text-gray-500" size={24} />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Activos</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <CheckCircle className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Inactivos</p>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.inactive}</p>
                        </div>
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <XCircle className="text-red-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Pesquisar por email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
                    />
                </div>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white shadow-sm"
                >
                    <option value="">Todos os Status</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                </select>
            </div>

            {isLoading && (
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-black dark:text-white" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">A carregar subscritores...</p>
                </div>
            )}

            {!isLoading && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Data de Subscrição
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {filteredSubscribers.map((subscriber: { id: string; email: string; isActive: boolean; subscribedAt: string }) => (
                                    <tr key={subscriber.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3 text-gray-500 font-bold text-xs uppercase">
                                                    {subscriber.email.charAt(0)}
                                                </div>
                                                <div className="text-sm font-medium text-black dark:text-white">
                                                    {subscriber.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 inline-flex items-center gap-1 text-[11px] font-bold uppercase rounded-full ${subscriber.isActive
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                }`}>
                                                {subscriber.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 underline-offset-4 font-medium">
                                            {new Date(subscriber.subscribedAt).toLocaleDateString('pt-PT')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => confirm('Remover subscritor?') && deleteSubscriberMutation.mutate(subscriber.id)}
                                                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                title="Remover"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredSubscribers.length === 0 && (
                        <div className="text-center py-20">
                            <Mail className="mx-auto text-gray-200 dark:text-gray-800 mb-4" size={64} />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                                Nenhum subscritor encontrado
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Campaign Modal */}
            <Modal
                isOpen={isCampaignModalOpen}
                onClose={() => setIsCampaignModalOpen(false)}
                title="Nova Campanha de Newsletter"
                size="lg"
            >
                <form onSubmit={(e) => {
                    e.preventDefault();
                    sendCampaignMutation.mutate(campaignData);
                }} className="space-y-4 pt-4">
                    <div>
                        <label className="block text-sm font-bold text-black dark:text-white mb-2 uppercase tracking-tight">Assunto</label>
                        <input
                            type="text"
                            required
                            value={campaignData.subject}
                            onChange={(e) => setCampaignData(prev => ({ ...prev, subject: e.target.value }))}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                            placeholder="Ex: Novidades da Luclima - Outubro"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-black dark:text-white mb-2 uppercase tracking-tight">Conteúdo (HTML ou Texto)</label>
                        <textarea
                            required
                            rows={10}
                            value={campaignData.content}
                            onChange={(e) => setCampaignData(prev => ({ ...prev, content: e.target.value }))}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all resize-none"
                            placeholder="Escreva a mensagem aqui..."
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-6">
                        <button
                            type="button"
                            onClick={() => setIsCampaignModalOpen(false)}
                            className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors uppercase"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={sendCampaignMutation.isPending}
                            className="flex items-center gap-2 px-8 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 uppercase shadow-lg"
                        >
                            {sendCampaignMutation.isPending ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>A enviar...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    <span>Enviar Agora</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
