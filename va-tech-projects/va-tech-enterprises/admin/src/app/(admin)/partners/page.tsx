"use client";

import { useState, useEffect } from "react";
import { AdminTable, AdminTableColumn } from "@/components/AdminTable";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ui/ImageUpload";

interface Partner {
    id: string;
    name: string;
    logo?: string;
    link?: string;
    order: number;
    active: boolean;
}

export default function PartnersAdminPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        logo: "",
        link: "",
        order: 0,
        active: true
    });

    useEffect(() => {
        loadPartners();
    }, []);

    const loadPartners = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/partners");
            const data = await res.json();
            if (Array.isArray(data)) setPartners(data);
        } catch (error) {
            toast.error("Erro ao carregar parceiros");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast.error("Nome é obrigatório");
            return;
        }

        try {
            const method = editingPartner ? "PATCH" : "POST";
            const url = editingPartner ? `/api/partners/${editingPartner.id}` : "/api/partners";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(editingPartner ? "Parceiro atualizado" : "Parceiro criado");
                setIsDialogOpen(false);
                loadPartners();
            } else {
                toast.error("Erro ao salvar parceiro");
            }
        } catch (error) {
            toast.error("Erro ao salvar parceiro");
        }
    };

    const handleDelete = async (partner: Partner) => {
        try {
            const res = await fetch(`/api/partners/${partner.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Parceiro removido");
                loadPartners();
            } else {
                toast.error("Erro ao remover parceiro");
            }
        } catch (error) {
            toast.error("Erro ao remover parceiro");
        }
    };

    const openCreateDialog = () => {
        setEditingPartner(null);
        setFormData({ name: "", logo: "", link: "", order: 0, active: true });
        setIsDialogOpen(true);
    };

    const openEditDialog = (partner: Partner) => {
        setEditingPartner(partner);
        setFormData({
            name: partner.name,
            logo: partner.logo || "",
            link: partner.link || "",
            order: partner.order,
            active: partner.active
        });
        setIsDialogOpen(true);
    };

    const filteredPartners = partners.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns: AdminTableColumn<Partner>[] = [
        {
            key: "name",
            label: "Nome",
            render: (item) => (
                <div className="flex items-center gap-3">
                    {item.logo && (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                            <img src={item.logo} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                    )}
                    <span className="font-bold text-foreground dark:text-white">{item.name}</span>
                </div>
            ),
        },
        {
            key: "link",
            label: "Website",
            render: (item) => <span className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-[200px] block">{item.link || "-"}</span>,
        },
        {
            key: "order",
            label: "Ordem",
            render: (item) => <span className="font-medium">{item.order}</span>,
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
                title="Parceiros"
                subtitle="Gerir logos e links das empresas parceiras"
                action={{
                    label: "Novo Parceiro",
                    onClick: openCreateDialog,
                }}
            >
                <div className="admin-search-bar">
                    <Search className="admin-search-icon" />
                    <input
                        type="text"
                        placeholder="Pesquisar parceiros..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-search-input"
                    />
                </div>
            </AdminPageHeader>

            <AdminTable
                data={filteredPartners}
                columns={columns}
                loading={loading}
                emptyMessage={searchTerm ? "Nenhum parceiro encontrado." : "Nenhum parceiro registado."}
                onDelete={handleDelete}
                actions={[
                    {
                        type: "edit",
                        onClick: (item) => openEditDialog(item),
                    },
                    {
                        type: "delete",
                        variant: "danger",
                    },
                ]}
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPartner ? "Editar Parceiro" : "Novo Parceiro"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Parceiro</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: TechCorp"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Logo do Parceiro</Label>
                            <ImageUpload
                                value={formData.logo}
                                onChange={(url) => setFormData({ ...formData, logo: url })}
                                onRemove={() => setFormData({ ...formData, logo: "" })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="link">URL do Website</Label>
                            <Input
                                id="link"
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="order">Ordem de Exibição</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="flex items-end pb-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm font-medium">Ativo</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
