


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_my_actor_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT id
  FROM public.actors
  WHERE auth_user_id = auth.uid()
    AND is_active = true
  LIMIT 1;
$$;


ALTER FUNCTION "public"."get_my_actor_id"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_my_actor_id"() IS 'Returns the actor id for the currently authenticated user.';



CREATE OR REPLACE FUNCTION "public"."get_my_tenant_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT tenant_id
  FROM public.actors
  WHERE auth_user_id = auth.uid()
    AND is_active = true
  LIMIT 1;
$$;


ALTER FUNCTION "public"."get_my_tenant_id"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_my_tenant_id"() IS 'Returns the tenant_id for the currently authenticated user. Used by all RLS policies.';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."actors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "auth_user_id" "uuid",
    "role" "text" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "customer_id" "uuid",
    CONSTRAINT "actors_role_check" CHECK (("role" = ANY (ARRAY['customer'::"text", 'commercial'::"text", 'logistics'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."actors" OWNER TO "postgres";


COMMENT ON TABLE "public"."actors" IS 'Application users. Each actor belongs to a tenant and maps to an auth.users row.';



CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "province" "text",
    "cif" "text",
    "address" "text",
    "postal_city" "text",
    "contact_name" "text",
    "email" "text",
    "phone" "text",
    "sales_points" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "discount_tier_id" "uuid" NOT NULL
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."discount_tiers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "discount_percentage" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "discount_tiers_discount_percentage_check" CHECK ((("discount_percentage" >= (0)::numeric) AND ("discount_percentage" <= (1)::numeric)))
);


ALTER TABLE "public"."discount_tiers" OWNER TO "postgres";


COMMENT ON TABLE "public"."discount_tiers" IS 'Standardized discount tiers for customers.';



CREATE TABLE IF NOT EXISTS "public"."global_variables" (
    "key" "text" NOT NULL,
    "value" numeric NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."global_variables" OWNER TO "postgres";


COMMENT ON TABLE "public"."global_variables" IS 'Parameters and global configurations managed by admin (e.g., LME price). Tenant-scoped.';



CREATE TABLE IF NOT EXISTS "public"."lme_prices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "price" numeric NOT NULL,
    "date" "date" NOT NULL,
    "source" "text" DEFAULT 'manual'::"text" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lme_prices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "order_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "uploaded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "order_documents_type_check" CHECK (("type" = ANY (ARRAY['invoice'::"text", 'delivery_note'::"text", 'attachment'::"text", 'quote'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."order_documents" OWNER TO "postgres";


COMMENT ON TABLE "public"."order_documents" IS 'File attachments linked to orders: invoices, delivery notes, etc.';



CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "unit_price" numeric(12,2) NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "unit" "text" DEFAULT 'Ud'::"text" NOT NULL,
    "notes" "text",
    "is_custom" boolean DEFAULT false NOT NULL,
    "category" "text",
    "line_total" numeric(12,2) GENERATED ALWAYS AS (("unit_price" * ("quantity")::numeric)) STORED,
    "base_price" numeric,
    "discount_percentage" numeric DEFAULT '0'::numeric NOT NULL,
    CONSTRAINT "order_items_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."order_items" IS 'Line items within an order. Price is snapshot at order time.';



COMMENT ON COLUMN "public"."order_items"."unit_price" IS 'Frozen price at order creation. Does NOT update when product price changes.';



COMMENT ON COLUMN "public"."order_items"."line_total" IS 'Auto-computed: unit_price × quantity.';



CREATE TABLE IF NOT EXISTS "public"."order_state_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "order_id" "uuid" NOT NULL,
    "from_status" "text",
    "to_status" "text" NOT NULL,
    "changed_by" "uuid" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."order_state_history" OWNER TO "postgres";


COMMENT ON TABLE "public"."order_state_history" IS 'Immutable audit log of order status transitions.';



CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "reference" "text" NOT NULL,
    "actor_id" "uuid" NOT NULL,
    "customer_name" "text" DEFAULT ''::"text" NOT NULL,
    "company_name" "text" DEFAULT ''::"text" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "total" numeric(12,2) DEFAULT 0 NOT NULL,
    "notes" "text",
    "shipping_address" "text" NOT NULL,
    "shipping_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "orders_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'pending_validation'::"text", 'confirmed'::"text", 'preparing'::"text", 'shipped'::"text", 'delivered'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


COMMENT ON TABLE "public"."orders" IS 'Tenant-scoped orders. Status uses 7 canonical English keys.';



CREATE TABLE IF NOT EXISTS "public"."product_categories" (
    "id" "text" NOT NULL,
    "label" "text" NOT NULL,
    "icon_key" "text" DEFAULT 'Package'::"text" NOT NULL,
    "description" "text" DEFAULT ''::"text" NOT NULL,
    "image_url" "text",
    "detailed_text" "text",
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."product_categories" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_categories" IS 'Global product catalog categories. Not tenant-scoped.';



CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "text" NOT NULL,
    "category_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "price" numeric(12,2) DEFAULT 0 NOT NULL,
    "deprecated_stock" integer DEFAULT 0 NOT NULL,
    "unit" "text" DEFAULT 'Ud'::"text" NOT NULL,
    "specs" "text" DEFAULT ''::"text" NOT NULL,
    "image_url" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."products" OWNER TO "postgres";


COMMENT ON TABLE "public"."products" IS 'Global product catalog. Prices here are current list prices.';



CREATE TABLE IF NOT EXISTS "public"."tenants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tenants" OWNER TO "postgres";


COMMENT ON TABLE "public"."tenants" IS 'Root multitenancy table. Each customer organization is a tenant.';



ALTER TABLE ONLY "public"."actors"
    ADD CONSTRAINT "actors_auth_user_id_key" UNIQUE ("auth_user_id");



ALTER TABLE ONLY "public"."actors"
    ADD CONSTRAINT "actors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."discount_tiers"
    ADD CONSTRAINT "discount_tiers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."global_variables"
    ADD CONSTRAINT "global_variables_pkey" PRIMARY KEY ("key", "tenant_id");



ALTER TABLE ONLY "public"."lme_prices"
    ADD CONSTRAINT "lme_prices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lme_prices"
    ADD CONSTRAINT "lme_prices_tenant_id_date_key" UNIQUE ("tenant_id", "date");



ALTER TABLE ONLY "public"."order_documents"
    ADD CONSTRAINT "order_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_state_history"
    ADD CONSTRAINT "order_state_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_reference_key" UNIQUE ("reference");



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_slug_key" UNIQUE ("slug");



CREATE INDEX "idx_actors_auth" ON "public"."actors" USING "btree" ("auth_user_id") WHERE ("auth_user_id" IS NOT NULL);



CREATE INDEX "idx_actors_customer" ON "public"."actors" USING "btree" ("customer_id");



CREATE INDEX "idx_actors_email" ON "public"."actors" USING "btree" ("email");



CREATE INDEX "idx_actors_tenant" ON "public"."actors" USING "btree" ("tenant_id");



CREATE INDEX "idx_customers_discount_tier" ON "public"."customers" USING "btree" ("discount_tier_id");



CREATE INDEX "idx_order_docs_order" ON "public"."order_documents" USING "btree" ("order_id");



CREATE INDEX "idx_order_docs_tenant" ON "public"."order_documents" USING "btree" ("tenant_id");



CREATE INDEX "idx_order_items_order" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "idx_order_items_product" ON "public"."order_items" USING "btree" ("product_id") WHERE ("product_id" IS NOT NULL);



CREATE INDEX "idx_order_items_tenant" ON "public"."order_items" USING "btree" ("tenant_id");



CREATE INDEX "idx_orders_actor" ON "public"."orders" USING "btree" ("actor_id");



CREATE INDEX "idx_orders_created" ON "public"."orders" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("status");



CREATE INDEX "idx_orders_tenant" ON "public"."orders" USING "btree" ("tenant_id");



CREATE INDEX "idx_products_active" ON "public"."products" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_products_category" ON "public"."products" USING "btree" ("category_id");



CREATE INDEX "idx_state_history_order" ON "public"."order_state_history" USING "btree" ("order_id");



CREATE INDEX "idx_state_history_tenant" ON "public"."order_state_history" USING "btree" ("tenant_id");



CREATE INDEX "idx_state_history_time" ON "public"."order_state_history" USING "btree" ("created_at" DESC);



ALTER TABLE ONLY "public"."actors"
    ADD CONSTRAINT "actors_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."actors"
    ADD CONSTRAINT "actors_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."actors"
    ADD CONSTRAINT "actors_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_discount_tier_id_fkey" FOREIGN KEY ("discount_tier_id") REFERENCES "public"."discount_tiers"("id");



ALTER TABLE ONLY "public"."global_variables"
    ADD CONSTRAINT "global_variables_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_documents"
    ADD CONSTRAINT "order_documents_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_documents"
    ADD CONSTRAINT "order_documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_documents"
    ADD CONSTRAINT "order_documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."actors"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_state_history"
    ADD CONSTRAINT "order_state_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."actors"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_state_history"
    ADD CONSTRAINT "order_state_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_state_history"
    ADD CONSTRAINT "order_state_history_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE RESTRICT;



CREATE POLICY "Access for tenant" ON "public"."customers" TO "authenticated" USING ((("tenant_id" = ( SELECT ("actors"."tenant_id")::"text" AS "tenant_id"
   FROM "public"."actors"
  WHERE ("actors"."auth_user_id" = "auth"."uid"()))) OR (EXISTS ( SELECT 1
   FROM "public"."actors"
  WHERE (("actors"."auth_user_id" = "auth"."uid"()) AND ("actors"."role" = 'admin'::"text")))))) WITH CHECK ((("tenant_id" = ( SELECT ("actors"."tenant_id")::"text" AS "tenant_id"
   FROM "public"."actors"
  WHERE ("actors"."auth_user_id" = "auth"."uid"()))) OR (EXISTS ( SELECT 1
   FROM "public"."actors"
  WHERE (("actors"."auth_user_id" = "auth"."uid"()) AND ("actors"."role" = 'admin'::"text"))))));



CREATE POLICY "Enable insert access for admins of same tenant" ON "public"."global_variables" FOR INSERT WITH CHECK (("tenant_id" IN ( SELECT "actors"."tenant_id"
   FROM "public"."actors"
  WHERE (("actors"."auth_user_id" = "auth"."uid"()) AND ("actors"."role" = 'admin'::"text")))));



CREATE POLICY "Enable insert for users based on tenant_id" ON "public"."lme_prices" FOR INSERT WITH CHECK ((("tenant_id")::"text" = (((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'app_metadata'::"text"))::"jsonb" ->> 'tenant_id'::"text")));



CREATE POLICY "Enable read access for authenticated users" ON "public"."discount_tiers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for users based on tenant_id" ON "public"."lme_prices" FOR SELECT USING ((("tenant_id")::"text" = (((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'app_metadata'::"text"))::"jsonb" ->> 'tenant_id'::"text")));



CREATE POLICY "Enable read access for users of same tenant" ON "public"."global_variables" FOR SELECT USING (("tenant_id" IN ( SELECT "actors"."tenant_id"
   FROM "public"."actors"
  WHERE ("actors"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Enable update access for admins of same tenant" ON "public"."global_variables" FOR UPDATE USING (("tenant_id" IN ( SELECT "actors"."tenant_id"
   FROM "public"."actors"
  WHERE (("actors"."auth_user_id" = "auth"."uid"()) AND ("actors"."role" = 'admin'::"text")))));



CREATE POLICY "Enable update for users based on tenant_id" ON "public"."lme_prices" FOR UPDATE USING ((("tenant_id")::"text" = (((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'app_metadata'::"text"))::"jsonb" ->> 'tenant_id'::"text")));



ALTER TABLE "public"."actors" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "actors_insert_same_tenant" ON "public"."actors" FOR INSERT TO "authenticated" WITH CHECK (("tenant_id" = "public"."get_my_tenant_id"()));



CREATE POLICY "actors_select_own_row" ON "public"."actors" FOR SELECT TO "authenticated" USING (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "actors_select_same_tenant" ON "public"."actors" FOR SELECT TO "authenticated" USING (("tenant_id" = "public"."get_my_tenant_id"()));



CREATE POLICY "actors_update_same_tenant" ON "public"."actors" FOR UPDATE TO "authenticated" USING (("tenant_id" = "public"."get_my_tenant_id"())) WITH CHECK (("tenant_id" = "public"."get_my_tenant_id"()));



ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."discount_tiers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."global_variables" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lme_prices" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "order_docs_insert_tenant" ON "public"."order_documents" FOR INSERT TO "authenticated" WITH CHECK (("tenant_id" = "public"."get_my_tenant_id"()));



CREATE POLICY "order_docs_select_tenant" ON "public"."order_documents" FOR SELECT TO "authenticated" USING (("tenant_id" = "public"."get_my_tenant_id"()));



CREATE POLICY "order_docs_update_tenant" ON "public"."order_documents" FOR UPDATE TO "authenticated" USING (("tenant_id" = "public"."get_my_tenant_id"())) WITH CHECK (("tenant_id" = "public"."get_my_tenant_id"()));



ALTER TABLE "public"."order_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "order_items_insert_tenant" ON "public"."order_items" FOR INSERT TO "authenticated" WITH CHECK (("tenant_id" = "public"."get_my_tenant_id"()));



CREATE POLICY "order_items_select_tenant" ON "public"."order_items" FOR SELECT TO "authenticated" USING (("tenant_id" = "public"."get_my_tenant_id"()));



CREATE POLICY "order_items_update_tenant" ON "public"."order_items" FOR UPDATE TO "authenticated" USING (("tenant_id" = "public"."get_my_tenant_id"())) WITH CHECK (("tenant_id" = "public"."get_my_tenant_id"()));



ALTER TABLE "public"."order_state_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "orders_insert_tenant" ON "public"."orders" FOR INSERT TO "authenticated" WITH CHECK (("tenant_id" = "public"."get_my_tenant_id"()));



CREATE POLICY "orders_select_tenant" ON "public"."orders" FOR SELECT TO "authenticated" USING (("tenant_id" = "public"."get_my_tenant_id"()));



CREATE POLICY "orders_update_tenant" ON "public"."orders" FOR UPDATE TO "authenticated" USING (("tenant_id" = "public"."get_my_tenant_id"())) WITH CHECK (("tenant_id" = "public"."get_my_tenant_id"()));



CREATE POLICY "state_history_insert_tenant" ON "public"."order_state_history" FOR INSERT TO "authenticated" WITH CHECK (("tenant_id" = "public"."get_my_tenant_id"()));



CREATE POLICY "state_history_select_tenant" ON "public"."order_state_history" FOR SELECT TO "authenticated" USING (("tenant_id" = "public"."get_my_tenant_id"()));



ALTER TABLE "public"."tenants" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tenants_select_own" ON "public"."tenants" FOR SELECT TO "authenticated" USING (("id" = "public"."get_my_tenant_id"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_my_actor_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_actor_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_actor_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_tenant_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_tenant_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_tenant_id"() TO "service_role";


















GRANT ALL ON TABLE "public"."actors" TO "anon";
GRANT ALL ON TABLE "public"."actors" TO "authenticated";
GRANT ALL ON TABLE "public"."actors" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."discount_tiers" TO "anon";
GRANT ALL ON TABLE "public"."discount_tiers" TO "authenticated";
GRANT ALL ON TABLE "public"."discount_tiers" TO "service_role";



GRANT ALL ON TABLE "public"."global_variables" TO "anon";
GRANT ALL ON TABLE "public"."global_variables" TO "authenticated";
GRANT ALL ON TABLE "public"."global_variables" TO "service_role";



GRANT ALL ON TABLE "public"."lme_prices" TO "anon";
GRANT ALL ON TABLE "public"."lme_prices" TO "authenticated";
GRANT ALL ON TABLE "public"."lme_prices" TO "service_role";



GRANT ALL ON TABLE "public"."order_documents" TO "anon";
GRANT ALL ON TABLE "public"."order_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."order_documents" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."order_state_history" TO "anon";
GRANT ALL ON TABLE "public"."order_state_history" TO "authenticated";
GRANT ALL ON TABLE "public"."order_state_history" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."product_categories" TO "anon";
GRANT ALL ON TABLE "public"."product_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."product_categories" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."tenants" TO "anon";
GRANT ALL ON TABLE "public"."tenants" TO "authenticated";
GRANT ALL ON TABLE "public"."tenants" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


