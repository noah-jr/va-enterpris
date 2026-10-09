import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Briefcase, Plus, Edit, Trash2, Search, BarChart3, 
    AlertCircle, Zap, Loader2, BadgeCheck 
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api';
import { usePermissions } from '../auth/useAuth';
import { Modal } from '../components/Modal';
import { SearchableSelect } from '../components/SearchableSelect';

interface Service {
    id: string;
    code: string;
    name: string;
    price: number;
    vatRate: number;
    category?: string;
    type: string;
}

const fmt = (v: number) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(v);

export default function Services() {
    const { hasPermission } = usePermissions();
    const qc = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingService, setEditingService] = useState<Service | null>(null);

    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [price, setPrice] = useState('');
    const [vatRate, setVatRate] = useState('14');

    const { data: servicesData, isLoading } = useQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const res = await api.get('/products');
            return (res.data as Service[]).filter(s => s.type === 'SERVICE');
        }
    });

    const services = servicesData || [];

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/products', { ...data, type: 'SERVICE', stock: 0 }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['services'] });
            toast.success('Serviço registado com sucesso.');
            closeModal();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, ...data }: any) => api.put(`/products/${id}`, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['services'] });
            toast.success('Serviço actualizado com sucesso.');
            closeModal();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/products/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['services'] });
            toast.success('Serviço removido do sistema.');
        }
    });

    const openModal = (s?: Service) => {
        if (s) {
            setEditingService(s);
            setName(s.name);
            setCode(s.code);
            setPrice(s.price.toString());
            setVatRate(s.vatRate.toString());
        } else {
            setEditingService(null);
            setName('');
            setCode('');
            setPrice('');
            setVatRate('14');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { code, name, price: Number(price), vatRate: Number(vatRate) || 0 };
        if (editingService) updateMutation.mutate({ id: editingService.id, ...payload });
        else createMutation.mutate(payload);
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 pb-32 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Catálogo de Serviços</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Gestão de prestações de serviço, consultoria e avenças corporativas.</p>
                </div>

                <div className="flex items-center gap-3">
                    {hasPermission('products:create') && (
                        <button
                            onClick={() => openModal()}
                            className="premium-button-primary px-4 sm:px-8"
                        >
                            <Plus size={18} /> Novo Serviço
                        </button>
                    )}
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Serviços Ativos', value: services.length.toString(), icon: <Briefcase size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Preço Médio', value: fmt(services.length ? services.reduce((a,b)=>a+b.price,0)/services.length : 0), icon: <BarChart3 size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Isenções', value: services.filter(s=>s.vatRate===0).length.toString(), icon: <AlertCircle size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                    { label: 'Performance', value: 'High', icon: <Zap size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
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

            {/* Actions Bar */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-[var(--radius-md)] flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome ou código do serviço..."
                        className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid/Table Representation */}
            {isLoading ? (
                <div className="py-40 flex flex-col items-center justify-center gap-6 opacity-30">
                    <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
                    <p className="text-xs font-black uppercase tracking-widest text-[var(--accent)]">Sincronizando Nó de Serviços...</p>
                </div>
            ) : filteredServices.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-2xl opacity-40">
                    <Briefcase size={48} className="mb-4 text-[var(--text-muted)]" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Nenhum serviço mapeado no catálogo.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredServices.map((s: any) => (
                        <div key={s.id} className="premium-card p-6 group">
                            <div className="flex items-start justify-between mb-8">
                                <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--accent)] rounded-xl shadow-inner group-hover:scale-110 transition-transform">
                                    <Briefcase size={20} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                                    {hasPermission('products:edit') && (
                                        <button onClick={() => openModal(s)} className="p-2 bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 border border-[var(--border-color)] rounded-lg shadow-sm transition-all"><Edit size={16}/></button>
                                    )}
                                    {hasPermission('products:delete') && (
                                        <button onClick={() => confirm('Remover serviço permanentemente?') && deleteMutation.mutate(s.id)} className="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-lg shadow-sm transition-all hover:bg-rose-600 hover:text-white"><Trash2 size={16}/></button>
                                    )}
                                </div>
                            </div>
                            <div className="text-left mb-6">
                                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight line-clamp-2 min-h-[2.5rem]">{s.name}</h3>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] opacity-50 uppercase tracking-widest mt-2">{s.code}</p>
                            </div>
                            <div className="bg-[var(--bg-primary)]/40 border border-[var(--border-color)]/20 p-4 rounded-xl shadow-inner flex flex-col items-center">
                                <p className="text-xl font-black text-[var(--text-primary)] tabular-nums tracking-tighter">{fmt(s.price)}</p>
                                <span className={`mt-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${s.vatRate > 0 ? 'bg-indigo-50 text-indigo-600 border-indigo-500/20' : 'bg-amber-50 text-amber-600 border-amber-500/20'}`}>
                                    {s.vatRate}% IVA
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal: Gestão de Serviços */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingService ? 'Configurar Serviço' : 'Criar Novo Serviço'}
                subtitle="Catálogo de Prestações Operacionais"
                type="CENTER"
                width="xl"
                icon={<Briefcase size={24} className="text-[var(--accent)]" />}
            >
                <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 flex flex-col text-left">
                            <label className="premium-label">Código Único</label>
                            <input required placeholder="EX: SRV-001" className="premium-input uppercase tracking-widest font-black" value={code} onChange={e=>setCode(e.target.value)} />
                        </div>
                        <div className="space-y-1.5 flex flex-col text-left">
                            <label className="premium-label">Categoria (Opcional)</label>
                            <input placeholder="Consultoria, Venda, etc..." className="premium-input" />
                        </div>
                    </div>
                    <div className="space-y-1.5 flex flex-col text-left">
                        <label className="premium-label">Nome / Descrição Detalhada</label>
                        <input required placeholder="Ex: Auditoria de Sistemas de Informação..." className="premium-input" value={name} onChange={e=>setName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1.5 flex flex-col text-left">
                            <label className="premium-label">Taxa Base (AOA)</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[var(--text-muted)] opacity-30 text-xs italic tracking-tighter">AOA</div>
                                <input type="number" required placeholder="0" className="premium-input !pl-16 font-black tabular-nums" value={price} onChange={e=>setPrice(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1.5 flex flex-col text-left">
                            <label className="premium-label">Regime de IVA</label>
                            <SearchableSelect 
                                options={[
                                    { label: 'GERAL (14%)', value: '14' },
                                    { label: 'SIMPLIFICADO (7%)', value: '7' },
                                    { label: 'ISENTO (0%)', value: '0' }
                                ]}
                                value={vatRate}
                                onChange={val => setVatRate(val)}
                            />
                        </div>
                    </div>
                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={closeModal} className="premium-button-secondary flex-1">Descartar</button>
                        <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="premium-button-primary flex-[2]">
                            {(createMutation.isPending || updateMutation.isPending) ? <Loader2 size={18} className="animate-spin" /> : <BadgeCheck size={18} />}
                            {editingService ? 'Actualizar Serviço' : 'Pautar Serviço'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
