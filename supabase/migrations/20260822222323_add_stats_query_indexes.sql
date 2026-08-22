create index if not exists posts_public_created_at_idx
  on public.posts (created_at desc)
  where visibility = 'public';

create index if not exists post_mikans_post_id_idx
  on public.post_mikans (post_id);

create index if not exists post_mikans_variety_id_idx
  on public.post_mikans (variety_id);
