"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Loader2, Save } from "lucide-react";

interface Sector {
    id: string;
    name: string;
}

interface User {
    id: string;
    name: string | null;
    email: string;
    sectors: Sector[];
}

export function UserSectorsManager() {
    const [users, setUsers] = useState<User[]>([]);
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [uRes, sRes] = await Promise.all([
                fetch("/api/users"),
                fetch("/api/sectors")
            ]);
            setUsers(await uRes.json());
            setSectors(await sRes.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleSector = async (userId: string, sectorId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const currentSectorIds = user.sectors.map(s => s.id);
        const newSectorIds = currentSectorIds.includes(sectorId)
            ? currentSectorIds.filter(id => id !== sectorId)
            : [...currentSectorIds, sectorId];

        setSaving(userId);
        try {
            const res = await fetch("/api/users", {
                method: "PUT",
                body: JSON.stringify({ userId, sectorIds: newSectorIds })
            });
            if (res.ok) {
                const updatedUser = await res.json();
                setUsers(users.map(u => u.id === userId ? updatedUser : u));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(null);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="rounded-md border border-border/50 overflow-hidden bg-background">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead>Utilizador</TableHead>
                        <TableHead>Áreas Associadas</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{user.name || "Sem nome"}</span>
                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {user.sectors.length === 0 ? (
                                        <span className="text-xs text-muted-foreground italic">Nenhuma área</span>
                                    ) : (
                                        user.sectors.map(s => (
                                            <Badge key={s.id} variant="secondary" className="bg-primary/5 text-primary border-primary/20">
                                                {s.name}
                                            </Badge>
                                        ))
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" disabled={saving === user.id}>
                                            {saving === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <LayoutGrid className="h-4 w-4 mr-2" />}
                                            Gerir Áreas
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 p-2">
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground px-2 py-1.5">Associar a:</p>
                                        {sectors.map(sector => (
                                            <div key={sector.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-sm cursor-pointer" onClick={() => toggleSector(user.id, sector.id)}>
                                                <Checkbox checked={user.sectors.some(s => s.id === sector.id)} />
                                                <span className="text-sm">{sector.name}</span>
                                            </div>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
