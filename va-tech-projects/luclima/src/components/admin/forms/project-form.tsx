'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

interface ProjectFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: {
        id: string;
        title: string;
        description: string;
        images: string[];
        sectorId: string;
        userId: string;
        status: string;
    };
}

interface ProjectFormData {
    title: string;
    description: string;
    imagesText: string;
    sectorId: string;
    userId: string;
    status: string;
}

const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Activo' },
    { value: 'COMPLETED', label: 'Concluído' },
    { value: 'ARCHIVED', label: 'Arquivado' },
];

export function ProjectForm({ onSuccess, onCancel, initialData }: ProjectFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<ProjectFormData>({
        defaultValues: {
            title: initialData?.title ?? '',
            description: initialData?.description ?? '',
            imagesText: (initialData?.images ?? []).join('\n'),
            sectorId: initialData?.sectorId ?? '',
            userId: initialData?.userId ?? '',
            status: initialData?.status ?? 'ACTIVE',
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

    const { data: usersData } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const res = await fetch('/api/users');
            if (!res.ok) throw new Error('Erro ao carregar utilizadores');
            return res.json();
        },
    });

    const sectors = sectorsData?.sectors ?? [];
    const users = usersData?.users ?? [];

    const onSubmit = async (data: ProjectFormData) => {
        setLoading(true);
        setError('');
        try {
            const images = data.imagesText
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean);

            const url = initialData ? `/api/projects/${initialData.id}` : '/api/projects';
            const method = initialData ? 'PUT' : 'POST';
            const body = initialData
                ? { title: data.title, description: data.description, images, status: data.status }
                : { title: data.title, description: data.description, images, sectorId: data.sectorId, userId: data.userId, status: data.status };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Erro ao gravar');
            onSuccess();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao gravar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Main Content - Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 lg:p-6 rounded-xl border border-gray-100 dark:border-gray-800 space-y-6">
                        <h3 className="font-medium text-black dark:text-white mb-2">Sobre o Projecto</h3>

                        <div>
                            <label className="block text-sm font-medium text-black dark:text-white mb-2">Título *</label>
                            <input
                                {...register('title', { required: 'Título é obrigatório' })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                                placeholder="Título do projecto"
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black dark:text-white mb-2">Descrição</label>
                            <textarea
                                {...register('description')}
                                rows={5}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none resize-none"
                                placeholder="Descrição detalhada do projecto..."
                            />
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 p-4 lg:p-6 rounded-xl border border-gray-100 dark:border-gray-800 space-y-6">
                        <h3 className="font-medium text-black dark:text-white mb-2">Galeria</h3>
                        <div>
                            <label className="block text-sm font-medium text-black dark:text-white mb-2">URLs das imagens (uma por linha)</label>
                            <textarea
                                {...register('imagesText')}
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none font-mono text-sm resize-none"
                                placeholder="https://exemplo.com/imagem1.jpg&#10;https://exemplo.com/imagem2.jpg"
                            />
                            <p className="mt-2 text-xs text-gray-500">Insira os links diretos para as imagens do projeto.</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Right Column (1/3) */}
                <div className="space-y-4 lg:space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 lg:p-6 rounded-xl border border-gray-100 dark:border-gray-800 space-y-6">
                        <h3 className="font-medium text-black dark:text-white mb-2">Associação</h3>

                        <div>
                            <label className="block text-sm font-medium text-black dark:text-white mb-2">Sector *</label>
                            <select
                                {...register('sectorId', { required: !initialData ? 'Sector é obrigatório' : false })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                                disabled={!!initialData}
                            >
                                <option value="">Selecione o sector</option>
                                {sectors.map((s: { id: string; name: string }) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            {errors.sectorId && <p className="mt-1 text-sm text-red-500">{errors.sectorId.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black dark:text-white mb-2">Responsável *</label>
                            <select
                                {...register('userId', { required: !initialData ? 'Responsável é obrigatório' : false })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                                disabled={!!initialData}
                            >
                                <option value="">Selecione o responsável</option>
                                {users.map((u: { id: string; name: string }) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                            {errors.userId && <p className="mt-1 text-sm text-red-500">{errors.userId.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black dark:text-white mb-2">Estado</label>
                            <select
                                {...register('status')}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                            >
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-black/90 dark:hover:bg-white/90 transition-all disabled:opacity-50"
                >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    <span>{initialData ? 'Atualizar' : 'Criar'} projecto</span>
                </button>
            </div>
        </form>
    );
}
