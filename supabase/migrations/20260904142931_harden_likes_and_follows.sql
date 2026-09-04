alter table public.post_likes enable row level security;
alter table public.follows enable row level security;

alter table public.post_likes
  alter column user_id set not null,
  alter column post_id set not null;

alter table public.follows
  alter column follower drop default,
  alter column follow drop default,
  alter column follower set not null,
  alter column follow set not null;

alter table public.follows
  add constraint follows_follower_follow_key unique (follower, follow),
  add constraint follows_no_self_follow check (follower <> follow);

create index if not exists post_likes_post_id_idx
  on public.post_likes (post_id);

create index if not exists follows_follow_idx
  on public.follows (follow);

drop policy if exists "auth can delete own like" on public.post_likes;
drop policy if exists "auth can insert own like" on public.post_likes;
drop policy if exists "auth can update own like" on public.post_likes;
drop policy if exists "public can select likes" on public.post_likes;

create policy "authenticated can select likes"
  on public.post_likes
  for select
  to authenticated
  using (true);

create policy "users can like as themselves"
  on public.post_likes
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "users can remove own likes"
  on public.post_likes
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "able to add own follow" on public.follows;
drop policy if exists "able to delete own follow" on public.follows;
drop policy if exists "able to update own follow" on public.follows;
drop policy if exists "authenticated can select" on public.follows;

create policy "authenticated can select follows"
  on public.follows
  for select
  to authenticated
  using (true);

create policy "users can follow as themselves"
  on public.follows
  for insert
  to authenticated
  with check (
    (select auth.uid()) = follower
    and follower <> follow
  );

create policy "users can remove own follows"
  on public.follows
  for delete
  to authenticated
  using ((select auth.uid()) = follower);

grant select, insert, delete on table public.post_likes to authenticated;
grant select, insert, delete on table public.follows to authenticated;
revoke update on table public.post_likes from authenticated;
revoke update on table public.follows from authenticated;
