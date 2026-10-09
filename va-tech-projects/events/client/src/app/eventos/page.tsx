'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';
import EventCard from '@/components/EventCard';

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadEvents() {
            try {
                const data = await apiService.getEvents();
                setEvents(data);
            } catch (error) {
                console.error("Erro:", error);
            } finally {
                setLoading(false);
            }
        }
        loadEvents();
    }, []);

    return (
        <div className="bg-[#0a0a0a] min-h-screen pt-32 pb-24 px-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-20 text-center">
                    <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-none">
                        Todos os <span className="text-blue-500 underline decoration-blue-500/20 underline-offset-[10px]">Eventos</span>
                    </h1>
                    <p className="text-gray-400 text-xl max-w-2xl mx-auto font-medium">
                        Explore a nossa agenda completa e não perca os melhores momentos que Angola tem para oferecer.
                    </p>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-12">
                        {events.length > 0 ? (
                            events.map((event: any) => (
                                <EventCard
                                    key={event.id}
                                    id={event.id}
                                    titulo={event.titulo}
                                    data={event.data}
                                    local={event.local}
                                    image_url={event.image_url}
                                    preco_min={event.preco_min || 0}
                                />
                            ))
                        ) : (
                            // Mock items if empty
                            [1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="opacity-40 animate-pulse bg-white/5 h-[400px] rounded-[2rem]" />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
