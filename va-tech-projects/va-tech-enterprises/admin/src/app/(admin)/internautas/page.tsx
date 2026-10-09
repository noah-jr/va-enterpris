'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Users,
    Plus,
    Search,
    Filter,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Calendar,
    Eye,
    Edit,
    Trash2,
    Download,
    UserCheck,
    UserX,
    PieChart,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Internauta {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    city?: string;
    country?: string;
    occupation?: string;
    company?: string;
    status: string;
    newsletter: boolean;
    createdAt: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function InternautasPage() {
    const router = useRouter();
    const [internautas, setInternautas] = useState<Internauta[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });

    useEffect(() => {
        fetchInternautas();
    }, [pagination.page, statusFilter]);

    const fetchInternautas = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });

            if (statusFilter) params.append('status', statusFilter);
            if (searchTerm) params.append('search', searchTerm);

            const response = await fetch(`/api/internautas?${params}`);
            const data = await response.json();

            setInternautas(data.internautas);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Erro ao carregar internautas:', error);
            toast.error('Erro ao carregar internautas');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPagination({ ...pagination, page: 1 });
        fetchInternautas();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja deletar este internauta?')) return;

        try {
            const response = await fetch(`/api/internautas/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Internauta deletado com sucesso');
                fetchInternautas();
            } else {
                toast.error('Erro ao deletar internauta');
            }
        } catch (error) {
            console.error('Erro ao deletar:', error);
            toast.error('Erro ao deletar internauta');
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/internautas/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                toast.success('Status atualizado com sucesso');
                fetchInternautas();
            } else {
                toast.error('Erro ao atualizar status');
            }
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            toast.error('Erro ao atualizar status');
        }
    };

    const exportToCSV = () => {
        const headers = ['Nome', 'Email', 'Telefone', 'Cidade', 'Empresa', 'Status', 'Data de Registo'];
        const rows = internautas.map(i => [
            `${i.firstName} ${i.lastName}`,
            i.email,
            i.phone || '',
            i.city || '',
            i.company || '',
            i.status,
            new Date(i.createdAt).toLocaleDateString('pt-PT'),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `internautas_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title flex items-center gap-3">
                        <Users className="w-8 h-8 text-foreground" />
                        Internautas
                    </h1>
                    <p className="admin-page-subtitle">
                        Gestão centralizada de leads e potenciais clientes.
                    </p>
                </div>
                <div className="flex gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
                    <button
                        onClick={exportToCSV}
                        className="admin-btn-secondary flex items-center gap-2 h-11"
                    >
                        <Download className="w-4 h-4" />
                        Exportar
                    </button>
                    <Link
                        href="/internautas/new"
                        className="admin-btn-primary flex items-center gap-2 h-11"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Internauta
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="admin-card p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center">
                        <Users className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Total de Registos</p>
                        <h4 className="text-2xl font-bold tracking-tight">{pagination.total}</h4>
                    </div>
                </div>
                <div className="admin-card p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Internautas Ativos</p>
                        <h4 className="text-2xl font-bold tracking-tight text-green-600">
                            {internautas.filter(i => i.status === 'ACTIVE').length}
                        </h4>
                    </div>
                </div>
                <div className="admin-card p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                        <Mail className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Inscritos Newsletter</p>
                        <h4 className="text-2xl font-bold tracking-tight text-blue-600">
                            {internautas.filter(i => i.newsletter).length}
                        </h4>
                    </div>
                </div>
                <div className="admin-card p-6 flex items-center gap-4 border-l-4 border-foreground">
                    <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center">
                        <PieChart className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Conversão Mensal</p>
                        <h4 className="text-2xl font-bold tracking-tight text-foreground">+12%</h4>
                    </div>
                </div>
            </div>

            {/* Search and Filters Card */}
            <div className="admin-card p-1">
                <div className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="admin-search-bar flex-1">
                        <Search className="admin-search-icon" />
                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="Pesquisar por nome, email, cidade..."
                                className="admin-search-input h-11"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </form>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="admin-form-select w-40 h-11"
                        >
                            <option value="">Todos Status</option>
                            <option value="ACTIVE">Ativo</option>
                            <option value="INACTIVE">Inativo</option>
                            <option value="PENDING">Pendente</option>
                        </select>
                        <button
                            onClick={fetchInternautas}
                            className="admin-btn-primary px-6 h-11 flex items-center gap-2"
                        >
                            <Filter className="w-4 h-4" />
                            Filtrar
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="admin-card overflow-hidden">
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead className="admin-table-header">
                            <tr>
                                <th className="admin-table-header-cell">Internauta</th>
                                <th className="admin-table-header-cell">Contacto</th>
                                <th className="admin-table-header-cell">Localização</th>
                                <th className="admin-table-header-cell">Status</th>
                                <th className="admin-table-header-cell">Registo</th>
                                <th className="admin-table-header-cell text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="admin-loading">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                                            <p className="text-sm text-muted-foreground">A carregar registos...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : internautas.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="admin-empty-state">
                                        <div className="py-12">
                                            <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                            <p className="text-lg font-medium">Nenhum internauta encontrado</p>
                                            <p className="text-sm text-muted-foreground mt-1">Experimente ajustar os filtros de pesquisa.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                internautas.map((internauta) => (
                                    <tr key={internauta.id} className="admin-table-row group">
                                        <td className="admin-table-cell">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center font-bold text-xs">
                                                    {internauta.firstName[0]}{internauta.lastName[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-foreground group-hover:text-accent transition-colors">
                                                        {internauta.firstName} {internauta.lastName}
                                                    </div>
                                                    {internauta.newsletter && (
                                                        <span className="text-[10px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter">
                                                            Newsletter
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="admin-table-cell">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                                    {internauta.email}
                                                </div>
                                                {internauta.phone && (
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Phone className="w-3.5 h-3.5" />
                                                        {internauta.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="admin-table-cell">
                                            <div className="flex items-center gap-1.5 text-xs font-medium">
                                                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                                {internauta.city || 'N/A'}, {internauta.country || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="admin-table-cell">
                                            <select
                                                value={internauta.status}
                                                onChange={(e) => handleStatusChange(internauta.id, e.target.value)}
                                                className={cn(
                                                    "text-[10px] font-bold uppercase py-1 px-3 rounded-full border-none cursor-pointer focus:ring-0",
                                                    internauta.status === 'ACTIVE' ? "bg-green-500/10 text-green-600" :
                                                        internauta.status === 'INACTIVE' ? "bg-red-500/10 text-red-600" :
                                                            "bg-amber-500/10 text-amber-600"
                                                )}
                                            >
                                                <option value="ACTIVE">Ativo</option>
                                                <option value="INACTIVE">Inativo</option>
                                                <option value="PENDING">Pendente</option>
                                            </select>
                                        </td>
                                        <td className="admin-table-cell">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(internauta.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="admin-table-cell text-right">
                                            <div className="admin-action-menu">
                                                <Link
                                                    href={`/internautas/${internauta.id}`}
                                                    className="admin-btn-icon"
                                                    title="Visualizar"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/internautas/${internauta.id}/edit`}
                                                    className="admin-btn-icon"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(internauta.id)}
                                                    className="admin-btn-icon-danger"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Unified Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="p-4 border-t border-border flex items-center justify-between bg-muted/5">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                            Página {pagination.page} de {pagination.totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                disabled={pagination.page === 1}
                                className="admin-btn-secondary h-9 px-4 disabled:opacity-30"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                disabled={pagination.page === pagination.totalPages}
                                className="admin-btn-secondary h-9 px-4 disabled:opacity-30"
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
