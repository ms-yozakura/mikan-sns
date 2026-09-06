drop policy if exists "all can delete own post" on public.posts;
drop policy if exists "post authors can delete own posts" on public.posts;

create policy "post authors can delete own posts"
on public.posts
for delete
to authenticated
using ((select auth.uid()) = user_id);
