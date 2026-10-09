'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Calendar, ArrowUpRight } from 'lucide-react';

interface EventCardProps {
    id: string;
    titulo: string;
    data: string;
    local: string;
    image_url: string;
    preco_min: number;
}

export default function EventCard({ id, titulo, data, local, image_url, preco_min }: EventCardProps) {
    const dateObj = new Date(data);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString('pt-AO', { month: 'short' }).toUpperCase();

    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="group relative bg-white border border-dark/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10"
        >
            {/* Image Section */}
            <div className="relative h-80 w-full overflow-hidden">
                <img
                    src={image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80'}
                    alt={titulo}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Custom Date Badge */}
                <div className="absolute top-6 left-6 bg-white rounded-2xl p-3 shadow-xl flex flex-col items-center min-w-[60px]">
                    <span className="text-2xl font-black text-dark leading-none">{day}</span>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">{month}</span>
                </div>

                <div className="absolute bottom-6 right-6">
                    <Link
                        href={`/eventos/${id}`}
                        className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center translate-y-20 group-hover:translate-y-0 transition-transform duration-500 shadow-xl shadow-primary/30"
                    >
                        <ArrowUpRight className="w-6 h-6" />
                    </Link>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full">Classic</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-dark/40 border border-dark/10 px-3 py-1 rounded-full">Premium</span>
                    </div>
                    <span className="font-black text-dark text-lg leading-none">
                        {preco_min.toLocaleString('pt-AO')} <span className="text-xs font-bold text-dark/40 uppercase">Kz</span>
                    </span>
                </div>

                <h3 className="text-2xl font-black text-dark mb-4 leading-tight tracking-tighter group-hover:text-primary transition-colors">
                    {titulo}
                </h3>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-dark/50 font-medium">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-sm">{local}</span>
                    </div>
                    <div className="flex items-center gap-2 text-dark/50 font-medium">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm">20:00 - 23:30</span>
                    </div>
                </div>
            </div>

            <Link href={`/eventos/${id}`} className="absolute inset-0 z-10" />
        </motion.div>
    );
}

