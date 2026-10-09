'use client';

import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
    Ticket,
    Calendar,
    User,
    Settings,
    LogOut,
    History,
    CreditCard,
    Bell,
    TrendingUp,
    Star,
    MapPin,
    Clock,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function UserDashboard() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        { icon: Ticket, label: 'Meus Bilhetes', href: '/dashboard/bilhetes', badge: '3' },
        { icon: Calendar, label: 'Eventos Salvos', href: '/dashboard/salvos' },
        { icon: History, label: 'Histórico', href: '/dashboard/historico' },
        { icon: CreditCard, label: 'Pagamentos', href: '/dashboard/pagamentos' },
        { icon: User, label: 'Perfil', href: '/dashboard/perfil' },
        { icon: Settings, label: 'Definições', href: '/dashboard/definicoes' },
    ];

    const stats = [
        {
            label: 'Bilhetes Ativos',
            value: '3',
            icon: Ticket,
            trend: '+1 este mês',
            color: 'from-indigo-500 to-purple-500',
            bgColor: 'bg-indigo-500/10',
            textColor: 'text-indigo-400'
        },
        {
            label: 'Eventos Frequentados',
            value: '12',
            icon: Star,
            trend: '+2 este ano',
            color: 'from-pink-500 to-rose-500',
            bgColor: 'bg-pink-500/10',
            textColor: 'text-pink-400'
        },
        {
            label: 'Gasto Total',
            value: '45K',
            icon: TrendingUp,
            trend: 'AOA este ano',
            color: 'from-cyan-500 to-blue-500',
            bgColor: 'bg-cyan-500/10',
            textColor: 'text-cyan-400'
        },
    ];

    const upcomingEvents = [
        {
            id: 1,
            title: 'Gala Anual de Luanda 2024',
            date: '25 de Dezembro',
            time: '20:00',
            location: 'Centro de Convenções',
            image: 'https://images.unsplash.com/photo-1540575861501-7ad0582373f2?auto=format&fit=crop&q=80&w=400',
            type: 'VIP',
            status: 'Confirmado'
        },
        {
            id: 2,
            title: 'Festival de Música Africana',
            date: '15 de Janeiro',
            time: '18:00',
            location: 'Estádio Nacional',
            image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400',
            type: 'Regular',
            status: 'Confirmado'
        }
    ];

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex">
            {/* Sidebar */}
            <motion.aside
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-80 bg-gradient-to-b from-[#121212] to-[#0a0a0a] border-r border-white/5 flex flex-col p-8 hidden lg:flex"
            >
                {/* Logo */}
                <div className="mb-12">
                    <Link href="/">
                        <h2 className="text-3xl font-black text-white tracking-tight">
                            VA<span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">EVENTS</span>
                        </h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">Área do Internauta</p>
                    </Link>
                </div>

                {/* User Profile */}
                <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-black text-white text-xl shadow-lg">
                            {user?.nome?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-bold truncate">{user?.nome || 'Utilizador'}</p>
                            <p className="text-gray-500 text-sm truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                    {menuItems.map((item, index) => (
                        <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                href={item.href}
                                className={`flex items-center justify-between gap-4 px-5 py-4 rounded-2xl font-bold transition-all group ${pathname === item.href
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className="px-2 py-1 bg-white/10 rounded-full text-xs font-black">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        </motion.div>
                    ))}
                </nav>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="mt-8 flex items-center gap-4 px-5 py-4 text-red-400 font-bold hover:bg-red-500/10 rounded-2xl transition-all group"
                >
                    <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Sair da Conta
                </button>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="container-custom py-12">
                    {/* Header */}
                    <motion.header
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
                    >
                        <div>
                            <h1 className="text-5xl font-black text-white tracking-tight mb-2">
                                Olá, <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{user?.nome?.split(' ')[0] || 'Internauta'}</span> 👋
                            </h1>
                            <p className="text-gray-400 text-lg font-medium">
                                Bem-vindo de volta à sua área exclusiva
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all relative group">
                                <Bell className="w-6 h-6 group-hover:animate-pulse" />
                                <span className="absolute top-3 right-3 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                            </button>
                            <Link
                                href="/dashboard/perfil"
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-xl shadow-lg hover:scale-105 transition-transform"
                            >
                                {user?.nome?.[0] || 'U'}
                            </Link>
                        </div>
                    </motion.header>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="card-modern group hover:scale-105 transition-all cursor-pointer"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={`w-7 h-7 ${stat.textColor}`} />
                                </div>
                                <p className="text-gray-400 font-bold uppercase text-xs tracking-wider mb-2">
                                    {stat.label}
                                </p>
                                <h3 className="text-5xl font-black text-white mb-2">
                                    {stat.value}
                                </h3>
                                <p className={`${stat.textColor} font-bold text-sm flex items-center gap-1`}>
                                    <TrendingUp className="w-4 h-4" />
                                    {stat.trend}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Upcoming Events */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-4xl font-black text-white tracking-tight">
                                Próximos <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Eventos</span>
                            </h2>
                            <Link
                                href="/dashboard/bilhetes"
                                className="flex items-center gap-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors group"
                            >
                                Ver todos
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {upcomingEvents.map((event, i) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                    className="card-modern group hover:scale-[1.02] transition-all cursor-pointer"
                                >
                                    <div className="flex gap-6">
                                        {/* Event Image */}
                                        <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 relative">
                                            <img
                                                src={event.image}
                                                alt={event.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                        </div>

                                        {/* Event Details */}
                                        <div className="flex-1 flex flex-col justify-center">
                                            <div className="flex gap-2 mb-3">
                                                <span className={`px-3 py-1 ${event.type === 'VIP' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-500/20 text-gray-400'} text-xs font-bold rounded-full uppercase tracking-tight`}>
                                                    {event.type}
                                                </span>
                                                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full uppercase tracking-tight">
                                                    {event.status}
                                                </span>
                                            </div>
                                            <h4 className="text-xl font-black text-white leading-tight mb-3 group-hover:text-indigo-400 transition-colors">
                                                {event.title}
                                            </h4>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                                                    <Calendar className="w-4 h-4" />
                                                    {event.date} • {event.time}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                                                    <MapPin className="w-4 h-4" />
                                                    {event.location}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Quick Actions */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="mt-12"
                    >
                        <h2 className="text-3xl font-black text-white tracking-tight mb-6">
                            Ações Rápidas
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { icon: Ticket, label: 'Comprar Bilhetes', href: '/eventos', color: 'from-indigo-500 to-purple-500' },
                                { icon: Calendar, label: 'Explorar Eventos', href: '/eventos', color: 'from-pink-500 to-rose-500' },
                                { icon: History, label: 'Ver Histórico', href: '/dashboard/historico', color: 'from-cyan-500 to-blue-500' },
                                { icon: User, label: 'Editar Perfil', href: '/dashboard/perfil', color: 'from-orange-500 to-red-500' },
                            ].map((action, i) => (
                                <Link
                                    key={i}
                                    href={action.href}
                                    className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <action.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <p className="text-white font-bold group-hover:text-indigo-400 transition-colors">
                                        {action.label}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </motion.section>
                </div>
            </main>
        </div>
    );
}
