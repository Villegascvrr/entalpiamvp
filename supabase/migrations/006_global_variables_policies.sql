-- ─────────────────────────────────────────────────────────────
-- RLS Policies
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.global_variables             ENABLE ROW LEVEL SECURITY;

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
