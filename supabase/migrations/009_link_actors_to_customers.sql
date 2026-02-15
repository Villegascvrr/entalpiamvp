-- Add customer_id to actors table
ALTER TABLE public.actors 
ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_actors_customer ON public.actors(customer_id);

-- Link the demo 'customer' actor to the 'Distribuidor Demo' customer
-- explicit cast to text because customers.tenant_id is text and actors.tenant_id is uuid
UPDATE public.actors
SET customer_id = (
    SELECT id FROM public.customers 
    WHERE tenant_id = public.actors.tenant_id::text 
    LIMIT 1
)
WHERE role = 'customer' AND email = 'cliente@entalpia-demo.com';
