import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';
import { useLogin } from '../auth/useAuth';
import api from '../api';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const login = useLogin();

    const [step, setStep] = useState<'EMAIL' | 'PASSWORD'>('EMAIL');

    const { data: stats } = useQuery({
        queryKey: ['public-stats'],
        queryFn: async () => (await api.get('/auth/public-stats')).data,
    });

    const formatStat = (num: number) => {
        if (!num) return '0+';
        if (num >= 1000) return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K+`;
        return `${num}+`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 'EMAIL') {
            if (email) setStep('PASSWORD');
            return;
        }
        login.mutate({ email, password });
    };

    return (
        <div className="min-h-screen bg-[#09090b] flex">
            {/* ── Left Panel - Visual Brand ── */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-6 sm:p-12">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-[#09090b] to-purple-950" />
                <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-2xl" />

                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: 'linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)',
                    backgroundSize: '48px 48px'
                }} />

                <Link to="/" className="relative flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <img src="/logo_full.png" alt="VA ONEGEST" className="h-12 w-auto object-contain" />
                </Link>

                {/* Conteúdo central */}
                <div className="relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
                        <ShieldCheck size={16} /> Portal seguro
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
                        Gira a sua<br />
                        <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            empresa,<br />sem limites.
                        </span>
                    </h1>
                    <p className="text-zinc-400 text-lg leading-relaxed max-w-sm">
                        Faturação, Clientes, Produtos e muito mais — tudo numa plataforma pensada para Angola.
                    </p>

                    <div className="grid grid-cols-3 gap-4 mt-10">
                        {[
                            { value: stats?.companies ? formatStat(stats.companies) : '500+', label: 'Empresas' },
                            { value: stats?.invoices ? formatStat(stats.invoices) : '50K+', label: 'Faturas' },
                            { value: stats?.uptime || '99.9%', label: 'Disponibilidade' },
                        ].map(({ value, label }) => (
                            <div key={label} className="bg-white/5 border border-white/10 rounded-[var(--radius-md)] p-4 backdrop-blur-sm">
                                <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
                                <p className="text-zinc-500 text-sm">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rodapé */}
                <div className="relative text-zinc-600 text-sm">
                    © 2026 VA ONEGEST · Todos os direitos reservados
                </div>
            </div>

            {/* ── Painel Direito - Formulário ── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-md">
                    {/* Logótipo mobile */}
                    <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="VA ONEGEST" className="h-12 w-auto object-contain" />
                    </Link>

                    <div className="mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Bem-vindo</h2>
                        <p className="text-zinc-500">Inicie sessão para aceder ao seu painel.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        {step === 'EMAIL' ? (
                            <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                                <label className="block text-sm font-medium text-zinc-400">Email</label>
                                <input
                                    id="login-email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="exemplo@empresa.co.ao"
                                    required
                                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-[var(--radius-sm)] px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600"
                                />
                            </div>
                        ) : (
                            <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                                {/* Selected Email Display */}
                                <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 rounded-[var(--radius-sm)] px-4 py-3 mb-4">
                                    <span className="text-sm font-medium text-zinc-300">{email}</span>
                                    <button type="button" onClick={() => setStep('EMAIL')} className="text-xs text-indigo-400 font-bold hover:text-indigo-300">Alterar</button>
                                </div>
                                
                                {/* Palavra-passe */}
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-zinc-400">Palavra-passe</label>
                                </div>
                                <div className="relative">
                                    <input
                                        id="login-password"
                                        type={showPwd ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••••"
                                        required
                                        className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-[var(--radius-sm)] px-4 py-3 pr-12 text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd(v => !v)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                    >
                                        {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={login.isPending || (step === 'EMAIL' && !email)}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-[var(--radius-sm)] px-4 py-3.5 flex items-center justify-center gap-2 transition-all"
                        >
                            {login.isPending ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {step === 'EMAIL' ? 'Continuar' : (
                                        <>
                                            <LogIn size={18} />
                                            Entrar
                                        </>
                                    )}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divisor */}
                    <div className="relative my-7">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-3 bg-[#09090b] text-zinc-600">ou</span>
                        </div>
                    </div>

                    {/* Criar conta */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-[var(--radius-md)] p-5 text-center">
                        <p className="text-zinc-400 text-sm mb-3">
                            Ainda não tem conta? Experimente grátis durante <span className="text-indigo-400 font-semibold">14 dias</span>.
                        </p>
                        <Link
                            to="/register"
                            className="block w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold rounded-[var(--radius-sm)] px-4 py-3 text-sm transition-all text-center"
                        >
                            Criar conta gratuita
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
