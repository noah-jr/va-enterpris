import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_MB = 5;
const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;

function getCloudinaryConfig() {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
        return { cloudName, apiKey, apiSecret };
    }
    return null;
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') ?? formData.get('image');

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { error: 'Envie um ficheiro (campo "file" ou "image")' },
                { status: 400 }
            );
        }

        if (file.size > MAX_BYTES) {
            return NextResponse.json(
                { error: `Ficheiro demasiado grande. Máximo ${MAX_SIZE_MB} MB` },
                { status: 400 }
            );
        }

        if (ALLOWED_TYPES.length && !ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Tipo de ficheiro não permitido. Use: JPEG, PNG, GIF ou WebP' },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const config = getCloudinaryConfig();

        if (config) {
            // Use Cloudinary if configured
            cloudinary.config({
                cloud_name: config.cloudName,
                api_key: config.apiKey,
                api_secret: config.apiSecret
            });

            const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'luclima' },
                    (err, res) => {
                        if (err) reject(err);
                        else if (res) resolve(res);
                        else reject(new Error('Upload sem resposta (Cloudinary)'));
                    }
                );
                uploadStream.end(buffer);
            });

            return NextResponse.json({
                url: result.secure_url,
                publicId: result.public_id,
                source: 'cloudinary'
            });
        } else {
            // Fallback to local file system
            // Ensure public/uploads exists
            const publicDir = join(process.cwd(), 'public');
            const uploadsDir = join(publicDir, 'uploads');

            await mkdir(uploadsDir, { recursive: true });

            // Generate safe filename
            const timestamp = Date.now();
            // Remove special characters, keep extension
            const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
            const filename = `${timestamp}-${originalName}`;
            const filepath = join(uploadsDir, filename);

            await writeFile(filepath, buffer);

            // Construct public URL
            const fileUrl = `/uploads/${filename}`;

            return NextResponse.json({
                url: fileUrl,
                publicId: filename,
                source: 'local'
            });
        }

    } catch (error: unknown) {
        console.error('Upload error:', error);
        const message = error instanceof Error ? error.message : 'Erro ao fazer upload';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
