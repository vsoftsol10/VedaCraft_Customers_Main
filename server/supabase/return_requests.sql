-- Return requests table for order return/exchange flow.
-- Run this in the Supabase SQL editor before accepting return requests.

create table if not exists public.return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id text not null default 'guest',
  status text not null default 'Requested',
  reasons jsonb not null default '[]'::jsonb,
  reason text not null,
  return_method text not null default 'pickup',
  pickup_address jsonb,
  is_original_condition boolean not null default false,
  has_original_packaging boolean not null default false,
  issue_description text not null,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint return_requests_return_method_check
    check (return_method in ('pickup', 'dropoff'))
);

alter table public.return_requests
  add column if not exists reasons jsonb not null default '[]'::jsonb,
  add column if not exists reason text,
  add column if not exists return_method text not null default 'pickup',
  add column if not exists pickup_address jsonb,
  add column if not exists is_original_condition boolean not null default false,
  add column if not exists has_original_packaging boolean not null default false,
  add column if not exists issue_description text,
  add column if not exists items jsonb not null default '[]'::jsonb;

update public.return_requests
set reason = coalesce(reason, 'Return requested')
where reason is null;

update public.return_requests
set issue_description = coalesce(issue_description, '')
where issue_description is null;

alter table public.return_requests
  alter column reason set not null,
  alter column issue_description set not null;

alter table public.return_requests enable row level security;

do $$
begin
  drop policy if exists "Allow return request access for anon and authenticated users" on public.return_requests;
end $$;

create policy "Allow return request access for anon and authenticated users"
on public.return_requests
for all
to anon, authenticated
using (true)
with check (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.return_requests to anon, authenticated;

create index if not exists idx_return_requests_order
  on public.return_requests (order_id);

create index if not exists idx_return_requests_user_created
  on public.return_requests (user_id, created_at desc);
