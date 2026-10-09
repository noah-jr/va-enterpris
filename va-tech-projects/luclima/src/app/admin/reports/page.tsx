'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { FileText, Download, Calendar, Loader2, TrendingUp, Users, Briefcase, Mail } from 'lucide-react';

export default function AdminReportsPage() {
    const [reportType, setReportType] = useState('summary');
    const [dateRange, setDateRange] = useState('30d');

    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await fetch('/api/admin/stats');
            if (!res.ok) throw new Error('Erro ao carregar estatísticas');
            return res.json();
        }
    });

    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#6B7280'];

    const contentData = stats ? [
        { name: 'Projectos', count: stats.counts.projects },
        { name: 'Serviços', count: stats.counts.services },
        { name: 'Blog Posts', count: stats.counts.posts },
        { name: 'Contactos', count: stats.counts.contacts },
    ] : [];

    const handleExport = () => {
        alert('Funcionalidade de exportação em desenvolvimento.');
    };

    return (
        <div className="p-4 lg:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                    Relatórios e Análises
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Visualize o desempenho global do ecossistema Luclima
                </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm font-medium focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    >
                        <option value="summary">Resumo Geral</option>
                        <option value="users">Crescimento de Utilizadores</option>
                        <option value="content">Distribuição de Conteúdo</option>
                        <option value="system">Estado do Sistema</option>
                    </select>

                    <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 bg-white dark:bg-gray-950">
                        <Calendar size={16} className="text-gray-500" />
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="bg-transparent outline-none text-xs font-bold uppercase tracking-tight"
                        >
                            <option value="7d">Últimos 7 dias</option>
                            <option value="30d">Últimos 30 dias</option>
                            <option value="90d">Últimos 3 meses</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold text-sm hover:opacity-90 transition-all shadow-lg uppercase"
                >
                    <Download size={18} />
                    Exportar Relatório
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <Loader2 size={48} className="text-black dark:text-white animate-spin mb-4" />
                    <p className="text-gray-500">A processar dados...</p>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Charts Area */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm min-h-[450px]">
                        {reportType === 'summary' && (
                            <div className="space-y-8">
                                <h3 className="text-lg font-bold text-black dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                                    <TrendingUp size={20} />
                                    Resumo de Actividade
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Projectos</p>
                                        <p className="text-3xl font-bold text-black dark:text-white">{stats.counts.projects}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Solicitações</p>
                                        <p className="text-3xl font-bold text-black dark:text-white">{stats.counts.requests}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Contactos</p>
                                        <p className="text-3xl font-bold text-black dark:text-white">{stats.counts.contacts}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Utilizadores</p>
                                        <p className="text-3xl font-bold text-black dark:text-white">{stats.counts.users}</p>
                                    </div>
                                </div>
                                <div className="h-[300px] w-full mt-8">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={contentData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.96)' }}
                                            />
                                            <Bar dataKey="count" fill="black" radius={[6, 6, 0, 0]} barSize={40} className="dark:fill-white" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {reportType === 'users' && (
                            <>
                                <h3 className="text-lg font-bold text-black dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                                    <Users size={20} />
                                    Curva de Crescimento
                                </h3>
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats.userGrowth}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                                            <YAxis axisLine={false} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.96)' }}
                                            />
                                            <Legend verticalAlign="top" height={36} />
                                            <Line type="monotone" dataKey="users" stroke="#10B981" name="Utilizadores Totais" strokeWidth={4} dot={{ r: 6, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </>
                        )}

                        {reportType === 'content' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-bold text-black dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                                        <Briefcase size={20} />
                                        Estado dos Projectos
                                    </h3>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stats.projectStatus}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {stats.projectStatus.map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                                        {stats.projectStatus.map((entry: any, index: number) => (
                                            <div key={entry.name} className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tighter">{entry.name}: {entry.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-black dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                                        <Mail size={20} />
                                        Solicitações de Serviço
                                    </h3>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stats.requestsStatus}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {stats.requestsStatus.map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                                        {stats.requestsStatus.map((entry: any, index: number) => (
                                            <div key={entry.name} className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }} />
                                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tighter">{entry.name}: {entry.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {reportType === 'system' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
                                    <h4 className="text-xs font-bold text-green-700 dark:text-green-500 uppercase mb-2">Uptime do Servidor</h4>
                                    <p className="text-4xl font-bold text-green-600">99.9%</p>
                                    <p className="text-xs text-green-600 mt-2 font-medium">Operacional</p>
                                </div>
                                <div className="p-6 bg-gray-50 dark:bg-gray-900/10 rounded-xl border border-gray-100 dark:border-gray-900/30">
                                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-900 uppercase mb-2">Tempo de Resposta</h4>
                                    <p className="text-4xl font-bold text-black">185ms</p>
                                    <p className="text-xs text-black mt-2 font-medium">Excelente em Luanda</p>
                                </div>
                                <div className="p-6 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/30">
                                    <h4 className="text-xs font-bold text-orange-700 dark:text-orange-500 uppercase mb-2">Segurança</h4>
                                    <p className="text-4xl font-bold text-orange-600">A+</p>
                                    <p className="text-xs text-orange-600 mt-2 font-medium">SSL Activo & Firewall</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
