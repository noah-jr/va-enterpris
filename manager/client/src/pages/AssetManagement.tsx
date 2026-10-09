import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Box, Plus, Search, Filter, Download,
    CheckCircle2, Clock, Loader2,
    LayoutGrid, List, ShieldCheck,
    Settings, Activity, Layers,
    Wrench, ShieldAlert, BadgeCheck, X, FileText, ChevronRight, PlusCircle, User, MapPin
} from 'lucide-react';
import api from '../api';
import { format } from 'date-fns';
import { usePermissions, useMe } from '../auth/useAuth';
import { toast } from 'sonner';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
    OPERATIONAL: { label: 'Operacional', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', icon: <CheckCircle2 size={12} /> },
    MAINTENANCE: { label: 'Manutenção', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', icon: <Wrench size={12} /> },
    REPAIR: { label: 'Reparação', color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20', icon: <ShieldAlert size={12} /> },
    INACTIVE: { label: 'Inativo', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-white/5', border: 'border-slate-200 dark:border-white/10', icon: <Clock size={12} /> },
};

export default function AssetManagement() {
    const qc = useQueryClient();
    const [view, setView] = useState<'TABLE' | 'GRID'>('TABLE');
    const [search, setSearch] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { hasPermission } = usePermissions();
    const { data: me } = useMe();
    const isModuleEnabled = me?.company?.enabledModules?.includes('fleet') || me?.role === 'SUPER_ADMIN';

    // Form State
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [category, setCategory] = useState('');
    const [health, setHealth] = useState('100');
    const [location, setLocation] = useState('');
    const [owner, setOwner] = useState('');
    const [description, setDescription] = useState('');

    const resetForm = () => {
        setName('');
        setCode('');
        setCategory('');
        setHealth('100');
        setLocation('');
        setOwner('');
        setDescription('');
    };

    const { data: assetsData, isLoading } = useQuery({
        queryKey: ['assets'],
        queryFn: async () => (await api.get('/assets')).data
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/assets', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['assets'] });
            toast.success('Ativo registado com sucesso.');
            setIsModalOpen(false);
            resetForm();
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            name,
            code,
            category: category || 'EQUIPAMENTO',
            health: Number(health),
            location,
            owner,
            description,
            status: 'OPERATIONAL'
        });
    };

    const assets = assetsData || [];

    const filtered = assets.filter((a: any) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.code.toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total: assets.length,
        operational: assets.filter((a: any) => a.status === 'OPERATIONAL').length,
        avgHealth: assets.length > 0 ? assets.reduce((acc: number, a: any) => acc + a.health, 0) / assets.length : 100,
        maintenanceNeeded: assets.filter((a: any) => a.health < 80).length
    };

    return (
        <div className="space-y-8 pb-20 animate-fade-in text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Gestão de Ativos Patrimoniais</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Controlo de equipamentos, infraestrutura e bens patrimoniais.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1 rounded-[var(--radius-md)] shadow-sm">
                        <button onClick={() => setView('TABLE')} className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${view === 'TABLE' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}><List size={16} /></button>
                        <button onClick={() => setView('GRID')} className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${view === 'GRID' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}><LayoutGrid size={16} /></button>
                    </div>
                    {hasPermission('assets:create') && isModuleEnabled && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="premium-button-primary"
                        >
                            <Plus size={20} /> Novo Ativo
                        </button>
                    )}
                </div>
            </div>

            {/* Matrix KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Registado', value: stats.total.toString(), icon: <Box size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Integridade Média', value: `${Math.round(stats.avgHealth)}%`, icon: <Activity size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Requer Atenção', value: stats.maintenanceNeeded.toString(), icon: <Wrench size={15} />, color: stats.maintenanceNeeded > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                    { label: 'Operacionais', value: stats.operational.toString(), icon: <BadgeCheck size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
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

            {/* Matrix Search/Filters */}
            <div className="premium-card p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Pesquisar por ativo, categoria ou número de série..."
                        className="premium-input pl-11 py-2 w-full"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all shadow-sm"><Filter size={18} /></button>
                    <button className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all shadow-sm"><Download size={18} /></button>
                </div>
            </div>

            {isLoading ? (
                <div className="py-32 flex flex-col items-center justify-center gap-4 text-[var(--text-secondary)] opacity-40">
                    <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
                    <span className="text-[10px] uppercase font-black tracking-widest">Sincronizando Catálogo...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center text-center opacity-30 border-2 border-dashed border-[var(--border-color)] rounded-[var(--radius-md)] px-10">
                    <Box size={48} className="mb-4 opacity-40" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Nenhum ativo localizado na rede.</p>
                </div>
            ) : view === 'TABLE' ? (
                <div className="premium-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
                                    {['Ativo / ID', 'Categoria', 'Saúde', 'Última Revisão', 'Estado', ''].map(h => (
                                        <th key={h} className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {filtered.map((a: any) => {
                                    const cfg = STATUS_CFG[a.status] || STATUS_CFG.INACTIVE;
                                    return (
                                        <tr key={a.id} onClick={() => setSelectedAsset(a)} className="hover:bg-[var(--bg-primary)]/50 transition-all group cursor-pointer">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)]">
                                                        <Settings size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-[var(--text-primary)] leading-none mb-1">{a.name}</p>
                                                        <p className="text-[9px] font-black text-[var(--text-secondary)] opacity-40 font-mono">#{a.id.substring(0, 8).toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-2">
                                                    <Layers size={14} className="text-[var(--accent)]" /> {a.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5 min-w-[100px]">
                                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                                        <span className="opacity-40">Saúde</span>
                                                        <span className={a.health < 80 ? 'text-rose-500' : 'text-emerald-500'}>{a.health}%</span>
                                                    </div>
                                                    <div className="h-1 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-color)]/20">
                                                        <div className={`h-full rounded-full transition-all duration-1000 ${a.health < 50 ? 'bg-rose-500' : a.health < 80 ? 'bg-amber-500' : 'bg-[var(--accent)]'}`} style={{ width: `${a.health}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-[10px] font-bold text-[var(--text-primary)] uppercase">{a.lastMaint ? format(new Date(a.lastMaint), 'dd MMM yyyy') : 'Pendente'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                                    <div className={`w-1 h-1 rounded-full ${cfg.color.replace('text-', 'bg-')}`} />
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <ChevronRight size={18} className="text-[var(--text-secondary)] opacity-0 group-hover:opacity-40 transition-all ml-auto" />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map((a: any) => {
                        const cfg = STATUS_CFG[a.status] || STATUS_CFG.INACTIVE;
                        return (
                            <div key={a.id} onClick={() => setSelectedAsset(a)} className="premium-card p-6 flex flex-col group hover:border-[var(--accent)] transition-all cursor-pointer">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)]">
                                        <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black border ${cfg.bg} ${cfg.color} ${cfg.border} uppercase tracking-widest`}>
                                        {cfg.label}
                                    </span>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <p className="text-[9px] font-black text-[var(--text-secondary)] opacity-30 font-mono">#{a.id.substring(0, 8).toUpperCase()}</p>
                                    <h4 className="text-base font-black text-[var(--text-primary)] uppercase leading-tight group-hover:text-[var(--accent)] transition-all">{a.name}</h4>
                                    <p className="text-[10px] font-black text-[var(--text-secondary)] opacity-50 uppercase tracking-widest italic">{a.category}</p>
                                </div>
                                <div className="mt-8 space-y-3 pt-6 border-t border-[var(--border-color)]">
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                        <span className="opacity-40">Integridade</span>
                                        <span className={a.health < 80 ? 'text-rose-500' : 'text-emerald-500'}>{a.health}%</span>
                                    </div>
                                    <div className="h-1 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-color)]/20">
                                        <div className={`h-full rounded-full transition-all duration-1000 ${a.health < 80 ? 'bg-amber-500' : 'bg-[var(--accent)]'}`} style={{ width: `${a.health}%` }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Asset Detail Side Panel */}
            {selectedAsset && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedAsset(null)} />
                    <div className="relative w-full max-w-lg bg-[var(--bg-primary)] h-full overflow-y-auto p-12 shadow-2xl animate-in slide-in-from-right duration-500 border-l border-[var(--border-color)]">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)] mb-2">Dossiê Técnico de Ativo</h3>
                                <p className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">{selectedAsset.name}</p>
                            </div>
                            <button onClick={() => setSelectedAsset(null)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-all text-[var(--text-secondary)]"><X size={24} /></button>
                        </div>

                        <div className="space-y-10">
                            <div className="premium-card p-10 bg-[var(--bg-secondary)]/30 group">
                                <div className="flex justify-between items-start mb-8">
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border ${STATUS_CFG[selectedAsset.status].bg} ${STATUS_CFG[selectedAsset.status].color} ${STATUS_CFG[selectedAsset.status].border}`}>
                                        {STATUS_CFG[selectedAsset.status].label}
                                    </span>
                                    <div className="text-right">
                                        <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-widest opacity-40 mb-1">Taxa de Integridade</p>
                                        <p className="text-4xl font-black text-[var(--text-primary)] tracking-tighter">{selectedAsset.health}<span className="text-lg opacity-20">%</span></p>
                                    </div>
                                </div>
                                <h2 className="font-black text-xl text-[var(--text-primary)] mb-1 uppercase tracking-tight">{selectedAsset.category}</h2>
                                <p className="font-black font-mono text-[var(--accent)] text-[11px] tracking-widest mb-10 opacity-40 italic">#_{selectedAsset.id.toUpperCase()}</p>

                                <div className="space-y-4 pt-10 border-t border-[var(--border-color)]">
                                    <p className="text-[9px] uppercase font-black tracking-[0.3em] text-[var(--text-secondary)] opacity-30">Relatório Qualitativo</p>
                                    <p className="text-[13px] text-[var(--text-secondary)] font-medium leading-relaxed italic border-l-4 border-[var(--accent)]/30 pl-6 py-2">
                                        "{selectedAsset.description || 'Nenhum detalhe técnico específico foi catalogado para este ativo patrimonial.'}"
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'Localização', value: selectedAsset.location || 'Armazém Central', icon: <MapPin size={16} className="text-sky-500" /> },
                                    { label: 'Custódia / Executor', value: selectedAsset.owner || 'Equipa Técnica', icon: <User size={16} className="text-amber-500" /> },
                                    { label: 'Última Validação', value: selectedAsset.lastMaint ? format(new Date(selectedAsset.lastMaint), 'dd/MM/yyyy') : 'Não Auditado', icon: <Activity size={16} className="text-indigo-500" /> },
                                    { label: 'Valor Residual', value: 'Análise Pendente', icon: <ShieldCheck size={16} className="text-emerald-500" /> },
                                ].map((item: any, i) => (
                                    <div key={i} className="premium-card p-5 gap-3 flex flex-col bg-[var(--bg-secondary)]/20">
                                        <p className="text-[9px] text-[var(--text-secondary)] uppercase font-black tracking-widest flex items-center gap-2 opacity-40">{item.icon} {item.label}</p>
                                        <p className="font-black text-[11px] text-[var(--text-primary)] uppercase tracking-tight truncate">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-10 border-t border-[var(--border-color)] flex gap-4">
                                <button className="flex-1 py-4 premium-button-secondary text-[9px] font-black uppercase tracking-widest justify-center">
                                    <Wrench size={16} /> Manutenção
                                </button>
                                <button className="flex-1 py-4 premium-button-primary text-[9px] font-black uppercase tracking-widest justify-center">
                                    <Download size={16} /> Report SCM
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Registration Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-[var(--bg-primary)] border border-[var(--border-color)] w-full max-w-xl rounded-[var(--radius-lg)] p-12 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[95vh]">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-4">
                                    <PlusCircle size={32} className="text-[var(--accent)]" />
                                    Registo de Ativo
                                </h2>
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.3em] mt-2 italic opacity-60">Vault Asset Ingestion Protocol</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-all text-[var(--text-secondary)]"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8 overflow-y-auto pr-2 no-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="premium-label">Nomenclature do Ativo</label>
                                    <input required placeholder="ex: Gerador Industrial" className="premium-input py-4 text-xs font-black uppercase tracking-widest" value={name} onChange={e => setName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="premium-label">ID / Tag de Inventário</label>
                                    <input required placeholder="VA-EQ-000" className="premium-input py-4 text-xs font-black uppercase tracking-widest" value={code} onChange={e => setCode(e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="premium-label">Categoria Técnica</label>
                                    <input placeholder="ex: Mecânico" className="premium-input py-4 text-xs font-black uppercase tracking-widest" value={category} onChange={e => setCategory(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="premium-label">Saúde Inicial (%)</label>
                                    <input type="number" min="0" max="100" className="premium-input py-4 text-xs font-black uppercase tracking-widest" value={health} onChange={e => setHealth(e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="premium-label">Setor / Localização</label>
                                    <input placeholder="ex: Armazém A" className="premium-input py-4 text-xs font-black uppercase tracking-widest" value={location} onChange={e => setLocation(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="premium-label">Responsável Técnico</label>
                                    <input placeholder="Nome do Executor" className="premium-input py-4 text-xs font-black uppercase tracking-widest" value={owner} onChange={e => setOwner(e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="premium-label">Arquitetura / Descrição Completa</label>
                                <textarea rows={4} placeholder="Especificações técnicas e condições operacionais..." className="premium-input p-6 text-xs font-black uppercase tracking-widest resize-none italic leading-relaxed" value={description} onChange={e => setDescription(e.target.value)} />
                            </div>

                            <div className="pt-8 flex flex-col sm:flex-row gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="premium-button-secondary py-5 flex-1 text-[9px] uppercase tracking-widest justify-center">Cancelar Ingestão</button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="premium-button-primary py-5 flex-[2] text-[9px] uppercase tracking-widest justify-center"
                                >
                                    {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <BadgeCheck size={18} />} Instanciar Ativo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="pt-20 border-t border-[var(--border-color)]/20 text-center">
                <p className="text-[10px] font-black text-[var(--text-secondary)] opacity-10 uppercase tracking-[0.5em] flex items-center justify-center gap-4">
                    <ShieldCheck size={16} /> Asset Vault Management System • VA Sovereign 2026
                </p>
            </div>
        </div>
    );
}
