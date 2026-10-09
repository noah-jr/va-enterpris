"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, Eye, Users, Mail } from "lucide-react";

interface StatsInsightsProps {
    analytics: {
        totalPageViews: number;
        uniqueVisitors: number;
        totalContacts: number;
        newContacts: number;
        totalSubscribers: number;
        activeSubscribers: number;
    };
    trends?: {
        pageViewsChange?: number;
        contactsChange?: number;
        subscribersChange?: number;
    };
}

export default function StatsInsights({ analytics, trends }: StatsInsightsProps) {
    const getTrendIcon = (change: number | undefined) => {
        if (!change) return null;
        return change > 0
            ? <TrendingUp className="h-4 w-4 text-green-500" />
            : <TrendingDown className="h-4 w-4 text-red-500" />;
    };

    const getTrendText = (change: number | undefined) => {
        if (!change) return "Estável";
        const absChange = Math.abs(change);
        const direction = change > 0 ? "aumento" : "queda";
        return `${absChange}% de ${direction}`;
    };

    const insights = [
        {
            label: "Visualizações (24h)",
            value: analytics.totalPageViews,
            icon: Eye,
            bgIcon: "bg-gray-100 dark:bg-muted",
            iconColor: "text-gray-600 dark:text-gray-300",
            description: `${analytics.uniqueVisitors} visitantes únicos`
        },
        {
            label: "Engajamento",
            value: analytics.totalPageViews > 0
                ? `${((analytics.uniqueVisitors / analytics.totalPageViews) * 100).toFixed(1)}%`
                : "0%",
            icon: Activity,
            bgIcon: "bg-muted/30 dark:bg-foreground/10",
            iconColor: "text-foreground",
            description: "Visitantes únicos vs total"
        },
        {
            label: "Novos Contactos",
            value: analytics.newContacts,
            icon: Mail,
            bgIcon: "bg-orange-50 dark:bg-orange-500/10",
            iconColor: "text-orange-500",
            description: `${analytics.totalContacts} total`
        },
        {
            label: "Taxa Subscrição",
            value: analytics.totalSubscribers > 0
                ? `${((analytics.activeSubscribers / analytics.totalSubscribers) * 100).toFixed(1)}%`
                : "0%",
            icon: Users,
            bgIcon: "bg-green-50 dark:bg-green-500/10",
            iconColor: "text-green-500",
            description: `${analytics.activeSubscribers} ativos`
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {insights.map((insight, index) => (
                <Card key={index} className="!border-none !bg-white dark:!bg-card shadow-sm rounded-[20px] dark:shadow-none h-full transition-all hover:shadow-lg border dark:border-border">
                    <CardContent className="flex items-center p-4">
                        <div className={`rounded-full p-3 ${insight.bgIcon} mr-4`}>
                            <insight.icon className={`h-6 w-6 ${insight.iconColor}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{insight.label}</p>
                            <h4 className="text-xl font-bold text-foreground dark:text-white">{insight.value}</h4>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {insight.description}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

