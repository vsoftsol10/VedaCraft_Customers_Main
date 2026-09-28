-- Seller offers for every product surface (catalogue, cart, checkout and order snapshots).
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.seller_applications(id) on delete cascade,
  offer_name text not null,
  offer_description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  scope text not null check (scope in ('all_products', 'select_products')),
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date > start_date),
  check (discount_type <> 'percentage' or discount_value <= 100)
);

create index if not exists offers_seller_id_idx on public.offers (seller_id);
create index if not exists offers_seller_active_end_date_idx on public.offers (seller_id, is_active, end_date);

create table if not exists public.offer_products (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  product_id uuid not null references public.seller_products(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (offer_id, product_id)
);

create index if not exists offer_products_product_id_idx on public.offer_products (product_id);

-- The function is intentionally included so the supplied trigger works even
-- if a generic updated_at trigger is not already present in the database.
create or replace function public.set_offers_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists offers_set_updated_at on public.offers;
create trigger offers_set_updated_at before update on public.offers
for each row execute function public.set_offers_updated_at();
