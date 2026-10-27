create or replace function public.get_profile_link_channel_report(
  p_public_id text,
  p_start timestamptz default null,
  p_end timestamptz default null
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with events as (
    select *,
      case
        when source_channel in ('instagram', 'tiktok', 'youtube', 'facebook', 'x', 'threads', 'direct', 'other')
          then source_channel
        when source_channel is null then 'direct'
        else 'other'
      end as channel
    from public.profile_clicks
    where public_id = p_public_id and is_bot = false
      and (p_start is null or clicked_at >= p_start)
      and (p_end is null or clicked_at < p_end)
  ),
  channel_counts as (
    select link_type, link_id, channel, count(*)::bigint as clicks
    from events
    group by 1, 2, 3
  ),
  link_counts as (
    select link_type, link_id, count(*)::bigint as clicks,
      (array_agg(link_title order by clicked_at desc, id desc))[1] as title,
      (array_agg(target_url order by clicked_at desc, id desc))[1] as url
    from events
    group by 1, 2
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'linkId', l.link_id,
    'linkType', l.link_type,
    'title', l.title,
    'url', l.url,
    'clicks', l.clicks,
    'channels', (
      select jsonb_agg(jsonb_build_object('channel', c.channel, 'clicks', c.clicks)
        order by c.clicks desc, c.channel)
      from channel_counts c
      where c.link_type = l.link_type and c.link_id = l.link_id
    )
  ) order by l.clicks desc, l.link_type, l.link_id), '[]'::jsonb)
  from link_counts l;
$$;

revoke all on function public.get_profile_link_channel_report(text, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.get_profile_link_channel_report(text, timestamptz, timestamptz) to service_role;
