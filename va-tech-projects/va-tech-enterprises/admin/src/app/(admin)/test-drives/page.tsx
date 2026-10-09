"use client";

import { useState } from "react";
import { Calendar, User, Car, Phone, Mail, Check, X } from "lucide-react";
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

export default function TestDrivesPage() {
    const [testDrives] = useState([
        {
            id: "1",
            customerName: "João Silva",
            email: "joao@example.com",
            phone: "+351 912 345 678",
            vehicle: "Model 3",
            date: new Date("2024-02-10"),
            time: "14:00",
            status: "pending",
        },
        {
            id: "2",
            customerName: "Maria Santos",
            email: "maria@example.com",
            phone: "+351 923 456 789",
            vehicle: "Model Y",
            date: new Date("2024-02-12"),
            time: "10:30",
            status: "confirmed",
        },
        {
            id: "3",
            customerName: "Pedro Costa",
            email: "pedro@example.com",
            phone: "+351 934 567 890",
            vehicle: "Model S",
            date: new Date("2024-02-15"),
            time: "16:00",
            status: "pending",
        },
        {
            id: "4",
            customerName: "Ana Rodrigues",
            email: "ana@example.com",
            phone: "+351 945 678 901",
            vehicle: "Model X",
            date: new Date("2024-01-25"),
            time: "11:00",
            status: "completed",
        },
        {
            id: "5",
            customerName: "Carlos Ferreira",
            email: "carlos@example.com",
            phone: "+351 956 789 012",
            vehicle: "Cybertruck",
            date: new Date("2024-02-08"),
            time: "15:30",
            status: "cancelled",
        },
    ]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge variant="outline">Pendente</Badge>;
            case "confirmed":
                return <Badge>Confirmado</Badge>;
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
                    <h1 className="text-3xl font-bold tracking-tight">Test Drives</h1>
                    <p className="text-muted-foreground">
                        Gerencie os agendamentos de test drives
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {testDrives.filter((td) => td.status === "pending").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {testDrives.filter((td) => td.status === "confirmed").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {testDrives.filter((td) => td.status === "completed").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {testDrives.filter((td) => td.status === "cancelled").length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Agendamentos</CardTitle>
                    <CardDescription>
                        {testDrives.length} test drives agendados
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Contacto</TableHead>
                                <TableHead>Veículo</TableHead>
                                <TableHead>Data/Hora</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {testDrives.map((testDrive) => (
                                <TableRow key={testDrive.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">{testDrive.customerName}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Mail className="h-3 w-3 text-muted-foreground" />
                                                {testDrive.email}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Phone className="h-3 w-3 text-muted-foreground" />
                                                {testDrive.phone}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Car className="h-4 w-4 text-muted-foreground" />
                                            {testDrive.vehicle}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                {format(testDrive.date, "dd/MM/yyyy")} às {testDrive.time}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(testDrive.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {testDrive.status === "pending" && (
                                                <>
                                                    <Button variant="ghost" size="icon" title="Confirmar">
                                                        <Check className="h-4 w-4 text-green-600" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" title="Cancelar">
                                                        <X className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </>
                                            )}
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
