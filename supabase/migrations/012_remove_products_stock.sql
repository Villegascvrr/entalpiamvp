-- Remove stock column from products table
ALTER TABLE public.products DROP COLUMN IF EXISTS stock;
