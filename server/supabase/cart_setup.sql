-- ============================================================
-- VedaCraft Cart Tables
-- Run this in Supabase Dashboard -> SQL Editor
-- Requires public.products(id) to exist.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.carts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'carts_user_id_key'
      AND conrelid = 'public.carts'::regclass
  ) THEN
    ALTER TABLE public.carts
      ADD CONSTRAINT carts_user_id_key UNIQUE (user_id);
  END IF;
END;
$$;

DO $$
DECLARE
  current_product_id_type TEXT;
BEGIN
  SELECT data_type INTO current_product_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'cart_items'
    AND column_name = 'product_id';

  IF current_product_id_type IS NOT NULL
     AND current_product_id_type <> 'bigint' THEN
    DROP TABLE public.cart_items;
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.cart_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id     UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id  BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT,
  product_price NUMERIC(10, 2),
  product_image TEXT,
  product_rating NUMERIC(3, 2),
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cart_items_product_id_fkey'
      AND conrelid = 'public.cart_items'::regclass
      AND pg_get_constraintdef(oid) NOT ILIKE '%REFERENCES products(id)%'
  ) THEN
    ALTER TABLE public.cart_items DROP CONSTRAINT cart_items_product_id_fkey;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cart_items_product_id_fkey'
      AND conrelid = 'public.cart_items'::regclass
  ) THEN
    ALTER TABLE public.cart_items
      ADD CONSTRAINT cart_items_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS product_name TEXT,
  ADD COLUMN IF NOT EXISTS product_price NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS product_image TEXT,
  ADD COLUMN IF NOT EXISTS product_rating NUMERIC(3, 2);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cart_items_cart_product_key'
      AND conrelid = 'public.cart_items'::regclass
  ) THEN
    ALTER TABLE public.cart_items
      ADD CONSTRAINT cart_items_cart_product_key UNIQUE (cart_id, product_id);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_cart_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS carts_set_updated_at ON public.carts;
CREATE TRIGGER carts_set_updated_at
  BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.set_cart_updated_at();

DROP TRIGGER IF EXISTS cart_items_set_updated_at ON public.cart_items;
CREATE TRIGGER cart_items_set_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.set_cart_updated_at();

CREATE INDEX IF NOT EXISTS idx_carts_user_id
  ON public.carts (user_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id
  ON public.cart_items (cart_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_product_id
  ON public.cart_items (product_id);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own cart." ON public.carts;
CREATE POLICY "Users can view their own cart."
ON public.carts FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own cart." ON public.carts;
CREATE POLICY "Users can create their own cart."
ON public.carts FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cart." ON public.carts;
CREATE POLICY "Users can update their own cart."
ON public.carts FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own cart." ON public.carts;
CREATE POLICY "Users can delete their own cart."
ON public.carts FOR DELETE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own cart items." ON public.cart_items;
CREATE POLICY "Users can view their own cart items."
ON public.cart_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert into their own cart." ON public.cart_items;
CREATE POLICY "Users can insert into their own cart."
ON public.cart_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update their own cart items." ON public.cart_items;
CREATE POLICY "Users can update their own cart items."
ON public.cart_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete from their own cart." ON public.cart_items;
CREATE POLICY "Users can delete from their own cart."
ON public.cart_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
  )
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.carts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
