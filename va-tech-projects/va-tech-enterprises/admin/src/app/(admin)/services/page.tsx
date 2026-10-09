"use client";

import { useState, useEffect } from "react";
import { AdminTable, AdminTableColumn } from "@/components/AdminTable";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";

interface Service {
    id: string;
    title: string;
    slug: string;
    category: string;
    icon: string;
    active: boolean;
}

export default function AdminServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const res = await fetch("/api/services");
            const data = await res.json();
            if (Array.isArray(data)) setServices(data);
        } catch (error) {
            toast.error("Erro ao carregar serviços");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (service: Service) => {
        try {
            const res = await fetch(`/api/services/${service.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Serviço removido com sucesso");
                loadServices();
            } else {
                toast.error("Erro ao remover serviço");
            }
        } catch (error) {
            toast.error("Erro ao remover serviço");
        }
    };

    const columns: AdminTableColumn<Service>[] = [
        {
            key: "icon",
            label: "Ícone",
            render: (item) => (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/30 dark:bg-foreground/20 text-foreground">
                    <Icon name={item.icon} className="h-5 w-5" />
                </div>
            ),
        },
        {
            key: "title",
            label: "Título",
            render: (item) => <span className="font-bold text-foreground dark:text-white">{item.title}</span>,
        },
        {
            key: "slug",
            label: "Slug",
            render: (item) => <span className="text-gray-500 dark:text-gray-400">{item.slug}</span>,
        },
        {
            key: "category",
            label: "Categoria",
            render: (item) => <span className="text-gray-500 dark:text-gray-400 font-medium">{item.category}</span>,
        },
        {
            key: "active",
            label: "Status",
            render: (item) => <StatusBadge active={item.active} />,
        },
    ];

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Gerir Serviços"
                subtitle="Gerencie os serviços oferecidos pela VA Tech"
                action={{
                    label: "Novo Serviço",
                    href: "/services/new",
                }}
            />

            <AdminTable
                data={services}
                columns={columns}
                loading={loading}
                emptyMessage="Nenhum serviço encontrado."
                onDelete={handleDelete}
                actions={[
                    {
                        type: "edit",
                        href: (item) => `/services/${item.id}/edit`,
                    },
                    {
                        type: "delete",
                        variant: "danger",
                    },
                ]}
            />
        </div>
    );
}
