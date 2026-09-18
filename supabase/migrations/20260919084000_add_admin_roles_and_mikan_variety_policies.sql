-- Add a simple user/admin role and protect citrus variety writes with RLS.
alter table public.users
  add column if not exists role text not null default 'user';

alter table public.users
  drop constraint if exists users_role_check;

alter table public.users
  add constraint users_role_check check (role in ('user', 'admin'));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "admins can insert mikan varieties" on public.mikan_varieties;
drop policy if exists "admins can update mikan varieties" on public.mikan_varieties;
drop policy if exists "admins can delete mikan varieties" on public.mikan_varieties;

create policy "admins can insert mikan varieties"
on public.mikan_varieties
for insert
to authenticated
with check (public.is_admin());

create policy "admins can update mikan varieties"
on public.mikan_varieties
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can delete mikan varieties"
on public.mikan_varieties
for delete
to authenticated
using (public.is_admin());

-- Prevent ordinary users from granting themselves administrator privileges.
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only administrators can change user roles';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_user_role_change on public.users;
create trigger prevent_user_role_change
before update on public.users
for each row
execute function public.prevent_role_change();
