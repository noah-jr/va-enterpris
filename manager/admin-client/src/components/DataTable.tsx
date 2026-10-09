import type { ReactNode } from 'react';
import { Pagination } from './Pagination';
import { Loader2, Search, FilterX } from 'lucide-react';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => ReactNode);
    className?: string;
    hideOnMobile?: boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    currentPage?: number;
    totalPages?: number;
    totalItems?: number;
    itemsPerPage?: number;
    onPageChange?: (page: number) => void;
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    showSearch?: boolean;
}

export function DataTable<T extends { id: string | number }>({
    data,
    columns,
    isLoading,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onRowClick,
    emptyMessage = "Nenhum registo encontrado.",
    searchPlaceholder = "Pesquisar...",
    searchValue,
    onSearchChange,
    showSearch = true
}: DataTableProps<T>) {
    return (
        <div className="space-y-3 animate-fade-in">

            {/* Pesquisa */}
            {showSearch && onSearchChange !== undefined && (
                <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[var(--radius-md)] px-3 py-2 focus-within:border-[var(--accent)] transition-all">
                    <Search size={14} className="text-[var(--text-muted)] shrink-0" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={e => onSearchChange(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] w-full"
                    />
                </div>
            )}

            {/* Tabela */}
            <div className="premium-table-container">
                <table className="premium-table">
                    <thead>
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`${col.className || ''} ${col.hideOnMobile ? 'hidden sm:table-cell' : ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                                        <Loader2 size={20} className="animate-spin" />
                                        <span className="text-xs">A carregar...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                                        <FilterX size={20} />
                                        <span className="text-sm">{emptyMessage}</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map(item => (
                                <tr
                                    key={item.id}
                                    onClick={() => onRowClick?.(item)}
                                    className={onRowClick ? 'cursor-pointer' : ''}
                                >
                                    {columns.map((col, idx) => (
                                        <td
                                            key={idx}
                                            className={`${col.className || ''} ${col.hideOnMobile ? 'hidden sm:table-cell' : ''}`}
                                        >
                                            {typeof col.accessor === 'function'
                                                ? col.accessor(item)
                                                : (item[col.accessor] as ReactNode)
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {!isLoading && data.length > 0 && currentPage !== undefined && totalPages !== undefined && totalItems !== undefined && itemsPerPage !== undefined && onPageChange !== undefined && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={onPageChange}
                    />
                )}
            </div>
        </div>
    );
}
