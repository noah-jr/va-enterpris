'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface StatCardProps {
    title: string;
    value: number | string;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'primary' | 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'cyan' | 'yellow';
    href?: string;
    badge?: boolean;
}

const colorClasses = {
    primary: {
        icon: 'text-primary',
        bg: 'bg-primary/10',
        gradient: 'from-primary/5 to-primary/10',
        border: 'border-border',
    },
    // Remapeando Blue para Neutral para garantir remoção do azul
    blue: {
        icon: 'text-gray-900 dark:text-gray-100',
        bg: 'bg-gray-100 dark:bg-muted',
        gradient: 'from-gray-500/5 to-gray-600/5',
        border: 'border-border',
    },
    green: {
        icon: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-950',
        gradient: 'from-green-500/10 to-green-600/10',
        border: 'border-green-200 dark:border-green-800',
    },
    orange: {
        icon: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-950',
        gradient: 'from-orange-500/10 to-orange-600/10',
        border: 'border-orange-200 dark:border-orange-800',
    },
    purple: {
        icon: 'text-foreground dark:text-purple-400',
        bg: 'bg-muted/30 dark:bg-purple-950',
        gradient: 'from-foreground/10 to-foreground/10',
        border: 'border-purple-200 dark:border-purple-800',
    },
    red: {
        icon: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-950',
        gradient: 'from-red-500/10 to-red-600/10',
        border: 'border-red-200 dark:border-red-800',
    },
    cyan: {
        icon: 'text-foreground dark:text-cyan-400',
        bg: 'bg-muted/30 dark:bg-cyan-950',
        gradient: 'from-foreground/10 to-foreground/10',
        border: 'border-cyan-200 dark:border-cyan-800',
    },
    yellow: {
        icon: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-50 dark:bg-yellow-950',
        gradient: 'from-yellow-500/10 to-yellow-600/10',
        border: 'border-yellow-200 dark:border-yellow-800',
    },
};

export default function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color = 'primary',
    href,
    badge,
}: StatCardProps) {
    const classes = colorClasses[color];

    const content = (
        <Card
            className={cn(
                'relative overflow-hidden transition-all duration-300',
                href && 'cursor-pointer hover:shadow-lg hover:scale-[1.02]',
                'border-0 shadow-sm'
            )}
        >
            {/* Background Gradient */}
            <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', classes.gradient)} />

            {/* Badge */}
            {badge && (
                <div className="absolute top-2 right-2">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                </div>
            )}

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={cn('p-2 rounded-lg', classes.bg)}>
                    <Icon className={cn('h-4 w-4', classes.icon)} />
                </div>
            </CardHeader>

            <CardContent className="relative z-10">
                <div className="text-2xl font-bold">{value}</div>
                {subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                )}
                {trend && (
                    <div className="flex items-center gap-1 mt-2">
                        <span
                            className={cn(
                                'text-xs font-medium',
                                trend.isPositive ? 'text-green-600' : 'text-red-600'
                            )}
                        >
                            {trend.isPositive ? '+' : ''}
                            {trend.value}%
                        </span>
                        <span className="text-xs text-muted-foreground">vs último mês</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return content;
}
