import { createUploadMiddleware, cloudinary } from './uploadProvider';

export const uploadEmployeePhoto = createUploadMiddleware({
    folder: 'employee-photos',
    fieldName: 'photo',
    maxFileSize: 5
});

export { cloudinary };
