-- Add RLS policies for products bucket in storage.objects

CREATE POLICY "allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

CREATE POLICY "allow authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'products');

CREATE POLICY "allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'products');

CREATE POLICY "allow public read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'products');
