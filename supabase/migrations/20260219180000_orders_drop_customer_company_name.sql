-- Remove customer_name and company_name from orders.
-- Customer name comes from actors.name, company from customers.name (via actors.customer_id).

ALTER TABLE public.orders
  DROP COLUMN IF EXISTS customer_name,
  DROP COLUMN IF EXISTS company_name;
