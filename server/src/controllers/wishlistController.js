import { AppError, sendError, sendSuccess } from '../utils/apiResponse.js';
import * as wishlistService from '../services/wishlistService.js';

export const getWishlist = async (req, res) => {
  try {
    const wishlist = await wishlistService.getWishlist(req.user.id, req.accessToken);
    return sendSuccess(res, wishlist, 'Wishlist retrieved successfully');
  } catch (error) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return sendError(res, statusCode, error.message || 'Failed to fetch wishlist');
  }
};

export const toggleWishlistItem = async (req, res) => {
  try {
    const wishlist = await wishlistService.toggleItem(req.user.id, req.body, req.accessToken);
    return sendSuccess(res, wishlist, 'Wishlist updated');
  } catch (error) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return sendError(res, statusCode, error.message || 'Failed to update wishlist');
  }
};

export const removeWishlistItem = async (req, res) => {
  try {
    const wishlist = await wishlistService.removeItem(req.user.id, Number(req.params.id), req.accessToken);
    return sendSuccess(res, wishlist, 'Item removed from wishlist');
  } catch (error) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return sendError(res, statusCode, error.message || 'Failed to remove wishlist item');
  }
};
