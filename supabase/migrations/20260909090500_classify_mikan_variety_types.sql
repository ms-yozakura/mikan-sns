alter table public.mikan_varieties
  add column if not exists variety_type text not null default 'cultivar';

alter table public.mikan_varieties
  drop constraint if exists mikan_varieties_variety_type_check;

alter table public.mikan_varieties
  add constraint mikan_varieties_variety_type_check
  check (variety_type in ('cultivar', 'intermediate', 'unknown'));

update public.mikan_varieties
set variety_type = 'unknown'
where is_visible = false;

update public.mikan_varieties
set variety_type = 'intermediate'
where name in (
  'E-647',
  'EnOwNo.21',
  'No.14',
  'No.1408',
  'No.2681',
  'T-378',
  '口之津37号',
  '興津46号'
);

create index if not exists mikan_varieties_type_name_idx
  on public.mikan_varieties(variety_type, name);
