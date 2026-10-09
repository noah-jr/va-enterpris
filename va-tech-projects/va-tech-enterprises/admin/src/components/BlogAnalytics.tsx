"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, TrendingUp, Users, FileText, Calendar } from "lucide-react";
import EmptyChartState from "./EmptyChartState";

interface BlogAnalyticsProps {
    stats: {
        totalBlogViews: number;
        totalPosts: number;
        publishedPosts: number;
        uniqueVisitors: number;
        avgViewsPerDay: number;
        avgViewsPerVisitor: number;
    };
    topPosts: Array<{
        title: string;
        slug: string;
        views: number;
    }>;
    dailyViews: Array<{
        date: string;
        views: number;
        visitors: number;
    }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-xl bg-white p-4 shadow-xl dark:bg-card border border-gray-100 dark:border-white/5">
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

export default function BlogAnalytics({ stats, topPosts, dailyViews }: BlogAnalyticsProps) {
    const performanceData = [
        {
            label: "Total de Visualizações",
            value: stats.totalBlogViews,
            icon: Eye,
            color: "text-primary",
            bgColor: "bg-gray-100 dark:bg-muted"
        },
        {
            label: "Artigos Publicados",
            value: stats.publishedPosts,
            icon: FileText,
            color: "text-foreground",
            bgColor: "bg-muted/30 dark:bg-foreground/10"
        },
        {
            label: "Visitantes Únicos",
            value: stats.uniqueVisitors,
            icon: Users,
            color: "text-green-500",
            bgColor: "bg-green-50 dark:bg-green-500/10"
        },
        {
            label: "Média Visualizações/Dia",
            value: stats.avgViewsPerDay.toFixed(1),
            icon: Calendar,
            color: "text-orange-500",
            bgColor: "bg-orange-50 dark:bg-orange-500/10"
        },
        {
            label: "Média Views/Visitante",
            value: stats.avgViewsPerVisitor.toFixed(1),
            icon: TrendingUp,
            color: "text-red-500",
            bgColor: "bg-red-50 dark:bg-red-500/10"
        }
    ];

    const cardClasses = "!border-none !bg-white dark:!bg-card shadow-sm rounded-[20px] dark:shadow-none border dark:border-border";
    const titleClasses = "text-lg font-bold text-foreground dark:text-white";
    const descClasses = "text-sm font-medium text-muted-foreground";

    return (
        <div className="space-y-6">
            {/* Performance Cards */}
            <div>
                <h3 className="text-xl font-bold text-foreground dark:text-white mb-4 ml-1">Analytics de Blog & Notícias</h3>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                    {performanceData.map((metric, index) => (
                        <Card key={index} className="!border-none !bg-white dark:!bg-card shadow-sm rounded-[20px] dark:shadow-none hover:shadow-lg transition-all border dark:border-border">
                            <CardContent className="flex items-center p-4">
                                <div className={`rounded-full p-3 ${metric.bgColor} mr-4`}>
                                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground truncate w-[120px]" title={metric.label}>{metric.label}</p>
                                    <h4 className="text-xl font-bold text-foreground dark:text-white">{metric.value}</h4>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Visualizações Diárias */}
                <Card className={cardClasses}>
                    <CardHeader>
                        <CardTitle className={titleClasses}>Visualizações Diárias</CardTitle>
                        <CardDescription className={descClasses}>Últimos 7 dias</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {dailyViews.length === 0 || dailyViews.every(d => d.views === 0) ? (
                            <EmptyChartState
                                title="Sem Dados de Visualização"
                                description="Aguardando visualizações de blogs para gerar estatísticas."
                            />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={dailyViews}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        className="text-xs font-medium text-gray-500"
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        className="text-xs font-medium text-gray-500"
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="views"
                                        stroke="#64748B"
                                        strokeWidth={3}
                                        dot={{ fill: '#64748B', r: 4 }}
                                        activeDot={{ r: 6 }}
                                        name="Visualizações"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="visitors"
                                        stroke="#05CD99"
                                        strokeWidth={3}
                                        dot={{ fill: '#05CD99', r: 4 }}
                                        activeDot={{ r: 6 }}
                                        name="Visitantes Únicos"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Top Posts */}
                <Card className={cardClasses}>
                    <CardHeader>
                        <CardTitle className={titleClasses}>Artigos Mais Visualizados</CardTitle>
                        <CardDescription className={descClasses}>Top 5 artigos com mais acessos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topPosts.length === 0 ? (
                            <EmptyChartState
                                title="Sem Dados de Posts"
                                description="Publique artigos para ver as estatísticas de visualização."
                                icon={FileText}
                            />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topPosts} layout="vertical" margin={{ left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-gray-200 dark:stroke-gray-700" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="title"
                                        type="category"
                                        width={140}
                                        tick={{ fontSize: 11, fill: '#A3AED0' }}
                                        tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
                                        interval={0}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="views"
                                        fill="#64748B"
                                        radius={[0, 4, 4, 0]}
                                        barSize={20}
                                        name="Visualizações"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

