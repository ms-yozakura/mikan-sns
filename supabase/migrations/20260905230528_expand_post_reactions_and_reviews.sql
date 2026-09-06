alter table public.post_likes
  drop constraint if exists post_likes_user_id_post_id_key;

alter table public.post_likes
  drop constraint if exists post_likes_user_post_reaction_key;

alter table public.post_likes
  drop constraint if exists post_likes_reaction_type_check;

alter table public.post_likes
  add constraint post_likes_reaction_type_check
  check (reaction_type in ('like', 'delicious', 'mikan', 'shine'));

alter table public.post_likes
  add constraint post_likes_user_post_reaction_key
  unique (user_id, post_id, reaction_type);

alter table public.post_mikans
  add column if not exists short_comment varchar(20);

alter table public.post_mikans
  drop constraint if exists post_mikans_short_comment_length_check;

alter table public.post_mikans
  add constraint post_mikans_short_comment_length_check
  check (short_comment is null or char_length(short_comment) <= 20);

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
    if not exists (
      select 1
      from public.post_likes
      where post_id = old.post_id
        and user_id = old.user_id
    ) then
      delete from public.notifications
      where type = 'like'
        and actor_id = old.user_id
        and post_id = old.post_id;
    end if;
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
    ) then
    insert into public.notifications (user_id, actor_id, type, post_id)
    values (recipient_id, new.user_id, 'like', new.post_id);
  end if;

  return new;
end;
$$;

revoke all on function private.notify_post_like() from public, anon, authenticated;
