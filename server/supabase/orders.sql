-- Orders table for frontend Supabase persistence.
-- Run this in the Supabase SQL editor before placing orders.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'guest',
  status text not null default 'Placed',
  payment_method text not null default 'Cash on Delivery',
  total numeric(10,2) not null default 0,
  item_count integer not null default 0,
  product text not null default 'Vedha Craft Order',
  items jsonb not null default '[]'::jsonb,
  address jsonb,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = 'orders'
      AND constraint_name = 'orders_user_id_fkey'
  ) THEN
    ALTER TABLE public.orders DROP CONSTRAINT orders_user_id_fkey;
  END IF;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
  DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
  DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
END $$;

ALTER TABLE public.orders ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE public.orders ALTER COLUMN user_id SET DEFAULT 'guest';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow orders access for anon and authenticated users"
ON public.orders
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.orders TO anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_orders_user_created
  ON public.orders (user_id, created_at DESC);
