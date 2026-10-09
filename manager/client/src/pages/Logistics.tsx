import { useState } from 'react';
import { Truck, Navigation, Settings, Search, Filter, Loader2, CheckCircle, Fuel, AlertTriangle, ShieldCheck, Clock, ChevronRight, BarChart3, Download, Plus, MoreHorizontal, Zap, Compass, Info, LayoutGrid, List } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { usePermissions } from '../auth/useAuth';

interface Vehicle {
    id: string;
    plate: string;
    model: string;
    driver: string;
    status: 'ACTIVE' | 'MAINTENANCE' | 'IDLE';
    fuel: number;
    location: string;
    lastUpdate: string;
    type: string;
    mission?: string;
    load?: number;
    capacity?: number;
}

const SS: Record<Vehicle['status'], { label: string; color: string; bg: string; border: string; accent: string }> = {
    ACTIVE: { label: 'Em Trânsito', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', accent: 'bg-emerald-500' },
    MAINTENANCE: { label: 'Manutenção', color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20', accent: 'bg-rose-500' },
    IDLE: { label: 'Disponível', color: 'text-sky-700 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10', border: 'border-sky-200 dark:border-sky-500/20', accent: 'bg-sky-500' },
};

export default function Logistics() {
    const { hasPermission } = usePermissions();
    const [view, setView] = useState<'GRID' | 'TABLE'>('GRID');
    const [search, setSearch] = useState('');

    const { data: vData, isLoading } = useQuery<Vehicle[]>({
        queryKey: ['vehicles'],
        queryFn: async () => (await api.get('/logistics/vehicles')).data
    });

    const vehicles: Vehicle[] = vData || [];

    const stats = {
        totalFleet: vehicles.length,
        active: vehicles.filter(v => v.status === 'ACTIVE').length,
        maintenance: vehicles.filter(v => v.status === 'MAINTENANCE').length,
        idle: vehicles.filter(v => v.status === 'IDLE').length
    };

    const filteredVehicles = vehicles.filter(v =>
        v.plate.toLowerCase().includes(search.toLowerCase()) ||
        v.driver.toLowerCase().includes(search.toLowerCase()) ||
        v.model.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-8">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">
                        Frota e Logística
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">
                        Monitorização de ativos e operações em tempo real
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-0.5 mr-2">
                        <button 
                            onClick={() => setView('GRID')} 
                            className={`p-1.5 rounded-[var(--radius-sm)] transition-colors ${view === 'GRID' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                        >
                            <LayoutGrid size={15} />
                        </button>
                        <button 
                            onClick={() => setView('TABLE')} 
                            className={`p-1.5 rounded-[var(--radius-sm)] transition-colors ${view === 'TABLE' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                        >
                            <List size={15} />
                        </button>
                    </div>
                    {hasPermission('logistics:create') && (
                        <button className="premium-button-primary">
                            <Plus size={15} />
                            <span>Novo ativo</span>
                        </button>
                    )}
                </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Frota total', value: stats.totalFleet.toString(), icon: <Truck size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Em operação', value: stats.active.toString(), icon: <Navigation size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Manutenção', value: stats.maintenance.toString(), icon: <Settings size={15} />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                    { label: 'Disponíveis', value: stats.idle.toString(), icon: <CheckCircle size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' }
                ].map((kpi, i) => (
                    <div key={i} className="premium-card p-4 flex items-start gap-3">
                        <div className={`kpi-icon shrink-0 ${kpi.color} ${kpi.bg}`}>
                            {kpi.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-[var(--text-muted)] mb-0.5 truncate">{kpi.label}</p>
                            <p className="text-base font-bold text-[var(--text-primary)] tabular-nums leading-tight">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Workplace Controls */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative group flex-1 w-full max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input 
                        type="text"
                        placeholder="Pesquisar matrícula, operador ou modelo..."
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] py-2 pl-10 pr-4 rounded-lg text-sm font-medium outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="premium-button-secondary py-2">
                        <Download size={14} />
                        <span>Relatório</span>
                    </button>
                    <span className="text-[10px] font-bold text-[var(--text-muted)] bg-[var(--bg-primary)] px-3 py-1.5 rounded-lg border border-[var(--border-color)]">
                        {filteredVehicles.length} Unidades
                    </span>
                </div>
            </div>

            {isLoading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm">A carregar dados...</span>
                </div>
            ) : view === 'GRID' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredVehicles.map(v => {
                        const s = SS[v.status] || SS.IDLE;
                        return (
                            <div 
                                key={v.id} 
                                className="premium-card p-5 group cursor-pointer hover:border-[var(--accent)] transition-all flex flex-col gap-4 active:scale-[0.98]"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="p-2.5 bg-[var(--bg-primary)] rounded-lg text-[var(--accent)] border border-[var(--border-color)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                                        <Truck size={18} />
                                    </div>
                                    <span className={`badge ${s.bg} ${s.color}`}>
                                        {s.label}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-[var(--text-primary)]">{v.plate}</h3>
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{v.model}</p>
                                </div>

                                <div className="pt-4 border-t border-[var(--border-color)] space-y-2 mt-auto">
                                    <div className="flex items-center justify-between text-[10px] font-bold">
                                        <span className="text-[var(--text-muted)] uppercase">Operador</span>
                                        <span className="text-[var(--text-primary)] truncate max-w-[100px]">{v.driver}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-bold">
                                        <span className="text-[var(--text-muted)] uppercase">Energia</span>
                                        <span className={v.fuel < 20 ? 'text-rose-500' : 'text-[var(--text-primary)]'}>{v.fuel}%</span>
                                    </div>
                                    <div className="pt-2">
                                        <button className="w-full py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[9px] font-bold uppercase hover:bg-[var(--accent)] hover:text-white transition-colors">
                                            Detalhes da Missão
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
                            <tr>
                                {['Matrícula / Modelo', 'Estado', 'Operador', 'Localização', 'Energia', ''].map(h => (
                                    <th key={h} className="px-8 py-5 text-[9px] font-black text-[var(--text-secondary)] uppercase opacity-40">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]/30">
                            {filteredVehicles.map(v => {
                                const s = SS[v.status] || SS.IDLE;
                                return (
                                    <tr key={v.id} className="group hover:bg-[var(--bg-primary)]/50 transition-all cursor-pointer">
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight leading-none mb-1">{v.plate}</p>
                                            <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase opacity-40">{v.model}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${s.bg} ${s.color} ${s.border}`}>
                                                {s.label}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-[10px] font-bold text-[var(--text-primary)] uppercase">{v.driver}</td>
                                        <td className="px-8 py-6 text-[10px] font-bold text-[var(--accent)] uppercase">{v.location}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-color)]/30">
                                                    <div className={`h-full ${v.fuel < 20 ? 'bg-rose-500' : 'bg-[var(--text-primary)]'} opacity-60`} style={{ width: `${v.fuel}%` }} />
                                                </div>
                                                <span className="text-[10px] font-bold tabular-nums">{v.fuel}%</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <MoreHorizontal size={16} className="text-[var(--text-secondary)] opacity-20 group-hover:opacity-100 transition-opacity" />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Sovereign Footer Ledger */}
            <div className="border border-dashed border-[var(--border-color)] p-10 flex flex-col items-center gap-4 text-center rounded-2xl opacity-40 mt-12">
                <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase leading-none">
                    OneGest Logistics Intelligence // Terminal Grid v2.4
                </p>
                <div className="flex items-center gap-8 text-[8px] font-black uppercase">
                    <span>GPS Sincronizado</span>
                    <span>Auditado por IA</span>
                    <span>Protocolo SADC</span>
                </div>
            </div>
        </div>
    );
}
