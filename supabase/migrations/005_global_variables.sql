-- ═══════════════════════════════════════════════════════════════
-- ENTALPIA MVP — Global Variables
-- Migration 005: Store global variables like LME Copper Price
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.global_variables (
    key         text        NOT NULL,                -- e.g. 'lme_copper_eur'
    value       numeric     NOT NULL,
    tenant_id   uuid        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    updated_at  timestamptz DEFAULT now(),
    PRIMARY KEY (key, tenant_id)
);

COMMENT ON TABLE public.global_variables IS 'Parameters and global configurations managed by admin (e.g., LME price). Tenant-scoped.';

ALTER TABLE public.global_variables ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- RLS Policies
-- ─────────────────────────────────────────────────────────────

-- 1. SELECT: Users can read variables if they belong to the same tenant
CREATE POLICY "Enable read access for users of same tenant" ON public.global_variables
    FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM public.actors WHERE auth_user_id = auth.uid()
        )
    );

-- 2. UPDATE: Only admins can update variables for their tenant
CREATE POLICY "Enable update access for admins of same tenant" ON public.global_variables
    FOR UPDATE
    USING (
        tenant_id IN (
            SELECT tenant_id FROM public.actors WHERE auth_user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- 3. INSERT: Only admins can insert variables for their tenant
CREATE POLICY "Enable insert access for admins of same tenant" ON public.global_variables
    FOR INSERT
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM public.actors WHERE auth_user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ═══════════════════════════════════════════════════════════════
-- Seed Initial Data
-- ═══════════════════════════════════════════════════════════════

-- Insert default LME Copper Price for all existing tenants
INSERT INTO public.global_variables (key, value, tenant_id)
SELECT 'lme_copper_eur', 8.50, id
FROM public.tenants
ON CONFLICT (key, tenant_id) DO NOTHING;
