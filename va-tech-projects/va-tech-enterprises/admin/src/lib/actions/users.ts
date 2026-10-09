'use server';

import { PrismaUserRepository } from "@/core/infrastructure/repositories/PrismaUserRepository";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createUserAction(prevState: any, formData: FormData) {
    const repo = new PrismaUserRepository();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    if (!password) {
        return { message: "Senha é obrigatória." };
    }

    try {
        await repo.create({ name, email, password, role });
    } catch (e) {
        return { message: "Erro ao criar usuário. Email já existe?" };
    }

    revalidatePath("/users");
    redirect("/users");
}

export async function updateUserAction(id: string, prevState: any, formData: FormData) {
    const repo = new PrismaUserRepository();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string; // Opcional
    const role = formData.get("role") as string;

    try {
        await repo.update(id, { name, email, password, role });
    } catch (e) {
        return { message: "Erro ao atualizar usuário." };
    }

    revalidatePath("/users");
    redirect("/users");
}

export async function deleteUserAction(id: string) {
    const repo = new PrismaUserRepository();
    await repo.delete(id);
    revalidatePath("/users");
}
