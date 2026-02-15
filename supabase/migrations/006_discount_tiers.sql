-- ═══════════════════════════════════════════════════════════════
-- ENTALPIA MVP — Discount Tiers
-- Migration 006: Create discount_tiers table
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.discount_tiers (
    id                  uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    name                text            NOT NULL,
    discount_percentage numeric         NOT NULL CHECK (discount_percentage BETWEEN 0 AND 1),
    created_at          timestamptz     DEFAULT now()
);

COMMENT ON TABLE public.discount_tiers IS 'Standardized discount tiers for customers.';

ALTER TABLE public.discount_tiers ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- RLS Policies
-- ─────────────────────────────────────────────────────────────

-- 1. SELECT: Authenticated users can read discount tiers
CREATE POLICY "Enable read access for authenticated users" ON public.discount_tiers
    FOR SELECT
    TO authenticated
    USING (true);

-- 2. BLOCK OTHERS: No policies for INSERT/UPDATE/DELETE implies they are blocked by default RLS deny-all.

-- ─────────────────────────────────────────────────────────────
-- Seed Data
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.discount_tiers (name, discount_percentage)
VALUES
    ('T1 - Estándar', 0.00),
    ('T2 - Medio Volumen', 0.05),
    ('T3 - Alto Volumen', 0.10);
