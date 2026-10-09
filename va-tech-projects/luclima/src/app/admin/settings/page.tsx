'use client';

import { useQuery } from '@tanstack/react-query';
import { ProfileForm } from '@/components/admin/forms/profile-form';
import { Settings, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminSettingsPage() {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const t = localStorage.getItem('token');
        setToken(t);
    }, []);

    const { data: userData, isLoading, refetch } = useQuery({
        queryKey: ['auth-me'],
        queryFn: async () => {
            if (!token) return null;
            const res = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Erro ao carregar dados do utilizador');
            return res.json();
        },
        enabled: !!token,
    });

    const user = userData?.user;

    return (
        <div className="p-4 lg:p-8 space-y-6">
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                Configurações
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
                Gerir perfil e preferências
            </p>

            <div className="max-w-4xl">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
                            <User size={22} />
                            Perfil
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Atualize as suas informações pessoais e credenciais
                        </p>
                    </div>

                    <div className="p-6">
                        {isLoading ? (
                            <div className="py-12 text-center">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-black dark:border-white border-r-transparent" />
                            </div>
                        ) : user ? (
                            <ProfileForm user={user} onSuccess={() => {
                                refetch();
                                alert('Perfil atualizado com sucesso!');
                            }} />
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                Não foi possível carregar os dados do utilizador.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
