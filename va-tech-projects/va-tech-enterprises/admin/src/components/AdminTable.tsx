"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye } from "lucide-react";
import Link from "next/link";

export interface AdminTableColumn<T> {
    key: string;
    label: string;
    render?: (item: T) => ReactNode;
    className?: string;
}

export interface AdminTableAction<T> {
    type: "edit" | "delete" | "view" | "custom";
    label?: string;
    icon?: ReactNode;
    href?: (item: T) => string;
    onClick?: (item: T) => void;
    className?: string;
    variant?: "default" | "danger";
}

interface AdminTableProps<T> {
    data: T[];
    columns: AdminTableColumn<T>[];
    actions?: AdminTableAction<T>[];
    loading?: boolean;
    emptyMessage?: string;
    onDelete?: (item: T) => void;
}

export function AdminTable<T extends { id: string }>({
    data,
    columns,
    actions = [],
    loading = false,
    emptyMessage = "Nenhum item encontrado.",
    onDelete,
}: AdminTableProps<T>) {
    const handleDelete = (item: T) => {
        if (onDelete && confirm("Tem certeza que deseja excluir este item?")) {
            onDelete(item);
        }
    };

    const renderAction = (action: AdminTableAction<T>, item: T, index: number) => {
        const defaultIcons = {
            edit: <Pencil className="h-4 w-4" />,
            delete: <Trash2 className="h-4 w-4" />,
            view: <Eye className="h-4 w-4" />,
        };

        const icon = action.icon || (action.type !== "custom" ? defaultIcons[action.type] : null);
        const className = action.className || (action.variant === "danger" ? "admin-btn-icon-danger" : "admin-btn-icon");

        const key = `${action.type}-${index}`;

        if (action.type === "delete") {
            return (
                <Button
                    key={key}
                    size="icon"
                    variant="ghost"
                    className={className}
                    onClick={() => handleDelete(item)}
                >
                    {icon}
                </Button>
            );
        }

        if (action.href) {
            return (
                <Link key={key} href={action.href(item)}>
                    <Button size="icon" variant="ghost" className={className}>
                        {icon}
                    </Button>
                </Link>
            );
        }

        if (action.onClick) {
            return (
                <Button
                    key={key}
                    size="icon"
                    variant="ghost"
                    className={className}
                    onClick={() => action.onClick!(item)}
                >
                    {icon}
                </Button>
            );
        }

        return null;
    };

    if (loading) {
        return (
            <div className="admin-card">
                <div className="admin-loading">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-card">
            <div className="admin-card-content">
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead className="admin-table-header">
                            <tr>
                                {columns.map((column, index) => (
                                    <th
                                        key={column.key}
                                        className={`admin-table-header-cell ${column.className || ""} ${index === 0 ? "rounded-l-lg" : ""
                                            } ${index === columns.length - 1 && actions.length === 0 ? "rounded-r-lg" : ""}`}
                                    >
                                        {column.label}
                                    </th>
                                ))}
                                {actions.length > 0 && (
                                    <th className="admin-table-header-cell text-right rounded-r-lg">Ações</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item) => (
                                <tr key={item.id} className="admin-table-row">
                                    {columns.map((column) => (
                                        <td key={column.key} className={`admin-table-cell ${column.className || ""}`}>
                                            {column.render
                                                ? column.render(item)
                                                : (item as any)[column.key]?.toString() || "-"}
                                        </td>
                                    ))}
                                    {actions.length > 0 && (
                                        <td className="admin-table-cell text-right">
                                            <div className="admin-action-menu">
                                                {actions.map((action, index) => renderAction(action, item, index))}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="admin-empty-state">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
