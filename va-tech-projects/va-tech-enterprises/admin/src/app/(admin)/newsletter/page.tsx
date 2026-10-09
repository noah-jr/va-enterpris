"use client";

import { useState, useEffect } from "react";
import { AdminTable, AdminTableColumn } from "@/components/AdminTable";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { format } from "date-fns";

interface Subscriber {
    id: string;
    email: string;
    active: boolean;
    createdAt: string;
}

export default function NewsletterPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSubscribers();
    }, []);

    const loadSubscribers = async () => {
        try {
            const res = await fetch("/api/newsletter");
            const data = await res.json();
            if (Array.isArray(data)) setSubscribers(data);
        } catch (error) {
            toast.error("Erro ao carregar subscritores");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (subscriber: Subscriber) => {
        try {
            const res = await fetch(`/api/newsletter/${subscriber.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Subscritor removido com sucesso");
                loadSubscribers();
            } else {
                toast.error("Erro ao remover subscritor");
            }
        } catch (error) {
            toast.error("Erro ao remover subscritor");
        }
    };

    const columns: AdminTableColumn<Subscriber>[] = [
        {
            key: "email",
            label: "Email",
            render: (item) => <span className="font-bold text-foreground dark:text-white">{item.email}</span>,
        },
        {
            key: "active",
            label: "Status",
            render: (item) => <StatusBadge active={item.active} />,
        },
        {
            key: "createdAt",
            label: "Data Inscrição",
            render: (item) => (
                <span className="text-gray-500 dark:text-gray-400">
                    {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Newsletter"
                subtitle="Pessoas inscritas na newsletter"
            />

            <AdminTable
                data={subscribers}
                columns={columns}
                loading={loading}
                emptyMessage="Nenhum subscritor encontrado."
                onDelete={handleDelete}
                actions={[
                    {
                        type: "delete",
                        variant: "danger",
                    },
                ]}
            />
        </div>
    );
}
