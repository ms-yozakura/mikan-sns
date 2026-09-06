update public.post_likes
set reaction_type = 'like'
where reaction_type not in ('like', 'delicious');

alter table public.post_likes
  drop constraint if exists post_likes_reaction_type_check;

alter table public.post_likes
  add constraint post_likes_reaction_type_check
  check (reaction_type in ('like', 'delicious'));
