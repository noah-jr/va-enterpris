'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const { user } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (user && isOpen) {
            const newSocket = io('http://localhost:3002');
            setSocket(newSocket);

            newSocket.on('receive_message', (data) => {
                setMessages((prev) => [...prev, data]);
            });

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user, isOpen]);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && socket && user) {
            const msgData = {
                user: user.nome,
                text: message,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                userId: user.id
            };
            socket.emit('send_message', msgData);
            setMessages((prev) => [...prev, msgData]);
            setMessage('');
        }
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-8 right-8 z-[2000]">
            {/* Botão Flutuante */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all"
            >
                {isOpen ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>

            {/* Janela de Chat */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[400px] h-[550px] bg-[#121212] rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500">
                    <div className="p-8 bg-blue-600 flex items-center gap-4 shadow-lg shadow-blue-500/20">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-black text-white">
                            VA
                        </div>
                        <div>
                            <h3 className="text-white font-black">Atendimento VA</h3>
                            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Online Agora</p>
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto space-y-6">
                        <div className="flex justify-center">
                            <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest bg-white/5 px-4 py-1 rounded-full">Início da Conversa</span>
                        </div>

                        {messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.userId === user.id ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${msg.userId === user.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/5'
                                    }`}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-gray-600 font-bold mt-2 uppercase tracking-tighter">{msg.time}</span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-6 bg-[#0a0a0a] border-t border-white/5 flex gap-4">
                        <input
                            type="text"
                            placeholder="Escreva algo..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all font-medium"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button className="bg-blue-600 p-3 rounded-xl text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                            <svg className="w-6 h-6 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
