-- Add tenant_id, lot_size, and min_lots to products. All NOT NULL; ints default 1.

ALTER TABLE public.products
  ADD COLUMN tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  ADD COLUMN lot_size integer NOT NULL DEFAULT 1,
  ADD COLUMN min_lots integer NOT NULL DEFAULT 1;

-- Backfill tenant_id for existing rows (assign first tenant), then set NOT NULL
UPDATE public.products
SET tenant_id = (SELECT id FROM public.tenants ORDER BY created_at LIMIT 1)
WHERE tenant_id IS NULL;

ALTER TABLE public.products
  ALTER COLUMN tenant_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_tenant ON public.products(tenant_id);

COMMENT ON COLUMN public.products.tenant_id IS 'Tenant that owns or offers this product.';
COMMENT ON COLUMN public.products.lot_size IS 'Step size when buying (e.g. buy in multiples of this).';
COMMENT ON COLUMN public.products.min_lots IS 'Minimum purchase amount in lot units.';
