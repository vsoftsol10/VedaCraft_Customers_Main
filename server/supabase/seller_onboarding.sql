-- Run once in Supabase Dashboard > SQL Editor. This creates a PRIVATE document bucket.
create table if not exists public.seller_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text, business_name text, business_email text, pan_number text, gst_number text,
  store_name text, store_type text, city text, pincode text, store_description text,
  account_holder_name text, account_number text, ifsc_code text, bank_name text, branch_name text, account_type text,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
  current_step smallint not null default 1 check (current_step between 1 and 6),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.seller_applications enable row level security;
drop policy if exists "Seller owns application" on public.seller_applications;
create policy "Seller owns application" on public.seller_applications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.seller_documents (
  id uuid primary key default gen_random_uuid(),
  seller_application_id uuid not null references public.seller_applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null check (document_type in ('pan_card','business_registration','gst_certificate','mfc_certificate','bank_account_proof','supporting_document')),
  storage_path text not null unique, original_filename text not null, mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760), created_at timestamptz not null default now(),
  unique (seller_application_id, document_type)
);
alter table public.seller_documents enable row level security;
drop policy if exists "Seller owns documents" on public.seller_documents;
create policy "Seller owns documents" on public.seller_documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('seller-verification-documents', 'seller-verification-documents', false, 10485760, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Sellers upload own verification files" on storage.objects;
drop policy if exists "Sellers view own verification files" on storage.objects;
drop policy if exists "Sellers remove own verification files" on storage.objects;
create policy "Sellers upload own verification files" on storage.objects for insert to authenticated
  with check (bucket_id = 'seller-verification-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Sellers view own verification files" on storage.objects for select to authenticated
  using (bucket_id = 'seller-verification-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Sellers remove own verification files" on storage.objects for delete to authenticated
  using (bucket_id = 'seller-verification-documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- Never expose the service-role key in the browser. Use it only in a server/admin tool to review applications or create signed URLs.
