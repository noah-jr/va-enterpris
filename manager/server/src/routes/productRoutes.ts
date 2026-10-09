import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';
import { uploadProductImage } from '../lib/uploadProductImage';

const router = Router();

router.get('/', rbacMiddleware(['products:view']), ProductController.index);
router.get('/:id', rbacMiddleware(['products:view']), ProductController.show);
router.post('/', rbacMiddleware(['products:view']), uploadProductImage, ProductController.create);
router.put('/:id', rbacMiddleware(['products:view']), uploadProductImage, ProductController.update);
router.delete('/:id', rbacMiddleware(['products:view']), ProductController.destroy);

export { router as productRoutes };
