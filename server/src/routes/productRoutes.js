import { Router } from 'express';
import * as productController from '../controllers/productController.js';
import * as productDetailController from '../controllers/productDetailController.js';
import * as productReviewController from '../controllers/productReviewController.js';
import * as storeController from '../controllers/storeController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  validateProductId,
  validateProductQuery,
} from '../validations/productValidation.js';

const router = Router();

router.get('/', validateProductQuery, productController.getProducts);
router.get('/search', validateProductQuery, productController.searchProducts);
router.get('/category/:category', validateProductQuery, productController.getProductsByCategory);
router.get('/:id/reviews', validateProductId, productReviewController.getProductReviews);
router.get('/:id/store', validateProductId, storeController.getProductStore);
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
