"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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

export default function VehiclesPage() {
    const [vehicles] = useState([
        {
            id: "1",
            name: "Model S",
            price: "$71,090",
            range: "405 mi",
            topSpeed: "200 mph",
            acceleration: "1.99s",
            status: "active",
        },
        {
            id: "2",
            name: "Model 3",
            price: "$38,990",
            range: "358 mi",
            topSpeed: "162 mph",
            acceleration: "3.1s",
            status: "active",
        },
        {
            id: "3",
            name: "Model X",
            price: "$68,590",
            range: "348 mi",
            topSpeed: "155 mph",
            acceleration: "2.5s",
            status: "active",
        },
        {
            id: "4",
            name: "Model Y",
            price: "$36,490",
            range: "330 mi",
            topSpeed: "155 mph",
            acceleration: "3.5s",
            status: "active",
        },
        {
            id: "5",
            name: "Cybertruck",
            price: "$60,990",
            range: "340 mi",
            topSpeed: "130 mph",
            acceleration: "2.9s",
            status: "active",
        },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Veículos</h1>
                    <p className="text-muted-foreground">
                        Gerencie os modelos de veículos disponíveis
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Veículo
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Veículos</CardTitle>
                    <CardDescription>
                        {vehicles.length} veículos cadastrados
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Preço</TableHead>
                                <TableHead>Autonomia</TableHead>
                                <TableHead>Vel. Máxima</TableHead>
                                <TableHead>0-60 mph</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vehicles.map((vehicle) => (
                                <TableRow key={vehicle.id}>
                                    <TableCell className="font-medium">{vehicle.name}</TableCell>
                                    <TableCell>{vehicle.price}</TableCell>
                                    <TableCell>{vehicle.range}</TableCell>
                                    <TableCell>{vehicle.topSpeed}</TableCell>
                                    <TableCell>{vehicle.acceleration}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                vehicle.status === "active" ? "default" : "secondary"
                                            }
                                        >
                                            {vehicle.status === "active" ? "Ativo" : "Inativo"}
                                        </Badge>
                                    </TableCell>
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
