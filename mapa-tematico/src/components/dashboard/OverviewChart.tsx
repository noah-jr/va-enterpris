'use client';

import {
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Area,
    AreaChart,
    CartesianGrid
} from "recharts";
import React from "react";
import { useTheme } from "next-themes";

interface OverviewChartProps {
    data?: { label: string; value: number }[];
    isLoading?: boolean;
    color?: string;
}

export function OverviewChart({ data, isLoading, color }: OverviewChartProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const colors = {
        primary: color || (isDark ? '#ffffff' : '#000000'),
        grid: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        text: isDark ? '#444444' : '#aaaaaa',
    };

    if (isLoading || !data || data.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center font-tactical text-[8px] font-black uppercase tracking-[0.3em] opacity-20">
                Aguardando Telemetria...
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.primary} stopOpacity={0.1} />
                        <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="label"
                    stroke={colors.text}
                    fontSize={7}
                    tickLine={false}
                    axisLine={false}
                    className="font-tactical font-black uppercase tracking-[0.2em]"
                />
                <YAxis
                    stroke={colors.text}
                    fontSize={7}
                    tickLine={false}
                    axisLine={false}
                    className="font-tactical font-black uppercase"
                />
                <CartesianGrid strokeDasharray="0" vertical={false} stroke={colors.grid} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: isDark ? '#000000' : '#ffffff',
                        borderRadius: '0px',
                        border: '1px solid #222222',
                        fontSize: '8px',
                        fontFamily: 'ui-monospace, monospace',
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        boxShadow: 'none',
                        padding: '10px'
                    }}
                    itemStyle={{ color: colors.primary }}
                    cursor={{ stroke: colors.primary, strokeWidth: 1 }}
                />
                <Area
                    type="stepAfter"
                    dataKey="value"
                    stroke={colors.primary}
                    strokeWidth={1.5}
                    fill="url(#chartGradient)"
                    name="NÍVEL_OPS"
                    animationDuration={1500}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
