"use client";

interface StatusBadgeProps {
    active: boolean;
    activeLabel?: string;
    inactiveLabel?: string;
}

export function StatusBadge({ active, activeLabel = "Ativo", inactiveLabel = "Inativo" }: StatusBadgeProps) {
    return (
        <div className="flex items-center gap-2">
            <div className={`admin-status-dot ${active ? "admin-status-active" : "admin-status-inactive"}`} />
            <span className="text-sm font-bold text-foreground dark:text-white">
                {active ? activeLabel : inactiveLabel}
            </span>
        </div>
    );
}

interface BadgeProps {
    variant: "success" | "danger" | "warning" | "info";
    children: React.ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
    const variantClasses = {
        success: "admin-badge-success",
        danger: "admin-badge-danger",
        warning: "admin-badge-warning",
        info: "admin-badge-info",
    };

    return <span className={variantClasses[variant]}>{children}</span>;
}
