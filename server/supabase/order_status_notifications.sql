-- Notify the buyer whenever a seller changes an order status. This happens
-- at the database layer so it also covers seller-dashboard updates that do not
-- pass through the customer API.

CREATE OR REPLACE FUNCTION public.notify_customer_of_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  notification_title text;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  -- Guest/non-UUID orders have no authenticated customer notification feed.
  IF NEW.user_id IS NULL
     OR NEW.user_id::text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
    RETURN NEW;
  END IF;

  notification_title := CASE NEW.status
    WHEN 'Confirmed' THEN 'Order confirmed'
    WHEN 'Processing' THEN 'Order is being prepared'
    WHEN 'Shipped' THEN 'Order shipped'
    WHEN 'Out for Delivery' THEN 'Order out for delivery'
    WHEN 'Delivered' THEN 'Order delivered'
    WHEN 'Cancelled' THEN 'Order cancelled'
    WHEN 'Return Requested' THEN 'Return request received'
    WHEN 'Returned' THEN 'Return completed'
    ELSE 'Order status updated'
  END;

  INSERT INTO public.notifications (user_id, type, audience, title, message, order_id)
  VALUES (
    NEW.user_id::uuid,
    'order_status',
    'customer',
    notification_title,
    format('Your order status is now %s.', NEW.status),
    NEW.id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_customer_of_order_status_change ON public.orders;
CREATE TRIGGER notify_customer_of_order_status_change
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_customer_of_order_status_change();
