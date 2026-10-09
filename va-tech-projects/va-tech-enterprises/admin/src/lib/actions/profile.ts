'use server';

import { getSession as auth } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(prevState: any, formData: FormData) {
    const session = await auth();

    if (!session?.user?.email) {
        return { success: false, message: "Não autenticado" };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return { success: false, message: "Utilizador não encontrado" };
        }

        // Preparar dados de atualização
        const updateData: any = {
            name,
            email
        };

        // Se estiver tentando alterar senha
        if (currentPassword && newPassword) {
            // Verificar senha atual
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

            if (!isPasswordValid) {
                return { success: false, message: "Senha atual incorreta" };
            }

            // Hash da nova senha
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        // Atualizar usuário
        await prisma.user.update({
            where: { id: user.id },
            data: updateData
        });

        revalidatePath("/settings");

        return {
            success: true,
            message: "Perfil atualizado com sucesso!"
        };
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        return {
            success: false,
            message: "Erro ao atualizar perfil. Verifique se o email já não está em uso."
        };
    }
}
