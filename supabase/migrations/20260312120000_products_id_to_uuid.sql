-- Change products.id from text to uuid, preserving existing data.
-- order_items.product_id references products.id. We add a new uuid column to products,
-- backfill, add product_id_uuid to order_items and backfill, then switch references and drop the text ids.

-- 1. Add new uuid column to products and backfill unique values
ALTER TABLE public.products
  ADD COLUMN id_uuid uuid;

UPDATE public.products
SET id_uuid = gen_random_uuid();

ALTER TABLE public.products
  ALTER COLUMN id_uuid SET NOT NULL;

-- 2. Add new uuid column to order_items and point to new product uuids
ALTER TABLE public.order_items
  ADD COLUMN product_id_uuid uuid;

UPDATE public.order_items o
SET product_id_uuid = p.id_uuid
FROM public.products p
WHERE p.id = o.product_id;

-- 3. Drop foreign key from order_items to products
ALTER TABLE public.order_items
  DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- 4. In order_items: drop old product_id, rename new column
ALTER TABLE public.order_items
  DROP COLUMN product_id;

ALTER TABLE public.order_items
  RENAME COLUMN product_id_uuid TO product_id;

-- 5. In products: drop old PK and text id, make uuid the primary key
ALTER TABLE public.products
  DROP CONSTRAINT products_pkey;

ALTER TABLE public.products
  DROP COLUMN id;

ALTER TABLE public.products
  RENAME COLUMN id_uuid TO id;

ALTER TABLE public.products
  ADD CONSTRAINT products_pkey PRIMARY KEY (id);

-- 6. Re-add foreign key and index on order_items
ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id) WHERE (product_id IS NOT NULL);
