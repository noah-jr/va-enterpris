import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export { cloudinary };

/**
 * Upload de arquivo para Cloudinary
 * @param buffer - Buffer do arquivo
 * @param folder - Pasta no Cloudinary (opcional)
 * @param filename - Nome do arquivo (opcional)
 * @returns URL pública do arquivo
 */
export async function uploadToCloudinary(
    buffer: Buffer,
    folder: string = 'va-uploads',
    filename?: string
): Promise<string> {
    return new Promise((resolve, reject) => {
        const uploadOptions: any = {
            folder,
            resource_type: 'auto', // Detecta automaticamente o tipo (imagem, vídeo, raw)
            use_filename: true,
            unique_filename: true,
        };

        if (filename) {
            uploadOptions.public_id = filename.replace(/\.[^/.]+$/, ''); // Remove extensão
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                } else if (result) {
                    resolve(result.secure_url);
                } else {
                    reject(new Error('Upload failed: no result returned'));
                }
            }
        );

        uploadStream.end(buffer);
    });
}

/**
 * Deleta um arquivo do Cloudinary
 * @param publicId - ID público do arquivo no Cloudinary
 * @param resourceType - Tipo de recurso (image, video, raw)
 */
export async function deleteFromCloudinary(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw error;
    }
}

/**
 * Lista recursos do Cloudinary
 * @param folder - Pasta opcional para filtrar
 * @returns Lista de recursos
 */
export async function listResources(folder?: string): Promise<any[]> {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: folder,
            max_results: 100,
            direction: 'desc'
        });
        return result.resources;
    } catch (error) {
        console.error('Cloudinary list error:', error);
        throw error;
    }
}

/**
 * Extrai o public_id de uma URL do Cloudinary
 * @param url - URL completa do Cloudinary
 * @returns public_id ou null se não for URL válida
 */
export function extractPublicId(url: string): string | null {
    try {
        // Handle URLs like https://res.cloudinary.com/cloud_name/image/upload/v1234567/folder/public_id.jpg
        const parts = url.split('/');
        const lastPart = parts[parts.length - 1];
        const publicIdWithExtension = lastPart.split('.')[0];

        // If there's a folder, we might need a more complex regex
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
        return match ? match[1] : publicIdWithExtension;
    } catch {
        return null;
    }
}
