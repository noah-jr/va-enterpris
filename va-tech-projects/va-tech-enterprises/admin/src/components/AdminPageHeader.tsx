"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface AdminPageHeaderProps {
    title: string;
    subtitle?: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
        icon?: ReactNode;
    };
    children?: ReactNode;
}

export function AdminPageHeader({ title, subtitle, action, children }: AdminPageHeaderProps) {
    return (
        <div className="admin-page-header">
            <div>
                <h1 className="admin-page-title">{title}</h1>
                {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
                {children}
                {action && (
                    action.href ? (
                        <Link href={action.href}>
                            <Button className="admin-btn-primary">
                                {action.icon || <Plus className="mr-2 h-4 w-4" />}
                                {action.label}
                            </Button>
                        </Link>
                    ) : (
                        <Button className="admin-btn-primary" onClick={action.onClick}>
                            {action.icon || <Plus className="mr-2 h-4 w-4" />}
                            {action.label}
                        </Button>
                    )
                )}
            </div>
        </div>
    );
}
