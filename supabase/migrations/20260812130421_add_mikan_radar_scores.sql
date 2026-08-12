alter table public.post_mikans
  add column sweetness smallint,
  add column tartness smallint,
  add column umami smallint,
  add column juiciness smallint,
  add column thinness smallint,
  add column aroma smallint,
  add column texture smallint;

alter table public.post_mikans
  add constraint post_mikans_sweetness_range check (sweetness between 0 and 10),
  add constraint post_mikans_tartness_range check (tartness between 0 and 10),
  add constraint post_mikans_umami_range check (umami between 0 and 10),
  add constraint post_mikans_juiciness_range check (juiciness between 0 and 10),
  add constraint post_mikans_thinness_range check (thinness between 0 and 10),
  add constraint post_mikans_aroma_range check (aroma between 0 and 10),
  add constraint post_mikans_texture_range check (texture between 0 and 10),
  add constraint post_mikans_radar_all_or_none check (
    num_nonnulls(sweetness, tartness, umami, juiciness, thinness, aroma, texture) in (0, 7)
  );
