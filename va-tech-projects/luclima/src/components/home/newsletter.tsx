'use client';

import { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';

export function Newsletter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message);
                setEmail('');
            } else {
                setStatus('error');
                setMessage(data.error || 'Falha na subscrição');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Erro ao processar subscrição');
        }
    };

    return (
        <section className="py-32 bg-black text-white overflow-hidden relative">
            {/* Background Text Overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-[20vw] opacity-10 whitespace-nowrap pointer-events-none uppercase tracking-tighter select-none">
                LUCLIMA PRO
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex p-3 bg-white/20 backdrop-blur-md rounded-sm mb-6 uppercase tracking-widest text-[10px] font-black">
                            Dicas e Ofertas
                        </div>

                        <h2 className="font-serif text-5xl sm:text-6xl font-black mb-6 leading-tight">
                            Mantenha o seu <br />
                            <span className="italic">Conforto</span> em Dia
                        </h2>

                        <p className="text-xl text-white/80 max-w-xl font-medium">
                            Subscreva para receber dicas de manutenção preventiva e ofertas exclusivas de climatização.
                        </p>
                    </div>

                    <div className="w-full max-w-md">
                        <form onSubmit={handleSubmit} className="relative group">
                            <div className="flex flex-col gap-4">
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu.email@exemplo.com"
                                        required
                                        disabled={status === 'loading'}
                                        className="w-full px-8 py-6 bg-white text-black font-bold placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:scale-[1.02] transition-transform rounded-xl"
                                    />
                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="absolute right-2 top-2 bottom-2 px-6 bg-black text-white hover:bg-gray-900 transition-colors flex items-center justify-center rounded-lg"
                                    >
                                        <ArrowRight size={24} />
                                    </button>
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 text-center lg:text-left">
                                    Ao subscrever, concorda com a nossa Política de Privacidade.
                                </p>
                            </div>

                            {message && (
                                <p className={`mt-6 text-sm font-bold uppercase tracking-widest text-center ${status === 'success'
                                    ? 'text-white'
                                    : 'text-black'
                                    }`}>
                                    {status === 'success' ? '✓ ' : '✗ '}{message}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
