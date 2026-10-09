'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: {
        id: string;
        name: string;
        email: string;
        role: string;
        sectorId?: string;
        isActive: boolean;
    };
}

interface UserFormData {
    name: string;
    email: string;
    password: string;
    role: string;
    sectorId: string;
    isActive: boolean;
}

const ROLES = [
    { value: 'EMPLOYEE', label: 'Funcionário' },
    { value: 'EDITOR', label: 'Editor' },
    { value: 'SECTOR_MANAGER', label: 'Gestor de Sector' },
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
];

export function UserForm({ onSuccess, onCancel, initialData }: UserFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<UserFormData>({
        defaultValues: {
            name: initialData?.name ?? '',
            email: initialData?.email ?? '',
            password: '',
            role: initialData?.role ?? 'EMPLOYEE',
            sectorId: initialData?.sectorId ?? '',
            isActive: initialData?.isActive ?? true,
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

    const sectors = sectorsData?.sectors ?? [];

    const onSubmit = async (data: UserFormData) => {
        if (!initialData && !data.password) {
            setError('Password é obrigatória para novo utilizador');
            return;
        }
        if (initialData && data.password && data.password.length < 6) {
            setError('Password deve ter pelo menos 6 caracteres');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const url = initialData ? `/api/users/${initialData.id}` : '/api/users';
            const method = initialData ? 'PUT' : 'POST';
            const body: Record<string, unknown> = {
                name: data.name,
                email: data.email,
                role: data.role,
                sectorId: data.sectorId || undefined,
                isActive: data.isActive,
            };
            if (data.password) body.password = data.password;

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Identity Section - Left Column */}
                <div className="space-y-4 md:space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-100 dark:border-gray-800">
                        <h3 className="font-medium text-black dark:text-white mb-4">Identidade</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-black dark:text-white mb-2">Nome *</label>
                                <input
                                    {...register('name', { required: 'Nome é obrigatório' })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                                    placeholder="Nome completo"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black dark:text-white mb-2">Email *</label>
                                <input
                                    type="email"
                                    {...register('email', {
                                        required: 'Email é obrigatório',
                                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
                                    })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                                    placeholder="email@exemplo.pt"
                                    disabled={!!initialData}
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                                {initialData && <p className="mt-1 text-xs text-gray-500">Email não pode ser alterado</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                    Password {initialData ? '(deixar em branco para não alterar)' : '*'}
                                </label>
                                <input
                                    type="password"
                                    {...register('password')}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                                    placeholder={initialData ? '••••••••' : 'Mínimo 6 caracteres'}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Permissions Section - Right Column */}
                <div className="space-y-4 md:space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-100 dark:border-gray-800">
                        <h3 className="font-medium text-black dark:text-white mb-4">Permissões e Acesso</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-black dark:text-white mb-2">Perfil</label>
                                <select
                                    {...register('role')}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                                >
                                    {ROLES.map((r) => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black dark:text-white mb-2">Sector</label>
                                <select
                                    {...register('sectorId')}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                                >
                                    <option value="">Nenhum</option>
                                    {sectors.map((s: { id: string; name: string }) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-2">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        {...register('isActive')}
                                        className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black dark:border-gray-700 dark:bg-gray-900"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-black dark:text-white">
                                        Utilizador activo
                                    </label>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Utilizadores inativos não podem aceder ao sistema.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-950 pb-2 z-10">
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
                    <span>{initialData ? 'Atualizar' : 'Criar'} utilizador</span>
                </button>
            </div>
        </form>
    );
}
