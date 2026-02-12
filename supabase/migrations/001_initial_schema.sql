-- ═══════════════════════════════════════════════════════════════
-- ENTALPIA MVP — Foundational Schema
-- Migration 001: Initial 8-table creation
-- Run in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 1️⃣  tenants
-- Root entity for multitenancy. Every tenant-scoped row
-- references this table.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tenants (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        text        NOT NULL UNIQUE,          -- e.g. 'tnt_entalpia_eu'
    name        text        NOT NULL,                 -- Display name
    created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tenants IS 'Root multitenancy table. Each customer organization is a tenant.';


-- ─────────────────────────────────────────────────────────────
-- 2️⃣  actors
-- Maps to frontend ActorSession.
-- Links to auth.users for Supabase Auth integration.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.actors (
    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     uuid        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    auth_user_id  uuid        UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,  -- nullable until Auth wired
    role          text        NOT NULL CHECK (role IN ('customer', 'commercial', 'logistics', 'admin')),
    name          text        NOT NULL,
    email         text        NOT NULL,
    is_active     boolean     NOT NULL DEFAULT true,
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_actors_tenant   ON public.actors(tenant_id);
CREATE INDEX idx_actors_auth     ON public.actors(auth_user_id) WHERE auth_user_id IS NOT NULL;
CREATE INDEX idx_actors_email    ON public.actors(email);

COMMENT ON TABLE public.actors IS 'Application users. Each actor belongs to a tenant and maps to an auth.users row.';


-- ─────────────────────────────────────────────────────────────
-- 3️⃣  product_categories  (GLOBAL — no tenant_id)
-- Maps to frontend Category type.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_categories (
    id            text        PRIMARY KEY,             -- e.g. 'Refrigerantes'
    label         text        NOT NULL,
    icon_key      text        NOT NULL DEFAULT 'Package',  -- Lucide icon name
    description   text        NOT NULL DEFAULT '',
    image_url     text,
    detailed_text text,
    sort_order    integer     NOT NULL DEFAULT 0,
    created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.product_categories IS 'Global product catalog categories. Not tenant-scoped.';


-- ─────────────────────────────────────────────────────────────
-- 4️⃣  products  (GLOBAL — no tenant_id)
-- Maps to frontend Product type.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
    id            text        PRIMARY KEY,             -- e.g. 'REF-R32-9' (SKU)
    category_id   text        NOT NULL REFERENCES public.product_categories(id) ON DELETE RESTRICT,
    name          text        NOT NULL,
    price         numeric(12,2) NOT NULL DEFAULT 0,    -- Current list price
    stock         integer     NOT NULL DEFAULT 0,
    unit          text        NOT NULL DEFAULT 'Ud',   -- e.g. 'Botella', 'm', 'Ud', 'Set'
    specs         text        NOT NULL DEFAULT '',
    image_url     text,
    is_active     boolean     NOT NULL DEFAULT true,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_active   ON public.products(is_active) WHERE is_active = true;

COMMENT ON TABLE public.products IS 'Global product catalog. Prices here are current list prices (not order snapshots).';


-- ─────────────────────────────────────────────────────────────
-- 5️⃣  orders
-- Maps to frontend Order type. Tenant-scoped.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
    id               uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        uuid          NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    reference        text          NOT NULL UNIQUE,   -- e.g. 'PED-2024-0145'
    actor_id         uuid          NOT NULL REFERENCES public.actors(id) ON DELETE RESTRICT,
    customer_name    text          NOT NULL DEFAULT '',
    company_name     text          NOT NULL DEFAULT '',
    status           text          NOT NULL DEFAULT 'draft'
                     CHECK (status IN (
                         'draft',
                         'pending_validation',
                         'confirmed',
                         'preparing',
                         'shipped',
                         'delivered',
                         'cancelled'
                     )),
    total            numeric(12,2) NOT NULL DEFAULT 0,
    notes            text,
    shipping_address text,
    shipping_date    date,
    created_at       timestamptz   NOT NULL DEFAULT now(),
    updated_at       timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_tenant   ON public.orders(tenant_id);
CREATE INDEX idx_orders_actor    ON public.orders(actor_id);
CREATE INDEX idx_orders_status   ON public.orders(status);
CREATE INDEX idx_orders_created  ON public.orders(created_at DESC);

COMMENT ON TABLE public.orders IS 'Tenant-scoped orders. Status uses 7 canonical English keys.';


-- ─────────────────────────────────────────────────────────────
-- 6️⃣  order_items
-- Maps to frontend OrderItem type.
-- Snapshots pricing at order time (not a live price reference).
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
    id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     uuid          NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    order_id      uuid          NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id    text          REFERENCES public.products(id) ON DELETE SET NULL,  -- nullable for custom items
    name          text          NOT NULL,              -- Snapshot of product name
    unit_price    numeric(12,2) NOT NULL,              -- SNAPSHOT — frozen at order time
    quantity      integer       NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit          text          NOT NULL DEFAULT 'Ud',
    notes         text,
    is_custom     boolean       NOT NULL DEFAULT false,
    category      text,                                -- Snapshot of category
    line_total    numeric(12,2) GENERATED ALWAYS AS (unit_price * quantity) STORED
);

CREATE INDEX idx_order_items_order    ON public.order_items(order_id);
CREATE INDEX idx_order_items_tenant   ON public.order_items(tenant_id);
CREATE INDEX idx_order_items_product  ON public.order_items(product_id) WHERE product_id IS NOT NULL;

COMMENT ON TABLE public.order_items IS 'Line items within an order. Price is snapshot at order time.';
COMMENT ON COLUMN public.order_items.unit_price IS 'Frozen price at order creation. Does NOT update when product price changes.';
COMMENT ON COLUMN public.order_items.line_total IS 'Auto-computed: unit_price × quantity.';


-- ─────────────────────────────────────────────────────────────
-- 7️⃣  order_documents
-- Attachments, invoices, delivery notes for an order.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_documents (
    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     uuid        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    order_id      uuid        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    type          text        NOT NULL CHECK (type IN ('invoice', 'delivery_note', 'attachment', 'quote', 'other')),
    file_name     text        NOT NULL,
    file_url      text        NOT NULL,              -- Supabase Storage URL
    uploaded_by   uuid        REFERENCES public.actors(id) ON DELETE SET NULL,
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_docs_order   ON public.order_documents(order_id);
CREATE INDEX idx_order_docs_tenant  ON public.order_documents(tenant_id);

COMMENT ON TABLE public.order_documents IS 'File attachments linked to orders: invoices, delivery notes, etc.';


-- ─────────────────────────────────────────────────────────────
-- 8️⃣  order_state_history
-- Audit trail for order lifecycle transitions.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_state_history (
    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     uuid        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    order_id      uuid        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    from_status   text,                               -- null on order creation
    to_status     text        NOT NULL,
    changed_by    uuid        REFERENCES public.actors(id) ON DELETE SET NULL,
    notes         text,
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_state_history_order   ON public.order_state_history(order_id);
CREATE INDEX idx_state_history_tenant  ON public.order_state_history(tenant_id);
CREATE INDEX idx_state_history_time    ON public.order_state_history(created_at DESC);

COMMENT ON TABLE public.order_state_history IS 'Immutable audit log of order status transitions.';


-- ═══════════════════════════════════════════════════════════════
-- END OF MIGRATION 001
-- Next steps:
--   - 002: Row Level Security (RLS) policies
--   - 003: Seed data (tenants, actors, categories, products)
-- ═══════════════════════════════════════════════════════════════
