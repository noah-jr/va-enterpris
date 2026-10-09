"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, Sparkles, ArrowRight, Eye, EyeOff, Check } from "lucide-react";

export default function Register() {
    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch('http://localhost:3002/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role: 'CLIENTE' }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erro ao registrar');
            }

            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const benefits = [
        "Acesso a eventos exclusivos",
        "Bilhetes digitais seguros",
        "Histórico de compras",
        "Notificações personalizadas"
    ];

    return (
        <div className="min-h-screen flex justify-center items-center bg-[#0a0a0a] p-4 md:p-8 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 animated-bg" />

            {/* Floating Orbs */}
            <motion.div
                className="absolute top-20 right-20 w-72 h-72 bg-pink-600/20 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[600px] relative z-10"
            >
                {/* Card */}
                <div className="card-modern relative">
                    {/* Gradient Top Border */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-t-3xl" />

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center mb-10"
                    >
                        <div className="inline-flex items-center gap-2 mb-4">
                            <Sparkles className="w-6 h-6 text-pink-500" />
                            <h2 className="text-5xl font-black text-white tracking-tight">
                                Criar Conta
                            </h2>
                        </div>
                        <p className="text-gray-400 text-lg font-medium">
                            Junte-se à maior comunidade de eventos em Angola
                        </p>
                    </motion.div>

                    {/* Benefits */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-2 gap-3 mb-8"
                    >
                        {benefits.map((benefit, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                                <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-3 h-3 text-indigo-400" />
                                </div>
                                <span className="font-medium">{benefit}</span>
                            </div>
                        ))}
                    </motion.div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 text-sm font-semibold backdrop-blur-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Name Field */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">
                                Nome Completo
                            </label>
                            <div className="relative group">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-pink-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="João da Silva"
                                    className="input-modern w-full pl-14 text-lg focus:ring-pink-500/50 focus:border-pink-500/50"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </motion.div>

                        {/* Email Field */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">
                                E-mail
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-pink-500 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="seu@email.com"
                                    className="input-modern w-full pl-14 text-lg focus:ring-pink-500/50 focus:border-pink-500/50"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </motion.div>

                        {/* Password Field */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">
                                Palavra-passe
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-pink-500 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Mínimo 8 caracteres"
                                    className="input-modern w-full pl-14 pr-14 text-lg focus:ring-pink-500/50 focus:border-pink-500/50"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 ml-1">
                                Use pelo menos 8 caracteres com letras e números
                            </p>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 group relative overflow-hidden mt-8"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        A processar...
                                    </>
                                ) : (
                                    <>
                                        Criar Conta Gratuita
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-10">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-[#121212] text-gray-500 font-semibold">
                                Já tem uma conta?
                            </span>
                        </div>
                    </div>

                    {/* Login Link */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-center"
                    >
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-white font-bold hover:text-pink-400 transition-colors group"
                        >
                            Entrar na minha conta
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="text-center mt-8 text-gray-500 text-sm"
                >
                    Ao criar uma conta, você concorda com nossos{" "}
                    <Link href="/termos" className="text-pink-400 hover:underline">
                        Termos de Serviço
                    </Link>
                    {" "}e{" "}
                    <Link href="/privacidade" className="text-pink-400 hover:underline">
                        Política de Privacidade
                    </Link>
                </motion.p>
            </motion.div>
        </div>
    );
}
