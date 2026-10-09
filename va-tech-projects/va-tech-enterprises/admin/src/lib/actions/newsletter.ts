'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteSubscriberAction(id: string) {
    await prisma.newsletterSubscriber.delete({ where: { id } });
    revalidatePath("/newsletter");
}
