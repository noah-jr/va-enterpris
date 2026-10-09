'use server';

import { PrismaPostRepository } from "@/core/infrastructure/repositories/PrismaPostRepository";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession as auth } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

async function getAuthorId() {
    const session = await auth();
    if (!session?.user?.email) return null;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    return user?.id || null;
}

export async function createPostAction(prevState: any, formData: FormData) {
    const authorId = await getAuthorId();
    if (!authorId) return { message: "Utilizador não autenticado." };

    const repo = new PrismaPostRepository();

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const coverImage = formData.get("coverImage") as string;
    const tags = formData.get("tags") as string;
    const published = formData.get("published") === "on";

    try {
        await repo.create({
            title,
            slug,
            content,
            excerpt,
            coverImage,
            tags,
            published,
            authorId
        });
    } catch (e) {
        console.error(e);
        return { message: "Erro ao criar artigo. Slug duplicado?" };
    }

    revalidatePath("/posts");
    revalidatePath("/blog");
    redirect("/posts");
}

export async function updatePostAction(id: string, prevState: any, formData: FormData) {
    const repo = new PrismaPostRepository();

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const coverImage = formData.get("coverImage") as string;
    const tags = formData.get("tags") as string;
    const published = formData.get("published") === "on";

    try {
        await repo.update(id, {
            title, slug, content, excerpt, coverImage, tags, published
        });
    } catch (e) {
        console.error(e);
        return { message: "Erro ao atualizar artigo." };
    }

    revalidatePath("/posts");
    revalidatePath("/blog");
    redirect("/posts");
}

export async function deletePostAction(id: string) {
    const repo = new PrismaPostRepository();
    await repo.delete(id);
    revalidatePath("/posts");
    revalidatePath("/blog");
}
