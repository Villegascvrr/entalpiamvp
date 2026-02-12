-- ═══════════════════════════════════════════════════════════════
-- ENTALPIA MVP — Seed Data
-- Migration 003: Demo environment
-- Applied as 3 sub-migrations via Supabase MCP:
--   seed_global_catalog, seed_tenant_and_actors, seed_demo_orders
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 1. GLOBAL CATALOG (no tenant_id)
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.product_categories (id, label, icon_key, description, image_url, detailed_text, sort_order) VALUES
('Refrigerantes',               'Refrigerantes',               'Thermometer', 'Refrigerantes legales (F-GAS 517/2014) con certificado ISO.', '/refrigerantes.png', 'Entalpia Europe solo suministra refrigerantes de fuentes legales...', 1),
('Cobre para refrigeración',    'Cobre para refrigeración',    'Layers',      'Tuberías de cobre aisladas y desnudas para montaje de sistemas frigoríficos.', '/cobre-official.png', NULL, 2),
('Ventilación y accesorios',    'Ventilación y accesorios',    'Wind',        'Soluciones de transporte de aire, rejillas y extractores industriales.', '/ventilacion-official.png', NULL, 3),
('Climatización y accesorios',  'Climatización y accesorios',  'Zap',         'Soportería, bombas y elementos de montaje para equipos de aire acondicionado.', '/climatizacion-official.png', NULL, 4);

-- 20 products (see full migration for complete INSERT)
-- ... (omitted for brevity, applied via MCP)

-- ─────────────────────────────────────────────────────────────
-- 2. DEMO TENANT + AUTH USERS + ACTORS
-- ─────────────────────────────────────────────────────────────

-- Tenant: Entalpia Demo (a0000000-...-0001)
-- Auth users + actors:
--   admin@entalpia-demo.com     → Antonio García   (admin)
--   comercial@entalpia-demo.com → María López      (commercial)
--   logistica@entalpia-demo.com → Carlos Ruiz      (logistics)
--   cliente@entalpia-demo.com   → Distribuidor Demo (customer)
-- Password for all: Demo2024!

-- ─────────────────────────────────────────────────────────────
-- 3. DEMO ORDERS
-- ─────────────────────────────────────────────────────────────

-- PED-2024-0146: pending_validation (10 min ago, 4 items, €4,250)
-- PED-2024-0145: confirmed          (2 days ago, 3 items, €3,820.50)
-- PED-2024-0144: preparing          (5 days ago, 3 items, €1,575)
-- Each with state_history entries + documents
