-- ═══════════════════════════════════════════════════════════════
-- ENTALPIA MVP — Customer Discount Relation
-- Migration 007: Link customers to discount_tiers
-- ═══════════════════════════════════════════════════════════════

-- 1. Add column as NULLable first to strictly follow safety procedure
ALTER TABLE public.customers
    ADD COLUMN IF NOT EXISTS discount_tier_id uuid REFERENCES public.discount_tiers(id);

-- 2. Update existing customers to 'T1 - Estándar'
-- (Using a subquery to find T1 dynamically)
UPDATE public.customers
SET discount_tier_id = (
    SELECT id FROM public.discount_tiers WHERE name = 'T1 - Estándar' LIMIT 1
)
WHERE discount_tier_id IS NULL;

-- 3. Enforce NOT NULL constraint
ALTER TABLE public.customers
    ALTER COLUMN discount_tier_id SET NOT NULL;

-- 4. Add index for performance
CREATE INDEX IF NOT EXISTS idx_customers_discount_tier ON public.customers(discount_tier_id);
