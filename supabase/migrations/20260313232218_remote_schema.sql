alter table "public"."orders" add column "contact_email" text;

-- contact_name: add with default, set not null, drop default
alter table "public"."orders" add column "contact_name" text default '';
alter table "public"."orders" alter column "contact_name" set not null;
alter table "public"."orders" alter column "contact_name" drop default;

-- contact_phone
alter table "public"."orders" add column "contact_phone" text default '';
alter table "public"."orders" alter column "contact_phone" set not null;
alter table "public"."orders" alter column "contact_phone" drop default;

-- delivery_type
alter table "public"."orders" add column "delivery_type" text default '';
alter table "public"."orders" alter column "delivery_type" set not null;
alter table "public"."orders" alter column "delivery_type" drop default;

-- shipping_city
alter table "public"."orders" add column "shipping_city" text default '';
alter table "public"."orders" alter column "shipping_city" set not null;
alter table "public"."orders" alter column "shipping_city" drop default;

-- shipping_postal_code
alter table "public"."orders" add column "shipping_postal_code" text default '';
alter table "public"."orders" alter column "shipping_postal_code" set not null;
alter table "public"."orders" alter column "shipping_postal_code" drop default;

-- shipping_province
alter table "public"."orders" add column "shipping_province" text default '';
alter table "public"."orders" alter column "shipping_province" set not null;
alter table "public"."orders" alter column "shipping_province" drop default;

-- shipping_time_slot
alter table "public"."orders" add column "shipping_time_slot" text default '';
alter table "public"."orders" alter column "shipping_time_slot" set not null;
alter table "public"."orders" alter column "shipping_time_slot" drop default;
