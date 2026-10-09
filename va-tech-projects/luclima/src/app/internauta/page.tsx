'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence, easeOut } from 'framer-motion';
import {
    Send,
    MessageCircle,
    X,
    User,
    Bot,
    ChevronRight,
    Phone,
    Mail,
    MapPin,
    Clock,
    CheckCircle,
    AlertCircle,
    PlusCircle,
    ShieldCheck,
    Lock,
    Sparkles
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface ServiceRequestForm {
    name: string;
    email: string;
    phone: string;
    serviceId: string;
    sectorId: string;
    description: string;
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'operator' | 'ai';
    timestamp: Date;
}

export default function InternautaPage() {
    const [activeTab, setActiveTab] = useState<'request' | 'chat' | 'contacts'>('request');
    const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [formMessage, setFormMessage] = useState('');
    const { register, handleSubmit, formState: { errors }, reset } = useForm<ServiceRequestForm>();

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Bem-vindo ao suporte Luclima! Qual é o problema técnico que o traz aqui hoje?', sender: 'ai', timestamp: new Date() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [selectedSector, setSelectedSector] = useState<string>('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const { data: servicesData } = useQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const res = await fetch('/api/services?isActive=true');
            if (!res.ok) return { services: [] };
            return res.json();
        },
    });

    const { data: sectorsData } = useQuery({
        queryKey: ['sectors'],
        queryFn: async () => {
            const res = await fetch('/api/sectors?isActive=true');
            if (!res.ok) return { sectors: [] };
            return res.json();
        },
    });

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        setTimeout(() => {
            const responseTxt = getAIResponse(inputValue, selectedSector);
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: responseTxt,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 800);
    };

    const getAIResponse = (input: string, sector: string) => {
        const lowerInput = input.toLowerCase();
        if (lowerInput.includes('preço') || lowerInput.includes('orçamento')) {
            return `Para orçamentos no sector ${sector || 'técnico'}, recomendo preencher o formulário no separador 'Pedir Orçamento' para uma análise detalhada.`;
        }
        if (lowerInput.includes('horário') || lowerInput.includes('horas')) {
            return 'O nosso horário de atendimento é: Seg-Sex das 08h às 18h, e Sábado das 09h às 13h. Emergências 24h.';
        }
        if (lowerInput.includes('emergência') || lowerInput.includes('urgente')) {
            return 'IDENTIFICADA URGÊNCIA: Por favor, ligue imediatamente para o nosso Piquete 24/7: +244 972 621 774.';
        }
        return `Entendido. Registamos a sua dúvida sobre o sector ${sector || 'geral'}. Gostaria de agendar uma visita técnica?`;
    };

    const onSubmitForm = async (data: ServiceRequestForm) => {
        setFormStatus('loading');
        try {
            const res = await fetch('/api/service-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                setFormStatus('success');
                setFormMessage('Solicitação técnica enviada. Verifique o seu e-mail para confirmação.');
                reset();
                setTimeout(() => setFormStatus('idle'), 5000);
            } else {
                setFormStatus('error');
                setFormMessage('Erro ao processar. Certifique-se que todos os campos estão correctos.');
            }
        } catch {
            setFormStatus('error');
            setFormMessage('Erro de conexão com a central técnica.');
        }
    };

    const tabVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#050505] selection:bg-black selection:text-white">
            {/* Header */}
            <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <Logo className="scale-90" />
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-900/10 rounded-full border border-gray-900/20">
                            <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            <span className="text-[10px] font-black text-black dark:text-gray-600 uppercase tracking-[0.2em]">Piquete 24/7 Ativo</span>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-16">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-8"
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-4 justify-center lg:justify-start">
                                <Sparkles size={16} className="text-black" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Portal Internauta Luclima</span>
                            </div>
                            <h1 className="font-serif text-5xl lg:text-7xl font-black text-black dark:text-white leading-tight tracking-tighter">
                                Gestão de <span className="text-black italic">Conforto.</span>
                            </h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm lg:text-right">
                            Acesso direto a consultoria técnica, orçamentação rápida e suporte 24h para o seu sistema.
                        </p>
                    </motion.div>

                    {/* Navigation Tabs */}
                    <div className="flex bg-white dark:bg-gray-900/50 backdrop-blur-md p-2 rounded-3xl border border-gray-200 dark:border-gray-800 mb-12 shadow-2xl shadow-black/5 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setActiveTab('request')}
                            className={`flex-1 flex items-center justify-center gap-3 py-5 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'request' ? 'bg-black text-white shadow-xl shadow-black/20 translate-y-[-2px]' : 'text-gray-400 hover:text-black'}`}
                        >
                            <PlusCircle size={18} />
                            Pedido Orçamento
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`flex-1 flex items-center justify-center gap-3 py-5 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'bg-black text-white shadow-xl shadow-black/20 translate-y-[-2px]' : 'text-gray-400 hover:text-black'}`}
                        >
                            <MessageCircle size={18} />
                            Suporte Técnico AI
                        </button>
                        <button
                            onClick={() => setActiveTab('contacts')}
                            className={`flex-1 flex items-center justify-center gap-3 py-5 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'contacts' ? 'bg-black text-white shadow-xl shadow-black/20 translate-y-[-2px]' : 'text-gray-400 hover:text-black'}`}
                        >
                            <Phone size={18} />
                            Linhas Diretas
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[500px] relative">
                        <AnimatePresence mode="wait">
                            {activeTab === 'request' && (
                                <motion.div
                                    key="request"
                                    variants={tabVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className="grid lg:grid-cols-3 gap-8"
                                >
                                    <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                                        <div className="flex items-center justify-between mb-10">
                                            <h2 className="text-3xl font-black tracking-tighter">Formulário Técnico</h2>
                                            <span className="text-[10px] font-black text-black bg-gray-50 dark:bg-gray-900/20 px-4 py-2 rounded-full uppercase tracking-widest">Novo Ticket</span>
                                        </div>

                                        <AnimatePresence>
                                            {formStatus === 'success' && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="mb-8 p-6 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-4 text-green-700 dark:text-green-400"
                                                >
                                                    <CheckCircle size={24} />
                                                    <span className="font-bold text-sm uppercase tracking-widest">{formMessage}</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <form onSubmit={handleSubmit(onSubmitForm)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-2">Identificação</label>
                                                    <input {...register('name', { required: true })} className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 focus:border-black outline-none transition-all font-medium text-sm" placeholder="Seu nome" />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-2">E-mail</label>
                                                    <input {...register('email', { required: true })} className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 focus:border-black outline-none transition-all font-medium text-sm" placeholder="email@dominio.com" />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-2">WhatsApp / Tel</label>
                                                    <input {...register('phone', { required: true })} className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 focus:border-black outline-none transition-all font-medium text-sm" placeholder="+244 ..." />
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-2">Sector</label>
                                                        <select {...register('sectorId', { required: true })} className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 focus:border-black outline-none transition-all font-medium text-sm appearance-none">
                                                            <option value="">Seleccione</option>
                                                            {sectorsData?.sectors?.map((s: any) => (
                                                                <option key={s.id} value={s.id}>{s.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-2">Serviço</label>
                                                        <select {...register('serviceId', { required: true })} className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 focus:border-black outline-none transition-all font-medium text-sm appearance-none">
                                                            <option value="">Seleccione</option>
                                                            {servicesData?.services?.map((s: any) => (
                                                                <option key={s.id} value={s.id}>{s.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="flex-1 flex flex-col">
                                                    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-2">Requisito Técnico</label>
                                                    <textarea {...register('description', { required: true })} rows={4} className="flex-1 w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 focus:border-black outline-none transition-all font-medium text-sm resize-none" placeholder="O que necessita?" />
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 pt-4">
                                                <button
                                                    disabled={formStatus === 'loading'}
                                                    type="submit"
                                                    className="w-full py-6 bg-black text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-gray-800 hover:scale-[1.02] shadow-2xl shadow-black/30 transition-all disabled:opacity-50"
                                                >
                                                    {formStatus === 'loading' ? 'Emitindo Orçamento...' : 'Gerar Pedido de Serviço'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="space-y-8">
                                        <div className="bg-black p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                                            <div className="relative z-10 font-bold">
                                                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-black/40">
                                                    <ShieldCheck size={24} />
                                                </div>
                                                <h3 className="text-xl mb-4 italic">Segurança & <br />Performance</h3>
                                                <p className="text-gray-400 text-xs leading-relaxed font-medium mb-6">
                                                    Intervenções técnicas asseguradas por especialistas certificados.
                                                </p>
                                                <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                                                    <div className="flex items-center gap-3">
                                                        <Lock size={16} className="text-gray-900" />
                                                        <span className="text-[10px] uppercase tracking-widest">Protocolo SSL 256-bit</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-gray-900/50 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800">
                                            <h4 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <Clock size={16} className="text-black" />
                                                SLA de Resposta
                                            </h4>
                                            <div className="space-y-4">
                                                {[
                                                    { label: 'Urgências', time: '30-45 min' },
                                                    { label: 'Orçamentos', time: '< 12h' },
                                                    { label: 'Visitas', time: 'Agendamento' }
                                                ].map((sla, i) => (
                                                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                                        <span className="text-xs font-bold text-gray-400">{sla.label}</span>
                                                        <span className="text-xs font-black uppercase tracking-tighter">{sla.time}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'chat' && (
                                <motion.div
                                    key="chat"
                                    variants={tabVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col h-[700px]"
                                >
                                    {/* Chat Header */}
                                    <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
                                        <div className="flex items-center gap-5">
                                            <div className="relative">
                                                <div className="w-14 h-14 bg-black rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-black/30">
                                                    <Bot size={28} />
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white dark:border-gray-900" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-widest text-black dark:text-white">Central AI Luclima</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Consultor Especialista Online</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="hidden md:flex items-center gap-4">
                                            <select
                                                value={selectedSector}
                                                onChange={(e) => setSelectedSector(e.target.value)}
                                                className="text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-4 focus:ring-black/10 transition-all appearance-none pr-10 cursor-pointer"
                                            >
                                                <option value="">Filtrar Sector</option>
                                                {sectorsData?.sectors?.map((s: any) => (
                                                    <option key={s.id} value={s.name}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Chat Messages */}
                                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-gray-50/30 dark:bg-black/20">
                                        {messages.map((m) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: m.sender === 'user' ? 20 : -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={m.id}
                                                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[75%] relative ${m.sender === 'user' ? 'order-1' : 'order-2'}`}>
                                                    <div className={`rounded-3xl px-6 py-4 shadow-sm ${m.sender === 'user' ? 'bg-black text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 text-black dark:text-white rounded-tl-none border border-gray-100 dark:border-gray-700'}`}>
                                                        <p className="text-sm leading-relaxed font-medium">{m.text}</p>
                                                    </div>
                                                    <p className={`text-[8px] font-black uppercase tracking-widest mt-2 px-1 ${m.sender === 'user' ? 'text-right opacity-40' : 'text-left text-black'}`}>
                                                        {m.sender === 'ai' ? 'Luclima AI' : m.sender === 'operator' ? 'Técnico' : 'Cliente'} • {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                        <div ref={chatEndRef} />
                                    </div>

                                    {/* Chat Input */}
                                    <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                                        <form onSubmit={handleSendMessage} className="flex gap-4 relative group">
                                            <input
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                className="flex-1 px-8 py-5 rounded-2xl bg-gray-100 dark:bg-gray-800/50 border border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-black transition-all text-sm font-medium outline-none"
                                                placeholder="Como podemos optimizar o seu clima?"
                                            />
                                            <button type="submit" className="px-8 py-5 bg-black text-white rounded-2xl hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/30">
                                                <Send size={20} />
                                            </button>
                                        </form>
                                        <p className="text-center text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 mt-4">Respostas típicas em menos de 10 segundos</p>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'contacts' && (
                                <motion.div
                                    key="contacts"
                                    variants={tabVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className="grid md:grid-cols-2 gap-8"
                                >
                                    <div className="bg-white dark:bg-gray-900 p-12 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                                        <h3 className="text-3xl font-black mb-12 tracking-tighter">Luclima Headquarters</h3>
                                        <div className="space-y-12">
                                            {[
                                                { icon: Phone, label: 'Piquete Central', value: '+244 972 621 774', status: 'Ativo 24h' },
                                                { icon: Mail, label: 'Central Técnica', value: 'geral@luclima.com', status: 'E-mail' },
                                                { icon: MapPin, label: 'Showroom & Oficina', value: 'Via AL4, Talatona, Luanda', status: 'Angola' }
                                            ].map((contact, i) => (
                                                <div key={i} className="flex gap-6 group/item">
                                                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center group-hover/item:bg-black group-hover/item:text-white transition-all shadow-sm">
                                                        <contact.icon size={28} strokeWidth={1.5} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{contact.label}</p>
                                                            {contact.status === 'Ativo 24h' && (
                                                                <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                                            )}
                                                        </div>
                                                        <p className="text-xl font-bold text-black dark:text-white">{contact.value}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="absolute -bottom-20 -right-20 opacity-[0.02] group-hover:opacity-10 transition-opacity rotate-12">
                                            <Sparkles size={400} />
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        <div className="bg-black p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                                            <div className="relative z-10">
                                                <h4 className="text-3xl font-black mb-6 tracking-tighter">Canais de Emergência</h4>
                                                <p className="text-gray-100 text-sm mb-12 leading-relaxed font-medium">
                                                    Tempos de resposta críticos. Se tem uma inundação técnica ou falha total de climatização em zonas sensíveis, use a nossa linha prioritária.
                                                </p>
                                                <a href="tel:+244972621774" className="w-full inline-flex items-center justify-between gap-3 px-10 py-6 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black hover:text-white transition-all group/btn shadow-2xl">
                                                    Acionar Piquete de Emergência
                                                    <ChevronRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
                                                </a>
                                            </div>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-[15vw] opacity-5 text-white pointer-events-none italic select-none uppercase font-black">
                                                Urgente
                                            </div>
                                        </div>
                                        <div className="p-8 border border-gray-200 dark:border-gray-800 rounded-[2rem] bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm text-center">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                                                Intervenções rápidas em menos de <span className="text-black">60 minutos</span> em toda a área metropolitana de Luanda.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="py-12 bg-white dark:bg-[#050505] border-t border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <Logo className="grayscale opacity-50 scale-75" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">© {new Date().getFullYear()} Luclima Premium Services.</p>
                    </div>
                    <div className="flex gap-10">
                        <a href="/privacidade" className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors">Privacidade</a>
                        <a href="#" className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors">Compliance</a>
                        <a href="#" className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors">Termos de Serviço</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
