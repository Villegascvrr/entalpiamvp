-- Add explicit price snapshot columns to order_items
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS base_price numeric,
ADD COLUMN IF NOT EXISTS discount_percentage numeric;

-- Ensure unit_price and line_total are numeric (they already should be, but good to double check or cast if needed in future)
-- Existing columns: unit_price, line_total, quantity are already there.
