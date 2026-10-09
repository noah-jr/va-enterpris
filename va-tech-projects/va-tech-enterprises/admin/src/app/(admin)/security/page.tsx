import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuditLogsTable } from "@/components/AuditLogsTable";
import { Shield, History } from "lucide-react";

export default function SecurityPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Segurança</h1>
                <p className="text-muted-foreground">Proteja sua conta e verifique atividades recentes.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-1 lg:col-span-1 border-primary/20 shadow-sm">
                    <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Alterar Senha</CardTitle>
                            <CardDescription>Mantenha sua conta segura.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="current" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Senha Atual</Label>
                            <Input id="current" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nova Senha</Label>
                            <Input id="new" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirmar Nova Senha</Label>
                            <Input id="confirm" type="password" />
                        </div>
                        <Button className="w-full">Atualizar Senha</Button>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2 lg:col-span-2 border-border/50">
                    <CardHeader className="flex flex-row items-center space-x-4 pb-4">
                        <div className="p-2 bg-muted rounded-lg">
                            <History className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Histórico de Atividade</CardTitle>
                            <CardDescription>Acompanhe acessos e alterações recentes.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <AuditLogsTable />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

