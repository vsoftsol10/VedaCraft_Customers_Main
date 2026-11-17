-- Adds seller_code and temporary_password columns to seller_applications if not existing
ALTER TABLE public.seller_applications ADD COLUMN IF NOT EXISTS seller_code text;
ALTER TABLE public.seller_applications ADD COLUMN IF NOT EXISTS temporary_password text;

