-- ─────────────────────────────────────────────────────────────
-- RLS Policies
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.discount_tiers             ENABLE ROW LEVEL SECURITY;

-- 1. SELECT: Authenticated users can read discount tiers
CREATE POLICY "Enable read access for authenticated users" ON public.discount_tiers
    FOR SELECT
    TO authenticated
    USING (true);

-- 2. BLOCK OTHERS: No policies for INSERT/UPDATE/DELETE implies they are blocked by default RLS deny-all.