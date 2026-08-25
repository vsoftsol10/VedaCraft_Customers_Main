import { Router } from 'express';
import * as orderController from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, orderController.getOrders);
router.post('/', authenticate, orderController.createOrder);
router.patch('/:id/status', authenticate, orderController.updateOrderStatus);

export default router;
