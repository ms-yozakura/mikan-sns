create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (
    id,
    username,
    display_name
  )
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'display_name'
  )
  on conflict (id) do update
  set username = coalesce(excluded.username, public.users.username),
      display_name = coalesce(excluded.display_name, public.users.display_name);

  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

insert into public.users (id, username, display_name)
select
  au.id,
  au.raw_user_meta_data->>'username',
  au.raw_user_meta_data->>'display_name'
from auth.users au
where not exists (
  select 1
  from public.users u
  where u.id = au.id
)
  and nullif(au.raw_user_meta_data->>'username', '') is not null
  and nullif(au.raw_user_meta_data->>'display_name', '') is not null
on conflict (id) do nothing;

insert into public.profiles (user_id)
select u.id
from public.users u
where not exists (
  select 1
  from public.profiles p
  where p.user_id = u.id
)
on conflict (user_id) do nothing;
