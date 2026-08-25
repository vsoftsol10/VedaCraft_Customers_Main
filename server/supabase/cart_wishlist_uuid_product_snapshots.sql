-- Allow cart and wishlist items to reference products from the external product catalog.
-- The product catalog now uses UUIDs in another Supabase project, so these tables
-- store the displayed product as a snapshot instead of using a local products FK.

ALTER TABLE IF EXISTS public.cart_items
  DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;

ALTER TABLE IF EXISTS public.wishlists
  DROP CONSTRAINT IF EXISTS wishlists_product_id_fkey;

ALTER TABLE IF EXISTS public.cart_items
  ALTER COLUMN product_id TYPE TEXT USING product_id::text;

ALTER TABLE IF EXISTS public.wishlists
  ALTER COLUMN product_id TYPE TEXT USING product_id::text;

ALTER TABLE IF EXISTS public.cart_items
  ADD COLUMN IF NOT EXISTS product_slug TEXT,
  ADD COLUMN IF NOT EXISTS product_name TEXT,
  ADD COLUMN IF NOT EXISTS product_category TEXT,
  ADD COLUMN IF NOT EXISTS product_price NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS product_image TEXT,
  ADD COLUMN IF NOT EXISTS product_rating NUMERIC(3, 2);

ALTER TABLE IF EXISTS public.wishlists
  ADD COLUMN IF NOT EXISTS product_slug TEXT,
  ADD COLUMN IF NOT EXISTS product_name TEXT,
  ADD COLUMN IF NOT EXISTS product_category TEXT,
  ADD COLUMN IF NOT EXISTS product_price NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS product_image TEXT,
  ADD COLUMN IF NOT EXISTS product_rating NUMERIC(3, 2);

CREATE INDEX IF NOT EXISTS idx_cart_items_product_id
  ON public.cart_items (product_id);

CREATE INDEX IF NOT EXISTS idx_wishlists_product_id
  ON public.wishlists (product_id);
