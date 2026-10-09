"use client";

import { useState, useEffect } from "react";
import { AdminTable, AdminTableColumn } from "@/components/AdminTable";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { Badge } from "@/components/StatusBadge";
import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import Link from "next/link";

interface Contact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    status: string;
    createdAt: string;
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        try {
            const res = await fetch("/api/contacts");
            const data = await res.json();
            if (Array.isArray(data)) setContacts(data);
        } catch (error) {
            toast.error("Erro ao carregar contactos");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (contact: Contact) => {
        try {
            const res = await fetch(`/api/contacts/${contact.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Contacto removido com sucesso");
                loadContacts();
            } else {
                toast.error("Erro ao remover contacto");
            }
        } catch (error) {
            toast.error("Erro ao remover contacto");
        }
    };

    const handleMarkAsRead = async (contactId: string) => {
        try {
            const res = await fetch(`/api/contacts/${contactId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "READ" }),
            });

            if (res.ok) {
                toast.success("Contacto marcado como lido");
                loadContacts();
            } else {
                toast.error("Erro ao atualizar contacto");
            }
        } catch (error) {
            toast.error("Erro ao atualizar contacto");
        }
    };

    const columns: AdminTableColumn<Contact>[] = [
        {
            key: "name",
            label: "Nome/Email",
            render: (item) => (
                <div className="min-w-[200px]">
                    <div className="font-bold text-foreground dark:text-white">{item.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.email}</div>
                    <div className="text-xs text-gray-400 mt-1">
                        {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm", { locale: pt })}
                    </div>
                </div>
            ),
        },
        {
            key: "subject",
            label: "Assunto",
            render: (item) => (
                <span className="font-medium text-foreground dark:text-white max-w-[150px] truncate block">
                    {item.subject || "-"}
                </span>
            ),
        },
        {
            key: "message",
            label: "Mensagem",
            render: (item) => (
                <p className="line-clamp-2 max-w-[300px] text-gray-600 dark:text-gray-300 text-xs">
                    {item.message}
                </p>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (item) =>
                item.status === "NEW" ? (
                    <Badge variant="warning">Novo</Badge>
                ) : (
                    <Badge variant="success">Lido</Badge>
                ),
        },
    ];

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Contactos"
                subtitle="Mensagens recebidas pelo formulário de contacto"
            />

            <AdminTable
                data={contacts}
                columns={columns}
                loading={loading}
                emptyMessage="Nenhuma mensagem recebida."
                onDelete={handleDelete}
                actions={[
                    {
                        type: "custom",
                        icon: <Mail className="h-4 w-4" />,
                        href: (item) => `mailto:${item.email}?subject=Re: ${item.subject}`,
                    },
                    {
                        type: "custom",
                        icon: <CheckCircle className="h-4 w-4" />,
                        onClick: (item) => item.status === "NEW" && handleMarkAsRead(item.id),
                        className: "h-8 w-8 rounded-lg hover:bg-green-50 dark:hover:bg-green-500/10 text-green-500 hover:text-green-600",
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
