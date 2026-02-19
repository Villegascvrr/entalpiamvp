-- Turn customers.tenant_id into a proper foreign key to tenants.
-- Currently it is text (legacy); tenants.id is uuid. Convert column type then add FK.

-- 1. Drop RLS policy first (Postgres cannot alter column type while it is used in a policy)
DROP POLICY IF EXISTS "Access for tenant" ON public.customers;

-- 2. Convert tenant_id from text to uuid (requires existing values to be valid uuid strings)
ALTER TABLE public.customers
  ALTER COLUMN tenant_id TYPE uuid USING tenant_id::uuid;

-- 3. Add foreign key to tenants
ALTER TABLE public.customers
  ADD CONSTRAINT customers_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- 4. Recreate RLS policy so it compares uuid to uuid
CREATE POLICY "Access for tenant" ON public.customers
  TO authenticated
  USING (
    tenant_id = public.get_my_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.actors
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    tenant_id = public.get_my_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.actors
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- Optional: index for tenant lookups (if not already present)
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON public.customers(tenant_id);
