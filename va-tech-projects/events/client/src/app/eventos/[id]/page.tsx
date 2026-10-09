'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function EventDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const { user, token } = useAuth();

    // Estado dos bilhetes selecionados
    const [selectedTickets, setSelectedTickets] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        async function loadEvent() {
            try {
                const data = await apiService.getEventById(id as string);
                setEvent(data);
            } catch (error) {
                console.error("Erro:", error);
            } finally {
                setLoading(false);
            }
        }
        loadEvent();
    }, [id]);

    const handleUpdateQuantity = (ticketId: string, delta: number) => {
        setSelectedTickets(prev => {
            const current = prev[ticketId] || 0;
            const next = Math.max(0, current + delta);
            return { ...prev, [ticketId]: next };
        });
    };

    const calculateTotal = () => {
        if (!event || !event.tickets) return 0;
        return event.tickets.reduce((acc: number, t: any) => {
            return acc + (t.preco * (selectedTickets[t.id] || 0));
        }, 0);
    };

    const handlePurchase = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        const items = Object.entries(selectedTickets)
            .filter(([_, qty]) => qty > 0)
            .map(([ticketId, qty]) => ({
                ticket_id: ticketId,
                quantidade: qty
            }));

        if (items.length === 0) {
            alert('Selecione pelo menos um bilhete');
            return;
        }

        setPurchaseLoading(true);
        try {
            const res = await fetch('http://localhost:3002/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    items,
                    metodo_pagamento: 'MULTICAIXA_EXPRESS' // Simulado
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erro ao processar compra');
            }

            const order = await res.json();
            alert('Compra realizada com sucesso! O seu bilhete digital foi gerado.');
            router.push('/admin'); // Por agora, redireciona para ver o resumo ou algo assim
        } catch (error: any) {
            alert(error.message);
        } finally {
            setPurchaseLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!event) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
            <h2 className="text-3xl font-black">Evento não encontrado.</h2>
        </div>
    );

    const total = calculateTotal();

    return (
        <div className="bg-[#0a0a0a] min-h-screen pt-24">
            {/* Hero do Evento */}
            <div className="relative h-[60vh] w-full">
                <img
                    src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80'}
                    className="w-full h-full object-cover"
                    alt={event.titulo}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-black mb-6 uppercase tracking-widest">
                            Destaque
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight max-w-4xl">
                            {event.titulo}
                        </h1>
                        <div className="flex flex-wrap gap-8 text-white/80 font-bold text-lg">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(event.data).toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                {event.local}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-12 py-20 grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Info Col */}
                <div className="lg:col-span-2">
                    <h2 className="text-3xl font-black text-white mb-8 border-b border-white/10 pb-4">Sobre o Evento</h2>
                    <p className="text-gray-400 text-xl leading-relaxed mb-12">
                        {event.descricao || "Participe nesta experiência inesquecível organizada pela VA Events."}
                    </p>

                    <h2 className="text-3xl font-black text-white mb-8 border-b border-white/10 pb-4">Seleção de Bilhetes</h2>
                    <div className="space-y-6">
                        {(event.tickets || []).map((ticket: any) => (
                            <div key={ticket.id} className="bg-[#121212] p-8 rounded-[2rem] border border-white/5 flex justify-between items-center group hover:border-blue-500/50 transition-all shadow-xl hover:shadow-blue-500/5">
                                <div>
                                    <h4 className="text-2xl font-black text-white mb-1">{ticket.tipo}</h4>
                                    <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
                                        Disponíveis: {ticket.quantidade}
                                    </p>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-white">
                                            {Number(ticket.preco).toLocaleString('pt-AO')} <span className="text-blue-500 text-sm">Kz</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/10">
                                        <button
                                            onClick={() => handleUpdateQuantity(ticket.id, -1)}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white font-black"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center font-black text-xl">{selectedTickets[ticket.id] || 0}</span>
                                        <button
                                            onClick={() => handleUpdateQuantity(ticket.id, 1)}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Purchase */}
                <div className="lg:col-span-1">
                    <div className="sticky top-32 bg-[#121212] p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
                        <h3 className="text-2xl font-black text-white mb-8">Resumo do Pedido</h3>

                        <div className="space-y-6 mb-10">
                            {Object.entries(selectedTickets).filter(([_, qty]) => qty > 0).map(([id, qty]) => {
                                const t = event.tickets.find((x: any) => x.id === id);
                                return (
                                    <div key={id} className="flex justify-between items-center text-gray-400 font-bold">
                                        <span>{qty}x {t.tipo}</span>
                                        <span className="text-white">{(qty * t.preco).toLocaleString('pt-AO')} Kz</span>
                                    </div>
                                );
                            })}

                            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                <span className="text-xl font-bold text-gray-500 uppercase tracking-widest text-xs">Total a Pagar</span>
                                <span className="text-3xl font-black text-blue-500">{total.toLocaleString('pt-AO')} Kz</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePurchase}
                            disabled={total === 0 || purchaseLoading}
                            className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-black text-xl transition-all shadow-xl shadow-blue-500/20 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {purchaseLoading ? 'A Processar...' : 'Finalizar Compra'}
                        </button>

                        <p className="text-center text-gray-500 text-sm mt-6 font-medium">
                            Venda Segura via VA Events. Ao comprar, aceita os nossos termos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
