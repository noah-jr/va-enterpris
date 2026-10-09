import { useState, useRef } from 'react';
import {
    FileText, Scale, FileSignature, ShieldCheck, AlertCircle,
    Plus, Clock, CheckCircle, Lock, FileArchive,
    Download, Eye, Trash2, LayoutGrid, List, Activity,
    ShieldAlert, User, Loader2, Pencil,
    Layers, FolderOpen, UploadCloud, Warehouse, Compass
} from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { SearchableSelect } from '../components/SearchableSelect';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { format } from 'date-fns';

const fmtDate = (d: string) => format(new Date(d), 'dd MMM, yyyy');

type DocStatus = 'VALID' | 'SIGNED' | 'DRAFT' | 'EXPIRED' | 'CRITICAL';
type DocType = 'LEGAL' | 'CONTRACT' | 'REGULATORY' | 'INTERNAL' | 'INSURANCE' | 'FINANCIAL';
type DocCategory = 'LEGAL' | 'FISCAL' | 'HR' | 'FINANCE' | 'OTHERS';
type AccessLevel = 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';

interface Document {
    id: string;
    name: string;
    type: DocType;
    size: string;
    date: string;
    status: DocStatus;
    owner: string;
    version: string;
    department: string;
    category: DocCategory;
    accessLevel: AccessLevel;
    filePath?: string;
}


const STATUS_STYLE: Record<DocStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    VALID:    { label: 'Válido',     color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/20',  icon: <CheckCircle size={11} /> },
    SIGNED:   { label: 'Assinado',   color: 'text-sky-600 dark:text-sky-400',         bg: 'bg-sky-50 dark:bg-sky-500/10 border-sky-500/20',              icon: <FileSignature size={11} /> },
    DRAFT:    { label: 'Rascunho',   color: 'text-slate-500',                          bg: 'bg-slate-100 dark:bg-slate-500/10 border-slate-500/20',       icon: <Clock size={11} /> },
    EXPIRED:  { label: 'Expirado',   color: 'text-red-600 dark:text-red-400',          bg: 'bg-red-50 dark:bg-red-500/10 border-red-500/20',              icon: <AlertCircle size={11} /> },
    CRITICAL: { label: 'Crítico',    color: 'text-rose-600 dark:text-rose-400',        bg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-500/20',           icon: <ShieldAlert size={11} /> },
};

const TYPE_CONFIG: Record<DocType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
    LEGAL:      { label: 'Jurídico',       icon: <Scale size={16} />,         color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-500/10' },
    CONTRACT:   { label: 'Contrato',       icon: <FileSignature size={16} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    REGULATORY: { label: 'Regulatório',   icon: <ShieldCheck size={16} />,   color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    INTERNAL:   { label: 'Interno',        icon: <FileText size={16} />,      color: 'text-slate-600 dark:text-slate-400',  bg: 'bg-slate-100 dark:bg-slate-500/10' },
    INSURANCE:  { label: 'Seguro',         icon: <Lock size={16} />,          color: 'text-rose-600 dark:text-rose-400',    bg: 'bg-rose-50 dark:bg-rose-500/10' },
    FINANCIAL:  { label: 'Financeiro',     icon: <Activity size={16} />,      color: 'text-sky-600 dark:text-sky-400',      bg: 'bg-sky-50 dark:bg-sky-500/10' },
};

const defaultForm = {
    name: '',
    type: 'INTERNAL' as DocType,
    size: '—',
    status: 'DRAFT' as DocStatus,
    owner: '',
    department: 'Direção Geral',
    version: 'v1.0',
    category: 'LEGAL' as DocCategory,
    accessLevel: 'PUBLIC' as AccessLevel
};

export default function DocumentCenter() {
    const qc = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [filterType, setFilterType] = useState<DocType | 'ALL'>('ALL');
    const [selected, setSelected] = useState<Document | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<Document | null>(null);
    const [form, setForm] = useState(defaultForm);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data: documents = [], isLoading } = useQuery({
        queryKey: ['documents'],
        queryFn: async () => (await api.get('/documents')).data as Document[]
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/documents', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['documents'] });
            setIsModalOpen(false);
            setForm(defaultForm);
            toast.success('Documento arquivado com sucesso.');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: any) => api.patch(`/documents/${id}`, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['documents'] });
            setIsModalOpen(false);
            setEditingDoc(null);
            setForm(defaultForm);
            toast.success('Documento actualizado.');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/documents/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['documents'] });
            toast.success('Documento removido do repositório.');
            setSelected(null);
        }
    });

    const handleEdit = (doc: Document) => {
        setEditingDoc(doc);
        setForm({ name: doc.name, type: doc.type, size: doc.size, status: doc.status, owner: doc.owner, department: doc.department, version: doc.version, category: doc.category, accessLevel: doc.accessLevel });
        setIsModalOpen(true);
    };

    const openCreate = () => { setEditingDoc(null); setForm(defaultForm); setSelectedFile(null); setIsModalOpen(true); };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setForm(p => ({ 
                ...p, 
                name: p.name || file.name.split('.')[0],
                size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedFile && !editingDoc) {
            toast.error('Por favor, seleccione um ficheiro para anexar.');
            return;
        }

        const formData = new FormData();
        
        // Append all form fields
        Object.entries(form).forEach(([key, value]) => {
            formData.append(key, value);
        });
        
        // Append file if selected
        if (selectedFile) {
            formData.append('file', selectedFile);
        }

        if (editingDoc) {
            updateMutation.mutate({ id: editingDoc.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };


    const filteredDocs = documents.filter(d =>
        (filterType === 'ALL' || d.type === filterType) &&
        (d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (d.owner || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const stats = [
        { label: 'Total Custódia', value: documents.length, icon: <Layers size={18} />, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
        { label: 'Contratos Activos', value: documents.filter(d => d.type === 'CONTRACT').length, icon: <FileSignature size={18} />, color: 'text-sky-600', bg: 'bg-sky-50/50' },
        { label: 'Arquivo Fiscal', value: documents.filter(d => d.category === 'FISCAL').length, icon: <Scale size={18} />, color: 'text-amber-600', bg: 'bg-amber-50/50' },
        { label: 'Alertas Críticos', value: documents.filter(d => d.status === 'CRITICAL' || d.status === 'EXPIRED').length, icon: <ShieldAlert size={18} />, color: 'text-rose-600', bg: 'bg-rose-50/50' },
    ];

    const columns = [
        {
            header: 'Soberania / Nome',
            accessor: (d: Document) => (
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg ${TYPE_CONFIG[d.type].bg} ${TYPE_CONFIG[d.type].color} flex items-center justify-center shadow-sm border border-[var(--border-color)]`}>
                        {TYPE_CONFIG[d.type].icon}
                    </div>
                    <div>
                        <p className="text-sm font-black text-[var(--text-primary)] uppercase leading-tight">{d.name}</p>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1 uppercase opacity-50">{d.owner || 'Responsável N/D'}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Estratificação',
            accessor: (d: Document) => (
                <span className={`text-[10px] font-black uppercase tracking-widest ${TYPE_CONFIG[d.type].color}`}>{TYPE_CONFIG[d.type].label}</span>
            )
        },
        {
            header: 'Ciclo Temporal',
            accessor: (d: Document) => <span className="text-xs font-bold tabular-nums text-[var(--text-secondary)] opacity-70 uppercase tracking-tighter">{fmtDate(d.date)}</span>
        },
        {
            header: 'Estado de Custódia',
            accessor: (d: Document) => (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${STATUS_STYLE[d.status].bg} ${STATUS_STYLE[d.status].color}`}>
                    {STATUS_STYLE[d.status].icon} {STATUS_STYLE[d.status].label}
                </span>
            )
        },
        {
            header: '',
            accessor: (d: Document) => (
                <div className="flex items-center justify-end gap-2 pr-4">
                    {d.filePath && (
                        <a 
                            href={d.filePath.startsWith('http') ? d.filePath : `${api.defaults.baseURL?.replace('/api', '')}${d.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-sky-500 border border-[var(--border-color)] transition-all"
                            title="Abrir Documento"
                        >
                            <Download size={15} />
                        </a>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setSelected(d); }} className="p-2 rounded-lg bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--accent)] border border-[var(--border-color)] transition-all flex items-center gap-2 group/btn">
                        <Eye size={15} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(d); }} className="p-2 rounded-lg bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-emerald-500 border border-[var(--border-color)] transition-all">
                        <Pencil size={15} />
                    </button>
                </div>
            )
        }
    ];

    const [page, setPage] = useState(1);
    const itemsPerPage = 8;
    const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
    const paginatedDocs = filteredDocs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Repositório Institucional</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Gestão avançada de custódia, arquivo e conformidade documental.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={openCreate} className="premium-button-primary shadow-xl shadow-[var(--accent)]/20 px-4 sm:px-8">
                        <Plus size={18} /> Efectivar Custódia
                    </button>
                </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((s, i) => (
                    <div key={i} className="premium-card p-4 flex items-start gap-3">
                        <div className={`kpi-icon shrink-0 ${s.color} ${s.bg}`}>
                            {s.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-[var(--text-muted)] mb-0.5 truncate">{s.label}</p>
                            <p className="text-base font-bold text-[var(--text-primary)] tabular-nums leading-tight">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-[var(--radius-md)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex bg-[var(--bg-primary)] p-1 rounded-[var(--radius-md)] border border-[var(--border-color)] shadow-sm overflow-x-auto no-scrollbar">
                    {(['ALL', ...Object.keys(TYPE_CONFIG)] as (DocType | 'ALL')[]).map(f => (
                        <button
                            key={f}
                            onClick={() => { setFilterType(f); setPage(1); }}
                            className={`px-5 py-2 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filterType === f ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                        >
                            {f === 'ALL' ? 'Perspectiva Global' : TYPE_CONFIG[f].label}
                        </button>
                    ))}
                </div>
                <div className="flex bg-[var(--bg-primary)] p-1 rounded-[var(--radius-md)] border border-[var(--border-color)] shadow-sm">
                    <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}><List size={16} /></button>
                    <button onClick={() => setViewMode('grid')} className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}><LayoutGrid size={16} /></button>
                </div>
            </div>

            {/* Main Content */}
            <div className="premium-card p-1 overflow-visible shadow-2xl">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Sincronizando Ledger...</span>
                    </div>
                ) : filteredDocs.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center px-5 sm:px-10">
                        <FolderOpen size={48} className="mb-4 text-[var(--text-muted)] opacity-20" />
                        <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Nenhum documento sob custódia</p>
                    </div>
                ) : viewMode === 'list' ? (
                    <DataTable 
                        data={paginatedDocs}
                        columns={columns}
                        isLoading={isLoading}
                        currentPage={page}
                        totalItems={filteredDocs.length}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setPage}
                        onSearchChange={setSearchTerm}
                        searchValue={searchTerm}
                        onRowClick={(d) => setSelected(d)}
                        searchPlaceholder="Inquérito Documental: Nome, Responsável ou Categoria..."
                    />
                ) : (
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDocs.map((d) => (
                            <div key={d.id} onClick={() => setSelected(d)} className="premium-card p-4 sm:p-8 cursor-pointer group hover:border-[var(--accent)] transition-all bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)]">
                                <div className="flex items-start justify-between mb-10">
                                    <div className={`w-14 h-14 rounded-2xl ${TYPE_CONFIG[d.type].bg} ${TYPE_CONFIG[d.type].color} flex items-center justify-center shadow-lg border border-[var(--border-color)] group-hover:scale-110 transition-transform font-black`}>{TYPE_CONFIG[d.type].icon}</div>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[8px] font-black uppercase tracking-[0.2em] ${STATUS_STYLE[d.status].bg} ${STATUS_STYLE[d.status].color}`}>{STATUS_STYLE[d.status].label}</span>
                                </div>
                                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight leading-tight mb-3 line-clamp-2">{d.name}</h3>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em] opacity-40">{d.department}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Painel Lateral de Detalhes */}
            <Modal
                isOpen={!!selected}
                onClose={() => setSelected(null)}
                title={selected ? selected.name : ''}
                subtitle="Inspecção de Custódia"
                type="SIDE"
                width="lg"
                icon={<FileText size={24} className="text-[var(--accent)]" />}
            >
                {selected && (
                    <div className="p-4 sm:p-8 space-y-8 flex-1 overflow-y-auto no-scrollbar bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)]">
                        {/* Premium Document Preview */}
                        <div className="relative group/preview">
                            <div className="aspect-[3/4] w-full bg-white dark:bg-black/40 rounded-3xl border-2 border-[var(--border-color)] flex flex-col items-center justify-center transition-all hover:border-[var(--accent)] overflow-hidden shadow-2xl relative">
                                {selected.filePath ? (
                                    selected.filePath.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                                        <img 
                                            src={selected.filePath.startsWith('http') ? selected.filePath : `${api.defaults.baseURL?.replace('/api', '')}${selected.filePath}`} 
                                            className="w-full h-full object-cover" 
                                            alt="Document Preview"
                                        />
                                    ) : selected.filePath.match(/\.pdf$/i) ? (
                                        <iframe 
                                            src={selected.filePath.startsWith('http') ? selected.filePath : `${api.defaults.baseURL?.replace('/api', '')}${selected.filePath}`} 
                                            className="w-full h-full border-none" 
                                            title="Document Preview" 
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-6 sm:p-12 text-center">
                                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity" />
                                            <div className={`w-24 h-24 rounded-full mb-8 flex items-center justify-center ${TYPE_CONFIG[selected.type].bg} ${TYPE_CONFIG[selected.type].color} shadow-inner`}>
                                                {TYPE_CONFIG[selected.type].icon}
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--accent)] opacity-60">Visualização não disponível</p>
                                            <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight max-w-xs mt-4">{selected.name}</h4>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-6 sm:p-12 text-center">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity" />
                                        <div className={`w-32 h-32 rounded-full mb-8 flex items-center justify-center ${TYPE_CONFIG[selected.type].bg} ${TYPE_CONFIG[selected.type].color} shadow-inner`}>
                                            {TYPE_CONFIG[selected.type].icon}
                                        </div>
                                        <div className="text-center space-y-4 relative z-10">
                                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--accent)] opacity-60">Sem Arquivo Físico</p>
                                            <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight max-w-xs">{selected.name}</h4>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={`p-6 rounded-2xl border border-[var(--border-color)]/20 ${TYPE_CONFIG[selected.type].bg} flex items-center gap-5 shadow-sm`}>
                            <div className={`w-14 h-14 rounded-xl bg-white dark:bg-black/20 flex items-center justify-center ${TYPE_CONFIG[selected.type].color} shadow-md border border-[var(--border-color)]`}>
                                {TYPE_CONFIG[selected.type].icon}
                            </div>
                            <div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${TYPE_CONFIG[selected.type].color}`}>{TYPE_CONFIG[selected.type].label}</span>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${STATUS_STYLE[selected.status].bg} ${STATUS_STYLE[selected.status].color}`}>
                                        {STATUS_STYLE[selected.status].label}
                                    </span>
                                    <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50 tabular-nums uppercase">{selected.version} · {selected.size}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { label: 'Responsável',  value: selected.owner || 'N/D',      icon: <User size={12} /> },
                                { label: 'Departamento', value: selected.department,             icon: <Warehouse size={12} /> },
                                { label: 'Referência',   value: `#DOC-${selected.id.slice(-6).toUpperCase()}`, icon: <Compass size={12} /> },
                                { label: 'Data Arquivo', value: fmtDate(selected.date),          icon: <Clock size={12} /> },
                            ].map((item, i) => (
                                <div key={i} className="premium-card p-5 flex flex-col gap-4 border-dashed bg-transparent hover:bg-[var(--bg-secondary)]/30 transition-all">
                                    <div className="p-2.5 w-fit rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--accent)] shadow-inner">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">{item.label}</p>
                                        <p className="text-xs font-black text-[var(--text-primary)] uppercase truncate">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-[var(--border-color)]/20 flex flex-col gap-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {selected.filePath ? (
                                    <>
                                        <a 
                                            href={selected.filePath.startsWith('http') ? selected.filePath : `${api.defaults.baseURL?.replace('/api', '')}${selected.filePath}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="premium-button-secondary flex items-center justify-center gap-2"
                                        >
                                            <Download size={15} /> Download
                                        </a>
                                        <button onClick={() => handleEdit(selected)} className="premium-button-primary">
                                            <Pencil size={15} /> Editar
                                        </button>
                                    </>
                                ) : (
                                    <button disabled className="premium-button-secondary opacity-50 cursor-not-allowed col-span-2">
                                        <ShieldAlert size={15} /> Sem Arquivo Físico
                                    </button>
                                )}
                            </div>
                            <button onClick={() => { if (confirm('Remover este documento?')) deleteMutation.mutate(selected.id); }} className="w-full py-3 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2">
                                <Trash2 size={14} /> Remover do Repositório
                            </button>
                        </div>

                    </div>
                )}
            </Modal>

            {/* Modal de Upload/Novo Documento */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingDoc ? "Actualizar Documento" : "Novo Documento"}
                subtitle="Arquivo & Compliance"
                type="CENTER"
                width="xl"
                icon={<UploadCloud size={24} className="text-[var(--accent)]" />}
            >
                <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    
                    <div>
                        <label className="premium-label">Nome do Documento / Título</label>
                        <input required placeholder="Ex: Contrato de Arrendamento 2026..." className="premium-input font-black uppercase text-xs !py-5 shadow-sm" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                        <div className="space-y-2">
                            <label className="premium-label uppercase tracking-widest text-[10px]">Tipo de Documento</label>
                            <SearchableSelect 
                                options={Object.entries(TYPE_CONFIG).map(([k, v]) => ({ label: v.label.toUpperCase(), value: k }))}
                                value={form.type}
                                onChange={val => setForm(p => ({ ...p, type: val as DocType }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="premium-label uppercase tracking-widest text-[10px]">Estado de Custódia</label>
                            <SearchableSelect 
                                options={Object.entries(STATUS_STYLE).map(([k, v]) => ({ label: v.label.toUpperCase(), value: k }))}
                                value={form.status}
                                onChange={val => setForm(p => ({ ...p, status: val as DocStatus }))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                        <div className="space-y-2">
                            <label className="premium-label uppercase tracking-widest text-[10px]">Categoria Operacional</label>
                            <SearchableSelect 
                                options={[
                                    { label: 'LEGAL / CONTRATOS', value: 'LEGAL' },
                                    { label: 'FISCAL / AGT', value: 'FISCAL' },
                                    { label: 'RECURSOS HUMANOS', value: 'HR' },
                                    { label: 'FINANCEIRO / BANCÁRIO', value: 'FINANCE' },
                                    { label: 'OUTROS', value: 'OTHERS' }
                                ]}
                                value={form.category}
                                onChange={val => setForm(p => ({ ...p, category: val as DocCategory }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="premium-label uppercase tracking-widest text-[10px]">Nível de Acesso Sovereignty</label>
                            <SearchableSelect 
                                options={[
                                    { label: 'PÚBLICO (FULL ORGANIZATION)', value: 'PUBLIC' },
                                    { label: 'PRIVADO / CONFIDENCIAL', value: 'PRIVATE' },
                                    { label: 'RESTRITO (GLOBAL HQ)', value: 'RESTRICTED' }
                                ]}
                                value={form.accessLevel}
                                onChange={val => setForm(p => ({ ...p, accessLevel: val as AccessLevel }))}
                            />
                        </div>
                    </div>

                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-14 border-2 border-dashed border-[var(--border-color)] rounded-3xl bg-[var(--bg-primary)]/30 flex flex-col items-center justify-center gap-6 group hover:border-[var(--accent)] transition-all cursor-pointer relative overflow-hidden"
                    >
                        {selectedFile ? (
                            <>
                                <div className="absolute top-0 right-0 p-4 opacity-10 animate-pulse"><FileArchive size={80} /></div>
                                <div className="w-16 h-16 bg-[var(--accent)]/10 text-[var(--accent)] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <CheckCircle size={32} />
                                </div>
                                <div className="text-center z-10">
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)] mb-1">Ficheiro Preparado: {selectedFile.name}</p>
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] opacity-50 uppercase">{ (selectedFile.size / 1024 / 1024).toFixed(2) } MB · Clique para alterar</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-2xl shadow-sm border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
                                    <UploadCloud size={32} />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)] mb-1">Iniciar Custódia Documental</p>
                                    <p className="text-[9px] font-bold text-[var(--text-muted)] mt-2 opacity-50 uppercase tracking-[0.2em]">PDF, DOCX ou Imagem (Máx 10MB)</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="pt-8 flex gap-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="premium-button-secondary flex-1 py-5">Abortar Operação</button>
                        <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="premium-button-primary flex-[2] py-5 shadow-xl shadow-[var(--accent)]/30 text-[11px]">
                            {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                            {editingDoc ? "Autenticar Actualização" : "Efectivar Custódia no Repositório"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
