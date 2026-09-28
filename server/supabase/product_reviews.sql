-- Delivered-order reviews and their customer photos.
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id text not null,
  product_id text,
  product_name text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 1 and 1000),
  image_paths jsonb not null default '[]'::jsonb,
  image_urls jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, user_id)
);

create index if not exists idx_product_reviews_product_created
  on public.product_reviews (product_id, created_at desc);

alter table public.product_reviews enable row level security;
drop policy if exists "Customers read own reviews" on public.product_reviews;
create policy "Customers read own reviews" on public.product_reviews
  for select to authenticated
  using (user_id = auth.uid()::text);

-- Public review photos are intentionally readable with the review; uploads and
-- deletion remain restricted to the authenticated customer folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-images', 'review-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Customers upload own review images" on storage.objects;
drop policy if exists "Customers remove own review images" on storage.objects;
create policy "Customers upload own review images" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'review-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Customers remove own review images" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'review-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
