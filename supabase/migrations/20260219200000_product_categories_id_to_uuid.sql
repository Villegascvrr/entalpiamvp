-- Change product_categories.id from text to uuid, preserving existing data.
-- Current id values are category labels (text); products.category_id references them.
-- We add a new uuid column, backfill, then switch references and drop the text id.

-- 1. Add new uuid column to product_categories and backfill unique values
ALTER TABLE public.product_categories
  ADD COLUMN id_uuid uuid;

UPDATE public.product_categories
SET id_uuid = gen_random_uuid();

ALTER TABLE public.product_categories
  ALTER COLUMN id_uuid SET NOT NULL;

-- 2. Add new uuid column to products and point to new category uuids
ALTER TABLE public.products
  ADD COLUMN category_id_uuid uuid;

UPDATE public.products p
SET category_id_uuid = c.id_uuid
FROM public.product_categories c
WHERE c.id = p.category_id;

ALTER TABLE public.products
  ALTER COLUMN category_id_uuid SET NOT NULL;

-- 3. Drop foreign key from products to product_categories
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_category_id_fkey;

-- 4. In products: drop old category_id, rename new column
ALTER TABLE public.products
  DROP COLUMN category_id;

ALTER TABLE public.products
  RENAME COLUMN category_id_uuid TO category_id;

-- 5. In product_categories: drop old PK and text id, make uuid the primary key
ALTER TABLE public.product_categories
  DROP CONSTRAINT product_categories_pkey;

ALTER TABLE public.product_categories
  DROP COLUMN id;

ALTER TABLE public.product_categories
  RENAME COLUMN id_uuid TO id;

ALTER TABLE public.product_categories
  ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);

-- 6. Re-add foreign key and index
ALTER TABLE public.products
  ADD CONSTRAINT products_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES public.product_categories(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
