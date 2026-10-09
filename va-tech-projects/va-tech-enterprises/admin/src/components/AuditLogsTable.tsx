"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Loader2, Shield } from "lucide-react";

interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    details: string | null;
    userId: string | null;
    ipAddress: string | null;
    createdAt: string;
    user: {
        name: string | null;
        email: string;
    } | null;
}

export function AuditLogsTable() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch("/api/audit?limit=20");
                const data = await res.json();
                if (data.logs) {
                    setLogs(data.logs);
                }
            } catch (error) {
                console.error("Error fetching logs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const getActionBadge = (action: string) => {
        switch (action) {
            case "CREATE":
                return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">CRIAR</Badge>;
            case "UPDATE":
                return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">EDITAR</Badge>;
            case "DELETE":
                return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">APAGAR</Badge>;
            case "LOGIN":
                return <Badge className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20">LOGIN</Badge>;
            default:
                return <Badge variant="outline">{action}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead>Ação</TableHead>
                        <TableHead>Entidade</TableHead>
                        <TableHead>Utilizador</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Detalhes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                Nenhuma atividade registada.
                            </TableCell>
                        </TableRow>
                    ) : (
                        logs.map((log) => (
                            <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                                <TableCell>{getActionBadge(log.action)}</TableCell>
                                <TableCell className="font-medium">{log.entity}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{log.user?.name || "Desconhecido"}</span>
                                        <span className="text-xs text-muted-foreground">{log.user?.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <code className="text-xs px-1 py-0.5 bg-muted rounded">{log.ipAddress || "—"}</code>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                    {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm", { locale: pt })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className="text-xs text-muted-foreground truncate max-w-[200px] inline-block">
                                        {log.details ? log.details.substring(0, 50) : "—"}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
