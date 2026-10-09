"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUserAction, updateUserAction } from "@/lib/actions/users";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function UserForm({ user }: { user?: any }) {
    const isEdit = !!user;
    const action = isEdit ? updateUserAction.bind(null, user.id) : createUserAction;
    const [state, dispatch, isPending] = useActionState(action, undefined);

    return (
        <form action={dispatch} className="space-y-6 max-w-md bg-card p-6 rounded-lg border shadow-sm">
            <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" required defaultValue={user?.name} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required defaultValue={user?.email} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">{isEdit ? "Nova Senha (deixe em branco para manter)" : "Senha"}</Label>
                <Input id="password" name="password" type="password" required={!isEdit} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <select
                    id="role"
                    name="role"
                    defaultValue={user?.role || "ADMIN"}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="ADMIN">Administrador</option>
                    <option value="EDITOR">Editor</option>
                </select>
            </div>

            {state?.message && (
                <div className="text-red-500 text-sm">{state.message}</div>
            )}

            <div className="flex gap-4 pt-4">
                <Link href="/users">
                    <Button variant="outline" type="button"><ArrowLeft className="mr-2 h-4 w-4" /> Cancelar</Button>
                </Link>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Salvando..." : (isEdit ? "Atualizar" : "Criar")}
                </Button>
            </div>
        </form>
    );
}
