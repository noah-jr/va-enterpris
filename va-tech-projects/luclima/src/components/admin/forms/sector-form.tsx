'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

interface SectorFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: {
        id: string;
        name: string;
        description?: string;
        isActive: boolean;
    };
}

interface SectorFormData {
    name: string;
    description: string;
    isActive: boolean;
}

export function SectorForm({ onSuccess, onCancel, initialData }: SectorFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<SectorFormData>({
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || '',
            isActive: initialData?.isActive ?? true,
        }
    });

    const onSubmit = async (data: SectorFormData) => {
        setLoading(true);
        setError('');

        try {
            const url = initialData
                ? `/api/sectors/${initialData.id}`
                : '/api/sectors';

            const method = initialData ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Erro ao salvar sector');
            }

            onSuccess();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao salvar sector');
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

            <div className="bg-gray-50 dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4 md:space-y-6">
                <h3 className="font-medium text-black dark:text-white mb-2">Detalhes do Sector</h3>

                <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        Nome do Sector *
                    </label>
                    <input
                        {...register('name', { required: 'Nome é obrigatório' })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                        placeholder="Ex: Residencial"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        Descrição
                    </label>
                    <textarea
                        {...register('description')}
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none resize-none"
                        placeholder="Breve descrição do sector..."
                    />
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
                            Sector Activo
                        </label>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Sectores inativos não serão exibidos nas listagens públicas.</p>
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
                    <span>{initialData ? 'Atualizar' : 'Criar'} Sector</span>
                </button>
            </div>
        </form>
    );
}
