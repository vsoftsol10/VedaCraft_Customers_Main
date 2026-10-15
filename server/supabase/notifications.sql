-- Separates seller dashboard events from customer storefront notifications.
-- Safe to run in the Supabase SQL Editor or through the deployment migration.

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT 'customer';

ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_audience_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_audience_check
  CHECK (audience IN ('customer', 'seller'));

-- Classify records created before the audience column existed.
UPDATE public.notifications
SET audience = 'seller'
WHERE type IN ('login', 'offer_active', 'offer_ended', 'offer_starts_tomorrow')
   OR title = 'New order received'
   OR message ILIKE '%seller account%';

UPDATE public.notifications
SET audience = 'customer'
WHERE audience IS NULL;

-- The seller dashboard may be deployed independently and may not yet send an
-- audience value. Classify its known notification shapes at the database edge
-- until it is updated to send audience = 'seller' explicitly.
CREATE OR REPLACE FUNCTION public.assign_notification_audience()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.type IN ('login', 'offer_active', 'offer_ended', 'offer_starts_tomorrow')
     OR NEW.title = 'New order received'
     OR NEW.message ILIKE '%seller account%' THEN
    NEW.audience := 'seller';
  ELSIF NEW.audience IS NULL OR btrim(NEW.audience) = '' THEN
    NEW.audience := 'customer';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assign_notification_audience_before_write ON public.notifications;
CREATE TRIGGER assign_notification_audience_before_write
BEFORE INSERT OR UPDATE OF type, title, message, audience ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.assign_notification_audience();

CREATE INDEX IF NOT EXISTS notifications_customer_feed_idx
  ON public.notifications (user_id, audience, created_at DESC);
