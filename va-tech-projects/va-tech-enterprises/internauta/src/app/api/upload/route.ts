import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getSession as auth } from "@/lib/jwt";

export async function POST(req: NextRequest) {
    // Note: guestId is handled by the chat logic, we allow public uploads for the widget
    // but keep size and type restrictions for security.

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const folder = (formData.get("folder") as string) || "va-uploads";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validar tamanho do arquivo (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 10MB" },
                { status: 400 }
            );
        }

        // Validar tipo de arquivo
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/webm',
            'application/pdf',
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Allowed: images, videos (mp4, webm), PDF" },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Sanitize filename
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
        const timestamp = Date.now();
        const filename = `${timestamp}-${safeName}`;

        // Upload para Cloudinary
        const url = await uploadToCloudinary(buffer, folder, filename);

        return NextResponse.json({ url });
    } catch (e) {
        console.error("Upload Error:", e);
        return NextResponse.json(
            { error: "Upload failed", details: e instanceof Error ? e.message : "Unknown error" },
            { status: 500 }
        );
    }
}
