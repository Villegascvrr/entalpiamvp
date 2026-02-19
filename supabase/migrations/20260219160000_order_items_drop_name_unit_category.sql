-- Remove name, unit and category from order_items.
-- That information is retrieved from products via product_id join.

ALTER TABLE public.order_items
  DROP COLUMN IF EXISTS name,
  DROP COLUMN IF EXISTS unit,
  DROP COLUMN IF EXISTS category;
