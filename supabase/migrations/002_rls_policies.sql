-- ═══════════════════════════════════════════════════════════════
-- ENTALPIA MVP — RLS Policies
-- Migration 002: Tenant isolation via Row Level Security
--
-- Strategy:
--   • Every tenant-scoped table gets RLS enabled
--   • SELECT/INSERT/UPDATE filtered by tenant_id resolved
--     from the actors table via auth.uid()
--   • Products & categories are GLOBAL (no RLS)
--   • No role-based restrictions yet — minimal correct isolation
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- Helper: get current actor's tenant_id from auth.uid()
-- Used in every policy USING clause.
-- ─────────────────────────────────────────────────────────────
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
-- 1️⃣  ENABLE RLS on tenant-scoped tables
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.actors              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_documents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_state_history ENABLE ROW LEVEL SECURITY;

-- Products & categories: explicitly NOT enabling RLS (global read)


-- ═══════════════════════════════════════════════════════════════
-- 2️⃣  ACTORS — Special case
--     • SELECT: own row + same tenant actors
--     • INSERT: same tenant only
--     • UPDATE: same tenant only
-- ═══════════════════════════════════════════════════════════════

-- SELECT: actors in my tenant
CREATE POLICY actors_select_same_tenant ON public.actors
  FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_my_tenant_id());

-- INSERT: only into my tenant
CREATE POLICY actors_insert_same_tenant ON public.actors
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = public.get_my_tenant_id());

-- UPDATE: only within my tenant
CREATE POLICY actors_update_same_tenant ON public.actors
  FOR UPDATE
  TO authenticated
  USING (tenant_id = public.get_my_tenant_id())
  WITH CHECK (tenant_id = public.get_my_tenant_id());


-- ═══════════════════════════════════════════════════════════════
-- 3️⃣  ORDERS — Tenant isolation
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
-- 4️⃣  ORDER_ITEMS — Tenant isolation
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
-- 5️⃣  ORDER_DOCUMENTS — Tenant isolation
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
-- 6️⃣  ORDER_STATE_HISTORY — Tenant isolation (read + insert only)
--     No UPDATE — history is immutable
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY state_history_select_tenant ON public.order_state_history
  FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_my_tenant_id());

CREATE POLICY state_history_insert_tenant ON public.order_state_history
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = public.get_my_tenant_id());

-- No UPDATE policy — audit log rows are immutable


-- ═══════════════════════════════════════════════════════════════
-- 7️⃣  TENANTS — Minimal self-read
--     Authenticated users can only see their own tenant row.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenants_select_own ON public.tenants
  FOR SELECT
  TO authenticated
  USING (id = public.get_my_tenant_id());


-- ═══════════════════════════════════════════════════════════════
-- END OF MIGRATION 002
-- Next steps:
--   - 003: Seed data (tenant, actors, categories, products)
--   - 004: Role-based restrictions (admin-only writes, etc.)
-- ═══════════════════════════════════════════════════════════════
