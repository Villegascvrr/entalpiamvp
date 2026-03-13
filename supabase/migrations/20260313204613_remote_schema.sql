drop policy "allow tenant admin delete product_details" on "public"."product_details";

drop policy "allow tenant admin insert product_details" on "public"."product_details";

drop policy "allow tenant admin update product_details" on "public"."product_details";


  create policy "allow authenticated delete product_details"
  on "public"."product_details"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "allow authenticated insert product_details"
  on "public"."product_details"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "allow authenticated update product_details"
  on "public"."product_details"
  as permissive
  for update
  to authenticated
using (true);



  create policy "product_details_public_read"
  on "public"."product_details"
  as permissive
  for select
  to anon, authenticated
using (true);


drop policy "allow tenant admin deletes" on "storage"."objects";

drop policy "allow tenant admin updates" on "storage"."objects";

drop policy "allow tenant admin uploads" on "storage"."objects";


  create policy "allow authenticated deletes"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'products'::text));



  create policy "allow authenticated updates"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'products'::text));



  create policy "allow authenticated uploads"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'products'::text));



