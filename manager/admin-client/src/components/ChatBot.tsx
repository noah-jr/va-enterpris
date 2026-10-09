import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import api from '../api';

export const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, isTyping]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || isTyping) return;

        const userMsg = message;
        setMessage('');
        setHistory(prev => [...prev, { role: 'user', parts: [{ text: userMsg }] }]);
        setIsTyping(true);

        try {
            const { data } = await api.post('/ai/chat', { 
                message: userMsg,
                history: history 
            });
            
            setHistory(prev => [...prev, { role: 'model', parts: [{ text: data.text }] }]);
        } catch (error) {
            setHistory(prev => [...prev, { role: 'model', parts: [{ text: "Pedimos desculpa, mas o assistente VaOneGest está momentaneamente ocupado. Por favor, tente novamente em instantes." }] }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {/* FAB Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-[var(--accent)] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group scale-100 sm:scale-100"
                >
                    <MessageSquare size={24} />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                </button>
            )}
            {/* Chat Window */}
            {isOpen && (
                <div className="w-[320px] sm:w-[420px] h-[580px] sm:h-[650px] bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-500">
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white flex items-center justify-between shadow-2xl relative">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-inner group-hover:rotate-6 transition-transform">
                                <Bot size={26} className="text-indigo-200" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-[0.1em] text-white">VA Assistente</h3>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[10px] font-black text-indigo-100/60 uppercase tracking-widest">IA Neural Ativa</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2.5 hover:bg-white/10 rounded-xl transition-all active:scale-90 relative z-10 border border-white/5">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 no-scrollbar bg-[#09090b]/40">
                        {history.length === 0 && (
                            <div className="text-center py-8 space-y-6 animate-fade-in px-4">
                                <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] border border-white/5 flex items-center justify-center mx-auto text-indigo-500 shadow-2xl relative">
                                    <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full" />
                                    <Bot size={40} className="relative z-10" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-base font-black text-white tracking-tight">Ecosistema VaOneGest</p>
                                    <p className="text-xs text-zinc-500 font-medium leading-relaxed opacity-80">
                                        Bem-vindo ao centro de apoio inteligente. Como posso potenciar os seus resultados hoje?
                                    </p>
                                </div>
                                
                                {/* Quick Suggestion Chips */}
                                <div className="grid grid-cols-1 gap-2 pt-4">
                                    {[
                                        'O que é o ERP VaOneGest?',
                                        'Quais os módulos disponíveis?',
                                        'Como funciona o SAF-T AO?',
                                        'Quero marcar uma demo'
                                    ].map(chip => (
                                        <button 
                                            key={chip}
                                            onClick={() => setMessage(chip)}
                                            className="text-[10px] font-black uppercase tracking-widest p-3 rounded-xl bg-zinc-900/50 border border-white/5 text-zinc-400 hover:border-indigo-500/50 hover:text-white hover:bg-zinc-800 transition-all text-left"
                                        >
                                            {chip}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {history.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-300`}>
                                <div className={`max-w-[88%] p-4 rounded-2xl text-xs sm:text-[13px] font-medium leading-[1.6] shadow-xl ${
                                    msg.role === 'user' 
                                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-tr-none border border-white/10' 
                                        : 'bg-zinc-900/80 backdrop-blur-md text-zinc-100 border border-white/5 rounded-tl-none'
                                }`}>
                                    {msg.parts[0].text}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start animate-fade-in">
                                <div className="bg-zinc-900 border border-white/5 p-4 rounded-2xl rounded-tl-none flex gap-2 items-center">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-6 bg-zinc-950 border-t border-white/5 flex gap-3">
                        <input 
                            type="text" 
                            disabled={isTyping}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Escreva aqui a sua dúvida..."
                            className="flex-1 bg-zinc-900 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-600"
                        />
                        <button 
                            type="submit"
                            disabled={!message.trim() || isTyping}
                            className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-500 hover:scale-105 transition-all disabled:opacity-30 disabled:grayscale shadow-[0_10px_20px_rgba(79,70,229,0.3)] active:scale-95"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
