import { Router } from 'express';
import * as productController from '../controllers/productController.js';
import * as productDetailController from '../controllers/productDetailController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  validateProductId,
  validateProductQuery,
} from '../validations/productValidation.js';

const router = Router();

router.get('/', validateProductQuery, productController.getProducts);
router.get('/search', validateProductQuery, productController.searchProducts);
router.get('/category/:category', validateProductQuery, productController.getProductsByCategory);
router.get('/:id/details', validateProductId, productDetailController.getProductDetail);
router.put(
  '/:id/details',
  authenticate,
  requireRole('admin'),
  validateProductId,
  productDetailController.upsertProductDetail
);
router.get('/:id', validateProductId, productController.getProductById);

export default router;
