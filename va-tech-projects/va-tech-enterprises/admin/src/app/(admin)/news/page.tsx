"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function NewsPage() {
    const [news] = useState([
        {
            id: "1",
            title: "Tesla Unveils New Battery Technology",
            slug: "tesla-new-battery-technology",
            author: "Admin",
            date: new Date("2024-01-15"),
            status: "published",
            views: 1250,
        },
        {
            id: "2",
            title: "Model Y Becomes Best-Selling Vehicle",
            slug: "model-y-best-selling",
            author: "Admin",
            date: new Date("2024-01-10"),
            status: "published",
            views: 2100,
        },
        {
            id: "3",
            title: "Supercharger Network Expansion",
            slug: "supercharger-expansion",
            author: "Admin",
            date: new Date("2024-01-05"),
            status: "published",
            views: 890,
        },
        {
            id: "4",
            title: "New Autopilot Features Coming Soon",
            slug: "autopilot-features",
            author: "Admin",
            date: new Date("2024-01-20"),
            status: "draft",
            views: 0,
        },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notícias</h1>
                    <p className="text-muted-foreground">
                        Gerencie as notícias e artigos do blog
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Notícia
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Notícias</CardTitle>
                    <CardDescription>
                        {news.length} notícias cadastradas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Título</TableHead>
                                <TableHead>Autor</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Visualizações</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {news.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium max-w-md">
                                        {item.title}
                                    </TableCell>
                                    <TableCell>{item.author}</TableCell>
                                    <TableCell>{format(item.date, "dd/MM/yyyy")}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                            {item.views}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                item.status === "published" ? "default" : "secondary"
                                            }
                                        >
                                            {item.status === "published" ? "Publicado" : "Rascunho"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
