import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { 
    Car, 
    Fuel, 
    Wrench, 
    Plus, 
    X, 
    CheckCircle2, 
    Loader2, 
    Printer, 
    Share2, 
    ArrowUpRight, 
    User, 
    Activity, 
    Droplets, 
    ShieldCheck, 
    Search, 
    FileWarning, 
    ChevronRight, 
    Navigation2, 
    Settings, 
    Building2, 
    TrendingUp, 
    BadgeCheck,
    LayoutGrid,
    List,
    Gauge,
    Edit,
    Trash2,
    PlusCircle,
    Truck,
    Calendar,
    BarChart3,
    Download
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../api';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { usePermissions } from '../auth/useAuth';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { SearchableSelect } from '../components/SearchableSelect';

import { formatCurrency } from '../utils/format';
const fmt = (v: number) => formatCurrency(v);

interface Vehicle {
    id: string; 
    plate: string; 
    model: string; 
    brand: string;
    type: 'SEDAN' | 'SUV' | 'TRUCK' | 'VAN' | 'MOTORCYCLE';
    year: number; 
    status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'INACTIVE';
    driver: string; 
    km: number; 
    lastService: string; 
    nextService: number;
    fuelType: 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';
    department: string; 
    insurance: string; 
    notes: string;
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
    AVAILABLE: { label: 'Disponível', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: <CheckCircle2 size={12} /> },
    IN_USE: { label: 'Em Uso', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100', icon: <Navigation2 size={12} /> },
    MAINTENANCE: { label: 'Manutenção', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: <Settings size={12} /> },
    INACTIVE: { label: 'Inativo', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', icon: <FileWarning size={12} /> },
};

const TYPE_ICONS: Record<string, string> = {
    SEDAN: '🚗',
    SUV: '🚙',
    TRUCK: '🛻',
    VAN: '🚐',
    MOTORCYCLE: '🏍️'
};

export default function FleetManagement() {
    const qc = useQueryClient();
    const [filter, setFilter] = useState<'ALL' | Vehicle['status']>('ALL');
    const [selected, setSelected] = useState<Vehicle | null>(null);
    const [tab, setTab] = useState<'VEHICLES' | 'FUEL' | 'ANALYTICS'>('VEHICLES');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const { hasPermission } = usePermissions();

    const [form, setForm] = useState<Partial<Vehicle>>({
        type: 'SEDAN',
        status: 'AVAILABLE',
        fuelType: 'GASOLINE',
        year: new Date().getFullYear(),
        km: 0,
        nextService: 10000,
        department: 'Logística',
        insurance: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    });

    const itemsPerPage = 8;

    const { data: vehiclesData, isLoading: loadingVehicles } = useQuery({
        queryKey: ['fleet'],
        queryFn: async () => (await api.get('/fleet')).data as Vehicle[]
    });

    const vehicles = (vehiclesData || []) as Vehicle[];
    const filtered = vehicles.filter(v => {
        const matchesSearch = v.brand.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             v.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             v.plate.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'ALL' || v.status === filter;
        return matchesSearch && matchesFilter;
    });

    const paginatedData = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const createMutation = useMutation({
        mutationFn: (data: Partial<Vehicle>) => api.post('/fleet', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['fleet'] });
            setIsAddModalOpen(false);
            toast.success('Veículo adicionado com sucesso');
            resetForm();
        }
    });

    const resetForm = () => {
        setForm({
            type: 'SEDAN', status: 'AVAILABLE', fuelType: 'GASOLINE',
            year: new Date().getFullYear(), km: 0, nextService: 10000,
            department: 'Logística',
            insurance: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
        });
    };

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: Vehicle['status'] }) => 
            await api.post(`/fleet/${id}/status`, { status }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['fleet'] });
            toast.success('Estado actualizado com sucesso');
            if (selected) {
                const updated = (qc.getQueryData(['fleet']) as Vehicle[])?.find(v => v.id === selected.id);
                if (updated) setSelected(updated);
            }
        }
    });

    const { data: fuelRecordsData } = useQuery({
        queryKey: ['fuel'],
        queryFn: async () => (await api.get('/fleet/fuel')).data as any[],
        enabled: tab === 'FUEL' || tab === 'ANALYTICS'
    });

    const fuelRecords = (fuelRecordsData || []) as any[];

    const columns = [
        {
            header: 'Unidade',
            accessor: (v: Vehicle) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-xl">
                        {TYPE_ICONS[v.type]}
                    </div>
                    <div>
                        <p className="font-bold leading-none mb-1">{v.brand} {v.model}</p>
                        <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">{v.plate}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Telemetria',
            accessor: (v: Vehicle) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)]">
                        <Gauge size={12} className="opacity-40" /> {v.km.toLocaleString()} KM
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)] opacity-60">
                        <Fuel size={12} className="opacity-40" /> {v.fuelType}
                    </div>
                </div>
            )
        },
        {
            header: 'Responsável',
            accessor: (v: Vehicle) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center">
                        <User size={12} className="text-[var(--text-secondary)] opacity-50" />
                    </div>
                    <span className="text-xs font-bold text-[var(--text-primary)]">{v.driver}</span>
                </div>
            )
        },
        {
            header: 'Estado',
            accessor: (v: Vehicle) => {
                const s = STATUS_STYLE[v.status];
                return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${s.bg} ${s.color} ${s.border} uppercase`}>
                        {s.icon} {s.label}
                    </span>
                );
            }
        },
        {
            header: '',
            accessor: (v: Vehicle) => (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setSelected(v); }} className="p-2 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--accent)] border border-[var(--border-color)] transition-all">
                        <Activity size={14} />
                    </button>
                </div>
            ),
            className: "text-right"
        }
    ];

    if (loadingVehicles) return (
        <div className="py-40 flex flex-col items-center justify-center gap-6 opacity-30">
            <Loader2 size={48} className="animate-spin text-[var(--accent)]" />
            <p className="text-xs font-bold uppercase tracking-widest">A carregar frota...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Gestão de Frota & Logística</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Monitorização de activos, telemetria e manutenção.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1 rounded-[var(--radius-md)]">
                        {(['VEHICLES', 'FUEL', 'ANALYTICS'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider transition-all ${tab === t ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                            >
                                {t === 'VEHICLES' ? 'Frota' : t === 'FUEL' ? 'Consumos' : 'BI'}
                            </button>
                        ))}
                    </div>
                    {hasPermission('fleet:create') && (
                        <button onClick={() => setIsAddModalOpen(true)} className="premium-button-primary">
                            <Plus size={18} /> Novo Veículo
                        </button>
                    )}
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Unidades Ativas', value: vehicles.length.toString(), icon: <Car size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Em Circulação', value: vehicles.filter(v => v.status === 'IN_USE').length.toString(), icon: <Navigation2 size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                    { label: 'Custos Mês', value: fmt(2450000), icon: <Fuel size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                    { label: 'Alertas Revisão', value: vehicles.filter(v => v.km >= v.nextService - 1500).length.toString(), icon: <Wrench size={15} />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
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

            {/* Main Content */}
            {tab === 'VEHICLES' ? (
                <div className="space-y-6">
                    <div className="bg-[var(--bg-secondary)] p-2 rounded-xl border border-[var(--border-color)] flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                            <input 
                                type="text"
                                placeholder="Pesquisar por matrícula ou modelo..."
                                className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex bg-[var(--bg-primary)] p-1 rounded-lg border border-[var(--border-color)]">
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-[var(--bg-secondary)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-muted)]'}`}>
                                <LayoutGrid size={16} />
                            </button>
                            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-[var(--bg-secondary)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-muted)]'}`}>
                                <List size={16} />
                            </button>
                        </div>
                    </div>

                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {paginatedData.map((item: any) => {
                                const s = STATUS_STYLE[item.status];
                                const alert = item.km >= item.nextService - 1500;
                                const pctKm = Math.min(Math.round((item.km / item.nextService) * 100), 100);
                                return (
                                    <div key={item.id} onClick={() => setSelected(item)} className="premium-card p-6 cursor-pointer group hover:border-[var(--accent)] transition-all">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
                                                {TYPE_ICONS[item.type] || '🚗'}
                                            </div>
                                            <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${s.bg} ${s.color} ${s.border}`}>
                                                {s.label}
                                            </div>
                                        </div>
                                        <div className="space-y-1 mb-6">
                                            <h3 className="text-base font-bold text-[var(--text-primary)] leading-tight">{item.brand} {item.model}</h3>
                                            <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">{item.plate}</p>
                                        </div>
                                        <div className="bg-[var(--bg-primary)]/40 border border-[var(--border-color)]/20 rounded-xl p-4 mb-6 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[9px] font-bold uppercase text-[var(--text-secondary)] opacity-40">Quilometragem</p>
                                                <p className="text-sm font-bold tabular-nums">{item.km.toLocaleString()} KM</p>
                                            </div>
                                            <div className="border-l border-[var(--border-color)]/20 pl-4 text-right">
                                                <p className="text-[9px] font-bold uppercase text-[var(--text-secondary)] opacity-40">Consumo Médio</p>
                                                <p className="text-sm font-bold tabular-nums">{item.avgConsumption} L/100</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 mb-6">
                                            <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                                                <span className={alert ? 'text-rose-500' : 'text-[var(--text-secondary)] opacity-40'}>Próxima Revisão</span>
                                                <span className="opacity-40">{item.nextService.toLocaleString()} KM</span>
                                            </div>
                                            <div className="h-1 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                                                <div className={`h-full transition-all duration-700 ${pctKm >= 90 ? 'bg-rose-500' : pctKm >= 75 ? 'bg-amber-500' : 'bg-[var(--accent)]'}`} style={{ width: `${pctKm}%` }} />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center">
                                                    <User size={12} className="text-[var(--text-secondary)] opacity-40" />
                                                </div>
                                                <span className="text-[10px] font-bold text-[var(--text-secondary)] truncate max-w-[100px]">{item.driver}</span>
                                            </div>
                                            <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <DataTable 
                            data={paginatedData}
                            columns={columns}
                            isLoading={loadingVehicles}
                            currentPage={page}
                            totalPages={totalPages}
                            totalItems={filtered.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setPage}
                            onSearchChange={setSearchTerm}
                            searchValue={searchTerm}
                            onRowClick={setSelected}
                            searchPlaceholder="Pesquisar por matrícula ou marca..."
                        />
                    )}
                </div>
            ) : tab === 'FUEL' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <div className="lg:col-span-2">
                        <DataTable 
                            data={fuelRecords}
                            columns={[
                                { header: 'Veículo', accessor: (f: any) => <span className="font-bold text-[var(--accent)]">{f.plate}</span> },
                                { header: 'Data', accessor: (f: any) => <span className="text-xs text-[var(--text-secondary)]">{format(new Date(f.date), 'dd/MM/yyyy HH:mm')}</span> },
                                { header: 'Volume', accessor: (f: any) => <span className="font-bold">{f.liters ? `${f.liters} L` : 'CHEIO'}</span> },
                                { header: 'Custo', accessor: (f: any) => <span className="font-bold text-[var(--text-primary)]">{fmt(f.cost)}</span> },
                                { header: 'Posto', accessor: (f: any) => <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] opacity-60">{f.station}</span> }
                            ]}
                            isLoading={false}
                            showSearch={false}
                        />
                     </div>
                     <div className="space-y-8">
                        <div className="premium-card p-8 group border border-[var(--border-color)]">
                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)] mb-8 flex items-center gap-3 border-b border-[var(--border-color)]/50 pb-4">
                                <Activity size={18} className="text-emerald-500" /> Indicadores de Operação
                            </h4>
                            <div className="space-y-8">
                                {[
                                    { label: 'Custo Médio / KM', value: '450.00 Kz', trend: 'Estável' },
                                    { label: 'Disponibilidade Real', value: '94%', trend: '+2%' },
                                    { label: 'Eficiência de Frota', value: '8.2 L/100km', trend: '-5%' },
                                ].map((s, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase opacity-60">{s.label}</p>
                                            <span className="text-[9px] font-bold text-emerald-600">{s.trend}</span>
                                        </div>
                                        <p className="text-xl font-bold text-[var(--text-primary)] tabular-nums">{s.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="premium-card p-8 bg-[var(--accent)] text-white relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold uppercase tracking-widest mb-2">Relatório de Operação</h3>
                                <p className="text-xs font-medium opacity-80 mb-8 leading-relaxed">
                                    Dashboard detalhado de custos operacionais e manutenção preditiva.
                                </p>
                                <button className="w-full py-4 bg-white text-[var(--accent)] rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-opacity-90 transition-all">
                                    <Download size={16} className="inline mr-2" /> Descarregar BI
                                </button>
                            </div>
                        </div>
                     </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="premium-card p-8 group border border-[var(--border-color)]">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)] mb-10 flex items-center gap-3 border-b border-[var(--border-color)]/50 pb-4">
                            <TrendingUp size={18} className="text-[var(--accent)]" /> Custos Logísticos
                        </h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[
                                    { m: 'DEZ', v: 4500000 }, { m: 'JAN', v: 3800000 }, { m: 'FEV', v: 4100000 }, { m: 'MAR', v: 3200000 }
                                ]}>
                                    <defs>
                                        <linearGradient id="p" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="m" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" stroke="var(--text-muted)" />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                                    <Area type="monotone" dataKey="v" stroke="var(--accent)" strokeWidth={3} fill="url(#p)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="premium-card p-8 group border border-[var(--border-color)]">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)] mb-10 flex items-center gap-3 border-b border-[var(--border-color)]/50 pb-4">
                            <Activity size={18} className="text-sky-500" /> Distribuição de Km
                        </h3>
                         <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { m: 'Frota A', v: 12000 }, { m: 'Frota B', v: 8500 }, { m: 'Frota C', v: 15600 }, { m: 'Frota D', v: 7200 }
                                ]}>
                                    <XAxis dataKey="m" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" stroke="var(--text-muted)" />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                                    <Bar dataKey="v" fill="var(--accent)" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Selection Drawer / Modal */}
            <Modal
                isOpen={!!selected}
                onClose={() => setSelected(null)}
                title="Detalhes do Veículo"
                subtitle={selected?.plate}
                type="SIDE"
                width="lg"
                icon={<Car size={24} className="text-[var(--accent)]" />}
            >
                {selected && (
                    <div className="p-4 sm:p-8 space-y-8 h-full flex flex-col">
                        <div className="premium-card p-6 bg-[var(--bg-primary)]/40 border border-[var(--border-color)]">
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-16 h-16 bg-white rounded-2xl border border-[var(--border-color)] flex items-center justify-center text-4xl shadow-sm">
                                    {TYPE_ICONS[selected.type]}
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase border ${STATUS_STYLE[selected.status].bg} ${STATUS_STYLE[selected.status].color} ${STATUS_STYLE[selected.status].border}`}>
                                    {STATUS_STYLE[selected.status].label}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">{selected.brand} {selected.model}</h2>
                            <p className="text-xs font-bold text-[var(--text-secondary)] opacity-60 uppercase">{selected.year}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Condutor', value: selected.driver, icon: <User size={18} /> },
                                { label: 'Km Atual', value: selected.km.toLocaleString() + ' KM', icon: <Gauge size={18} /> },
                                { label: 'Departamento', value: selected.department, icon: <Building2 size={18} /> },
                                { label: 'Combustível', value: selected.fuelType, icon: <Fuel size={18} /> },
                            ].map((item, i) => (
                                <div key={i} className="premium-card p-4 flex flex-col gap-3 border border-[var(--border-color)]">
                                    <div className="p-2 w-fit rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--accent)]">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase opacity-40">{item.label}</p>
                                        <p className="text-xs font-bold text-[var(--text-primary)]">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="premium-card p-6 bg-emerald-50 border border-emerald-100 flex items-center gap-4">
                            <ShieldCheck className="text-emerald-500" size={24} />
                            <div>
                                <p className="text-[9px] font-bold text-emerald-600 uppercase">Apólice de Seguro</p>
                                <p className="text-xs font-bold">Expira: {format(new Date(selected.insurance), 'dd/MM/yyyy')}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase opacity-40 px-1">Manutenção Preventiva</p>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-bold text-[var(--text-secondary)]">
                                    <span>Próxima Revisão: {selected.nextService.toLocaleString()} KM</span>
                                    <span>{Math.round((selected.km / selected.nextService) * 100)}%</span>
                                </div>
                                <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-color)]">
                                    <div className="h-full bg-[var(--accent)]" style={{ width: `${Math.round((selected.km / selected.nextService) * 100)}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 flex gap-4 mt-auto">
                             {hasPermission('fleet:update') && (
                                <button
                                    onClick={() => updateStatusMutation.mutate({ 
                                        id: selected.id, 
                                        status: selected.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE' 
                                    })}
                                    className="premium-button-primary flex-1 !bg-emerald-600"
                                >
                                    {selected.status === 'MAINTENANCE' ? <CheckCircle2 size={18} /> : <Wrench size={18} />}
                                    {selected.status === 'MAINTENANCE' ? 'Concluir' : 'Reparar'}
                                </button>
                            )}
                            <button className="premium-button-secondary flex-1">
                                <Printer size={18} /> PDF
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Add Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Novo Veículo"
                subtitle="Registo de frota institucional"
                type="CENTER"
                width="xl"
                icon={<PlusCircle size={24} className="text-[var(--accent)]" />}
            >
                <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="p-4 sm:p-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Marca</label>
                            <input required value={form.brand} onChange={e => setForm({...form, brand: e.target.value.toUpperCase()})} className="premium-input font-bold uppercase" placeholder="TOYOTA" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Modelo</label>
                            <input required value={form.model} onChange={e => setForm({...form, model: e.target.value.toUpperCase()})} className="premium-input font-bold uppercase" placeholder="HILUX" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Matrícula</label>
                            <input required value={form.plate} onChange={e => setForm({...form, plate: e.target.value.toUpperCase()})} className="premium-input font-mono font-bold" placeholder="LD-00-00-AA" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Tipo de Veículo</label>
                                <SearchableSelect 
                                    options={[
                                        { label: 'Ligeiro / Sedan', value: 'SEDAN' },
                                        { label: 'SUV / Pick-up', value: 'SUV' },
                                        { label: 'Pesado / Camião', value: 'TRUCK' },
                                        { label: 'Carrinha / Van', value: 'VAN' },
                                        { label: 'Motociclo', value: 'MOTORCYCLE' }
                                    ]}
                                    value={form.type || 'SEDAN'}
                                    onChange={val => setForm({ ...form, type: val as any })}
                                />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Quilometragem Inicial</label>
                            <input type="number" value={form.km} onChange={e => setForm({...form, km: parseInt(e.target.value)})} className="premium-input font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1">Responsável / Condutor</label>
                            <input required value={form.driver} onChange={e => setForm({...form, driver: e.target.value.toUpperCase()})} className="premium-input font-bold uppercase" placeholder="NOME DO CONDUTOR" />
                        </div>
                    </div>
                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="premium-button-secondary flex-1 uppercase">Cancelar</button>
                        <button type="submit" disabled={createMutation.isPending} className="premium-button-primary flex-[2] uppercase">
                            {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <BadgeCheck size={18} />}
                            Confirmar Registo
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
