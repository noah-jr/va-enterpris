'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CheckCircle, AlertCircle, Mail, Phone, MapPin } from 'lucide-react';

interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

export default function ContactoPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>();

    const onSubmit = async (data: ContactFormData) => {
        setStatus('loading');
        setMessage('');
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (res.ok) {
                setStatus('success');
                setMessage('Mensagem enviada com sucesso! Responderemos em breve.');
                reset();
            } else {
                setStatus('error');
                setMessage(result.error || 'Erro ao enviar mensagem');
            }
        } catch {
            setStatus('error');
            setMessage('Erro ao processar pedido');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black">
               {/* <Header /> */}
            <main className="pt-20">
                <section className="py-24">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-16">
                                <h1 className="text-4xl sm:text-5xl font-bold text-black dark:text-white mb-4">
                                    Contacto
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-400">
                                    Envie-nos a sua mensagem. Responderemos o mais breve possível.
                                </p>
                            </div>

                            {status === 'success' && (
                                <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start space-x-3 max-w-2xl mx-auto">
                                    <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={24} />
                                    <div>
                                        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">Mensagem enviada</h3>
                                        <p className="text-green-700 dark:text-green-300">{message}</p>
                                    </div>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3 max-w-2xl mx-auto">
                                    <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={24} />
                                    <div>
                                        <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Erro</h3>
                                        <p className="text-red-700 dark:text-red-300">{message}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid lg:grid-cols-2 gap-12 items-start">
                                {/* Form */}
                                <div>
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-black dark:text-white mb-2">Nome *</label>
                                            <input
                                                id="name"
                                                {...register('name', { required: 'Nome é obrigatório' })}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                                                placeholder="O seu nome"
                                            />
                                            {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-black dark:text-white mb-2">Email *</label>
                                            <input
                                                id="email"
                                                type="email"
                                                {...register('email', {
                                                    required: 'Email é obrigatório',
                                                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
                                                })}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                                                placeholder="seu@email.com"
                                            />
                                            {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-black dark:text-white mb-2">Telefone</label>
                                            <input
                                                id="phone"
                                                type="tel"
                                                {...register('phone')}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                                                placeholder="+244 972 621 774"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="subject" className="block text-sm font-medium text-black dark:text-white mb-2">Assunto *</label>
                                            <input
                                                id="subject"
                                                {...register('subject', { required: 'Assunto é obrigatório' })}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                                                placeholder="Assunto da mensagem"
                                            />
                                            {errors.subject && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subject.message}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="message" className="block text-sm font-medium text-black dark:text-white mb-2">Mensagem *</label>
                                            <textarea
                                                id="message"
                                                rows={4}
                                                {...register('message', { required: 'Mensagem é obrigatória' })}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
                                                placeholder="A sua mensagem..."
                                            />
                                            {errors.message && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message.message}</p>}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={status === 'loading'}
                                            className="w-full px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-black/90 dark:hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {status === 'loading' ? 'A enviar...' : 'Enviar mensagem'}
                                        </button>
                                    </form>
                                </div>

                                {/* Info & Map */}
                                <div className="space-y-8">
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <h3 className="text-xl font-bold text-black dark:text-white mb-6">Informações de Contacto</h3>
                                        <div className="space-y-6">
                                            <div className="flex items-start space-x-4">
                                                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                                    <Mail className="text-foreground" size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 uppercase tracking-wider">Email</p>
                                                    <p className="text-black dark:text-white font-medium">geral@luclima.com</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-4">
                                                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                                    <Phone className="text-foreground" size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 uppercase tracking-wider">Telefone</p>
                                                    <p className="text-black dark:text-white font-medium">+244 972 621 774</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-4">
                                                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                                    <MapPin className="text-foreground" size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 uppercase tracking-wider">Localização</p>
                                                    <p className="text-black dark:text-white font-medium">Luanda, Angola</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="aspect-square rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg h-[400px]">
                                        <iframe
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126135.25307525287!2d13.167812170364969!3d-8.853047249156494!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1a51f15328904797%3A0xc3f3480ec013917d!2sLuanda%2C%20Angola!5e0!3m2!1spt-PT!2s!4v1700000000000!5m2!1spt-PT!2s"
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
             {/* <Footer /> */}
        </div>
    );
}
