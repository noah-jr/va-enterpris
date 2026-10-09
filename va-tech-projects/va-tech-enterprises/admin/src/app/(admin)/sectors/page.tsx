"use client";

import { useState, useEffect } from "react";
import {
    LayoutGrid,
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    CheckCircle2,
    XCircle,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Sector {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    active: boolean;
    _count?: {
        users: number;
    };
}

export default function SectorsPage() {
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSector, setEditingSector] = useState<Sector | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        icon: "LayoutGrid",
        active: true
    });

    const fetchSectors = async () => {
        try {
            const res = await fetch("/api/sectors");
            const data = await res.json();
            if (Array.isArray(data)) {
                setSectors(data);
            }
        } catch (error) {
            toast.error("Erro ao carregar sectores");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSectors();
    }, []);

    const handleOpenDialog = (sector?: Sector) => {
        if (sector) {
            setEditingSector(sector);
            setFormData({
                name: sector.name,
                description: sector.description || "",
                icon: sector.icon || "LayoutGrid",
                active: sector.active
            });
        } else {
            setEditingSector(null);
            setFormData({
                name: "",
                description: "",
                icon: "LayoutGrid",
                active: true
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast.error("O nome é obrigatório");
            return;
        }

        setSaving(true);
        try {
            const method = editingSector ? "PUT" : "POST";
            const url = editingSector ? `/api/sectors/${editingSector.id}` : "/api/sectors";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(editingSector ? "Sector atualizado" : "Sector criado");
                setIsDialogOpen(false);
                fetchSectors();
            } else {
                throw new Error();
            }
        } catch (error) {
            toast.error("Erro ao salvar sector");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem a certeza que deseja eliminar este sector?")) return;

        try {
            const res = await fetch(`/api/sectors/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Sector eliminado");
                fetchSectors();
            } else {
                throw new Error();
            }
        } catch (error) {
            toast.error("Erro ao eliminar sector");
        }
    };

    const filteredSectors = sectors.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <LayoutGrid className="h-6 w-6 text-primary" /> Sectores
                    </h1>
                    <p className="text-muted-foreground text-sm">Gerencie os sectores de atuação e classificação</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Novo Sector
                </Button>
            </div>

            <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3 border-b border-border/10">
                    <div className="flex items-center gap-2 relative">
                        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Pesquisar sectores..."
                            className="pl-9 bg-muted/30 border-none max-w-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="h-40 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                        </div>
                    ) : filteredSectors.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 text-[11px] uppercase tracking-wider">
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Utilizadores</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSectors.map((sector) => (
                                    <TableRow key={sector.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-medium py-3">
                                            <div className="flex flex-col">
                                                <span>{sector.name}</span>
                                                <span className="text-xs text-muted-foreground font-normal truncate max-w-[300px]">
                                                    {sector.description || "Sem descrição"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-mono text-[10px]">
                                                {sector._count?.users || 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {sector.active ? (
                                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex items-center gap-1 w-fit text-[10px]">
                                                    <CheckCircle2 className="h-3 w-3" /> Ativo
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground flex items-center gap-1 w-fit text-[10px]">
                                                    <XCircle className="h-3 w-3" /> Inativo
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        className="flex items-center gap-2 cursor-pointer"
                                                        onClick={() => handleOpenDialog(sector)}
                                                    >
                                                        <Edit className="h-3 w-3" /> Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                                                        onClick={() => handleDelete(sector.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" /> Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
                            <LayoutGrid className="h-10 w-10 mb-2 opacity-20" />
                            <p>Nenhum sector encontrado.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingSector ? "Editar Sector" : "Novo Sector"}</DialogTitle>
                        <DialogDescription>
                            Preencha os detalhes do sector abaixo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Comercial, Técnico..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Breve descrição do sector..."
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="active" className="cursor-pointer">Estado Ativo</Label>
                                <span className="text-[10px] text-muted-foreground">Visível para vinculação</span>
                            </div>
                            <Switch
                                id="active"
                                checked={formData.active}
                                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {editingSector ? "Atualizar" : "Salvar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
