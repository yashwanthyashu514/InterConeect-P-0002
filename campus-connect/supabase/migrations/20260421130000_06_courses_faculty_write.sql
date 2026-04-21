-- Let faculty create and edit their own courses; admins can manage any course row.

drop policy if exists "courses_faculty_insert_own" on public.courses;
create policy "courses_faculty_insert_own"
on public.courses
for insert
to authenticated
with check (
  faculty_id = auth.uid()
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'faculty'::public.user_role
  )
);

drop policy if exists "courses_admin_insert" on public.courses;
create policy "courses_admin_insert"
on public.courses
for insert
to authenticated
with check (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'::public.user_role
  )
  and exists (
    select 1
    from public.users f
    where f.id = courses.faculty_id
  )
);

drop policy if exists "courses_faculty_update_own" on public.courses;
create policy "courses_faculty_update_own"
on public.courses
for update
to authenticated
using (
  faculty_id = auth.uid()
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'faculty'::public.user_role
  )
)
with check (faculty_id = auth.uid());

drop policy if exists "courses_admin_update" on public.courses;
create policy "courses_admin_update"
on public.courses
for update
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'::public.user_role
  )
)
with check (
  exists (
    select 1
    from public.users f
    where f.id = courses.faculty_id
  )
);
