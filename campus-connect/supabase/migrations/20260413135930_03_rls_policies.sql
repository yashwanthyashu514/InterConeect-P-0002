-- RLS enablement (idempotent)
alter table if exists public.users enable row level security;
alter table if exists public.courses enable row level security;
alter table if exists public.enrollments enable row level security;
alter table if exists public.attendance_sessions enable row level security;
alter table if exists public.attendance_logs enable row level security;
alter table if exists public.appointments enable row level security;

-- USERS
drop policy if exists "users_read_all" on public.users;
create policy "users_read_all"
on public.users
for select
to authenticated
using (true);

drop policy if exists "users_update_own_or_admin" on public.users;
create policy "users_update_own_or_admin"
on public.users
for update
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1
    from public.users me
    where me.id = auth.uid()
      and me.role = 'admin'::public.user_role
  )
)
with check (
  id = auth.uid()
  or exists (
    select 1
    from public.users me
    where me.id = auth.uid()
      and me.role = 'admin'::public.user_role
  )
);

-- ATTENDANCE LOGS
drop policy if exists "attendance_logs_student_select_own" on public.attendance_logs;
create policy "attendance_logs_student_select_own"
on public.attendance_logs
for select
to authenticated
using (student_id = auth.uid());

drop policy if exists "attendance_logs_faculty_select_for_their_courses" on public.attendance_logs;
create policy "attendance_logs_faculty_select_for_their_courses"
on public.attendance_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.attendance_sessions s
    join public.courses c on c.id = s.course_id
    where s.id = attendance_logs.session_id
      and c.faculty_id = auth.uid()
  )
);

drop policy if exists "attendance_logs_faculty_insert_for_their_courses" on public.attendance_logs;
create policy "attendance_logs_faculty_insert_for_their_courses"
on public.attendance_logs
for insert
to authenticated
with check (
  exists (
    select 1
    from public.attendance_sessions s
    join public.courses c on c.id = s.course_id
    where s.id = attendance_logs.session_id
      and c.faculty_id = auth.uid()
  )
);

-- APPOINTMENTS
drop policy if exists "appointments_student_manage_own" on public.appointments;
create policy "appointments_student_manage_own"
on public.appointments
for all
to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid());

drop policy if exists "appointments_faculty_manage_their_appointments" on public.appointments;
create policy "appointments_faculty_manage_their_appointments"
on public.appointments
for all
to authenticated
using (faculty_id = auth.uid())
with check (faculty_id = auth.uid());

