'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import {
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Wrench,
    Building2,
    Phone,
    Mail,
    ShieldCheck,
    ChevronRight,
    Sparkles
} from 'lucide-react';

interface ServiceRequestForm {
    name: string;
    email: string;
    phone: string;
    serviceId: string;
    sectorId: string;
    description: string;
}

export default function SolicitarServicoPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
   

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ServiceRequestForm>();

    const { data: servicesData } = useQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const response = await fetch('/api/services?isActive=true');
            if (!response.ok) throw new Error('Erro ao carregar serviços');
            return response.json();
        },
    });

    const { data: sectorsData } = useQuery({
        queryKey: ['sectors'],
        queryFn: async () => {
            const response = await fetch('/api/sectors?isActive=true');
            if (!response.ok) throw new Error('Erro ao carregar sectores');
            return response.json();
        },
    });

   

    const onSubmit = async (data: ServiceRequestForm) => {
        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch('/api/service-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage('A sua solicitação foi recebida com sucesso. Um especialista entrará em contacto em breve.');
                reset();
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                setStatus('error');
                setMessage(result.error || 'Ocorreu um erro ao processar o seu pedido.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Falha na comunicação com o servidor.');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#050505] selection:bg-black selection:text-white">
               {/* <Header /> */}

            {/* Mouse Follow Glow */}
           

            <main className="relative pt-28 ">
                <div className="flex flex-col lg:flex-row min-h-screen">

                    {/* Left Side: Visual & Brand */}
                    <div className="lg:w-2/5 relative p-8 lg:p-12 flex flex-col justify-center bg-black text-white overflow-hidden">
                        <div className="absolute inset-0 z-0 opacity-30">
                            <img
                                src="/images/hero-bg.png"
                                alt="Climatização Premium"
                                className="w-full h-full object-cover grayscale"
                            />
                            <div className="absolute inset-0 bg-black mix-blend-multiply opacity-40" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                        </div>

                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="relative z-10 max-w-lg"
                        >
                            <div className="flex items-center space-x-3 mb-6 border-l-2 border-white pl-3">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Project Division</span>
                            </div>

                            <h1 className="font-space text-4xl xl:text-6xl font-black mb-6 leading-[0.95] tracking-tighter uppercase">
                                Engenharia <br />
                                <span className="text-gray-400">Ambiental.</span>
                            </h1>

                            <p className="text-base text-gray-400 font-medium max-w-md mb-8 leading-relaxed">
                                Execução técnica rigorosa para projectos residenciais e industriais.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 group">
                                    <div className="w-8 h-[1px] bg-white group-hover:w-16 transition-all" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Piquete 24/7</p>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="w-8 h-[1px] bg-white group-hover:w-16 transition-all" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">ISO 9001 Standards</p>
                                </div>
                            </div>
                        </motion.div>

                        <div className="relative z-10 mt-12">
                            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Linha de Intervenção</div>
                            <p className="text-xl font-black tracking-tighter">+244 972 621 774</p>
                        </div>
                    </div>

                    {/* Right Side: Tactical Form */}
                    <div className="flex-1 bg-white dark:bg-[#080808] p-6 sm:p-8 lg:p-16 xl:p-20 relative flex items-center">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="w-full max-w-2xl mx-auto"
                        >
                            <motion.div variants={itemVariants} className="mb-12">
                                <h2 className="font-space text-3xl lg:text-5xl font-black text-black dark:text-white mb-4 tracking-tighter uppercase italic">
                                    Request Technical Audit
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 font-medium text-base border-l-2 border-gray-200 dark:border-gray-800 pl-4">
                                    Inicie o seu processo de climatização com uma avaliação de carga térmica detalhada.
                                </p>
                            </motion.div>

                            <AnimatePresence mode="wait">
                                {status === 'success' ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-black text-white p-12 text-center flex flex-col items-center"
                                    >
                                        <CheckCircle size={48} className="mb-6" />
                                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Transmission Successful</h3>
                                        <p className="text-gray-100 font-medium mb-10">{message}</p>
                                        <button
                                            onClick={() => setStatus('idle')}
                                            className="px-10 py-4 border-2 border-white font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-all"
                                        >
                                            Generate New Request
                                        </button>
                                    </motion.div>
                                ) : (
                                    <form
                                        onSubmit={handleSubmit(onSubmit)}
                                        className="space-y-6"
                                    >
                                        {status === 'error' && (
                                            <div className="p-6 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-4">
                                                <AlertCircle size={20} />
                                                {message}
                                            </div>
                                        )}

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black italic">01. Identificação</label>
                                                <input
                                                    {...register('name', { required: 'Nome é obrigatório' })}
                                                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-3 focus:border-black outline-none transition-all font-bold text-base placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                                    placeholder="NOME COMPLETO"
                                                />
                                                {errors.name && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">{errors.name.message}</p>}
                                            </div>

                                            <div className="space-y-4">
                                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black italic">02. Canal Contacto</label>
                                                <input
                                                    type="tel"
                                                    {...register('phone', { required: 'Telefone é obrigatório' })}
                                                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-3 focus:border-black outline-none transition-all font-bold text-base placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                                    placeholder="+244 ..."
                                                />
                                                {errors.phone && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">{errors.phone.message}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black italic">03. E-mail de Envio</label>
                                            <input
                                                type="email"
                                                {...register('email', {
                                                    required: 'Email é obrigatório',
                                                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' }
                                                })}
                                                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-3 focus:border-black outline-none transition-all font-bold text-base placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                                placeholder="ENDEREÇO ELECTRÓNICO"
                                            />
                                            {errors.email && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">{errors.email.message}</p>}
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-12">
                                            <div className="space-y-4">
                                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black italic">04. Classificação</label>
                                                <select
                                                    {...register('serviceId', { required: 'Selecione um serviço' })}
                                                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-3 focus:border-black outline-none transition-all font-bold text-sm appearance-none cursor-pointer"
                                                >
                                                    <option value="" className="bg-black text-white">SELECIONE O SERVIÇO</option>
                                                    {servicesData?.services?.map((service: any) => (
                                                        <option key={service.id} value={service.id} className="bg-white dark:bg-black text-black dark:text-white uppercase">{service.name}</option>
                                                    ))}
                                                </select>
                                                {errors.serviceId && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">{errors.serviceId.message}</p>}
                                            </div>

                                            <div className="space-y-4">
                                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black italic">05. Segmento</label>
                                                <select
                                                    {...register('sectorId', { required: 'Selecione um sector' })}
                                                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-3 focus:border-black outline-none transition-all font-bold text-sm appearance-none cursor-pointer"
                                                >
                                                    <option value="" className="bg-black text-white">SELECIONE O SECTOR</option>
                                                    {sectorsData?.sectors?.map((sector: any) => (
                                                        <option key={sector.id} value={sector.id} className="bg-white dark:bg-black text-black dark:text-white uppercase">{sector.name}</option>
                                                    ))}
                                                </select>
                                                {errors.sectorId && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">{errors.sectorId.message}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black italic">06. Memória Descritiva</label>
                                            <textarea
                                                {...register('description', { required: 'Descrição é obrigatória' })}
                                                rows={4}
                                                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-3 focus:border-black outline-none transition-all font-bold text-base placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none"
                                                placeholder="DETALHES TÉCNICOS ADICIONAIS"
                                            />
                                            {errors.description && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">{errors.description.message}</p>}
                                        </div>

                                        <div className="pt-10">
                                            <button
                                                type="submit"
                                                disabled={status === 'loading'}
                                                className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.4em] text-[10px] hover:bg-black dark:hover:bg-black dark:hover:text-white transition-all flex items-center justify-center gap-4 group"
                                            >
                                                {status === 'loading' ? (
                                                    <div className="w-6 h-6 border-2 border-black border-t-transparent animate-spin" />
                                                ) : (
                                                    <>
                                                        SUBMIT TECHNICAL AUDIT
                                                        <ArrowRight size={20} className="group-hover:translate-x-4 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                            <p className="mt-6 text-[8px] font-black text-gray-400 uppercase tracking-widest text-center">
                                                Enviando este formulário concorda com os nossos protocolos de proteção de dados e auditoria técnica.
                                            </p>
                                        </div>
                                    </form>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>
            </main>

             {/* <Footer /> */}
        </div>
    );
}
