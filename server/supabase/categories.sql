-- ============================================================
-- VedaCraft Categories Table
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  image_url   TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Safe when the table was created by an earlier version of this script.
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE OR REPLACE FUNCTION public.set_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS categories_set_updated_at ON public.categories;
CREATE TRIGGER categories_set_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_categories_updated_at();

CREATE INDEX IF NOT EXISTS idx_categories_slug
  ON public.categories (slug);
CREATE INDEX IF NOT EXISTS idx_categories_visible
  ON public.categories (is_active, display_order);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are publicly readable." ON public.categories;
CREATE POLICY "Categories are publicly readable."
ON public.categories FOR SELECT
USING (true);

GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;

-- Add categories from Supabase Dashboard > Table Editor, or run statements like:
-- INSERT INTO public.categories (name, slug, image_url, display_order)
-- VALUES ('Eco', 'eco', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/category-images/eco.jpg', 1);
--
-- `image_url` must be a public URL. Create a separate public `category-images`
-- bucket for category thumbnails; do not use the private seller-document bucket.
