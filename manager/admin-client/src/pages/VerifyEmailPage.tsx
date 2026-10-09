import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useVerifyEmail, useResendOTP } from '../auth/useAuth';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email') || '';
    
    const [otp, setOtp] = useState('');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
    
    const verify = useVerifyEmail();
    const resend = useResendOTP();

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const intervalId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 6) return;
        verify.mutate({ email, code: otp });
    };

    const handleResend = () => {
        resend.mutate({ email });
        setTimeLeft(300); // reset timer
    };

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-[var(--radius-lg)] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                    
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <ShieldCheck className="w-8 h-8 text-indigo-400" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Verifique o seu Email</h2>
                        <p className="text-sm text-zinc-400">
                            Enviámos um código de verificação para<br/>
                            <span className="text-indigo-400 font-medium">{email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 flex justify-between">
                                Código OTP
                                <span className={timeLeft > 0 ? "text-emerald-400" : "text-rose-400"}>
                                    {formatTime(timeLeft)}
                                </span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.toUpperCase())}
                                    placeholder="XXXXXX"
                                    maxLength={6}
                                    required
                                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-[var(--radius-sm)] px-4 py-3 pl-11 text-center text-xl tracking-[0.5em] outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-700 placeholder:tracking-normal"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={verify.isPending || otp.length < 6}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-[var(--radius-sm)] px-4 py-3 flex items-center justify-center gap-2 transition-all group"
                        >
                            {verify.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Verificar e Entrar
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-zinc-500">
                            Não recebeu o código?{' '}
                            {timeLeft > 0 ? (
                                <span className="text-zinc-600 cursor-not-allowed">Reenviar código</span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resend.isPending}
                                    className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors disabled:opacity-50"
                                >
                                    {resend.isPending ? 'A enviar...' : 'Reenviar código'}
                                </button>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
