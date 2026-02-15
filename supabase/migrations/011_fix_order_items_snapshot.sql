-- 1. Backfill any NULL line_total values
UPDATE public.order_items
SET line_total = unit_price * quantity
WHERE line_total IS NULL;

-- 2. Enforce NOT NULL constraint on line_total
ALTER TABLE public.order_items
ALTER COLUMN line_total SET NOT NULL;

-- 3. Verify unit_price is NOT NULL (It should be already, but ensuring)
ALTER TABLE public.order_items
ALTER COLUMN unit_price SET NOT NULL;
