-- Tighten RLS policies for products bucket in storage.objects
-- Require the current user to be an admin of their tenant
-- (based on role = 'admin' in public.actors for auth.uid()).

-- Drop previous authenticated-only policies if they exist
DROP POLICY IF EXISTS "allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "allow authenticated deletes" ON storage.objects;

-- Allow only tenant admins to insert into products bucket
CREATE POLICY "allow tenant admin uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'products'
  AND EXISTS (
    SELECT 1
    FROM public.actors a
    WHERE a.auth_user_id = auth.uid()
      AND a.role = 'admin'
      AND a.is_active = true
  )
);

-- Allow only tenant admins to update objects in products bucket
CREATE POLICY "allow tenant admin updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'products'
  AND EXISTS (
    SELECT 1
    FROM public.actors a
    WHERE a.auth_user_id = auth.uid()
      AND a.role = 'admin'
      AND a.is_active = true
  )
)
WITH CHECK (
  bucket_id = 'products'
  AND EXISTS (
    SELECT 1
    FROM public.actors a
    WHERE a.auth_user_id = auth.uid()
      AND a.role = 'admin'
      AND a.is_active = true
  )
);

-- Allow only tenant admins to delete objects in products bucket
CREATE POLICY "allow tenant admin deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'products'
  AND EXISTS (
    SELECT 1
    FROM public.actors a
    WHERE a.auth_user_id = auth.uid()
      AND a.role = 'admin'
      AND a.is_active = true
  )
);

-- product_details: restrict insert/update/delete to tenant admins only

DROP POLICY IF EXISTS "allow authenticated insert product_details" ON public.product_details;
DROP POLICY IF EXISTS "allow authenticated update product_details" ON public.product_details;
DROP POLICY IF EXISTS "allow authenticated delete product_details" ON public.product_details;

CREATE POLICY "allow tenant admin insert product_details"
ON public.product_details
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.actors a
    WHERE a.auth_user_id = auth.uid()
      AND a.role = 'admin'
      AND a.is_active = true
  )
);

CREATE POLICY "allow tenant admin update product_details"
ON public.product_details
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.actors a
    WHERE a.auth_user_id = auth.uid()
      AND a.role = 'admin'
      AND a.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.actors a
    WHERE a.auth_user_id = auth.uid()
      AND a.role = 'admin'
      AND a.is_active = true
  )
);

CREATE POLICY "allow tenant admin delete product_details"
ON public.product_details
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.actors a
    WHERE a.auth_user_id = auth.uid()
      AND a.role = 'admin'
      AND a.is_active = true
  )
);
