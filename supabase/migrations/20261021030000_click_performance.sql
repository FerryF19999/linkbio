create or replace function public.get_profile_click_performance(p_public_id text)
returns table (
  period text,
  period_start date,
  clicks bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with bounds as (
    select (now() at time zone 'Asia/Jakarta')::date as current_day
  ),
  buckets as (
    select
      'daily'::text as period,
      generate_series(current_day - 6, current_day, interval '1 day')::date as period_start
    from bounds

    union all

    select
      'weekly'::text,
      generate_series(
        date_trunc('week', current_day)::date - 7 * 7,
        date_trunc('week', current_day)::date,
        interval '1 week'
      )::date
    from bounds

    union all

    select
      'monthly'::text,
      generate_series(
        (date_trunc('month', current_day) - interval '11 months')::date,
        date_trunc('month', current_day)::date,
        interval '1 month'
      )::date
    from bounds
  ),
  click_events as (
    select
      (clicked_at at time zone 'Asia/Jakarta')::date as click_day
    from public.profile_clicks
    where public_id = p_public_id
      and is_bot = false
  ),
  click_counts as (
    select 'daily'::text as period, click_day as period_start, count(*)::bigint as clicks
    from click_events
    group by 1, 2

    union all

    select 'weekly'::text, date_trunc('week', click_day)::date, count(*)::bigint
    from click_events
    group by 1, 2

    union all

    select 'monthly'::text, date_trunc('month', click_day)::date, count(*)::bigint
    from click_events
    group by 1, 2
  )
  select
    buckets.period,
    buckets.period_start,
    coalesce(click_counts.clicks, 0)::bigint as clicks
  from buckets
  left join click_counts using (period, period_start)
  order by
    case buckets.period
      when 'daily' then 1
      when 'weekly' then 2
      else 3
    end,
    buckets.period_start;
$$;

revoke all on function public.get_profile_click_performance(text) from public, anon, authenticated;
grant execute on function public.get_profile_click_performance(text) to service_role;
