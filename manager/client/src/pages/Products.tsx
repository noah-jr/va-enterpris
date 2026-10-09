import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Box, 
    Plus, 
    Edit, 
    Trash2, 
    Search, 
    X, 
    BarChart3, 
    Package, 
    List, 
    LayoutGrid, 
    Archive, 
    Zap, 
    BadgeCheck, 
    Loader2, 
    PlusCircle,
    AlertCircle,
    Tag,
    Layers,
    ShoppingCart,
    TrendingUp,
    ScanBarcode,
    Truck,
    Shield
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api';
import { usePermissions } from '../auth/useAuth';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { SearchableSelect } from '../components/SearchableSelect';

interface Product {
    id: string;
    code: string;
    name: string;
    price: number;
    stock: number;
    vatRate: number;
    category?: string;
    classification?: string;
    type?: string;
    imageUrl?: string;
}

import { formatCurrency } from '../utils/format';
const fmt = (v: number) => formatCurrency(v);

export default function Products() {
    const { hasPermission } = usePermissions();
    const qc = useQueryClient();
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [page, setPage] = useState(1);

    const [form, setForm] = useState({
        name: '',
        code: '',
        price: '',
        cost: '',
        stock: '',
        vatRate: '14',
        category: 'GOODS', // GOODS | SERVICES | RAW_MATERIAL
        brand: '',
        barcode: '',
        minStock: '5',
        type: 'PRODUCT',
        classification: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const itemsPerPage = 10;

    const { data: productsData, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => (await api.get('/products')).data as Product[]
    });

    const products = productsData || [];
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedData = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/products', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['products'] });
            toast.success('Produto registado com sucesso.');
            closeModal();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: any) => api.put(`/products/${id}`, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['products'] });
            toast.success('Produto actualizado com sucesso.');
            closeModal();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/products/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['products'] });
            toast.info('Produto removido do catálogo.');
        }
    });

    const openModal = (p?: any) => {
        if (p) {
            setEditingProduct(p);
            setForm({
                name: p.name,
                code: p.code,
                price: p.price.toString(),
                cost: p.cost?.toString() || '',
                stock: p.stock.toString(),
                vatRate: p.vatRate.toString(),
                category: p.category || 'GOODS',
                brand: p.brand || '',
                barcode: p.barcode || '',
                minStock: p.minStock?.toString() || '5',
                type: p.type || 'PRODUCT',
                classification: p.classification || ''
            });
            setImageFile(null);
        } else {
            setEditingProduct(null);
            setForm({ 
                name: '', code: '', price: '', cost: '', stock: '', 
                vatRate: '14', category: 'GOODS', brand: '', barcode: '', minStock: '5',
                type: 'PRODUCT', classification: ''
            });
            setImageFile(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('code', form.code);
        formData.append('name', form.name);
        formData.append('price', form.price);
        if (form.cost) formData.append('cost', form.cost);
        if (form.stock) formData.append('stock', form.stock);
        formData.append('vatRate', form.vatRate);
        formData.append('category', form.category);
        if (form.brand) formData.append('brand', form.brand);
        if (form.barcode) formData.append('barcode', form.barcode);
        if (form.minStock) formData.append('minStock', form.minStock);
        formData.append('type', form.type);
        if (form.classification) formData.append('classification', form.classification);
        
        if (imageFile) {
            formData.append('image', imageFile);
        }

        if (editingProduct) updateMutation.mutate({ id: editingProduct.id, data: formData });
        else createMutation.mutate(formData);
    };

    const columns = [
        {
            header: 'Produto',
            accessor: (p: Product) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)]">
                        <Box size={18} />
                    </div>
                    <div>
                        <p className="font-bold leading-none mb-1">{p.name}</p>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50">Ref: {p.code}</p>
                    </div>
                </div>
            )
        },
        { 
            header: 'Preço', 
            accessor: (p: Product) => <span className="font-bold tabular-nums">{fmt(p.price)}</span> 
        },
        { 
            header: 'Stock', 
            accessor: (p: Product) => (
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${p.stock > 10 ? 'bg-emerald-500' : (p.stock > 0 ? 'bg-amber-500' : 'bg-rose-500 animate-pulse')}`} />
                    <span className="font-bold tabular-nums">{p.stock} UN</span>
                    {p.stock <= 5 && <AlertCircle size={14} className="text-rose-500" />}
                </div>
            )
        },
        { 
            header: 'IVA', 
            accessor: (p: Product) => <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-60 bg-[var(--bg-primary)] px-2 py-1 rounded-[var(--radius-sm)] border border-[var(--border-color)]">{p.vatRate}%</span> 
        },
        {
            header: '',
            accessor: (p: Product) => (
                <div className="flex items-center justify-end gap-2">
                    {hasPermission('products:update') && (
                        <button onClick={(e) => { e.stopPropagation(); openModal(p); }} className="p-2 rounded-[var(--radius-sm)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--accent)] border border-[var(--border-color)] transition-all">
                            <Edit size={14} />
                        </button>
                    )}
                    {hasPermission('products:delete') && (
                        <button onClick={(e) => { e.stopPropagation(); if (confirm('Remover produto?')) deleteMutation.mutate(p.id); }} className="p-2 rounded-[var(--radius-sm)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-rose-500 border border-[var(--border-color)] transition-all">
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            ),
            className: "text-right"
        }
    ];

    const kpis = [
        { label: 'Valor Stock', value: fmt(products.reduce((acc, p) => acc + (p.price * p.stock), 0)), sub: 'Alocação financeira', icon: <BarChart3 size={20} />, color: 'text-sky-600', bg: 'bg-sky-50/50' },
        { label: 'Stock Crítico', value: products.filter(p => p.stock <= 5).length, sub: 'Para reposição', icon: <AlertCircle size={20} />, color: 'text-rose-600', bg: 'bg-rose-50/50' },
        { label: 'Catalogados', value: products.length, sub: 'Itens ativos', icon: <Package size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
        { label: 'Unidades', value: products.reduce((s, p) => s + p.stock, 0), sub: 'Volume total', icon: <Archive size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50/50' }
    ];

    return (
        <div className="space-y-6 pb-8">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">
                        Catálogo de Produtos
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">
                        Gestão de inventário e preçário de ativos
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-0.5 mr-2">
                        <button 
                            onClick={() => setViewMode('grid')} 
                            className={`p-1.5 rounded-[var(--radius-sm)] transition-colors ${viewMode === 'grid' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                        >
                            <LayoutGrid size={15} />
                        </button>
                        <button 
                            onClick={() => setViewMode('table')} 
                            className={`p-1.5 rounded-[var(--radius-sm)] transition-colors ${viewMode === 'table' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                        >
                            <List size={15} />
                        </button>
                    </div>
                    {hasPermission('products:create') && (
                        <button onClick={() => openModal()} className="premium-button-primary">
                            <Plus size={15} />
                            <span>Novo produto</span>
                        </button>
                    )}
                </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Valor Inventário', value: fmt(products.reduce((acc, p) => acc + (p.price * p.stock), 0)), icon: <BarChart3 size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Stock Crítico', value: products.filter(p => (p.stock || 0) <= 5).length.toString(), icon: <AlertCircle size={15} />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                    { label: 'Unidades Totais', value: products.reduce((s, p) => s + (p.stock || 0), 0).toString(), icon: <Layers size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                    { label: 'Giro Inventário', value: '4.2x', icon: <TrendingUp size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' }
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {paginatedData.map(p => (
                        <div 
                            key={p.id} 
                            className="premium-card p-5 group cursor-pointer hover:border-[var(--accent)] transition-all flex flex-col gap-4 active:scale-[0.98]"
                            onClick={() => openModal(p)}
                        >
                            <div className="flex items-start justify-between">
                                {p.imageUrl ? (
                                    <div className="w-12 h-12 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-hidden">
                                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="p-2.5 bg-[var(--bg-primary)] rounded-lg text-[var(--accent)] border border-[var(--border-color)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                                        <Box size={18} />
                                    </div>
                                )}
                                <span className={`badge ${
                                    p.stock > 10 
                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
                                        : (p.stock > 0 ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400')
                                }`}>
                                    {p.stock > 10 ? 'Em Stock' : (p.stock > 0 ? 'Baixo' : 'Esgotado')}
                                </span>
                            </div>
                            
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-[var(--text-primary)] line-clamp-1">{p.name}</h3>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Ref: {p.code}</p>
                            </div>

                            <div className="pt-4 border-t border-[var(--border-color)] flex justify-between items-end mt-auto">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Preço</p>
                                    <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{fmt(p.price)}</p>
                                </div>
                                <div className="text-right space-y-0.5">
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Stock</p>
                                    <p className="text-sm font-bold text-[var(--text-primary)] tabular-nums">{p.stock} UN</p>
                                </div>
                            </div>
                        </div>
                    ))}
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
                    onRowClick={openModal}
                    searchPlaceholder="Pesquisar por nome ou referência..."
                />
            )}

            {/* Modal de Gestão de Produto */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
                subtitle="Catálogo de Inventário"
                type="CENTER"
                width="xl"
                icon={<PlusCircle size={24} className="text-[var(--accent)]" />}
            >
                <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="sm:col-span-2">
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] px-1">Designação do Ativo</label>
                                <input 
                                    required 
                                    value={form.name} 
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value.toUpperCase() }))} 
                                    className="premium-input !py-4 font-black uppercase" 
                                    placeholder="EX: COMPUTADOR PORTÁTIL WORKSTATION Z1..." 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] px-1">Referência / SKU</label>
                                <input 
                                    required 
                                    value={form.code} 
                                    onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} 
                                    className="premium-input !py-4 font-bold" 
                                    placeholder="REF-001" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                             <div>
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] px-1">Categoria</label>
                                <SearchableSelect 
                                    options={[
                                        { label: 'Mercadoria', value: 'GOODS' },
                                        { label: 'Serviço', value: 'SERVICES' },
                                        { label: 'Matéria-Prima', value: 'RAW_MATERIAL' },
                                        { label: 'Ativo Imobilizado', value: 'ASSET' }
                                    ]}
                                    value={form.category}
                                    onChange={val => setForm(p => ({ ...p, category: val }))}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] px-1">Tipo</label>
                                <SearchableSelect 
                                    options={[
                                        { label: 'Produto Físico', value: 'PRODUCT' },
                                        { label: 'Serviço', value: 'SERVICE' }
                                    ]}
                                    value={form.type}
                                    onChange={val => setForm(p => ({ ...p, type: val }))}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] px-1">Classificação Livre</label>
                                <input value={form.classification} onChange={e => setForm(p => ({ ...p, classification: e.target.value }))} className="premium-input !py-4 font-bold" placeholder="Família, Modelo, etc." />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] px-1">Código de Barras</label>
                                <div className="relative">
                                    <ScanBarcode size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input value={form.barcode} onChange={e => setForm(p => ({ ...p, barcode: e.target.value }))} className="premium-input !py-4 !pl-12 font-bold" placeholder="EAN-13..." />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] px-1">Preço Venda</label>
                                <input type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="premium-input !py-4 font-bold text-emerald-600" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] px-1">Custo Médio</label>
                                <input type="number" step="0.01" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} className="premium-input !py-4 font-bold text-rose-500" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] px-1">Stock Atual</label>
                                <input type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} className="premium-input !py-4 font-bold" placeholder="0" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] px-1">Ponto de Encomenda</label>
                                <input type="number" value={form.minStock} onChange={e => setForm(p => ({ ...p, minStock: e.target.value }))} className="premium-input !py-4 font-bold text-amber-500" placeholder="5" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] px-1">Taxa IVA</label>
                                <SearchableSelect 
                                    options={[
                                        { label: '14% Geral', value: '14' },
                                        { label: '7% Reduzida', value: '7' },
                                        { label: '2% Especial', value: '2' },
                                        { label: '0% Isento', value: '0' }
                                    ]}
                                    value={form.vatRate}
                                    onChange={val => setForm(p => ({ ...p, vatRate: val }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] px-1">Imagem do Produto (Opcional)</label>
                                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="premium-input !py-3" />
                            </div>
                        </div>

                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={closeModal} className="premium-button-secondary flex-1">Cancelar</button>
                        <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="premium-button-primary flex-[2]">
                            {(createMutation.isPending || updateMutation.isPending) ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={18} />} 
                            {editingProduct ? 'Guardar Alterações' : 'Adicionar ao Catálogo'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
