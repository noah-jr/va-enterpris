import { useState, useEffect, useMemo } from 'react';
import { 
    ShoppingCart, Search, X, Plus, Minus, CreditCard, 
    DollarSign, Printer, ArrowLeft, Loader2, Package, 
    User, Terminal, CheckCircle, AlertCircle, Tag,
    ChevronRight, Wallet, History, Maximize2, Minimize2,
    Users, Pause, Play, Trash2, LayoutGrid, List, Barcode, Activity, Lock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal } from '../components/Modal';
import { formatCurrency } from '../utils/format';

const fmt = (v: number) => formatCurrency(v);

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    code: string;
    category?: string;
    vatRate?: number;
}

interface CartItem extends Product {
    quantity: number;
    itemDiscount?: number;
}

interface HeldSale {
    id: string;
    cart: CartItem[];
    discount: number;
    customer: any;
    time: Date;
}

export default function POSConsole() {
    const { terminalId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    // UI State
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [receiptData, setReceiptData] = useState<any>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
    const [showHistory, setShowHistory] = useState(false);
    const [showCustomers, setShowCustomers] = useState(false);
    const [showCashOps, setShowCashOps] = useState(false);
    const [showXReport, setShowXReport] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [heldSales, setHeldSales] = useState<HeldSale[]>([]);
    const [showCartMobile, setShowCartMobile] = useState(false);

    // 1. Data Fetching
    const { data: session, isLoading: isLoadingSession } = useQuery({
        queryKey: ['pos-session', terminalId],
        queryFn: async () => (await api.get(`/pos/terminals/${terminalId}/active-session`)).data,
        enabled: !!terminalId
    });

    const { data: products = [] } = useQuery({
        queryKey: ['pos-products'],
        queryFn: async () => (await api.get('/products')).data as Product[]
    });

    const { data: sales = [] } = useQuery({
        queryKey: ['pos-recent-sales'],
        queryFn: async () => (await api.get('/pos/sales')).data,
        enabled: showHistory
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['pos-customers'],
        queryFn: async () => (await api.get('/clients')).data,
        enabled: showCustomers
    });

    const categories = useMemo(() => 
        ['ALL', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))],
    [products]);

    // 2. Mutations
    const saleMutation = useMutation({
        mutationFn: (data: any) => api.post('/pos/sales', data),
        onSuccess: (res) => {
            toast.success('Venda processada com sucesso.');
            setReceiptData({
                ...res.data,
                items: [...cart],
                terminal: session.terminal.name,
                operator: session.operatorId.slice(0, 8),
                date: new Date().toLocaleString('pt-PT'),
                amountPaid: total,
                changeAmount: 0
            });
            setCart([]);
            setDiscount(0);
            setSelectedCustomer(null);
            queryClient.invalidateQueries({ queryKey: ['pos-session'] });
            queryClient.invalidateQueries({ queryKey: ['pos-products'] });
            queryClient.invalidateQueries({ queryKey: ['pos-recent-sales'] });
        },
        onError: () => toast.error('Falha ao processar venda.')
    });

    // 3. Logic
    const addToCart = (product: Product) => {
        if (product.stock <= 0) {
            toast.error('Produto sem stock disponível.');
            return;
        }
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => 
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setSearch(''); 
        toast.success(`${product.name} adicionado ao carrinho`, { duration: 1500 });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity) - (item.itemDiscount || 0), 0), [cart]);
    const totalTax = useMemo(() => cart.reduce((sum, item) => sum + ((item.price * item.quantity - (item.itemDiscount || 0)) * (item.vatRate || 14) / 100), 0), [cart]);
    const total = useMemo(() => Math.max(0, subtotal + totalTax - discount), [subtotal, totalTax, discount]);

    const handleCheckout = () => {
        if (!cart.length) return;
        setIsProcessing(true);
        saleMutation.mutate({
            terminalId,
            sessionId: session?.id,
            paymentMethod,
            discount,
            clientId: selectedCustomer?.id,
            items: cart.map(item => ({
                productId: item.id,
                price: item.price,
                quantity: item.quantity
            }))
        }, {
            onSettled: () => setIsProcessing(false)
        });
    };

    const holdSale = () => {
        if (!cart.length) {
            toast.error('O carrinho está vazio. Adicione produtos antes de pausar a venda.');
            return;
        }
        const newHold: HeldSale = {
            id: Math.random().toString(36).substr(2, 6).toUpperCase(),
            cart: [...cart],
            discount,
            customer: selectedCustomer,
            time: new Date()
        };
        setHeldSales(prev => [newHold, ...prev]);
        setCart([]);
        setDiscount(0);
        setSelectedCustomer(null);
        toast.info('Venda colocada em espera.');
    };

    const resumeSale = (held: HeldSale) => {
        if (cart.length) {
            toast.error('Limpe o carrinho antes de retomar uma venda.');
            return;
        }
        setCart(held.cart);
        setDiscount(held.discount);
        setSelectedCustomer(held.customer);
        setHeldSales(prev => prev.filter(h => h.id !== held.id));
        toast.success('Venda retomada.');
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                             p.code.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === 'ALL' || p.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent default browser shortcuts like F3 (Find)
            if (e.key === 'F1') { e.preventDefault(); document.querySelector<HTMLInputElement>('input[placeholder*="Pesquisar"]')?.focus(); }
            if (e.key === 'F2') { e.preventDefault(); handleCheckout(); }
            if (e.key === 'F3') { 
                e.preventDefault(); 
                if (cart.length > 0) holdSale(); 
                else if (heldSales.length > 0) resumeSale(heldSales[0]);
            }
            if (e.key === 'F4') { e.preventDefault(); setPaymentMethod(prev => prev === 'CASH' ? 'CARD' : 'CASH'); }
            if (e.key === 'Escape') { setReceiptData(null); setShowHistory(false); setShowCustomers(false); setShowCashOps(false); setShowXReport(false); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart, total, paymentMethod, selectedCustomer, discount, heldSales]);

    if (isLoadingSession) return (
        <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-[var(--accent)]" size={24} />
                <span className="text-sm text-[var(--text-muted)]">A carregar terminal...</span>
            </div>
        </div>
    );

    if (!session) return (
        <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)] p-6">
            <div className="premium-card p-12 text-center max-w-md w-full">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Lock size={24} />
                </div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Terminal Bloqueado</h2>
                <p className="text-sm text-[var(--text-muted)] mt-2">
                    Este terminal PDV não possui uma sessão activa. É necessário abrir o caixa para operar.
                </p>
                <button onClick={() => navigate('/pos')} className="premium-button-primary w-full mt-8">
                    Voltar à Gestão
                </button>
            </div>
        </div>
    );

    return (
        <>
        <div className="h-screen flex flex-col bg-[var(--bg-primary)] overflow-hidden print:hidden">
            {/* Header - Dashboard Style */}
            <header className="min-h-14 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex flex-wrap lg:flex-nowrap items-center justify-between p-3 lg:px-6 shrink-0 z-50 gap-3">
                <div className="flex items-center gap-3 lg:gap-4">
                    <button onClick={() => navigate('/pos')} className="premium-button-secondary !p-2 !rounded-lg hover:bg-[var(--bg-primary)]">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center gap-2 lg:gap-3">
                        <div className="hidden sm:flex w-8 h-8 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] items-center justify-center text-[var(--accent)]">
                            <Terminal size={16} />
                        </div>
                        <div>
                            <span className="text-xs lg:text-sm font-bold text-[var(--text-primary)] block leading-none">{session.terminal.name}</span>
                            <span className="text-[10px] text-emerald-500 font-medium">Sessão Activa</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 lg:gap-3 ml-auto lg:ml-0">
                    <div className="flex items-center gap-1 lg:gap-2 pr-2 lg:pr-4 lg:border-r border-[var(--border-color)]">
                        <button onClick={() => setShowHistory(true)} className="premium-button-secondary !p-2 !rounded-lg" title="Histórico (F5)">
                            <History size={16} />
                        </button>
                        <button onClick={() => setShowCashOps(true)} className="premium-button-secondary !p-2 !rounded-lg hidden sm:flex" title="Operações de Caixa">
                            <Wallet size={16} />
                        </button>
                        <button onClick={() => setShowXReport(true)} className="premium-button-secondary !p-2 !rounded-lg hidden sm:flex" title="Relatório X">
                            <Activity size={16} />
                        </button>
                        <button onClick={holdSale} className="premium-button-secondary !p-2 !rounded-lg hidden sm:flex" title="Pausar (F3)">
                            <Pause size={16} />
                        </button>
                        <button onClick={toggleFullscreen} className="premium-button-secondary !p-2 !rounded-lg hidden sm:flex">
                            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2 lg:pl-2">
                        <button 
                            className={`lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${showCartMobile ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-[var(--bg-primary)] text-[var(--text-muted)] border-[var(--border-color)]'}`}
                            onClick={() => setShowCartMobile(!showCartMobile)}
                        >
                            <ShoppingCart size={16} />
                            {cart.length > 0 && (
                                <span className={`text-xs font-bold ${showCartMobile ? 'text-white' : 'text-[var(--accent)]'}`}>
                                    {cart.length}
                                </span>
                            )}
                        </button>
                        <div className="hidden sm:flex w-7 h-7 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] items-center justify-center">
                            <User size={14} />
                        </div>
                        <span className="hidden sm:inline text-xs font-medium text-[var(--text-secondary)]">Op: {session.operatorId.slice(0, 8)}</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left: Engine */}
                <main className={`flex-1 flex-col overflow-hidden p-3 lg:p-6 gap-4 lg:gap-6 ${showCartMobile ? 'hidden lg:flex' : 'flex'}`}>
                    {/* Search & Shortcuts */}
                    <div className="flex flex-col gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                            <input 
                                placeholder="Pesquisar produto ou código de barras... (F1)" 
                                className="premium-input !pl-12 !py-3.5 !text-base font-medium !rounded-xl shadow-sm"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                autoFocus
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <Barcode size={18} className="text-[var(--text-muted)] opacity-50" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat as string)}
                                    className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${activeCategory === cat ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--border-strong)]'}`}
                                >
                                    {cat === 'ALL' ? 'Todos os Produtos' : cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4 pb-10">
                            {filteredProducts.map(product => (
                                <button 
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="premium-card !p-3 flex flex-col gap-3 hover:border-[var(--accent)] transition-all group active:scale-[0.98] text-left"
                                >
                                    <div className="w-full aspect-square bg-[var(--bg-primary)] rounded-lg flex items-center justify-center text-[var(--text-muted)] relative overflow-hidden">
                                        <Package size={32} className="opacity-10 group-hover:scale-110 transition-transform" />
                                        {product.stock <= 5 && (
                                            <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${product.stock === 0 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>
                                                {product.stock === 0 ? 'Esgotado' : `${product.stock} un`}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-xs font-bold text-[var(--text-primary)] leading-tight line-clamp-2 h-8">{product.name}</h3>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-sm font-bold text-[var(--text-primary)] tabular-nums">{fmt(product.price)}</span>
                                            <div className="w-6 h-6 rounded-md bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] group-hover:bg-[var(--accent)] group-hover:text-white group-hover:border-[var(--accent)] transition-all">
                                                <Plus size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Shortcuts Bar */}
                    <div className="h-10 shrink-0 border-t border-[var(--border-color)] hidden lg:flex items-center gap-6 px-2 opacity-50">
                        {[
                            { k: 'F1', a: 'Pesquisar' },
                            { k: 'F2', a: 'Finalizar' },
                            { k: 'F3', a: 'Pausar' },
                            { k: 'F4', a: 'Pagamento' },
                            { k: 'ESC', a: 'Sair' }
                        ].map(s => (
                            <div key={s.k} className="flex items-center gap-2">
                                <span className="bg-[var(--bg-secondary)] border border-[var(--border-strong)] px-1.5 py-0.5 rounded text-[10px] font-bold font-mono">{s.k}</span>
                                <span className="text-[10px] font-medium uppercase tracking-wider">{s.a}</span>
                            </div>
                        ))}
                    </div>
                </main>

                {/* Right: Checkout Sidebar */}
                <aside className={`w-full lg:w-96 xl:w-[420px] bg-[var(--bg-secondary)] lg:border-l border-[var(--border-color)] flex-col shrink-0 ${showCartMobile ? 'flex h-full' : 'hidden lg:flex lg:h-full'}`}>
                    {/* Customer Info */}
                    <div className="p-5 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/10">
                        <button 
                            onClick={() => setShowCustomers(true)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedCustomer ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/5' : 'border-dashed border-[var(--border-color)] hover:border-[var(--accent)]'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${selectedCustomer ? 'bg-emerald-500 text-white' : 'bg-[var(--bg-primary)] text-[var(--text-muted)]'}`}>
                                    <Users size={18} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-[var(--text-primary)]">{selectedCustomer?.name || 'Consumidor Final'}</p>
                                    <p className="text-[10px] text-[var(--text-muted)] font-medium">NIF: {selectedCustomer?.nif || '999999999'}</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-[var(--text-muted)]" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar">
                        {cart.length === 0 ? (
                            heldSales.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center grayscale py-20">
                                    <ShoppingCart size={40} className="mb-4" />
                                    <p className="text-xs font-bold uppercase tracking-widest">Carrinho Vazio</p>
                                </div>
                            )
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="premium-card !p-3 flex items-center gap-4 hover:border-[var(--accent)]/30 transition-all">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">{item.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs font-bold text-[var(--accent)] tabular-nums">{fmt(item.price)}</p>
                                            <span className="text-[10px] text-[var(--text-muted)]">Sub: {fmt(item.price * item.quantity)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-[var(--bg-primary)] p-1 rounded-lg border border-[var(--border-color)]">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 rounded hover:bg-[var(--bg-secondary)]"><Minus size={12} /></button>
                                        <span className="text-xs font-bold w-6 text-center tabular-nums">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 rounded hover:bg-[var(--bg-secondary)]"><Plus size={12} /></button>
                                    </div>
                                </div>
                            ))
                        )}

                        {heldSales.length > 0 && (
                            <div className="pt-6 mt-6 border-t border-[var(--border-color)]">
                                <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Pause size={14} /> Vendas em Espera ({heldSales.length})
                                </h3>
                                <div className="space-y-2">
                                    {heldSales.map(held => (
                                        <div key={held.id} className="p-3 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl flex items-center justify-between">
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold text-[var(--text-primary)]">SESSÃO {held.id}</p>
                                                <p className="text-[10px] text-[var(--text-muted)] truncate">{held.cart.length} ITENS · {held.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            <button 
                                                onClick={() => resumeSale(held)}
                                                className="p-2 rounded-lg bg-amber-500 text-white shadow-sm hover:scale-105 transition-all"
                                            >
                                                <Play size={14} fill="currentColor" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Totals & Actions */}
                    <div className="p-6 bg-[var(--bg-primary)] border-t border-[var(--border-color)] shadow-inner">
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-xs font-medium text-[var(--text-secondary)] px-1">
                                <span>Subtotal Líquido</span>
                                <span className="tabular-nums font-bold">{fmt(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-medium text-[var(--text-secondary)] px-1">
                                <span>IVA (Taxa Média)</span>
                                <span className="tabular-nums font-bold">{fmt(totalTax)}</span>
                            </div>
                            <div className="flex items-center justify-between bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                    <Tag size={14} className="text-rose-500" />
                                    <span className="text-xs font-bold text-[var(--text-secondary)]">Desconto</span>
                                </div>
                                <input 
                                    type="number" 
                                    className="bg-transparent border-none text-right outline-none font-bold text-sm w-24 text-rose-500 tabular-nums" 
                                    value={discount || ''}
                                    placeholder="0"
                                    onChange={e => setDiscount(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 opacity-50">Total a Liquidar</p>
                                <div className="text-5xl font-black text-[var(--text-primary)] tabular-nums tracking-tighter leading-none">
                                    {fmt(total)}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setPaymentMethod('CASH')}
                                    className={`py-3.5 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'CASH' ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]' : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'}`}
                                >
                                    <Wallet size={20} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Numerário</span>
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('CARD')}
                                    className={`py-3.5 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'CARD' ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]' : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'}`}
                                >
                                    <CreditCard size={20} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Multicaixa</span>
                                </button>
                            </div>

                            <button 
                                onClick={handleCheckout}
                                disabled={isProcessing || !cart.length}
                                className="w-full bg-[var(--accent)] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-[var(--accent-glow)] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale group"
                            >
                                {isProcessing ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <CheckCircle size={18} />
                                        Finalizar Venda (F2)
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
            
            {/* Modals - Dashboard Styles */}
            <Modal
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                title="Histórico de Vendas"
                subtitle="Últimas transacções efectuadas"
                width="xl"
            >
                <div className="overflow-x-auto">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th># ID</th>
                                <th>Data & Hora</th>
                                <th>Pagamento</th>
                                <th className="text-right">Itens</th>
                                <th className="text-right">Total</th>
                                <th className="text-right">Acção</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map((sale: any) => (
                                <tr key={sale.id}>
                                    <td className="font-bold text-[var(--accent)]">#{sale.id.slice(-6).toUpperCase()}</td>
                                    <td className="text-[11px] font-medium">{new Date(sale.date).toLocaleString()}</td>
                                    <td>
                                        <span className={`badge ${sale.paymentMethod === 'CASH' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'}`}>
                                            {sale.paymentMethod === 'CASH' ? 'Numerário' : 'Multicaixa'}
                                        </span>
                                    </td>
                                    <td className="text-right font-bold">{sale.itemsCount}</td>
                                    <td className="text-right font-bold tabular-nums">{fmt(sale.amount)}</td>
                                    <td className="text-right">
                                        {sale.status !== 'RETURNED' && (
                                            <button 
                                                onClick={() => { if(confirm('Confirmar devolução desta venda?')) saleMutation.mutate({ ...sale, status: 'RETURNED' }); }}
                                                className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
                                                title="Devolver Venda"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {sales.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-sm text-[var(--text-muted)]">Nenhuma transacção registada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Modal>

            <Modal
                isOpen={showCustomers}
                onClose={() => setShowCustomers(false)}
                title="Seleccionar Cliente"
                subtitle="Associe um cliente à facturação"
                width="xl"
            >
                <div className="p-6 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                        <input 
                            placeholder="Procurar cliente por nome ou NIF..." 
                            className="premium-input !pl-12" 
                            value={customerSearch}
                            onChange={e => setCustomerSearch(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
                        <button 
                            onClick={() => { setSelectedCustomer(null); setShowCustomers(false); setCustomerSearch(''); }}
                            className="w-full p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl flex items-center justify-between hover:border-[var(--accent)] transition-all group"
                        >
                            <div className="text-left">
                                <p className="text-sm font-bold">Consumidor Final</p>
                                <p className="text-[11px] text-[var(--text-muted)] font-medium">Sem identificação</p>
                            </div>
                            {!selectedCustomer && <CheckCircle size={18} className="text-emerald-500" />}
                        </button>
                        {customers.filter((c: any) => 
                            c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
                            c.nif.includes(customerSearch)
                        ).map((c: any) => (
                            <button 
                                key={c.id}
                                onClick={() => { setSelectedCustomer(c); setShowCustomers(false); setCustomerSearch(''); }}
                                className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl flex items-center justify-between hover:border-[var(--accent)] transition-all group"
                            >
                                <div className="text-left">
                                    <p className="text-sm font-bold">{c.name}</p>
                                    <p className="text-[11px] text-[var(--text-muted)] font-medium">NIF: {c.nif}</p>
                                </div>
                                {selectedCustomer?.id === c.id && <CheckCircle size={18} className="text-emerald-500" />}
                            </button>
                        ))}
                    </div>
                </div>
            </Modal>

            {/* Cash Ops Modal */}
            <Modal
                isOpen={showCashOps}
                onClose={() => setShowCashOps(false)}
                title="Operações de Caixa"
                subtitle="Entrada ou Saída de Valores"
                width="lg"
            >
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-6 border-2 border-dashed border-[var(--border-color)] rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group">
                            <Plus className="mx-auto mb-3 text-emerald-500" />
                            <p className="text-sm font-bold">Reforço</p>
                            <p className="text-[10px] text-[var(--text-muted)]">Adicionar fundo de maneio</p>
                        </button>
                        <button className="p-6 border-2 border-dashed border-[var(--border-color)] rounded-2xl hover:border-rose-500 hover:bg-rose-50/50 transition-all group">
                            <Minus className="mx-auto mb-3 text-rose-500" />
                            <p className="text-sm font-bold">Sangria</p>
                            <p className="text-[10px] text-[var(--text-muted)]">Retirar valor do caixa</p>
                        </button>
                    </div>
                </div>
            </Modal>

            {/* X-Report Modal */}
            <Modal
                isOpen={showXReport}
                onClose={() => setShowXReport(false)}
                title="Relatório X (Parcial)"
                subtitle="Resumo de facturação do turno actual"
                width="lg"
            >
                <div id="pos-receipt" className="p-8 space-y-6">
                    <div className="text-center print:block hidden mb-4">
                        <img src="/logo_full.png" alt="VA OneGest" className="h-10 object-contain mx-auto mb-2" />
                        <h2 className="text-xl font-black uppercase tracking-widest mb-1">Relatório X</h2>
                        <p className="text-[10px] opacity-60">Resumo Parcial de Turno</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] print:border-black print:rounded-none">
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Vendas (Qtd)</p>
                            <p className="text-xl font-bold">{sales.length}</p>
                        </div>
                        <div className="p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] print:border-black print:rounded-none">
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Total Bruto</p>
                            <p className="text-xl font-bold">{fmt(sales.reduce((s: any, v: any) => s + v.amount, 0))}</p>
                        </div>
                    </div>
                    <button onClick={() => window.print()} className="premium-button-primary w-full print:hidden">
                        <Printer size={16} /> Imprimir Resumo Parcial
                    </button>
                </div>
            </Modal>

            {receiptData && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 backdrop-blur-md bg-black/30 print:bg-white print:p-0 print:block print:relative print:backdrop-blur-none">
                    <div id="pos-receipt" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-fade-in print:w-[80mm] print:shadow-none print:mx-auto print:dark:bg-white print:dark:text-black">
                        
                        <div className="p-8 pb-4 text-center border-b border-zinc-100 dark:border-zinc-800 print:border-black print:pb-2">
                            <img src="/logo_full.png" alt="VA OneGest" className="h-10 object-contain mx-auto mb-4" />
                            <h2 className="text-xl font-black uppercase tracking-widest mb-1">Factura / Recibo</h2>
                            <p className="text-[10px] opacity-60">VA OneGest - Soluções de Gestão</p>
                            <div className="mt-4 text-left font-mono text-[10px] space-y-0.5">
                                <p><strong>DATA:</strong> {receiptData.date}</p>
                                <p><strong>DOC:</strong> {receiptData.invoiceNumber || `#${receiptData.id.slice(-8).toUpperCase()}`}</p>
                                <p><strong>OP:</strong> {receiptData.operator}</p>
                                <p><strong>CAIXA:</strong> {receiptData.terminal}</p>
                                {receiptData.clientId && <p><strong>CLIENTE:</strong> {receiptData.clientId}</p>}
                            </div>
                        </div>

                        <div className="p-8 pt-4 space-y-4 font-mono text-xs print:p-4">
                            <div className="space-y-2 border-b border-zinc-100 dark:border-zinc-800 print:border-black pb-4">
                                <div className="flex justify-between font-bold text-[10px] uppercase opacity-60">
                                    <span>Artigo</span>
                                    <span>Total</span>
                                </div>
                                {receiptData.items.map((it: any) => (
                                    <div key={it.id} className="flex justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold truncate">{it.name}</p>
                                            <p className="text-[10px] opacity-60">{it.quantity} x {fmt(it.price)} {it.vatRate ? `(IVA ${it.vatRate}%)` : ''}</p>
                                        </div>
                                        <span className="font-bold">{fmt(it.price * it.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="space-y-1.5 pb-4 border-b border-zinc-100 dark:border-zinc-800 print:border-black">
                                <div className="flex justify-between opacity-60 text-[10px]">
                                    <span>Subtotal Líquido</span>
                                    <span>{fmt(receiptData.subtotal || receiptData.amount)}</span>
                                </div>
                                <div className="flex justify-between opacity-60 text-[10px]">
                                    <span>Total IVA</span>
                                    <span>{fmt(receiptData.taxAmount || 0)}</span>
                                </div>
                                {receiptData.discount > 0 && (
                                    <div className="flex justify-between text-rose-500 text-[10px]">
                                        <span>Desconto</span>
                                        <span>-{fmt(receiptData.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-base font-black pt-2">
                                    <span>TOTAL A PAGAR</span>
                                    <span>{fmt(receiptData.amount)}</span>
                                </div>
                            </div>

                            {receiptData.amountPaid !== undefined && (
                                <div className="space-y-2 pb-4 border-b border-zinc-100 dark:border-zinc-800 print:border-black text-center pt-4">
                                    <p className="text-[9px] opacity-60 uppercase font-bold tracking-widest">Informação de Pagamento</p>
                                    <div className="flex justify-center items-center gap-8 text-[11px]">
                                        <div className="flex flex-col items-center">
                                            <span className="opacity-60 mb-0.5">Recebido</span>
                                            <span className="font-bold">{fmt(receiptData.amountPaid)}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="opacity-60 mb-0.5">Troco</span>
                                            <span className="font-bold text-indigo-500 print:text-black">{fmt(receiptData.changeAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="text-center text-[10px] opacity-60 space-y-1 pt-4 pb-6 print:pb-32">
                                <p>Obrigado pela sua preferência!</p>
                                <p>Processado por Programa Validado nº 232/AGT/2026</p>
                            </div>

                            <div className="flex gap-2 pt-6 print:hidden">
                                <button onClick={() => setReceiptData(null)} className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg font-bold text-[10px] uppercase tracking-widest">
                                    Fechar
                                </button>
                                <button onClick={() => window.print()} className="flex-[2] py-3 bg-emerald-500 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors">
                                    <Printer size={14} /> Imprimir Factura
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
