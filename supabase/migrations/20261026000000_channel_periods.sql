create or replace function public.get_profile_channel_period(
  p_public_id text,
  p_start timestamptz,
  p_end timestamptz
)
returns table (date text, channel text, views bigint, clicks bigint)
language sql
stable
security definer
set search_path = public
as $$
  with events as (
    select viewed_at as occurred_at, source_channel, 1 as views, 0 as clicks
    from public.profile_views
    where public_id = p_public_id and is_bot = false
      and viewed_at >= p_start and viewed_at < p_end
    union all
    select clicked_at, source_channel, 0, 1
    from public.profile_clicks
    where public_id = p_public_id and is_bot = false
      and clicked_at >= p_start and clicked_at < p_end
  )
  select
    to_char(occurred_at at time zone 'Asia/Jakarta', 'YYYY-MM-DD') as date,
    case
      when source_channel in ('instagram', 'tiktok', 'youtube', 'facebook', 'x', 'threads', 'direct', 'other')
        then source_channel
      when source_channel is null then 'direct'
      else 'other'
    end as channel,
    sum(views)::bigint,
    sum(clicks)::bigint
  from events
  group by 1, 2
  order by 1 desc, 2;
$$;

revoke all on function public.get_profile_channel_period(text, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.get_profile_channel_period(text, timestamptz, timestamptz) to service_role;
