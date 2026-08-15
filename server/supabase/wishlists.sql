-- ============================================================
-- VedaCraft Wishlist Table
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.wishlists (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT wishlists_unique_user_product UNIQUE (user_id, product_id)
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'wishlists_product_id_fkey'
      AND conrelid = 'public.wishlists'::regclass
      AND pg_get_constraintdef(oid) NOT ILIKE '%REFERENCES products(id)%'
  ) THEN
    ALTER TABLE public.wishlists DROP CONSTRAINT wishlists_product_id_fkey;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'wishlists_product_id_fkey'
      AND conrelid = 'public.wishlists'::regclass
  ) THEN
    ALTER TABLE public.wishlists
      ADD CONSTRAINT wishlists_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
  END IF;
END $$;

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
