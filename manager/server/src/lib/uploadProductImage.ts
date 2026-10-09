import { createUploadMiddleware, cloudinary } from './uploadProvider';

export const uploadProductImage = createUploadMiddleware({
    folder: 'products',
    fieldName: 'image',
    maxFileSize: 5
});

export { cloudinary };
