import * as productDetailService from '../services/productDetailService.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';

export const getProductDetail = async (req, res, next) => {
  try {
    const detail = await productDetailService.getProductDetail(req.params.id);

    if (!detail) {
      return sendError(res, 404, 'Product details not found');
    }

    return sendSuccess(res, detail, 'Product details retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const upsertProductDetail = async (req, res, next) => {
  try {
    const detail = await productDetailService.upsertProductDetail(req.params.id, req.body);
    return sendSuccess(res, detail, 'Product details saved successfully');
  } catch (error) {
    return next(error);
  }
};
