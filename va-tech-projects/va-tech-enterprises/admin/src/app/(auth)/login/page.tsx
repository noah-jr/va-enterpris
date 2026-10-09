"use client";

import { useActionState, useState, useEffect, Suspense, useRef } from "react";
import { Lock, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticate } from "@/lib/actions";
import { useSearchParams } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";

function LoginForm() {
    const searchParams = useSearchParams();
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle');
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    useEffect(() => {
        const emailParam = searchParams?.get("email");
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleSendOTP = async () => {
        if (!email) {
            alert("Por favor, insira o seu email primeiro.");
            return;
        }

        setStatus('loading');
        try {
            const res = await fetch("/api/auth/otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (res.ok) {
                setStatus('sent');
            } else {
                alert(data.error || "Erro ao enviar OTP");
                setStatus('idle');
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão");
            setStatus('idle');
        }
    };

    const isQR = searchParams?.get("qr") === "true";
    const hasEmailParam = !!searchParams?.get("email");

    return (
        <form action={dispatch} className="space-y-6">
            <div className="space-y-4">
                {hasEmailParam ? (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm mb-6 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-white" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Aceder como</p>
                                    <p className="text-sm font-medium text-white truncate max-w-[200px]">{email}</p>
                                </div>
                            </div>
                            {!isQR && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const url = new URL(window.location.href);
                                        url.searchParams.delete('email');
                                        window.history.replaceState({}, '', url.toString());
                                        window.location.reload();
                                    }}
                                    className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest"
                                >
                                    Alterar
                                </button>
                            )}
                        </div>
                        <input type="hidden" name="email" value={email} />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-neutral-300">Email Corporativo</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="admin@vatech.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 pl-10 focus:ring-white/20 focus:border-neutral-500 h-11"
                            />
                        </div>
                    </div>
                )}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-neutral-300">Password ou Código OTP</Label>
                        <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={status === 'loading'}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                        >
                            {status === 'loading' ? 'Enviando...' : (status === 'sent' ? 'Código Enviado!' : 'Enviar Código OTP')}
                        </button>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            placeholder={status === 'sent' ? "Insira o código recebido..." : "••••••••"}
                            required
                            className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 pl-10 focus:ring-white/20 focus:border-neutral-500 h-11"
                        />
                    </div>
                    {status === 'sent' && (
                        <p className="text-xs text-green-400">
                            Verifique o seu email (e spam) para obter o código de acesso.
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-center py-2">
                <ReCAPTCHA
                    ref={recaptchaRef}
                    theme="dark"
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                    onChange={(token) => setCaptchaToken(token)}
                />
            </div>

            <input type="hidden" name="captcha" value={captchaToken || ""} />

            {errorMessage && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                    {errorMessage}
                </div>
            )}

            <Button
                type="submit"
                className="w-full bg-white hover:bg-neutral-200 text-black h-11 font-medium transition-all duration-200 hover:shadow-lg hover:shadow-white/10"
                disabled={isPending}
            >
                {isPending ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Autenticando...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        Entrar no Painel
                        <ArrowRight className="h-4 w-4" />
                    </span>
                )}
            </Button>
        </form>
    );
}

export default function AdminLogin() {
    return (
        <div className="flex min-h-screen bg-neutral-950 text-white selection:bg-white/30">
            {/* Esquerda: Imagem/Decorativo */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-neutral-900 items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />

                <div className="relative z-10 p-12 text-center max-w-lg">
                    <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-2xl shadow-white/10">
                        <span className="text-3xl font-bold text-black">VA</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight mb-4">VA TECH ENTERPRISES</h1>
                    <p className="text-lg text-neutral-400">
                        Gestão centralizada de tecnologia, segurança e marketing digital.
                    </p>
                </div>
            </div>

            {/* Direita: Formulário */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-neutral-950">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <div className="lg:hidden mb-6 flex justify-center">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-white shadow-lg shadow-white/10">
                                <span className="text-2xl font-bold text-black">VA</span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-white">Bem-vindo de volta</h2>
                        <p className="mt-2 text-neutral-400">
                            Aceda ao painel administrativo da VA Tech.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <Suspense fallback={
                            <div className="flex items-center justify-center p-12">
                                <div className="animate-spin h-8 w-8 border-b-2 border-white rounded-full" />
                            </div>
                        }>
                            <LoginForm />
                        </Suspense>
                    </div>

                    <div className="pt-6 text-center border-t border-neutral-900">
                        <p className="text-xs text-neutral-500">
                            Protegido por reCAPTCHA e sujeito à Política de Privacidade e Termos de Serviço da Google.
                        </p>
                        <p className="text-xs text-neutral-600 mt-2">
                            © {new Date().getFullYear()} VA TECH ENTERPRISES. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
