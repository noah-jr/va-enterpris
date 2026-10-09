'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { SectorForm } from '@/components/admin/forms/sector-form';

export default function SectorsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSector, setEditingSector] = useState<any>(null);
    const queryClient = useQueryClient();

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['admin-sectors'],
        queryFn: async () => {
            const response = await fetch('/api/sectors');
            if (!response.ok) throw new Error('Erro ao carregar sectores');
            return response.json();
        },
    });

    const sectors = data?.sectors || [];

    const filteredSectors = sectors.filter((sector: any) =>
        sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sector.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setEditingSector(null);
        setIsModalOpen(true);
    };

    const handleEdit = (sector: any) => {
        setEditingSector(sector);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        refetch();
    };

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/sectors/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Erro ao eliminar');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-sectors'] });
            queryClient.invalidateQueries({ queryKey: ['admin-sectors-filter'] });
        },
    });

    const handleDelete = (sector: { id: string; name: string }) => {
        if (!confirm(`Eliminar o sector "${sector.name}"? Esta ação não pode ser desfeita.`)) return;
        deleteMutation.mutate(sector.id);
    };

    return (
        <div className="p-4 lg:p-8 space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                        Sectores
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gerir sectores de serviço
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center space-x-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-black/90 dark:hover:bg-white/90 transition-all"
                >
                    <Plus size={20} />
                    <span>Novo Sector</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total de Sectores</p>
                            <p className="text-3xl font-bold text-black dark:text-white">{sectors.length}</p>
                        </div>
                        <Building2 className="text-gray-400" size={32} />
                    </div>
                </div>

                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sectores Activos</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {sectors.filter((s: any) => s.isActive).length}
                            </p>
                        </div>
                        <Building2 className="text-green-400" size={32} />
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Pesquisar sectores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    />
                </div>
            </div>

            {isLoading && (
                <div className="text-center py-12">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-black dark:border-white border-r-transparent"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">A carregar sectores...</p>
                </div>
            )}

            {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSectors.map((sector: any) => (
                        <div
                            key={sector.id}
                            className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <Building2 size={24} className="text-black dark:text-white" />
                                </div>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${sector.isActive
                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                                    : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                                    }`}>
                                    {sector.isActive ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-black dark:text-white mb-2">
                                {sector.name}
                            </h3>

                            {sector.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 h-10 overflow-hidden text-ellipsis">
                                    {sector.description}
                                </p>
                            )}

                            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                                <button
                                    onClick={() => handleEdit(sector)}
                                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Edit size={16} />
                                    <span className="text-sm font-medium">Editar</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(sector)}
                                    disabled={deleteMutation.isPending}
                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                    title="Eliminar"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && filteredSectors.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600 dark:text-gray-400">
                        {searchTerm ? 'Nenhum sector encontrado' : 'Nenhum sector cadastrado'}
                    </p>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingSector ? "Editar Sector" : "Novo Sector"}
            >
                <SectorForm
                    onSuccess={handleSuccess}
                    onCancel={() => setIsModalOpen(false)}
                    initialData={editingSector}
                />
            </Modal>
        </div>
    );
}
