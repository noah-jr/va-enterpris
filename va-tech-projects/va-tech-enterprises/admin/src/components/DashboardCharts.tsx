"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Download, FileText, Calendar, MessageSquare } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import EmptyChartState from "./EmptyChartState";

interface DashboardChartsProps {
    data: {
        contacts: Array<{ date: string; count: number }>;
        subscribers: Array<{ date: string; count: number }>;
        chats: Array<{ date: string; count: number }>;
        pageViewsByHour?: Array<{ hour: string; count: number }>;
        blogViewsByHour?: Array<{ hour: string; count: number }>;
    };
    analyticsData?: {
        totalPageViews: number;
        uniqueVisitors: number;
    };
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-xl bg-white p-4 shadow-xl dark:bg-popover border border-gray-100 dark:border-border">
                <p className="mb-2 text-sm font-bold text-foreground dark:text-white">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function DashboardCharts({ data, analyticsData }: DashboardChartsProps) {
    // Combinar dados para gráfico comparativo
    const combinedData = data.contacts.map((contact, index) => ({
        date: contact.date,
        contactos: contact.count,
        subscritores: data.subscribers[index]?.count || 0
    }));

    // Exportar dados para CSV
    const exportToCSV = () => {
        const csvContent = [
            // Contactos
            ['Contactos por Dia'],
            ['Data', 'Quantidade'],
            ...data.contacts.map(item => [item.date, item.count]),
            [''],
            // Subscritores
            ['Subscritores por Dia'],
            ['Data', 'Quantidade'],
            ...data.subscribers.map(item => [item.date, item.count]),
            [''],
            // PageViews
            ...(data.pageViewsByHour ? [
                ['Visualizações por Hora'],
                ['Hora', 'Quantidade'],
                ...data.pageViewsByHour.map(item => [item.hour, item.count]),
                ['']
            ] : []),
            // Blog Views
            ...(data.blogViewsByHour ? [
                ['Visualizações de Blogs por Hora'],
                ['Hora', 'Quantidade'],
                ...data.blogViewsByHour.map(item => [item.hour, item.count])
            ] : []),
            [''],
            // Chats
            ['Novos Chats por Dia'],
            ['Data', 'Quantidade'],
            ...data.chats.map(item => [item.date, item.count])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Exportar dados para PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        // ... (lógica de PDF mantida, simplificada para brevidade se necessário, mas mantendo a funcional)
        // Título
        doc.setFontSize(20);
        doc.text('Relatório de Analytics - VA Tech', 14, 20);
        doc.setFontSize(10);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, 14, 28);

        // Analytics Summary
        if (analyticsData) {
            doc.setFontSize(14);
            doc.text('Resumo Geral', 14, 40);
            autoTable(doc, {
                startY: 45,
                head: [['Métrica', 'Valor']],
                body: [
                    ['Total de Visualizações (24h)', analyticsData.totalPageViews.toString()],
                    ['Visitantes Únicos (24h)', analyticsData.uniqueVisitors.toString()]
                ],
            });
        }
        // ... resto da exportação ... removido

        // Contactos
        const contactsY = (doc as any).lastAutoTable?.finalY || 60;
        doc.setFontSize(14);
        doc.text('Contactos (Últimos 7 dias)', 14, contactsY + 10);
        autoTable(doc, {
            startY: contactsY + 15,
            head: [['Data', 'Quantidade']],
            body: data.contacts.map(item => [item.date, item.count.toString()]),
        });

        // Subscritores
        const subscribersY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.text('Subscritores (Últimos 7 dias)', 14, subscribersY);
        autoTable(doc, {
            startY: subscribersY + 5,
            head: [['Data', 'Quantidade']],
            body: data.subscribers.map(item => [item.date, item.count.toString()]),
        });

        // PageViews por hora (nova página)
        if (data.pageViewsByHour && data.pageViewsByHour.length > 0) {
            doc.addPage();
            doc.setFontSize(14);
            doc.text('Visualizações por Hora (Últimas 24h)', 14, 20);
            autoTable(doc, {
                startY: 25,
                head: [['Hora', 'Visualizações']],
                body: data.pageViewsByHour.map(item => [item.hour, item.count.toString()]),
            });
        }

        // Blog Views por hora
        if (data.blogViewsByHour && data.blogViewsByHour.length > 0) {
            const blogY = (doc as any).lastAutoTable?.finalY || 20;
            doc.setFontSize(14);
            doc.text('Visualizações de Blogs por Hora (Últimas 24h)', 14, blogY + 10);
            autoTable(doc, {
                startY: blogY + 15,
                head: [['Hora', 'Visualizações']],
                body: data.blogViewsByHour.map(item => [item.hour, item.count.toString()]),
            });
        }

        doc.save(`relatorio_analytics_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const cardClasses = "!border-none !bg-white dark:!bg-card shadow-sm rounded-[20px] dark:shadow-none border dark:border-border";
    const titleClasses = "text-lg font-bold text-foreground dark:text-white";
    const descClasses = "text-sm font-medium text-gray-500 dark:text-gray-400";

    // Icon wrapper style
    const iconWrapper = "flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-900 dark:bg-muted dark:text-white mr-4";

    return (
        <div className="space-y-6">
            {/* Header com botões */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-foreground dark:text-white">Análise de Dados</h2>
                <div className="flex gap-2">
                    <Button onClick={exportToCSV} variant="outline" size="sm" className="rounded-xl border-gray-200 dark:border-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Download className="h-4 w-4 mr-2" />
                        CSV
                    </Button>
                    <Button onClick={exportToPDF} variant="outline" size="sm" className="rounded-xl border-gray-200 dark:border-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                        <FileText className="h-4 w-4 mr-2" />
                        PDF
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Contactos */}
                <Card className={cardClasses}>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className={titleClasses}>Contactos</CardTitle>
                                <CardDescription className={descClasses}>Últimos 7 dias</CardDescription>
                            </div>
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FFF5E8] dark:bg-orange-900/20">
                                <Calendar className="w-5 h-5 text-orange-500" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {data.contacts.length === 0 || data.contacts.every(d => d.count === 0) ? (
                            <EmptyChartState
                                title="Sem Contactos"
                                description="Aguardando dados..."
                            />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={data.contacts}>
                                    <defs>
                                        <linearGradient id="colorContacts" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FFB547" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#FFB547" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-xs font-medium text-gray-500" />
                                    <YAxis axisLine={false} tickLine={false} className="text-xs font-medium text-gray-500" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="count" stroke="#FFB547" strokeWidth={3} fillOpacity={1} fill="url(#colorContacts)" name="Contactos" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Newsletter */}
                <Card className={cardClasses}>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className={titleClasses}>Newsletter</CardTitle>
                                <CardDescription className={descClasses}>Novos subscritores</CardDescription>
                            </div>
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E6F9F2] dark:bg-green-900/20">
                                <FileText className="w-5 h-5 text-emerald-500" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {data.subscribers.length === 0 || data.subscribers.every(d => d.count === 0) ? (
                            <EmptyChartState
                                title="Sem Subscritores"
                                description="Aguardando dados..."
                            />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.subscribers}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-xs font-medium text-gray-500" />
                                    <YAxis axisLine={false} tickLine={false} className="text-xs font-medium text-gray-500" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" fill="#05CD99" radius={[6, 6, 0, 0]} name="Subscritores" barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* PageViews Chart - Full Width if available */}
                {data.pageViewsByHour && data.pageViewsByHour.length > 0 && (
                    <Card className={`${cardClasses} md:col-span-2`}>
                        <CardHeader>
                            <CardTitle className={titleClasses}>Tráfego nas últimas 24h</CardTitle>
                            <CardDescription className={descClasses}>Visualizações de página por hora</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={data.pageViewsByHour}>
                                    <defs>
                                        <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#64748B" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#64748B" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
                                    <XAxis dataKey="hour" axisLine={false} tickLine={false} className="text-xs font-medium text-gray-500" />
                                    <YAxis axisLine={false} tickLine={false} className="text-xs font-medium text-gray-500" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="count" stroke="#64748B" strokeWidth={3} fillOpacity={1} fill="url(#colorPageViews)" name="Visualizações" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}
                {/* Gráfico Comparativo Mobile/Desktop */}
                <Card className={`${cardClasses} md:col-span-2`}>
                    <CardHeader>
                        <CardTitle className={titleClasses}>Tendências Comparativas</CardTitle>
                        <CardDescription className={descClasses}>Contactos vs Newsletter</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={combinedData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-xs font-medium text-gray-500" />
                                <YAxis axisLine={false} tickLine={false} className="text-xs font-medium text-gray-500" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line type="monotone" dataKey="contactos" stroke="#FFB547" strokeWidth={3} dot={{ r: 4, fill: "#FFB547" }} activeDot={{ r: 6 }} name="Contactos" />
                                <Line type="monotone" dataKey="subscritores" stroke="#05CD99" strokeWidth={3} dot={{ r: 4, fill: "#05CD99" }} activeDot={{ r: 6 }} name="Subscritores" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Chats Activity */}
                <Card className={cardClasses}>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className={titleClasses}>Atividade de Chat</CardTitle>
                                <CardDescription className={descClasses}>Novas conversas (7 dias)</CardDescription>
                            </div>
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20">
                                <MessageSquare className="w-5 h-5 text-blue-500" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {data.chats.length === 0 || data.chats.every(d => d.count === 0) ? (
                            <EmptyChartState
                                title="Sem Chats"
                                description="Aguardando interações..."
                            />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={data.chats}>
                                    <defs>
                                        <linearGradient id="colorChats" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-xs font-medium text-gray-500" />
                                    <YAxis axisLine={false} tickLine={false} className="text-xs font-medium text-gray-500" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorChats)" name="Chats" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

