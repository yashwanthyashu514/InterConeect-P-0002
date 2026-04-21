-- Allow authenticated users to create their own profile row
-- Needed for login-time upsert fallback in the app.

drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own"
on public.users
for insert
to authenticated
with check (id = auth.uid());

