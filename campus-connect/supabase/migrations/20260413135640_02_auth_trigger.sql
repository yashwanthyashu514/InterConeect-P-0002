-- Create user profile row after Supabase Auth signup

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb;
  full_name text;
  user_email text;
begin
  meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  full_name := nullif(btrim(coalesce(meta->>'name', meta->>'full_name', '')), '');
  user_email := nullif(btrim(coalesce(meta->>'email', new.email, '')), '');

  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(full_name, split_part(coalesce(user_email, ''), '@', 1), 'Student'),
    coalesce(user_email, new.email),
    'student'::public.user_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

