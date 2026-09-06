create policy "users can update own reactions"
on public.post_likes
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
