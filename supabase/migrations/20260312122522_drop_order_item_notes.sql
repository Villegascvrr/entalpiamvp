-- Remove notes column from public.order_items
ALTER TABLE public.order_items
DROP COLUMN IF EXISTS notes;
