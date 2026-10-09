"use client";

import { useState, useEffect } from "react";
import { AdminTable, AdminTableColumn } from "@/components/AdminTable";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { StatusBadge, Badge } from "@/components/StatusBadge";
import { Search, Star } from "lucide-react";
import { toast } from "sonner";

interface Project {
    id: string;
    title: string;
    category: string;
    client: string;
    featured: boolean;
    active: boolean;
    createdAt: string;
}

export default function ProjectsAdminPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const res = await fetch("/api/projects");
            const data = await res.json();
            if (Array.isArray(data)) setProjects(data);
        } catch (error) {
            toast.error("Erro ao carregar projetos");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (project: Project) => {
        try {
            const res = await fetch(`/api/projects/${project.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Projeto eliminado com sucesso");
                loadProjects();
            } else {
                toast.error("Erro ao eliminar projeto");
            }
        } catch (error) {
            toast.error("Erro ao eliminar projeto");
        }
    };

    const filteredProjects = projects.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns: AdminTableColumn<Project>[] = [
        {
            key: "title",
            label: "Título",
            render: (item) => (
                <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground dark:text-white">{item.title}</span>
                    {item.featured && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                </div>
            ),
        },
        {
            key: "category",
            label: "Categoria",
            render: (item) => <Badge variant="info">{item.category}</Badge>,
        },
        {
            key: "client",
            label: "Cliente",
            render: (item) => <span className="text-gray-500 dark:text-gray-400">{item.client || "-"}</span>,
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
                title="Portfólio"
                subtitle="Gerir projetos e casos de estudo"
                action={{
                    label: "Novo Projeto",
                    href: "/projects/new",
                }}
            >
                <div className="admin-search-bar">
                    <Search className="admin-search-icon" />
                    <input
                        type="text"
                        placeholder="Pesquisar projetos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-search-input"
                    />
                </div>
            </AdminPageHeader>

            <AdminTable
                data={filteredProjects}
                columns={columns}
                loading={loading}
                emptyMessage={searchTerm ? "Nenhum projeto encontrado com esse termo." : "Nenhum projeto criado ainda."}
                onDelete={handleDelete}
                actions={[
                    {
                        type: "edit",
                        href: (item) => `/projects/${item.id}`,
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
