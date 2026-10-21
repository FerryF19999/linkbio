create or replace function public.get_profile_channel_analytics(p_public_id text)
returns table (
  channel text,
  views bigint,
  clicks bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with channel_list(channel) as (
    values
      ('instagram'::text),
      ('tiktok'::text),
      ('youtube'::text),
      ('facebook'::text),
      ('x'::text),
      ('threads'::text),
      ('direct'::text),
      ('other'::text)
  ),
  view_counts as (
    select
      case
        when source_channel in ('instagram', 'tiktok', 'youtube', 'facebook', 'x', 'threads', 'direct', 'other')
          then source_channel
        when source_channel is null then 'direct'
        else 'other'
      end as channel,
      count(*)::bigint as views
    from public.profile_views
    where public_id = p_public_id
      and is_bot = false
    group by 1
  ),
  click_counts as (
    select
      case
        when source_channel in ('instagram', 'tiktok', 'youtube', 'facebook', 'x', 'threads', 'direct', 'other')
          then source_channel
        when source_channel is null then 'direct'
        else 'other'
      end as channel,
      count(*)::bigint as clicks
    from public.profile_clicks
    where public_id = p_public_id
      and is_bot = false
    group by 1
  )
  select
    channel_list.channel,
    coalesce(view_counts.views, 0)::bigint as views,
    coalesce(click_counts.clicks, 0)::bigint as clicks
  from channel_list
  left join view_counts using (channel)
  left join click_counts using (channel)
  order by array_position(
    array['instagram', 'tiktok', 'youtube', 'facebook', 'x', 'threads', 'direct', 'other']::text[],
    channel_list.channel
  );
$$;

revoke all on function public.get_profile_channel_analytics(text) from public, anon, authenticated;
grant execute on function public.get_profile_channel_analytics(text) to service_role;
