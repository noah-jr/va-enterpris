import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { S3Client, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const provider = process.env.STORAGE_PROVIDER || 'local'; // 'local', 's3', 'cloudinary'

// Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// S3 / MinIO
let s3Client: S3Client | undefined;
if (provider === 's3') {
    s3Client = new S3Client({
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY || '',
            secretAccessKey: process.env.S3_SECRET_KEY || ''
        },
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true' // important for MinIO
    });
}

export interface UploadOptions {
    folder: string;
    fieldName?: string;
    maxFileSize?: number; // in MB
    limit?: number; // for multiple files
}

function getStorage(folder: string) {
    if (provider === 'cloudinary') {
        return new CloudinaryStorage({
            cloudinary,
            params: async (_req: any, file: any) => ({
                folder: `onegest/${folder}`,
                // We use a predictable ID structure if possible, but Cloudinary usually handles it.
                // Note: multer-storage-cloudinary handles public_id differently depending on version.
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx'],
                resource_type: 'auto',
            }),
        });
    } else if (provider === 's3' && s3Client) {
        return multerS3({
            s3: s3Client,
            bucket: process.env.S3_BUCKET || 'onegest',
            acl: 'public-read',
            metadata: function (req: any, file: any, cb: any) {
                cb(null, { fieldName: file.fieldname });
            },
            key: function (req: any, file: any, cb: any) {
                cb(null, `${folder}/${Date.now()}_${file.originalname.replace(/\s/g, '_')}`);
            }
        });
    } else {
        const uploadDir = `uploads/${folder}`;
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        return multer.diskStorage({
            destination: function (_req, _file, cb) {
                cb(null, uploadDir);
            },
            filename: function (_req, file, cb) {
                cb(null, `${Date.now()}_${file.originalname.replace(/\s/g, '_')}`);
            }
        });
    }
}

/**
 * Retorna middleware para upload de um único ficheiro
 */
export function getFile(options: UploadOptions) {
    const storage = getStorage(options.folder);
    return multer({
        storage,
        limits: { fileSize: (options.maxFileSize || 5) * 1024 * 1024 }
    }).single(options.fieldName || 'image');
}

/**
 * Retorna middleware para upload de múltiplos ficheiros
 */
export function getFiles(options: UploadOptions) {
    const storage = getStorage(options.folder);
    return multer({
        storage,
        limits: { fileSize: (options.maxFileSize || 5) * 1024 * 1024 }
    }).array(options.fieldName || 'images', options.limit || 10);
}

/**
 * Elimina um ficheiro do armazenamento
 */
export async function deleteFile(filePathOrUrl: string) {
    if (!filePathOrUrl) return;

    try {
        if (provider === 'cloudinary') {
            // Extrair public_id de uma URL Cloudinary: .../upload/v123/onegest/folder/id.jpg
            const parts = filePathOrUrl.split('/');
            const fileNameWithExt = parts.pop() || '';
            const publicIdWithFolder = parts.slice(parts.indexOf('onegest')).concat(fileNameWithExt.split('.')[0]).join('/');
            await cloudinary.uploader.destroy(publicIdWithFolder);
        } else if (provider === 's3' && s3Client) {
            const key = filePathOrUrl.includes('http') 
                ? filePathOrUrl.split('/').slice(3).join('/') 
                : filePathOrUrl;
            await s3Client.send(new DeleteObjectCommand({
                Bucket: process.env.S3_BUCKET || 'onegest',
                Key: key
            }));
        } else {
            // Local
            let relativePath = filePathOrUrl;
            if (filePathOrUrl.startsWith('http')) {
                try {
                    const url = new URL(filePathOrUrl);
                    relativePath = url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
                } catch (e) {
                    // Fallback se não for uma URL válida
                }
            }
            const fullPath = path.join(process.cwd(), relativePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }
    } catch (error) {
        console.error(`[UploadProvider] Erro ao eliminar ficheiro: ${filePathOrUrl}`, error);
    }
}

/**
 * Elimina múltiplos ficheiros do armazenamento
 */
export async function deleteMany(filePathsOrUrls: string[]) {
    if (!filePathsOrUrls || filePathsOrUrls.length === 0) return;

    if (provider === 's3' && s3Client) {
        try {
            const objects = filePathsOrUrls.map(f => ({
                Key: f.includes('http') ? f.split('/').slice(3).join('/') : f
            }));
            await s3Client.send(new DeleteObjectsCommand({
                Bucket: process.env.S3_BUCKET || 'onegest',
                Delete: { Objects: objects }
            }));
        } catch (error) {
            console.error('[UploadProvider] Erro ao eliminar múltiplos ficheiros no S3', error);
        }
    } else {
        await Promise.all(filePathsOrUrls.map(f => deleteFile(f)));
    }
}

// Alias para compatibilidade
export const createUploadMiddleware = getFile;

export { cloudinary };
