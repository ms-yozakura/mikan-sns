create schema if not exists private;

drop policy if exists "only actor can insert" on public.notifications;
revoke insert, delete on table public.notifications from anon, authenticated;

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
      and post_id = old.post_id;
    return old;
  end if;

  select user_id into recipient_id
  from public.posts
  where id = new.post_id;

  if recipient_id is not null and recipient_id <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, post_id)
    values (recipient_id, new.user_id, 'like', new.post_id);
  end if;

  return new;
end;
$$;

create or replace function private.notify_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient_id uuid;
begin
  select user_id into recipient_id
  from public.posts
  where id = new.post_id;

  if recipient_id is not null and recipient_id <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, post_id, comment_id)
    values (recipient_id, new.user_id, 'comment', new.post_id, new.id);
  end if;

  return new;
end;
$$;

create or replace function private.notify_follow()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    delete from public.notifications
    where type = 'follow'
      and actor_id = old.follower
      and user_id = old.follow;
    return old;
  end if;

  if new.follow is not null and new.follow <> new.follower then
    insert into public.notifications (user_id, actor_id, type)
    values (new.follow, new.follower, 'follow');
  end if;

  return new;
end;
$$;

revoke all on function private.notify_post_like() from public, anon, authenticated;
revoke all on function private.notify_comment() from public, anon, authenticated;
revoke all on function private.notify_follow() from public, anon, authenticated;

drop trigger if exists notify_post_like_change on public.post_likes;
create trigger notify_post_like_change
after insert or delete on public.post_likes
for each row execute function private.notify_post_like();

drop trigger if exists notify_comment_created on public.comments;
create trigger notify_comment_created
after insert on public.comments
for each row execute function private.notify_comment();

drop trigger if exists notify_follow_change on public.follows;
create trigger notify_follow_change
after insert or delete on public.follows
for each row execute function private.notify_follow();

