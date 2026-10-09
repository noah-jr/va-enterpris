"use client";

import { BarChart3, TrendingUp, Info } from "lucide-react";

interface EmptyChartStateProps {
    title: string;
    description?: string;
    icon?: React.ElementType;
}

export default function EmptyChartState({
    title,
    description = "Nenhum dado disponível para este período",
    icon: Icon = BarChart3
}: EmptyChartStateProps) {
    return (
        <div className="flex flex-col items-center justify-center h-[300px] text-center p-8">
            <div className="p-4 rounded-full bg-muted/30 mb-4">
                <Icon className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                {title}
            </h3>
            <p className="text-sm text-muted-foreground/70 max-w-sm">
                {description}
            </p>
            <div className="mt-6 p-3 rounded-lg bg-gray-50 dark:bg-muted/50 border border-gray-200 dark:border-gray-800">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p className="text-left">
                        Os dados serão exibidos automaticamente conforme as interações forem registradas.
                    </p>
                </div>
            </div>
        </div>
    );
}
