alter table "public"."customers" alter column "cif" set not null;

alter table "public"."customers" alter column "sales_points" drop default;

alter table "public"."customers" alter column "sales_points" set not null;


