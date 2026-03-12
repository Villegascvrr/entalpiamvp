
  create table "public"."assistance_requests" (
    "id" uuid not null default gen_random_uuid(),
    "tenant_id" uuid not null,
    "actor_id" uuid,
    "customer_id" uuid,
    "name" text not null,
    "phone" text,
    "email" text,
    "message" text not null,
    "status" text not null default 'NEW'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone
      );


alter table "public"."assistance_requests" enable row level security;

CREATE UNIQUE INDEX assistance_requests_pkey ON public.assistance_requests USING btree (id);

CREATE INDEX idx_assistance_requests_tenant_created ON public.assistance_requests USING btree (tenant_id, created_at DESC);

CREATE INDEX idx_assistance_requests_tenant_status ON public.assistance_requests USING btree (tenant_id, status);

alter table "public"."assistance_requests" add constraint "assistance_requests_pkey" PRIMARY KEY using index "assistance_requests_pkey";

alter table "public"."assistance_requests" add constraint "assistance_requests_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES public.actors(id) ON DELETE SET NULL not valid;

alter table "public"."assistance_requests" validate constraint "assistance_requests_actor_id_fkey";

alter table "public"."assistance_requests" add constraint "assistance_requests_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL not valid;

alter table "public"."assistance_requests" validate constraint "assistance_requests_customer_id_fkey";

alter table "public"."assistance_requests" add constraint "assistance_requests_status_check" CHECK ((status = ANY (ARRAY['NEW'::text, 'IN_PROGRESS'::text, 'CLOSED'::text]))) not valid;

alter table "public"."assistance_requests" validate constraint "assistance_requests_status_check";

alter table "public"."assistance_requests" add constraint "assistance_requests_tenant_id_fkey" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE not valid;

alter table "public"."assistance_requests" validate constraint "assistance_requests_tenant_id_fkey";

grant delete on table "public"."assistance_requests" to "anon";

grant insert on table "public"."assistance_requests" to "anon";

grant references on table "public"."assistance_requests" to "anon";

grant select on table "public"."assistance_requests" to "anon";

grant trigger on table "public"."assistance_requests" to "anon";

grant truncate on table "public"."assistance_requests" to "anon";

grant update on table "public"."assistance_requests" to "anon";

grant delete on table "public"."assistance_requests" to "authenticated";

grant insert on table "public"."assistance_requests" to "authenticated";

grant references on table "public"."assistance_requests" to "authenticated";

grant select on table "public"."assistance_requests" to "authenticated";

grant trigger on table "public"."assistance_requests" to "authenticated";

grant truncate on table "public"."assistance_requests" to "authenticated";

grant update on table "public"."assistance_requests" to "authenticated";

grant delete on table "public"."assistance_requests" to "service_role";

grant insert on table "public"."assistance_requests" to "service_role";

grant references on table "public"."assistance_requests" to "service_role";

grant select on table "public"."assistance_requests" to "service_role";

grant trigger on table "public"."assistance_requests" to "service_role";

grant truncate on table "public"."assistance_requests" to "service_role";

grant update on table "public"."assistance_requests" to "service_role";


  create policy "admins_commercial_can_select_own_tenant"
  on "public"."assistance_requests"
  as permissive
  for select
  to public
using ((tenant_id = public.get_my_tenant_id()));



  create policy "admins_commercial_can_update_own_tenant"
  on "public"."assistance_requests"
  as permissive
  for update
  to public
using ((tenant_id = public.get_my_tenant_id()));



  create policy "customers_can_insert_own_tenant"
  on "public"."assistance_requests"
  as permissive
  for insert
  to public
with check ((tenant_id = public.get_my_tenant_id()));



