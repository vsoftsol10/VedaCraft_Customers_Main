import { supabase } from '../config/supabase.js';
import { AppError } from '../utils/apiResponse.js';

const PRODUCT_COLUMNS = `
  id,
  category_id,
  name,
  slug,
  description,
  price,
  discount_price,
  stock,
  rating,
  total_reviews,
  is_featured,
  is_active,
  created_at,
  updated_at,
  image_url,
  image_path,
  category:categories!inner (
    id,
    name,
    slug
  ),
  detail:product_details (
    specifications
  )
`;

const toProductDto = (product) => {
  if (!product) return null;

  const imageUrl = product.image_url || product.image || '';
  const images = Array.isArray(product.images)
    ? product.images
    : imageUrl
    ? [imageUrl]
    : [];
  const detail = Array.isArray(product.detail) ? product.detail[0] : product.detail;
  const specifications = detail?.specifications || {};

  return {
    id: product.id,
    category_id: product.category_id,
    category: specifications.subcategory || product.category?.name || null,
    mainCategory: product.category?.name || null,
    category_slug: product.category?.slug || null,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price || 0),
    discount_price: product.discount_price === null ? null : Number(product.discount_price),
    stock: product.stock,
    rating: Number(product.rating || 0),
    total_reviews: product.total_reviews,
    is_featured: product.is_featured,
    is_active: product.is_active,
    image: imageUrl,
    images,
    specifications,
    created_at: product.created_at,
    updated_at: product.updated_at,
  };
};

const paginationMeta = ({ page, limit, count }) => {
  const totalPages = Math.ceil((count || 0) / limit);
  return {
    page,
    limit,
    total: count || 0,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

const getCategoryId = async (category) => {
  const value = String(category || '').trim();
  if (!value) return undefined;

  const { data: slugMatch, error: slugError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', value.toLowerCase())
    .limit(1)
    .maybeSingle();

  if (slugError) throw new AppError(slugError.message, 500);
  if (slugMatch?.id) return slugMatch.id;

  const { data: nameMatch, error: nameError } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', value)
    .limit(1)
    .maybeSingle();

  if (nameError) throw new AppError(nameError.message, 500);
  return nameMatch?.id;
};

const applyFilters = async (query, filters) => {
  let nextQuery = query.eq('is_active', true);

  if (filters.category) {
    const categoryId = await getCategoryId(filters.category);
    if (!categoryId) {
      return { query: nextQuery.eq('category_id', -1) };
    }
    nextQuery = nextQuery.eq('category_id', categoryId);
  }

  if (filters.search) {
    const term = filters.search.replaceAll('%', '').replaceAll(',', ' ').trim();
    if (term) {
      // Try to find a matching category by name or slug
      const { data: matchedCategories } = await supabase
        .from('categories')
        .select('id')
        .or(`name.ilike.%${term}%,slug.ilike.%${term}%`);

      const categoryIds = (matchedCategories || []).map(c => c.id);

      if (categoryIds.length > 0) {
        // Match product name/slug/description OR any matching category
        const categoryFilter = categoryIds.map(id => `category_id.eq.${id}`).join(',');
        nextQuery = nextQuery.or(
          `name.ilike.%${term}%,slug.ilike.%${term}%,description.ilike.%${term}%,${categoryFilter}`
        );
      } else {
        nextQuery = nextQuery.or(`name.ilike.%${term}%,slug.ilike.%${term}%,description.ilike.%${term}%`);
      }
    }
  }

  if (filters.minPrice !== undefined) {
    nextQuery = nextQuery.gte('price', filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    nextQuery = nextQuery.lte('price', filters.maxPrice);
  }

  if (filters.minRating !== undefined) {
    nextQuery = nextQuery.gte('rating', filters.minRating);
  }

  if (filters.inStock === true) {
    nextQuery = nextQuery.gt('stock', 0);
  } else if (filters.inStock === false) {
    nextQuery = nextQuery.eq('stock', 0);
  }

  if (filters.featured !== undefined) {
    nextQuery = nextQuery.eq('is_featured', filters.featured);
  }

  return { query: nextQuery };
};

export const getProducts = async (filters) => {
  const from = (filters.page - 1) * filters.limit;
  const to = from + filters.limit - 1;

  let query = supabase
    .from('products')
    .select(PRODUCT_COLUMNS, { count: 'exact' });

  const filtered = await applyFilters(query, filters);

  query = filtered.query
    .order(filters.sortBy, { ascending: filters.sortOrder === 'asc' })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) throw new AppError(error.message, 500);

  return {
    products: (data || []).map(toProductDto),
    meta: paginationMeta({ page: filters.page, limit: filters.limit, count }),
  };
};

export const getProductByIdOrSlug = async (idOrSlug) => {
  const value = String(idOrSlug).trim();
  const isNumericId = /^\d+$/.test(value);

  let query = supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('is_active', true)
    .limit(1);

  query = isNumericId ? query.eq('id', Number(value)) : query.eq('slug', value);

  const { data, error } = await query.maybeSingle();

  if (error) throw new AppError(error.message, 500);
  return toProductDto(data);
};

export const getProductsByCategory = async (category, filters) => {
  return getProducts({
    ...filters,
    category,
  });
};

export const searchProducts = async (search, filters) => {
  return getProducts({
    ...filters,
    search,
  });
};
