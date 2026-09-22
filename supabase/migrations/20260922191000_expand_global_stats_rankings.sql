create or replace function public.get_global_stats()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with params as (
    select
      date_trunc('month', timezone('Asia/Tokyo', now())) as month_start_local,
      date_trunc('month', timezone('Asia/Tokyo', now())) + interval '1 month' as month_end_local
  ),
  bounds as (
    select
      month_start_local at time zone 'Asia/Tokyo' as month_start,
      month_end_local at time zone 'Asia/Tokyo' as month_end
    from params
  ),
  public_posts as (
    select posts.id, posts.user_id, posts.created_at
    from public.posts
    where posts.visibility = 'public'
  ),
  current_posts as (
    select public_posts.*
    from public_posts
    cross join bounds
    where public_posts.created_at >= bounds.month_start
      and public_posts.created_at < bounds.month_end
  ),
  current_mikans as (
    select
      current_posts.user_id,
      post_mikans.quantity,
      post_mikans.satisfaction,
      post_mikans.variety_id
    from public.post_mikans
    join current_posts on current_posts.id = post_mikans.post_id
  ),
  summary as (
    select
      coalesce((select sum(current_mikans.quantity) from current_mikans), 0)::bigint as monthly_count,
      (select count(*) from current_posts)::bigint as monthly_posts,
      (select count(distinct current_posts.user_id) from current_posts)::bigint as active_users,
      coalesce((select round(avg(current_mikans.satisfaction)::numeric, 2) from current_mikans), 0) as average_satisfaction
  ),
  ranking as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', ranked.id,
          'name', ranked.name,
          'count', ranked.quantity,
          'color', ranked.color,
          'shape', ranked.shape
        )
        order by ranked.quantity desc, ranked.name
      ),
      '[]'::jsonb
    ) as items
    from (
      select
        mikan_varieties.id,
        mikan_varieties.name,
        mikan_varieties.color,
        mikan_varieties.shape,
        sum(current_mikans.quantity)::bigint as quantity
      from current_mikans
      join public.mikan_varieties on mikan_varieties.id = current_mikans.variety_id
      group by mikan_varieties.id, mikan_varieties.name, mikan_varieties.color, mikan_varieties.shape
      order by quantity desc, mikan_varieties.name
      limit 5
    ) ranked
  ),
  user_ranking as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', ranked.id,
          'name', ranked.display_name,
          'count', ranked.quantity,
          'avatarUrl', ranked.avatar_url
        )
        order by ranked.quantity desc, ranked.display_name
      ),
      '[]'::jsonb
    ) as items
    from (
      select
        profiles.id,
        profiles.display_name,
        profiles.avatar_url,
        sum(current_mikans.quantity)::bigint as quantity
      from current_mikans
      join public.profiles on profiles.id = current_mikans.user_id
      group by profiles.id, profiles.display_name, profiles.avatar_url
      order by quantity desc, profiles.display_name
      limit 5
    ) ranked
  ),
  months as (
    select generate_series(
      (select month_start_local from params) - interval '5 months',
      (select month_start_local from params),
      interval '1 month'
    ) as month_start_local
  ),
  trend as (
    select jsonb_agg(
      jsonb_build_object(
        'key', to_char(months.month_start_local, 'YYYY-MM'),
        'label', (extract(month from months.month_start_local)::integer)::text || '月',
        'count', coalesce(monthly_counts.quantity, 0)
      )
      order by months.month_start_local
    ) as items
    from months
    left join lateral (
      select sum(post_mikans.quantity)::bigint as quantity
      from public_posts
      join public.post_mikans on post_mikans.post_id = public_posts.id
      where public_posts.created_at >= months.month_start_local at time zone 'Asia/Tokyo'
        and public_posts.created_at < (months.month_start_local + interval '1 month') at time zone 'Asia/Tokyo'
    ) monthly_counts on true
  )
  select jsonb_build_object(
    'periodLabel', (extract(month from (select month_start_local from params))::integer)::text || '月',
    'monthlyCount', summary.monthly_count,
    'monthlyPosts', summary.monthly_posts,
    'activeUsers', summary.active_users,
    'averageSatisfaction', summary.average_satisfaction,
    'ranking', ranking.items,
    'userRanking', user_ranking.items,
    'monthlyTrend', trend.items
  )
  from summary
  cross join ranking
  cross join user_ranking
  cross join trend;
$$;

revoke all on function public.get_global_stats() from public;
revoke all on function public.get_global_stats() from anon;
grant execute on function public.get_global_stats() to authenticated;
grant execute on function public.get_global_stats() to service_role;

comment on function public.get_global_stats() is
  'Returns public post activity, variety ranking with icon metadata, and user ranking for the current month plus a six-month trend in Asia/Tokyo.';
