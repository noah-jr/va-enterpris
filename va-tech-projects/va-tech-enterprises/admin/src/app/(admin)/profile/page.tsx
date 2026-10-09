import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Meu Perfil</h1>
                <p className="text-muted-foreground">Gerencie suas informações pessoais.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Dados Pessoais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 mb-6">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src="/avatars/admin.png" />
                                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">AD</AvatarFallback>
                            </Avatar>
                            <Button variant="outline">Alterar Foto</Button>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input id="name" defaultValue="Admin User" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" defaultValue="admin@vatech.com" readOnly />
                        </div>
                        <Button className="mt-4">Salvar Alterações</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
