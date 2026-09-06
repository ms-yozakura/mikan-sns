create table public.favorite_mikans (
  user_id uuid not null references public.users(id) on delete cascade,
  variety_id uuid not null references public.mikan_varieties(id) on delete cascade,
  position smallint not null check (position between 1 and 3),
  created_at timestamptz not null default now(),
  primary key (user_id, position),
  unique (user_id, variety_id)
);

create index favorite_mikans_variety_id_idx on public.favorite_mikans(variety_id);

alter table public.favorite_mikans enable row level security;

grant select on table public.favorite_mikans to anon, authenticated;
grant insert, update, delete on table public.favorite_mikans to authenticated;

create policy "favorite mikans are viewable by everyone"
on public.favorite_mikans for select
to anon, authenticated
using (true);

create policy "users can insert own favorite mikans"
on public.favorite_mikans for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "users can update own favorite mikans"
on public.favorite_mikans for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "users can delete own favorite mikans"
on public.favorite_mikans for delete
to authenticated
using ((select auth.uid()) = user_id);
