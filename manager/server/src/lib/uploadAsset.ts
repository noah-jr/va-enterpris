import { createUploadMiddleware, cloudinary } from './uploadProvider';

export const uploadAsset = createUploadMiddleware({
    folder: 'system-assets',
    fieldName: 'asset',
    maxFileSize: 20
});

export { cloudinary };
