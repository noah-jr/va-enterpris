import { useState } from 'react';
import { TrendingUp, Users, DollarSign, MapPin, Plus, X, BarChart3, PieChart, Loader2, Compass, Landmark, Activity, Zap, Rocket, Target, Search, User, Calendar, FileText, Globe2, LayoutGrid, List, ChevronRight, Map, LineChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Legend } from 'recharts';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { usePermissions } from '../auth/useAuth';

const fmt = (v: number) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(v);

interface Market {
    id: string;
    name: string;
    country: string;
    status: 'ACTIVE' | 'PLANNED' | 'PROSPECTING' | 'SUSPENDED';
    revenue: number;
    clients: number;
    growth: number;
    marketShare: number;
    currency: string;
    entryYear: number;
    manager: string;
    notes: string;
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
    ACTIVE: { label: 'Activo', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', icon: Activity },
    PLANNED: { label: 'Planeado', color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-200 dark:border-indigo-500/20', icon: Rocket },
    PROSPECTING: { label: 'Em Prospecção', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', icon: Target },
    SUSPENDED: { label: 'Suspenso', color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20', icon: Landmark },
};

const FLAG_EMOJIS: Record<string, string> = {
    AO: '🇦🇴', PT: '🇵🇹', MZ: '🇲🇿', ST: '🇸🇹', BR: '🇧🇷', GW: '🇬🇼'
};

export default function InternationalExpansion() {
    const queryClient = useQueryClient();
    const [selected, setSelected] = useState<Market | null>(null);
    const [modal, setModal] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [form, setForm] = useState({ name: '', country: 'AO', currency: 'AOA', manager: '', entryYear: 2026, notes: '' });
    const { hasPermission } = usePermissions();

    const { data: markets = [], isLoading } = useQuery({
        queryKey: ['markets'],
        queryFn: async () => (await api.get('/expansion/markets')).data as Market[]
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/expansion/markets', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['markets'] });
            setModal(false);
            setForm({ name: '', country: 'AO', currency: 'AOA', manager: '', entryYear: 2026, notes: '' });
            toast.success('Novo mercado registado na estratégia global.');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, ...data }: any) => api.patch(`/expansion/markets/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['markets'] });
            toast.success('Estratégia regional actualizada.');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/expansion/markets/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['markets'] });
            setSelected(null);
            toast.success('Mercado removido da rede global.');
        }
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({ ...form, status: 'PLANNED' });
    };

    const filteredMarkets = markets.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalRevenue = markets.reduce((s, m) => s + m.revenue, 0);
    const totalClients = markets.reduce((s, m) => s + (m.clients || 0), 0);
    const activeMarkets = markets.filter(m => m.status === 'ACTIVE').length;

    const revenueData = markets.filter(m => m.revenue > 0).map(m => ({
        name: m.name.split('-')[0].trim().toUpperCase(),
        v: m.revenue
    }));

    const statusData = [
        { name: 'Activos', value: markets.filter(m => m.status === 'ACTIVE').length, color: '#10b981' },
        { name: 'Planeados', value: markets.filter(m => m.status === 'PLANNED').length, color: '#6366f1' },
        { name: 'Prospecção', value: markets.filter(m => m.status === 'PROSPECTING').length, color: '#f59e0b' },
    ];

    return (
        <div className="space-y-6 pb-20">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Expansão & Mercados Internacionais</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Gestão de operações em mercados estrangeiros e estratégia global.</p>
                </div>

                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-[var(--radius-md)] flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Procurar mercado..."
                            className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm font-medium"
                        />
                    </div>
                    {hasPermission('strategy:manage') && (
                        <button onClick={() => setModal(true)} className="premium-button-primary whitespace-nowrap">
                            <Plus size={18} /> Novo Mercado
                        </button>
                    )}
                </div>
            </div>

            {/* KPI Summary Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Países Activos', value: activeMarkets.toString(), icon: <Map size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Receita Global', value: fmt(totalRevenue), icon: <DollarSign size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Clientes', value: totalClients.toString(), icon: <Users size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                    { label: 'Crescimento', value: '+22.4%', icon: <TrendingUp size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 fluent-card p-6 bg-[var(--bg-secondary)] shadow-sm group">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] flex items-center gap-3">
                                <BarChart3 size={18} className="text-[var(--accent)]" /> Receita p/ Região (AOA)
                            </h2>
                            <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mt-1 opacity-60">Volume de negócio por mercado internacional</p>
                        </div>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%" minHeight={1}>
                            <BarChart data={revenueData} layout="vertical" barSize={16}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} width={100} />
                                <Tooltip
                                    cursor={{ fill: 'var(--bg-primary)', opacity: 0.5 }}
                                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                                    formatter={(v: any) => [fmt(v), 'Receita Institucional']}
                                />
                                <Bar dataKey="v" fill="var(--accent)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="fluent-card p-6 bg-[var(--bg-secondary)] shadow-sm flex flex-col items-center group">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-[var(--text-primary)] w-full">
                        <PieChart size={18} className="text-indigo-500" /> Distribuição de Mercados
                    </h2>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%" minHeight={1}>
                            <RechartsPie>
                                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={8} dataKey="value">
                                    {statusData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '11px' }}
                                />
                            </RechartsPie>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full space-y-3 mt-8 bg-[var(--bg-primary)]/50 p-4 rounded-xl border border-[var(--border-color)]/30">
                        {statusData.map(d => (
                            <div key={d.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-[9px] font-black uppercase text-[var(--text-secondary)] tracking-widest">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                    {d.name}
                                </div>
                                <span className="text-[11px] font-black text-[var(--text-primary)]">{d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* List Header */}
            <div className="flex items-center justify-between px-2 pt-4 border-t border-[var(--border-color)]/30">
                <div className="flex items-center gap-4">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                        <LayoutGrid size={16} />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                        <List size={16} />
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40 ml-4">Rede de Mercados Consolidada</span>
                </div>
            </div>

            {isLoading ? (
                <div className="py-32 flex flex-col items-center justify-center gap-4 opacity-50">
                    <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
                    <span className="text-xs font-black uppercase tracking-widest">Sincronizando estratégia global...</span>
                </div>
            ) : (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                    {filteredMarkets.length === 0 ? (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-2xl opacity-40">
                            <Compass size={48} className="mb-4" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-center px-4 sm:px-8">Nenhum mercado registado nesta jurisdição</h3>
                        </div>
                    ) : (
                        filteredMarkets.map(market => {
                            const s = STATUS_STYLE[market.status] || STATUS_STYLE.PLANNED;
                            const Icon = s.icon;
                            return (
                                <div key={market.id} onClick={() => setSelected(market)} className="fluent-card p-6 flex flex-col bg-[var(--bg-secondary)] border-b-2 border-b-[var(--border-color)] group hover:border-[var(--accent)]/30 cursor-pointer">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="text-3xl sm:text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-500 select-none">
                                                {FLAG_EMOJIS[market.country] || '🌍'}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight group-hover:text-[var(--accent)] transition-colors leading-none">{market.name}</h3>
                                                <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-2 flex items-center gap-2">
                                                    <MapPin size={10} className="text-sky-500" /> Jurisdição: {market.country}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm transition-transform ${s.bg} ${s.color} ${s.border}`}>
                                            <Icon size={12} /> {s.label}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 py-4 border-y border-[var(--border-color)]/30 my-6 bg-[var(--bg-primary)]/50 rounded-xl px-4">
                                        <div className="text-center">
                                            <p className="text-lg font-black text-[var(--text-primary)] tabular-nums">{market.clients || '--'}</p>
                                            <p className="text-[8px] text-[var(--text-secondary)] font-black uppercase tracking-widest">Clientes</p>
                                        </div>
                                        <div className="text-center border-x border-[var(--border-color)]/30">
                                            <p className="text-lg font-black text-[var(--text-primary)] tabular-nums">{market.marketShare}%</p>
                                            <p className="text-[8px] text-[var(--text-secondary)] font-black uppercase tracking-widest">Quota</p>
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-lg font-black ${market.growth > 0 ? 'text-emerald-500' : 'text-[var(--text-secondary)]/50'} tabular-nums`}>
                                                {market.growth > 0 ? `+${market.growth}%` : '---'}
                                            </p>
                                            <p className="text-[8px] text-[var(--text-secondary)] font-black uppercase tracking-widest">Progresso</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end mt-auto">
                                        <div className="space-y-1">
                                            {market.revenue > 0 ? (
                                                <>
                                                    <p className="text-base font-black text-[var(--text-primary)] tabular-nums group-hover:text-[var(--accent)]">{fmt(market.revenue)}</p>
                                                    <p className="text-[9px] font-black uppercase text-[var(--text-secondary)] tracking-widest opacity-40">Faturação Local ({market.currency})</p>
                                                </>
                                            ) : (
                                                <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/10 px-4 py-2 rounded-lg">
                                                    <p className="text-[11px] font-black text-[var(--accent)] tracking-widest uppercase">Início: {market.entryYear}</p>
                                                    <p className="text-[8px] font-black uppercase text-[var(--text-secondary)] tracking-widest mt-0.5">Operação Planeada</p>
                                                </div>
                                            )}
                                        </div>
                                        <button className="p-2 text-[var(--text-secondary)] group-hover:text-[var(--accent)] hover:bg-[var(--border-color)]/30 rounded-lg transition-all border border-transparent">
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Detailed Market Panel */}
            {selected && (
                <div className="fixed inset-0 z-[3000] flex justify-end">
                    <div className="absolute inset-0 z-0 bg-[var(--text-primary)]/5 backdrop-blur-sm" onClick={() => setSelected(null)} />
                    <div className="relative z-10 w-full max-w-xl bg-[var(--bg-secondary)] h-full overflow-y-auto p-4 sm:p-8 shadow-2xl animate-in slide-in-from-right duration-500 border-l border-[var(--border-color)]">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="font-black text-[10px] uppercase tracking-widest text-[var(--accent)] mb-1 border-l-4 border-[var(--accent)] pl-4 leading-none">Dossier de Inteligência de Mercado</h3>
                                <p className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight mt-3">Análise Regional Hub #_{selected.id.slice(-6).toUpperCase()}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-all border border-transparent hover:border-[var(--border-color)]"><X size={24} /></button>
                        </div>

                        <div className="space-y-8">
                            <div className="p-4 sm:p-8 rounded-2xl bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] border border-[var(--border-color)] group flex flex-col items-center text-center">
                                <div className="text-7xl mb-6 drop-shadow-xl group-hover:scale-110 transition-transform duration-700">{FLAG_EMOJIS[selected.country] || '🌍'}</div>
                                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-4">{selected.name}</h2>
                                <span className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest shadow-sm ${STATUS_STYLE[selected.status].bg} ${STATUS_STYLE[selected.status].color} ${STATUS_STYLE[selected.status].border}`}>
                                    {STATUS_STYLE[selected.status].label}
                                </span>

                                <div className="w-full h-px bg-[var(--border-color)]/30 my-8" />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
                                    {[
                                        { label: 'Moeda Local', value: selected.currency, icon: <DollarSign size={16} className="text-emerald-500" /> },
                                        { label: 'Alcance de Clientes', value: `${selected.clients || '--'} Institucionais`, icon: <Users size={16} className="text-sky-500" /> },
                                        { label: 'Gestor Regional', value: selected.manager || 'Proxy Executivo', icon: <User size={16} className="text-indigo-500" /> },
                                        { label: 'Lançamento', value: selected.entryYear, icon: <Calendar size={16} className="text-amber-500" /> },
                                    ].map((item, i) => (
                                        <div key={i} className="fluent-card p-4 border border-[var(--border-color)]/50 bg-[var(--bg-primary)]/30 rounded-xl flex flex-col gap-3 group/item hover:bg-[var(--bg-primary)] transition-all">
                                            <div className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-widest flex items-center gap-2 opacity-50">
                                                {item.icon} {item.label}
                                            </div>
                                            <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight truncate">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="fluent-card p-6 bg-[var(--bg-primary)]/50 border-dashed border-2 border-[var(--border-color)] rounded-2xl group">
                                <div className="flex items-center gap-3 mb-4">
                                    <LineChart size={18} className="text-indigo-500" />
                                    <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Estratégia e Notas de Conformidade</p>
                                </div>
                                <p className="text-[13px] leading-relaxed italic text-[var(--text-secondary)] opacity-80 border-l-4 border-[var(--accent)]/30 pl-6 py-2">
                                    "{selected.notes || 'Nenhuma nota estratégica registada para este geo-cluster. Auditoria de verificação internacional pendente.'}"
                                </p>
                            </div>

                            <div className="pt-8 border-t border-[var(--border-color)] flex flex-col sm:flex-row gap-4">
                                {hasPermission('strategy:manage') && (
                                    <>
                                        <button 
                                            onClick={() => {
                                                if (confirm('Tem a certeza que deseja remover este mercado da rede global?')) {
                                                    deleteMutation.mutate(selected.id);
                                                }
                                            }}
                                            className="flex-1 py-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                                        >
                                            <X size={16} /> Eliminar Registo
                                        </button>
                                        <button
                                            onClick={() => {
                                                const nextStatus: Record<string, any> = {
                                                    'PLANNED': 'PROSPECTING',
                                                    'PROSPECTING': 'ACTIVE',
                                                    'ACTIVE': 'SUSPENDED',
                                                    'SUSPENDED': 'ACTIVE'
                                                };
                                                updateMutation.mutate({ id: selected.id, status: nextStatus[selected.status] || 'ACTIVE' });
                                            }}
                                            className="flex-1 py-4 bg-[var(--accent)] border border-[var(--accent)]/50 text-white rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-[var(--accent)]/10"
                                        >
                                            <Zap size={16} /> Re-Calibrar Status
                                        </button>
                                    </>
                                )}
                                {!hasPermission('strategy:manage') && (
                                    <button className="flex-1 py-4 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-muted)] rounded-xl font-black uppercase tracking-widest text-[9px] cursor-not-allowed opacity-50 flex items-center justify-center gap-2">
                                        <FileText size={16} /> Apenas Visualização
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Creation Modal */}
            {modal && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 z-0 bg-[var(--text-primary)]/5 backdrop-blur-sm" onClick={() => setModal(false)} />
                    <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-color)] w-full max-w-xl rounded-2xl p-4 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight leading-none">Novas Jurisdição Estratégica</h2>
                                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-2 italic">Configuração de Hub Regional de Operação</p>
                            </div>
                            <button onClick={() => setModal(false)} className="p-2 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-all cursor-pointer"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-6 overflow-y-auto pr-2 no-scrollbar">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">Designação do Mercado (Cluster)</label>
                                <input
                                    required
                                    placeholder="EX: HUB EUROPA - LISBOA..."
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded-xl text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all text-base font-black uppercase tracking-tight shadow-inner"
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value.toUpperCase() }))}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">País / Jurisdição</label>
                                    <select
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 rounded-xl text-[10px] font-black uppercase text-[var(--text-primary)] outline-none cursor-pointer"
                                        value={form.country}
                                        onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
                                    >
                                        <option value="AO">🇦🇴 Angola Sovereign</option>
                                        <option value="PT">🇵🇹 Portugal EU Cluster</option>
                                        <option value="MZ">🇲🇿 Moçambique Hub</option>
                                        <option value="ST">🇸🇹 São Tomé & Príncipe</option>
                                        <option value="BR">🇧🇷 Brasil LATAM Hub</option>
                                        <option value="GW">🇬🇼 Guiné-Bissau Node</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">Moeda Fiscal Base</label>
                                    <select
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 rounded-xl text-[10px] font-black uppercase text-[var(--text-primary)] outline-none cursor-pointer"
                                        value={form.currency}
                                        onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
                                    >
                                        <option value="AOA">AOA — Kwanza Premium</option>
                                        <option value="EUR">EUR — Euro Zone</option>
                                        <option value="USD">USD — Global Proxy</option>
                                        <option value="BRL">BRL — Real LATAM</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">Gestor de Mercado Responsável</label>
                                    <input placeholder="NOME DO EXECUTIVO" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 rounded-xl text-[10px] font-black uppercase text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)]" value={form.manager} onChange={e => setForm(p => ({ ...p, manager: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">Ano Previsto de Entrada</label>
                                    <input type="number" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 rounded-xl text-[10px] font-black uppercase text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)]" value={form.entryYear} onChange={e => setForm(p => ({ ...p, entryYear: parseInt(e.target.value) }))} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">Justificação Estratégica & Análise Geopolítica</label>
                                <textarea
                                    rows={3}
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded-xl text-xs font-medium text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none italic shadow-inner leading-relaxed"
                                    placeholder="Destaque as razões competitivas para o investimento neste mercado..."
                                    value={form.notes}
                                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                                />
                            </div>

                            <div className="pt-6 flex gap-3">
                                <button type="button" onClick={() => setModal(false)} className="flex-1 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border border-[var(--border-color)] shadow-sm">Cancelar</button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="flex-[2] bg-[var(--accent)] hover:opacity-95 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[var(--accent)]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />} Instanciar Mercado Global
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
