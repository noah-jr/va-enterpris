'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wrench, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { ServiceForm } from '@/components/admin/forms/service-form';

export default function ServicesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSector, setFilterSector] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<any>(null);
    const queryClient = useQueryClient();

    const { data: servicesData, isLoading, refetch } = useQuery({
        queryKey: ['admin-services'],
        queryFn: async () => {
            const response = await fetch('/api/services');
            if (!response.ok) throw new Error('Erro ao carregar serviços');
            return response.json();
        },
    });

    const { data: sectorsData } = useQuery({
        queryKey: ['admin-sectors-filter'],
        queryFn: async () => {
            const response = await fetch('/api/sectors');
            if (!response.ok) throw new Error('Erro ao carregar sectores');
            return response.json();
        },
    });

    const services = servicesData?.services || [];
    const sectors = sectorsData?.sectors || [];

    const filteredServices = services.filter((service: any) => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSector = !filterSector || service.sectorId === filterSector;
        return matchesSearch && matchesSector;
    });

    const handleCreate = () => {
        setEditingService(null);
        setIsModalOpen(true);
    };

    const handleEdit = (service: any) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        refetch();
    };

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Erro ao eliminar');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-services'] });
        },
    });

    const handleDelete = (service: { id: string; name: string }) => {
        if (!confirm(`Eliminar o serviço "${service.name}"? Esta ação não pode ser desfeita.`)) return;
        deleteMutation.mutate(service.id);
    };

    return (
        <div className="p-4 lg:p-8 space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                        Serviços
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gerir serviços oferecidos
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center space-x-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-black/90 dark:hover:bg-white/90 transition-all"
                >
                    <Plus size={20} />
                    <span>Novo Serviço</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
                            <p className="text-3xl font-bold text-black dark:text-white">{services.length}</p>
                        </div>
                        <Wrench className="text-gray-400" size={32} />
                    </div>
                </div>

                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Activos</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {services.filter((s: any) => s.isActive).length}
                            </p>
                        </div>
                        <Wrench className="text-green-400" size={32} />
                    </div>
                </div>

                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Inactivos</p>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                {services.filter((s: any) => !s.isActive).length}
                            </p>
                        </div>
                        <Wrench className="text-red-400" size={32} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Pesquisar serviços..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    />
                </div>

                <select
                    value={filterSector}
                    onChange={(e) => setFilterSector(e.target.value)}
                    className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                >
                    <option value="">Todos os Sectores</option>
                    {sectors.map((sector: any) => (
                        <option key={sector.id} value={sector.id}>
                            {sector.name}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading && (
                <div className="text-center py-12">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-black dark:border-white border-r-transparent"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">A carregar serviços...</p>
                </div>
            )}

            {!isLoading && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Serviço
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Sector
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Ordem
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {filteredServices.map((service: any) => (
                                    <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-black dark:text-white">
                                                    {service.name}
                                                </div>
                                                {service.description && (
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                                        {service.description}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {service.sector && (
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                                                    {service.sector.name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {service.order || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${service.isActive
                                                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                                                : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                                                }`}>
                                                {service.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    className="text-black dark:text-gray-600 hover:text-blue-800 dark:hover:text-blue-300"
                                                    title="Ver"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(service)}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                                                    title="Editar"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(service)}
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

                    {filteredServices.length === 0 && (
                        <div className="text-center py-12">
                            <Wrench className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-600 dark:text-gray-400">
                                Nenhum serviço encontrado
                            </p>
                        </div>
                    )}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingService ? "Editar Serviço" : "Novo Serviço"}
                size="2xl"
            >
                <ServiceForm
                    onSuccess={handleSuccess}
                    onCancel={() => setIsModalOpen(false)}
                    initialData={editingService}
                />
            </Modal>
        </div>
    );
}
