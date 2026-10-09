'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function NewEvent() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        data: '',
        local: '',
        vagas: 0,
        image_url: '',
        preco_min: 0,
        tickets: [
            { tipo: 'Geral', preco: 0, quantidade: 0 }
        ]
    });

    const handleAddTicket = () => {
        setFormData({
            ...formData,
            tickets: [...formData.tickets, { tipo: '', preco: 0, quantidade: 0 }]
        });
    };

    const handleTicketChange = (index: number, field: string, value: any) => {
        const newTickets = [...formData.tickets];
        (newTickets[index] as any)[field] = field === 'tipo' ? value : Number(value);
        setFormData({ ...formData, tickets: newTickets });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:3002/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    data: new Date(formData.data).toISOString(),
                    vagas: Number(formData.vagas),
                    preco_min: Number(formData.preco_min),
                    status: 'PUBLICADO'
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erro ao criar evento');
            }

            router.push('/admin');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user || (user.role !== 'ADMIN' && user.role !== 'ORGANIZADOR')) {
        return <div className="min-h-screen bg-black" />;
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-24 px-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-black mb-4">Criar Novo <span className="text-blue-500">Evento</span></h1>
                    <p className="text-gray-400">Preencha os detalhes abaixo para publicar uma nova experiência.</p>
                </header>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-2xl mb-8 font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Sessão: Info Geral */}
                    <section className="bg-[#121212] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
                        <h3 className="text-2xl font-black mb-8 border-b border-white/5 pb-4">Informação Geral</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1">Título do Evento</label>
                                <input
                                    type="text"
                                    className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    value={formData.titulo}
                                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1">Localização</label>
                                <input
                                    type="text"
                                    className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    value={formData.local}
                                    onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1">Data e Hora</label>
                                <input
                                    type="datetime-local"
                                    className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    value={formData.data}
                                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1">Vagas Totais</label>
                                <input
                                    type="number"
                                    className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    value={formData.vagas}
                                    onChange={(e) => setFormData({ ...formData, vagas: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-3 md:col-span-2">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1">Descrição Detalhada</label>
                                <textarea
                                    rows={4}
                                    className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                                    value={formData.descricao}
                                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    {/* Sessão: Mídia e Preço */}
                    <section className="bg-[#121212] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
                        <h3 className="text-2xl font-black mb-8 border-b border-white/5 pb-4">Mídia e Destaque</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1">URL da Imagem (Banner)</label>
                                <input
                                    type="text"
                                    placeholder="https://images.unsplash..."
                                    className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1">Preço Inicial (Exibição)</label>
                                <input
                                    type="number"
                                    className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    value={formData.preco_min}
                                    onChange={(e) => setFormData({ ...formData, preco_min: Number(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    {/* Sessão: Bilhetes */}
                    <section className="bg-[#121212] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
                        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                            <h3 className="text-2xl font-black">Tipos de Bilhete</h3>
                            <button
                                type="button"
                                onClick={handleAddTicket}
                                className="text-blue-500 font-bold hover:text-blue-400 transition-colors"
                            >
                                + Adicionar Outro
                            </button>
                        </div>

                        <div className="space-y-6">
                            {formData.tickets.map((ticket, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Tipo (Ex: Geral, VIP)</label>
                                        <input
                                            type="text"
                                            className="bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white outline-none"
                                            value={ticket.tipo}
                                            onChange={(e) => handleTicketChange(index, 'tipo', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Preço (Kz)</label>
                                        <input
                                            type="number"
                                            className="bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white outline-none"
                                            value={ticket.preco}
                                            onChange={(e) => handleTicketChange(index, 'preco', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Quantidade</label>
                                        <input
                                            type="number"
                                            className="bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white outline-none"
                                            value={ticket.quantidade}
                                            onChange={(e) => handleTicketChange(index, 'quantidade', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="flex justify-end gap-6">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-16 py-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-black text-xl transition-all shadow-xl shadow-blue-500/20 transform hover:scale-[1.02] active:scale-[0.95]"
                        >
                            {loading ? 'A Publicar...' : 'Publicar Evento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
