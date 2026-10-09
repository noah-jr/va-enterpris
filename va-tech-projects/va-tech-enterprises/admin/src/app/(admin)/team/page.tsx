"use client";

import { useState, useEffect } from "react";
import { AdminTable, AdminTableColumn } from "@/components/AdminTable";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface TeamMember {
    id: string;
    name: string;
    role: string;
    email: string;
    active: boolean;
}

export default function TeamAdminPage() {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadTeam();
    }, []);

    const loadTeam = async () => {
        try {
            const res = await fetch("/api/team");
            const data = await res.json();
            if (Array.isArray(data)) setTeam(data);
        } catch (error) {
            toast.error("Erro ao carregar equipa");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (member: TeamMember) => {
        try {
            const res = await fetch(`/api/team/${member.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Membro removido com sucesso");
                loadTeam();
            } else {
                toast.error("Erro ao remover membro");
            }
        } catch (error) {
            toast.error("Erro ao remover membro");
        }
    };

    const columns: AdminTableColumn<TeamMember>[] = [
        {
            key: "name",
            label: "Nome",
            render: (item) => <span className="font-bold text-foreground dark:text-white">{item.name}</span>,
        },
        {
            key: "role",
            label: "Cargo",
            render: (item) => <span className="text-gray-500 dark:text-gray-400">{item.role}</span>,
        },
        {
            key: "email",
            label: "Email",
            render: (item) => <span className="text-gray-500 dark:text-gray-400">{item.email || "-"}</span>,
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
                title="Equipa"
                subtitle="Gerencie os membros da equipa VA Tech"
                action={{
                    label: "Novo Membro",
                    href: "/team/new",
                }}
            />

            <AdminTable
                data={team}
                columns={columns}
                loading={loading}
                emptyMessage="Nenhum membro encontrado."
                onDelete={handleDelete}
                actions={[
                    {
                        type: "edit",
                        href: (item) => `/team/${item.id}/edit`,
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
