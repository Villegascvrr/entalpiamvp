-- Add RLS policies for product_details table

-- Policy to allow authenticated read access to product_details
CREATE POLICY "allow authenticated read product_details"
ON public.product_details
FOR SELECT
TO authenticated
USING (true);

-- Policy to allow authenticated insert access to product_details
CREATE POLICY "allow authenticated insert product_details"
ON public.product_details
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy to allow authenticated update access to product_details
CREATE POLICY "allow authenticated update product_details"
ON public.product_details
FOR UPDATE
TO authenticated
USING (true);

-- Policy to allow authenticated delete access to product_details
CREATE POLICY "allow authenticated delete product_details"
ON public.product_details
FOR DELETE
TO authenticated
USING (true);
