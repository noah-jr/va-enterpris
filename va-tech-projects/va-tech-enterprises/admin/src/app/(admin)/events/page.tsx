"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, MapPin, Calendar as CalendarIcon } from "lucide-react";
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

export default function EventsPage() {
    const [events] = useState([
        {
            id: "1",
            title: "Model Y Launch Event",
            location: "Lisboa, Portugal",
            date: new Date("2024-02-15"),
            attendees: 150,
            maxAttendees: 200,
            status: "upcoming",
        },
        {
            id: "2",
            title: "Supercharger Network Presentation",
            location: "Porto, Portugal",
            date: new Date("2024-02-20"),
            attendees: 80,
            maxAttendees: 100,
            status: "upcoming",
        },
        {
            id: "3",
            title: "Tesla Energy Solutions Workshop",
            location: "Faro, Portugal",
            date: new Date("2024-01-10"),
            attendees: 120,
            maxAttendees: 120,
            status: "completed",
        },
    ]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "upcoming":
                return <Badge>Próximo</Badge>;
            case "completed":
                return <Badge variant="secondary">Concluído</Badge>;
            case "cancelled":
                return <Badge variant="destructive">Cancelado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
                    <p className="text-muted-foreground">
                        Gerencie os eventos e apresentações
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Evento
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Eventos</CardTitle>
                    <CardDescription>
                        {events.length} eventos cadastrados
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Evento</TableHead>
                                <TableHead>Local</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Participantes</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell className="font-medium">{event.title}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            {event.location}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                            {format(event.date, "dd/MM/yyyy")}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {event.attendees}/{event.maxAttendees}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
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
