CREATE TABLE IF NOT EXISTS public.product_details (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id         BIGINT NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  subtitle           TEXT,
  full_description   TEXT,
  how_to_use         TEXT,
  core_instructions  TEXT,
  care_instructions  TEXT,
  materials          JSONB,
  ingredients        JSONB,
  highlights         JSONB,
  specifications     JSONB,
  dimensions         JSONB,
  shipping_info      JSONB,
  seo_title          TEXT,
  seo_description    TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE OR REPLACE FUNCTION public.set_product_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_details_set_updated_at ON public.product_details;
CREATE TRIGGER product_details_set_updated_at
  BEFORE UPDATE ON public.product_details
  FOR EACH ROW EXECUTE FUNCTION public.set_product_details_updated_at();

CREATE INDEX IF NOT EXISTS idx_product_details_product_id
  ON public.product_details (product_id);

CREATE INDEX IF NOT EXISTS idx_products_active_created
  ON public.products (is_active, created_at);

CREATE INDEX IF NOT EXISTS idx_products_active_featured
  ON public.products (is_active, is_featured);

CREATE INDEX IF NOT EXISTS idx_products_active_rating
  ON public.products (is_active, rating);

CREATE INDEX IF NOT EXISTS idx_products_image_path
  ON public.products (image_path);

ALTER TABLE public.product_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Product details are publicly readable." ON public.product_details;
CREATE POLICY "Product details are publicly readable."
ON public.product_details FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.products
    WHERE products.id = product_details.product_id
      AND products.is_active = TRUE
  )
);

GRANT SELECT ON public.product_details TO anon, authenticated;
GRANT ALL ON public.product_details TO service_role;
