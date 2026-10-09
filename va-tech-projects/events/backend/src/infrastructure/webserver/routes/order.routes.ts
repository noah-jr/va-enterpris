import { Router } from 'express';
import { OrderController } from '../../../adapters/controllers/OrderController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const orderController = new OrderController();

// Todas as rotas de encomendas requerem autenticação
router.use(authMiddleware);

router.post('/', (req, res) => orderController.create(req, res));
router.get('/my', (req, res) => orderController.getMyOrders(req, res));
router.get('/:id', (req, res) => orderController.getOrderDetails(req, res));

export default router;
