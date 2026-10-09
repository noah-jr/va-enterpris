"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRef } from "react";

export default function AdminSearch({ placeholder }: { placeholder: string }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSearch = (term: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams?.toString());
            params.set("page", "1");
            if (term) {
                params.set("q", term);
            } else {
                params.delete("q");
            }
            replace(`${pathname}?${params.toString()}`);
        }, 300);
    };

    return (
        <div className="relative flex flex-1 flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
                className="pl-10 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-background text-sm focus-visible:ring-foreground"
                placeholder={placeholder}
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams?.get("q")?.toString() || ""}
            />
        </div>
    );
}
