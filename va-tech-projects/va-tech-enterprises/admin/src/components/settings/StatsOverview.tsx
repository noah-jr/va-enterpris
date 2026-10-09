import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, FileText, Mail, Newspaper, Users, CheckCircle, XCircle } from "lucide-react";

interface StatsOverviewProps {
    stats: {
        totalServices: number;
        activeServices: number;
        totalPosts: number;
        publishedPosts: number;
        totalContacts: number;
        newContacts: number;
        totalSubscribers: number;
        activeSubscribers: number;
        totalUsers: number;
    };
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
    const statCards = [
        {
            title: "Serviços",
            icon: Briefcase,
            total: stats.totalServices,
            active: stats.activeServices,
            label: "ativos"
        },
        {
            title: "Artigos",
            icon: FileText,
            total: stats.totalPosts,
            active: stats.publishedPosts,
            label: "publicados"
        },
        {
            title: "Contactos",
            icon: Mail,
            total: stats.totalContacts,
            active: stats.newContacts,
            label: "novos"
        },
        {
            title: "Newsletter",
            icon: Newspaper,
            total: stats.totalSubscribers,
            active: stats.activeSubscribers,
            label: "ativos"
        },
        {
            title: "Utilizadores",
            icon: Users,
            total: stats.totalUsers,
            active: stats.totalUsers,
            label: "total"
        }
    ];

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Visão Geral do Sistema</CardTitle>
                    <CardDescription>Estatísticas gerais da plataforma.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {statCards.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <Card key={stat.title}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            {stat.title}
                                        </CardTitle>
                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stat.total}</div>
                                        <p className="text-xs text-muted-foreground">
                                            {stat.active} {stat.label}
                                        </p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                                <div
                                                    className="bg-primary h-2 rounded-full transition-all"
                                                    style={{ width: `${stat.total > 0 ? (stat.active / stat.total) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {stat.total > 0 ? Math.round((stat.active / stat.total) * 100) : 0}%
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Conteúdo Recente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Artigos publicados</span>
                            <span className="font-medium">{stats.publishedPosts}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Rascunhos</span>
                            <span className="font-medium">{stats.totalPosts - stats.publishedPosts}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Serviços ativos</span>
                            <span className="font-medium">{stats.activeServices}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Interações</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Mensagens não lidas</span>
                            <span className="font-medium text-foreground">{stats.newContacts}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Total de contactos</span>
                            <span className="font-medium">{stats.totalContacts}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Subscritores ativos</span>
                            <span className="font-medium text-green-600">{stats.activeSubscribers}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
