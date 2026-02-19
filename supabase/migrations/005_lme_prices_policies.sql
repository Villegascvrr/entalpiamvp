alter table lme_prices enable row level security;

-- Drop existing policies to ensure clean state or use DO blocks
do $$
begin
    if not exists (select 1 from pg_policies where tablename = 'lme_prices' and policyname = 'Enable read access for users based on tenant_id') then
        create policy "Enable read access for users based on tenant_id"
        on lme_prices for select
        using (
            tenant_id::text = ((current_setting('request.jwt.claims'::text, true)::jsonb ->> 'app_metadata'::text)::jsonb ->> 'tenant_id'::text)
        );
    end if;

    if not exists (select 1 from pg_policies where tablename = 'lme_prices' and policyname = 'Enable insert for users based on tenant_id') then
        create policy "Enable insert for users based on tenant_id"
        on lme_prices for insert
        with check (
            tenant_id::text = ((current_setting('request.jwt.claims'::text, true)::jsonb ->> 'app_metadata'::text)::jsonb ->> 'tenant_id'::text)
        );
    end if;

    if not exists (select 1 from pg_policies where tablename = 'lme_prices' and policyname = 'Enable update for users based on tenant_id') then
        create policy "Enable update for users based on tenant_id"
        on lme_prices for update
        using (
            tenant_id::text = ((current_setting('request.jwt.claims'::text, true)::jsonb ->> 'app_metadata'::text)::jsonb ->> 'tenant_id'::text)
        );
    end if;
end
$$;