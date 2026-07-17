CREATE INDEX IF NOT EXISTS idx_products_active_created
  ON public.products (is_active, created_at);

CREATE INDEX IF NOT EXISTS idx_products_active_featured
  ON public.products (is_active, is_featured);

CREATE INDEX IF NOT EXISTS idx_products_active_rating
  ON public.products (is_active, rating);

CREATE INDEX IF NOT EXISTS idx_products_image_path
  ON public.products (image_path);
