"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Filter } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface FilterOption {
    label: string;
    value: string;
}

interface AdminFilterProps {
    label: string;
    paramName: string;
    options: FilterOption[];
}

export default function AdminFilter({ label, paramName, options }: AdminFilterProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const currentFilter = searchParams?.get(paramName);

    const handleFilter = (value: string | null) => {
        const params = new URLSearchParams(searchParams?.toString());
        params.set("page", "1");
        if (value) {
            params.set(paramName, value);
        } else {
            params.delete(paramName);
        }
        replace(`${pathname}?${params.toString()}`);
    };

    const activeLabel = options.find(opt => opt.value === currentFilter)?.label || "Todos";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 border-dashed rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-background ml-2">
                    <Filter className="mr-2 h-4 w-4" />
                    {label}
                    {currentFilter && (
                        <>
                            <div className="mx-2 h-4 w-[1px] bg-border" />
                            <span className="font-bold text-foreground">{activeLabel}</span>
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] border-none shadow-xl bg-white dark:bg-card p-2 rounded-xl">
                <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Filtrar por {label}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-muted opacity-50" />
                <DropdownMenuItem
                    onSelect={() => handleFilter(null)}
                    className="flex cursor-pointer items-center rounded-lg px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                    <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${!currentFilter ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'}`}>
                        <Check className="h-3 w-3" />
                    </div>
                    <span>Todos</span>
                </DropdownMenuItem>
                {options.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onSelect={() => handleFilter(option.value)}
                        className="flex cursor-pointer items-center rounded-lg px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    >
                        <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${currentFilter === option.value ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'}`}>
                            <Check className="h-3 w-3" />
                        </div>
                        <span>{option.label}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
