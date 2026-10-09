import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage:  number;
    totalPages:   number;
    totalItems:   number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem   = Math.min(currentPage * itemsPerPage, totalItems);

    const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        let p = i + 1;
        if (totalPages > 5 && currentPage > 3) {
            p = currentPage - 3 + i + 1;
            if (p > totalPages) p = totalPages - (4 - i);
        }
        return p;
    });

    return (
        <div className="premium-pagination">
            <span className="pagination-info">
                {startItem}–{endItem} de {totalItems}
            </span>

            <div className="pagination-controls">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                >
                    <ChevronLeft size={14} />
                </button>

                {pages.map(p => (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`w-7 h-7 rounded-[var(--radius-sm)] text-xs font-500 transition-colors ${
                            currentPage === p
                                ? 'bg-[var(--accent)] text-white'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'
                        }`}
                    >
                        {p}
                    </button>
                ))}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                >
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}
