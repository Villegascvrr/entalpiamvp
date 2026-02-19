-- Remove base_price from order_items. Unit price is the original price.

ALTER TABLE public.order_items
  DROP COLUMN IF EXISTS base_price;
