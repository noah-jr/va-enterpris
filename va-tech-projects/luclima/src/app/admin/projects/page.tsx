'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/modal';
import { ProjectForm } from '@/components/admin/forms/project-form';
import { Briefcase, Plus, Search, Edit, Trash2, Image } from 'lucide-react';

const statusLabels: Record<string, string> = {
    ACTIVE: 'Activo',
    COMPLETED: 'Concluído',
    ARCHIVED: 'Arquivado',
};

const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
    COMPLETED: 'bg-gray-100 dark:bg-gray-900/20 text-blue-800 dark:text-blue-300',
    ARCHIVED: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
};

export default function AdminProjectsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSector, setFilterSector] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<{
        id: string;
        title: string;
        description: string;
        images: string[];
        sectorId: string;
        userId: string;
        status: string;
    } | null>(null);
    const queryClient = useQueryClient();

    const { data: projectsData, isLoading } = useQuery({
        queryKey: ['admin-projects', filterSector, filterStatus],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filterSector) params.set('sectorId', filterSector);
            if (filterStatus) params.set('status', filterStatus);
            const res = await fetch(`/api/projects?${params.toString()}`);
            if (!res.ok) throw new Error('Erro ao carregar projectos');
            return res.json();
        },
    });

    const { data: sectorsData } = useQuery({
        queryKey: ['admin-sectors'],
        queryFn: async () => {
            const res = await fetch('/api/sectors');
            if (!res.ok) throw new Error('Erro ao carregar sectores');
            return res.json();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Erro ao eliminar');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
        },
    });

    const projects = projectsData?.projects ?? [];
    const sectors = sectorsData?.sectors ?? [];

    const filteredProjects = projects.filter(
        (p: { title: string; description?: string }) =>
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.description ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setEditingProject(null);
        setIsFormOpen(true);
    };

    const handleEdit = (project: { id: string; title: string; description: string; images: string[]; sectorId: string; userId: string; status: string }) => {
        setEditingProject(project);
        setIsFormOpen(true);
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setEditingProject(null);
        queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    };

    const handleDelete = (project: { id: string; title: string }) => {
        if (!confirm(`Eliminar o projecto "${project.title}"?`)) return;
        deleteMutation.mutate(project.id);
    };

    return (
        <div className="p-4 lg:p-8 space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                        Projectos
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gestão do portfólio de projectos
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center space-x-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-black/90 dark:hover:bg-white/90 transition-all"
                >
                    <Plus size={20} />
                    <span>Novo Projecto</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
                            <p className="text-3xl font-bold text-black dark:text-white">{projects.length}</p>
                        </div>
                        <Briefcase className="text-gray-400" size={32} />
                    </div>
                </div>
                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Activos</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {projects.filter((p: { status: string }) => p.status === 'ACTIVE').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Concluídos</p>
                            <p className="text-3xl font-bold text-black dark:text-gray-600">
                                {projects.filter((p: { status: string }) => p.status === 'COMPLETED').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Pesquisar projectos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <select
                        value={filterSector}
                        onChange={(e) => setFilterSector(e.target.value)}
                        className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    >
                        <option value="">Todos os sectores</option>
                        {sectors.map((s: { id: string; name: string }) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    >
                        <option value="">Todos os estados</option>
                        <option value="ACTIVE">Activo</option>
                        <option value="COMPLETED">Concluído</option>
                        <option value="ARCHIVED">Arquivado</option>
                    </select>
                </div>
            </div>

            {isLoading && (
                <div className="text-center py-12">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-black dark:border-white border-r-transparent" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">A carregar projectos...</p>
                </div>
            )}

            {!isLoading && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Projecto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sector</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Responsável</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Imagens</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {filteredProjects.map((project: { id: string; title: string; description?: string; images: string[]; sectorId: string; userId: string; sector?: { name: string }; user?: { name: string }; status: string }) => (
                                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-black dark:text-white">{project.title}</div>
                                            {project.description && (
                                                <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{project.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {project.sector?.name ?? '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {project.user?.name ?? '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[project.status] ?? 'bg-gray-100 dark:bg-gray-800'}`}>
                                                {statusLabels[project.status] ?? project.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {(project.images ?? []).length} <Image size={14} className="inline" />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit({ id: project.id, title: project.title, description: project.description ?? '', images: project.images ?? [], sectorId: project.sectorId, userId: project.userId, status: project.status })}
                                                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mr-3"
                                                title="Editar"
                                            >
                                                <Edit size={18} className="inline" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(project)}
                                                disabled={deleteMutation.isPending}
                                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} className="inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredProjects.length === 0 && (
                        <div className="text-center py-12">
                            <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-600 dark:text-gray-400">Nenhum projecto encontrado</p>
                        </div>
                    )}
                </div>
            )}

            <Modal
                isOpen={isFormOpen}
                onClose={() => { setIsFormOpen(false); setEditingProject(null); }}
                title={editingProject ? 'Editar Projecto' : 'Novo Projecto'}
                size="5xl"
            >
                <ProjectForm
                    onSuccess={handleFormSuccess}
                    onCancel={() => { setIsFormOpen(false); setEditingProject(null); }}
                    initialData={editingProject ?? undefined}
                />
            </Modal>
        </div>
    );
}
