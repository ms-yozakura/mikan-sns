alter table public.notifications
  add column if not exists reaction_type text;

create or replace function private.notify_post_like()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient_id uuid;
begin
  if tg_op = 'DELETE' then
    delete from public.notifications
    where type = 'like'
      and actor_id = old.user_id
      and post_id = old.post_id
      and reaction_type = old.reaction_type;
    return old;
  end if;

  select user_id into recipient_id
  from public.posts
  where id = new.post_id;

  if recipient_id is not null
    and recipient_id <> new.user_id
    and not exists (
      select 1
      from public.notifications
      where type = 'like'
        and actor_id = new.user_id
        and post_id = new.post_id
        and reaction_type = new.reaction_type
    ) then
    insert into public.notifications (user_id, actor_id, type, post_id, reaction_type)
    values (recipient_id, new.user_id, 'like', new.post_id, new.reaction_type);
  end if;

  return new;
end;
$$;

revoke all on function private.notify_post_like() from public, anon, authenticated;
