'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { LogIn, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

interface LoginForm {
    email: string;
    password: string;
}

function LoginFormInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get('from');
    const redirectTo = from?.startsWith('/admin') ? from : '/admin';
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

    const onSubmit = async (data: LoginForm) => {
        setStatus('loading');
        setErrorMessage('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                router.push(redirectTo);
            } else {
                setStatus('error');
                setErrorMessage(result.error || 'Erro ao fazer login');
            }
        } catch (error) {
            setStatus('error');
            setErrorMessage('Erro ao processar login');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#050505] flex flex-col lg:flex-row font-sans">
            {/* Left Side: Technical Branding */}
            <div className="lg:w-1/2 bg-black relative p-12 lg:p-24 flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    <div className="h-full w-full bg-gradient-to-br from-black/20 to-transparent" />
                </div>

                <div className="relative z-10">
                    <Logo className="mb-12 scale-125 origin-left" />
                    <div className="space-y-6 max-w-lg">
                        <div className="h-1 w-20 bg-black" />
                        <h1 className="font-space text-5xl lg:text-7xl font-black text-white leading-tight uppercase tracking-tighter">
                            Technical <br />
                            <span className="text-black">Access.</span>
                        </h1>
                        <p className="text-gray-500 text-lg font-medium leading-relaxed">
                            Controle e gestão de infraestruturas de climatização Luclima. Portal restrito a pessoal autorizado e técnicos de campo.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                    <div>
                        <p className="text-white mb-2">Secure Connection</p>
                        <p>TLS 1.3 Active</p>
                    </div>
                    <div>
                        <p className="text-white mb-2">System Status</p>
                        <p className="text-gray-900">All Nodes Online</p>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-24 bg-gray-50 dark:bg-[#080808]">
                <div className="w-full max-w-md">
                    <div className="mb-12">
                        <h2 className="font-space text-3xl font-black text-black dark:text-white uppercase tracking-tighter mb-4">
                            System Authentication
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            Introduza as suas credenciais para validar a sessão.
                        </p>
                    </div>

                    {status === 'error' && (
                        <div className="mb-8 p-4 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-3">
                            <AlertCircle size={18} />
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black italic">User Identity</label>
                            <input
                                type="email"
                                {...register('email', {
                                    required: 'Email é obrigatório',
                                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' }
                                })}
                                className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-800 py-4 focus:border-black outline-none transition-all font-bold text-xl placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                placeholder="ADMIN@LUCLIMA.PT"
                            />
                            {errors.email && (
                                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black italic">Secure Passkey</label>
                            <input
                                type="password"
                                {...register('password', { required: 'Password é obrigatória' })}
                                className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-800 py-4 focus:border-black outline-none transition-all font-bold text-xl placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">{errors.password.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full py-8 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.4em] text-[10px] hover:bg-black dark:hover:bg-black dark:hover:text-white transition-all flex items-center justify-center gap-6 group"
                        >
                            {status === 'loading' ? (
                                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Log In to Node
                                    <LogIn size={20} className="group-hover:translate-x-2 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-800">
                        <Link
                            href="/"
                            className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2"
                        >
                            <span>← Return to Public Terminal</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-solid border-gray-300 border-r-transparent" />
            </div>
        }>
            <LoginFormInner />
        </Suspense>
    );
}
