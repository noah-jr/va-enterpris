'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Camera, X } from 'lucide-react';
import Image from 'next/image';

interface ProfileFormProps {
    user: {
        id: string;
        name: string;
        email: string;
        avatar?: string | null;
        role?: string;
    };
    onSuccess: () => void;
}

interface ProfileFormData {
    name: string;
    email: string;
    password?: string;
    confirmPassword?: string;
    avatar?: string;
}

export function ProfileForm({ user, onSuccess }: ProfileFormProps) {
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProfileFormData>({
        defaultValues: {
            name: user.name,
            email: user.email,
            avatar: user.avatar || '',
        },
    });

    const avatar = watch('avatar');
    const password = watch('password');

    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Falha no upload');

            setValue('avatar', data.url);
        } catch (err: unknown) {
            console.error(err);
            alert(err instanceof Error ? err.message : 'Erro ao fazer upload da foto de perfil');
        } finally {
            setUploadingImage(false);
        }
    }, [setValue]);

    const onSubmit = async (data: ProfileFormData) => {
        if (data.password && data.password !== data.confirmPassword) {
            setError('As passwords não coincidem');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const body: Record<string, unknown> = {
                name: data.name,
                email: data.email,
                avatar: data.avatar,
            };

            if (data.password) {
                body.password = data.password;
            }

            const res = await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Erro ao atualizar perfil');

            // Update local storage user data if needed?
            // Usually not robust, but we can try to refresh context.
            // For now just call onSuccess.
            onSuccess();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="flex flex-col items-center justify-center mb-6 md:mb-8">
                <div className="relative group rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl h-24 w-24 md:h-32 md:w-32 bg-gray-100 dark:bg-gray-800">
                    {avatar ? (
                        <Image
                            src={avatar}
                            alt="Avatar"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full w-full text-gray-400">
                            <Camera size={40} />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="text-white" size={24} />
                    </div>

                    {uploadingImage && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                            <Loader2 className="animate-spin text-white" size={24} />
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        disabled={uploadingImage}
                    />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Clique para alterar a foto</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">Nome</label>
                    <input
                        {...register('name', { required: 'Nome é obrigatório' })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">Email</label>
                    <input
                        type="email"
                        {...register('email', { required: 'Email é obrigatório' })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                        disabled // Typically users shouldn't change email easily without verification
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        Nova Password
                    </label>
                    <input
                        type="password"
                        {...register('password', { minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                        placeholder="••••••••"
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        Confirmar Password
                    </label>
                    <input
                        type="password"
                        {...register('confirmPassword', {
                            validate: (val) => !password || val === password || 'As passwords não coincidem'
                        })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                        placeholder="••••••••"
                    />
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-black/90 dark:hover:bg-white/90 transition-all disabled:opacity-50"
                >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    <span>Guardar Alterações</span>
                </button>
            </div>
        </form>
    );
}
