import { Router } from 'express';
import { DocumentController as DocCtrl } from '../controllers/DocumentController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';
import { createUploadMiddleware } from '../lib/uploadProvider';

const upload = createUploadMiddleware({
    folder: 'documents',
    fieldName: 'file',
    maxFileSize: 20
});

const router = Router();

router.get('/', rbacMiddleware(['documents:view']), DocCtrl.getDocuments);
router.post('/', rbacMiddleware(['documents:view']), upload, DocCtrl.createDocument);
router.patch('/:id', rbacMiddleware(['documents:view']), upload, DocCtrl.updateDocument);
router.delete('/:id', rbacMiddleware(['documents:view']), DocCtrl.deleteDocument);

export { router as documentRoutes };
