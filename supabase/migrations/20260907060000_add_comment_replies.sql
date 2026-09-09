alter table public.comments
  add column if not exists parent_comment_id uuid;

alter table public.comments
  drop constraint if exists comments_parent_comment_id_fkey;

alter table public.comments
  add constraint comments_parent_comment_id_fkey
  foreign key (parent_comment_id)
  references public.comments(id)
  on delete set null;

create index if not exists comments_post_parent_created_idx
  on public.comments (post_id, parent_comment_id, created_at);

create or replace function private.validate_comment_parent()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  parent_post_id uuid;
begin
  if new.parent_comment_id is null then
    return new;
  end if;

  if new.parent_comment_id = new.id then
    raise exception 'A comment cannot reply to itself'
      using errcode = '23514';
  end if;

  select c.post_id
    into parent_post_id
  from public.comments as c
  where c.id = new.parent_comment_id;

  if not found then
    raise exception 'Parent comment does not exist'
      using errcode = '23503';
  end if;

  if parent_post_id is distinct from new.post_id then
    raise exception 'Parent comment must belong to the same post'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_comment_parent() from public, anon, authenticated;

drop trigger if exists validate_comment_parent_before_write on public.comments;
create trigger validate_comment_parent_before_write
before insert or update of parent_comment_id, post_id on public.comments
for each row execute function private.validate_comment_parent();

create or replace function private.notify_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient_id uuid;
  notification_type text;
begin
  if new.parent_comment_id is not null then
    select c.user_id
      into recipient_id
    from public.comments as c
    where c.id = new.parent_comment_id;

    notification_type := 'reply';
  else
    select p.user_id
      into recipient_id
    from public.posts as p
    where p.id = new.post_id;

    notification_type := 'comment';
  end if;

  if recipient_id is not null and recipient_id <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, post_id, comment_id)
    values (recipient_id, new.user_id, notification_type, new.post_id, new.id);
  end if;

  return new;
end;
$$;

revoke all on function private.notify_comment() from public, anon, authenticated;
