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
  DROP POLICY IF EXISTS "Allow orders access for anon and authenticated users" ON public.orders;
END $$;

ALTER TABLE public.orders ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE public.orders ALTER COLUMN user_id SET DEFAULT 'guest';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at timestamptz;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status_history jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Existing orders do not have milestone timestamps. Preserve the current
-- status change time so their active timeline step is accurate immediately.
UPDATE public.orders
SET status_history = jsonb_build_array(jsonb_build_object('status', status, 'at', updated_at))
WHERE status_history = '[]'::jsonb;

-- Some existing deployments include this column with a hard-coded or
-- count-based default.  A sequence is atomic, so it remains unique even when
-- two checkout requests arrive at the same time.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number text;
CREATE SEQUENCE IF NOT EXISTS public.orders_order_number_seq;

DO $$
DECLARE
  highest_order_sequence bigint;
BEGIN
  SELECT COALESCE(MAX((substring(order_number FROM '([0-9]+)$'))::bigint), 0)
    INTO highest_order_sequence
    FROM public.orders
   WHERE order_number ~ '[0-9]+$';

  PERFORM setval(
    'public.orders_order_number_seq',
    GREATEST(highest_order_sequence, (SELECT last_value FROM public.orders_order_number_seq)),
    true
  );
END $$;

CREATE OR REPLACE FUNCTION public.assign_order_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_number IS NULL OR btrim(NEW.order_number) = '' THEN
    NEW.order_number :=
      'VC-' || to_char(COALESCE(NEW.created_at, now()), 'YYYYMMDD') || '-' ||
      lpad(nextval('public.orders_order_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

ALTER TABLE public.orders ALTER COLUMN order_number DROP DEFAULT;
DROP TRIGGER IF EXISTS assign_order_number_before_insert ON public.orders;
CREATE TRIGGER assign_order_number_before_insert
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.assign_order_number();

-- Remove any legacy order-number trigger. It can otherwise overwrite the
-- sequence value above with the duplicate value that caused checkout to fail.
DO $$
DECLARE
  legacy_trigger record;
BEGIN
  FOR legacy_trigger IN
    SELECT trigger_name
    FROM (
      SELECT t.tgname AS trigger_name, pg_get_functiondef(t.tgfoid) AS function_definition
      FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = 'orders'
        AND NOT t.tgisinternal
        AND t.tgname <> 'assign_order_number_before_insert'
    ) triggers
    WHERE function_definition ILIKE '%order_number%'
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS %I ON public.orders',
      legacy_trigger.trigger_name
    );
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_key
  ON public.orders (order_number);

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
