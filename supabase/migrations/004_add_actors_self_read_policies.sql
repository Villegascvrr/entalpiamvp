-- Allow authenticated users to read their OWN actor row.
-- This breaks the circular dependency: get_my_tenant_id() queries actors,
-- but the existing RLS on actors calls get_my_tenant_id() — causing recursion.
-- This policy lets the initial actor lookup succeed by matching auth_user_id directly.

CREATE POLICY "actors_select_own_row"
  ON public.actors
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());
