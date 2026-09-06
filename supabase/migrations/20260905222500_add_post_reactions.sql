alter table public.post_likes
  add column if not exists reaction_type text not null default 'like';

alter table public.post_likes
  drop constraint if exists post_likes_reaction_type_check;

alter table public.post_likes
  add constraint post_likes_reaction_type_check
  check (reaction_type in ('like', 'delicious', 'want', 'best'));

create index if not exists post_likes_post_reaction_idx
  on public.post_likes (post_id, reaction_type);
