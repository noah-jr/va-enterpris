import { createUploadMiddleware, cloudinary } from './uploadProvider';

export const uploadProof = createUploadMiddleware({
    folder: 'subscription-proofs',
    fieldName: 'proof',
    maxFileSize: 10
});

export { cloudinary };
