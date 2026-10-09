"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User } from "@prisma/client";
import { updateProfileAction } from "@/lib/actions/profile";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";

interface ProfileSettingsProps {
    user: User;
}

export default function ProfileSettings({ user }: ProfileSettingsProps) {
    const [state, dispatch, isPending] = useActionState(updateProfileAction, undefined);
    const [showPasswordFields, setShowPasswordFields] = useState(false);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Perfil do Utilizador</CardTitle>
                <CardDescription>Atualize suas informações pessoais e senha.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={dispatch} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={user.name || ''}
                                placeholder="Seu nome completo"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={user.email || ''}
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPasswordFields(!showPasswordFields)}
                            className="mb-4"
                        >
                            {showPasswordFields ? "Cancelar alteração de senha" : "Alterar senha"}
                        </Button>

                        {showPasswordFields && (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Senha Atual</Label>
                                    <Input
                                        id="currentPassword"
                                        name="currentPassword"
                                        type="password"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">Nova Senha</Label>
                                    <Input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {state?.message && (
                        <div className={`p-3 rounded text-sm font-medium ${state.success
                                ? 'bg-green-100 border border-green-200 text-green-700'
                                : 'bg-red-100 border border-red-200 text-red-600'
                            }`}>
                            {state.message}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
