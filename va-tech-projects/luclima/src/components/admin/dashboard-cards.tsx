import { BarChart3, TrendingUp, Users, FileText } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    trend?: string;
    icon: React.ElementType;
}

export function StatCard({ title, value, trend, icon: Icon }: StatCardProps) {
    return (
        <div className="relative group">
            {/* Liquid Glass Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/10 dark:to-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10" />

            {/* Content */}
            <div className="relative p-6 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
                            {title}
                        </p>
                        <h3 className="font-space text-4xl font-black text-black dark:text-white tracking-tighter">
                            {value}
                        </h3>
                        {trend && (
                            <p className="text-[9px] font-black uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                                <TrendingUp size={12} />
                                {trend}
                            </p>
                        )}
                    </div>
                    <div className="p-3 bg-black/5 dark:bg-white/5">
                        <Icon size={20} className="text-black dark:text-white" strokeWidth={2.5} />
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ChartCardProps {
    title: string;
    children: React.ReactNode;
}

export function ChartCard({ title, children }: ChartCardProps) {
    return (
        <div className="relative group">
            {/* Liquid Glass Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/10 dark:to-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10" />

            {/* Content */}
            <div className="relative p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-black/10 dark:border-white/10 pb-4">
                    <BarChart3 size={18} className="text-black dark:text-white" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black dark:text-white">
                        {title}
                    </h3>
                </div>
                <div className="min-h-[300px]">
                    {children}
                </div>
            </div>
        </div>
    );
}
