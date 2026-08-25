-- ============================================================
-- VedaCraft Wishlist Table
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.wishlists (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_slug TEXT,
  product_name TEXT,
  product_category TEXT,
  product_price NUMERIC(10, 2),
  product_image TEXT,
  product_rating NUMERIC(3, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT wishlists_unique_user_product UNIQUE (user_id, product_id)
);

DO $$
DECLARE
  current_product_id_type TEXT;
BEGIN
  SELECT data_type INTO current_product_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'wishlists'
    AND column_name = 'product_id';

  ALTER TABLE public.wishlists
    DROP CONSTRAINT IF EXISTS wishlists_product_id_fkey;

  IF current_product_id_type IS NOT NULL
     AND current_product_id_type <> 'text' THEN
    ALTER TABLE public.wishlists
      ALTER COLUMN product_id TYPE TEXT USING product_id::text;
  END IF;
END $$;

ALTER TABLE public.wishlists
  ADD COLUMN IF NOT EXISTS product_slug TEXT,
  ADD COLUMN IF NOT EXISTS product_name TEXT,
  ADD COLUMN IF NOT EXISTS product_category TEXT,
  ADD COLUMN IF NOT EXISTS product_price NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS product_image TEXT,
  ADD COLUMN IF NOT EXISTS product_rating NUMERIC(3, 2);

CREATE INDEX IF NOT EXISTS idx_wishlists_user_created
  ON public.wishlists (user_id, created_at DESC);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own wishlist" ON public.wishlists;
CREATE POLICY "Users can view own wishlist"
ON public.wishlists FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own wishlist" ON public.wishlists;
CREATE POLICY "Users can insert own wishlist"
ON public.wishlists FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own wishlist" ON public.wishlists;
CREATE POLICY "Users can delete own wishlist"
ON public.wishlists FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON public.wishlists TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.wishlists_id_seq TO authenticated;
GRANT ALL ON public.wishlists TO service_role;
