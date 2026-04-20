create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type public.user_role as enum ('student', 'faculty', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.attendance_status as enum ('present', 'absent');
exception
  when duplicate_object then null;
end $$;

-- 1) users
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  role public.user_role not null,
  department text,
  created_at timestamptz not null default now()
);

-- 2) courses
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  faculty_id uuid not null references public.users (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists courses_faculty_id_idx on public.courses (faculty_id);

-- 3) enrollments
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (course_id, student_id)
);

create index if not exists enrollments_course_id_idx on public.enrollments (course_id);
create index if not exists enrollments_student_id_idx on public.enrollments (student_id);

-- 4) attendance_sessions
create table if not exists public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  date date not null,
  qr_token_secret text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists attendance_sessions_course_id_idx on public.attendance_sessions (course_id);
create index if not exists attendance_sessions_date_idx on public.attendance_sessions (date);

-- 5) attendance_logs
create table if not exists public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.attendance_sessions (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  status public.attendance_status not null,
  marked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (session_id, student_id)
);

create index if not exists attendance_logs_session_id_idx on public.attendance_logs (session_id);
create index if not exists attendance_logs_student_id_idx on public.attendance_logs (student_id);

-- 6) appointments
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users (id) on delete cascade,
  faculty_id uuid not null references public.users (id) on delete cascade,
  scheduled_time timestamptz not null,
  status text not null default 'scheduled',
  created_at timestamptz not null default now()
);

create index if not exists appointments_student_id_idx on public.appointments (student_id);
create index if not exists appointments_faculty_id_idx on public.appointments (faculty_id);
create index if not exists appointments_scheduled_time_idx on public.appointments (scheduled_time);

-- RLS (policies intentionally not included here)
alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.appointments enable row level security;
