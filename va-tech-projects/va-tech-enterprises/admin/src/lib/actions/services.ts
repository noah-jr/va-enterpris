'use server';

import { PrismaServiceRepository } from "@/core/infrastructure/repositories/PrismaServiceRepository";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createServiceAction(prevState: any, formData: FormData) {
    const repo = new PrismaServiceRepository();

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const longDescription = formData.get("longDescription") as string;
    const icon = formData.get("icon") as string;
    const image = formData.get("image") as string;
    const active = formData.get("active") === "on";
    const featuresRaw = formData.get("features") as string;
    const features = featuresRaw ? featuresRaw.split('\n').map(f => f.trim()).filter(f => f !== '') : [];

    try {
        await repo.create({
            title,
            slug,
            category,
            description,
            longDescription,
            icon,
            image,
            active,
            features
        });
    } catch (e) {
        console.error(e);
        return { message: "Erro ao criar serviço. Verifique se o slug já existe." };
    }

    revalidatePath("/services");
    revalidatePath("/services");
    redirect("/services");
}

export async function updateServiceAction(id: string, prevState: any, formData: FormData) {
    const repo = new PrismaServiceRepository();
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const longDescription = formData.get("longDescription") as string;
    const icon = formData.get("icon") as string;
    const image = formData.get("image") as string;
    const active = formData.get("active") === "on";
    const featuresRaw = formData.get("features") as string;
    const features = featuresRaw ? featuresRaw.split('\n').map(f => f.trim()).filter(f => f !== '') : [];

    try {
        await repo.update(id, {
            title, slug, category, description, longDescription, icon, image, active, features
        });
    } catch (e) {
        console.error(e);
        return { message: "Erro ao atualizar serviço." };
    }

    revalidatePath("/services");
    revalidatePath("/services");
    redirect("/services");
}

export async function deleteServiceAction(id: string) {
    const repo = new PrismaServiceRepository();
    await repo.delete(id);
    revalidatePath("/services");
    revalidatePath("/services");
}
