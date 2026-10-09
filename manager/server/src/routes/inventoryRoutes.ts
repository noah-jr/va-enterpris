import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';
import { uploadProductImage } from '../lib/uploadProductImage';

const router = Router();

router.get('/', rbacMiddleware(['inventory:view']), InventoryController.getInventory);
router.post('/', rbacMiddleware(['inventory:create']), uploadProductImage, InventoryController.createItem);
router.patch('/:id/adjust', rbacMiddleware(['inventory:update']), InventoryController.adjustStock);
router.delete('/:id', rbacMiddleware(['inventory:delete']), InventoryController.deleteItem);

export { router as inventoryRoutes };
