alter table public.mikan_varieties
  drop constraint if exists mikan_varieties_variety_type_check;

alter table public.mikan_varieties
  add constraint mikan_varieties_variety_type_check
  check (variety_type in ('cultivar', 'intermediate', 'unknown', 'brand'));

alter table public.mikan_varieties
  drop constraint if exists mikan_varieties_brand_parent_check;

alter table public.mikan_varieties
  add constraint mikan_varieties_brand_parent_check
  check (
    variety_type <> 'brand'
    or (parent1_id is not null and parent2_id is null)
  );
