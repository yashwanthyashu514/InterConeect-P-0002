-- Allow faculty to work with attendance sessions for their own courses.
-- Also add course read policies used by session policy checks.

-- COURSES
drop policy if exists "courses_faculty_select_own" on public.courses;
create policy "courses_faculty_select_own"
on public.courses
for select
to authenticated
using (faculty_id = auth.uid());

drop policy if exists "courses_student_select_enrolled" on public.courses;
create policy "courses_student_select_enrolled"
on public.courses
for select
to authenticated
using (
  exists (
    select 1
    from public.enrollments e
    where e.course_id = courses.id
      and e.student_id = auth.uid()
  )
);

-- ATTENDANCE SESSIONS
drop policy if exists "attendance_sessions_faculty_insert_own_courses" on public.attendance_sessions;
create policy "attendance_sessions_faculty_insert_own_courses"
on public.attendance_sessions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.courses c
    where c.id = attendance_sessions.course_id
      and c.faculty_id = auth.uid()
  )
);

drop policy if exists "attendance_sessions_faculty_select_own_courses" on public.attendance_sessions;
create policy "attendance_sessions_faculty_select_own_courses"
on public.attendance_sessions
for select
to authenticated
using (
  exists (
    select 1
    from public.courses c
    where c.id = attendance_sessions.course_id
      and c.faculty_id = auth.uid()
  )
);

drop policy if exists "attendance_sessions_faculty_update_own_courses" on public.attendance_sessions;
create policy "attendance_sessions_faculty_update_own_courses"
on public.attendance_sessions
for update
to authenticated
using (
  exists (
    select 1
    from public.courses c
    where c.id = attendance_sessions.course_id
      and c.faculty_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.courses c
    where c.id = attendance_sessions.course_id
      and c.faculty_id = auth.uid()
  )
);

