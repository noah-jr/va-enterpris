'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Search, Mail, CheckCircle, Circle, Trash2 } from 'lucide-react';

export default function AdminContactsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterReplied, setFilterReplied] = useState('');
    const [selectedContact, setSelectedContact] = useState<{
        id: string;
        name: string;
        email: string;
        phone?: string;
        subject: string;
        message: string;
        isReplied: boolean;
        createdAt: string;
    } | null>(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['admin-contacts', filterReplied],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filterReplied === 'replied') params.set('isReplied', 'true');
            if (filterReplied === 'pending') params.set('isReplied', 'false');
            const res = await fetch(`/api/contact?${params.toString()}`);
            if (!res.ok) throw new Error('Erro ao carregar contactos');
            return res.json();
        },
    });

    const markRepliedMutation = useMutation({
        mutationFn: async ({ id, isReplied }: { id: string; isReplied: boolean }) => {
            const res = await fetch(`/api/contact/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isReplied,
                    repliedAt: isReplied ? new Date().toISOString() : null,
                }),
            });
            if (!res.ok) throw new Error('Erro ao atualizar');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
            if (selectedContact) {
                setSelectedContact((c) => (c ? { ...c, isReplied: !c.isReplied } : null));
            }
        },
    });

    const contacts = data?.contacts ?? [];
    const filtered = contacts.filter(
        (c: { name: string; email: string; subject: string }) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: contacts.length,
        pending: contacts.filter((c: { isReplied: boolean }) => !c.isReplied).length,
        replied: contacts.filter((c: { isReplied: boolean }) => c.isReplied).length,
    };

    return (
        <div className="p-4 lg:p-8 space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                    Contactos
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Mensagens do formulário de contacto
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
                            <p className="text-3xl font-bold text-black dark:text-white">{stats.total}</p>
                        </div>
                        <MessageSquare className="text-gray-400" size={32} />
                    </div>
                </div>
                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Por responder</p>
                            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
                        </div>
                        <Circle className="text-yellow-400" size={32} />
                    </div>
                </div>
                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Respondidas</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.replied}</p>
                        </div>
                        <CheckCircle className="text-green-400" size={32} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, email ou assunto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    />
                </div>
                <select
                    value={filterReplied}
                    onChange={(e) => setFilterReplied(e.target.value)}
                    className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                >
                    <option value="">Todos</option>
                    <option value="pending">Por responder</option>
                    <option value="replied">Respondidas</option>
                </select>
            </div>

            {isLoading && (
                <div className="text-center py-12">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-black dark:border-white border-r-transparent" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">A carregar contactos...</p>
                </div>
            )}

            {!isLoading && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assunto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {filtered.map((contact: { id: string; name: string; email: string; phone?: string; subject: string; message: string; isReplied: boolean; createdAt: string }) => (
                                    <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black dark:text-white">{contact.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{contact.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">{contact.subject}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{new Date(contact.createdAt).toLocaleDateString('pt-PT')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${contact.isReplied ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'}`}>
                                                {contact.isReplied ? 'Respondida' : 'Por responder'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => setSelectedContact(contact)}
                                                className="text-black dark:text-gray-600 hover:underline mr-3"
                                            >
                                                Ver
                                            </button>
                                            <button
                                                onClick={() => markRepliedMutation.mutate({ id: contact.id, isReplied: !contact.isReplied })}
                                                disabled={markRepliedMutation.isPending}
                                                className="text-gray-600 dark:text-gray-400 hover:underline disabled:opacity-50"
                                            >
                                                {contact.isReplied ? 'Marcar por responder' : 'Marcar respondida'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filtered.length === 0 && (
                        <div className="text-center py-12">
                            <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-600 dark:text-gray-400">Nenhum contacto encontrado</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal detalhes */}
            {selectedContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedContact(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 max-w-lg w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-black dark:text-white">Mensagem</h2>
                            <button onClick={() => setSelectedContact(null)} className="text-gray-500 hover:text-black dark:hover:text-white">✕</button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1"><strong className="text-black dark:text-white">Nome:</strong> {selectedContact.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1"><strong className="text-black dark:text-white">Email:</strong> {selectedContact.email}</p>
                        {selectedContact.phone && <p className="text-sm text-gray-600 dark:text-gray-400 mb-1"><strong className="text-black dark:text-white">Telefone:</strong> {selectedContact.phone}</p>}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2"><strong className="text-black dark:text-white">Assunto:</strong> {selectedContact.subject}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 whitespace-pre-wrap">{selectedContact.message}</p>
                        <button
                            onClick={() => markRepliedMutation.mutate({ id: selectedContact.id, isReplied: !selectedContact.isReplied })}
                            disabled={markRepliedMutation.isPending}
                            className="px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-black/90 dark:hover:bg-white/90"
                        >
                            {selectedContact.isReplied ? 'Marcar por responder' : 'Marcar como respondida'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
