'use server';

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function trackPageView(page: string, pageType: string, pageId?: string) {
    try {
        const headersList = await headers();
        const ipAddress = headersList.get('x-forwarded-for') ||
            headersList.get('x-real-ip') ||
            'unknown';
        const userAgent = headersList.get('user-agent') || 'unknown';

        await prisma.pageView.create({
            data: {
                page,
                pageType,
                pageId,
                ipAddress,
                userAgent
            }
        });
    } catch (error) {
        // Silently fail - don't break the page if tracking fails
        console.error('Error tracking page view:', error);
    }
}
