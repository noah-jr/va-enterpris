"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function AdminPagination({ totalPages }: { totalPages: number }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { replace } = useRouter();

    const currentPage = Number(searchParams?.get("page")) || 1;

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams?.toString());
        params.set("page", pageNumber.toString());
        replace(`${pathname}?${params.toString()}`);
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => createPageURL(currentPage - 1)}
                disabled={currentPage <= 1}
                className="h-8 w-8 p-0 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-card"
            >
                <span className="sr-only">Anterior</span>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) ? (
                        <Button
                            key={page}
                            variant={currentPage === page ? "default" : "ghost"}
                            size="sm"
                            onClick={() => createPageURL(page)}
                            className={`h-8 w-8 p-0 rounded-lg ${currentPage === page ? 'bg-foreground text-background hover:opacity-90' : 'hover:bg-gray-100 dark:hover:bg-white/10'}`}
                        >
                            {page}
                        </Button>
                    ) : (
                        (page === currentPage - 2 || page === currentPage + 2) && <span key={page} className="text-gray-400">...</span>
                    )
                ))}
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => createPageURL(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="h-8 w-8 p-0 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-card"
            >
                <span className="sr-only">Próxima</span>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
