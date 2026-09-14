-- Profiles table required by the authentication module.
-- Run this in the Supabase SQL editor before using profile sync endpoints.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  provider text not null default 'email',
  is_profile_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Size-profile fields used to personalise fashion product recommendations.
-- `if not exists` keeps this safe for databases where the fields were added earlier.
alter table public.profiles add column if not exists gender text;
alter table public.profiles add column if not exists top_size text;
alter table public.profiles add column if not exists bottom_size text;
alter table public.profiles add column if not exists measurement_unit text default 'in'
  check (measurement_unit in ('in', 'cm'));
alter table public.profiles add column if not exists shoulder numeric;
alter table public.profiles add column if not exists chest numeric;
alter table public.profiles add column if not exists waist numeric;
alter table public.profiles add column if not exists hips numeric;

alter table public.profiles enable row level security;

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
