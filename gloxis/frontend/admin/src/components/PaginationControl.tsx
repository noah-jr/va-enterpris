import React from 'react'

interface PaginationControlProps {
  currentPage: number
  totalPages: number
  totalItems: number
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
}

export function PaginationControl({
  currentPage,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
  onPerPageChange
}: PaginationControlProps) {
  const safeTotalPages = Math.max(1, totalPages || 1)

  return (
    <div className="p-3 px-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-600 dark:text-zinc-400 gap-3 rounded-none">
      <div className="flex items-center gap-3">
        <div>
          A mostrar página <span className="font-bold text-zinc-900 dark:text-zinc-100">{currentPage}</span> de{' '}
          <span className="font-bold text-zinc-900 dark:text-zinc-100">{safeTotalPages}</span> ({totalItems} registos)
        </div>
        <select
          value={perPage}
          onChange={e => onPerPageChange(Number(e.target.value))}
          className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-none px-2.5 py-1 focus:outline-none focus:border-zinc-500 text-zinc-800 dark:text-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
        >
          <option value={5}>5 por página</option>
          <option value={10}>10 por página</option>
          <option value={25}>25 por página</option>
          <option value={50}>50 por página</option>
          <option value={100}>100 por página</option>
        </select>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1 bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 border border-zinc-300 dark:border-zinc-700 rounded-none disabled:opacity-40 disabled:cursor-not-allowed text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
        >
          Anterior
        </button>

        <div className="flex gap-1">
          {Array.from({ length: Math.min(5, safeTotalPages) }, (_, i) => {
            let pageNum = i + 1
            if (safeTotalPages > 5 && currentPage > 3) {
              pageNum = currentPage - 3 + i
              if (pageNum > safeTotalPages) pageNum = safeTotalPages - (4 - i)
            }
            if (pageNum < 1) pageNum = 1
            
            const isCurrent = currentPage === pageNum
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-7 h-7 rounded-none text-xs font-mono font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        <button
          disabled={currentPage >= safeTotalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1 bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 border border-zinc-300 dark:border-zinc-700 rounded-none disabled:opacity-40 disabled:cursor-not-allowed text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
        >
          Seguinte
        </button>
      </div>
    </div>
  )
}
