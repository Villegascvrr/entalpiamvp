create table public.tenants (
  id uuid not null default gen_random_uuid (),
  slug text not null,
  name text not null,
  created_at timestamp with time zone not null default now(),
  constraint tenants_pkey primary key (id),
  constraint tenants_slug_key unique (slug)
) TABLESPACE pg_default;


create table public.discount_tiers (
  id uuid not null default gen_random_uuid (),
  name text not null,
  discount_percentage numeric not null,
  created_at timestamp with time zone null default now(),
  constraint discount_tiers_pkey primary key (id),
  constraint discount_tiers_discount_percentage_check check (
    (
      (discount_percentage >= (0)::numeric)
      and (discount_percentage <= (1)::numeric)
    )
  )
) TABLESPACE pg_default;


create table public.customers (
  id uuid not null default gen_random_uuid (),
  tenant_id text not null,
  name text not null,
  province text null,
  cif text null,
  address text null,
  postal_city text null,
  contact_name text null,
  email text null,
  phone text null,
  sales_points integer null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null,
  discount_tier_id uuid not null,
  constraint customers_pkey primary key (id),
  constraint customers_discount_tier_id_fkey foreign KEY (discount_tier_id) references discount_tiers (id)
) TABLESPACE pg_default;

create index IF not exists idx_customers_discount_tier on public.customers using btree (discount_tier_id) TABLESPACE pg_default;


create table public.actors (
  id uuid not null default gen_random_uuid (),
  tenant_id uuid not null,
  auth_user_id uuid null,
  role text not null,
  name text not null,
  email text not null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  customer_id uuid null,
  constraint actors_pkey primary key (id),
  constraint actors_auth_user_id_key unique (auth_user_id),
  constraint actors_auth_user_id_fkey foreign KEY (auth_user_id) references auth.users (id) on delete set null,
  constraint actors_customer_id_fkey foreign KEY (customer_id) references customers (id) on delete set null,
  constraint actors_tenant_id_fkey foreign KEY (tenant_id) references tenants (id) on delete CASCADE,
  constraint actors_role_check check (
    (
      role = any (
        array[
          'customer'::text,
          'commercial'::text,
          'logistics'::text,
          'admin'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_actors_tenant on public.actors using btree (tenant_id) TABLESPACE pg_default;

create index IF not exists idx_actors_auth on public.actors using btree (auth_user_id) TABLESPACE pg_default
where
  (auth_user_id is not null);

create index IF not exists idx_actors_email on public.actors using btree (email) TABLESPACE pg_default;

create index IF not exists idx_actors_customer on public.actors using btree (customer_id) TABLESPACE pg_default;


create table public.global_variables (
  key text not null,
  value numeric not null,
  tenant_id uuid not null,
  updated_at timestamp with time zone null default now(),
  constraint global_variables_pkey primary key (key, tenant_id),
  constraint global_variables_tenant_id_fkey foreign KEY (tenant_id) references tenants (id) on delete CASCADE
) TABLESPACE pg_default;


create table public.lme_prices (
  id uuid not null default gen_random_uuid (),
  tenant_id uuid not null,
  price numeric not null,
  date date not null,
  source text not null default 'manual'::text,
  created_by uuid null,
  created_at timestamp with time zone null default now(),
  constraint lme_prices_pkey primary key (id),
  constraint lme_prices_tenant_id_date_key unique (tenant_id, date)
) TABLESPACE pg_default;


create table public.product_categories (
  id text not null,
  label text not null,
  icon_key text not null default 'Package'::text,
  description text not null default ''::text,
  image_url text null,
  detailed_text text null,
  sort_order integer not null default 0,
  created_at timestamp with time zone not null default now(),
  constraint product_categories_pkey primary key (id)
) TABLESPACE pg_default;


create table public.products (
  id text not null,
  category_id text not null,
  name text not null,
  price numeric(12, 2) not null default 0,
  deprecated_stock integer not null default 0,
  unit text not null default 'Ud'::text,
  specs text not null default ''::text,
  image_url text null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint products_pkey primary key (id),
  constraint products_category_id_fkey foreign KEY (category_id) references product_categories (id) on delete RESTRICT
) TABLESPACE pg_default;

create index IF not exists idx_products_category on public.products using btree (category_id) TABLESPACE pg_default;

create index IF not exists idx_products_active on public.products using btree (is_active) TABLESPACE pg_default
where
  (is_active = true);


create table public.orders (
  id uuid not null default gen_random_uuid (),
  tenant_id uuid not null,
  reference text not null,
  actor_id uuid not null,
  customer_name text not null default ''::text,
  company_name text not null default ''::text,
  status text not null default 'draft'::text,
  total numeric(12, 2) not null default 0,
  notes text null,
  shipping_address text not null,
  shipping_date date null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint orders_pkey primary key (id),
  constraint orders_reference_key unique (reference),
  constraint orders_actor_id_fkey foreign KEY (actor_id) references actors (id) on delete RESTRICT,
  constraint orders_tenant_id_fkey foreign KEY (tenant_id) references tenants (id) on delete CASCADE,
  constraint orders_status_check check (
    (
      status = any (
        array[
          'draft'::text,
          'pending_validation'::text,
          'confirmed'::text,
          'preparing'::text,
          'shipped'::text,
          'delivered'::text,
          'cancelled'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_orders_tenant on public.orders using btree (tenant_id) TABLESPACE pg_default;

create index IF not exists idx_orders_actor on public.orders using btree (actor_id) TABLESPACE pg_default;

create index IF not exists idx_orders_status on public.orders using btree (status) TABLESPACE pg_default;

create index IF not exists idx_orders_created on public.orders using btree (created_at desc) TABLESPACE pg_default;



create table public.order_documents (
  id uuid not null default gen_random_uuid (),
  tenant_id uuid not null,
  order_id uuid not null,
  type text not null,
  file_name text not null,
  file_url text not null,
  uploaded_by uuid null,
  created_at timestamp with time zone not null default now(),
  constraint order_documents_pkey primary key (id),
  constraint order_documents_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE,
  constraint order_documents_tenant_id_fkey foreign KEY (tenant_id) references tenants (id) on delete CASCADE,
  constraint order_documents_uploaded_by_fkey foreign KEY (uploaded_by) references actors (id) on delete set null,
  constraint order_documents_type_check check (
    (
      type = any (
        array[
          'invoice'::text,
          'delivery_note'::text,
          'attachment'::text,
          'quote'::text,
          'other'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_order_docs_order on public.order_documents using btree (order_id) TABLESPACE pg_default;

create index IF not exists idx_order_docs_tenant on public.order_documents using btree (tenant_id) TABLESPACE pg_default;


create table public.order_items (
  id uuid not null default gen_random_uuid (),
  tenant_id uuid not null,
  order_id uuid not null,
  product_id text not null,
  name text not null,
  unit_price numeric(12, 2) not null,
  quantity integer not null default 1,
  unit text not null default 'Ud'::text,
  notes text null,
  is_custom boolean not null default false,
  category text null,
  line_total numeric(12, 2) GENERATED ALWAYS as ((unit_price * (quantity)::numeric)) STORED null,
  base_price numeric null,
  discount_percentage numeric not null default '0'::numeric,
  constraint order_items_pkey primary key (id),
  constraint order_items_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE,
  constraint order_items_product_id_fkey foreign KEY (product_id) references products (id) on delete set null,
  constraint order_items_tenant_id_fkey foreign KEY (tenant_id) references tenants (id) on delete CASCADE,
  constraint order_items_quantity_check check ((quantity > 0))
) TABLESPACE pg_default;

create index IF not exists idx_order_items_order on public.order_items using btree (order_id) TABLESPACE pg_default;

create index IF not exists idx_order_items_tenant on public.order_items using btree (tenant_id) TABLESPACE pg_default;

create index IF not exists idx_order_items_product on public.order_items using btree (product_id) TABLESPACE pg_default
where
  (product_id is not null);


create table public.order_state_history (
  id uuid not null default gen_random_uuid (),
  tenant_id uuid not null,
  order_id uuid not null,
  from_status text null,
  to_status text not null,
  changed_by uuid not null,
  notes text null,
  created_at timestamp with time zone not null default now(),
  constraint order_state_history_pkey primary key (id),
  constraint order_state_history_changed_by_fkey foreign KEY (changed_by) references actors (id) on delete set null,
  constraint order_state_history_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE,
  constraint order_state_history_tenant_id_fkey foreign KEY (tenant_id) references tenants (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_state_history_order on public.order_state_history using btree (order_id) TABLESPACE pg_default;

create index IF not exists idx_state_history_tenant on public.order_state_history using btree (tenant_id) TABLESPACE pg_default;

create index IF not exists idx_state_history_time on public.order_state_history using btree (created_at desc) TABLESPACE pg_default;
