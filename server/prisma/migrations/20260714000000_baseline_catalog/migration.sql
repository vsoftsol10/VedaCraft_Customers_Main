CREATE TABLE IF NOT EXISTS public.categories (
  id         BIGINT GENERATED ALWAYS AS IDENTITY CONSTRAINT categories_pkey PRIMARY KEY,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL CONSTRAINT categories_slug_key UNIQUE,
  image_url  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.products (
  id             BIGINT GENERATED ALWAYS AS IDENTITY CONSTRAINT products_pkey1 PRIMARY KEY,
  category_id    BIGINT NOT NULL CONSTRAINT products_category_id_fkey REFERENCES public.categories(id) ON DELETE RESTRICT,
  name           TEXT NOT NULL,
  slug           TEXT NOT NULL CONSTRAINT products_slug_key1 UNIQUE,
  description    TEXT,
  price          DECIMAL(10, 2) NOT NULL DEFAULT 0 CONSTRAINT products_price_check1 CHECK (price >= 0),
  discount_price DECIMAL(10, 2) CONSTRAINT products_discount_price_check1 CHECK (discount_price IS NULL OR discount_price >= 0),
  stock          INTEGER NOT NULL DEFAULT 0 CONSTRAINT products_stock_check1 CHECK (stock >= 0),
  rating         DECIMAL(3, 2) NOT NULL DEFAULT 0 CONSTRAINT products_rating_check1 CHECK (rating >= 0 AND rating <= 5),
  total_reviews  INTEGER NOT NULL DEFAULT 0 CONSTRAINT products_total_reviews_check1 CHECK (total_reviews >= 0),
  is_featured    BOOLEAN NOT NULL DEFAULT FALSE,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  image_url      TEXT,
  image_path     TEXT
);

CREATE INDEX IF NOT EXISTS idx_categories_slug
  ON public.categories (slug);

CREATE INDEX IF NOT EXISTS idx_products_category_id
  ON public.products (category_id);
