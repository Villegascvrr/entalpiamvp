-- Enforce unique language per product
-- This guarantees we don't accidentally insert two 'es' translations for the same product id
ALTER TABLE public.product_details
ADD CONSTRAINT product_details_unique_language
UNIQUE (product_id, language);

-- Enforce code integrity on products
-- 'code' is critical because it's used to name files in Supabase Storage.
-- It must exist and must be unique across all products.
ALTER TABLE public.products
ALTER COLUMN code SET NOT NULL;

ALTER TABLE public.products
ADD CONSTRAINT products_code_unique
UNIQUE (code);
