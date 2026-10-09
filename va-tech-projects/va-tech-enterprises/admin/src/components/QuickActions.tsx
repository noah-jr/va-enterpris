"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Plus,
    FileText,
    Mail,
    Users
} from "lucide-react";
import Link from "next/link";

export default function QuickActions() {
    const actions = [
        {
            label: "Novo Serviço",
            icon: Plus,
            href: "/services/new",
            color: "text-primary dark:text-white",
            bgIcon: "bg-primary/10 dark:bg-primary/20"
        },
        {
            label: "Novo Artigo",
            icon: FileText,
            href: "/posts/new",
            color: "text-primary dark:text-white",
            bgIcon: "bg-primary/10 dark:bg-primary/20"
        },
        {
            label: "Contactos",
            icon: Mail,
            href: "/contacts",
            color: "text-yellow-500 dark:text-white",
            bgIcon: "bg-yellow-50 dark:bg-yellow-500/20"
        },
        {
            label: "Subscritores",
            icon: Users,
            href: "/newsletter",
            color: "text-green-500 dark:text-white",
            bgIcon: "bg-green-50 dark:bg-green-500/20"
        }
    ];

    return (
        <Card className="!border-none !bg-white dark:!bg-card shadow-sm rounded-[20px] dark:shadow-none h-full border dark:border-border">
            <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground dark:text-white">
                    Ações Rápidas
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    {actions.map((action, index) => (
                        <Link key={index} href={action.href}>
                            <button className="flex w-full flex-col items-center justify-center rounded-2xl bg-gray-50 py-4 dark:bg-muted transition-all hover:bg-gray-100 dark:hover:bg-muted/80">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${action.bgIcon} mb-2`}>
                                    <action.icon className={`h-6 w-6 ${action.color}`} />
                                </div>
                                <span className="text-sm font-bold text-foreground dark:text-white">
                                    {action.label}
                                </span>
                            </button>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

