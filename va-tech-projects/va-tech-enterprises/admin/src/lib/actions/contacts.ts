'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteContactAction(id: string) {
    await prisma.contact.delete({ where: { id } });
    revalidatePath("/contacts");
}

export async function markContactAsReadAction(id: string) {
    await prisma.contact.update({
        where: { id },
        data: { status: 'READ' }
    });
    revalidatePath("/contacts");
}
