import { Router } from 'express';
import { InvoiceController } from '../controllers/InvoiceController';
import { SaftController } from '../controllers/SaftController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();


router.get('/', rbacMiddleware(['invoices:view']), InvoiceController.index);
router.get('/export-saft', rbacMiddleware(['invoices:view']), SaftController.exportSaft);
router.get('/:id', rbacMiddleware(['invoices:view']), InvoiceController.show);
router.post('/', rbacMiddleware(['invoices:create']), InvoiceController.create);
router.put('/:id', rbacMiddleware(['invoices:create']), InvoiceController.update);
router.get('/:id/pdf', rbacMiddleware(['invoices:view']), InvoiceController.downloadPdf);
router.put('/:id/status', rbacMiddleware(['invoices:create']), InvoiceController.updateStatus);
router.delete('/:id', rbacMiddleware(['invoices:delete']), InvoiceController.destroy);

export { router as invoiceRoutes };

