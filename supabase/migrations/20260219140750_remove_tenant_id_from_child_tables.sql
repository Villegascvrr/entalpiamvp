-- Remove tenant_id from order_items, order_documents, order_state_history.
-- Tenant isolation is preserved via the parent table (orders); RLS will filter
-- through order_id -> orders.tenant_id.

-- ─────────────────────────────────────────────────────────────
-- 1. Drop existing RLS policies that reference tenant_id
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS order_items_select_tenant ON public.order_items;
DROP POLICY IF EXISTS order_items_insert_tenant ON public.order_items;
DROP POLICY IF EXISTS order_items_update_tenant ON public.order_items;

DROP POLICY IF EXISTS order_docs_select_tenant ON public.order_documents;
DROP POLICY IF EXISTS order_docs_insert_tenant ON public.order_documents;
DROP POLICY IF EXISTS order_docs_update_tenant ON public.order_documents;

DROP POLICY IF EXISTS state_history_select_tenant ON public.order_state_history;
DROP POLICY IF EXISTS state_history_insert_tenant ON public.order_state_history;

-- ─────────────────────────────────────────────────────────────
-- 2. Create new policies: filter via parent orders.tenant_id
-- ─────────────────────────────────────────────────────────────

-- ORDER_ITEMS: access only rows whose order belongs to my tenant
CREATE POLICY order_items_select_tenant ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM public.orders WHERE tenant_id = public.get_my_tenant_id())
  );

CREATE POLICY order_items_insert_tenant ON public.order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (SELECT id FROM public.orders WHERE tenant_id = public.get_my_tenant_id())
  );

CREATE POLICY order_items_update_tenant ON public.order_items
  FOR UPDATE
  TO authenticated
  USING (
    order_id IN (SELECT id FROM public.orders WHERE tenant_id = public.get_my_tenant_id())
  )
  WITH CHECK (
    order_id IN (SELECT id FROM public.orders WHERE tenant_id = public.get_my_tenant_id())
  );

-- ORDER_DOCUMENTS
CREATE POLICY order_docs_select_tenant ON public.order_documents
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM public.orders WHERE tenant_id = public.get_my_tenant_id())
  );

CREATE POLICY order_docs_insert_tenant ON public.order_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (SELECT id FROM public.orders WHERE tenant_id = public.get_my_tenant_id())
  );

CREATE POLICY order_docs_update_tenant ON public.order_documents
  FOR UPDATE
  TO authenticated
  USING (
    order_id IN (SELECT id FROM public.orders WHERE tenant_id = public.get_my_tenant_id())
  )
  WITH CHECK (
    order_id IN (SELECT id FROM public.orders WHERE tenant_id = public.get_my_tenant_id())
  );

-- ORDER_STATE_HISTORY
CREATE POLICY state_history_select_tenant ON public.order_state_history
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM public.orders WHERE tenant_id = public.get_my_tenant_id())
  );

CREATE POLICY state_history_insert_tenant ON public.order_state_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (SELECT id FROM public.orders WHERE tenant_id = public.get_my_tenant_id())
  );

-- ─────────────────────────────────────────────────────────────
-- 3. Drop tenant_id column (indexes on tenant_id are dropped automatically)
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.order_items DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.order_documents DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.order_state_history DROP COLUMN IF EXISTS tenant_id;
