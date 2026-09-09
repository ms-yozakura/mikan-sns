alter table public.posts
  drop constraint if exists posts_user_id_fkey;

alter table public.posts
  add constraint posts_user_id_fkey
  foreign key (user_id)
  references public.users(id)
  on delete cascade;

alter table public.users
  add constraint users_id_auth_user_fkey
  foreign key (id)
  references auth.users(id)
  on delete cascade;
