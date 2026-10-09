import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import fs from 'fs';
import path from 'path';

// Re-export cloudinary for use elsewhere in the accounting controller
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
export { cloudinary };

const provider = process.env.STORAGE_PROVIDER || 'local';

/**
 * Multer middleware for accounting documents.
 *
 * Local storage layout (for audit archive):
 *   uploads/accounting/<companyId>/<period>/<docType>/<timestamp>_<originalname>
 *
 * For cloud providers (cloudinary) we keep a flat folder per case.
 */
export const uploadAccountingDoc = multer({
    storage: (() => {
        if (provider === 'cloudinary') {
            return new CloudinaryStorage({
                cloudinary,
                params: async (req: any, _file: any) => ({
                    folder: `onegest/accounting-documents/${req.companyId || 'unknown'}/${req.params?.caseId || 'case'}`,
                    resource_type: 'auto',
                    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'zip', 'xml'],
                }),
            });
        }

        // Default: structured disk storage
        return multer.diskStorage({
            destination: function (req: any, _file, cb) {
                // req.body fields arrive before the file, so we read them here
                const companyId = req.companyId || 'unknown';
                const caseId = req.params?.caseId || 'case';
                // The doc type key (e.g. BANK_STATEMENT) comes as a body field called 'type'
                const docType = (req.body?.type || 'OTHER').replace(/[^\w-]/g, '_').toUpperCase();
                // We also use 'period' from the case – but that requires a DB lookup which we can't
                // do here synchronously. Instead we store under caseId; the controller mirrors
                // the same path for export. This gives:
                //   uploads/accounting/<companyId>/<caseId>/<docType>/
                const dir = path.join(process.cwd(), 'uploads', 'accounting', companyId, caseId, docType);
                fs.mkdirSync(dir, { recursive: true });
                cb(null, dir);
            },
            filename: function (_req, file, cb) {
                const safe = file.originalname.replace(/[^\w.\-]/g, '_');
                cb(null, `${Date.now()}_${safe}`);
            }
        });
    })(),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
}).single('file');
