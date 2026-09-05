drop policy if exists "auth can select own notification" on public.notifications;
create policy "auth can select own notification"
on public.notifications
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "auth can update own notification" on public.notifications;
create policy "auth can update own notification"
on public.notifications
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists notifications_actor_id_idx
on public.notifications (actor_id);

create index if not exists notifications_comment_id_idx
on public.notifications (comment_id)
where comment_id is not null;

create index if not exists notifications_post_id_idx
on public.notifications (post_id)
where post_id is not null;
