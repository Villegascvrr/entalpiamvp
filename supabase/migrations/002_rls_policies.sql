-- Helper: get current actor's tenant_id from auth.uid()
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT tenant_id
  FROM public.actors
  WHERE auth_user_id = auth.uid()
    AND is_active = true
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_my_tenant_id IS
  'Returns the tenant_id for the currently authenticated user. Used by all RLS policies.';

-- Helper: get current actor's id
CREATE OR REPLACE FUNCTION public.get_my_actor_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id
  FROM public.actors
  WHERE auth_user_id = auth.uid()
    AND is_active = true
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_my_actor_id IS
  'Returns the actor id for the currently authenticated user.';

-- ═══════════════════════════════════════════════════════════════
-- ENABLE RLS on tenant-scoped tables
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.customers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actors              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_documents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_state_history ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- TENANTS — self-read only
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY tenants_select_own ON public.tenants
  FOR SELECT
  TO authenticated
  USING (id = public.get_my_tenant_id());

-- ═══════════════════════════════════════════════════════════════
-- ACTORS — same tenant read, insert, update
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY actors_select_same_tenant ON public.actors
  FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_my_tenant_id());

CREATE POLICY actors_insert_same_tenant ON public.actors
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = public.get_my_tenant_id());

CREATE POLICY actors_update_same_tenant ON public.actors
  FOR UPDATE
  TO authenticated
  USING (tenant_id = public.get_my_tenant_id())
  WITH CHECK (tenant_id = public.get_my_tenant_id());

-- ═══════════════════════════════════════════════════════════════
-- ORDERS — tenant isolation
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY orders_select_tenant ON public.orders
  FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_my_tenant_id());

CREATE POLICY orders_insert_tenant ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = public.get_my_tenant_id());

CREATE POLICY orders_update_tenant ON public.orders
  FOR UPDATE
  TO authenticated
  USING (tenant_id = public.get_my_tenant_id())
  WITH CHECK (tenant_id = public.get_my_tenant_id());

-- ═══════════════════════════════════════════════════════════════
-- ORDER_ITEMS — tenant isolation
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY order_items_select_tenant ON public.order_items
  FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_my_tenant_id());

CREATE POLICY order_items_insert_tenant ON public.order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = public.get_my_tenant_id());

CREATE POLICY order_items_update_tenant ON public.order_items
  FOR UPDATE
  TO authenticated
  USING (tenant_id = public.get_my_tenant_id())
  WITH CHECK (tenant_id = public.get_my_tenant_id());

-- ═══════════════════════════════════════════════════════════════
-- ORDER_DOCUMENTS — tenant isolation
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY order_docs_select_tenant ON public.order_documents
  FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_my_tenant_id());

CREATE POLICY order_docs_insert_tenant ON public.order_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = public.get_my_tenant_id());

CREATE POLICY order_docs_update_tenant ON public.order_documents
  FOR UPDATE
  TO authenticated
  USING (tenant_id = public.get_my_tenant_id())
  WITH CHECK (tenant_id = public.get_my_tenant_id());

-- ═══════════════════════════════════════════════════════════════
-- ORDER_STATE_HISTORY — tenant isolation (read + insert only, immutable)
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY state_history_select_tenant ON public.order_state_history
  FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_my_tenant_id());

CREATE POLICY state_history_insert_tenant ON public.order_state_history
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = public.get_my_tenant_id());
