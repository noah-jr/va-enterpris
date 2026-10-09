import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Package, 
    Plus, 
    Search, 
    CheckCircle2, 
    X, 
    DollarSign, 
    Loader2, 
    LayoutGrid, 
    List, 
    AlertTriangle, 
    Barcode, 
    MapPin, 
    TrendingUp, 
    Layers, 
    Box, 
    ChevronRight, 
    PlusCircle, 
    Trash2, 
    BadgeCheck,
    Edit
} from 'lucide-react';
import api from '../api';
import { toast } from 'sonner';
import { usePermissions, useMe } from '../auth/useAuth';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
    IN_STOCK: { label: 'Em Stock', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', icon: <CheckCircle2 size={12} /> },
    LOW_STOCK: { label: 'Stock Baixo', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', icon: <AlertTriangle size={12} /> },
    OUT_OF_STOCK: { label: 'Esgotado', color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20', icon: <X size={12} /> },
};

export default function InventoryControl() {
    const qc = useQueryClient();
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const { hasPermission } = usePermissions();
    const { data: me } = useMe();
    const isModuleEnabled = me?.company?.enabledModules?.includes('inventory') || me?.role === 'SUPER_ADMIN';

    const [form, setForm] = useState({
        name: '',
        code: '',
        category: '',
        stock: '',
        unit: 'UN',
        purchasePrice: '',
        minStock: '5',
        type: 'PRODUCT',
        classification: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const itemsPerPage = 8;

    const { data: inventoryData, isLoading } = useQuery({
        queryKey: ['inventory'],
        queryFn: async () => (await api.get('/inventory')).data
    });

    const inventory = inventoryData?.items || [];
    const filtered = inventory.filter((item: any) =>
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedData = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const stats = {
        totalItems: inventoryData?.total || inventory.length,
        totalValue: inventoryData?.totalValue || inventory.reduce((acc: number, item: any) => acc + ((item.stock || 0) * (item.purchasePrice || 0)), 0),
        lowStockItems: inventoryData?.lowStock || inventory.filter((item: any) => (item.stock || 0) <= (item.minStock || 0)).length,
        movements: inventoryData?.movements || 0
    };

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/inventory', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['inventory'] });
            toast.success('Artigo registado com sucesso.');
            setIsModalOpen(false);
            resetForm();
        }
    });

    const resetForm = () => {
        setForm({ name: '', code: '', category: '', stock: '', unit: 'UN', purchasePrice: '', minStock: '5', type: 'PRODUCT', classification: '' });
        setImageFile(null);
    };

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/inventory/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['inventory'] });
            toast.success('Artigo removido do inventário.');
            setSelectedItem(null);
        }
    });

    const columns = [
        {
            header: 'Designação / SKU',
            accessor: (item: any) => (
                <div className="flex items-center gap-3">
                    <div className="kpi-icon rounded-[var(--radius-sm)] bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)] shadow-sm">
                        <Box size={20} />
                    </div>
                    <div>
                        <p className="font-bold leading-none mb-1">{item.name}</p>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-40 uppercase tracking-widest font-mono">SKU: {item.code}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Categoria',
            hideOnMobile: true,
            accessor: (item: any) => (
                <span className="px-2 py-1 rounded-[var(--radius-sm)] bg-[var(--bg-primary)] border border-[var(--border-color)] text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                    {item.category || 'DIVERSOS'}
                </span>
            )
        },
        {
            header: 'Nível de Stock',
            accessor: (item: any) => {
                const isCritical = (item.stock || 0) <= (item.minStock || 0);
                return (
                    <div className="flex flex-col gap-1.5 min-w-[120px]">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className={isCritical ? 'text-rose-500' : 'text-emerald-600'}>{item.stock} {item.unit}</span>
                            <span className="opacity-40">Mín: {item.minStock}</span>
                        </div>
                        <div className="h-1 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-color)]">
                            <div className={`h-full ${isCritical ? 'bg-rose-500' : 'bg-[var(--accent)]'}`} style={{ width: `${Math.min(100, (item.stock / (Math.max(1, item.minStock) * 2)) * 100)}%` }} />
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Valor Unitário',
            hideOnMobile: true,
            accessor: (item: any) => <span className="text-sm font-black tabular-nums">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(item.purchasePrice)}</span>
        },
        {
            header: 'Estado',
            accessor: (item: any) => {
                const cfg = STATUS_CFG[item.stock === 0 ? 'OUT_OF_STOCK' : item.stock <= item.minStock ? 'LOW_STOCK' : 'IN_STOCK'];
                return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-sm)] text-[10px] font-black border ${cfg.bg} ${cfg.color} ${cfg.border} uppercase shadow-sm`}>
                        {cfg.icon} {cfg.label}
                    </span>
                );
            }
        },
        {
            header: '',
            accessor: (item: any) => (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }} className="p-2 rounded-[var(--radius-sm)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--accent)] border border-[var(--border-color)] transition-all shadow-sm">
                        <TrendingUp size={14} />
                    </button>
                    {hasPermission('inventory:delete') && (
                        <button onClick={(e) => { e.stopPropagation(); if (confirm('Remover do inventário?')) deleteMutation.mutate(item.id); }} className="p-2 rounded-[var(--radius-sm)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-rose-500 border border-[var(--border-color)] transition-all shadow-sm">
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            ),
            className: "text-right"
        }
    ];

    return (
        <div className="space-y-8 pb-20 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Gestão de Inventário SCM</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Monitorização de fluxos, rastreabilidade e optimização de stock.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1 rounded-[var(--radius-md)] shadow-sm">
                        <button onClick={() => setViewMode('grid')} className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
                            <LayoutGrid size={16} />
                        </button>
                        <button onClick={() => setViewMode('table')} className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${viewMode === 'table' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
                            <List size={16} />
                        </button>
                    </div>
                    {hasPermission('inventory:create') && isModuleEnabled && (
                        <button onClick={() => setIsModalOpen(true)} className="premium-button-primary">
                            <Plus size={18} /> Novo Artigo
                        </button>
                    )}
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'SKUs Catalogados', value: stats.totalItems.toString(), icon: <Package size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Valorização Stock', value: new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(stats.totalValue), icon: <DollarSign size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Items Críticos', value: stats.lowStockItems.toString(), icon: <AlertTriangle size={15} />, color: stats.lowStockItems > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                    { label: 'Taxa Rotação', value: `${stats.movements}%`, icon: <TrendingUp size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
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
            {viewMode === 'grid' ? (
                <div className="space-y-6">
                    <div className="bg-[var(--bg-secondary)] p-2 rounded-[var(--radius-md)] border border-[var(--border-color)] shadow-sm">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                            <input 
                                type="text"
                                placeholder="Pesquisar por SKU, nome ou categoria..."
                                className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedData.map((item: any) => {
                            const cfg = STATUS_CFG[item.stock === 0 ? 'OUT_OF_STOCK' : item.stock <= item.minStock ? 'LOW_STOCK' : 'IN_STOCK'];
                            const isCritical = item.stock <= item.minStock;
                            return (
                                <div key={item.id} onClick={() => setSelectedItem(item)} className="premium-card p-6 cursor-pointer group hover:border-[var(--accent)] transition-all">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className={`kpi-icon bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[var(--radius-md)] flex items-center justify-center text-[var(--accent)] shadow-inner group-hover:scale-105 transition-transform ${item.imageUrl ? 'p-0 overflow-hidden border-none bg-transparent' : ''}`}>
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-[var(--radius-md)]" />
                                            ) : (
                                                <Box size={24} />
                                            )}
                                        </div>
                                        <div className={`px-2 py-1 rounded-[var(--radius-sm)] text-[10px] font-black uppercase tracking-widest border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                            {cfg.label}
                                        </div>
                                    </div>
                                    <h3 className="text-base font-black text-[var(--text-primary)] leading-tight line-clamp-2">{item.name}</h3>
                                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)] mt-4">
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Stock: {item.stock} {item.unit}</p>
                                        <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent)]" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <DataTable 
                    data={paginatedData}
                    columns={columns}
                    isLoading={isLoading}
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={filtered.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setPage}
                    onSearchChange={setSearchTerm}
                    searchValue={searchTerm}
                    onRowClick={setSelectedItem}
                    searchPlaceholder="Pesquisar por SKU ou descrição..."
                />
            )}

            {/* Painel de Detalhes do Artigo */}
            <Modal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                title={selectedItem ? `Artigo: ${selectedItem.code}` : ''}
                subtitle="Rastreabilidade SCM"
                type="SIDE"
                width="lg"
                icon={<Box size={24} className="text-[var(--accent)]" />}
            >
                {selectedItem && (
                    <div className="p-4 sm:p-8 space-y-8 flex-1 overflow-y-auto no-scrollbar">
                        <div className="premium-card p-4 sm:p-8 bg-[var(--bg-primary)]/50 border-[var(--accent)]/10 group">
                            <div className="flex justify-between items-start mb-10">
                                <div className="p-4 bg-[var(--bg-secondary)] rounded-[var(--radius-md)] border border-[var(--border-color)] text-[var(--accent)] shadow-lg">
                                    <Box size={32} />
                                </div>
                                <span className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-black uppercase tracking-widest border ${STATUS_CFG[selectedItem.stock === 0 ? 'OUT_OF_STOCK' : selectedItem.stock <= selectedItem.minStock ? 'LOW_STOCK' : 'IN_STOCK'].bg} ${STATUS_CFG[selectedItem.stock === 0 ? 'OUT_OF_STOCK' : selectedItem.stock <= selectedItem.minStock ? 'LOW_STOCK' : 'IN_STOCK'].color} ${STATUS_CFG[selectedItem.stock === 0 ? 'OUT_OF_STOCK' : selectedItem.stock <= selectedItem.minStock ? 'LOW_STOCK' : 'IN_STOCK'].border}`}>
                                    {STATUS_CFG[selectedItem.stock === 0 ? 'OUT_OF_STOCK' : selectedItem.stock <= selectedItem.minStock ? 'LOW_STOCK' : 'IN_STOCK'].label}
                                </span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-tight mb-2 uppercase">{selectedItem.name}</h2>
                            <p className="text-sm font-bold text-[var(--accent)] uppercase tracking-widest">{selectedItem.category || 'DIVERSOS'}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { label: 'Stock em Armazém', value: `${selectedItem.stock} ${selectedItem.unit}`, icon: <Layers size={18} /> },
                                { label: 'Valor Unitário', value: new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(selectedItem.purchasePrice), icon: <DollarSign size={18} /> },
                                { label: 'Mínimo Segurança', value: `${selectedItem.minStock} ${selectedItem.unit}`, icon: <AlertTriangle size={18} /> },
                                { label: 'Identificador', value: 'VA-SCM-CERT', icon: <Barcode size={18} /> },
                            ].map((item, i) => (
                                <div key={i} className="premium-card p-4 flex flex-col gap-3 group">
                                    <div className="p-2 w-fit rounded-[var(--radius-sm)] bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--accent)]">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{item.label}</p>
                                        <p className="text-sm font-black text-[var(--text-primary)]">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-10 flex gap-4">
                            <button className="premium-button-primary flex-1">
                                <TrendingUp size={18} /> Registar Entrada
                            </button>
                            <button className="premium-button-secondary flex-1">
                                <Edit size={18} /> Editar SKU
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal de Registo de Artigo */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Admissão de Artigo"
                subtitle="Gestão de SKUs SCM v4.0"
                type="CENTER"
                width="xl"
                icon={<PlusCircle size={24} className="text-[var(--accent)]" />}
            >
                <form 
                    onSubmit={(e) => { 
                        e.preventDefault(); 
                        const formData = new FormData();
                        formData.append('name', form.name);
                        formData.append('code', form.code);
                        formData.append('stock', form.stock);
                        formData.append('unit', form.unit);
                        formData.append('purchasePrice', form.purchasePrice);
                        formData.append('minStock', form.minStock);
                        formData.append('category', form.category || 'DIVERSOS');
                        formData.append('type', form.type);
                        if (form.classification) formData.append('classification', form.classification);
                        if (imageFile) formData.append('image', imageFile);

                        createMutation.mutate(formData);
                    }} 
                    className="p-4 sm:p-8 space-y-6"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="premium-label">Designação Comercial</label>
                            <input 
                                required 
                                value={form.name} 
                                onChange={e => setForm({...form, name: e.target.value})} 
                                className="premium-input" 
                                placeholder="Ex: Cimento Portland CP I-40" 
                            />
                        </div>
                        <div>
                            <label className="premium-label">Código / SKU</label>
                            <input 
                                required 
                                value={form.code} 
                                onChange={e => setForm({...form, code: e.target.value})} 
                                className="premium-input font-mono uppercase" 
                                placeholder="VA-SKU-001" 
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="premium-label">Stock Inicial</label>
                                <input 
                                    type="number" 
                                    required 
                                    value={form.stock} 
                                    onChange={e => setForm({...form, stock: e.target.value})} 
                                    className="premium-input" 
                                />
                            </div>
                            <div>
                                <label className="premium-label">Unidade</label>
                                <select 
                                    value={form.unit} 
                                    onChange={e => setForm({...form, unit: e.target.value})} 
                                    className="premium-input"
                                >
                                    <option value="UN">UN</option>
                                    <option value="KG">KG</option>
                                    <option value="L">L</option>
                                    <option value="M">M</option>
                                    <option value="CX">CX</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="premium-label">Preço Aquisição (AOA)</label>
                            <input 
                                type="number" 
                                required 
                                value={form.purchasePrice} 
                                onChange={e => setForm({...form, purchasePrice: e.target.value})} 
                                className="premium-input font-bold" 
                            />
                        </div>
                        <div>
                            <label className="premium-label">Tipo de Produto</label>
                            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="premium-input">
                                <option value="PRODUCT">Produto Físico</option>
                                <option value="SERVICE">Serviço</option>
                            </select>
                        </div>
                        <div>
                            <label className="premium-label">Classificação</label>
                            <input value={form.classification} onChange={e => setForm({...form, classification: e.target.value})} className="premium-input" placeholder="Categoria secundária..." />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="premium-label">Imagem (Opcional)</label>
                            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="premium-input !py-3" />
                        </div>
                    </div>
                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="premium-button-secondary flex-1">Cancelar</button>
                        <button type="submit" disabled={createMutation.isPending} className="premium-button-primary flex-[2]">
                            {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <BadgeCheck size={18} />}
                            Efectivar Catálogo
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
