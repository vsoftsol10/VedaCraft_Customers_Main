import { AppError } from '../utils/apiResponse.js';

const SORT_FIELDS = new Set(['created_at', 'updated_at', 'price', 'name', 'quantity', 'status']);
const SORT_ORDERS = new Set(['asc', 'desc']);

const toPositiveInt = (value, fallback, max = 100) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toBoolean = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (['true', '1', 'yes'].includes(String(value).toLowerCase())) return true;
  if (['false', '0', 'no'].includes(String(value).toLowerCase())) return false;
  return undefined;
};

export const validateProductQuery = (req, _res, next) => {
  const {
    page,
    limit,
    minPrice,
    maxPrice,
    minRating,
    category,
    search,
    q,
    sortBy = 'created_at',
    sortOrder = 'desc',
    inStock,
    featured,
    status,
  } = req.query;

  const normalizedSortBy = String(sortBy);
  const normalizedSortOrder = String(sortOrder).toLowerCase();

  if (!SORT_FIELDS.has(normalizedSortBy)) {
    return next(new AppError('Invalid sortBy value', 400));
  }

  if (!SORT_ORDERS.has(normalizedSortOrder)) {
    return next(new AppError('Invalid sortOrder value', 400));
  }

  const filters = {
    page: toPositiveInt(page, 1, 10000),
    limit: toPositiveInt(limit, 20, 100),
    category: category ? String(category).trim() : undefined,
    search: search || q ? String(search || q).trim() : undefined,
    minPrice: toNumber(minPrice),
    maxPrice: toNumber(maxPrice),
    minRating: toNumber(minRating),
    inStock: toBoolean(inStock),
    featured: toBoolean(featured),
    status: status ? String(status).trim() : undefined,
    sortBy: normalizedSortBy,
    sortOrder: normalizedSortOrder,
  };

  if (
    (minPrice !== undefined && filters.minPrice === undefined) ||
    (maxPrice !== undefined && filters.maxPrice === undefined) ||
    (minRating !== undefined && filters.minRating === undefined)
  ) {
    return next(new AppError('Price and rating filters must be valid numbers', 400));
  }

  if (
    filters.minPrice !== undefined &&
    filters.maxPrice !== undefined &&
    filters.minPrice > filters.maxPrice
  ) {
    return next(new AppError('minPrice cannot be greater than maxPrice', 400));
  }
  req.productQuery = filters;
  return next();
};

export const validateProductId = (req, _res, next) => {
  const { id } = req.params;
  if (!id || String(id).trim().length === 0) {
    return next(new AppError('Product ID or slug is required', 400));
  }
  return next();
};
