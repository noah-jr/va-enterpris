"use client";

import { useState, useEffect } from "react";
import { AdminTable, AdminTableColumn } from "@/components/AdminTable";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface Testimonial {
    id: string;
    name: string;
    role: string;
    company: string;
    rating: number;
    active: boolean;
}

export default function TestimonialsAdminPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTestimonials();
    }, []);

    const loadTestimonials = async () => {
        try {
            const res = await fetch("/api/testimonials");
            const data = await res.json();
            if (Array.isArray(data)) setTestimonials(data);
        } catch (error) {
            toast.error("Erro ao carregar testemunhos");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (testimonial: Testimonial) => {
        try {
            const res = await fetch(`/api/testimonials/${testimonial.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Testemunho removido com sucesso");
                loadTestimonials();
            } else {
                toast.error("Erro ao remover testemunho");
            }
        } catch (error) {
            toast.error("Erro ao remover testemunho");
        }
    };

    const columns: AdminTableColumn<Testimonial>[] = [
        {
            key: "name",
            label: "Nome",
            render: (item) => <span className="font-bold text-foreground dark:text-white">{item.name}</span>,
        },
        {
            key: "role",
            label: "Cargo/Empresa",
            render: (item) => (
                <div>
                    <div className="text-gray-900 dark:text-gray-100">{item.role}</div>
                    {item.company && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.company}</div>
                    )}
                </div>
            ),
        },
        {
            key: "rating",
            label: "Avaliação",
            render: (item) => (
                <div className="flex items-center gap-1">
                    <span className="font-bold text-foreground dark:text-white">{item.rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
            ),
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
                title="Testemunhos"
                subtitle="Gerencie os testemunhos de clientes"
                action={{
                    label: "Novo Testemunho",
                    href: "/testimonials/new",
                }}
            />

            <AdminTable
                data={testimonials}
                columns={columns}
                loading={loading}
                emptyMessage="Nenhum testemunho encontrado."
                onDelete={handleDelete}
                actions={[
                    {
                        type: "edit",
                        href: (item) => `/testimonials/${item.id}/edit`,
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
